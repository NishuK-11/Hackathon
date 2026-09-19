

const express = require("express");
const { approveHospital, getAllHospitals, getHospitalsQuery } = require("../controllers/hospitalController");
const { adminLogin } = require("../controllers/platformController");
const platformOwnerRoute = express.Router();
// Platform admin approves hospital
platformOwnerRoute.post("/login",adminLogin);
platformOwnerRoute.put("/approve/:id", approveHospital);
platformOwnerRoute.get("/all-hospitals",getAllHospitals);
platformOwnerRoute.get('/hospitals',getHospitalsQuery);

module.exports = platformOwnerRoute;