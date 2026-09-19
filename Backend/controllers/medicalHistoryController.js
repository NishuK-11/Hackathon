const docterModel = require("../models/docterModel");
const patientModel = require("../models/patientModel");
const prescriptionModel = require("../models/prescriptionModel");
const reportModel = require("../models/reportModel");

exports.getSharedMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.patientId;

    const doctor = await docterModel.findOne({
      userId
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const patient = await patientModel.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const reports = await reportModel
      .find({
        patient: patient._id,
        sharedWithDoctors: doctor._id
      })
      .sort({ createdAt: -1 });

    const prescriptions = await prescriptionModel
      .find({
        patientId: patient._id,
        sharedWithDoctors: doctor._id
      })
      .populate("doctorId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      patient: {
        id: patient._id,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup
      },
      reports,
      prescriptions
    });

  } catch (error) {
    console.error("Medical History Error:", error);

    return res.status(500).json({
      success: false,
      message: `Failed to fetch medical history ${error.message}`
    });
  }
};
