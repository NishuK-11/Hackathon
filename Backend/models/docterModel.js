const { mongoose } = require("mongoose");

const doctorSchema = new mongoose.Schema({

  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
    unique:true,
  },
  profile_photo: {
    type: String,
    default: ""
  },
  position:{
    type: String,
    required:true,
    trim: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  experience:{
    type: Number,
    min: 0
  },
  specialisations: {
    type: [String],
    default: []
  },

  profileCompleted:{
    type:Boolean,
    default:false
  },

  opdSchedule: [
    {
      day: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ]
      },
      from: String,
      to: String,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }
  ],

  onlineAvailability:{
    from:{type:String},
    to:{type:String}
  },

  registrationNumber:{
    type:String,
     unique:true,
      sparse:true
  },

  // ⭐ NEW FIELDS

  opdStarted:{
    type:Boolean,
    default:false
  },

  opdPaused: {
    type: Boolean,
    default: false
  },

  opdStartedAt: {
    type: Date,
    default: null
  },

  lastSeen:{
    type:Date
  },

  isActive:{
    type:Boolean,
    default:true
  },
  consultationFee:{
  type:Number,
  min:0
},
languages:{
  type:[String],
  default:[]
}

},{timestamps:true});

doctorSchema.index({ hospital: 1, department: 1 });

module.exports = mongoose.model('Doctor',doctorSchema);