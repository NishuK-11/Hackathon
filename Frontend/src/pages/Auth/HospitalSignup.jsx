import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { registerHospital } from "../../api/backend";
import { MdMyLocation } from "react-icons/md";
import { ROLE } from "../../constants/Role";

export default function HospitalSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hospitalLicense: "",
    phone_number: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [locationFetched, setLocationFetched] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGeoLocation = () => {
    setLocLoading(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported ❌");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat,
                lon: lng,
                format: "json",
                addressdetails: 1,
              },
              headers: {
                Accept: "application/json",
              },
            }
          );

          const address = response.data.address;

          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
            city:
              address.city ||
              address.town ||
              address.village ||
              address.county ||
              "",
            state: address.state || "",
            pincode: address.postcode || prev.pincode,
          }));

          setLocationFetched(true);
          toast.success("Location captured successfully 📍");
        } catch (error) {
          console.error(error);
          toast.error("Failed to fetch address ❌");
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Location access denied ❌");
        setLocLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      toast.warning("Please fetch hospital location 📍");
      return;
    }

    const toastId = toast.loading("Registering hospital...");

    try {
      setLoading(true);

      const response = await registerHospital({
        name: formData.name,
        email: formData.email,
        hospitalLicense: formData.hospitalLicense,
        phone_number: formData.phone_number,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
      });

      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("role", ROLE.admin);
      localStorage.setItem("user", JSON.stringify(response.data.data.admin));

      toast.update(toastId, {
        render: "Hospital registered successfully 🎉",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      navigate("/hospital-dashboard");
    } catch (error) {
      toast.update(toastId, {
        render: error?.response?.data?.message || "Registration failed ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-4.5 text-md text-slate-100 placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30";
  const readOnlyClass =
    "w-full rounded-lg border border-slate-800 bg-slate-800/30 px-3.5 py-2.5 text-md text-slate-400 placeholder-slate-600 cursor-not-allowed";
  const labelClass = "block text-lg font-medium text-slate-300 mb-1.5";

  return (
    <div className="min-h-screen w-full bg-slate-950 px-6 py-10 lg:px-16">
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl shadow-black/40">
        {/* Header */}
        <div className="border-b border-slate-800 px-8 py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-md font-bold uppercase tracking-wider text-teal-400 mb-1">
              Facility Onboarding
            </p>
            <h2 className="text-3xl font-bold text-slate-100">
              Register Hospital
            </h2>
            <p className="text-md text-slate-400 mt-2">
              Add your facility and create the admin login.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-300">
            Step 1 of 1 · ~3 min
          </span>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-10">
          {/* Hospital details */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-4 w-4 rounded-full bg-teal-400" />
              <h3 className="text-lg  uppercase tracking-wider text-blue-300 font-bold">
                Hospital Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Hospital Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. City Care Hospital"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Hospital License Number</label>
                <input
                  type="text"
                  name="hospitalLicense"
                  placeholder="License / registration number"
                  value={formData.hospitalLicense}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="hospital@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="+91 00000 00000"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-4 w-4 rounded-full bg-amber-400" />
              <h3 className="text-lg font-bold uppercase tracking-wider text-blue-300">
                Location
              </h3>
            </div>

            <button
              type="button"
              onClick={handleGeoLocation}
              disabled={locLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-5 py-2.5 text-md font-medium text-teal-300 transition hover:bg-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <MdMyLocation size={18} />
              {locLoading ? "Fetching location…" : "Use current location"}
            </button>

            {locationFetched && (
              <p className="text-sm text-teal-400 mb-4">
                📍 Location captured successfully
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Detected automatically"
                  value={formData.city}
                  readOnly
                  className={readOnlyClass}
                />
              </div>

              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Detected automatically"
                  value={formData.state}
                  readOnly
                  className={readOnlyClass}
                />
              </div>

              <div>
                <label className={labelClass}>Pincode</label>
                <input
                  type="number"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Admin account */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin Account
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Admin Name</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Admin Email (Login)</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Admin Password</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-500 px-8 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering…" : "Register Hospital"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}