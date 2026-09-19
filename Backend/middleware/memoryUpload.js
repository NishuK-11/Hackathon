const multer = require("multer");

const memoryStorage = multer.memoryStorage();

const memoryUpload = multer({
  storage: memoryStorage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = memoryUpload;