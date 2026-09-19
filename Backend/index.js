const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");

// Routes
const hospitalRoutes = require("./routes/hospital");
const authRoute = require("./routes/authRoute");
const departmentRouter = require("./routes/departmentRoute");
const patientRoute = require("./routes/patientRoute");
const appointmentRouter = require("./routes/appointment");
const socketHandler = require("./socket.js");
const prescriptionRoute = require("./routes/prescription.js");
const reportsRoute = require("./routes/reports.js");
const pharmacyRouter = require("./routes/pharmacy");
const doctorRouter = require("./routes/doctor.js");
const consultationRouter = require("./routes/consultationRoute.js");
const platformOwnerRoute = require("./routes/platformOwnerRoute.js");
const reviewRouter = require("./routes/reviewRoute.js");
const { redisClient } = require("./config/redisClient.js");
const medicineRouter = require("./routes/medicine.js");
const startMedicineExpiryCron = require("./cron/MedicineExpiryCron.js");
const emergencyRoute = require("./routes/emergencyRoute.js");
const referralRoute = require("./routes/referral.js");
const doctorAnalyticsRouter = require("./routes/doctorAnalytics.js");
const app = express();
app.use(express.json());
app.use(cors());
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    startMedicineExpiryCron();
  })
  .catch((err) => console.log("❌ MongoDB connection error", err));

// Root
app.get("/", (req, res) => {
  res.send("Server is running  here🚀");
});

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const onlineDoctors = new Map();
const onlinePatients = new Map();

app.set("io", io);
app.set("redis", redisClient);

socketHandler(io, onlineDoctors, onlinePatients);

app.use("/api", hospitalRoutes);
app.use("/api/auth", authRoute);
app.use("/api/platform", platformOwnerRoute);
app.use("/api/prescription", prescriptionRoute);
app.use("/api/departments", departmentRouter);
app.use("/api/patients", patientRoute);
app.use('/api/doctors', doctorRouter)
app.use("/api", appointmentRouter);
app.use("/api/reports", reportsRoute);
app.use("/api", reviewRouter);
app.use("/api/consultation", consultationRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/medicine", medicineRouter);
app.use("/api/emergency", emergencyRoute)
app.use("/api/referral", referralRoute)
app.use("/api/doctor-analytics", doctorAnalyticsRouter);

server.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
