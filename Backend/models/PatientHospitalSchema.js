const { default: mongoose } = require("mongoose");

const patientHospitalSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    firstVisit: {
      type: Date,
      default: Date.now,
    },

    lastVisit: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

patientHospitalSchema.index(
  { patientId: 1, hospitalId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "PatientHospital",
  patientHospitalSchema
);