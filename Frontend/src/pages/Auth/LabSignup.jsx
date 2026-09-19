import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import { ROLE } from '../../constants/Role';
import { toast } from 'react-toastify';
import {
  FlaskConical,
  Building,
  Mail,
  Lock,
  Phone,
  MapPin,
  Award,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LabSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    labName: '',
    directorName: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    accreditation: 'NABL Accredited',
    address: '',
    city: 'Pune',
    pincode: '411004',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate or call registration
      const labUser = {
        name: formData.labName,
        email: formData.email,
        director: formData.directorName,
        license: formData.licenseNumber,
        accreditation: formData.accreditation,
        role: ROLE.lab,
        city: formData.city,
      };

      dispatch(
        loginSuccess({
          token: 'mock_lab_token_' + Date.now(),
          role: ROLE.lab,
          user: labUser,
        })
      );

      toast.success('Pathology & Diagnostic Lab Registered Successfully! 🎉');
      navigate('/lab-dashboard');
    } catch (err) {
      toast.error(err?.message || 'Failed to register laboratory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] relative overflow-hidden flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#090F1C] to-[#04060A]">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/3 h-96 w-96 rounded-full bg-rose-600/15 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-pink-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-slate-900/70 border border-white/10 p-8 sm:p-10 backdrop-blur-xl shadow-2xl shadow-rose-950/30 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-pink-500 shadow-xl shadow-rose-600/30 mb-4">
            <FlaskConical className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Register Diagnostic Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join the MediReach clinical network to process specimen orders & dispatch digital test reports
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Diagnostic Center / Lab Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="labName"
                  value={formData.labName}
                  onChange={handleChange}
                  placeholder="e.g. Metropolis Central Pathology Lab"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lab Director / Chief Pathologist
              </label>
              <input
                type="text"
                name="directorName"
                value={formData.directorName}
                onChange={handleChange}
                placeholder="Dr. S. K. Deshmukh, MD"
                required
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="lab.diagnostics@metropolis.com"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create secure access key"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 20 2567 8900"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                License / Reg. Number
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="LAB-MAH-2026-90"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Accreditation
              </label>
              <select
                name="accreditation"
                value={formData.accreditation}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-rose-500"
              >
                <option value="NABL Accredited">NABL Accredited</option>
                <option value="CAP Certified">CAP Certified</option>
                <option value="ISO 15189:2022">ISO 15189:2022</option>
                <option value="State Clinical Establishment">State Clinical Establishment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lab Physical Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Floor 2, Diagnostic Wing, Fergusson College Road"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Pune"
                required
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-3.5 py-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 font-bold text-xs tracking-wide text-white shadow-lg shadow-rose-600/30 active:scale-95 disabled:opacity-50 transition-all"
            >
              <span>{loading ? 'Registering Lab Portal...' : 'Register Diagnostic Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-rose-400 hover:text-rose-300">
            Sign In to Lab LIMS
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LabSignup;
