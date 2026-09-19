const docterModel = require("../models/docterModel");
const HospitalModel = require("../models/HospitalModel");
const Appointment = require("../models/appointmentModel");
const patientModel = require("../models/patientModel");
const { redisClient } = require("../config/redisClient");
const { summaryCacheKey } = require("./medicalSummaryController");
const departmentModel = require("../models/departmentModel");
/* ================= GET DOCTORS ================= */

const getDoctorsByDepartment = async (req, res) => {
  try {
    const { hospitalId, departmentId } = req.params;
    const doctors = await docterModel.find({
      hospital: hospitalId,
      department: departmentId,
      isActive: true,
      profileCompleted: true,
    })
      .populate("userId", "name email phone_number")
      .populate("hospital", "name")
      .sort({ experience: -1 });

    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDoctorByHospital = async(req,res)=>{
  try{
    const hospitalId = req.user.hospitalId;
    if(!hospitalId){
      return res.status(400).json({
        success: false,
        message: "Hospital ID not found in token",
      });
    }
    const hospital = await HospitalModel.findById(hospitalId).select("name");
    if(!hospital){
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const doctors = await docterModel.find({
      hospital:hospitalId,
    }).populate("userId","name email phone_number")
    .populate("department", "_id name")
    .select("phone_number isActive createdAt opd_timing experience registrationNumber  availableDays consultationFee specialisation")
    .sort({createdAt:-1});
    res.status(200).json({
      success:true,
      hospital,
      total:doctors.length,
      doctors
    })

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


const getDoctorById = async(req,res)=>{
  try{
    const {id} = req.params;
    const doctor = await doctorModel.findById(id)
    .populate("userId","name email phone_number")
    .populate("hospital","name")
    .populate("department","name");

    if(!doctor){
      return res.status(404).json({
        success:false,
        message:"Doctor not found"
      })
    }
    res.json({
      success:true,
      doctor
    })
  }catch(error){
    res.status(500).json({
      success:false,
      message:"Failed to fetch doctor profile",
      error:error.message
    })
  }
}


const searchPatient = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await userModel
    .find(keyword)
    .find({ _id: { $ne: req.user._id } });
// const users = await userModel.find({
//   ...keyword,
//   _id: { $ne: req.user._id },
// });
  res.send(users);
};


const getProfileStatus = async (req, res) => {
  const doctor = await docterModel
    .findOne({ userId: req.user.id })

  if (!doctor) {
    return res.json({ exists: false, profileCompleted: false });
  }

  res.json({
    exists: true,
    profileCompleted: doctor.profileCompleted,
    data: doctor,
  });
};

const submitProfile = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const userId = req.user.id;

    // =========================
    // Hospital ID validation
    // =========================
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID missing in token"
      });
    }

    const {
      position,
      profile_photo,
      department,
      experience,
      specialisations,
      onlineAvailability,
      registrationNumber,
      consultationFee,
      languages
    } = req.body;
    if (!position || !department) {
      return res.status(400).json({
        success: false,
        message: "Position and Department are required"
      });
    }
    const existingDoctor = await docterModel.findOne({
      userId
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists",
        existingDoctor
      });
    }

    const departmentExists = await departmentModel.findOne({
      _id: department,
      hospital: hospitalId
    });

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found in this hospital"
      });
    }
    if (registrationNumber) {
      const existingRegistration = await docterModel.findOne({
        registrationNumber
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: "Registration number already exists"
        });
      }
    }

    let finalOnlineAvailability = {};

    if (onlineAvailability) {

      if (
        typeof onlineAvailability !== "object" ||
        onlineAvailability === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid online availability format"
        });
      }

      const { from, to } = onlineAvailability;
      if ((from && !to) || (!from && to)) {
        return res.status(400).json({
          success: false,
          message: "Both online availability from and to times are required"
        });
      }

      if (from && to) {
        finalOnlineAvailability = {
          from,
          to
        };
      }
    }

    const doctor = new docterModel({
      userId,
      hospital: hospitalId,

      position,

      profile_photo: profile_photo || "",

      department,

      experience: experience || 0,

      specialisations: specialisations || [],

      onlineAvailability: finalOnlineAvailability,

      registrationNumber,

      consultationFee: consultationFee || 0,

      languages: languages || [],

      profileCompleted: true
    });

    await doctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor
    });

  } catch (error) {

    console.error("SUBMIT DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Profile submit failed",
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const hospitalId = req.user.hospitalId;

    const doctor = await docterModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }

    const {
      position,
      profile_photo,
      department,
      opd_timing,
      experience,
      specialisations,
      availableDays,
      onlineAvailability,
      registrationNumber,
      consultationFee
    } = req.body;

    // =========================
    // Professional profile update
    // =========================

    if (position !== undefined)
      doctor.position = position;

    if (profile_photo !== undefined)
      doctor.profile_photo = profile_photo;

    if (department !== undefined)
      doctor.department = department;

    if (opd_timing !== undefined)
      doctor.opd_timing = opd_timing;

    if (experience !== undefined)
      doctor.experience = experience;

    if (specialisations !== undefined)
      doctor.specialisations = specialisations;

    if (availableDays !== undefined)
      doctor.availableDays = availableDays;

    if (consultationFee !== undefined)
      doctor.consultationFee = consultationFee;

    // =========================
    // Online consultation timing
    // =========================

    if (onlineAvailability !== undefined) {

      if (
        typeof onlineAvailability !== "object" ||
        onlineAvailability === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid online availability format"
        });
      }

      const { from, to } = onlineAvailability;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: "Online availability must contain from and to time"
        });
      }

      doctor.onlineAvailability = {
        from,
        to
      };
    }

    // =========================
    // Registration number
    // =========================

    if (registrationNumber !== undefined)
      doctor.registrationNumber = registrationNumber;

    // Always sync hospital from logged-in user
    doctor.hospital = hospitalId;

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor
    });

  } catch (error) {

    console.error("UPDATE DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message
    });
  }
};

