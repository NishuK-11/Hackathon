import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getAllDoctors } from "../../api/backend";
import { toggleTheme } from "../../redux/slices/themeSlice";

const DoctorStatus = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const token = localStorage.getItem("token");

  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  // =========================================
  // Fetch all doctors
  // =========================================
  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const response = await getAllDoctors();

      const doctorData =
        response.data.doctors || response.data;

      setDoctors(
        doctorData.map((doctor) => ({
          ...doctor,
          online: false,
        }))
      );

    } catch (error) {
      console.error(
        "Error fetching doctors:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Socket connection
  // =========================================
  useEffect(() => {

    if (!token) {
      console.error("No token found");
      setLoading(false);
      return;
    }

    // First get all doctors
    fetchDoctors();

    // Create socket
    const socket = io(
      import.meta.env.VITE_SOCKET_URL
      // Development:
      // "http://localhost:3000"
    , {
      auth: {
        token,
      },
    });

    // =========================================
    // Admin socket connected
    // =========================================
    socket.on("connect", () => {

      console.log(
        "🟢 Admin socket connected:",
        socket.id
      );

      setSocketConnected(true);
    });

    // =========================================
    // Admin socket disconnected
    // =========================================
    socket.on("disconnect", () => {

      console.log(
        "🔴 Admin socket disconnected"
      );

      setSocketConnected(false);
    });

    // =========================================
    // Socket connection error
    // =========================================
    socket.on("connect_error", (error) => {

      console.error(
        "❌ Socket error:",
        error.message
      );

      setSocketConnected(false);
    });

    // =========================================
    // INITIAL DOCTOR STATUS
    // =========================================
    socket.on(
      "initial-doctor-status",
      ({ onlineDoctors }) => {

        console.log(
          "📋 Initial online doctors:",
          onlineDoctors
        );

        setDoctors((prevDoctors) => {

          return prevDoctors.map((doctor) => {

            const doctorId =
              doctor._id?.toString();

            return {
              ...doctor,
              online:
                onlineDoctors.includes(
                  doctorId
                ),
            };
          });

        });

      }
    );

    // =========================================
    // DOCTOR CAME ONLINE
    // =========================================
    socket.on(
      "doctor-online",
      ({ doctorId }) => {

        console.log(
          "🟢 Doctor online:",
          doctorId
        );

        setDoctors((prevDoctors) => {

          return prevDoctors.map((doctor) => {

            const currentDoctorId =
              doctor._id?.toString();

            if (
              currentDoctorId ===
              doctorId.toString()
            ) {

              return {
                ...doctor,
                online: true,
              };

            }

            return doctor;
          });

        });

      }
    );

    // =========================================
    // DOCTOR WENT OFFLINE
    // =========================================
    socket.on(
      "doctor-offline",
      ({ doctorId, lastSeen }) => {

        console.log(
          "🔴 Doctor offline:",
          doctorId
        );

        setDoctors((prevDoctors) => {

          return prevDoctors.map((doctor) => {

            const currentDoctorId =
              doctor._id?.toString();

            if (
              currentDoctorId ===
              doctorId.toString()
            ) {

              return {
                ...doctor,
                online: false,
                lastSeen,
              };

            }

            return doctor;
          });

        });

      }
    );

    // =========================================
    // CLEANUP
    // =========================================
    return () => {

      console.log(
        "Cleaning up admin socket..."
      );

      socket.disconnect();

    };

  }, []);

  // =========================================
  // Loading
  // =========================================
  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-[300px] bg-white dark:bg-black">

        <p className="text-gray-500 dark:text-gray-400">
          Loading doctors...
        </p>

      </div>
    );
  }

  // =========================================
  // Statistics
  // =========================================
  const totalDoctors = doctors.length;

  const onlineDoctors =
    doctors.filter(
      (doctor) => doctor.online
    ).length;

  const offlineDoctors =
    doctors.filter(
      (doctor) => !doctor.online
    ).length;

  // =========================================
  // UI
  // =========================================
  return (

    <div className="p-6 bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Doctor Status
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor doctor availability in real time.
          </p>

        </div>

        <div className="flex items-center gap-4">

          {/* Admin socket status */}
          <div className="flex items-center gap-2">

            <span
              className={`w-3 h-3 rounded-full ${
                socketConnected
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">

              {socketConnected
                ? "Live"
                : "Disconnected"}

            </span>

          </div>

        </div>

      </div>

      {/* =====================================
          Statistics
      ===================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Total */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Doctors
          </p>

          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">
            {totalDoctors}
          </h2>

        </div>

        {/* Online */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Online Doctors
          </p>

          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {onlineDoctors}
          </h2>

        </div>

        {/* Offline */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Offline Doctors
          </p>

          <h2 className="text-3xl font-bold text-gray-500 dark:text-gray-400 mt-2">
            {offlineDoctors}
          </h2>

        </div>

      </div>

      {/* =====================================
          Doctor Table
      ===================================== */}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

              <tr>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Doctor
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Department
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Last Seen
                </th>

              </tr>

            </thead>

            <tbody>

              {doctors.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="text-center py-10 text-gray-500 dark:text-gray-400"
                  >
                    No doctors found.
                  </td>

                </tr>

              ) : (

                doctors.map((doctor) => (

                  <tr
                    key={doctor._id}
                    className="border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >

                    {/* Doctor */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">

                          {doctor.profile_photo ? (

                            <img
                              src={doctor.profile_photo}
                              alt={
                                doctor.name ||
                                "Doctor"
                              }
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <span className="font-semibold text-gray-600 dark:text-gray-200">

                              {(
                                doctor.name ||
                                doctor.userId?.name ||
                                "D"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </span>

                          )}

                        </div>

                        <div>

                          <p className="font-medium text-gray-800 dark:text-gray-100">

                            {doctor.name ||
                              doctor.userId?.name ||
                              "Unknown Doctor"}

                          </p>

                          <p className="text-sm text-gray-500 dark:text-gray-400">

                            {doctor.email ||
                              doctor.userId?.email ||
                              ""}

                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">

                      <span className="text-sm text-gray-600 dark:text-gray-300">

                        {doctor.department?.name ||
                          doctor.department ||
                          "N/A"}

                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      {doctor.online ? (

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/25 text-green-700 dark:text-green-400">

                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

                          <span className="text-sm font-medium">
                            Online
                          </span>

                        </div>

                      ) : (

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">

                          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />

                          <span className="text-sm font-medium">
                            Offline
                          </span>

                        </div>

                      )}

                    </td>

                    {/* Last Seen */}
                    <td className="px-6 py-4">

                      <span className="text-sm text-gray-500 dark:text-gray-400">

                        {doctor.online
                          ? "Currently online"
                          : doctor.lastSeen
                          ? new Date(
                              doctor.lastSeen
                            ).toLocaleString()
                          : "Never"}

                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default DoctorStatus;
