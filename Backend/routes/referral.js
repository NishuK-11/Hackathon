const express = require('express');
const { createReferral } = require('../controllers/referralController');
const authorize = require('../middleware/authorize');
const { ROLE } = require('../config/role');
const auth = require('../middleware/auth');

const referralRoute = express.Router();
referralRoute.post(
  "/create",
  auth,
  authorize(ROLE.admin),
  createReferral
);

module.exports=referralRoute;