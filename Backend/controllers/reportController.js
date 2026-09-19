const patientModel = require("../models/patientModel");
const prescriptionModel = require("../models/prescriptionModel");
const reportModel = require("../models/reportModel");
const { redisClient } = require("../config/redisClient");
const { summaryCacheKey } = require("./medicalSummaryController");


exports.uploadReport = async(req,res)=>{
    try{
        const {title, type} = req.body;
        const patient = await patientModel.findOne({userId:req.user.id});
        const mime = req.file.mimetype;

        let fileType =  mime.includes("pdf") ? "pdf" : "image";
        
        const report = await reportModel.create({
            patient:patient._id,
            title: title,
            type: type,
            fileUrl:req.file.path,
            filePublicId:req.file.filename,
            fileType
        });

        // A new report changes the record the AI summary is built from.
        await redisClient.del(summaryCacheKey(patient._id));

        res.status(200).json({
            message:"Report uploaded successfully",
            report
        })
    } catch(error){
         console.log("UPLOAD ERROR =>", error);
        res.status(500).json({message:`Upload failed ${error}`});
    }
}

exports.shareReports = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, reportIds } = req.body;

    const patient = await patientModel.findOne({
      userId: patientId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID required"
      });
    }

    if (!reportIds || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one report"
      });
    }

    const result = await reportModel.updateMany(
      {
        _id: { $in: reportIds },
        patient: patient._id
      },
      {
        $addToSet: {
          sharedWithDoctors: doctorId
        },
        $set: {
          isPrivate: false
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Reports shared successfully",
      sharedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Share Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: `Failed to share reports ${error.message}`
    });
  }
};

exports.sharePrescriptions = async (req, res) => {
  try {
    const patient = await patientModel.findOne({
      userId: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const { doctorId, prescriptionIds } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID required"
      });
    }

    if (!prescriptionIds || prescriptionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select prescriptions"
      });
    }

    await prescriptionModel.updateMany(
      {
        _id: { $in: prescriptionIds },
        patientId: patient._id
      },
      {
        $addToSet: {
          sharedWithDoctors: doctorId
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Prescriptions shared successfully"
    });

  } catch (error) {
    console.log("SHARE PRESCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

