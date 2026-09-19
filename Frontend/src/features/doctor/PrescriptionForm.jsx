// PrescriptionForm.jsx
// Ek hi editable form — manual entry aur AI-generated draft dono isi me dikhte hain.
// Isse doctor ko hamesha same layout milta hai, sirf ek "AI draft" banner ka farq.

import React from "react";

const PrescriptionForm = ({
  form,
  source,
  loading,
  onFieldChange,
  onMedicineChange,
  onAddMedicine,
  onRemoveMedicine,
  onSubmit,
}) => {
  const isAiDraft = source === "ai" || source === "ocr";

  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isAiDraft ? "Review prescription" : "Manual prescription"}
        </h2>

        {isAiDraft && (
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
            Filled from {source === "ocr" ? "scanned image" : "your description"}
          </span>
        )}
      </div>

      {isAiDraft && (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Check every medicine name, dose and duration before saving. Nothing is stored until you save.
        </p>
      )}

      <div className="mb-5">
        <label className="mb-2 block font-medium text-gray-700">Complaints</label>
        <input
          type="text"
          value={form.complaints}
          onChange={(e) => onFieldChange("complaints", e.target.value)}
          placeholder="Fever, Headache"
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-5">
        <label className="mb-2 block font-medium text-gray-700">Diagnosis</label>
        <input
          type="text"
          value={form.diagnosis}
          onChange={(e) => onFieldChange("diagnosis", e.target.value)}
          placeholder="Viral fever"
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="font-medium text-gray-700">
            Medicines
            <span className="ml-2 text-sm font-normal text-gray-400">
              {form.medicines.filter((m) => m.name.trim()).length} added
            </span>
          </label>

          <button
            type="button"
            onClick={onAddMedicine}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          >
            Add medicine
          </button>
        </div>

        <div className="space-y-4">
          {form.medicines.map((medicine, index) => (
            <div key={index} className="rounded-lg border bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Medicine {index + 1}</h3>

                {form.medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveMedicine(index)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => onMedicineChange(index, "name", e.target.value)}
                  className="rounded-lg border p-3 outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Dosage e.g. 500mg"
                  value={medicine.dosage}
                  onChange={(e) => onMedicineChange(index, "dosage", e.target.value)}
                  className="rounded-lg border p-3 outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Frequency e.g. BD"
                  value={medicine.frequency}
                  onChange={(e) => onMedicineChange(index, "frequency", e.target.value)}
                  className="rounded-lg border p-3 outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Duration e.g. 5 days"
                  value={medicine.duration}
                  onChange={(e) => onMedicineChange(index, "duration", e.target.value)}
                  className="rounded-lg border p-3 outline-none focus:border-blue-500"
                />
              </div>

              <input
                placeholder="Instructions e.g. after food"
                value={medicine.instructions}
                onChange={(e) => onMedicineChange(index, "instructions", e.target.value)}
                className="mt-3 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-2 block font-medium text-gray-700">Tests</label>
        <input
          type="text"
          value={form.tests}
          onChange={(e) => onFieldChange("tests", e.target.value)}
          placeholder="CBC, LFT"
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-5">
        <label className="mb-2 block font-medium text-gray-700">Advice</label>
        <textarea
          value={form.advice}
          onChange={(e) => onFieldChange("advice", e.target.value)}
          placeholder="Take rest and drink plenty of water"
          rows={4}
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block font-medium text-gray-700">Follow-up date</label>
        <input
          type="date"
          value={form.followUpDate}
          onChange={(e) => onFieldChange("followUpDate", e.target.value)}
          className="rounded-lg border p-3 outline-none focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save prescription"}
      </button>
    </form>
  );
};

export default PrescriptionForm;