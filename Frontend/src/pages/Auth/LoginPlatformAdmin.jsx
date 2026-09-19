import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { platformLogin } from "../../api/backend";
import { ROLE } from "../../constants/Role";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";

const LoginPlatformAdmin = () => {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);

  if (token && role === ROLE.platform_admin) {
    return <Navigate to="/platform-dashboard" replace />;
  }

  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const response = await platformLogin(
        formData.email,
        formData.password
      );
      console.log(response.data);
      if (response.data.success) {
      dispatch(loginSuccess({
        token: response.data.token,
        role: response.data.user.role,
        user: response.data.user,
      }));

      navigate("/platform-dashboard");
    }
    }catch(error){
      console.error(error);
      alert(error?.response?.data?.message || "Login Failed")
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-blue-900 flex items-center justify-center px-4">
    <div className="absolute top-20 left-80 h-50 w-50 rounded-full bg-blue-600 shadow-[15px_15px_25px_rgba(0,0,0,0.25)]" />
    <div className="absolute top-[20vw] left-[80vw] h-150 w-150 rounded-full bg-blue-900 shadow-[15px_15px_25px_rgba(0,0,0,0.25)]" />
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg bg-white/5 border border-white/20">

        <div className="grid lg:grid-cols-2 min-h-[650px]">

          {/* Left Section */}
          <div className="hidden lg:flex flex-col justify-center px-16 text-white relative">

            <div className="absolute top-12 left-12">
              <ShieldCheck size={60} />
            </div>

            <h1 className="text-5xl font-bold leading-tight mt-10">
              Welcome Back,
              <br />
              Administrator
            </h1>

            <p className="mt-6 text-lg text-blue-100 leading-relaxed max-w-md">
              Monitor hospitals, manage healthcare networks,
              oversee operations and drive MedReach from one
              centralized platform.
            </p>

            <div className="mt-12 flex gap-3">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white/50"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-center p-8">

            <div className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

              <div className="text-center mb-8">

                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                    <ShieldCheck className="text-white" size={32} />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white">
                  Admin Login
                </h2>

                <p className="text-blue-100 mt-2">
                  Access the MedReach Control Center
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm text-blue-100 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@medireach.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-blue-100 mb-2">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-blue-100 hover:text-white"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-blue-700 font-semibold hover:scale-[1.02] transition-all duration-200"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-blue-100">
                  Authorized MedReach personnel only
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPlatformAdmin;