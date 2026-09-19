const express = require('express');
const { getRouteToHospital } = require('../controllers/locationController.js');
const { getHospitalStates, getHospitalCities,getAllHospitalSearch, getHospitals, registerHospital, updateHospitalProfile, getHospitalProfile, getStats, getHospitalById, getAllPharmacies, updatePharmacyStatus, togglePharmacyActive, getHospitalPatients, searchHospitalPatients, getAllHospitals } = require('../controllers/hospitalController.js');
const { hospitalUpload, upload } = require('../middleware/uploadCloud.js');
const auth = require('../middleware/auth.js');
const { updateDoctorOpdSchedule, uploadReportForPatient } = require('../controllers/adminController.js');
const authorize = require('../middleware/authorize.js');
const { ROLE } = require('../config/role.js');

const route = express.Router();
route.get('/test', (req, res) => {
  console.log("test route hit");
  res.send("working");
});

route.get('/hospitals/states',getHospitalStates);
route.get('/hospitals/cities',getHospitalCities);
route.get('/hospitals',getHospitals)
route.get('/all-hospitals',getAllHospitals)
route.get('/search-hospitals',getAllHospitalSearch);
route.post('/hospitals',registerHospital)
route.post("/route-to-hospital",getRouteToHospital);
route.patch('/profile',auth, hospitalUpload.fields([{name:"logo",maxCount:1},
    {name:"coverImage",maxCount:1},
    {name:"galleryImages",maxCount:10}
]),updateHospitalProfile)
route.get("/pharmacies",auth, getAllPharmacies);
route.get('/profile', auth, getHospitalProfile)
route.get("/hospitals/profile/:id", getHospitalById);
route.get('/statistics',auth,getStats);
//done
route.patch("/opd-schedule/:doctorId",auth,authorize(ROLE.admin),updateDoctorOpdSchedule);
route.post("/upload-report",auth, authorize(ROLE.admin),upload.single("file"), uploadReportForPatient);
route.patch("/approve-pharmacy/:pharmacyId",auth, authorize(ROLE.platform_admin),updatePharmacyStatus);
route.patch(
  "/pharmacies/:pharmacyId/toggle-active",auth,authorize(ROLE.admin),togglePharmacyActive
);
route.get(
  "/all-patients",auth,authorize(ROLE.admin),getHospitalPatients
);
route.get(
  "/search-patients",auth,authorize(ROLE.admin,ROLE.doctor),searchHospitalPatients
);

module.exports=route;