import React, { useEffect, useState } from "react";
import {
FileText,
Pill,
Calendar,
Stethoscope,
ExternalLink,
Users,
Loader2,
} from "lucide-react";
import { getSharedMedicalData } from "../../api/backend";
import { useParams } from "react-router-dom";

const SharedMedicalData = () => {
const { id } = useParams();
const [reports, setReports] = useState([]);
const [prescriptions, setPrescriptions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

 useEffect(() => {
    const fetchSharedMedicalData = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching shared data for patient:", id);

        const response = await getSharedMedicalData(id);

        console.log("Shared Medical Data:", response.data);

        if (response.data.success) {
          setReports(response.data.reports || []);
          setPrescriptions(response.data.prescriptions || []);
        } else {
          setError(
            response.data.message ||
              "Failed to fetch shared medical data"
          );
        }
      } catch (err) {
        console.error("Shared Medical Data Error:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch shared medical data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSharedMedicalData();
    }
  }, [id]);

  
if (loading) {
return ( <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-black"> <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300"> <Loader2 className="animate-spin" size={28} /> <span>Loading shared medical records...</span> </div> </div>
);
}

if (error) {
return ( <div className="min-h-screen bg-gray-50 p-6 dark:bg-black"> <div className="mx-auto max-w-6xl rounded-xl bg-red-50 p-5 text-red-600 dark:bg-red-900/20 dark:text-red-400">
{error} </div> </div>
);
}

return ( <div className="min-h-screen bg-gray-50 p-6 dark:bg-black"> <div className="mx-auto max-w-6xl">

    {/* HEADER */}
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
          <Users
            className="text-blue-600 dark:text-blue-400"
            size={28}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Shared Medical Records
          </h1>

          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Medical reports and prescriptions shared by patients
          </p>
        </div>
      </div>
    </div>

    {/* SUMMARY */}
    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">

      {/* REPORT COUNT */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
            <FileText className="text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Shared Reports
            </p>

            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {reports.length}
            </p>
          </div>
        </div>
      </div>

      {/* PRESCRIPTION COUNT */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
            <Pill className="text-green-600 dark:text-green-400" />
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Shared Prescriptions
            </p>

            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {prescriptions.length}
            </p>
          </div>
        </div>
      </div>

    </div>

    {/* ================= REPORTS ================= */}
    <section className="mb-10">

      <div className="mb-4 flex items-center gap-2">
        <FileText className="text-blue-600 dark:text-blue-400" />

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Shared Medical Reports
        </h2>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No reports have been shared with you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {reports.map((report) => (
            <div
              key={report._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/25">
                    <FileText
                      size={22}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {report.title || "Medical Report"}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.type || "Report"}
                    </p>
                  </div>

                </div>

                {report.fileType && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {report.fileType}
                  </span>
                )}

              </div>

              {/* PATIENT */}
              {report.patient && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Patient Details
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {report.patient.name || "Unknown Patient"}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {report.patient.age && `Age: ${report.patient.age}`}
                    {report.patient.age && report.patient.gender && " • "}
                    {report.patient.gender}
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">

                {report.uploadedBy && (
                  <p>
                    Uploaded by:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {report.uploadedBy}
                    </span>
                  </p>
                )}

                {report.createdAt && (
                  <p>
                    Date:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                )}

              </div>

              {/* FIXED VIEW REPORT BUTTON */}
              {report.fileUrl && (
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  View Report
                  <ExternalLink size={16} />
                </a>
              )}

            </div>
          ))}

        </div>
      )}

    </section>

    {/* ================= PRESCRIPTIONS ================= */}
    <section>

      <div className="mb-4 flex items-center gap-2">
        <Pill className="text-green-600 dark:text-green-400" />

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Shared Prescriptions
        </h2>
      </div>

      {prescriptions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No prescriptions have been shared with you yet.
        </div>
      ) : (
        <div className="space-y-6">

          {prescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >

              {/* PRESCRIPTION HEADER */}
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Prescription
                  </h3>

                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">

                    {prescription.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={15} />
                        {new Date(
                          prescription.createdAt
                        ).toLocaleDateString()}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Stethoscope size={15} />
                      Doctor Prescription
                    </span>

                  </div>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Shared
                </span>

              </div>

              {/* PATIENT DETAILS */}
              {prescription.patientId && (
                <div className="mb-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">

                  <h4 className="font-medium text-gray-700 dark:text-gray-200">
                    Patient Details
                  </h4>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {prescription.patientId.name || "Unknown Patient"}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {prescription.patientId.age &&
                      `Age: ${prescription.patientId.age}`}

                    {prescription.patientId.age &&
                      prescription.patientId.gender &&
                      " • "}

                    {prescription.patientId.gender}
                  </p>

                </div>
              )}

              {/* COMPLAINTS + DIAGNOSIS */}
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                  <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-200">
                    Complaints
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {prescription.complaints?.length > 0 ? (
                      prescription.complaints.map(
                        (complaint, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          >
                            {complaint}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-400">
                        No complaints recorded
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                  <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-200">
                    Diagnosis
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {prescription.diagnosis?.length > 0 ? (
                      prescription.diagnosis.map(
                        (diagnosis, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          >
                            {diagnosis}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-400">
                        No diagnosis recorded
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* MEDICINES */}
              <div className="mb-5">

                <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-200">
                  Medicines
                </h4>

                {prescription.medicines?.length > 0 ? (
                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[700px] border-collapse">

                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/60">
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
                        {prescription.medicines.map(
                          (medicine, index) => (
                            <tr
                              key={medicine._id || index}
                              className="border-b border-gray-200 last:border-0 dark:border-gray-800"
                            >
                              <td className="p-3 font-medium text-gray-800 dark:text-white">
                                {medicine.name || "-"}
                              </td>

                              <td className="p-3 text-gray-600 dark:text-gray-300">
                                {medicine.dosage || "-"}
                              </td>

                              <td className="p-3 text-gray-600 dark:text-gray-300">
                                {medicine.frequency || "-"}
                              </td>

                              <td className="p-3 text-gray-600 dark:text-gray-300">
                                {medicine.duration || "-"}
                              </td>

                              <td className="p-3 text-gray-600 dark:text-gray-300">
                                {medicine.instructions || "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No medicines recorded.
                  </p>
                )}

              </div>

              {/* TESTS */}
              {prescription.tests?.length > 0 && (
                <div className="mb-5">

                  <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
                    Tests
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {prescription.tests.map((test, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      >
                        {test}
                      </span>
                    ))}
                  </div>

                </div>
              )}

              {/* ADVICE */}
              {prescription.advice && (
                <div className="mb-5 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">

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

export default SharedMedicalData;
