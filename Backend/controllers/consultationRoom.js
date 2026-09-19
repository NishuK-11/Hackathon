const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { hasUncaughtExceptionCaptureCallback } = require("process");
const patientModel = require("../models/patientModel");
const docterModel = require("../models/docterModel");
const consulation = require("../models/consulation");
const appointmentModel = require("../models/appointmentModel");

// exports.createConsultationRoom = async (req, res) => {
//   try {
//     const doctorUserId = req.user.id;
//     const doctor = await docterModel.findOne({ userId: doctorUserId });

//     const io = req.app.get("io");
//     const onlinePatients = req.app.get("onlinePatients");

//     const { appointmentId, patientId } = req.body;

//     const roomId = "CONS-" + crypto.randomBytes(2).toString("hex").toUpperCase();
//     const password = Math.floor(1000 + Math.random() * 9000);

//     const room = await consulation.create({
//       appointment: appointmentId,
//       patient: patientId,
//       doctor: doctor._id,  // ✅ FIXED
//       roomId,
//       password,
//       status: "WAITING",
//       startedAt: new Date(),
//       doctorJoined: false,
//       patientJoined: false

//     });

//     const patientSocket = onlinePatients.get(patientId);

//     if (patientSocket) {
//       // ✅ REALTIME ALERT
//       io.to(patientSocket).emit("consultation-started", {
//         roomId,
//         password,
//         appointmentId
//       });
//     } else {
//       // ✅ PATIENT OFFLINE → SEND EMAIL
//       const patient = await patientModel.findById(patientId).populate("userId");

//       if (patient?.userId?.email) {
//         await sendEmail({
//           to: patient.userId.email,
//           subject: "Doctor is ready for consultation",
//           text: `
//             Your online consultation has started.

//             Room ID: ${roomId}
//             Password: ${password}

//             Please login to join the call.
//           `
//         });
//       }
//     }

//     res.json({
//       roomId,
//       password,
//       patientOnline: !!patientSocket
//     });

//     // 🔥 AUTO TIMEOUT (30 sec)
//     setTimeout(async () => {

//       const updatedRoom =
//         await consulation.findById(room._id);

//       if (
//         updatedRoom &&
//         updatedRoom.status === "WAITING"
//       ) {
//         updatedRoom.status = "MISSED";
//         await updatedRoom.save();

//         io.to(roomId)
//           .emit("call-missed");
//       }

//     }, 30000);

//     res.json({
//       roomId,
//       password,
//       patientOnline: !!patientSocket
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// exports.startConsultation = async (req, res) => {
//   try {
//     const { appointmentId, patientId } = req.body;

//     const roomId = `room_${appointmentId}`;

//     await Appointment.findByIdAndUpdate(appointmentId, {
//       status: "CONFIRMED"
//     });

//     res.json({ roomId });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// exports.startConsultation = async (req, res) => {
//   try {
//     const { appointmentId } = req.params;

//     const appointment = await appointmentModel.findById(appointmentId);

//     if (!appointment) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }

//     // ✅ Only offline appointments allowed
//     if (appointment.appointmentType?.toLowerCase() !== "offline") {
//       return res.status(400).json({
//         message: "Start consultation allowed only for offline appointments",
//       });
//     }

//     // ✅ Update status
//     appointment.status = "CURRENT";
//     await appointment.save();

//     res.json({
//       message: "Consultation started successfully",
//       appointment,
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// // GET consultation by appointmentId
// exports.getConsultationAppointment = async (req, res) => {
//   try {
//     const consultation = await consulation.findOne({
//       appointment: req.params.appointmentId,
//     });

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         message: "Consultation not found",
//       });
//     }

//     res.json({
//       success: true,
//       consultation,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// }