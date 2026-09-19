const express = require("express");
const auth = require("../middleware/auth");

const {
  getDoctorAnalyticsController,
} = require("../controllers/doctorAnalyticsController");

const router = express.Router();

router.get(
  "/",
  auth,
  getDoctorAnalyticsController
);

module.exports = router;