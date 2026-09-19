const Medicine = require("../models/Medicine");
const { analyzeMedicineImage } = require("../services/medicineAnalysisService");

exports.analyzeMedicine = async (req, res) => {

  try {

    console.log("=================================");
    console.log("💊 MEDICINE ANALYSIS REQUEST");
    console.log("=================================");


    // Check image
    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "Medicine image is required",
      });

    }


    console.log(
      "📁 Image:",
      req.file.originalname
    );

    console.log(
      "📦 Size:",
      req.file.size
    );

    console.log(
      "🖼️ Type:",
      req.file.mimetype
    );


    // Send image to Render AI API
    const result =
      await analyzeMedicineImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      if (!result) {
        return res.status(500).json({
            success: false,
            message: "AI API returned empty response",
        });
        }


        if (result.error) {

        console.error(
            "❌ AI API returned error:",
            result.error
        );

        return res.status(502).json({
            success: false,
            message: result.error,
        });

        }


        if (!result.answer) {

        return res.status(500).json({
            success: false,
            message: "AI API response does not contain answer",
        });

        }

    console.log(
      "📥 Raw AI result:",
      result
    );


    // Your Python API returns:
    //
    // {
    //   answer: "{ ...JSON... }"
    // }


    let medicineData;


    try {

      medicineData =
        typeof result.answer === "string"
          ? JSON.parse(result.answer)
          : result.answer;

    } catch (error) {

      console.error(
        "❌ Failed to parse AI JSON:",
        result.answer
      );


      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
      });

    }


    console.log(
      "✅ Parsed medicine data:"
    );

    console.log(
      medicineData
    );


    // Send clean response to React
    return res.status(200).json({

      success: true,

      data: medicineData,

    });


  } catch (error) {

    console.error(
      "❌ analyzeMedicine error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Medicine analysis failed",

    });

  }

};

exports.getAllUniqueMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.aggregate([
      {
        $match: {
          status: { $ne: "EXPIRED" },
          stock: { $gt: 0 }
        }
      },

      {
        $group: {
          _id: {
            medicineName: "$medicineName",
            strength: "$strength"
          },

          totalStock: {
            $sum: "$stock"
          },

          medicine: {
            $first: "$$ROOT"
          }
        }
      },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$medicine",
              {
                totalStock: "$totalStock"
              }
            ]
          }
        }
      },

      {
        $project: {
          batchNumber: 0,
          expiryDate: 0,
          stock: 0
        }
      },

      {
        $sort: {
          name: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines
    });

  } catch (error) {
    console.error("Get unique medicines error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
      error: error.message
    });
  }
};


exports.getAllMedicine = async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Get all medicines error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
      error: error.message,
    });
  }
};


