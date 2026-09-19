
 const mongoose = require("mongoose");

const EmergencyModel = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },

      coordinates: {
        type: [Number],
        required: true
      }
    },

    reason: {
      type: String,
      enum: [
        "ACCIDENT",
        "BREATHING_DIFFICULTY",
        "CHEST_PAIN",
        "UNCONSCIOUS",
        "SEVERE_PAIN",
        "OTHER"
      ],
      default: "OTHER"
    },

    message: {
      type: String,
      default: ""
    },

    // 🚑 Ambulance details
    ambulance: {
      vehicleNumber: {
        type: String,
        default: ""
      },

      driverName: {
        type: String,
        default: ""
      },

      driverPhone: {
        type: String,
        default: ""
      }
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "ACKNOWLEDGED",
        "AMBULANCE_ASSIGNED",
        "ON_THE_WAY",
        "ARRIVED",
        "PATIENT_PICKED",
        "COMPLETED",

        // Terminal, like COMPLETED, but reached by the patient calling the
        // request off rather than by the hospital finishing it. Not part of
        // the linear REQUESTED -> COMPLETED flow.
        "CANCELLED"
      ],
      default: "REQUESTED"
    },

    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    acknowledgedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    assignedAt: {
        type: Date,
        default: null
    },
  },
  {
    timestamps: true
  }
);

EmergencyModel.index({
  location: "2dsphere",
});

module.exports = mongoose.model("Emergency", EmergencyModel);