const jwt = require("jsonwebtoken");
const userModel = require("./models/userModel");
const docterModel = require("./models/docterModel");
const patientModel = require("./models/patientModel");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (io, onlineDoctors, onlinePatients) => {
  // 🔐 Socket authentication
  io.use(async (socket, next) => {
    try {

      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await userModel.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      console.log("✅ Socket authenticated:", user._id);
      console.log("Role:", user.role);
      console.log("Hospital:", user.hospitalId);

      next();

    } catch (error) {

      console.log(
        "❌ Socket authentication failed:",
        error.message
      );

      next(new Error("Unauthorized"));
    }
  });


  // Connection
  io.on("connection", async (socket) => {

    console.log("🟢 Connected:", socket.id);

    console.log("Socket user:", socket.user._id);
    console.log("Socket role:", socket.user.role);
    console.log("Socket hospital:", socket.user.hospitalId);

    if (socket.user.role === "HOSPITAL_ADMIN" || socket.user.role === "PLATFORM_ADMIN") {
      socket.emit("initial-doctor-status", {
          onlineDoctors: Array.from(onlineDoctors.keys()),
      });
    }

    // Hospital admins own the `hospital:<id>` room that
    // patientController.createEmergency / cancelEmergency and
    // hospitalController.updateEmergencyStatus already emit into. Nothing used
    // to join it, so those alerts went nowhere.
    //
    // Joined here from the authenticated user rather than from a client
    // "join" event: the room decides who sees another patient's emergency, so
    // it must not be something a socket can ask for by id.
    if (socket.user.role === "HOSPITAL_ADMIN" && socket.user.hospitalId) {

      socket.join(`hospital:${socket.user.hospitalId}`);

      console.log("Hospital admin joined room:", `hospital:${socket.user.hospitalId}`);
    }
    // Patients own `patient_<id>`, which two different id spaces legitimately
    // address:
    //   - appointmentController emits to patient_<Patient profile id>
    //     (appointmentModel.patient refs "Patient")
    //   - the emergency flow emits to patient_<User id>
    //     (EmergencyModel.patient refs "User")
    // Neither emit path is wrong, they just key on different documents, so the
    // socket joins both rooms rather than one of the two feeds staying dark.
    //
    // Derived from the authenticated user like the hospital room above, never
    // from a client-supplied id - otherwise any patient could join another
    // patient's room and read their appointments and ambulance location.
    if (socket.user.role === "PATIENT") {

      socket.join(`patient_${socket.user._id}`);

      const patientProfile = await patientModel
        .findOne({ userId: socket.user._id })
        .select("_id");

      // Presence is keyed on the profile id because that is what the doctor
      // side has on an appointment. A user with no profile document yet still
      // gets their User-id room, so emergency updates work regardless.
      if (patientProfile) {

        const patientId = patientProfile._id.toString();

        socket.patientId = patientId;

        socket.join(`patient_${patientId}`);

        onlinePatients.set(patientId, socket.id);

        io.emit("patient-online", {
          patientId,
          socketId: socket.id,
        });
      }

      console.log("Patient joined rooms:", `patient_${socket.user._id}`, socket.patientId ? `patient_${socket.patientId}` : "(no profile)");
    }

    // TEMPORARY — later remove doctorId from client
    socket.on("joinDoctor", async (doctorId) => {

      onlineDoctors.set(doctorId, socket.id);

      io.emit("doctor-online", {
        doctorId,
      });

      socket.join(`doctor_${doctorId}`);

      console.log("Doctor online:", doctorId);

    });


    // Kept for clients that still announce themselves after connecting, and so
    // a doctor who connects later can still be told this patient is online.
    // The id in the payload is deliberately ignored - the rooms were already
    // joined on connect from the verified JWT, and trusting a client-supplied
    // id here would hand any patient another patient's feed.
    socket.on("patient-join", () => {

      if (socket.user.role !== "PATIENT" || !socket.patientId) {
        return;
      }

      onlinePatients.set(socket.patientId, socket.id);

      io.emit("patient-online", {
        patientId: socket.patientId,
        socketId: socket.id,
      });

      console.log("Patient re-announced:", socket.patientId);
    });

    // Disconnect
    socket.on("disconnect", async () => {

      for (const [doctorId, socketId] of onlineDoctors.entries()) {

        if (socketId === socket.id) {

          onlineDoctors.delete(doctorId);
          io.emit("doctor-offline", {
            doctorId,
            lastSeen: new Date(),
          });
          console.log("Doctor offline:", doctorId);

          await docterModel.findByIdAndUpdate(
            doctorId,
            {
              lastSeen: new Date(),
              opdStarted: false,
              opdPaused: false
            }
          );

        }
      }


      for (const [patientId, socketId] of onlinePatients.entries()) {

        if (socketId === socket.id) {

          onlinePatients.delete(patientId);

          console.log("Patient offline:", patientId);
        }
      }

      console.log("🔴 Disconnected:", socket.id);
    });
    socket.on("call-user", ({ targetSocketId, offer }) => {
      console.log("📞 Call request");
      console.log("From:", socket.id);
      console.log("To:", targetSocketId);

      io.to(targetSocketId).emit("incoming-call", {
        callerSocketId: socket.id,
        offer,
      });
    });

    socket.on("answer-call", ({ targetSocketId, answer }) => {
      console.log("📲 Call answer");

      io.to(targetSocketId).emit("call-accepted", {
        answer,
      });
    });

    socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit("ice-candidate", {
        candidate,
      });
    });

  });

};