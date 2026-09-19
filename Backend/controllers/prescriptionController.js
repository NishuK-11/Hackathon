const appointmentModel = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");
const prescriptionModel = require("../models/prescriptionModel");
const { redisClient } = require("../config/redisClient");
const { summaryCacheKey } = require("./medicalSummaryController");
const axios = require("axios");

const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const {
      patientId,
      appointmentId,
      advice,
      followUpDate
    } = req.body;

    // Convert form-data strings into arrays/objects
    const complaints = JSON.parse(req.body.complaints || "[]");
    const diagnosis = JSON.parse(req.body.diagnosis || "[]");
    const medicines = JSON.parse(req.body.medicines || "[]");
    const tests = JSON.parse(req.body.tests || "[]");

    // Only save Cloudinary URLs
    const attachments = req.files?.map(file => file.path) || [];

    console.log("Patient ID:", patientId);
    console.log("Appointment ID:", appointmentId);
    console.log("Complaints:", complaints);
    console.log("Diagnosis:", diagnosis);
    console.log("Medicines:", medicines);
    console.log("Tests:", tests);
    console.log("Attachments:", attachments);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required"
      });
    }

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (appointment.patient.toString() !== patientId) {
      return res.status(400).json({
        success: false,
        message: "Appointment does not belong to this patient"
      });
    }

    const prescription = await prescriptionModel.create({
      patientId,
      doctorId,
      appointmentId,
      complaints,
      diagnosis,
      medicines,
      tests,
      advice,
      attachments,
      followUpDate
    });

    // A new prescription changes the record the AI summary is built from.
    await redisClient.del(summaryCacheKey(patientId));

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });

  } catch (error) {
    console.error("========== CREATE PRESCRIPTION ERROR ==========");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("===============================================");

    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message
    });
  }
};
const updatePrescription = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await docterModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }

    const prescriptionId = req.params.prescriptionId;

    const prescription = await prescriptionModel.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const {
      complaints,
      diagnosis,
      medicines,
      tests,
      advice,
      followUpDate
    } = req.body;

    const complaintsData = complaints
      ? JSON.parse(complaints)
      : prescription.complaints;

    const diagnosisData = diagnosis
      ? JSON.parse(diagnosis)
      : prescription.diagnosis;

    const medicinesData = medicines
      ? JSON.parse(medicines)
      : prescription.medicines;

    const testsData = tests
      ? JSON.parse(tests)
      : prescription.tests;

    const newAttachments =
      req.files?.map(file => file.path) || [];

    prescription.complaints = complaintsData;
    prescription.diagnosis = diagnosisData;
    prescription.medicines = medicinesData;
    prescription.tests = testsData;
    prescription.advice =
      advice !== undefined ? advice : prescription.advice;
    prescription.followUpDate =
      followUpDate !== undefined
        ? followUpDate
        : prescription.followUpDate;

    if (newAttachments.length > 0) {
      prescription.attachments.push(...newAttachments);
    }

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription
    });

  } catch (error) {
    console.error("Update Prescription Error:", error);

    return res.status(500).json({
      success: false,
      message: `Failed to update prescription ${error.message}`
    });
  }
};


