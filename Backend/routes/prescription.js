const express = require('express');
const { createPrescription, getPatientPrescriptionsForDoctor, getPrescriptionByAppointment, updatePrescription, ocrPrescription, PrescriptionDescriptionParse } = require('../controllers/prescriptionController');

const auth = require('../middleware/auth');
const { ROLE } = require('../config/role');
const authorize = require('../middleware/authorize');
const { upload } = require('../middleware/uploadCloud');
const { sharePrescriptions } = require('../controllers/reportController');
const prescriptionRoute = express.Router();

prescriptionRoute.post('/create-prescription',auth, authorize(ROLE.doctor), upload.array("attachments", 5), createPrescription);
prescriptionRoute.patch('/share-prescription',auth, sharePrescriptions);
prescriptionRoute.put('/update-prescription/:prescriptionId',auth,authorize(ROLE.doctor),upload.array("attachments",5), updatePrescription);
prescriptionRoute.get('/get-prescription/:patientId',auth,  getPatientPrescriptionsForDoctor);
prescriptionRoute.get('/get-prescription/appointment/:appointmentId',auth, getPrescriptionByAppointment);
prescriptionRoute.post("/prescription-image-extract",auth,upload.single("file"), ocrPrescription);
prescriptionRoute.post("/prescription-description-extract",auth,upload.single("file"), PrescriptionDescriptionParse);

module.exports=prescriptionRoute;
