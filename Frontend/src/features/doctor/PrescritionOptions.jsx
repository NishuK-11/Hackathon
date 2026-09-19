import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";
import {
  addPrescriptionImage,
  ManualPrescription,
  PrescriptionDescription,
} from "../../api/backend";
import { useParams, useSearchParams } from "react-router-dom";

const PrescriptionOptions = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  const { id: patientId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [method, setMethod] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [prescription, setPrescription] = useState({
    appointmentId: appointmentId || "",
    complaints: [],
    diagnosis: [],
    medicines: [],
    tests: [],
    advice: "",
    attachments: [],
    followUpDate: "",
  });

  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [tests, setTests] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);
  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null);

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  ///manual submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      if (!patientId) {
        setMessage("Patient ID is missing.");
        return;
      }

      if (!appointmentId) {
        setMessage("Appointment ID is missing.");
        return;
      }

      const formData = new FormData();

      formData.append("patientId", patientId);
      formData.append("appointmentId", appointmentId);

      formData.append(
        "complaints",
        JSON.stringify(
          complaints
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      formData.append(
        "diagnosis",
        JSON.stringify(
          diagnosis
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      formData.append("medicines", JSON.stringify(medicines));

      formData.append(
        "tests",
        JSON.stringify(
          tests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      formData.append("advice", advice);
      formData.append("followUpDate", followUpDate);

      const response = await ManualPrescription(formData);
      setMessage("Prescription created successfully!");

      setComplaints("");
      setDiagnosis("");
      setTests("");
      setAdvice("");
      setFollowUpDate("");

      setMedicines([
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ]);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      setMessage("Please select a prescription image.");
      return;
    }

    if (!appointmentId) {
      setMessage("Appointment ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", image);
      formData.append("appointmentId", appointmentId);

      const response = await addPrescriptionImage(formData);

      if (response.data.success) {
        const prescriptionData = response.data.prescription;

        setPrescription({
          appointmentId: prescriptionData.appointmentId,
          complaints: prescriptionData.complaints || [],
          diagnosis: prescriptionData.diagnosis || [],
          medicines: prescriptionData.medicines || [],
          tests: prescriptionData.tests || [],
          advice: prescriptionData.advice || "",
          attachments: prescriptionData.attachments || [],
          followUpDate: prescriptionData.followUpDate || "",
        });

        setMessage("Prescription extracted and saved successfully.");
      }
    } catch (error) {
      console.error("Prescription Error:", error);
      setMessage(
        error.response?.data?.message || "Failed to process prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // DESCRIPTION / AI PARSE
  // -----------------------------

  const handleDescriptionParse = async () => {
    if (!description.trim()) {
      setMessage("Please enter prescription description.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await PrescriptionDescription({
        appointmentId,
        prescriptionText: description,
      });

      const extracted =
        response.data?.data || response.data?.result || response.data;

      setComplaints(
        Array.isArray(extracted.complaints)
          ? extracted.complaints.join(", ")
          : extracted.complaints || ""
      );

      setDiagnosis(
        Array.isArray(extracted.diagnosis)
          ? extracted.diagnosis.join(", ")
          : extracted.diagnosis || ""
      );

      setTests(
        Array.isArray(extracted.tests)
          ? extracted.tests.join(", ")
          : extracted.tests || ""
      );

      setAdvice(extracted.advice || "");

      setFollowUpDate(
        extracted.followUpDate ? extracted.followUpDate.split("T")[0] : ""
      );

      const aiMedicines = Array.isArray(extracted.medicines)
        ? extracted.medicines
        : [];

      const formattedMedicines = aiMedicines.map((medicine) => ({
        name: medicine.name || "",
        dosage: medicine.dosage || medicine.strength || "",
        frequency: medicine.frequency || "",
        duration: medicine.duration
          ? String(medicine.duration).includes("day")
            ? String(medicine.duration)
            : `${medicine.duration} days`
          : "",
        instructions: medicine.instructions || "",
      }));

      setMedicines(
        formattedMedicines.length > 0
          ? formattedMedicines
          : [
              {
                name: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
              },
            ]
      );

      setPrescription({
        appointmentId,
        complaints: extracted.complaints || [],
        diagnosis: extracted.diagnosis || [],
        medicines: formattedMedicines,
        tests: extracted.tests || [],
        advice: extracted.advice || "",
        attachments: extracted.attachments || [],
        followUpDate: extracted.followUpDate || "",
      });

      setMethod("manual");

      setMessage(
        "AI prescription generated. Please review and edit the form before saving."
      );
    } catch (error) {
      console.error("Parse Error:", error);
      setMessage(
        error.response?.data?.message || "Failed to generate prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FINAL SUBMIT OCR / AI
  // -----------------------------

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        CREATE_PRESCRIPTION_API,
        prescription,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Prescription saved successfully!");
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to save prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // PREVIEW COMPONENT
  // -----------------------------

  const PrescriptionPreview = () => {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm dark:shadow-none">
        <h2 className="mb-5 text-xl font-semibold text-slate-800 dark:text-gray-100">
          Prescription Preview
        </h2>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-gray-300 text-sm">
            Complaints
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            {prescription.complaints?.length
              ? prescription.complaints.join(", ")
              : "No complaints"}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-gray-300 text-sm">
            Diagnosis
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            {prescription.diagnosis?.length
              ? prescription.diagnosis.join(", ")
              : "No diagnosis"}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-slate-700 dark:text-gray-300 text-sm">
            Medicines
          </h3>

          <div className="space-y-3">
            {prescription.medicines?.map((medicine, index) => (
              <div
                key={index}
                className="rounded-xl bg-slate-50 dark:bg-gray-800/40 p-4"
              >
                <p className="font-medium text-slate-800 dark:text-gray-100">
                  {medicine.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  {medicine.dosage} • {medicine.frequency} •{" "}
                  {medicine.duration}
                </p>
                <p className="text-sm text-slate-500 dark:text-gray-500">
                  {medicine.instructions}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-gray-300 text-sm">
            Tests
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            {prescription.tests?.length
              ? prescription.tests.join(", ")
              : "No tests"}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-gray-300 text-sm">
            Advice
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            {prescription.advice || "No advice"}
          </p>
        </div>

        <div className="mb-5">
          <h3 className="font-semibold text-slate-700 dark:text-gray-300 text-sm">
            Follow-up Date
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            {prescription.followUpDate || "Not specified"}
          </p>
        </div>

        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-2.5 font-medium text-white transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Confirm & Save Prescription"}
        </button>
      </div>
    );
  };

  // -----------------------------
  // METHOD CARD (shared style)
  // -----------------------------

  const inputClass =
    "w-full rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 p-3 outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500/70 focus:border-teal-600";

  const MethodCard = ({ id, icon, title, text }) => (
    <button
      type="button"
      onClick={() => setMethod(id)}
      className={`rounded-xl border p-6 text-left transition hover:border-teal-600 hover:shadow-md dark:hover:shadow-none ${
        method === id
          ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-500"
          : "border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0B1220]"
      }`}
    >
      <div className="mb-3 text-3xl">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{text}</p>
    </button>
  );

  // -----------------------------
  // MAIN UI
  // -----------------------------

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <div className="mx-auto max-w-6xl p-6">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
              Create Prescription
            </h1>
            <p className="mt-1 text-slate-500 dark:text-gray-400">
              Choose how you want to create the prescription.
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium whitespace-nowrap shrink-0"
          >
            {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-5 mt-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/40 p-3 text-teal-800 dark:text-teal-300 text-sm">
            {message}
          </div>
        )}

        {/* OPTIONS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mt-6">
          <MethodCard
            id="manual"
            icon="✍️"
            title="Manual Prescription"
            text="Enter complaints, diagnosis, medicines, tests and advice manually."
          />
          <MethodCard
            id="image"
            icon="📷"
            title="Upload Prescription"
            text="Upload an existing prescription image and extract its information using OCR."
          />
          <MethodCard
            id="description"
            icon="🤖"
            title="Describe Prescription"
            text="Describe the prescription in normal language and let AI structure it."
          />
        </div>

        {/* ================================================= */}
        {/* MANUAL FORM */}
        {/* ================================================= */}

        {method === "manual" && (
          <form
            onSubmit={handleManualSubmit}
            className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm dark:shadow-none"
          >
            <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-gray-100">
              Manual Prescription
            </h2>

            <div className="mb-5">
              <label className="mb-2 block font-medium text-slate-700 dark:text-gray-300">
                Complaints
              </label>
              <input
                type="text"
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Fever, Headache"
                className={inputClass}
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block font-medium text-slate-700 dark:text-gray-300">
                Diagnosis
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Viral Fever"
                className={inputClass}
              />
            </div>

            {/* MEDICINES */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="font-medium text-slate-700 dark:text-gray-300">
                  Medicines
                </label>

                <button
                  type="button"
                  onClick={addMedicine}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-3 py-2 text-sm text-white transition"
                >
                  + Add Medicine
                </button>
              </div>

              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/30 p-4"
                  >
                    <div className="mb-3 flex justify-between">
                      <h3 className="font-medium text-slate-800 dark:text-gray-200">
                        Medicine {index + 1}
                      </h3>

                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                        className={inputClass}
                        required
                      />

                      <input
                        placeholder="Dosage e.g. 500mg"
                        value={medicine.dosage}
                        onChange={(e) =>
                          handleMedicineChange(index, "dosage", e.target.value)
                        }
                        className={inputClass}
                      />

                      <input
                        placeholder="Frequency e.g. BD"
                        value={medicine.frequency}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                      <input
                        placeholder="Duration e.g. 5 days"
                        value={medicine.duration}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <input
                      placeholder="Instructions e.g. After food"
                      value={medicine.instructions}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "instructions",
                          e.target.value
                        )
                      }
                      className={`mt-3 ${inputClass}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block font-medium text-slate-700 dark:text-gray-300">
                Tests
              </label>
              <input
                type="text"
                value={tests}
                onChange={(e) => setTests(e.target.value)}
                placeholder="CBC, LFT"
                className={inputClass}
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block font-medium text-slate-700 dark:text-gray-300">
                Advice
              </label>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Take proper rest and drink plenty of water"
                rows={4}
                className={inputClass}
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-slate-700 dark:text-gray-300">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className={`w-fit ${inputClass}`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-6 py-3 font-medium text-white transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Prescription"}
            </button>
          </form>
        )}

        {/* ================================================= */}
        {/* IMAGE FORM */}
        {/* ================================================= */}

        {method === "image" && (
          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm dark:shadow-none">
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-gray-100">
              Upload Prescription Image
            </h2>
            <p className="mb-5 text-sm text-slate-500 dark:text-gray-400">
              Upload a clear prescription image. OCR will extract the
              prescription details.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mb-5 block w-full rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 p-3 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 dark:file:bg-teal-900/25 file:text-teal-700 dark:file:text-teal-400 file:px-3 file:py-1.5"
            />

            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Prescription preview"
                className="mb-5 max-h-80 rounded-lg border border-slate-200 dark:border-gray-800 object-contain"
              />
            )}

            <button
              onClick={handleImageUpload}
              disabled={loading || !image}
              className="rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-6 py-3 font-medium text-white transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Extract Prescription"}
            </button>

            {prescription.medicines?.length > 0 && <PrescriptionPreview />}
          </div>
        )}

        {/* ================================================= */}
        {/* DESCRIPTION FORM */}
        {/* ================================================= */}

        {method === "description" && (
          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm dark:shadow-none">
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-gray-100">
              Describe Prescription
            </h2>
            <p className="mb-5 text-sm text-slate-500 dark:text-gray-400">
              Write the prescription in normal language. AI will convert it
              into structured data.
            </p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Example: Fever and headache. Viral fever. Paracetamol 500 BD for 5 days after food, cetirizine 10 OD for 3 days at night. CBC test. Rest and drink plenty of water. Follow up after 5 days."
              className={`mb-5 ${inputClass}`}
            />

            <button
              onClick={handleDescriptionParse}
              disabled={loading || !description.trim()}
              className="rounded-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 px-6 py-3 font-medium text-white transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Prescription"}
            </button>

            {prescription.medicines?.length > 0 && <PrescriptionPreview />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionOptions;