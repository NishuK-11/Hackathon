const mongoose= require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  appointmentType:{
    type:String,
    enum:["online","offline"],
    default:"offline"
  },
  
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  token: {
    type: Number,
    //required: true
    default: null
  },

  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED","CURRENT", "SKIPPED","CANCELLED","COMPLETED"],
    default: "PENDING"
  },

  consultationStartedAt: {
    type: Date,
    default: null
  },

  consultationEndedAt: {
    type: Date,
    default: null
  },

  skippedAt: {
    type: Date,
    default: null
  },

  // Reason
    reason: {
      type: String,
      enum: [
        "General Consultation",
        "Follow-up",
        "Prescription Renewal",
        "Test Report Discussion",
        "Emergency",
        "Other",
      ],
      //required: true,
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },


  date: {
    type: Date,
    required: true
  }

}, { timestamps: true });

appointmentSchema.index({
  doctor: 1,
  date: 1,
  token: 1
});

module.exports = mongoose.model("Appointment", appointmentSchema);
