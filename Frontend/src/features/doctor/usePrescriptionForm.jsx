// usePrescriptionForm.js
// Ek hi jagah par prescription ka poora form state + API response ko form me
// convert karne ki saari logic. Manual, OCR aur AI-description — teeno isi ko use karte hain.

import { useState, useCallback } from "react";

export const emptyMedicine = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

/* ------------------------------------------------------------------ */
/* Normalizers — API kabhi array deta hai, kabhi string, kabhi null.   */
/* UI ko hamesha predictable shape chahiye.                            */
/* ------------------------------------------------------------------ */

export const toText = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
};

export const toList = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

// "2026-01-05T00:00:00.000Z" -> "2026-01-05"
// 5 / "5" / "5 days" / "after 5 days" -> aaj se 5 din baad ki date
// null / "" -> ""
export const toDateInput = (value) => {
  if (!value) return "";

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const days = raw.match(/(\d+)\s*(day|din|week|hafta|month|mahina)?/i);
  if (days) {
    const n = parseInt(days[1], 10);
    const unit = (days[2] || "day").toLowerCase();
    const multiplier = unit.startsWith("week") || unit.startsWith("haf") ? 7 : unit.startsWith("month") || unit.startsWith("mah") ? 30 : 1;

    const d = new Date();
    d.setDate(d.getDate() + n * multiplier);
    return d.toISOString().slice(0, 10);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

// AI/OCR alag-alag key naam bhej sakta hai — sab ko ek shape me laate hain.
export const toMedicines = (value) => {
  const list = Array.isArray(value) ? value : [];

  const mapped = list
    .map((m) => {
      if (typeof m === "string") return { ...emptyMedicine(), name: m };

      const duration = m.duration ?? m.days ?? "";

      return {
        name: m.name || m.medicine || m.drug || m.brand || "",
        dosage: m.dosage || m.dose || m.strength || "",
        frequency: m.frequency || m.freq || m.timing || m.schedule || "",
        duration:
          duration === "" || duration === null
            ? ""
            : /[a-z]/i.test(String(duration))
              ? String(duration)
              : `${duration} days`,
        instructions: m.instructions || m.instruction || m.notes || m.remarks || "",
      };
    })
    .filter((m) => m.name);

  return mapped.length ? mapped : [emptyMedicine()];
};

/* ------------------------------------------------------------------ */
/* API response  ->  form-ready object                                 */
/* ------------------------------------------------------------------ */

export const mapApiToForm = (payload = {}) => {
  // backend kabhi {data:{...}}, kabhi {result:{...}}, kabhi seedha object deta hai
  const d = payload?.data?.data || payload?.data?.result || payload?.data || payload;

  return {
    complaints: toText(d.complaints),
    diagnosis: toText(d.diagnosis),
    tests: toText(d.tests),
    advice: toText(d.advice),
    followUpDate: toDateInput(d.followUpDate),
    medicines: toMedicines(d.medicines),
  };
};

/* ------------------------------------------------------------------ */
/* Form  ->  FormData (jo aapka ManualPrescription endpoint expect     */
/* karta hai, aur wahi MongoDB me save karta hai)                      */
/* ------------------------------------------------------------------ */

export const buildFormData = (form, { patientId, appointmentId, source }) => {
  const fd = new FormData();

  fd.append("patientId", patientId);
  fd.append("appointmentId", appointmentId);

  fd.append("complaints", JSON.stringify(toList(form.complaints)));
  fd.append("diagnosis", JSON.stringify(toList(form.diagnosis)));
  fd.append("tests", JSON.stringify(toList(form.tests)));

  fd.append(
    "medicines",
    JSON.stringify(form.medicines.filter((m) => m.name.trim()))
  );

  fd.append("advice", form.advice || "");
  fd.append("followUpDate", form.followUpDate || "");
  fd.append("source", source || "manual"); // manual | ai | ocr

  return fd;
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

const initialForm = {
  complaints: "",
  diagnosis: "",
  tests: "",
  advice: "",
  followUpDate: "",
  medicines: [emptyMedicine()],
};

export default function usePrescriptionForm() {
  const [form, setForm] = useState(initialForm);
  const [source, setSource] = useState("manual");

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setMedicine = useCallback((index, field, value) => {
    setForm((prev) => {
      const medicines = prev.medicines.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      );
      return { ...prev, medicines };
    });
  }, []);

  const addMedicine = useCallback(() => {
    setForm((prev) => ({ ...prev, medicines: [...prev.medicines, emptyMedicine()] }));
  }, []);

  const removeMedicine = useCallback((index) => {
    setForm((prev) =>
      prev.medicines.length === 1
        ? prev
        : { ...prev, medicines: prev.medicines.filter((_, i) => i !== index) }
    );
  }, []);

  // yahi autofill ka dil hai — API response aate hi poora form bhar jaata hai
  const fillFromApi = useCallback((payload, from = "ai") => {
    const mapped = mapApiToForm(payload);
    setForm(mapped);
    setSource(from);
    return mapped;
  }, []);

  const reset = useCallback(() => {
    setForm(initialForm);
    setSource("manual");
  }, []);

  return {
    form,
    source,
    setField,
    setMedicine,
    addMedicine,
    removeMedicine,
    fillFromApi,
    reset,
  };
}