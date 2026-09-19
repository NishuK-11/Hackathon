const express = require('express');
const auth = require('../middleware/auth');
const { ROLE } = require('../config/role');
const authorize = require('../middleware/authorize');
const { uploadReport,shareReports } = require('../controllers/reportController');
const { upload } = require('../middleware/uploadCloud');
const reportsRoute = express.Router();

reportsRoute.post('/upload-report',auth,authorize(ROLE.patient), upload.single("file"),uploadReport);
reportsRoute.patch('/share-reports',auth,authorize(ROLE.patient), shareReports);
module.exports=reportsRoute;