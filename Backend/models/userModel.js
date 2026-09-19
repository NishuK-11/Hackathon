const mongoose = require('mongoose');
const { ROLE } = require('../config/role');
const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
   password:{ 
     type:String,
    default:null
   },
   phone_number:{
    type:Number,
    required:false
   },
   role: {
      type: String,
      enum: [ROLE.admin, ROLE.doctor, ROLE.patient, ROLE.pharmacy, ROLE.platform_admin],
      required:true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resetOtp: {
      type: String
    },
     otpExpires: {
      type: Number
    },
    isOtpVerified: {
      type: Boolean,
      default: false
  },
    hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: function () {
      return this.role !== ROLE.patient && this.role !== ROLE.pharmacy; // admin/doctor/subadmin ke liye required
    }
  },
},{timestamps:true})
module.exports = mongoose.model('User',userSchema);