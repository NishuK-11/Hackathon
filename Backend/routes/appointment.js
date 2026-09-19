const express = require("express");
const appointmentRouter = express.Router();

const {
  createAppointment,
  confirmAppointment,
  getAllAppointmentsForDate,
  getAppointmentById,
  getMyAppointments,
  getTodayStats,
  getOnlineAppointmentsForDate,
  getTodayOnlineStats,
  getMyAppointmentsPatients
} = require("../controllers/appointmentController");

const { ROLE } = require("../config/role");
const auth = require("../middleware/auth");
const { completeConsultation } = require("../controllers/DoctorController");
// Patient books appointment (online)
appointmentRouter.post(
  "/appointments",
  auth,
  //authorize(ROLE.patient),
  createAppointment
);


appointmentRouter.patch(
  "/appointments/:id/confirm",
  //authorize(ROLE.admin, ROLE.receptionist),
  confirmAppointment
);

appointmentRouter.get("/appointments/today",auth,getAllAppointmentsForDate);
appointmentRouter.get("/appointments/my", auth, getMyAppointments);
appointmentRouter.get("/appointments/my/patients", auth, getMyAppointmentsPatients);
appointmentRouter.get("/appointments/today-stats",auth,getTodayStats);
appointmentRouter.get("/appointments/online-stats",auth,getTodayOnlineStats);
appointmentRouter.get("/appointments/online",auth,getOnlineAppointmentsForDate);
appointmentRouter.get("/appointments/:id", auth, getAppointmentById);
appointmentRouter.patch("/appointments/:id/complete",auth, completeConsultation);



module.exports = appointmentRouter;

