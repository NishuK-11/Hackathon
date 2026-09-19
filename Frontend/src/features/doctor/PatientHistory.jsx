import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FileText,
  Pill,
  Calendar,
  Stethoscope,
  ExternalLink,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { getPatientHistory } from "../../api/backend";

const PatientHistory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching history for patient:", id);

        const response = await getPatientHistory(id);

        console.log("Patient History:", response.data);

        if (response.data.success) {
          setHistory(response.data);
        } else {
          setError(
            response.data.message || "Failed to fetch patient history"
          );
        }
      } catch (err) {
        console.error("Patient history error:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch patient history"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientHistory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <p className="text-gray-600 dark:text-gray-400">
          Loading patient history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-red-50 dark:bg-red-900/20 p-5 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
        <p className="text-gray-800 dark:text-white">
          No patient history found.
        </p>
      </div>
    );
  }

  const { reports = [], prescriptions = [] } = history;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Patient History
            </h1>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Medical reports and prescriptions
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/25 p-3">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Medical Reports
                </p>

                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {reports.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/25 p-3">
                <Pill className="text-green-600 dark:text-green-400" size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Prescriptions
                </p>

                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {prescriptions.length}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* REPORTS */}
        <section className="mb-10">

          <div className="mb-4 flex items-center gap-2">
            <FileText className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Medical Reports
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center text-gray-500 dark:text-gray-400">
              No medical reports available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {reports.map((report) => (
                <div
                  key={report._id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/25 p-3">
                        <FileText
                          size={22}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {report.title}
                        </h3>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {report.type}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                      {report.fileType}
                    </span>

                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">

                    <p>
                      Uploaded by:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {report.uploadedBy}
                      </span>
                    </p>

                    <p>
                      Date:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </p>

                  </div>

                  
                  <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                  View Report
                  <ExternalLink size={16} />
                </a>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* PRESCRIPTIONS */}
        <section>

          <div className="mb-4 flex items-center gap-2">
            <Pill className="text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Prescriptions
            </h2>
          </div>

          {prescriptions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center text-gray-500 dark:text-gray-400">
              No prescriptions available.
            </div>
          ) : (
            <div className="space-y-6">

              {prescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
                >

                  {/* PRESCRIPTION HEADER */}
                  <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Prescription
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">

                        <span className="flex items-center gap-1">
                          <Calendar size={15} />

                          {new Date(
                            prescription.createdAt
                          ).toLocaleDateString()}
                        </span>

                        <span className="flex items-center gap-1">
                          <Stethoscope size={15} />

                          Doctor
                        </span>

                      </div>
                    </div>

                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                      Prescription
                    </span>

                  </div>

                  {/* COMPLAINTS + DIAGNOSIS */}
                  <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4">
                      <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-200">
                        Complaints
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {prescription.complaints?.map(
                          (complaint, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm text-red-700 dark:text-red-400"
                            >
                              {complaint}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4">
                      <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-200">
                        Diagnosis
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {prescription.diagnosis?.map(
                          (diagnosis, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm text-purple-700 dark:text-purple-400"
                            >
                              {diagnosis}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                  </div>

                  {/* MEDICINES */}
                  <div className="mb-5">

                    <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-200">
                      Medicines
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] border-collapse">

                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-left">
                            <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                              Medicine
                            </th>

                            <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                              Dosage
                            </th>

                            <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                              Frequency
                            </th>

                            <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                              Duration
                            </th>

                            <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                              Instructions
                            </th>
                          </tr>
                        </thead>

                        <tbody>

                          {prescription.medicines?.map(
                            (medicine, index) => (
                              <tr
                                key={medicine._id || index}
                                className="border-b border-gray-200 dark:border-gray-800 last:border-0"
                              >
                                <td className="p-3 font-medium text-gray-800 dark:text-white">
                                  {medicine.name}
                                </td>

                                <td className="p-3 text-gray-600 dark:text-gray-300">
                                  {medicine.dosage}
                                </td>

                                <td className="p-3 text-gray-600 dark:text-gray-300">
                                  {medicine.frequency}
                                </td>

                                <td className="p-3 text-gray-600 dark:text-gray-300">
                                  {medicine.duration}
                                </td>

                                <td className="p-3 text-gray-600 dark:text-gray-300">
                                  {medicine.instructions}
                                </td>
                              </tr>
                            )
                          )}

                        </tbody>

                      </table>
                    </div>

                  </div>

                  {/* TESTS */}
                  <div className="mb-5">

                    <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
                      Tests
                    </h4>

                    <div className="flex flex-wrap gap-2">

                      {prescription.tests?.map(
                        (test, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-sm text-yellow-700 dark:text-yellow-400"
                          >
                            {test}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  {/* ADVICE */}
                  {prescription.advice && (
                    <div className="mb-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                      <h4 className="mb-1 font-semibold text-blue-800 dark:text-blue-300">
                        Advice
                      </h4>

                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {prescription.advice}
                      </p>
                    </div>
                  )}

                  {/* FOLLOW UP */}
                  {prescription.followUpDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar size={16} />

                      <span className="font-medium">
                        Follow-up:
                      </span>

                      <span>
                        {new Date(
                          prescription.followUpDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default PatientHistory;