const getMyProfile = async (req, res) => {
  try {

    const doctor = await docterModel
      .findOne({ userId: req.user.id })
      .populate("userId","name email")
      .populate("hospital","name")
      .populate("department","name")

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json({
      success: true,
      doctor
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor profile",
      error: error.message
    });
  }
};

const getCompletedAppointments = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({
      userId: req.user.id
    });
    const appointments = await Appointment.find({
      doctor: doctor._id,
      status: "COMPLETED"
    })
      .populate({
        path: "patient",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .select("patient token date status")
      .sort({ date: -1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch completed appointments"
    });
  }
};

const getUniquePatients = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Unique patient IDs
    const patientIds = await Appointment.distinct("patient", {
      doctor: doctor._id,
      status: "COMPLETED",
    });

    // Patient details
    const patients = await patientModel.find({
      _id: { $in: patientIds },
    }).populate({
      path: "userId",
      select: "name email gender phone",
    });

    return res.status(200).json({
      success: true,
      total: patients.length,
      patients,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getDoctorDashboard = async (req, res) => {
  try {
    // Find logged-in doctor
    const doctor = await docterModel.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Redis cache key
    const cacheKey = `doctor:dashboard:${doctor._id}`;

    // 1. Check Redis first
    const cachedDashboard = await redisClient.get(cacheKey);

    if (cachedDashboard) {
      return res.status(200).json({
        success: true,
        dashboard: JSON.parse(cachedDashboard),
        source: "redis",
      });
    }

    // Today's date range
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // 2. Run all queries in parallel
    const [
      totalAppointments,
      completedAppointments,
      confirmedAppointments,
      pendingAppointments,
      uniquePatients,
      todayCompletedAppointments,
      todayNewPatients,
    ] = await Promise.all([
      // Total appointments
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: start,
          $lte: end,
        },
      }),

      // Completed
      Appointment.countDocuments({
        doctor: doctor._id,
        status: "COMPLETED",
      }),

      // Confirmed
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: start,
          $lte: end,
        },
        status: "CONFIRMED",
      }),

      // Pending
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: start,
          $lte: end,
        },
        status: "PENDING",
      }),

      // Unique completed patients
      Appointment.distinct("patient", {
        doctor: doctor._id,
        status: "COMPLETED",
      }),

      // Today's completed appointments
      Appointment.countDocuments({
        doctor: doctor._id,
        status: "COMPLETED",
        date: {
          $gte: start,
          $lte: end,
        },
      }),

      // Today's new patients
      Appointment.aggregate([
        {
          $match: {
            doctor: doctor._id,
            status: {
              $in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: "$patient",
            firstVisit: {
              $first: "$date",
            },
          },
        },
        {
          $match: {
            firstVisit: {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $count: "count",
        },
      ]),
    ]);

    // 3. Build dashboard object
    const dashboard = {
      totalPatients: uniquePatients.length,
      todayNewPatients:
        todayNewPatients.length > 0 ? todayNewPatients[0].count : 0,

      totalAppointments,
      completedAppointments,
      confirmedAppointments,
      pendingAppointments,

      todayCompletedAppointments,
    };

    // 4. Save in Redis for 60 seconds
    await redisClient.set(
      cacheKey,
      JSON.stringify(dashboard),
      "EX",
      60
    );

    // 5. Return response
    return res.status(200).json({
      success: true,
      dashboard,
      source: "mongodb",
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};



const uploadDoctorPhoto = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    doctor.profile_photo = req.file.path;

    await doctor.save();   // ⭐ FIXED

    res.json({
      message: "Photo uploaded",
      photo: doctor.profile_photo
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// ============================================================
// 1. toggleOpd
// Simple flip of opdStarted flag.
// ============================================================
const toggleOpd = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Guard: don't allow toggling OFF while a consultation is CURRENT.
    // This mirrors the same guard stopConsultation already had —
    // otherwise this endpoint bypasses that protection entirely.
    if (doctor.opdStarted) {
      const { today, tomorrow } = getTodayRange();
      const currentAppointment = await Appointment.findOne({
        doctor: doctor._id,
        status: "CURRENT",
        date: { $gte: today, $lt: tomorrow }
      });

      if (currentAppointment) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot stop OPD while a consultation is in progress. Complete the current consultation first."
        });
      }
    }

    doctor.opdStarted = !doctor.opdStarted;
    if (!doctor.opdStarted) {
      doctor.opdPaused = false; // reset pause state when OPD turns off
    }
    await doctor.save();

    res.json({
      success: true,
      opdStarted: doctor.opdStarted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// 2. startConsultation
// Starts OPD queue: takes the first CONFIRMED patient (by token)
// and makes them CURRENT.
// Made atomic with findOneAndUpdate to avoid two parallel requests
// both creating a CURRENT appointment.
// ============================================================
const startConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is paused"
      });
    }

    const { today, tomorrow } = getTodayRange();

    const alreadyRunning = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate("patient doctor");

    if (alreadyRunning) {
      return res.status(400).json({
        success: false,
        message: "Consultation already started",
        currentAppointment: alreadyRunning
      });
    }

    // Atomic claim: only one request can successfully flip
    // CONFIRMED -> CURRENT for the lowest-token appointment.
    const firstAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    }).sort({ token: 1 });

    if (!firstAppointment) {
      return res.status(400).json({
        success: false,
        message: "No patients in queue"
      });
    }

    const currentAppointment = await Appointment.findOneAndUpdate(
      { _id: firstAppointment._id, status: "CONFIRMED" }, // condition guards race
      { status: "CURRENT", consultationStartedAt: new Date() },
      { new: true }
    ).populate("patient doctor")
    .populate({path:"patient",populate:{path:"userId",select: "name email"}})
    .populate("doctor");

    if (!currentAppointment) {
      // Someone else claimed it in between — safe to tell client to retry
      return res.status(409).json({
        success: false,
        message: "Queue changed, please try again"
      });
    }

    io.to(`doctor_${doctor._id}`).emit("queueUpdated", {
      currentToken: currentAppointment.token,
      status: "RUNNING",
      appointmentId: currentAppointment._id
    });

    return res.status(200).json({
      success: true,
      message: "Consultation started",
      currentAppointment
    });
  } catch (error) {
    console.error("START CONSULTATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getCurrentPatient = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    const { today, tomorrow } = getTodayRange();

    const currentAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate({ path: "patient", populate: { path: "userId", select: "name email" } })

    if (!currentAppointment) {
      return res.status(200).json({
        success: true,
        message: "No current patient",
        currentAppointment: null,
        opdPaused: doctor.opdPaused
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current patient fetched",
      currentAppointment,
      opdPaused: doctor.opdPaused
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const stopConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD is already stopped"
      });
    }

    const { today, tomorrow } = getTodayRange();

    const currentAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate({
      path: "patient",
      populate: {
        path: "userId",
        select: "name email"
      }
    });

    /*
     * Current patient exists.
     * Emergency/force stop ke case mein consultation ko
     * COMPLETED nahi karenge because consultation actually
     * complete nahi hui hai.
     *
     * Is case mein SKIPPED better hai.
     */
    if (currentAppointment) {
      currentAppointment.status = "SKIPPED";
      currentAppointment.skippedAt = new Date();

      await currentAppointment.save();

      io.to(`doctor_${doctor._id}`).emit("consultationInterrupted", {
        appointmentId: currentAppointment._id,
        token: currentAppointment.token,
        status: "SKIPPED",
        message: "Consultation interrupted because OPD was stopped."
      });
    }

    // Stop OPD
    doctor.opdStarted = false;
    doctor.opdPaused = false;

    await doctor.save();

    // Notify doctor dashboard
    io.to(`doctor_${doctor._id}`).emit("opdStopped", {
      status: "STOPPED",
      message: "OPD stopped successfully."
    });

    return res.status(200).json({
      success: true,
      message: currentAppointment
        ? "OPD stopped. Current consultation was interrupted."
        : "OPD stopped successfully.",
      opdStarted: doctor.opdStarted,
      opdPaused: doctor.opdPaused,
      interruptedAppointment: currentAppointment
        ? {
            appointmentId: currentAppointment._id,
            token: currentAppointment.token,
            status: currentAppointment.status
          }
        : null
    });

  } catch (error) {
    console.error("STOP OPD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// 5. completeConsultation
// Marks CURRENT patient as COMPLETED and auto-advances the queue
// to the next CONFIRMED patient (merged with what callNext did,
// so the two endpoints no longer duplicate/conflict with each other).
// If frontend just wants "mark done, don't auto-advance", call
// this with ?autoAdvance=false.
// ============================================================
// const completeConsultation = async (req, res) => {
//   try {
//     const io = req.app.get("io");
//     const autoAdvance = req.query.autoAdvance !== "false";

//     const doctor = await docterModel.findOne({ userId: req.user.id });
//     if (!doctor) {
//       return res.status(404).json({
//         success: false,
//         message: "Doctor not found"
//       });
//     }

//     if (!doctor.opdStarted) {
//       return res.status(400).json({
//         success: false,
//         message: "OPD not started"
//       });
//     }

//     const { today, tomorrow } = getTodayRange();

//     const currentAppointment = await Appointment.findOne({
//       doctor: doctor._id,
//       status: "CURRENT",
//       date: { $gte: today, $lt: tomorrow }
//     });

//     if (!currentAppointment) {
//       return res.status(400).json({
//         success: false,
//         message: "No active consultation"
//       });
//     }

//     currentAppointment.status = "COMPLETED";
//     currentAppointment.consultationEndedAt = new Date();
//     await currentAppointment.save();

//     io.to(`doctor_${doctor._id}`).emit("consultationCompleted", {
//       appointmentId: currentAppointment._id,
//       token: currentAppointment.token,
//       status: "COMPLETED"
//     });

//     if (!autoAdvance) {
//       return res.status(200).json({
//         success: true,
//         message: "Consultation completed",
//         appointmentId: currentAppointment._id,
//         token: currentAppointment.token,
//         status: currentAppointment.status
//       });
//     }

//     // Auto-advance to next patient
//     const nextAppointment = await Appointment.findOneAndUpdate(
//       {
//         doctor: doctor._id,
//         status: "CONFIRMED",
//         date: { $gte: today, $lt: tomorrow }
//       },
//       { status: "CURRENT", consultationStartedAt: new Date() },
//       { new: true, sort: { token: 1 } }
//     ).populate({ path: "patient", populate: { path: "userId", select: "name email" } });

//     if (!nextAppointment) {
//       doctor.opdStarted = false;
//       await doctor.save();

//       io.to(`doctor_${doctor._id}`).emit("opdStopped", {
//         status: "STOPPED",
//         message: "No more patients. OPD ended."
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Consultation completed. No more patients — OPD ended."
//       });
//     }

//     io.to(`doctor_${doctor._id}`).emit("queueUpdated", {
//       currentToken: nextAppointment.token,
//       status: "RUNNING"
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Consultation completed. Next patient called.",
//       currentAppointment: nextAppointment
//     });
//   } catch (error) {
//     console.error("COMPLETE CONSULTATION ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

const completeConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    const result = await advanceQueue({
      doctor,
      io,
      closeStatus: "COMPLETED",
      socketEventName: "queueUpdated",
      closingMessage: "No more patients. OPD ended."
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    if (result.ended) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Consultation completed. Next patient called.",
      currentAppointment: result.nextAppointment
    });

  } catch (error) {
    console.error("COMPLETE CONSULTATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// 6. pauseConsultation — unchanged, was already correct.
// ============================================================
const pauseConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD already paused"
      });
    }

    doctor.opdPaused = true;
    await doctor.save();

    io.to(`doctor_${doctor._id}`).emit("opdPaused", {
      message: "OPD Paused"
    });

    return res.status(200).json({
      success: true,
      message: "OPD paused successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// 7. resumeConsultation
// Added date filter for consistency when looking up current appointment.
// ============================================================
const resumeConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (!doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is already running"
      });
    }

    doctor.opdPaused = false;
    await doctor.save();

    const { today, tomorrow } = getTodayRange();

    const currentAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    });

    io.to(`doctor_${doctor._id}`).emit("opdResumed", {
      currentToken: currentAppointment?.token ?? null
    });

    return res.status(200).json({
      success: true,
      message: "OPD resumed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const advanceQueue = async ({ doctor, io, closeStatus, socketEventName, closingMessage }) => {
  const { today, tomorrow } = getTodayRange();

  const currentAppointment = await Appointment.findOne({
    doctor: doctor._id,
    status: "CURRENT",
    date: { $gte: today, $lt: tomorrow }
  });

  if (!currentAppointment && closeStatus === "SKIPPED") {
    // skipPatient specifically requires an existing current patient
    return { error: "No current patient to skip" };
  }

  if (currentAppointment) {
    currentAppointment.status = closeStatus;
    if (closeStatus === "SKIPPED") currentAppointment.skippedAt = new Date();
    if (closeStatus === "COMPLETED") currentAppointment.consultationEndedAt = new Date();
    await currentAppointment.save();

    // Closing an appointment changes the timeline the AI summary is built from.
    await redisClient.del(summaryCacheKey(currentAppointment.patient));
  }

  const nextAppointment = await Appointment.findOneAndUpdate(
    {
      doctor: doctor._id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    },
    { status: "CURRENT", consultationStartedAt: new Date() },
    { new: true, sort: { token: 1 } }
  ).populate({ path: "patient", populate: { path: "userId", select: "name email" } });

  if (!nextAppointment) {
    doctor.opdStarted = false;
    await doctor.save();

    io.to(`doctor_${doctor._id}`).emit("opdStopped", {
      status: "STOPPED",
      message: closingMessage
    });

    return { ended: true, message: closingMessage };
  }

  io.to(`doctor_${doctor._id}`).emit(socketEventName, {
    currentToken: nextAppointment.token,
    ...(currentAppointment && closeStatus === "SKIPPED"
      ? { skippedToken: currentAppointment.token }
      : {}),
    status: "RUNNING"
  });

  return { nextAppointment };
};

const skipPatient = async (req, res) => {
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is paused"
      });
    }

    const result = await advanceQueue({
      doctor,
      io,
      closeStatus: "SKIPPED",
      socketEventName: "queueUpdated",
      closingMessage: "No more patients. OPD ended after skip."
    });

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    if (result.ended) {
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: "Patient skipped",
      currentAppointment: result.nextAppointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const callNext = async (req, res) => {
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is paused"
      });
    }

    const result = await advanceQueue({
      doctor,
      io,
      closeStatus: "COMPLETED",
      socketEventName: "queueUpdated",
      closingMessage: "No more patients. OPD ended."
    });

    if (result.ended) {
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: "Next patient called",
      currentAppointment: result.nextAppointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports={getDoctorDashboard,getCurrentPatient,completeConsultation,getUniquePatients,toggleOpd,getProfileStatus,submitProfile,getDoctorById, getDoctorByHospital, searchPatient,getDoctorsByDepartment,getMyProfile,getCompletedAppointments,updateProfile,uploadDoctorPhoto,callNext,skipPatient,pauseConsultation,resumeConsultation,stopConsultation,startConsultation};
