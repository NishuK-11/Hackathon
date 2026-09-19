const express = require("express");
const {
  registerPharmacy,
  loginPharmacy,
  addMedicine,
  getMyInventory,
  getNearbyPharmacies,
  getPharmacyMedicines,
} = require("../controllers/pharmacyController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../config/role");
const pharmacyRouter = express.Router();

pharmacyRouter.post("/signup",registerPharmacy);
pharmacyRouter.post("/login",loginPharmacy);
pharmacyRouter.post("/add-medicine",auth, addMedicine);
pharmacyRouter.get("/my-inventory", auth, authorize(ROLE.pharmacy), getMyInventory);

// Patient-facing lookups. Public on purpose - the patient app browses
// pharmacies before the user is necessarily logged in, and neither route
// exposes anything the pharmacy has not already published for sale.
// Declared before "/dashboard" is harmless: both paths are unambiguous
// (no bare "/:id" route exists on this router).
pharmacyRouter.get("/nearby", getNearbyPharmacies);
pharmacyRouter.get("/:pharmacyId/medicines", getPharmacyMedicines);

module.exports = pharmacyRouter;

// Added pharmacy analytics endpoint. Existing pharmacy routes above are unchanged.
pharmacyRouter.get(
  "/dashboard",
  auth,
  require("../controllers/pharmacyDashboardController").getPharmacyDashboard
);
