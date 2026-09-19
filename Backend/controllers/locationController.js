const HospitalModel = require("../models/HospitalModel");

// socket.on("location-update",async({lat,lng})=>{
//     const hospitalId = socket.hospitalId;
//     if(!hospitalId) return;
//     const hospital = await HospitalModel.findById(hospitalId);
//     const result = await calculateDistanceAndETA(
//         {lat,lng},
//         {
//             lat:hospital.latitude,
//             lng:hospital.longitude
//         }
//     );
//     socket.emit("route-update",{
//         distance:result.distance,
//         eta:result.duration
//     });
// });


const axios = require("axios");
// ✅ Route + distance + ETA
const getRouteToHospital = async (req, res) => {
  try {
    const { patientLat, patientLng, hospitalId } = req.body;

    // 1️⃣ get hospital from DB
    const hospital = await HospitalModel.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    const [hLng, hLat] = hospital.location.coordinates;

    const apiKey = process.env.ORS_API_KEY;

    // 2️⃣ Get route from ORS
    const routeRes = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [patientLng, patientLat],
          [hLng, hLat]
        ]
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    // 3️⃣ Extract distance + duration
    const summary =
      routeRes.data.features[0].properties.summary;

    const distanceKm = (summary.distance / 1000).toFixed(2);
    const durationMin = Math.round(summary.duration / 60);

    res.json({
      success: true,
      hospital: hospital.name,
      distance: distanceKm + " km",
      duration: durationMin + " mins",
      routeGeoJSON: routeRes.data
    });

  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      success: false,
      msg: "Route fetch failed",
      error: err.message
    });
  }
};
module.exports = {getRouteToHospital};