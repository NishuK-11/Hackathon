import React, { useState } from "react";
import { FilePlus, Upload, X, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addPatientReport, getPatientMedicalSummary } from "../../api/backend";
import PatientProfile from "../../components/PatientProfile";

const recorded = (value) => value && value !== "not recorded";

const Section = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

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

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");

    try {
      const res = await getPatientMedicalSummary(id);
      setSummary(res.data.summary);
    } catch (err) {
      setSummaryError(
        err.response?.data?.message || "Could not generate the medical summary"
      );
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">

        {/* Patient Profile */}
        <PatientProfile />
        <div className="mt-10 flex gap-5">
          <button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="p-3 bg-blue-800 text-white rounded-md disabled:opacity-50"
          >
            {summaryLoading ? "Generating..." : "See Medical Summary"}
          </button>

          <button
            onClick={() =>
              navigate(`/doctor-dashboard/patients/${id}/history`)
            }
            className="p-3 bg-blue-800 text-white rounded-md"
          >
            Previous Reports and Prescription
          </button>

          <button
            onClick={() =>
              navigate(`/doctor-dashboard/patients/${id}/shared-data`)
            }
            className="p-3 bg-blue-800 text-white rounded-md"
          >
            Shared Reports and Prescription
          </button>
        </div>

        {summaryLoading && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Reading this patient's record...
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  This can take up to a minute the first time.
                </p>
              </div>
            </div>
          </div>
        )}

        {summaryError && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl">
            {summaryError}
          </div>
        )}

        {summary && !summaryLoading && (
          <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Medical Summary
            </h2>
            <p className="mt-1 text-xs text-gray-500">{summary.patientSnapshot}</p>

            {summary.insufficientRecord && (
              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                There is very little on file for this patient, so this summary is
                necessarily thin.
              </p>
            )}

            <Section title="Points of attention" items={summary.pointsOfAttention} />

            {summary.activeMedications?.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-800">
                  Medicines, as last prescribed
                </h3>
                <ul className="mt-2 space-y-1">
                  {summary.activeMedications.map((m, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {m.name}
                      {recorded(m.dosage) ? ` ${m.dosage}` : ""}
                      {[m.frequency, m.duration, m.instructions]
                        .filter(recorded)
                        .map((part) => `, ${part}`)
                        .join("")}
                      <span className="text-gray-500">
                        {" "}
                        (prescribed {m.lastPrescribedOn})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.visitTimeline?.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-800">Visits</h3>
                <ul className="mt-2 space-y-1">
                  {summary.visitTimeline.map((v, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      <span className="text-gray-500">{v.date}</span> - {v.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Section title="Recurring patterns" items={summary.recurringPatterns} />
            <Section title="Reports on file" items={summary.reportsOnFile} />
            <Section title="Not available in the record" items={summary.dataGaps} />

            <p className="mt-6 border-t pt-4 text-xs text-gray-500">
              {summary.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileAdmin;