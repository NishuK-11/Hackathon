const dotenv = require('dotenv');
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HospitalModel = require('../models/HospitalModel');
dotenv.config();
const fs = require("fs");
const path = require("path");
const { ROLE } = require('../config/role');
const sendEmail = require('../utils/sendEmail');
const docterModel = require('../models/docterModel');
const departmentModel = require('../models/departmentModel');
const appointmentModel = require('../models/appointmentModel');
const patientModel = require('../models/patientModel');
const { redisClient } = require('../config/redisClient');
const PharmacyModel = require('../models/PharmacyModel');
const PatientHospitalSchema = require('../models/PatientHospitalSchema');
const EmergencyModel = require('../models/EmergencyModel');
const {
  ACTIVE_EMERGENCY_STATUSES,
  EMERGENCY_TRANSITIONS,
} = require('../config/emergencyStatus');

const registerHospital = async (req, res) => {
    try {
        
        const { name, city, email, state, pincode, hospitalLicense,phone_number, lat, lng ,adminName, adminEmail, adminPassword} = req.body;

        const existingHospital = await HospitalModel.findOne({ hospitalLicense });
        if (existingHospital) {
            return res.status(400).json({
                success: false,
                msg: "Hospital already exists"
            });
        }

        const hospital = await HospitalModel.create({
            name,
            city,
            email,
            state,
            pincode,
            hospitalLicense,
            phone_number,
            location: {
                type: 'Point',
                coordinates: [lng, lat]  // MongoDB uses [lng, lat]
            }
        });
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin=  await userModel.create({
            name:adminName,
            email:adminEmail,
            password:hashedPassword,
            role:ROLE.admin,
            hospitalId:hospital._id 
        }) 

        const accessToken = jwt.sign({
            id:admin._id,email:admin.email, role:admin.role,hospitalId:hospital
        },process.env.JWT_SECRET,{expiresIn:"1d"});

        res.status(201).json({
            success: true,
            msg: "Hospital & Admin registered successfully",
            data: { hospital, admin },
            accessToken,
            tokenType:"Bearer"
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Hospital registration failed",
            error: e.message
        });
    }
};

const updateHospitalProfile = async(req,res)=>{
  console.log(req.body);

  console.log("FILES:");
  console.log(req.files);
  try{
    const hospitalId = req.user.hospitalId;

    const updateData = {
      description: req.body.description,
      address:req.body.address,
      facilities:JSON.parse(req.body.facilities || "[]"),
      timings:JSON.parse(req.body.timings || "{}")
    };
    if(req.files?.logo){
      updateData.logo=req.files.logo[0].path;
    }

    if(req.files?.coverImage){
      updateData.coverImage=
      req.files.coverImage[0].path;
    }

    if (req.files?.galleryImages) {
      updateData.galleryImages =
        req.files.galleryImages.map(
          img => img.path
        );
    }
    const isComplete =
      updateData.description &&
      updateData.address &&
      updateData.facilities?.length > 0 &&
      Object.keys(updateData.timings || {}).length > 0 &&
      updateData.logo &&
      updateData.coverImage &&
      updateData.galleryImages?.length > 0;

    updateData.profileCompleted = !!isComplete;
console.log("hospitalId:", hospitalId);
    const hospital =
      await HospitalModel.findByIdAndUpdate(
        hospitalId,
        updateData,
        { new: true }
      );

    res.status(200).json({
      success:true,
      data:hospital,
      profileCompleted:hospital.profileCompleted
    })
  }catch(error){
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}



const getHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const hospital = await HospitalModel.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await HospitalModel.findById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getStats = async(req,res)=>{
  console.log("entered");
  try{
    const hospitalId = req.user.hospitalId;
    const countDoctor = await userModel.countDocuments({
      hospitalId:hospitalId,
      role:"DOCTOR"
    });
    const countDepartment = await departmentModel.countDocuments({
      hospital:hospitalId,
    })
    const countAppointment= await appointmentModel.countDocuments({
      hospitalId:hospitalId,
    })
    const countPatient = await patientModel.countDocuments({
      hospitalId:hospitalId
    })
    res.status(200).json({
      success:true,
      countDoctor,
      countDepartment,
      countAppointment,
      countPatient
    });
    console.log("left")
  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const approveHospital = async (req, res) => {
    try {
        const hospitalId = req.params.id;

        const hospital = await HospitalModel.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        // check duplicate user
        const existingUser = await userModel.findOne({ email: hospital.email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists for this hospital"
            });
        }

        // approve hospital
        hospital.status = "approved";
        hospital.isActive = true;
        await hospital.save();

        // create admin
        await userModel.create({
            name: `${hospital.name} Admin`,
            email: hospital.email,
            role: ROLE.admin,
            hospitalId: hospital._id,
            isActive: true
        });

        // send email
        await sendEmail({
            to: hospital.email,
            subject: "Medireach Account Approved 🎉",
            text: `
Your hospital has been approved.

Login here:
http://localhost:3000/login
            `
        });

        res.status(200).json({
            success: true,
            message: "Hospital approved successfully",

        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Approval failed",
            error: e.message
        });
    }
};

const getAllHospitals = async(req,res)=>{
  try{
    const hospitals = await HospitalModel.find();
    res.status(200).json({
            success: true,
            data: hospitals
        });
  }catch(e){
     res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
            error: e.message
        });
  }
}

