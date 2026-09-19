// models/patientModel.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      unique: true,        
      sparse: true  //allows multiple nulls
      //required: true,
    },

    age: {
      type: Number
    },
    
    dob: {
      type: Date
    },

    address: {
      line: String,
      city: String,
      state: String,
      pincode: String,

      // 🧭 ADD THIS (IMPORTANT)
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: {
          type: [Number], // [lng, lat]
          default: undefined
        }
      }
    },
    

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"]
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    phone_number:{
      type:String
    },
    profileImage: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
