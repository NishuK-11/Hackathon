const { redisClient } = require("../config/redisClient");
const DEPARTMENTS = require("../constants/departments");
const departmentModel = require("../models/departmentModel");
const docterModel = require("../models/docterModel");
const HospitalModel = require("../models/HospitalModel");
const mongoose = require("mongoose");


exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const hospital = req.user.hospitalId; // admin ke token se

    if (!name) {
      return res.status(400).json({ success:false,message: "Department name required" });
    }

    const existing = await departmentModel.findOne({
      hospital: hospital,
      name,
    }).populate("hospital","name");

    if (existing) {
      return res.status(409).json({ success:false,message: "Department already exists" });
    }

    const department = await departmentModel.create({
      hospital: hospital,
      name,
      description,
    });

    res.status(201).json({
      success:true,
      message: "Department created successfully",
      department,
    });
  } catch (err) {
    res.status(500).json({ success:false,message: err.message });
  }
};


exports.getDepartmentList = async (req, res) => {
  try {
    const cacheKey = "departments:master-list";

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        departments: JSON.parse(cached),
        cached: true,
      });
    }

    // Save master list in Redis
    await redisClient.set(
      cacheKey,
      JSON.stringify(DEPARTMENTS),
      "EX",
      24 * 60 * 60
    );

    return res.status(200).json({
      success: true,
      departments: DEPARTMENTS,
      cached: false,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllDepartmentsWithCounts = async (req, res) => {
  try {
    //  console.log(req.user);
    //   console.log("hospitalId =", req.user.hospitalId);
    const hospitalId = req.user.hospitalId;

    const cacheKey = `departments:counts:${hospitalId}`;
    const cached = await redisClient.get(cacheKey);
    if(cached){
      const department = JSON.parse(cached);
      return res.status(200).json({success:true, count:department.length, department, cached:true});

    }
    const departments = await departmentModel.aggregate([
      {
        $match: {
          hospital: new mongoose.Types.ObjectId(hospitalId)
        }
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "department",
          as: "doctors",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          totalDoctors: {
            $size: "$doctors",
          },
          status: {
            $cond: ["$isActive", "Active", "Inactive"],
          },
          createdAt: 1,
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    await redisClient.set(cacheKey, JSON.stringify(departments),"EX",300);

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("Get Departments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const hospital = await HospitalModel.findById(hospitalId).select("name");
    const departments = await departmentModel.find({
      hospital: hospitalId,
    }).select("name description isActive createdAt").sort({ createdAt: -1 });

    res.json({success:true,hospital,departments});
  } catch (err) {
    res.status(500).json({ success:false,message: err.message });
  }
};


exports.getDepartmentsByHospital = async (req, res) => {
  try {
    const {hospitalId} = req.params;
    const hospital = await HospitalModel.findById(hospitalId).select("_id name");
    if(!hospital){
      return res.status(404).json({
        success:false,
        message:"Hospital not found",
      });
    }
      const departments = await departmentModel.aggregate([
        {
          $match: {
            hospital: new mongoose.Types.ObjectId(hospitalId),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "doctors",           // Doctor collection
            localField: "_id",
            foreignField: "department",
            as: "doctors",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            isActive: 1,
            createdAt: 1,
            doctorCount: { $size: "$doctors" },
          },
        },
        {
          $sort: { name: 1 },
        },
      ]);


    res.json({
      success: true,
      hospital,
      departments,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await departmentModel.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const doctors = await docterModel.find({
      department: id,
      isActive: true,
    })
      .populate("userId", "name email")
      .select(
        "position experience specialisation profile_photo opd_timing availableDays"
      );

    return res.status(200).json({
      success: true,
      department: {
        _id: department._id,
        name: department.name,
        description: department.description,
        isActive: department.isActive,
        totalDoctors: doctors.length,
        doctors,
      },
    });
  } catch (error) {
    console.error("Get Department Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch department",
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (name) department.name = name;
    if (description) department.description = description;

    await department.save();

    res.json({
      message: "Department updated successfully",
      department,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.isActive = !department.isActive;
    await department.save();

    res.json({
      message: `Department ${
        department.isActive ? "activated" : "deactivated"
      }`,
      isActive: department.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await Department.findByIdAndDelete(id);

    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};