const getAllHospitalSearch = async (req, res) => {
  try {
    const { search } = req.query;

    let hospitals;

    if (search && search.trim() !== "") {
      hospitals = await HospitalModel.find({
        name: {
          $regex: `^${search.trim()}`,
          $options: "i"
        }
      });
    } else {
      hospitals = await HospitalModel.find();
    }

    res.status(200).json({
      success: true,
      data: hospitals
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals",
      error: e.message
    });
  }
};

const getHospitalsQuery = async (req, res) => {
    try {
        const { status } = req.query;
        console.log("REQ QUERY:", req.query);
        let filter = {};

        if (status) {
            filter.status = status;
        }
console.log("FILTER:", filter);
        const hospitals = await HospitalModel.find(filter);
        res.status(200).json({
            success: true,
            data: hospitals
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
            error: e.message
        });
    }
};

const getHospitals = async (req, res) => {
  try {
    const { state, city, lat, lng, radius = 10 } = req.query;
    // normal filter
    let matchStage = {};

    if (state) {//         regex → case insensitive match// "bhagalpur" == "Bhagalpur"
      matchStage.state = { $regex: `^${state}$`, $options: "i" };
    }

    if (city) {
      matchStage.city = { $regex: `^${city}$`, $options: "i" };
    }

    let cacheKey = "";
    if (lat && lng) {
        cacheKey = `hospital:nearby:${lat}:${lng}:${radius}:${state || "all"}:${city || "all"}`;
    } else {
        cacheKey = `hospital:list:${state || "all"}:${city || "all"}`;
    }

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("✅ Cache HIT - Hospitals");
        return res.status(200).json(JSON.parse(cachedData));
    }
    console.log("❌ Cache MISS - Hospitals");

    // ✅ If location provided → use geoNear
    if (lat && lng) {
      const hospitals = await HospitalModel.aggregate([//aggregate :-MongoDB ka advanced processing mode
        {
          $geoNear: {//Is coordinate ke paas jo documents hain, unko find karo + distance calculate karo
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: "distanceMeters",
            maxDistance: parseFloat(radius) * 1000,//Radius km me aaya → Mongo meters me kaam karta hai
            spherical: true,//spherical distance formula use karega (Haversine)
            query: matchStage//geosearch ke sath city, state filter bhi lag jayega
          }
        },

        // meters → km convert
        {
          $addFields: {
            distanceKm: {
              $round: [
                { $divide: ["$distanceMeters", 1000] },
                2
              ]
            }
          }
        },

        { $sort: { distanceMeters: 1 } }//ascending order
      ]);

      const response = {
        success: true,
        msg: "Nearby hospitals with distance",
        count: hospitals.length,
        data: hospitals
      };

      await redisClient.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        300
      );

      return res.status(200).json(response);
    }

    // ✅ If no lat/lng → normal search
    const hospitals = await HospitalModel.find(matchStage)
      .sort({ createdAt: -1 });

    const response = {
      success: true,
      msg: "Hospitals list",
      count: hospitals.length,
      data: hospitals
    };

    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "EX",
      300
    );

    return res.status(200).json(response);

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals",
      error: e.message
    });
  }
};

const getHospitalStates = async (req, res) => {
  try {
    const cacheKey="hospital:states";
    const cachedData=await redisClient.get(cacheKey);
    if(cachedData){
      return res.status(200).json(JSON.parse(cachedData));
    }
    const states = await HospitalModel.distinct("state");

    const response = {
      success: true,
      data: states
    };

    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "EX",
      300
    );
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch states"
    });
  }
};

