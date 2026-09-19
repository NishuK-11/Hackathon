const Order = require("../models/orderSchema");
const Medicine = require("../models/Medicine");

const HISTORY_DAYS = 30;
const FORECAST_DAYS = 7;
const SAFETY_FACTOR = 1.2;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDay = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const { spawnSync } = require("child_process");

const runXGBoost = (histories) => {
  const input = JSON.stringify({ histories });
  const candidates = process.env.PYTHON_PATH
    ? [process.env.PYTHON_PATH]
    : process.platform === "win32"
      ? ["python", "py"]
      : ["python3", "python"];

  for (const executable of candidates) {
    try {
      const result = spawnSync(executable, [require("path").join(__dirname, "pharmacyDemandXGBoost.py")], {
        input,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 4,
      });
      if (result.status === 0 && result.stdout) {
        const parsed = JSON.parse(result.stdout);
        return parsed.results || {};
      }
    } catch (_) {
      // Try the next Python executable candidate.
    }
  }

  return {};
};

const movingAverage = (values, window = 7) => {
  const recent = values.slice(-window);
  if (!recent.length) return 0;
  return recent.reduce((sum, value) => sum + value, 0) / recent.length;
};

const getTrendLabel = (slope, baseline) => {
  const tolerance = Math.max(0.05, baseline * 0.05);
  if (slope > tolerance) return "Increasing";
  if (slope < -tolerance) return "Decreasing";
  return "Stable";
};

const buildHistory = (orders, medicineId, startDate) => {
  const values = Array(HISTORY_DAYS).fill(0);

  orders.forEach((order) => {
    const dayIndex = Math.floor(
      (startOfDay(order.createdAt) - startDate) / (24 * 60 * 60 * 1000)
    );

    if (dayIndex < 0 || dayIndex >= HISTORY_DAYS) return;

    (order.items || []).forEach((item) => {
      if (item.medicineId?.toString() !== medicineId.toString()) return;
      values[dayIndex] += Number(item.quantity || 0);
    });
  });

  return values;
};

const predictWithFallback = (values) => {
  const baseline = movingAverage(values);
  return {
    predictions: Array(FORECAST_DAYS).fill(baseline),
    model: "7-day Moving Average",
    slope: 0,
  };
};

exports.buildPharmacyDemandForecast = async (pharmacyId) => {
  const now = new Date();
  const today = startOfDay(now);
  const historyStart = new Date(today);
  historyStart.setDate(historyStart.getDate() - (HISTORY_DAYS - 1));
  const queryStart = new Date(historyStart);
  queryStart.setHours(0, 0, 0, 0);

  const [medicines, orders] = await Promise.all([
    Medicine.find({
      pharmacyId,
      status: { $ne: "EXPIRED" },
    })
      .select("medicineName strength stock price expiryDate")
      .lean(),
    Order.find({
      shopId: pharmacyId,
      status: "delivered",
      createdAt: { $gte: queryStart, $lte: now },
    })
      .select("items createdAt")
      .lean(),
  ]);

  const histories = {};
  medicines.forEach((medicine) => {
    histories[medicine._id.toString()] = buildHistory(orders, medicine._id, queryStart);
  });
  const xgboostResults = runXGBoost(histories);

  const forecasts = medicines.map((medicine) => {
    const history = histories[medicine._id.toString()];
    const totalHistoricalDemand = history.reduce((sum, value) => sum + value, 0);
    const activeSalesDays = history.filter((value) => value > 0).length;
    const xgb = xgboostResults[medicine._id.toString()];
    const fallback = predictWithFallback(history);
    const predictions = xgb && !xgb.useFallback ? xgb.predictions : fallback.predictions;
    const model = xgb && !xgb.useFallback ? xgb.model : fallback.model;
    const slope = activeSalesDays >= 2
      ? ((history[history.length - 1] - history[0]) / Math.max(1, history.length - 1))
      : 0;

    const predicted7DayDemand = Math.max(
      0,
      Math.round(predictions.reduce((sum, value) => sum + value, 0))
    );
    const predictedDailyDemand = predicted7DayDemand / FORECAST_DAYS;
    const currentStock = Number(medicine.stock || 0);
    const coverageDays = predictedDailyDemand > 0
      ? currentStock / predictedDailyDemand
      : null;

    let risk = "Low";
    if (predicted7DayDemand > currentStock) risk = "High";
    else if (predicted7DayDemand > currentStock * 0.75) risk = "Medium";

    const recommendedRestock = Math.max(
      0,
      Math.ceil(predicted7DayDemand * SAFETY_FACTOR - currentStock)
    );

    const baseline = movingAverage(history);

    return {
      medicineId: medicine._id,
      medicineName: medicine.medicineName,
      strength: medicine.strength || "",
      currentStock,
      predicted7DayDemand,
      predictedDailyDemand: Number(predictedDailyDemand.toFixed(1)),
      recommendedRestock,
      risk,
      trend: getTrendLabel(slope, baseline),
      coverageDays: coverageDays === null ? null : Number(coverageDays.toFixed(1)),
      model,
      trainingSource: xgb?.trainingSource || "fallback",
      historyDays: HISTORY_DAYS,
      activeSalesDays,
      totalHistoricalDemand,
      forecast: predictions.map((value, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() + index + 1);
        return {
          date: formatDay(day),
          demand: Number(value.toFixed(1)),
        };
      }),
    };
  });

  const ranked = forecasts
    .filter((item) => item.totalHistoricalDemand > 0 || item.currentStock > 0)
    .sort((a, b) => {
      if (a.risk !== b.risk) {
        const rank = { High: 0, Medium: 1, Low: 2 };
        return rank[a.risk] - rank[b.risk];
      }
      return b.predicted7DayDemand - a.predicted7DayDemand;
    })
    .slice(0, 8);

  return {
    generatedAt: now,
    historyDays: HISTORY_DAYS,
    forecastDays: FORECAST_DAYS,
    safetyFactor: SAFETY_FACTOR,
    forecasts: ranked,
    summary: {
      highRisk: ranked.filter((item) => item.risk === "High").length,
      mediumRisk: ranked.filter((item) => item.risk === "Medium").length,
      increasingDemand: ranked.filter((item) => item.trend === "Increasing").length,
      suggestedRestockUnits: ranked.reduce(
        (sum, item) => sum + item.recommendedRestock,
        0
      ),
    },
  };
};
