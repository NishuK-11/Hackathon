const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();

const auth =async (req,res,next)=>{
    try{
        const token = req.headers.authorization?.split(" ")[1]; 
        if(!token)  return res.status(401).json({msg:"No token provided"});
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await userModel.findById(decoded.id);
        next();
    }catch(error){
        return res.status(401).json({ msg: `Unauthorized:${error}` });
    }
}

module.exports = auth;