const hospitalModel = require("../models/HospitalModel");
const patientModel = require("../models/patientModel");
const referralModel = require("../models/referralModel");

const createReferral = async (req, res) => {
  try {
    const {
      patientId,
      referredToHospital,
      reason,
      clinicalNotes,
      urgency,
    } = req.body;

    // 1. Validate required fields
    if (!patientId || !referredToHospital || !reason) {
      return res.status(400).json({
        success: false,
        message: "Patient, referred hospital and reason are required",
      });
    }

    // 2. Get logged-in user
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 3. Get source hospital from logged-in admin
    const referredByHospital = req.user.hospitalId;

    if (!referredByHospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital information not found for this user",
      });
    }

    // 4. Check patient exists
    const patient = await patientModel.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // 5. Check destination hospital exists
    const destinationHospital = await hospitalModel.findById(
      referredToHospital
    );

    if (!destinationHospital) {
      return res.status(404).json({
        success: false,
        message: "Referred hospital not found",
      });
    }

    // 6. Prevent referring to same hospital
    if (
      referredByHospital.toString() ===
      referredToHospital.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Patient cannot be referred to the same hospital",
      });
    }

      // 7. Check if patient already has an active referral
  const existingReferral = await referralModel.findOne({
    patient: patientId,
    referredToHospital: referredToHospital,
    status: "PENDING",
  });
  console.log("=================================");
  console.log("PATIENT ID:", patientId);
  console.log("DESTINATION HOSPITAL:", referredToHospital);
  console.log("EXISTING PENDING REFERRAL:", existingReferral);
  console.log("=================================");

  if (existingReferral) {
    return res.status(409).json({
      success: false,
      message: "Patient already has a pending referral",
      referral: existingReferral,
    });
  }

    // 8. Create referral
    const referral = await referralModel.create({
      patient: patientId,
      referredByHospital,
      referredToHospital,
      referredBy: userId,
      reason,
      clinicalNotes,
      urgency: urgency || "NORMAL",
      status: "PENDING",
    });

    // 9. Populate response
    const populatedReferral = await referralModel.findById(referral._id)
      .populate("patient", "name email phone")
      .populate("referredByHospital", "name")
      .populate("referredToHospital", "name")
      .populate("referredBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Patient referred successfully",
      referral: populatedReferral,
    });
  } catch (error) {
    console.error("Create Referral Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create referral",
      error: error.message,
    });
  }
};

module.exports = {
  createReferral,
};
