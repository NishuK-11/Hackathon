const { default: mongoose } = require("mongoose");

const referralModel = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    referredByHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    referredToHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    clinicalNotes: {
      type: String,
    },

    urgency: {
      type: String,
      enum: ["NORMAL", "URGENT", "EMERGENCY"],
      default: "NORMAL",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    referredAt: {
      type: Date,
      default: Date.now,
    },

    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Referral", referralModel);