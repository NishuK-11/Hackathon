




// import { useState } from "react";
// import { updateHospitalProfile } from "../../api/backend";

// // Defined OUTSIDE the component so it's not recreated on every render.
// // Keeping it inside the component caused React to remount inputs on
// // every keystroke (losing focus after each letter) and made the
// // multi-file gallery picker unreliable.
// const InputWrapper = ({ label, children, hint }) => (
//   <div className="space-y-4">
//     <label className="text-md font-bold text-gray-300">{label}</label>
//     {children}
//     {hint && <p className="text-xs text-green-500">{hint}</p>}
//   </div>
// );

// export default function CompleteProfile() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [form, setForm] = useState({
//     description: "",
//     address: "",
//     facilities: "",
//     timings: {
//       open: "",
//       close: "",
//     },
//   });

//   const [logo, setLogo] = useState(null);
//   const [coverImage, setCoverImage] = useState(null);
//   const [galleryImages, setGalleryImages] = useState([]);

//   const validate = () => {
//     if (!form.description.trim()) return "Description is required";
//     if (!form.address.trim()) return "Address is required";
//     if (!form.timings.open || !form.timings.close)
//       return "Opening and closing time are required";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const validationError = validate();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("description", form.description.trim());
//       formData.append("address", form.address.trim());

//       formData.append(
//         "facilities",
//         JSON.stringify(
//           form.facilities
//             .split(",")
//             .map((item) => item.trim())
//             .filter(Boolean)
//         )
//       );

//       formData.append("timings", JSON.stringify(form.timings));

//       if (logo) formData.append("logo", logo);
//       if (coverImage) formData.append("coverImage", coverImage);

//       galleryImages.forEach((img) => {
//         formData.append("galleryImages", img);
//       });

//       await updateHospitalProfile(formData);

//       alert("Profile updated successfully");

//       // reset form after success
//       setForm({
//         description: "",
//         address: "",
//         facilities: "",
//         timings: { open: "", close: "" },
//       });
//       setLogo(null);
//       setCoverImage(null);
//       setGalleryImages([]);
//     } catch (err) {
//       setError(err?.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeGalleryImage = (index) => {
//     setGalleryImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const inputClass =
//     "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-900/40";

//   return (
//     <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
//       <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
//           <h1 className="text-2xl font-bold text-white">
//             Complete Hospital Profile
//           </h1>
//           <p className="text-blue-100 text-md mt-1">
//             Add your hospital details to unlock dashboard features
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 text-white space-y-8">
//           {error && (
//             <div className="rounded-lg border border-red-700 bg-red-950/50 px-4 py-3 text-sm text-red-300">
//               {error}
//             </div>
//           )}

//           {/* Description */}
//           <InputWrapper label="Description">
//             <textarea
//               rows="4"
//               value={form.description}
//               onChange={(e) =>
//                 setForm({ ...form, description: e.target.value })
//               }
//               className={inputClass}
//               placeholder="Write about your hospital..."
//             />
//           </InputWrapper>

//           {/* Grid Inputs */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <InputWrapper label="Address">
//               <input
//                 value={form.address}
//                 onChange={(e) =>
//                   setForm({ ...form, address: e.target.value })
//                 }
//                 className={inputClass}
//                 placeholder="Hospital address"
//               />
//             </InputWrapper>

//             <InputWrapper label="Facilities" hint="Comma separated values">
//               <input
//                 value={form.facilities}
//                 onChange={(e) =>
//                   setForm({ ...form, facilities: e.target.value })
//                 }
//                 className={inputClass}
//                 placeholder="ICU, Pharmacy, Ambulance"
//               />
//             </InputWrapper>

//             <InputWrapper label="Opening Time">
//               <input
//                 type="time"
//                 value={form.timings.open}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     timings: { ...form.timings, open: e.target.value },
//                   })
//                 }
//                 className={inputClass}
//               />
//             </InputWrapper>

//             <InputWrapper label="Closing Time">
//               <input
//                 type="time"
//                 value={form.timings.close}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     timings: { ...form.timings, close: e.target.value },
//                   })
//                 }
//                 className={inputClass}
//               />
//             </InputWrapper>
//           </div>

//           {/* File Upload Section */}
//           <div className="grid md:grid-cols-3 gap-6">
//             <InputWrapper label="Logo">
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-800 file:px-4 file:py-2 file:text-gray-200 hover:file:bg-gray-700"
//                 onChange={(e) => setLogo(e.target.files[0] || null)}
//               />
//               {logo && (
//                 <p className="mt-2 text-sm text-green-400">
//                   Selected: {logo.name}
//                 </p>
//               )}
//             </InputWrapper>

