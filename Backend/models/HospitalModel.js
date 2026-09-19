const Mongoose = require('mongoose')

const HospitalSchema= new Mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:
        true
    },
     hospitalLicense: {
        type: String,
        required: true,
        unique: true
    },
    phone_number: {
    type: String,
    required: true
    },
    city:{
        type:String,
         required:true,
         trim:true
    },
    state:{
        type:String,
         required:true,
         trim:true
    },
    pincode:{
        type:Number,
         required:true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },
    isActive:{
        type:Boolean,
        default:false
    },
    description:{
    type:String,
    default:""
    },

    address:{
        type:String,
        default:""
    },

    logo:{
        type:String,
        default:""
    },

    coverImage:{
        type:String,
        default:""
    },

    galleryImages:{
        type:[String],
        default:[]
    },

    facilities:{
        type:[String],
        default:[]
    },

    timings:{
        monday:String,
        tuesday:String,
        wednesday:String,
        thursday:String,
        friday:String,
        saturday:String,
        sunday:String
    },

    averageRating: {
        type: Number,
        default: 0,
    },

    totalReviews: {
        type: Number,
        default: 0,
    },

    profileCompleted:{
        type:Boolean,
        default:false
    }
},{ timestamps: true })

HospitalSchema.index({ location: "2dsphere" });


module.exports=  Mongoose.model('Hospital',HospitalSchema);