const getHospitalCities = async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({ message: "State required" });
    }
    const cacheKey = `hospital:cities:${state.toLowerCase()}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("✅ Cache HIT - Cities");
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log("❌ Cache MISS - Cities");

    const cities = await HospitalModel.distinct("city", {
      state: { $regex: `^${state}$`, $options: "i" }
    });

    const response = {
      success: true,
      data: cities
    };

    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "EX",
      300
    );


    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities"
    });
  }
};

const getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await PharmacyModel
      .find()
      .populate("userId", "email isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      msg: "Pharmacies fetched successfully",
      count: pharmacies.length,
      pharmacies
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      msg: `Server error: ${err.message}`
    });
  }
};

const updatePharmacyStatus = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        msg: "Invalid status"
      });
    }

    const pharmacy = await PharmacyModel.findById(pharmacyId);

    if (!pharmacy) {
      return res.status(404).json({
        msg: "Pharmacy not found"
      });
    }

    if (pharmacy.approvalStatus !== "PENDING") {
      return res.status(400).json({
        msg: `Pharmacy is already ${pharmacy.approvalStatus}`
      });
    }

    const user = await userModel.findById(pharmacy.userId);

    if (!user) {
      return res.status(404).json({
        msg: "Associated user not found"
      });
    }

    pharmacy.approvalStatus = status;

    if (status === "APPROVED") {
      pharmacy.isActive = true;
      user.isActive = true;
    }

    if (status === "REJECTED") {
      pharmacy.isActive = false;
      user.isActive = false;
    }

    await pharmacy.save();
    await user.save();

    return res.status(200).json({
      msg: `Pharmacy ${status.toLowerCase()} successfully`,
      pharmacy,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      status: pharmacy.approvalStatus
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      msg: `Server error: ${err.message}`
    });
  }
};


const togglePharmacyActive = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const pharmacy = await PharmacyModel.findById(pharmacyId);

    if (!pharmacy) {
      return res.status(404).json({
        msg: "Pharmacy not found"
      });
    }

    if (pharmacy.approvalStatus !== "APPROVED") {
      return res.status(400).json({
        msg: "Only approved pharmacies can be activated or deactivated"
      });
    }

    const user = await userModel.findById(pharmacy.userId);

    if (!user) {
      return res.status(404).json({
        msg: "Associated user not found"
      });
    }

    pharmacy.isActive = !pharmacy.isActive;
    user.isActive = pharmacy.isActive;

    await pharmacy.save();
    await user.save();

    return res.status(200).json({
      msg: `Pharmacy ${pharmacy.isActive ? "activated" : "deactivated"} successfully`,
      pharmacy,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      msg: `Server error: ${err.message}`
    });
  }
};
const getHospitalPatients = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    console.log(`here is hospitalId :${hospitalId}`);

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital not associated with this user",
      });
    }

    const links = await PatientHospitalSchema.find({
      hospitalId,
      status: "ACTIVE",
    }).select("patientId");
    const patientIds = links.map(link => link.patientId);

    const patients = await patientModel.find({
      _id: { $in: patientIds },
    })
      .populate("userId", "name email phone_number")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });

  } catch (error) {
    console.error("Get hospital patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital patients",
      error: error.message,
    });
  }
};

const searchHospitalPatients = async (req, res) => {
  try {
    const { search } = req.query;

    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital not associated with this user",
      });
    }

    if (!search || search.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search value is required",
      });
    }

    const searchTerm = search.trim();

    // Get all patients linked to this hospital
    const links = await PatientHospitalSchema
      .find({
        hospitalId,
        status: "ACTIVE",
      })
      .select("patientId");

    const patientIds = links.map((link) => link.patientId);

    // Search phone number in Patient model
    const phoneMatches = await patientModel
      .find({
        _id: { $in: patientIds },
        phone_number: {
          $regex: searchTerm,
          $options: "i",
        },
      })
      .select("_id");

    // Search name/email in User model
    const patients = await patientModel
      .find({
        _id: { $in: patientIds },
      })
      .populate({
        path: "userId",
        match: {
          $or: [
            {
              name: {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              email: {
                $regex: searchTerm,
                $options: "i",
              },
            },
          ],
        },
        select: "name email phone_number",
      });

    const userMatches = patients
      .filter((patient) => patient.userId)
      .map((patient) => patient._id.toString());

    const phoneMatchIds = phoneMatches.map(
      (patient) => patient._id.toString()
    );

    // Combine name + email + phone results
    const matchedIds = [
      ...new Set([
        ...userMatches,
        ...phoneMatchIds,
      ]),
    ];

    const result = await patientModel
      .find({
        _id: { $in: matchedIds },
      })
      .populate("userId", "name email phone_number")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: result.length,
      patients: result,
    });

  } catch (error) {
    console.error("Search hospital patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search patients",
      error: error.message,
    });
  }
};

// =====================================================
// LIST EMERGENCY REQUESTS - HOSPITAL ADMIN
// =====================================================
//
// The `emergency-created` socket alert is fire-and-forget: an admin who was
// logged out, on another page, or who simply refreshed had no way back to a
// request that had already been raised. This is the durable view of the same
// data, scoped to the admin's own hospital.
const getHospitalEmergencies = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(403).json({
        success: false,
        message: "Hospital information not found"
      });
    }

    // "active" is the working queue, "history" the closed requests, "all"
    // both. Anything unrecognised falls back to the queue rather than
    // silently widening the result set.
    const scope = ["active", "history", "all"].includes(req.query.scope)
      ? req.query.scope
      : "active";

    const filter = { hospital: hospitalId };

    if (scope === "active") {
      filter.status = { $in: ACTIVE_EMERGENCY_STATUSES };
    } else if (scope === "history") {
      filter.status = { $nin: ACTIVE_EMERGENCY_STATUSES };
    }

    // The live queue is worked oldest-first - the request that has been
    // waiting longest is the most urgent. Closed requests read as a log, so
    // they run newest-first instead.
    const sort = scope === "active"
      ? { createdAt: 1 }
      : { createdAt: -1 };

    // Only the unbounded scopes need a page limit; the active queue is small
    // by definition and is always returned whole.
    const page = Math.max(1, Number(req.query.page) || 1);

    const limit = scope === "active"
      ? 0
      : Math.min(100, Math.max(1, Number(req.query.limit) || 25));

    let query = EmergencyModel.find(filter)
      .sort(sort)
      .populate("patient", "name email phone_number")
      .populate("assignedBy", "name role")
      .populate("acknowledgedBy", "name role");

    if (limit) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const emergencies = await query;

    // Lets the admin shell badge the queue without pulling the list itself.
    const activeCount = await EmergencyModel.countDocuments({
      hospital: hospitalId,
      status: { $in: ACTIVE_EMERGENCY_STATUSES }
    });

    return res.status(200).json({
      success: true,
      scope,
      count: emergencies.length,
      activeCount,
      emergencies
    });

  } catch (error) {
    console.error("GET HOSPITAL EMERGENCIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch emergency requests",
      error: error.message
    });
  }
};

const updateEmergencyStatus = async (req, res) => {
  try {
    const io = req.app.get("io");

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const adminId = req.user._id;

    const { emergencyId } = req.params;

    const {
      status,
      ambulance
    } = req.body;
    const emergency = await EmergencyModel.findById(
      emergencyId
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    const adminHospitalId = req.user.hospitalId;

    if (!adminHospitalId) {
      return res.status(403).json({
        success: false,
        message: "Hospital information not found"
      });
    }
    if (
      emergency.hospital.toString() !==
      adminHospitalId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this emergency"
      });
    }
    const nextStatuses =
      EMERGENCY_TRANSITIONS[emergency.status] || [];


    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change ${emergency.status} to ${status}`
      });
    }
    if (status === "AMBULANCE_ASSIGNED") {

      if (!ambulance) {
        return res.status(400).json({
          success: false,
          message:
            "Ambulance details are required"
        });
      }


      if (
        !ambulance.vehicleNumber ||
        !ambulance.driverName ||
        !ambulance.driverPhone
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vehicle number, driver name and driver phone are required"
        });
      }
      emergency.ambulance = {

        vehicleNumber:
          ambulance.vehicleNumber,

        driverName:
          ambulance.driverName,

        driverPhone:
          ambulance.driverPhone
      };
      emergency.assignedBy = adminId;

      emergency.assignedAt = new Date();
    }
    emergency.status = status;

    if (status === "ACKNOWLEDGED") {

      emergency.acknowledgedBy =
        adminId;

      emergency.acknowledgedAt =
        new Date();
    }
    if (status === "COMPLETED") {

      emergency.completedAt =
        new Date();
    }

    await emergency.save();
    const updatedEmergency =
      await EmergencyModel.findById(
        emergency._id
      )

      .populate(
        "patient",
        "name email phone_number"
      )

      .populate(
        "hospital",
        "name phone_number city state location"
      )
      .populate(
        "assignedBy",
        "name email phone_number role"
      )
      .populate(
        "acknowledgedBy",
        "name email phone_number role"
      );

    if (io) {

      // patient_ with an underscore: the separator every other patient emit
      // uses, and the one socket.js joins. This was the lone `patient:` and it
      // meant no ambulance status update ever reached the patient.
      io.to(
        `patient_${emergency.patient.toString()}`
      ).emit(
        "emergency-status-updated",
        updatedEmergency
      );
    }

    return res.status(200).json({

      success: true,

      message:
        `Emergency status updated to ${status}`,

      emergency: updatedEmergency
    });


  } catch (error) {

    console.error(
      "UPDATE EMERGENCY STATUS ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to update emergency status",

      error: error.message
    });
  }
};

module.exports= { registerHospital,updateEmergencyStatus,getHospitalEmergencies,getHospitalPatients,getAllHospitalSearch,searchHospitalPatients,getHospitalById,updateHospitalProfile,getHospitalProfile, getStats, approveHospital,getAllHospitals,getHospitalsQuery, getHospitals, getHospitalCities, getHospitalStates, getAllPharmacies,updatePharmacyStatus,togglePharmacyActive};
