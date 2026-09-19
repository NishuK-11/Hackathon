const cloudinary_js_config  = require("../config/cloudinary");

const getSignedUrl = (publicId)=>{
   return cloudinary_js_config.url(publicId,{
      secure:true,
      sign_url:true
   });
};

module.exports = getSignedUrl;

