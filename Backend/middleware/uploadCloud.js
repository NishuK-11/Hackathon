const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const patientStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medireach/patients",
    //resource_type: "auto",
  },
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medireach/reports", // Cloudinary folder
    resource_type: "auto" // image/pdf sab allow
  }
});

const hospitalStorage = new CloudinaryStorage({
  cloudinary,
  params:{
    folder:"medireach/hospitals"
  }
});

const patientUpload = multer({ storage: patientStorage });
const upload = multer({ storage });
const hospitalUpload = multer({
  storage:hospitalStorage
})
module.exports = {upload,hospitalUpload,patientUpload};