const getPatientPrescriptionsForDoctor = async (req, res) => {
  try {
      const { patientId } = req.params;
     const doctor = await docterModel.findOne({
        userId: req.user.id
     })
    if(!doctor){
        return res.status(404).json({
            success: false,
            message:"Doctor not found"
        });
    }
    
    const prescriptions = await prescriptionModel.find({ patientId, 
      $or:[
        {doctorId:doctor._id},
        {sharedWithDoctor:doctor._id}
      ]
     })
    .populate("appointmentId")  
    .populate({
      path:"doctorId",
      populate:{path:"userId", select:"name"}
    })
  .sort({ createdAt: -1 });

    res.json({
      success: true,
      prescriptions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch prescriptions ${error}`
    });
  }
};



const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Patient param:", patientId);

    const prescription = await prescriptionModel.findById(id)
      .populate("doctorId , id, name")
      .populate("patientId");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    res.json({
      success: true,
      prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prescription"
    });
  }
};


//appointment se linked prescription dhoondne k liye--
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await prescriptionModel
      .findOne({ appointmentId })
      .populate("doctorId")
      .populate("patientId");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "No prescription for this appointment"
      });
    }

    res.json({
      success: true,
      prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prescription"
    });
  }
};


const ocrPrescription = async (req, res) => {
  try {

    const { appointmentId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription image is required",
      });
    }
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    const appointment = await appointmentModel.findById(
      appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const patientId = appointment.patient;
    const doctorId = appointment.doctor;

    console.log("Appointment:", appointment._id);
    console.log("Patient:", patientId);
    console.log("Doctor:", doctorId);

    const imageUrl = req.file.path;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL not found",
      });
    }

    console.log("Cloudinary URL:", imageUrl);

    console.log("Downloading image from Cloudinary...");

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
    });

    console.log("Image downloaded successfully");
    console.log(
      "Image size:",
      imageResponse.data.length
    );

    const formData = new FormData();

    // Convert image bytes to Blob
    const imageBlob = new Blob(
      [imageResponse.data],
      {
        type: req.file.mimetype,
      }
    );

    formData.append(
      "file",
      imageBlob,
      req.file.originalname
    );

    formData.append(
      "appointmentId",
      appointmentId.toString()
    );

    formData.append(
      "doctorId",
      doctorId.toString()
    );

    formData.append(
      "patientId",
      patientId.toString()
    );

    console.log("Sending image to AI OCR service...");

    const aiResponse = await axios.post(
      "https://prescription-ai-service.onrender.com/api/prescription/ocr",
      formData,
      {
        timeout: 120000,

        maxContentLength: Infinity,

        maxBodyLength: Infinity,
      }
    );

    console.log(
      "AI RESPONSE:",
      aiResponse.data
    );
    const extractedData = aiResponse.data;

    const prescription =
      await prescriptionModel.create({
        patientId,
        doctorId,
        appointmentId,

        complaints:
          extractedData.complaints || [],

        diagnosis:
          extractedData.diagnosis || [],

        medicines:
          extractedData.medicines || [],

        tests:
          extractedData.tests || [],

        advice:
          extractedData.advice || "",

        attachments:
          extractedData.attachments || [],

        followUpDate:
          extractedData.followUpDate || null,
      });

    console.log(
      "Prescription created:",
      prescription._id
    );

    return res.status(201).json({
      success: true,

      message:
        "Prescription extracted and created successfully",

      prescription,
    });

  } catch (error) {
    console.error(
      "PRESCRIPTION OCR ERROR:",
      error
    );

    console.error(
      "AI ERROR RESPONSE:",
      error.response?.data
    );

    return res.status(500).json({
      success: false,

      message:
        error.response?.data?.message ||
        "Failed to process prescription",

      error: error.message,
    });
  }
};

const PrescriptionDescriptionParse = async (req, res) => {
  try {
    console.log("========== PRESCRIPTION DESCRIPTION PARSE ==========");

    console.log("REQ.BODY:", req.body);

    const {
      appointmentId,
      prescriptionText
    } = req.body;

    // ---------------------------------------
    // 1. Validate input
    // ---------------------------------------

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    if (!prescriptionText || !prescriptionText.trim()) {
      return res.status(400).json({
        success: false,
        message: "prescriptionText is required",
      });
    }

    // ---------------------------------------
    // 2. Find appointment
    // ---------------------------------------

    const appointment =
      await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // ---------------------------------------
    // 3. Get patient and doctor
    // ---------------------------------------

    const patientId = appointment.patient;
    const doctorId = appointment.doctor;

    console.log("Appointment:", appointmentId);
    console.log("Patient:", patientId);
    console.log("Doctor:", doctorId);

    // ---------------------------------------
    // 4. Send description to AI service
    // ---------------------------------------

    console.log("Sending prescription text to AI service...");

    const aiResponse = await axios.post(
      "https://prescription-ai-service.onrender.com/api/prescription/parse",
      {
        appointmentId: appointmentId.toString(),

        prescriptionText: prescriptionText.trim(),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },

        timeout: 120000,
      }
    );

    console.log(
      "AI PARSE RESPONSE:",
      aiResponse.data
    );

    // ---------------------------------------
    // 5. Extract AI response
    // ---------------------------------------

    const extracted =
      aiResponse.data?.data ||
      aiResponse.data?.result ||
      aiResponse.data;

    // ---------------------------------------
    // 6. Return extracted prescription
    // ---------------------------------------

    return res.status(200).json({
      success: true,

      message: "Prescription description parsed successfully",

      patientId,
      doctorId,
      appointmentId,

      complaints:
        extracted.complaints || [],

      diagnosis:
        extracted.diagnosis || [],

      medicines:
        extracted.medicines || [],

      tests:
        extracted.tests || [],

      advice:
        extracted.advice || "",

      attachments:
        extracted.attachments || [],

      followUpDate:
        extracted.followUpDate || null,
    });

  } catch (error) {
    console.error(
      "PRESCRIPTION DESCRIPTION ERROR:",
      error
    );

    console.error(
      "AI ERROR RESPONSE:",
      error.response?.data
    );

    return res.status(500).json({
      success: false,

      message:
        error.response?.data?.message ||
        "Failed to parse prescription description",

      error: error.message,
    });
  }
};

module.exports={ocrPrescription,PrescriptionDescriptionParse,createPrescription,updatePrescription,getPrescriptionById,getPatientPrescriptionsForDoctor,getPrescriptionByAppointment};