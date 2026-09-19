import React, { useState } from "react";
import { FilePlus, Upload, X, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addPatientReport } from "../../api/backend";
import PatientProfile from "../../components/PatientProfile";


const PatientProfileAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showReportForm, setShowReportForm] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("LAB");
  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Optional: only image/pdf
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG or PDF files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!id) {
      setError("Patient ID not found");
      return;
    }

    if (!title.trim()) {
      setError("Please enter report title");
      return;
    }

    if (!type) {
      setError("Please select report type");
      return;
    }

    if (!file) {
      setError("Please select a report file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("patientId", id);
      formData.append("title", title);
      formData.append("type", type);
      formData.append("file", file);

      console.log("Uploading report:");
      console.log("patientId:", id);
      console.log("title:", title);
      console.log("type:", type);
      console.log("file:", file);

      const res = await addPatientReport(formData);

      if (res.data.success) {
        setMessage("Report uploaded successfully.");

        // Reset form
        setTitle("");
        setType("LAB");
        setFile(null);

        // file input reset
        document.getElementById("report-file").value = "";

        setShowReportForm(false);
      } else {
        setError(res.data.message || "Failed to upload report");
      }
    } catch (err) {
      console.error("Report upload failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Report upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto flex gap-6">

        {/* Patient Profile */}
        <PatientProfile />
        {/* Add Report Section */}
        <div className="mt-6 ">
          {!showReportForm ? (
            <button
              onClick={() => {
                setShowReportForm(true);
                setMessage("");
                setError("");
              }}
              className="
                flex items-center gap-2
                px-5 py-3
                bg-blue-600
                hover:bg-blue-700
                text-white
                rounded-xl
                font-medium
                transition
                shadow-sm
              "
            >
              <FilePlus size={20} />
              Add Report
            </button>
          ) : (
            <div
              className="
                bg-white dark:bg-gray-900
                border border-gray-100 dark:border-gray-800
                rounded-2xl
                shadow-sm
                p-6
              "
            >

              {/* Header */}
              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Add Patient Report
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Upload a medical report for this patient
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm(false);
                    setError("");
                    setMessage("");
                  }}
                  className="
                    w-9 h-9
                    flex items-center justify-center
                    rounded-lg
                    bg-gray-100 dark:bg-gray-800
                    text-gray-500 dark:text-gray-400
                    hover:bg-gray-200 dark:hover:bg-gray-700
                  "
                >
                  <X size={18} />
                </button>

              </div>

              {/* Success */}
              {message && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  {message}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleUploadReport}>

                {/* Title */}
                <div className="mb-5">

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count"
                    className="
                      w-full
                      px-4 py-3
                      rounded-xl
                      border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800
                      text-gray-800 dark:text-gray-100
                      outline-none
                      focus:ring-2 focus:ring-blue-500
                    "
                  />

                </div>

                {/* Report Type */}
                <div className="mb-5">

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type
                  </label>

                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="
                      w-full
                      px-4 py-3
                      rounded-xl
                      border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800
                      text-gray-800 dark:text-gray-100
                      outline-none
                      focus:ring-2 focus:ring-blue-500
                    "
                  >
                    <option value="LAB">LAB</option>
                    <option value="XRAY">XRAY</option>
                    <option value="MRI">MRI</option>
                    <option value="OTHER">OTHER</option>
                  </select>

                </div>

                {/* File */}
                <div className="mb-6">

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report File
                  </label>

                  <label
                    htmlFor="report-file"
                    className="
                      flex flex-col items-center justify-center
                      w-full
                      min-h-[160px]
                      border-2 border-dashed
                      border-gray-300 dark:border-gray-700
                      rounded-xl
                      cursor-pointer
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      transition
                    "
                  >

                    <Upload
                      size={30}
                      className="text-blue-500 mb-3"
                    />

                    {file ? (
                      <>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                          <FileText size={18} />
                          <span className="font-medium">
                            {file.name}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Click to upload report
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG or PDF
                        </p>
                      </>
                    )}

                  </label>

                  <input
                    id="report-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setShowReportForm(false);
                      setError("");
                      setMessage("");
                    }}
                    className="
                      px-5 py-3
                      rounded-xl
                      border border-gray-200 dark:border-gray-700
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-gray-800
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="
                      flex items-center gap-2
                      px-5 py-3
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-700
                      disabled:bg-blue-400
                      text-white
                      font-medium
                      transition
                    "
                  >
                    <Upload size={18} />

                    {uploading
                      ? "Uploading..."
                      : "Upload Report"}
                  </button>

                </div>

              </form>

            </div>
          )}

          <button
            onClick={() =>
              navigate("/hospital-dashboard/all-hospitals", {
                state: {
                  patientId: id,
                },
              })
            }
            className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            Refer this Patient
        </button>
        </div>

      </div>
    </div>
  );
};

export default PatientProfileAdmin;