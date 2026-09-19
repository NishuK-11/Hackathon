const { ROLE } = require("../config/role");
const appointmentModel = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");
const patientModel = require("../models/patientModel");
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getSignedUrl = require("../utils/getSignedUrl");
const reportModel = require("../models/reportModel");
const cloudinary  = require("../config/cloudinary");
const HospitalModel = require("../models/HospitalModel");
const EmergencyModel = require("../models/EmergencyModel");

// Lifecycle rules (which statuses are ongoing, how far the patient may cancel)
// live in config/emergencyStatus.js so this controller and the hospital-side
// status endpoint cannot drift apart.
const {
  ACTIVE_EMERGENCY_STATUSES,
  CANCELLABLE_EMERGENCY_STATUSES,
} = require("../config/emergencyStatus");

const registerPatient = async (req, res) => {
  try {
    const { name, email, password, bloodGroup,dob, gender } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Name, email and password are required"
      })
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        msg: "User already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create patient 
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: ROLE.patient,
      isActive: true
    });

    const patient = await patientModel.create({
      userId: user._id,
      bloodGroup:bloodGroup,
      dob:dob,
      gender:gender
    });

    //token generate--
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d" 
      }
    );


    // Response
    return res.status(201).json({
      success: true,
      msg: "Patient registered successfully",
      role:user.role,
      token,
      user: {
        bloodGroup:patient.bloodGroup,
        gender:patient.gender,
        dob:patient.dob,
        id: user._id,
        patientId:patient._id,
        name: user.name,
        email: user.email,
        //role: user.role
      }
    });

  } catch (error) {
    console.error("Register Patient Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};
// Reception creates walk-in patient
const createWalkInPatient = async (req, res) => {
  try {
    const { age, gender, bloodGroup } = req.body;

    const patient = await patientModel.create({
      userId: null,   // 👈 very important
      age,
      gender,
      bloodGroup
    });

    res.status(201).json({
      message: "Walk-in patient created",
      patient
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//GET DAILY PATIENTS=============================================
const getDailyPatientsWithDetails = async (req, res) => {
  try {
    const { hospitalId, date } = req.query;

    if (!hospitalId || !date) {
      return res.status(400).json({
        success: false,
        message: "hospitalId and date are required"
      });
    }

    // Day range
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Fetch appointments with patient populated
    const appointments = await appointmentModel.find({
      hospital: hospitalId,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: "CANCELLED" }
    })
      .populate({
        path: "patient",
        populate: {
          path: "userId",
          select: "name email phone_number"
        }
      });

    // Unique patients (avoid duplicates)
    const uniqueMap = new Map();

    appointments.forEach(app => {
      if (app.patient && app.patient._id) {
        uniqueMap.set(app.patient._id.toString(), app.patient);
      }
    });

    const uniquePatients = Array.from(uniqueMap.values());

    res.status(200).json({
      success: true,
      date,
      totalPatients: uniquePatients.length,
      patients: uniquePatients
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily patients",
      error: error.message
    });
  }
};


//patient ko apna reports milega----
const getMyReports = async (req, res) => {
  try {
    const patient = await patientModel.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    const reports = await reportModel.find({
      patient: patient._id
    }).sort({ createdAt: -1 });

    const formatted = reports.map(r => ({
      id: r._id,
      title: r.title,
      type:r.type,
      uploadedAt: r.createdAt,
      filePublicId: getSignedUrl(r.filePublicId),
      fileType: r.fileType
    }));

    res.json({ reports: formatted });
  } catch (e) {
    res.status(500).json({ message: `Failed to fetch reports ${e.message}`});
  }
};


const getPatientAppointments = async(req,res)=>{
  try{
    const doctor =await docterModel.findOne({userId: req.user.id});
    if(!doctor){
      return res.status(400).json({message:"Doctor not found"});
    }
    const appointments = await appointmentModel.find({
      patient:req.params.patientId,
      doctor:doctor._id
    }).sort({date:-1})
    .select("date status token createdAt");

    res.status(200).json({
      appointments
    })

  }catch(error){
    res.status(500).json({message:`Failed to fetch appointments ${error.message}`});
  }
}


//============== UPDATE PATIENT PROFILE====================
const updatePatientProfile = async (req, res) => {
  try {
    const { dob, gender, bloodGroup,phone_number,address } = req.body;

    // logged-in user se patient nikalo
    const patient = await patientModel.findOne({ userId: req.user.id }).populate("userId");;

    if (!patient) {
      return res.status(404).json({
        success: false,
        msg: "Patient profile not found"
      });
    }
    
    if (req.file && req.file.path) {
      patient.profileImage = req.file.path; // direct Cloudinary URL
    }

    // update only provided fields
    if (dob) patient.dob = dob;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if(phone_number) patient.phone_number = phone_number;
    if (address) {
    const parsedAddress =
      typeof address === "string"
        ? JSON.parse(address)
        : address;

        patient.address = {
            ...patient.address?.toObject?.(),
            ...parsedAddress
        };
    }

    await patient.save();

    return res.status(200).json({
    success: true,
    msg: "Patient profile updated successfully",
    patient: {
      _id: patient._id,
      dob: patient.dob,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      phone_number: patient.phone_number,
      profileImage: patient.profileImage,
      userId: {
        _id: patient.userId._id,
        name: patient.userId.name,
        email: patient.userId.email
      }
    }
  });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error updating patient profile ${err.message}`
    });
  }
};


const getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await patientModel
      .findById(patientId)
      .populate("userId", "name email");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Agar patient ka User account nahi mila
    if (!patient.userId) {
      return res.status(404).json({
        success: false,
        message: "Patient user information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile fetched successfully",

      patient: {
        _id: patient._id,

        // User details
        userId: patient.userId._id,
        name: patient.userId.name,
        email: patient.userId.email,

        // Patient details
        age: patient.age,
        dob: patient.dob,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        phone_number: patient.phone_number,
        profileImage: patient.profileImage,

        // Address
        address: {
          line: patient.address?.line || "",
          city: patient.address?.city || "",
          state: patient.address?.state || "",
          pincode: patient.address?.pincode || "",

          location: patient.address?.location
            ? {
                type: patient.address.location.type,
                coordinates: patient.address.location.coordinates,
              }
            : null,
        },

        // Timestamps
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });

  } catch (error) {
    console.error("Get patient profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient profile",
      error: error.message,
    });
  }
};

//FOR PATIENTS__
const getMyProfile = async (req, res) => {
  try {
    const patient = await patientModel
      .findOne({ userId: req.user.id })
      .populate("userId", "name email");

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.json({ patient });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

//doctor sirf whi reports dekhega jo patient ne share ki h
 const getPatientReportForDoctor = async(req,res)=>{
  try{
    const doctor = await docterModel.findOne({userId:req.user.id});
    if(!doctor){
      return res.status(400).json({messgae:"Doctor not found"});

    }
    const reports = await reportModel.find({
      patient:req.params.patientId,
      $or:[
        {doctorId:doctor._id},
        {sharedWithDoctors:doctor._id}
      ]
    }).sort({createdAt:-1});

    const formatted = reports.map(r=>({
      id:r._id,
      title:r.title,
      uploadedAt:r.createdAt,
      file : getSignedUrl(r.filePublicId)
    }))
    res.json({reports:formatted})
  }catch(e){
    res.status(500).json({message:`Failed to fetch patient ${e.message}`});
  }
}

const getActiveQueueStatus = async (req, res) => {
  try {

    const patient = await patientModel.findOne({
      userId: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Patient ka aaj ka active appointment
    const appointment = await appointmentModel.findOne({
      patient: patient._id,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: {
        $in: ["CONFIRMED", "CURRENT"] 
      }
    })
      .populate({
        path: "doctor",
        populate: {
          path: "userId",
          select: "name"
        }
      })
      .populate("department", "name");

    if (!appointment) {
      return res.status(200).json({
        success: true,
        hasActiveQueue: false
      });
    }

    const doctor = appointment.doctor;

    const currentAppointment =
      await appointmentModel.findOne({
        doctor: doctor._id,
        status: "CURRENT",
        date: {
          $gte: today,
          $lt: tomorrow
        }
      });

    const currentToken =
      currentAppointment?.token ?? 0;

    const yourToken =
      appointment.token ?? 0;

    const patientsAhead =
      currentToken >= yourToken
        ? 0
        : yourToken - currentToken;

    return res.status(200).json({
      success: true,
      hasActiveQueue: true,
      appointmentId: appointment._id,
      doctorId: doctor._id,
      doctorName:doctor.userId?.name ?? "Doctor",
      department:appointment.department?.name ?? "Department",
      currentToken,
      yourToken,
      patientsAhead,
      isPaused: doctor.opdPaused,
      isOpdClosed: !doctor.opdStarted,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =====================================================
// CREATE EMERGENCY REQUEST - PATIENT
// =====================================================

const createEmergency = async (req, res) => {
  try {
    const io = req.app.get("io");

    // -----------------------------------------
    // 1. CHECK AUTHENTICATED USER
    // -----------------------------------------

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const patientId = req.user._id;


    // -----------------------------------------
    // 2. GET DATA FROM REQUEST
    // -----------------------------------------

    const {
      hospitalId,
      latitude,
      longitude,
      reason,
      message,
    } = req.body;


    // -----------------------------------------
    // 3. VALIDATE HOSPITAL ID
    // -----------------------------------------

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }


    // -----------------------------------------
    // 4. VALIDATE LOCATION
    // -----------------------------------------

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Patient location is required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }


    // Latitude range
    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });
    }


    // Longitude range
    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });
    }


    // -----------------------------------------
    // 5. CHECK HOSPITAL
    // -----------------------------------------

    const hospital = await HospitalModel.findOne({
      _id: hospitalId,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not available",
      });
    }


    // -----------------------------------------
    // 6. CHECK EXISTING ACTIVE EMERGENCY
    // -----------------------------------------

    const activeEmergency = await EmergencyModel.findOne({
      patient: patientId,

      status: {
        $in: ACTIVE_EMERGENCY_STATUSES,
      },
    });

    if (activeEmergency) {
      return res.status(409).json({
        success: false,
        message: "You already have an active emergency request",
        emergency: activeEmergency,
      });
    }


    // -----------------------------------------
    // 7. CREATE EMERGENCY
    // -----------------------------------------

    const emergency = await EmergencyModel.create({
      patient: patientId,

      hospital: hospital._id,

      location: {
        type: "Point",

        // IMPORTANT:
        // MongoDB GeoJSON = [longitude, latitude]

        coordinates: [lng, lat],
      },

      reason: reason || "OTHER",

      message: message || "",

      status: "REQUESTED",
    });


    // -----------------------------------------
    // 8. POPULATE DATA
    // -----------------------------------------

    const populatedEmergency =
      await EmergencyModel.findById(emergency._id)
        .populate(
          "patient",
          "name email phone_number"
        )
        .populate(
          "hospital",
          "name phone_number city state location"
        );


    // -----------------------------------------
    // 9. SEND REAL-TIME ALERT TO HOSPITAL
    // -----------------------------------------

    if (io) {
      io.to(`hospital:${hospital._id}`).emit(
        "emergency-created",
        populatedEmergency
      );
    }


    // -----------------------------------------
    // 10. RESPONSE
    // -----------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Emergency request sent successfully",

      emergency: populatedEmergency,
    });

  } catch (error) {

    console.error(
      "CREATE EMERGENCY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create emergency request",
      error: error.message,
    });
  }
};


const getMyActiveEmergency = async (req, res) => {
  try {

    // -----------------------------------------
    // 1. CHECK AUTHENTICATED USER
    // -----------------------------------------

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // -----------------------------------------
    // 2. FIND THE ONGOING EMERGENCY
    // -----------------------------------------

    // NOTE: Emergency.patient refs User, not Patient.
    const emergency = await EmergencyModel.findOne({
      patient: req.user._id,

      status: {
        $in: ACTIVE_EMERGENCY_STATUSES,
      },
    })
      .sort({ createdAt: -1 })

      .populate(
        "patient",
        "name email phone_number"
      )

      .populate(
        "hospital",
        "name phone_number city state location"
      )

      .populate(
        "assignedBy",
        "name email phone_number role"
      )

      .populate(
        "acknowledgedBy",
        "name email phone_number role"
      );


    // -----------------------------------------
    // 3. RESPONSE
    // -----------------------------------------

    // Having no active emergency is the normal case, not an error.
    return res.status(200).json({
      success: true,
      emergency: emergency || null,
    });

  } catch (error) {

    console.error(
      "GET ACTIVE EMERGENCY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch emergency status",
      error: error.message,
    });
  }
};


const cancelEmergency = async (req, res) => {
  try {
    const io = req.app.get("io");

    // -----------------------------------------
    // 1. CHECK AUTHENTICATED USER
    // -----------------------------------------

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const patientId = req.user._id;

    const { emergencyId } = req.params;


    // -----------------------------------------
    // 2. CLAIM THE CANCELLATION
    // -----------------------------------------

    // Done as one conditional update rather than read-then-write: a hospital
    // admin can be advancing the same document through updateEmergencyStatus
    // at the same moment, and only one of the two may win.
    const cancelled = await EmergencyModel.findOneAndUpdate(
      {
        _id: emergencyId,

        // Ownership is part of the query, so another patient's id can never
        // match. Emergency.patient refs User, not Patient.
        patient: patientId,

        status: {
          $in: CANCELLABLE_EMERGENCY_STATUSES,
        },
      },

      {
        $set: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      },

      { new: true }
    )
      .populate(
        "patient",
        "name email phone_number"
      )

      .populate(
        "hospital",
        "name phone_number city state location"
      )

      .populate(
        "assignedBy",
        "name email phone_number role"
      )

      .populate(
        "acknowledgedBy",
        "name email phone_number role"
      );


    // -----------------------------------------
    // 3. NOTHING CLAIMED - WORK OUT WHY
    // -----------------------------------------

    if (!cancelled) {

      const existing = await EmergencyModel.findById(emergencyId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Emergency not found",
        });
      }

      if (
        existing.patient.toString() !==
        patientId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this emergency",
        });
      }

      // It exists and is theirs, so it has moved past the point of no return.
      return res.status(409).json({
        success: false,

        message:
          `This request can no longer be cancelled (${existing.status}). Please contact the hospital.`,

        emergency: existing,
      });
    }


    // -----------------------------------------
    // 4. TELL THE HOSPITAL
    // -----------------------------------------

    if (io) {
      io.to(`hospital:${cancelled.hospital._id}`).emit(
        "emergency-cancelled",
        cancelled
      );
    }


    // -----------------------------------------
    // 5. RESPONSE
    // -----------------------------------------

    return res.status(200).json({
      success: true,
      message: "Emergency request cancelled",
      emergency: cancelled,
    });

  } catch (error) {

    console.error(
      "CANCEL EMERGENCY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel emergency request",
      error: error.message,
    });
  }
};


module.exports = {registerPatient,getActiveQueueStatus,getMyProfile,createWalkInPatient,getPatientAppointments,getPatientProfile ,getPatientReportForDoctor, updatePatientProfile,getMyReports,createEmergency,getMyActiveEmergency,cancelEmergency};
