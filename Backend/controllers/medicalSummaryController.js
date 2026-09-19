const docterModel = require("../models/docterModel");
const patientModel = require("../models/patientModel");
const prescriptionModel = require("../models/prescriptionModel");
const reportModel = require("../models/reportModel");
const appointmentModel = require("../models/appointmentModel");
const emergencyModel = require("../models/EmergencyModel");
const patientHospitalModel = require("../models/PatientHospitalSchema");
const { redisClient } = require("../config/redisClient");
const {
  generateMedicalSummary,
  MedicalSummaryError,
} = require("../services/medicalSummaryService");

const SUMMARY_TTL_SECONDS = 900; // 15 min; records only change on a new prescription/report
const MAX_PRESCRIPTIONS = 15;
const MAX_APPOINTMENTS = 20;

const summaryCacheKey = (patientId) => `patient:medicalSummary:${patientId}`;

const toIsoDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : null;

/*
 * Condenses the raw documents into the payload the model sees.
 *
 * Deliberately de-identified: name, email, phone, address and profile image
 * never leave the server. The model does not need an identity to summarise a
 * record, and this keeps patient PII out of a third-party API.
 *
 * Exported so it can be inspected or tested without spending an API call.
 */
const buildSummaryInput = ({
  patient,
  prescriptions,
  appointments,
  reports,
  emergencies,
  visits,
}) => ({
  patient: {
    age: patient.age ?? null,
    gender: patient.gender ?? null,
    bloodGroup: patient.bloodGroup ?? null,
  },

  // The richest clinical source in the schema.
  prescriptions: prescriptions.slice(0, MAX_PRESCRIPTIONS).map((p) => ({
    date: toIsoDate(p.createdAt),
    complaints: p.complaints || [],
    diagnosis: p.diagnosis || [],
    medicines: (p.medicines || []).map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions || null,
    })),
    tests: p.tests || [],
    advice: p.advice || null,
    followUpDate: toIsoDate(p.followUpDate),
  })),

  appointments: appointments.slice(0, MAX_APPOINTMENTS).map((a) => ({
    date: toIsoDate(a.date),
    status: a.status,
    type: a.appointmentType,
    reason: a.reason || null,
    patientDescription: a.description || null,
    department: a.department?.name || null,
  })),

  // Titles and types only - nothing inside these files has been read.
  reports: reports.map((r) => ({
    title: r.title,
    type: r.type,
    date: toIsoDate(r.createdAt),
  })),

  emergencies: emergencies.map((e) => ({
    date: toIsoDate(e.createdAt),
    reason: e.reason,
    message: e.message || null,
    status: e.status,
  })),

  visitSpans: visits.map((v) => ({
    firstVisit: toIsoDate(v.firstVisit),
    lastVisit: toIsoDate(v.lastVisit),
    status: v.status,
  })),

  totals: {
    prescriptions: prescriptions.length,
    appointments: appointments.length,
    reports: reports.length,
    emergencies: emergencies.length,
  },

  // Stated explicitly so the model reports gaps instead of inventing content.
  unavailableInThisSystem: [
    "allergies",
    "chronic conditions and past medical history",
    "vitals (BP, pulse, temperature, SpO2, height, weight)",
    "free-text doctor notes",
    "contents of lab reports (files are stored but not analysed)",
    "medication adherence or dispensing records",
  ],
});

const getPatientMedicalSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Keyed off Patient directly so walk-in patients (userId null) still work.
    const patient = await patientModel.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const cacheKey = summaryCacheKey(patientId);
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("✅ Redis HIT - medical summary");
      return res.status(200).json({
        ...JSON.parse(cached),
        source: "redis",
      });
    }

    const [prescriptions, appointments, reports, emergencies, visits] =
      await Promise.all([
        prescriptionModel
          .find({ patientId: patient._id })
          .sort({ createdAt: -1 }),

        appointmentModel
          .find({ patient: patient._id })
          .populate("department", "name")
          .sort({ date: -1 }),

        reportModel
          .find({ patient: patient._id })
          .select("title type createdAt")
          .sort({ createdAt: -1 }),

        // Emergency.patient refs User, not Patient.
        patient.userId
          ? emergencyModel
              .find({ patient: patient.userId })
              .select("reason message status createdAt")
              .sort({ createdAt: -1 })
          : [],

        patientHospitalModel.find({ patientId: patient._id }),
      ]);

    const summaryInput = buildSummaryInput({
      patient,
      prescriptions,
      appointments,
      reports,
      emergencies,
      visits,
    });

    const summary = await generateMedicalSummary(summaryInput);

    const payload = {
      success: true,
      summary,
      generatedAt: new Date().toISOString(),
      recordCounts: summaryInput.totals,
    };

    await redisClient.set(
      cacheKey,
      JSON.stringify(payload),
      "EX",
      SUMMARY_TTL_SECONDS
    );

    return res.status(200).json({
      ...payload,
      source: "mongodb",
    });
  } catch (error) {
    if (error instanceof MedicalSummaryError) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Medical Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: `Failed to generate medical summary: ${error.message}`,
    });
  }
};

module.exports = { getPatientMedicalSummary, buildSummaryInput, summaryCacheKey };
