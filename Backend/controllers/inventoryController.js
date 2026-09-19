const inventory = require("../models/inventory");
const Medicine = require("../models/Medicine");
const shop = require("../models/PharmacyModel");

exports.addMedicineToInventory = async (req, res) => {
  try {
    const { name, brand, category, dosage, description, price, quantity, expiryDate } = req.body;

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const Shop = await shop.findOne({ userId: req.user._id });

    if (!Shop) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }

    let medicine = await Medicine.findOne({ name, dosage });

    if (!medicine) {
      medicine = await Medicine.create({ name, brand, category, dosage, description });
    }

    const existingInventory = await inventory.findOne({
      shopId: Shop._id,
      medicineId: medicine._id,
    });

    if (existingInventory) {
      return res.status(400).json({ message: "Medicine already added" });
    }

    const newInventory = await inventory.create({
      shopId: Shop._id,
      medicineId: medicine._id,
      price,
      quantity,
      expiryDate,
    });

    res.status(201).json({
      message: "Medicine added successfully",
      newInventory,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateInventoryMedicine = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const {
      name,
      brand,
      category,
      dosage,
      description,
      price,
      quantity,
      expiryDate,
      isAvailable,
    } = req.body;

    // 🔹 Find shop of logged-in pharmacy user
    const Shop = await shop.findOne({ userId: req.user._id });

    if (!Shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // 🔹 Find inventory item
    const inventoryItem = await inventory.findOne({
      _id: inventoryId,
      shopId: Shop._id,
    });

    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // 🔹 Update medicine info (optional)
    if (name || brand || category || dosage || description) {
      const medicine = await Medicine.findById(inventoryItem.medicineId);

      if (medicine) {
        if (name) medicine.name = name.trim().toLowerCase();
        if (brand) medicine.brand = brand;
        if (category) medicine.category = category;
        if (dosage) medicine.dosage = dosage;
        if (description) medicine.description = description;

        await medicine.save();
      }
    }

    // 🔹 Prevent expired medicine update
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return res.status(400).json({ message: "Expiry date already passed" });
    }

    // 🔹 Update inventory fields
    if (price !== undefined) inventoryItem.price = price;
    if (quantity !== undefined) inventoryItem.quantity = quantity;
    if (expiryDate !== undefined) inventoryItem.expiryDate = expiryDate;
    if (isAvailable !== undefined) inventoryItem.isAvailable = isAvailable;

    await inventoryItem.save();

    res.status(200).json({
      message: "Inventory updated successfully",
      inventoryItem,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getShopMedicineStats = async (req, res) => {
  try {
    // 🔹 Find shop of logged-in pharmacy
    const Shop = await shop.findOne({ userId: req.user._id });

    if (!Shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const totalMedicines = await inventory.countDocuments({
      shopId: Shop._id,
    });

    const availableMedicines = await inventory.countDocuments({
      shopId: Shop._id,
      isAvailable: true,
      quantity: { $gt: 0 },
    });

    const outOfStock = await inventory.countDocuments({
      shopId: Shop._id,
      $or: [
        { quantity: 0 },
        { isAvailable: false }
      ],
    });

    res.status(200).json({
      totalMedicines,
      availableMedicines,
      outOfStock,
    });

  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getTodayOrderStats = async (req, res) => {
  try {
    // 🔹 Find shop of logged-in pharmacy
    const shop = await ShopModel.findOne({ userId: req.user._id });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // 🔹 Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await Order.aggregate([
      {
        $match: {
          shopId: shop._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "delivered"] },
                "$totalAmount",
                0
              ]
            }
          }
        },
      },
    ]);

    let totalOrders = 0;
    let completed = 0;
    let pending = 0;
    let cancelled = 0;
    let todayRevenue = 0;

    stats.forEach((item) => {
      totalOrders += item.count;

      if (item._id === "delivered") {
        completed = item.count;
        todayRevenue += item.revenue;
      }
      if (item._id === "pending") pending = item.count;
      if (item._id === "cancelled") cancelled = item.count;
    });

    res.status(200).json({
      totalOrders,
      completed,
      pending,
      cancelled,
      todayRevenue,
    });

  } catch (error) {
    console.error("TODAY ORDER STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await inventory.find().populate("medicineId").sort({ createdAt: -1 });
    res.status(200).json(medicines);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching medicines" });
  }
};

