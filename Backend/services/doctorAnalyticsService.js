const Appointment = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");

const getDoctorAnalytics = async (userId, days = 30) => {
  // -----------------------------------------
  // Find logged-in doctor's MongoDB document
  // -----------------------------------------
  const doctor = await docterModel
    .findOne({ userId })
    .select("_id");

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const doctorId = doctor._id;

  // -----------------------------------------
  // Date range
  // -----------------------------------------      
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // -----------------------------------------
  // Appointment trend
  // -----------------------------------------
  const appointmentTrend = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        total: {
          $sum: 1,
        },
        completed: {
          $sum: {
            $cond: [
              { $eq: ["$status", "COMPLETED"] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  // -----------------------------------------
  // Appointment status
  // -----------------------------------------
  const appointmentStatus = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  // -----------------------------------------
  // Patient trend
  //
  // New patient:
  // first ever appointment falls inside period
  //
  // Returning patient:
  // patient had appointment before period
  // -----------------------------------------
  const patientHistory = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
    {
      $group: {
        _id: "$patient",
        firstAppointmentDate: {
          $first: "$date",
        },
      },
    },
    {
      $match: {
        firstAppointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $count: "newPatients",
    },
  ]);

  const newPatients =
    patientHistory.length > 0
      ? patientHistory[0].newPatients
      : 0;

// new 
const patientVisits = await Appointment.aggregate([
  {
    $match: {
      doctor: doctorId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  },
  {
    $group: {
      _id: "$patient",
      visitCount: { $sum: 1 },
    },
  },
]);

const returningPatients = patientVisits.filter(
  (patient) => patient.visitCount > 1
).length;

  const totalUniquePatients = await Appointment.distinct(
    "patient",
    {
      doctor: doctorId,
    }
  );

  // -----------------------------------------
  // Consultation analytics
  // -----------------------------------------
  const consultationAnalytics = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        status: "COMPLETED",
        consultationStartedAt: {
          $ne: null,
        },
        consultationEndedAt: {
          $ne: null,
        },
      },
    },
    {
      $project: {
        durationMinutes: {
          $divide: [
            {
              $subtract: [
                "$consultationEndedAt",
                "$consultationStartedAt",
              ],
            },
            60000,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        averageConsultationMinutes: {
          $avg: "$durationMinutes",
        },
        totalCompletedConsultations: {
          $sum: 1,
        },
      },
    },
  ]);

  const consultation =
    consultationAnalytics[0] || {
      averageConsultationMinutes: 0,
      totalCompletedConsultations: 0,
    };

  // -----------------------------------------
  // Period totals
  // -----------------------------------------
  const periodTotals = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },

        completed: {
          $sum: {
            $cond: [
              { $eq: ["$status", "COMPLETED"] },
              1,
              0,
            ],
          },
        },

        cancelled: {
          $sum: {
            $cond: [
              { $eq: ["$status", "CANCELLED"] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const totals = periodTotals[0] || {
    total: 0,
    completed: 0,
    cancelled: 0,
  };

  const completionRate =
    totals.total > 0
      ? Number(
          (
            (totals.completed / totals.total) *
            100
          ).toFixed(2)
        )
      : 0;

  const cancellationRate =
    totals.total > 0
      ? Number(
          (
            (totals.cancelled / totals.total) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    period: {
      days,
      startDate,
      endDate,
    },

    appointmentTrend,

    appointmentStatus,

    patientAnalytics: {
  newPatients,
  uniquePatients: totalUniquePatients.length,
  returningPatients,
},

    consultationAnalytics: {
      averageConsultationMinutes: Number(
        Number(
          consultation.averageConsultationMinutes || 0
        ).toFixed(2)
      ),
      totalCompletedConsultations:
        consultation.totalCompletedConsultations || 0,
    },

    performance: {
      totalAppointments: totals.total,
      completedAppointments: totals.completed,
      cancelledAppointments: totals.cancelled,
      completionRate,
      cancellationRate,
    },
  };
};

module.exports = {
  getDoctorAnalytics,
};