//             <InputWrapper label="Cover Image">
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-800 file:px-4 file:py-2 file:text-gray-200 hover:file:bg-gray-700"
//                 onChange={(e) => setCoverImage(e.target.files[0] || null)}
//               />
//               {coverImage && (
//                 <p className="mt-2 text-sm text-green-400">
//                   Selected: {coverImage.name}
//                 </p>
//               )}
//             </InputWrapper>

//             <InputWrapper label="Gallery Images">
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 className="w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-800 file:px-4 file:py-2 file:text-gray-200 hover:file:bg-gray-700"
//                 onChange={(e) => {
//                   const newFiles = Array.from(e.target.files || []);
//                   setGalleryImages((prev) => {
//                     const combined = [...prev, ...newFiles];
//                     // dedupe by name+size+lastModified so re-picking
//                     // the same file twice doesn't add it again
//                     const seen = new Set();
//                     return combined.filter((f) => {
//                       const key = `${f.name}-${f.size}-${f.lastModified}`;
//                       if (seen.has(key)) return false;
//                       seen.add(key);
//                       return true;
//                     });
//                   });
//                   // reset so the same file(s) can be picked again later if removed
//                   e.target.value = "";
//                 }}
//               />
//               {galleryImages.length > 0 && (
//                 <div className="mt-2 space-y-1">
//                   {galleryImages.map((img, index) => (
//                     <div
//                       key={`${img.name}-${index}`}
//                       className="flex items-center justify-between gap-2"
//                     >
//                       <p className="text-sm text-green-400 truncate">
//                         {img.name}
//                       </p>
//                       <button
//                         type="button"
//                         onClick={() => removeGalleryImage(index)}
//                         className="text-xs text-red-400 hover:text-red-300"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </InputWrapper>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-semibold text-sm shadow-lg hover:bg-blue-700 transition disabled:opacity-60"
//           >
//             {loading ? "Saving Profile..." : "Complete Profile"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { updateHospitalProfile } from "../../api/backend";

// Defined OUTSIDE the component so it's not recreated on every render —
// keeping it inside caused inputs to lose focus on every keystroke.
const Field = ({ label, required, hint, children }) => (
  <div className="space-y-2">
    <label className="flex items-baseline gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      {required && <span className="text-teal-600 dark:text-teal-400">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
);

