const express = require("express");
const opdRouter = express.Router();

const {
  startOpdSession,
  endOpdSession
} = require("../controller/opdController");

// middleware (example)
//const { protect, authorize } = require("../middlewares/authMiddleware");
const { ROLE } = require("../config/role");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

/**
 * =====================================
 * DOCTOR OPD ROUTES
 * =====================================
 * only doctor can control OPD flow
 */

// Start OPD
opdRouter.post(
  "/opd/start",
  auth,
  authorize(ROLE.doctor),
  startOpdSession
);


// End OPD
opdRouter.post(
  "/opd/:opdSessionId/end",
  //protect,
  //authorize(ROLE.doctor),
  endOpdSession
);

module.exports = opdRouter;
