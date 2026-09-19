const express = require("express");

const memoryUpload = require("../middleware/memoryUpload");
const { analyzeMedicine, getAllUniqueMedicines, getAllMedicine } = require("../controllers/medicineController");
const auth = require("../middleware/auth");
const medicineRouter = express.Router();


medicineRouter.post(
  "/analyze",
  memoryUpload.single("image"),
  analyzeMedicine
);

medicineRouter.get(
  "/get-medicine",
  getAllUniqueMedicines
);

medicineRouter.get(
  "/all-medicine",
  getAllMedicine
);



module.exports = medicineRouter;