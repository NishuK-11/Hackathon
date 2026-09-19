const Pharmacy = require("../models/PharmacyModel");
const Medicine = require("../models/Medicine");
const Order = require("../models/orderSchema");
const { buildPharmacyDemandForecast } = require("../services/pharmacyDemandMLService");

const LOW_STOCK_THRESHOLD = 10;
const EXPIRING_SOON_DAYS = 30;
const SALES_TREND_DAYS = 7;
const TOP_MEDICINES_LIMIT = 6;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const formatDay = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

exports.getPharmacyDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const pharmacy = await Pharmacy.findOne({ userId }).lean();

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy profile not found",
      });
    }

    const pharmacyId = pharmacy._id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const expiryLimit = new Date(now);
    expiryLimit.setDate(expiryLimit.getDate() + EXPIRING_SOON_DAYS);

    const medicines = await Medicine.find({ pharmacyId })
      .select("medicineName strength batchNumber price stock expiryDate category manufacturer status createdAt")
      .lean();

    const activeMedicines = medicines.filter((medicine) => medicine.status !== "EXPIRED");
    const totalStock = activeMedicines.reduce((sum, medicine) => sum + Number(medicine.stock || 0), 0);
    const lowStockItems = activeMedicines.filter(
      (medicine) => Number(medicine.stock || 0) > 0 && Number(medicine.stock || 0) <= LOW_STOCK_THRESHOLD
    );
    const outOfStockItems = activeMedicines.filter((medicine) => Number(medicine.stock || 0) <= 0);
    const expiringSoonItems = activeMedicines.filter((medicine) => {
      const expiry = new Date(medicine.expiryDate);
      return !Number.isNaN(expiry.getTime()) && expiry >= todayStart && expiry <= expiryLimit;
    });
    const expiredItems = medicines.filter((medicine) => {
      const expiry = new Date(medicine.expiryDate);
      return (
        medicine.status === "EXPIRED" ||
        (!Number.isNaN(expiry.getTime()) && expiry < todayStart)
      );
    });
    const stockValuation = activeMedicines.reduce(
      (sum, medicine) => sum + Number(medicine.price || 0) * Number(medicine.stock || 0),
      0
    );

    const last7Start = new Date(todayStart);
    last7Start.setDate(last7Start.getDate() - (SALES_TREND_DAYS - 1));

    const deliveredSales = await Order.find({
      shopId: pharmacyId,
      status: "delivered",
      createdAt: { $gte: last7Start, $lte: todayEnd },
    })
      .select("items totalAmount createdAt")
      .lean();

    const todaySales = await Order.aggregate([
      {
        $match: {
          shopId: pharmacyId,
          status: "delivered",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);

    // ML layer: demand forecasting based only on this pharmacy's delivered orders.
    const aiInsights = await buildPharmacyDemandForecast(pharmacyId);

    const salesByDay = new Map();
    for (let i = 0; i < SALES_TREND_DAYS; i += 1) {
      const day = new Date(last7Start);
      day.setDate(last7Start.getDate() + i);
      salesByDay.set(startOfDay(day).getTime(), {
        date: formatDay(day),
        sales: 0,
      });
    }

    deliveredSales.forEach((order) => {
      const key = startOfDay(order.createdAt).getTime();
      const entry = salesByDay.get(key);
      if (entry) entry.sales += Number(order.totalAmount || 0);
    });

    const medicineSales = new Map();
    deliveredSales.forEach((order) => {
      (order.items || []).forEach((item) => {
        const medicineId = item.medicineId?.toString();
        if (!medicineId) return;
        const existing = medicineSales.get(medicineId) || {
          name: item.name || "Unknown Medicine",
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += Number(item.quantity || 0);
        existing.revenue += Number(item.total || 0);
        medicineSales.set(medicineId, existing);
      });
    });

    const topMedicines = [...medicineSales.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, TOP_MEDICINES_LIMIT);

    const stockStatus = [
      { name: "Healthy", value: activeMedicines.filter((m) => Number(m.stock || 0) > LOW_STOCK_THRESHOLD).length },
      { name: "Low stock", value: lowStockItems.length },
      { name: "Out of stock", value: outOfStockItems.length },
    ];

    const expiryStatus = [
      { name: "Healthy", value: Math.max(activeMedicines.length - expiringSoonItems.length, 0) },
      { name: "Expiring soon", value: expiringSoonItems.length },
      { name: "Expired", value: expiredItems.length },
    ];

    const lowStockAlerts = lowStockItems
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 8)
      .map((medicine) => ({
        id: medicine._id,
        medicineName: medicine.medicineName,
        strength: medicine.strength,
        stock: medicine.stock,
        threshold: LOW_STOCK_THRESHOLD,
      }));

    const expiryAlerts = [...expiringSoonItems, ...expiredItems]
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 8)
      .map((medicine) => ({
        id: medicine._id,
        medicineName: medicine.medicineName,
        batchNumber: medicine.batchNumber,
        stock: medicine.stock,
        expiryDate: medicine.expiryDate,
        expired: new Date(medicine.expiryDate) < todayStart || medicine.status === "EXPIRED",
      }));

    return res.status(200).json({
      success: true,
      pharmacy: {
        id: pharmacy._id,
        shopName: pharmacy.shopName,
        ownerName: pharmacy.ownerName,
      },
      inventory: medicines.map((medicine) => ({
        id: medicine._id,
        medicineName: medicine.medicineName,
        strength: medicine.strength || "",
        batchNumber: medicine.batchNumber || "",
        stock: Number(medicine.stock || 0),
        price: Number(medicine.price || 0),
        expiryDate: medicine.expiryDate,
        status: medicine.status || "ACTIVE",
      })),
      stats: {
        totalMedicines: activeMedicines.length,
        totalStock,
        lowStock: lowStockItems.length,
        expiringSoon: expiringSoonItems.length,
        expiredMedicines: expiredItems.length,
        outOfStock: outOfStockItems.length,
        todaysSales: Number(todaySales[0]?.revenue || 0),
        todaysOrders: Number(todaySales[0]?.orders || 0),
        stockValuation,
      },
      charts: {
        salesTrend: [...salesByDay.values()],
        topMedicines,
        stockStatus,
        expiryStatus,
      },
      alerts: {
        lowStock: lowStockAlerts,
        expiry: expiryAlerts,
      },
      aiInsights,
      rules: {
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        expiringSoonDays: EXPIRING_SOON_DAYS,
      },
    });
  } catch (error) {
    console.error("PHARMACY DASHBOARD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load pharmacy dashboard",
    });
  }
};
