import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addDoctor } from "../../api/backend";
import { toast } from "react-toastify";

const AddDoctor = () => {
  console.log("enterred");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number:""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await addDoctor(formData);
      if (res.data.success) {
        toast.success(res.data.message || "Doctor created successfully"
        );
      setFormData({ name: "", email: "", phone_number: "" });
      navigate("/hospital-dashboard/doctors");
    }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.message || "Soemthing went wrong"
      )
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      {/* Modal Box */}
      <div className="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={() => navigate("/hospital-dashboard/doctors")}   // 🔥 FIX
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-blue-400">
          Add Doctor
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Create a new Doctor
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <textarea
              name="email"
              value={formData.email}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>


           <div>
            <label className="text-sm text-slate-300">Phone Number</label>
            <textarea
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">

            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate("/hospital-dashboard/doctors")} // 🔥 FIX
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
            >
              Cancel
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
            >
              Create Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;