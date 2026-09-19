const data = require("../hospital_data2.json");
const HospitalModel = require("../model/HospitalModel");

const normalize = (value = "") =>
  value.toLowerCase().trim().replace(/\s+/g, "");

// ---------------- STATES
exports.getStates = async (req, res) => {
  try {
    const jsonStates = Object.keys(data);
    const dbStates = await HospitalModel.distinct("state");
    const states = [...new Set([...jsonStates, ...dbStates])];
    res.json(states);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ---------------- CITIES
exports.getCities = async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) return res.status(400).json({ message: "State required" });

    const normState = normalize(state);

    const jsonStateKey = Object.keys(data).find(
      key => normalize(key) === normState
    );

    const jsonCities = jsonStateKey
      ? Object.keys(data[jsonStateKey])
      : [];

    const dbCities = await HospitalModel.find({
      state: new RegExp(`^${state}$`, "i")
    }).distinct("city");

    const cities = [...new Set([...jsonCities, ...dbCities])];
    res.json(cities);

  } catch (e) {
    console.error("CITIES ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};

// ---------------- HOSPITALS
exports.getHospitals = async (req, res) => {
  try {
    const { state, city } = req.query;
    if (!state || !city)
      return res.status(400).json({ message: "State & city required" });

    const normState = normalize(state);
    const normCity = normalize(city);

    const jsonStateKey = Object.keys(data).find(
      key => normalize(key) === normState
    );

    const jsonCityKey =
      jsonStateKey &&
      Object.keys(data[jsonStateKey]).find(
        c => normalize(c) === normCity
      );

    const jsonHospitals =
      jsonStateKey && jsonCityKey
        ? data[jsonStateKey][jsonCityKey]
        : [];

    const dbHospitals = await HospitalModel.find({
      state: new RegExp(`^${state}$`, "i"),
      city: new RegExp(`^${city}$`, "i")
    });

    const dbNames = dbHospitals.map(h => h.name);

    const hospitals = [...new Set([...jsonHospitals, ...dbNames])];
    res.json(hospitals);

  } catch (e) {
    console.error("HOSPITAL ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};
