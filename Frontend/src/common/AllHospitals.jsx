import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";
import {
  Search,
  RefreshCw,
  MapPin,
  Phone,
  Star,
  Building2,
  CheckCircle,
  Clock,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

import { getAllHospitals, createReferral } from "../api/backend";

const AllHospitals = () => {
  // --------------------------------------------------
  // THEME
  // --------------------------------------------------
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  // --------------------------------------------------
  // GET PATIENT ID FROM PATIENT PROFILE
  // --------------------------------------------------
  const location = useLocation();
  const patientId = location.state?.patientId;

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  // Referral states
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const [referralReason, setReferralReason] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");

  const [referring, setReferring] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState("");

  // --------------------------------------------------
  // FETCH HOSPITALS
  // --------------------------------------------------
  const fetchHospitals = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAllHospitals();

      const hospitalData = response?.data?.data || [];

      setHospitals(Array.isArray(hospitalData) ? hospitalData : []);
    } catch (err) {
      console.error("Fetch hospitals error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to fetch hospitals. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // --------------------------------------------------
  // FILTER HOSPITALS
  // --------------------------------------------------
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        hospital?.name?.toLowerCase().includes(searchText) ||
        hospital?.city?.toLowerCase().includes(searchText) ||
        hospital?.state?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        hospital?.status?.toUpperCase() === statusFilter;

      const matchesActive =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && hospital?.isActive === true) ||
        (activeFilter === "INACTIVE" && hospital?.isActive !== true);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [hospitals, search, statusFilter, activeFilter]);

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------
  const totalHospitals = hospitals.length;

  const activeHospitals = hospitals.filter(
    (hospital) => hospital?.isActive === true
  ).length;

  const approvedHospitals = hospitals.filter(
    (hospital) => hospital?.status?.toUpperCase() === "APPROVED"
  ).length;

  const pendingHospitals = hospitals.filter(
    (hospital) => hospital?.status?.toUpperCase() === "PENDING"
  ).length;

  // --------------------------------------------------
  // OPEN REFERRAL MODAL
  // --------------------------------------------------
  const openReferralModal = (hospital) => {
    setSelectedHospital(hospital);

    setReferralReason("");
    setClinicalNotes("");
    setUrgency("NORMAL");

    setReferralMessage("");
    setReferralError("");

    setShowReferralModal(true);
  };

  // --------------------------------------------------
  // CLOSE REFERRAL MODAL
  // --------------------------------------------------
  const closeReferralModal = () => {
    if (referring) return;

    setShowReferralModal(false);
    setSelectedHospital(null);

    setReferralReason("");
    setClinicalNotes("");
    setUrgency("NORMAL");

    setReferralMessage("");
    setReferralError("");
  };

  // --------------------------------------------------
  // CREATE REFERRAL
  // --------------------------------------------------
  const handleConfirmReferral = async () => {
    // Patient ID check
    if (!patientId) {
      setReferralError(
        "Patient information is missing. Please open this page from the patient profile."
      );
      return;
    }

    // Hospital check
    if (!selectedHospital?._id) {
      setReferralError("Hospital information is missing.");
      return;
    }

    // Reason check
    if (!referralReason.trim()) {
      setReferralError("Please enter the referral reason.");
      return;
    }

    try {
      setReferring(true);
      setReferralError("");
      setReferralMessage("");

      const payload = {
        patientId: patientId,
        referredToHospital: selectedHospital._id,
        reason: referralReason.trim(),
        clinicalNotes: clinicalNotes.trim(),
        urgency: urgency,
      };

      console.log("Referral payload:", payload);

      const response = await createReferral(payload);

      if (response?.data?.success) {
        setReferralMessage(
          response?.data?.message || "Patient referred successfully!"
        );

        // Close modal after short delay
        setTimeout(() => {
          setShowReferralModal(false);
          setSelectedHospital(null);
          setReferralMessage("");
          setReferralReason("");
          setClinicalNotes("");
          setUrgency("NORMAL");
        }, 1500);
      } else {
        setReferralError(
          response?.data?.message || "Failed to create referral."
        );
      }
    } catch (err) {
      console.error("Create referral error:", err);

      setReferralError(
        err?.response?.data?.message ||
          "Failed to create referral. Please try again."
      );
    } finally {
      setReferring(false);
    }
  };

  // --------------------------------------------------
  // STATUS BADGE
  // --------------------------------------------------
  const getStatusBadge = (status) => {
    const currentStatus = status?.toUpperCase();

    if (currentStatus === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/25 text-green-700 dark:text-green-400">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }

    if (currentStatus === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/25 text-yellow-700 dark:text-yellow-400">
          <Clock size={14} />
          Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        {status || "Unknown"}
      </span>
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-72 mb-3"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-96 mb-8"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 bg-white dark:bg-[#0B1220] rounded-2xl shadow-sm dark:shadow-none"
                ></div>
              ))}
            </div>

            <div className="h-16 bg-white dark:bg-[#0B1220] rounded-2xl mb-6"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-96 bg-white dark:bg-[#0B1220] rounded-2xl shadow-sm dark:shadow-none"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              All Hospitals
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Find a hospital and refer the patient for further treatment
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchHospitals(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={() => dispatch(toggleTheme())}
              className="px-3 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium whitespace-nowrap"
            >
              {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* PATIENT INFO */}
        {patientId ? (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 flex items-center gap-3">
            <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />

            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-300">
                Patient selected for referral
              </p>

              <p className="text-sm text-blue-600 dark:text-blue-400">
                You can now select a hospital below.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 flex items-center gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />

            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                Patient information not found
              </p>

              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Open this page using the "Refer this Patient" button from a
                patient profile.
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-5 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Hospitals</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {totalHospitals}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400">
                <Building2 size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-5 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {activeHospitals}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/25 text-green-600 dark:text-green-400">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-5 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {approvedHospitals}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/25 text-indigo-600 dark:text-indigo-400">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-5 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {pendingHospitals}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/25 text-yellow-600 dark:text-yellow-400">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-4 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* SEARCH */}
            <div className="relative md:col-span-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />

              <input
                type="text"
                placeholder="Search hospital, city or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/70"
              />
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/70"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* ACTIVE */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/70"
            >
              <option value="ALL">All Hospitals</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* RESULT COUNT */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {filteredHospitals.length}
            </span>{" "}
            hospitals
          </p>
        </div>

        {/* NO HOSPITAL */}
        {filteredHospitals.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <Building2
              size={50}
              className="mx-auto text-gray-300 dark:text-gray-700 mb-4"
            />

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              No hospitals found
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try changing your search or filters.
            </p>
          </div>
        ) : (

          /* HOSPITAL GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital?._id}
                hospital={hospital}
                onRefer={openReferralModal}
                canRefer={Boolean(patientId)}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==================================================
          REFERRAL MODAL
      ================================================== */}
      {showReferralModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeReferralModal}
          ></div>

          {/* MODAL */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Refer Patient
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Send this patient to the selected hospital
                </p>
              </div>

              <button
                onClick={closeReferralModal}
                disabled={referring}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6">

              {/* SELECTED HOSPITAL */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 mb-6">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-blue-900/40">
                  {selectedHospital.logo ? (
                    <img
                      src={selectedHospital.logo}
                      alt={selectedHospital.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {selectedHospital.name}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={14} />

                    {selectedHospital.city || "N/A"},{" "}
                    {selectedHospital.state || "N/A"}
                  </p>
                </div>
              </div>

              {/* REASON */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Referral Reason <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  placeholder="e.g. Patient requires specialized cardiac treatment"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/70"
                />
              </div>

              {/* CLINICAL NOTES */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Clinical Notes
                </label>

                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Add relevant clinical information..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/70 resize-none"
                />
              </div>

              {/* URGENCY */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Urgency
                </label>

                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/70"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              {/* SUCCESS MESSAGE */}
              {referralMessage && (
                <div className="mb-5 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>{referralMessage}</span>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {referralError && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>{referralError}</span>
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">

                <button
                  onClick={closeReferralModal}
                  disabled={referring}
                  className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmReferral}
                  disabled={referring || Boolean(referralMessage)}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {referring ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Referring...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Confirm Referral
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// HOSPITAL CARD
// ======================================================

const HospitalCard = ({
  hospital,
  onRefer,
  canRefer,
  getStatusBadge,
}) => {
  return (
    <div className="bg-white dark:bg-[#0B1220] rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-lg dark:hover:border-gray-700 transition duration-300">

      {/* COVER IMAGE */}
      <div className="relative h-40 bg-gray-100 dark:bg-gray-800">

        {hospital.coverImage ? (
          <img
            src={hospital.coverImage}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Building2 size={45} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* STATUS */}
        <div className="absolute top-3 right-3">
          {getStatusBadge(hospital.status)}
        </div>

        {/* LOGO */}
        <div className="absolute -bottom-7 left-5">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0B1220] border-4 border-white dark:border-[#0B1220] shadow-md overflow-hidden flex items-center justify-center">
            {hospital.logo ? (
              <img
                src={hospital.logo}
                alt={hospital.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 size={28} className="text-blue-500 dark:text-blue-400" />
            )}
          </div>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-5 pt-10">

        {/* NAME */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
          {hospital.name || "Unnamed Hospital"}
        </h2>

        {/* LOCATION */}
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-2">
          <MapPin size={16} />

          <span className="line-clamp-1">
            {hospital.city || "N/A"},{" "}
            {hospital.state || "N/A"}
          </span>
        </div>

        {/* RATING */}
        <div className="flex items-center gap-2 mt-3">

          <div className="flex items-center gap-1">
            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {hospital.averageRating
                ? Number(hospital.averageRating).toFixed(1)
                : "0.0"}
            </span>
          </div>

          <span className="text-gray-400 dark:text-gray-600">•</span>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {hospital.totalReviews || 0} reviews
          </span>
        </div>

        {/* PHONE */}
        {hospital.phone_number && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
            <Phone size={16} />
            <span>{hospital.phone_number}</span>
          </div>
        )}

        {/* FACILITIES */}
        {Array.isArray(hospital.facilities) &&
          hospital.facilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {hospital.facilities.slice(0, 4).map((facility, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-400 text-xs font-medium"
                >
                  {facility}
                </span>
              ))}
            </div>
          )}

        {/* DIVIDER */}
        <div className="border-t border-gray-100 dark:border-gray-800 my-5"></div>

        {/* REFER BUTTON */}
        <button
          onClick={() => onRefer(hospital)}
          disabled={!canRefer}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold transition flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          <Send size={18} />

          {canRefer ? "Refer Patient" : "Patient Not Selected"}
        </button>

        {!canRefer && (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
            Open this page from a patient profile
          </p>
        )}
      </div>
    </div>
  );
};

export default AllHospitals;