const reviewModel = require("../models/reviewModel");
const HospitalModel = require("../models/HospitalModel");
const patientModel = require("../models/patientModel");
const updateHospitalRating = require("../helper/updateHospitalRatingHelper");
const { ROLE } = require("../config/role");

const addReview = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const hospitalId = req.params.hospitalId;
    const patient = await patientModel.findOne({
        userId: req.user.id,
    });
    if (!patient) {
        return res.status(404).json({
            message: "Patient not found",
        });
    }

    const existingReview = await reviewModel.findOne({
        hospital: hospitalId,
        patient: patient._id,
    });

    if(existingReview){
    return res.status(400).json({
        success:false,
        message:"You have already reviewed this hospital."
    });
}

    const review = await reviewModel.create({
      hospital: hospitalId,
      patient: patient._id,
      username: req.user.name,
      rating,
      feedback,
    });
    await updateHospitalRating(hospitalId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



const getHospitalReviews = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;

    const hospital = await HospitalModel.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const reviews = await reviewModel.find({
      hospital: hospitalId,
    })
    .select("username rating feedback createdAt")
    .sort({ createdAt: -1 });

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    let myReview = null;

    if (req.user?.role === ROLE.patient) {
      const patient = await patientModel.findOne({
        userId: req.user.id,
      });

      if (patient) {
        myReview = await reviewModel
          .findOne({
            hospital: hospitalId,
            patient: patient._id,
          })
          .select("rating feedback createdAt");
      }
    }


    return res.status(200).json({
      success: true,
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        averageRating: hospital.averageRating,
        totalReviews: hospital.totalReviews,
      },
      ratingDistribution,
      reviews,
      myReview
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editReview = async (req, res) => {

    const { rating, feedback } = req.body;

    const hospitalId = req.params.hospitalId;

    const patient = await patientModel.findOne({
        userId: req.user.id,
    });

    const review = await reviewModel.findOne({
        hospital: hospitalId,
        patient: patient._id,
    });

    if (!review) {
        return res.status(404).json({
            message: "Review not found",
        });
    }
    review.rating = rating;
    review.feedback = feedback;
    await review.save();
    await updateHospitalRating(hospitalId);
    res.status(200).json(review);
};

module.exports = {
  getHospitalReviews,
  addReview,
  editReview
};