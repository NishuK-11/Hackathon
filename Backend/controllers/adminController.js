
const dotenv = require('dotenv');
const userModel = require('../models/userModel');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const { ROLE } = require('../config/role');
const nodemailer = require("nodemailer");
const sendEmail = require('../utils/sendEmail');
const docterModel = require('../models/docterModel');
const reportModel = require('../models/reportModel');
const patientModel = require('../models/patientModel');
dotenv.config();

const addDoctor = async (req, res) => {
  try {
        const { name, email, phone_number } = req.body;

        // 1️⃣ Check email duplicate
        const existingDoctor = await userModel.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ success: false, msg: "Doctor email already exists" });
        }
        const randomPassword = crypto.randomBytes(4).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword,10);
         // 3️⃣ Create doctor
        const doctor = await userModel.create({
        name,
        email,
        phone_number,
        password: hashedPassword,
        role: ROLE.doctor,
        hospitalId: req.user.hospitalId
        });

        // await docterModel.create({
        //     userId: doctor._id,
        //     hospital: req.user.hospitalId,
        //     profileCompleted: false,
        //     isActive: true
        // });


        // 4️⃣ Send email with credentials (optional)
        await sendEmail({
            to: email,
            subject: "Welcome to MediReach - Doctor Account",
            text: `Hello ${name}, your account is created.\nEmail: ${email}\nPassword: ${randomPassword}\nLogin here: <frontend-login-url>`
            });
            res.status(201).json({
            success: true,
            msg: "Doctor added successfully",
            data: { id: doctor._id, name: doctor.name, email: doctor.email }
        });
    }catch(error){
        res.status(500).json({ success: false, msg: error.message });
    }
}


const updateDoctorOpdSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { opdSchedule } = req.body;

    const doctor = await docterModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.opdSchedule = opdSchedule;
    await doctor.save();

    res.json({
      success: true,
      message: "OPD schedule updated successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const uploadReportForPatient = async(req,res)=>{
  try{
    const {patientId, title, type} = req.body;
    if (!patientId) { return res.status(400).json({ success: false, message: "Patient ID required" }); }
    if (!req.file) { return res.status(400).json({ success: false, message: "Report file required" }); }
    const patient = await patientModel.findById(patientId);
    if (!patient) { return res.status(404).json({ success: false, message: "Patient not found" }); }

    const mime = req.file.mimetype;
    const fileType = mime.includes("pdf")?"pdf":"image";
    const report = await reportModel.create({
      patient:patient._id,
      title, 
      type,
      fileUrl:req.file.path,
      filePublicId:req.file.filename,
      fileType,
      uploadedBy:ROLE.admin
    })
    return res.status(201).json({ success: true, message: "Report uploaded successfully for patient", report });
  }catch (error) { console.error("ADMIN REPORT UPLOAD ERROR:", error); return res.status(500).json({ success: false, message: `Report upload failed ${error.message}` }); }
}

//done
module.exports = {
    addDoctor,
    updateDoctorOpdSchedule,
    uploadReportForPatient
}