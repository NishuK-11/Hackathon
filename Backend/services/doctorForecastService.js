const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/docterModel");

const MODEL_FILE = path.join(
  __dirname,
  "..",
  "ml",
  "models",
  "doctor_forecast_model.pkl"
);

const PYTHON_FILE = path.join(
  __dirname,
  "..",
  "ml",
  "predict_doctor_forecast.py"
);

// ---------------------------------------------------------
// Find logged-in doctor's MongoDB _id
// ---------------------------------------------------------
const getDoctorId = async (userId) => {
  const doctor = await Doctor.findOne({
    userId,
  }).select("_id");

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor._id;
};

// ---------------------------------------------------------
// Get real appointment history from MongoDB
// ---------------------------------------------------------
const getHistoricalAppointments = async (
  doctorId,
  days = 90
) => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(
    startDate.getDate() - (days - 1)
  );
  startDate.setHours(0, 0, 0, 0);

  const history = await Appointment.aggregate([
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

        appointments: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return history.map((item) => ({
    date: item._id,
    appointments: item.appointments,
  }));
};

// ---------------------------------------------------------
// Run Python prediction script
// ---------------------------------------------------------
const runPythonForecast = (history) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(MODEL_FILE)) {
      reject(
        new Error(
          `Trained model not found: ${MODEL_FILE}`
        )
      );
      return;
    }

    if (!fs.existsSync(PYTHON_FILE)) {
      reject(
        new Error(
          `Prediction script not found: ${PYTHON_FILE}`
        )
      );
      return;
    }

    const pythonCommand =
      process.platform === "win32"
        ? "python"
        : "python3";

    const pythonProcess = spawn(
      pythonCommand,
      [
        PYTHON_FILE,
      ],
      {
        stdio: [
          "pipe",
          "pipe",
          "pipe",
        ],
      }
    );

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on(
      "data",
      (chunk) => {
        stdout += chunk.toString();
      }
    );

    pythonProcess.stderr.on(
      "data",
      (chunk) => {
        stderr += chunk.toString();
      }
    );

    pythonProcess.on(
      "error",
      (error) => {
        reject(error);
      }
    );

    pythonProcess.on(
      "close",
      (code) => {
        if (code !== 0) {
          reject(
            new Error(
              stderr ||
                `Python process exited with code ${code}`
            )
          );

          return;
        }

        try {
          const result = JSON.parse(
            stdout
          );

          resolve(result);
        } catch (error) {
          reject(
            new Error(
              `Invalid ML response: ${error.message}\n${stdout}`
            )
          );
        }
      }
    );

    pythonProcess.stdin.write(
      JSON.stringify({
        history,
        modelFile: MODEL_FILE,
      })
    );

    pythonProcess.stdin.end();
  });
};

// ---------------------------------------------------------
// Main forecast function
// ---------------------------------------------------------
const getDoctorForecast = async (userId) => {
  const doctorId = await getDoctorId(
    userId
  );

  // Real history from MongoDB
  const history =
    await getHistoricalAppointments(
      doctorId,
      90
    );

  // Never create fake predictions when data is insufficient
  if (history.length < 21) {
    return {
      success: true,
      available: false,
      historicalDays: history.length,
      minimumRequiredDays: 21,
      message:
        "Not enough real historical appointment data for reliable ML forecasting.",
    };
  }

  const result =
    await runPythonForecast(
      history
    );

  return {
    ...result,
    success:
      result.success !== false,
    available: true,
    historicalDays: history.length,
  };
};

module.exports = {
  getDoctorForecast,
};