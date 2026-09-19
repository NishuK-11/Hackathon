const { ROLE } = require("../config/role");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const adminLogin = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const admin = await userModel.findOne({email});
        if(!admin){
            return res.status(401).json({
                success:false,
                message:"aisa koi email hi nhi h user model mei",
            })

        }
        if(admin.role!=ROLE.platform_admin){
            return res.status(403).json({
                success:false,
                message:"Access Denied",
            })
        }

        const isMatch = await bcrypt.compare(
            password,admin.password
        )
         if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials password shi bbhar",
            });
        }
        const token = jwt.sign(
            {
                userId:admin._id,
                role:admin.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d",
            }
        );
         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                
            },
        });
    }catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = {
    adminLogin
}