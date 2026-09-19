import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupPharmacy = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: ""
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));

        setLocationLoading(false);
      },
      () => {
        setError("Unable to get your location");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.lat || !formData.lng) {
      setError("Please select your location");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/pharmacy/signup",
        formData
      );

      setSuccess(response.data.msg);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.msg ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Pharmacy Signup
          </h1>

          <p className="text-gray-500 mt-2">
            Register your pharmacy with MediReach
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-600 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name
              </label>

              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Enter pharmacy name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name
              </label>

              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Enter owner name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="pharmacy@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* License */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>

              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter drug license number"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Address */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete pharmacy address"
              rows="3"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* City State Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Location */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">

            <div className="flex items-center justify-between mb-3">

              <div>
                <h3 className="font-semibold text-gray-800">
                  Pharmacy Location
                </h3>

                <p className="text-sm text-gray-500">
                  Required to show your pharmacy to nearby patients
                </p>
              </div>

              <button
                type="button"
                onClick={getLocation}
                disabled={locationLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "Get My Location"}
              </button>

            </div>

            {formData.lat && formData.lng && (
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs text-gray-500">
                    Latitude
                  </label>

                  <input
                    value={formData.lat}
                    readOnly
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Longitude
                  </label>

                  <input
                    value={formData.lng}
                    readOnly
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

              </div>
            )}

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-7 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Pharmacy Account"}
          </button>

        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default SignupPharmacy;