const { ROLE } = require("../config/role");
const docterModel = require("../model/docterModel");


const isDoctor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== ROLE.doctor)
    return res.status(403).json({ message: "Doctor access only" });
  next();
};


const profileNotCompleted  = async(req,res,next)=>{
  const doctor = await docterModel.findOne({ userId: req.user.id });

  // if (doctor && doctor.profileCompleted) {
  //   return res.status(403).json({
  //     message: "Profile already completed"
  //   });
  // }
  next();
}

const profileCompletedOnly   = async(req,res,next)=>{
  const doctor = await docterModel.findOne({ userId: req.user.id });

  if (!doctor || !doctor.profileCompleted) {
    return res.status(403).json({
      message: "Complete profile first"
    });
  }

  next();
}

module.exports = {isDoctor,profileNotCompleted,profileCompletedOnly};