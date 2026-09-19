const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const patientModel = require('../models/patientModel.js');
const userModel = require('../models/userModel');
const { ROLE } = require('../config/role.js');
const PharmacyModel = require('../models/PharmacyModel.js');
const docterModel = require('../models/docterModel.js');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user 
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    // 2️⃣ Check active (for doctor)
    if (user.role === ROLE.doctor && !user.isActive) {
      return res.status(403).json({
        success: false,
        msg: "Doctor account not activated"
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password"
      });
    }
    
    let patientId = null;
    if (user.role === ROLE.patient) {
      const patient = await patientModel.findOne({ userId: user._id });
      patientId = patient?._id;
    }
    let pharmacyId = null;
    if (user.role === ROLE.pharmacy) {
      const pharmacy = await PharmacyModel.findOne({ userId: user._id });
      pharmacyId = pharmacy?._id;
    }

    let doctorId = null;
    if(user.role===ROLE.doctor){
      const doctor = await docterModel.findOne({userId:user._id});
      doctorId = doctor?._id;
    }


    // 4️⃣ Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        hospitalId: user.hospitalId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Success
    return res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      role: user.role,
        
      user: {
        id: user._id,
        name: user.name,
        patientId,
        doctorId,
        email: user.email
      },
      hospitalId: user.hospitalId
    });
  } catch (error) {
    console.error(error); // ✅ Debug purpose
    return res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (!user.isOtpVerified)
      return res.status(403).json({ message: "OTP verification required" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.isOtpVerified = false; // OTP ek baar ka hi
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Reset password error",
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Base response (sabke liye)
    const response = {
      success: true,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };

    // 👉 hospitalId sirf doctor / admin / reception ke liye
    if (
      user.role === ROLE.doctor ||
      user.role === ROLE.admin
    ) {
      response.hospitalId = user.hospitalId;
    }

    return res.status(200).json(response);

  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};


module.exports = { loginUser ,resetPassword,loginUser,getProfile};
