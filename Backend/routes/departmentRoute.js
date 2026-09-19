const express = require("express");

const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  toggleDepartmentStatus,
  deleteDepartment,
  getDepartmentsByHospital,
  getAllDepartmentsWithCounts,
  getDepartmentList,
} = require("../controllers/departmentController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../config/role");

const departmentRouter = express.Router();

// ✅ Create Department (Admin only)
departmentRouter.post("/",auth,authorize(ROLE.admin), createDepartment);

// ✅ Get all departments of hospital (Admin)
departmentRouter.get("/",auth,authorize(ROLE.admin,ROLE.doctor),getAllDepartments);
departmentRouter.get("/doctor-count",auth, getAllDepartmentsWithCounts);


departmentRouter.get("/list",auth,getDepartmentList);

// ✅Get all departments of repective hospital (user)
departmentRouter.get("/hospital/:hospitalId",getDepartmentsByHospital);



// ✅ Get single department
departmentRouter.get("/:id", getDepartmentById);

// ✅ Update department
departmentRouter.patch("/:id", updateDepartment);

// ✅ Activate / Deactivate department
departmentRouter.patch("/:id/toggle-status", toggleDepartmentStatus);

// ✅ Delete department
departmentRouter.delete("/:id", deleteDepartment);

module.exports = departmentRouter;
