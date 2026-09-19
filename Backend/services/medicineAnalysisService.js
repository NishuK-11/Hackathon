const axios = require("axios");
const FormData = require("form-data");

const MEDICINE_ANALYSIS_URL =
  "https://medical-image-analysis-rh8u.onrender.com/analyze-medicine";


const MEDICINE_QUESTION = `
Analyze this medicine image and return ONLY valid JSON.

Use exactly these fields:

{
    "medicineName": "",
    "strength": "",
    "batchNumber": "",
    "manufacturingDate": "",
    "expiryDate": "",
    "price": 0,
    "category": "",
    "manufacturer": "",
    "description": ""
}

Rules:
- medicineName: exact medicine name visible on the package
- strength: active ingredients and their strengths
- batchNumber: batch number visible on the package
- manufacturingDate: manufacturing date visible on the package
- expiryDate: expiry date visible on the package
- price: MRP/price visible on the package as a number
- category: medicine category/use category
- manufacturer: manufacturer name visible on the package
- description: short description of the medicine and its use
- If any field is not visible, return null.
- Do not add markdown.
- Do not add explanations outside JSON.
`;


const analyzeMedicineImage = async (imageBuffer, originalName,mimetype) => {

  try {
    console.log("📤 Sending medicine image to AI API...");

    console.log("Buffer info:", {
      isBuffer: Buffer.isBuffer(imageBuffer),
      size: imageBuffer?.length,
      filename: originalName,
      mimetype: mimetype,
    });
    const formData = new FormData();
    console.log("📦 Multipart headers:");

    console.log(
      formData.getHeaders()
    );

    // Image
    formData.append(
      "image",
      imageBuffer,
      {
        filename: originalName || "medicine.jpg",
        contentType: mimetype || "image/jpeg",
        knownLength:imageBuffer.length,
      }
    );

    // Question
    formData.append(
      "question",
      MEDICINE_QUESTION
    );


    console.log("📤 Sending medicine image to AI API...");


    const response = await axios.post(
      MEDICINE_ANALYSIS_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },

        maxBodyLength: Infinity,
        maxContentLength: Infinity,

        timeout: 120000,
      }
    );


    console.log(
      "📥 AI API response:",
      response.data
    );

    console.log(
      "📥 AI API response:",
      response.data
    );


    return response.data;

  } catch (error) {

    console.error(
      "❌ Medicine analysis service error:"
    );
     console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      error.response?.data ||
      error.message
    );

    throw new Error(
      error.response?.data?.error ||
      "Medicine image analysis failed"
    );
  }

};


module.exports = {
  analyzeMedicineImage,
};