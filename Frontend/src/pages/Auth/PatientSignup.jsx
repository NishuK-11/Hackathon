import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading } from '../../redux/slices/authSlice';
import { authApi } from '../../api/authApi';
import { ROLE } from '../../constants/Role';
import { toast } from 'react-toastify';
import {
  Activity,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PatientSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'FEMALE',
    dob: '2000-01-01',
    bloodGroup: 'B+',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      const res = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
      });

      if (res.success) {
        dispatch(
          loginSuccess({
            token: res.token,
            role: ROLE.patient,
            user: {
              ...res.user,
              role: ROLE.patient,
              patientId: res.user.patientId || res.user.id || res.user._id,
            },
          })
        );
        toast.success('Patient Account Created Successfully! 🎉');
        navigate('/patient-dashboard');
      }
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="min-h-screen bg-[#070B14] relative overflow-hidden flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#090F1C] to-[#04060A]">
      {/* Background glow elements */}
      <div className="absolute top-10 left-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-cyan-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-blue-950/30 animate-scaleUp">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 shadow-xl shadow-blue-500/30 mb-3">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Create Patient Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access hospital queues, doctor appointments & diagnostic reports
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ishani Sharma"
                required
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
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
                placeholder="Choose a strong password"
                required
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-rose-400" />
                <span>Blood Group</span>
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950/80 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl glow-btn-primary font-bold text-xs tracking-wide shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 transition-all"
            >
              <span>{isSubmitting ? 'Registering Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientSignup;
