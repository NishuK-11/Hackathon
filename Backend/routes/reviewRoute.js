const express = require("express");
const reviewRouter = express.Router();
const auth = require('../middleware/auth');
const {addReview,editReview,getHospitalReviews,} = require("../controllers/reviewController");

reviewRouter.post("/hospital/:hospitalId/review",auth,addReview);
reviewRouter.put("/hospital/:hospitalId/review",auth,editReview);
reviewRouter.get("/hospital/:hospitalId/review",auth,getHospitalReviews);

module.exports = reviewRouter;