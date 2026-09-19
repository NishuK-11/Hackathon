const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { createEmergency, getMyActiveEmergency, cancelEmergency } = require("../controllers/patientController");
const { updateEmergencyStatus, getHospitalEmergencies } = require("../controllers/hospitalController");

const emergencyRoute = express.Router();
emergencyRoute.post(
  "/",auth,authorize("PATIENT"),createEmergency
);


// Kept above the ":emergencyId" routes so the literal path can never be
// swallowed as an id.
emergencyRoute.get(
  "/my/active",auth,authorize("PATIENT"),getMyActiveEmergency
);


// Also above the ":emergencyId" routes. The hospital's durable view of its own
// queue - the "emergency-created" socket alert only ever reaches an admin who
// happens to be connected at that moment.
emergencyRoute.get(
  "/hospital",auth,authorize("HOSPITAL_ADMIN"),getHospitalEmergencies
);


emergencyRoute.patch(
  "/:emergencyId/cancel",auth,authorize("PATIENT"),cancelEmergency
);


emergencyRoute.patch(
  "/:emergencyId/status",
  auth,
  authorize("HOSPITAL_ADMIN"),
  updateEmergencyStatus
);


module.exports=emergencyRoute;