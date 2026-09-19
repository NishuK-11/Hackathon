const HospitalModel = require("../models/HospitalModel");
const reviewModel = require("../models/reviewModel");

const updateHospitalRating = async (hospitalId) => {
  const reviews = await reviewModel.find({
    hospital: hospitalId,
  });
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    ) / totalReviews;
  await HospitalModel.findByIdAndUpdate(
    hospitalId,
    {
      averageRating:
        totalReviews === 0
          ? 0
          : Number(averageRating.toFixed(1)),
      totalReviews,
    }
  );
};

module.exports=updateHospitalRating;