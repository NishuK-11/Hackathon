const { default: mongoose } = require("mongoose");
const { ROLE } = require("../config/role");

const reportSchema = mongoose.Schema({
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Patient",
        required:true,
    },
    title:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum:["LAB","XRAY","MRI","OTHER"],
        required:true
    },
    filePublicId:{
        type:String,
        required:true
    },
    fileUrl:{
        type:String,
        required: true
    },
    fileType: {
        type: String,
        enum: ["image", "pdf"],
        required: true
    },

    uploadedBy:{
        type:String,
        enum:[ROLE.admin,ROLE.patient],
        default:ROLE.admin
    },
    sharedWithDoctors:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor"
        }
    ],
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    },
    isPrivate:{
        type:Boolean,
        default:true
    }
},{timestamps:true});


module.exports = mongoose.model("Reports",reportSchema);