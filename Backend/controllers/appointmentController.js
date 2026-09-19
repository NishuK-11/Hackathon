const { source } = require("../config/cloudinary");
const { redisClient } = require("../config/redisClient");
const appointmentModel = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");
const PatientHospitalSchema = require("../models/PatientHospitalSchema");
const patientModel = require("../models/patientModel");
const { getUtcDayRange } = require("../utils/utcday");

exports.createAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const {
      doctor,
      date,
      appointmentType,
      reason,
      description
    } = req.body;

    // =========================
    // 1. Validate appointment type
    // =========================
    if (!appointmentType || !["online", "offline"].includes(appointmentType)) {
      return res.status(400).json({
        success: false,
        message: "Appointment type must be either online or offline"
      });
    }

    // =========================
    // 2. Find patient
    // =========================
    const patient = await patientModel.findOne({
      userId: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found"
      });
    }

    // =========================
    // 3. Find doctor
    // =========================
    const doctorData = await docterModel.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // =========================
    // 4. Validate date
    // =========================
    const appointmentDate = new Date(date);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date"
      });
    }

    const { start, end } = getUtcDayRange(date);

    // =========================
    // 5. Past date check
    // =========================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Past dates cannot be booked."
      });
    }

    // =========================
    // 6. Maximum 30 days advance
    // =========================
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (selectedDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: "Appointments can only be booked up to 30 days in advance."
      });
    }

    // =========================
    // 7. Check doctor's OPD schedule
    // =========================
    const dayName = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata"
    });

    const schedule = doctorData.opdSchedule.find(
      (s) => s.day === dayName && s.isAvailable
    );

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available on selected day."
      });
    }

    // =========================
    // 8. Same-day booking closing
    // =========================
    if (selectedDate.getTime() === today.getTime()) {

      const [hour, minute] = schedule.from
        .split(":")
        .map(Number);

      const bookingClose = new Date();

      bookingClose.setHours(hour, minute, 0, 0);
      bookingClose.setMinutes(
        bookingClose.getMinutes() - 30
      );

      if (new Date() > bookingClose) {
        return res.status(400).json({
          success: false,
          message: "Booking is closed for today's OPD."
        });
      }
    }

    // =========================
    // 9. Check duplicate appointment
    // =========================
    const existingAppointment = await appointmentModel.findOne({
      patient: patient._id,
      doctor: doctorData._id,
      appointmentType: appointmentType,
      date: {
        $gte: start,
        $lte: end
      },
      status: {
        $in: ["PENDING", "CONFIRMED"]
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Your appointment already exists for this date."
      });
    }

    // =========================
    // 10. Token only for OFFLINE
    // =========================
    let token = null;

    if (appointmentType === "offline") {

      const lastAppointment = await appointmentModel
        .findOne({
          doctor: doctorData._id,
          appointmentType: "offline",
          date: {
            $gte: start,
            $lte: end
          },
          token: {
            $ne: null
          }
        })
        .sort({
          token: -1
        });

      token = lastAppointment
        ? lastAppointment.token + 1
        : 1;
    }

    // =========================
    // 11. Create appointment
    // =========================
    const appointment = await appointmentModel.create({
      patient: patient._id,
      doctor: doctorData._id,
      hospital: doctorData.hospital,
      department: doctorData.department,

      date: appointmentDate,

      appointmentType,

      // Offline → token
      // Online → null
      token,

      reason,
      description,

      status: "PENDING"
    });

    // =========================
    // 12. Update patient-hospital relation
    // =========================
    await PatientHospitalSchema.findOneAndUpdate(
      {
        patientId: patient._id,
        hospitalId: doctorData.hospital
      },
      {
        $set: {
          lastVisit: new Date(),
          status: "ACTIVE"
        },
        $setOnInsert: {
          firstVisit: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    // =========================
    // 13. Notify doctor
    // =========================
    const room = `doctor_${doctorData._id.toString()}`;

    console.log("📢 Sending appointment notification");
    console.log("Doctor ID:", doctorData._id.toString());
    console.log("Room:", room);
    console.log("Appointment Type:", appointmentType);

    io.to(room).emit("new-appointment", {
      message: "New appointment received",

      appointmentId: appointment._id,
      patientId: patient._id,
      doctorId: doctorData._id,

      appointmentType,

      token,

      date: appointmentDate,

      reason
    });

    // =========================
    // 14. Populate appointment
    // =========================
    const populatedAppointment =
      await appointmentModel
        .findById(appointment._id)
        .populate({
          path: "patient",
          populate: {
            path: "userId",
            select: "name email gender"
          }
        })
        .populate("doctor")
        .populate("hospital")
        .populate("department");

    // =========================
    // 15. Response
    // =========================
    return res.status(201).json({
      success: true,
      message: `${appointmentType} appointment booked successfully`,
      appointment: populatedAppointment
    });

  } catch (err) {

    console.error("CREATE APPOINTMENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// ================================
// Admin / Receptionist confirms appointment
// ================================
exports.confirmAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const { id } = req.params;
    const appointment = await appointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // 🚫 Online ko confirm nahi karna yahan
    if (appointment.appointmentType !== "offline") {
      return res.status(400).json({
        message: "Only offline appointments require confirmation"
      });
    }

    if (appointment.status === "CONFIRMED") {
      return res.status(400).json({
        message: "Appointment already confirmed"
      });
    }

    // // ✅ Update status
    // appointment.status = "CONFIRMED";
    // appointment.token = tokenNumber;
    // await appointment.save();

    // ✅ Same day range
    const startOfDay = new Date(appointment.date);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(appointment.date);
    endOfDay.setHours(23,59,59,999);

    // ✅ FIRST appointments fetch karo
    const appointments = await appointmentModel.find({
      doctor: appointment.doctor,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["PENDING", "CONFIRMED"] },
      appointmentType: "offline"  
    }).sort({ createdAt: 1 });

    // ✅ THEN token calculate karo
    const tokenNumber =
      appointments.findIndex(
        (a) => a._id.toString() === appointment._id.toString()
      ) + 1;

    // ✅ THEN save
    appointment.status = "CONFIRMED";
    if (appointment.appointmentType === "offline") {
      appointment.token = tokenNumber; //.
    } else {
      appointment.token = null;
    }
    await appointment.save();
    await redisClient.del(`doctor:todayAppointments:${appointment.doctor.toString()}`);

    // ✅ Socket emit
    io.to(`patient_${appointment.patient.toString()}`)
      .emit("APPOINTMENT_CONFIRMED", {
        appointmentId: appointment._id,
        token: appointment.appointmentType === "offline" ? tokenNumber : null,
        message: "Your appointment is confirmed"
      });

    return res.status(200).json({
      message: "Appointment confirmed successfully",
      token: tokenNumber,
      appointment
    });

  } catch (error) {
    console.error("Confirm Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm appointment",
      error: error.message
    });
  }
};


