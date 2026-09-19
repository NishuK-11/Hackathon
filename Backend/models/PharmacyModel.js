const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true
    },

    shopName: {
      type: String,
      required: true,
      trim: true
    },

    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    city: String,
    state: String,
    pincode: String,

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

    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

pharmacySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Pharmacy", pharmacySchema);