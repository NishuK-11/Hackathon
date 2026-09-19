const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    strength: {
      type: String,
      trim: true,
    },

    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },

   manufacturingDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    category: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    addedVia: {
      type: String,
      enum: ["MANUAL", "OCR"],
      default: "MANUAL",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE"
    }

  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ pharmacyId: 1 });
medicineSchema.index({ pharmacyId: 1, batchNumber: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);