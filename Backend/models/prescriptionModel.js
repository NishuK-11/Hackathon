const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String, // e.g. 500mg
  },
  frequency: {
    type: String, // e.g. OD, BD, TDS, etc.
  },
  duration: {
    type: String, // e.g. 5 days
  },
  instructions: {
    type: String // e.g. After food
  }
});

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  complaints: [
    {
      type: String
    }
  ],

  diagnosis: [
    {
      type: String
    }
  ],
  appointmentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Appointment",
    required:true
  },

  sharedWithDoctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor"
    }
  ],

  medicines: [medicineSchema],
  tests: [
    {
      type: String
    }
  ],

  advice: {
    type: String
  },

  attachments: [
    {
      type: String // image / pdf url
    }
  ],

  followUpDate: {
    type: Date
  }

}, { timestamps: true }); // createdAt + updatedAt auto

module.exports = mongoose.model("Prescription", prescriptionSchema);
