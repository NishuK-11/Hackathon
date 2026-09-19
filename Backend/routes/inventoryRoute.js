const express = require("express");
const auth = require("../middleware/auth");
const { addMedicineToInventory, updateInventoryMedicine, getShopMedicineStats, getAllMedicines } = require("../controllers/inventoryController");
const inventoryRouter = express.Router();

inventoryRouter.post("/add", auth, addMedicineToInventory);
inventoryRouter.put(
  "/update/:inventoryId", auth,
  updateInventoryMedicine
);

inventoryRouter.get(
  "/stats", auth,
  getShopMedicineStats
);

inventoryRouter.get('/allmedicine',auth,getAllMedicines);

module.exports = inventoryRouter;
