import { useEffect, useState } from "react";
import { TbBadgeFilled } from "react-icons/tb";
import { getAllDepartments, submitProfile } from "../../api/backend";

export default function CompleteProfileModal({
  onClose,
  refreshDoctorStatus,
}) {
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    position: "",
    department: "",
    experience: "",
    registrationNumber: "",
    consultationFee: "",
    specialisations: "",
    languages: "",

    onlineAvailability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getAllDepartments();
      setDepartments(res.data.departments);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      onlineAvailability: {
        ...prev.onlineAvailability,
        [day]: !prev.onlineAvailability[day],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      position: formData.position,
      department: formData.department,
      experience: Number(formData.experience),

      specialisations: formData.specialisations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      onlineAvailability: formData.onlineAvailability,

      registrationNumber: formData.registrationNumber,

      consultationFee: Number(formData.consultationFee),

      languages: formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean),
    };

    console.log("PROFILE PAYLOAD:", payload);

    try {
      await submitProfile(payload);
      await refreshDoctorStatus();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 p-8">
          <div className="flex items-center gap-4">
            <TbBadgeFilled
              size={35}
              className="text-blue-400"
            />

            <div>
              <h2 className="text-2xl font-bold text-white">
                Complete Your Profile
              </h2>

              <p className="text-slate-400 mt-1">
                Complete your profile to unlock OPD,
                appointments and patient management.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8"
        >
          <div className="grid md:grid-cols-2 gap-5">

            {/* Position */}
            <InputField
              name="position"
              value={formData.position}
              onChange={handleChange}
              label="Position"
              placeholder="Junior Consultant"
            />

            {/* Department */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Department
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white"
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((dept) => (
                  <option
                    key={dept._id}
                    value={dept._id}
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <InputField
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              label="Experience (Years)"
              type="number"
              placeholder="5"
            />

            {/* Registration */}
            <InputField
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              label="Registration Number"
              placeholder="MED-1256"
            />

            {/* Consultation Fee */}
            <InputField
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              label="Consultation Fee"
              type="number"
              placeholder="800"
            />

            {/* Specialisations */}
            <InputField
              name="specialisations"
              value={formData.specialisations}
              onChange={handleChange}
              label="Specialisations"
              placeholder="Cardiology, Interventional Cardiology"
            />

            {/* Languages */}
            <InputField
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              label="Languages"
              placeholder="English, Hindi"
            />

            {/* Online Availability */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-3">
                Online Consultation Availability
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {days.map((day) => {
                  const active =
                    formData.onlineAvailability[day];

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-3 rounded-xl border capitalize transition ${
                        active
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-slate-700 bg-slate-900 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{day}</span>

                        <span
                          className={`w-4 h-4 rounded-full ${
                            active
                              ? "bg-blue-500"
                              : "bg-slate-700"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Select the days on which you accept online
                consultations.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
            >
              Complete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>

      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="
          w-full
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-slate-500
          focus:outline-none
          focus:border-blue-500
        "
      />
    </div>
  );
}