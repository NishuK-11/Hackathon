const {
  getDoctorAnalytics,
} = require("../services/doctorAnalyticsService");

const getDoctorAnalyticsController = async (req, res) => {
  try {
    const days = Math.min(
      Math.max(Number(req.query.days) || 30, 7),
      30
    );

    const analytics = await getDoctorAnalytics(
      req.user.id,
      days
    );

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error(
      "[Doctor Analytics] Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDoctorAnalyticsController,
};