const SECTIONS = [
  { id: "basics", label: "Basic Details" },
  { id: "hours", label: "Location & Hours" },
  { id: "facilities", label: "Facilities" },
  { id: "media", label: "Photos & Branding" },
];

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dark mode: defaults to saved preference, falling back to system setting
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [form, setForm] = useState({
    description: "",
    address: "",
    facilities: "",
    timings: { open: "", close: "" },
  });

  const [logo, setLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);

  const sectionStatus = {
    basics: form.description.trim().length > 0,
    hours: Boolean(form.address.trim() && form.timings.open && form.timings.close),
    facilities: form.facilities.trim().length > 0,
    media: Boolean(logo || coverImage || galleryImages.length > 0),
  };
  const completedCount = Object.values(sectionStatus).filter(Boolean).length;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    if (!form.description.trim()) return "Description is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.timings.open || !form.timings.close)
      return "Opening and closing time are required";
    return "";
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setGalleryImages((prev) => {
      const combined = [...prev, ...newFiles];
      const seen = new Set();
      return combined.filter((f) => {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    e.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", form.description.trim());
      formData.append("address", form.address.trim());
      formData.append(
        "facilities",
        JSON.stringify(
          form.facilities.split(",").map((item) => item.trim()).filter(Boolean)
        )
      );
      formData.append("timings", JSON.stringify(form.timings));
      if (logo) formData.append("logo", logo);
      if (coverImage) formData.append("coverImage", coverImage);
      galleryImages.forEach((img) => formData.append("galleryImages", img));

      await updateHospitalProfile(formData);

      alert("Profile updated successfully");
      setForm({ description: "", address: "", facilities: "", timings: { open: "", close: "" } });
      setLogo(null);
      setCoverImage(null);
      setGalleryImages([]);
      setLogoPreview(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 " +
    "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/15";

  const fileButtonClass =
    "w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:border-teal-600 hover:file:text-teal-700 file:cursor-pointer cursor-pointer " +
    "dark:text-slate-400 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:border-teal-500 dark:hover:file:text-teal-400";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-blue-900/25 px-4 py-10 transition-colors sm:px-6 lg:px-10 dark:bg-black">
        <div className="mx-auto max-w-6xl">
          {/* Top identity bar */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
                Hospital Onboarding
              </p>
              <h1 className="mt-1 font-serif text-3xl text-slate-900 dark:text-slate-50">
                Complete your hospital profile
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                This information appears on your public listing and unlocks your dashboard.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end gap-1 sm:flex">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {completedCount} of {SECTIONS.length} sections complete
                </span>
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-500 dark:bg-teal-500"
                    style={{ width: `${(completedCount / SECTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Toggle dark mode"
                aria-pressed={darkMode}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-teal-600 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-500 dark:hover:text-teal-400"
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* Sidebar: identity preview + section checklist */}
            <aside className="lg:sticky lg:top-10 lg:self-start">
              <div className="rounded-xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Hospital logo" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-serif text-lg text-slate-300 dark:text-slate-600">H</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {form.address ? form.address.split(",")[0] : "Your hospital"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Draft profile</p>
                  </div>
                </div>

                <nav className="mt-6 space-y-1">
                  {SECTIONS.map((section) => {
                    const done = sectionStatus[section.id];
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                            done
                              ? "border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500"
                              : "border-slate-300 text-transparent dark:border-slate-600"
                          }`}
                        >
                          ✓
                        </span>
                        <span className={done ? "text-slate-700 dark:text-slate-200" : ""}>
                          {section.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <p className="mt-4 px-1 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                Fields marked <span className="text-teal-600 dark:text-teal-400">*</span> are
                required before you can publish your listing.
              </p>
            </aside>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* Basic Details */}
              <section id="basics" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors sm:p-8 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h2 className="font-serif text-xl text-slate-900 dark:text-slate-50">Basic details</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    A short, clear description helps patients understand what you offer.
                  </p>
                </div>
                <Field label="Description" required>
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. A 200-bed multi-specialty hospital offering 24/7 emergency care, diagnostics, and surgical services."
                  />
                </Field>
              </section>

              {/* Location & Hours */}
              <section id="hours" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors sm:p-8 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h2 className="font-serif text-xl text-slate-900 dark:text-slate-50">Location & hours</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Where patients can find you, and when you're open.
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Address" required>
                      <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className={inputClass}
                        placeholder="Street, area, city, state, PIN code"
                      />
                    </Field>
                  </div>
                  <Field label="Opening time" required>
                    <input
                      type="time"
                      value={form.timings.open}
                      onChange={(e) =>
                        setForm({ ...form, timings: { ...form.timings, open: e.target.value } })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Closing time" required>
                    <input
                      type="time"
                      value={form.timings.close}
                      onChange={(e) =>
                        setForm({ ...form, timings: { ...form.timings, close: e.target.value } })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>

              {/* Facilities */}
              <section id="facilities" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors sm:p-8 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h2 className="font-serif text-xl text-slate-900 dark:text-slate-50">Facilities</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    List what's available, separated by commas.
                  </p>
                </div>
                <Field label="Facilities" hint="e.g. ICU, Pharmacy, Ambulance, Blood Bank">
                  <input
                    value={form.facilities}
                    onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                    className={inputClass}
                    placeholder="ICU, Pharmacy, Ambulance"
                  />
                </Field>
                {form.facilities.trim() && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.facilities
                      .split(",")
                      .map((f) => f.trim())
                      .filter(Boolean)
                      .map((f, i) => (
                        <span
                          key={`${f}-${i}`}
                          className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                        >
                          {f}
                        </span>
                      ))}
                  </div>
                )}
              </section>

              {/* Media */}
              <section id="media" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors sm:p-8 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h2 className="font-serif text-xl text-slate-900 dark:text-slate-50">Photos & branding</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Your logo, a cover photo, and a few gallery images for your listing.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Logo">
                    <input type="file" accept="image/*" className={fileButtonClass} onChange={handleLogoChange} />
                    {logo && (
                      <p className="mt-2 text-xs text-teal-700 dark:text-teal-400">
                        Selected: {logo.name}
                      </p>
                    )}
                  </Field>

                  <Field label="Cover image">
                    <input
                      type="file"
                      accept="image/*"
                      className={fileButtonClass}
                      onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    />
                    {coverImage && (
                      <p className="mt-2 text-xs text-teal-700 dark:text-teal-400">
                        Selected: {coverImage.name}
                      </p>
                    )}
                  </Field>
                </div>

                <div className="mt-6">
                  <Field
                    label="Gallery images"
                    hint="Select files multiple times to add more — they'll all be kept."
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className={fileButtonClass}
                      onChange={handleGalleryChange}
                    />
                  </Field>

                  {galleryImages.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {galleryImages.map((img, index) => (
                        <div
                          key={`${img.name}-${index}`}
                          className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
                        >
                          <span className="truncate text-xs text-slate-600 dark:text-slate-300">
                            {img.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="shrink-0 text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Submit bar */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 transition-colors sm:px-8 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {completedCount} of {SECTIONS.length} sections complete
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500"
                >
                  {loading ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}