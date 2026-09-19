import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FilePenLine,
  ShieldCheck,
} from "lucide-react";
import WebcamMedicineOCR from "./WebcamMedicineOCR";
import api from "../../api/axiosInstance";

const initialMedicine = {
  name: "",
  genericName: "",
  strength: "",
  dosageForm: "",
  manufacturer: "",
  batchNumber: "",
  manufacturingDate: "",
  expiryDate: "",
  mrp: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  reorderLevel: "",
  prescriptionRequired: false,
};

const AddMedicine = () => {
  const navigate = useNavigate();

  const [method, setMethod] = useState(null);
  const [medicine, setMedicine] = useState(initialMedicine);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setMedicine((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOCRResult = (ocrData) => {
    setMedicine((prev) => ({
      ...prev,
      ...ocrData,
    }));

    setMethod("ocr");
  };

  const validateMedicine = () => {
    if (!medicine.name.trim()) {
      alert("Medicine name is required.");
      return false;
    }

    if (!medicine.batchNumber.trim()) {
      alert("Batch number is required.");
      return false;
    }

    if (!medicine.expiryDate.trim()) {
      alert("Expiry date is required.");
      return false;
    }

    if (!medicine.quantity) {
      alert("Quantity is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMedicine()) return;

    try {
      setSaving(true);

      const response = await api.post("/pharmacy/add-medicine", {
        medicineName: medicine.name.trim(),
        strength: medicine.strength.trim(),
        batchNumber: medicine.batchNumber.trim(),
        manufacturingDate: medicine.manufacturingDate.trim(),
        expiryDate: medicine.expiryDate.trim(),
        price: Number(medicine.sellingPrice || medicine.mrp || medicine.purchasePrice || 0),
        stock: Number(medicine.quantity),
        manufacturer: medicine.manufacturer.trim(),
        description: medicine.genericName.trim(),
        addedVia: method === "ocr" ? "OCR" : "MANUAL",
      });

      if (!response.data?.success) {
        throw new Error(response.data?.msg || "Failed to add medicine");
      }

      alert("Medicine added successfully.");
      setMedicine(initialMedicine);
      setMethod(null);
      navigate("/pharmacy-dashboard");

    } catch (error) {
      console.error(error);
      alert("Failed to add medicine.");
    } finally {
      setSaving(false);
    }
  };

  if (!method) {
    return (
      <div className="min-h-[calc(100vh-120px)]">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">

          <button
            onClick={() => navigate("/pharmacy-dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Add Medicine
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Choose how you want to add medicine to your inventory
            </p>
          </div>

        </div>

        {/* Options */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Manual */}
          <button
            onClick={() => setMethod("manual")}
            className="group rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-8 text-left transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <FilePenLine
                size={29}
                className="text-green-600"
              />
            </div>

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add Manually
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Enter medicine details manually into the inventory.
                </p>
              </div>

              <ArrowRight
                size={20}
                className="text-green-600 transition group-hover:translate-x-1"
              />

            </div>

            <div className="mt-7 space-y-3">

              <Feature text="Enter medicine information step by step" />
              <Feature text="Add price, stock, expiry date and more" />
              <Feature text="Best for single medicine entry" />

            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white">
              Add Manually
              <ArrowRight size={17} />
            </div>

          </button>

          {/* OCR */}
          <button
            onClick={() => setMethod("ocr")}
            className="group relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 text-left transition hover:-translate-y-1 hover:shadow-lg"
          >

            <span className="absolute right-6 top-6 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Recommended
            </span>

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Camera
                size={29}
                className="text-blue-600"
              />
            </div>

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Upload via Webcam OCR
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Scan the medicine strip and automatically extract details.
                </p>
              </div>

              <ArrowRight
                size={20}
                className="text-blue-600 transition group-hover:translate-x-1"
              />

            </div>

            <div className="mt-7 space-y-3">

              <Feature text="Use webcam to capture medicine strip" />
              <Feature text="OCR extracts medicine information automatically" />
              <Feature text="Review and edit before saving" />

            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
              Start Webcam OCR
              <ArrowRight size={17} />
            </div>

          </button>

        </div>

        {/* Security */}
        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-3">

            <ShieldCheck
              size={22}
              className="mt-0.5 text-blue-600"
            />

            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Review before saving
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                OCR extracted information should always be reviewed by the
                pharmacy staff before adding it to inventory.
              </p>
            </div>

          </div>

        </div>

      </div>
    );
  }

  if (method === "ocr") {
    return (
      <WebcamMedicineOCR
        onBack={() => setMethod(null)}
        onExtract={handleOCRResult}
        initialData={medicine}
      />
    );
  }

  return (
    <ManualMedicineForm
      medicine={medicine}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      saving={saving}
      onBack={() => setMethod(null)}
    />
  );
};

const Feature = ({ text }) => (
  <div className="flex items-center gap-3 text-sm text-slate-600">
    <CheckCircle2
      size={17}
      className="shrink-0 text-green-600"
    />
    {text}
  </div>
);

const ManualMedicineForm = ({
  medicine,
  handleChange,
  handleSubmit,
  saving,
  onBack,
}) => {
  return (
    <div>

      {/* Header */}
      <div className="mb-7 flex items-center gap-4">

        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Add Medicine Manually
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enter complete medicine and inventory details.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        {/* Basic Information */}
        <FormSection title="Basic Information">

          <Input
            label="Medicine Name"
            name="name"
            value={medicine.name}
            onChange={handleChange}
            placeholder="e.g. Paracetamol"
            required
          />

          <Input
            label="Generic Name"
            name="genericName"
            value={medicine.genericName}
            onChange={handleChange}
            placeholder="e.g. Paracetamol IP"
          />

          <Input
            label="Strength"
            name="strength"
            value={medicine.strength}
            onChange={handleChange}
            placeholder="e.g. 650 mg"
          />

          <Select
            label="Dosage Form"
            name="dosageForm"
            value={medicine.dosageForm}
            onChange={handleChange}
            options={[
              "Tablet",
              "Capsule",
              "Syrup",
              "Injection",
              "Cream",
              "Ointment",
              "Drops",
              "Powder",
              "Other",
            ]}
          />

          <Input
            label="Manufacturer"
            name="manufacturer"
            value={medicine.manufacturer}
            onChange={handleChange}
            placeholder="Manufacturer name"
          />

        </FormSection>

        {/* Batch */}
        <FormSection title="Batch & Expiry">

          <Input
            label="Batch Number"
            name="batchNumber"
            value={medicine.batchNumber}
            onChange={handleChange}
            placeholder="e.g. AB12345"
            required
          />

          <Input
            label="Manufacturing Date"
            name="manufacturingDate"
            value={medicine.manufacturingDate}
            onChange={handleChange}
            placeholder="MM/YYYY"
          />

          <Input
            label="Expiry Date"
            name="expiryDate"
            value={medicine.expiryDate}
            onChange={handleChange}
            placeholder="MM/YYYY"
            required
          />

        </FormSection>

        {/* Pricing */}
        <FormSection title="Pricing">

          <Input
            label="MRP"
            name="mrp"
            type="number"
            value={medicine.mrp}
            onChange={handleChange}
            placeholder="₹ 0.00"
          />

          <Input
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            value={medicine.purchasePrice}
            onChange={handleChange}
            placeholder="₹ 0.00"
          />

          <Input
            label="Selling Price"
            name="sellingPrice"
            type="number"
            value={medicine.sellingPrice}
            onChange={handleChange}
            placeholder="₹ 0.00"
          />

        </FormSection>

        {/* Inventory */}
        <FormSection title="Inventory">

          <Input
            label="Quantity"
            name="quantity"
            type="number"
            value={medicine.quantity}
            onChange={handleChange}
            placeholder="Enter stock quantity"
            required
          />

          <Input
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            value={medicine.reorderLevel}
            onChange={handleChange}
            placeholder="e.g. 10"
          />

          <div className="flex items-center gap-3 pt-7">
            <input
              id="prescriptionRequired"
              type="checkbox"
              name="prescriptionRequired"
              checked={medicine.prescriptionRequired}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />

            <label
              htmlFor="prescriptionRequired"
              className="text-sm text-slate-600"
            >
              Prescription required
            </label>
          </div>

        </FormSection>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">

          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add to Inventory"}
          </button>

        </div>

      </form>

    </div>
  );
};

const FormSection = ({ title, children }) => (
  <section className="mb-8">

    <h2 className="mb-4 text-base font-semibold text-slate-800">
      {title}
    </h2>

    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>

  </section>
);

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="">Select form</option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default AddMedicine;