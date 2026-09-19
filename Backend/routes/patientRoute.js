const express = require('express');
const { registerPatient, getMyReports, getPatientAppointments, getMyProfile, updatePatientProfile, getPatientReportForDoctor, getPatientProfile, getActiveQueueStatus } = require('../controllers/patientController');
const { ROLE } = require('../config/role');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { patientUpload } = require('../middleware/uploadCloud');

const patientRoute = express.Router();

patientRoute.post('/register',registerPatient);
patientRoute.get('/get-patient-profile/:patientId',auth,getPatientProfile);
patientRoute.patch('/update-patient-profile',auth,patientUpload.single("profileImage") ,updatePatientProfile);
patientRoute.get("/me",auth,authorize(ROLE.patient),getMyProfile);
patientRoute.get('/get-appointments/:patientId',auth,getPatientAppointments);
patientRoute.get('/get-my-reports',auth,authorize(ROLE.patient), getMyReports);
patientRoute.get('/get-reports/:patientId',auth, getPatientReportForDoctor);
patientRoute.get("/active-queue-status",auth,getActiveQueueStatus);
module.exports=patientRoute;