exports.cancelAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Already cancelled
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    // Completed appointment cancel nahi ho sakti
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });
    }

    // Status update
    appointment.status = "CANCELLED";

    // Offline token remove kar do
    if (appointment.appointmentType === "offline") {
      appointment.token = null;
    }

    await appointment.save();
    await redisClient.del(`doctor:todayAppointments:${appointment.doctor.toString()}`);

    // Patient ko notify karo
    io.to(`patient_${appointment.patient.toString()}`).emit(
      "APPOINTMENT_CANCELLED",
      {
        appointmentId: appointment._id,
        message: "Your appointment has been cancelled by the doctor.",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });

  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

exports.getAllAppointmentsForDate = async (req, res) => {
  try {
    console.log("entered");

    const doctorUserId = req.user.id;

    const doctor = await docterModel
      .findOne({ userId: doctorUserId })
      .populate("department hospital", "name");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    // Redis cache key
    const cacheKey = `doctor:todayAppointments:${doctor._id}`;

    // Check Redis first
    const cachedAppointments = await redisClient.get(cacheKey);

    if (cachedAppointments) {
      console.log("✅ Redis HIT");

      return res.status(200).json({
        ...JSON.parse(cachedAppointments),
        source: "redis",
      });
    }

    console.log("❌ Redis MISS");

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's appointments
    // COMPLETED appointments will NOT be fetched
    const appointments = await appointmentModel
      .find({
        doctor: doctor._id,
        appointmentType: "offline",

        // 🔥 Don't show completed appointments
        status: { $ne: "COMPLETED" },

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate({
        path: "patient",
        populate: {
          path: "userId",
          select: "name email gender",
        },
      })
      .sort({ createdAt: 1 });

    // Create patient/token list
    const patients = appointments.map((appt, index) => ({
      token: index + 1,
      appointmentId: appt._id,
      patient: appt.patient,
      status: appt.status,
      bookedAt: appt.createdAt,
    }));

    const response = {
      success: true,
      message: "Today's appointments fetched successfully",

      doctor: {
        id: doctor._id,
        name: doctor.name,
        department: doctor.department,
        hospital: doctor.hospital,
      },

      total: appointments.length,

      patients,
    };

    // Store fresh data in Redis for 60 seconds
    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "EX",
      60
    );

    console.log("💾 Appointments cached in Redis");

    return res.status(200).json({
      ...response,
      source: "mongodb",
    });

  } catch (error) {
    console.error(
      "getAllAppointmentForToday error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getOnlineAppointmentsForDate = async(req,res)=>{
  try{
    const doctorUserId = req.user.id;
    const doctor = await docterModel.findOne({userId:doctorUserId})
    .populate("department hospital","name");
    if(!doctor){
      return res.status(404).json({
        message:"Doctor profile not found",
      })
    }
    //today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const appointments = await appointmentModel.find({
      doctor:doctor._id,
      appointmentType:"online",
      date:{
        $gte:startOfDay,
        $lte:endOfDay,
      }
    })
    .populate({
      path:"patient",
      populate:({
        path:"userId",
        select:"name email gender"
      })
    })
    .sort({createdAt:1});

    const patients = appointments.map((appt,index)=>({
      token: index+1,
      appointmentId:appt._id,
      patient:appt.patient,
      status:appt.status,
      bookedAt:appt.createdAt
    }))

    return res.status(200).json({
      message:"Today's appointments fetched successfully",
      doctor:{
        id:doctor._id,
        name:doctor.name,
        department:doctor.department,
        hospital:doctor.hospital
      },
      total:appointments.length,
      patients,
    });
  }catch(error){
    console.error("getAllAppointmentForToday error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
}

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentModel.findById(req.params.id)
      .populate("doctor", "name position")
      .populate("patient", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//doc--
exports.getMyAppointments = async (req, res) => {
  try {
    const { status,appointmentType } = req.query;

    const doctor = await docterModel.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filter = {
      doctor: doctor._id,
      date: {
        $gte: start,
        $lte: end,
      },
    };

    if (status) {
      filter.status = status.toUpperCase();
    }
    if (appointmentType) {
      filter.appointmentType = appointmentType;
    }

    const appointments = await appointmentModel.find(filter)
      .populate({
        path: "patient",
        populate: {
          path: "userId",
          select: "name email gender phone",
        },
      })
      .select("patient token appointmentType date status")
      .sort({ token: 1 });

    return res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Patient - Get My Appointments
exports.getMyAppointmentsPatients = async (req, res) => {
  try {
    const patient = await patientModel.findOne({
      userId: req.user.id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const appointments = await appointmentModel
      .find({ patient: patient._id })
      .populate({
        path: "doctor",
        select: "profile_photo",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .populate({
        path: "department",
        select: "name",
      })
      .populate({
        path: "hospital",
        select: "name",
      })
      .sort({ createdAt: -1 });

    const result = appointments.map((a) => ({
      id: a._id,
      doctorId: a.doctor?._id,
      doctorName: a.doctor?.userId?.name || "Doctor",
      doctorProfilePhoto: a.doctor?.profile_photo || "",
      department: a.department?.name || "Department",
      hospital: a.hospital?.name || "Hospital",
      status: a.status,
      token: a.token ?? null,
      date: a.date,
      appointmentType: a.appointmentType,
    }));

    return res.status(200).json({
      success: true,
      appointments: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch appointments: ${err.message}`,
    });
  }
};


exports.getOnlineAppointments = async (req, res) => {
  try {
    const patient = await patientModel.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await appointmentModel.find({
      patient: patient._id,
      appointmentType: "online"
    })
      .populate({
        path: "doctor",
        populate: {
          path: "userId",
          select: "name"
        }
      })
      .populate({ path: "department", select: "name" })
      .populate({ path: "hospital", select: "name" })
      .sort({ date: -1 });

    const result = appointments.map(a => ({
      id: a._id,
      doctorName: a.doctor?.userId?.name || "Doctor",
      department: a.department?.name || "Department",
      hospital: a.hospital?.name || "Hospital",
      status: a.status,
      date: a.date,
      token: a.token ?? null,
      appointmentType: a.appointmentType
    }));

    res.status(200).json({ appointments: result });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    // 1. Find appointment
    const appointment = await appointmentModel.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // 2. Find doctor
    const doctor = await docterModel.findById(appointment.doctor);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // 3. Check if OPD is paused
    if (doctor.opdPaused) {
      return res.status(400).json({
        message: "Cannot complete appointment while OPD is paused",
      });
    }

    // 4. Check if appointment is already completed
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        message: "Appointment is already completed",
      });
    }

    // 5. Mark appointment as completed
    appointment.status = "COMPLETED";
    appointment.consultationEndedAt = new Date();

    await appointment.save();

    // 6. 🔥 IMPORTANT: Delete today's appointment cache
    const cacheKey = `doctor:todayAppointments:${doctor._id}`;

    await redisClient.del(cacheKey);

    console.log("🗑️ Redis cache deleted:", cacheKey);

    // 7. IDs for socket rooms
    const patientId = appointment.patient.toString();
    const doctorId = appointment.doctor.toString();

    // 8. Notify doctor dashboard in real-time
    if (io) {
      io.to(`doctor_${doctorId}`).emit("appointmentCompleted", {
        appointmentId: appointment._id,
        status: "COMPLETED",
      });

      // 9. Notify patient
      io.to(`patient_${patientId}`).emit("APPOINTMENT_COMPLETED", {
        appointmentId: appointment._id,
        message: "Your consultation is completed",
      });
    }

    // 10. Send response
    return res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      appointment,
    });

  } catch (error) {
    console.error("Complete appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Error completing appointment",
      error: error.message,
    });
  }
};
exports.getTodayStats = async(req,res)=>{
  try{
    const doctorUserId = req.user.id;
    const doctorId = await docterModel.findOne({userId:doctorUserId});
    if (!doctorId) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const appointments= await appointmentModel.find({
      doctor:doctorId,
      appointmentType:"offline",
      date:{$gte: todayStart, $lte:todayEnd}
    })
    const stats={
      total: appointments.length,
      pending:appointments.filter(a=>a.status === "PENDING").length,
      confirmed:appointments.filter(a=>a.status === "CONFIRMED").length,
      cancelled:appointments.filter(a=>a.status === "CANCELLED").length,
      current:appointments.filter(a=>a.status === "INPROGRESS").length,  
      completed:appointments.filter(a=>a.status === "COMPLETED").length,  
    }
    res.json(stats);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}

exports.getTodayOnlineStats = async(req,res)=>{
  try{
    const doctorUserId = req.user.id;
    const doctorId = await docterModel.findOne({userId:doctorUserId});
    if (!doctorId) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const appointments= await appointmentModel.find({
      doctor:doctorId,
      appointmentType:"online",
      date:{$gte: todayStart, $lte:todayEnd}
    })
    const stats={
      total: appointments.length,
      pending:appointments.filter(a=>a.status === "PENDING").length,
      confirmed:appointments.filter(a=>a.status === "CONFIRMED").length,
      cancelled:appointments.filter(a=>a.status === "CANCELLED").length,
      current:appointments.filter(a=>a.status === "INPROGRESS").length,  
    }
    res.json(stats);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}