import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../../redux/slices/authSlice';
import { setLanguage, showToast } from '../../redux/slices/uiSlice';
import { Modal } from '../../components/patient/Modal';
import { useTranslation } from '../../hooks/useTranslation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  HeartPulse,
  Globe,
  FileText,
  CalendarCheck,
  LogOut,
  Edit3,
  Camera,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const PatientProfileScreen = () => {
  const { t, language } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useSelector((state) => state.auth.user);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Edit form states
  const [phone, setPhone] = useState(user?.phone_number || '+91 98765 43210');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [gender, setGender] = useState('FEMALE');
  const [dob, setDob] = useState('1998-05-14');

  const { data: profile } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => authApi.getProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: async (formData) => authApi.updateProfile(formData),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      dispatch(updateUser({ name: updated?.user?.name || user?.name }));
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
      setIsEditOpen(false);
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to update profile', type: 'error' }));
    },
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('phone_number', phone);
    formData.append('bloodGroup', bloodGroup);
    formData.append('gender', gender);
    formData.append('dob', dob);
    updateMutation.mutate(formData);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Patient Profile & Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal medical identity and regional language preferences
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="medical-card p-6 border-blue-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Profile Photo with Glow */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-500/60 bg-slate-800 shadow-xl shadow-blue-500/20">
              <img
                src={profile?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop&crop=face'}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {profile?.user?.name || user?.name || 'Ishani Sharma'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{profile?.user?.email || user?.email || 'ishani.sharma@example.com'}</p>
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all self-center sm:self-start"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-4 flex-wrap">
              <span className="flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-300">
                <HeartPulse className="w-3.5 h-3.5" />
                Blood: {profile?.bloodGroup || bloodGroup}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Patient ID: {user?.patientId || 'PAT-01'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="medical-card p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Contact Information
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="text-white font-medium">{profile?.user?.email || user?.email || 'ishani.sharma@example.com'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-teal-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                <span className="text-white font-medium">{profile?.phone || phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="medical-card p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Personal & Health Records
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-rose-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                <span className="text-white font-medium">{profile?.dob || dob}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-purple-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender</span>
                <span className="text-white font-medium">{profile?.gender || gender}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Menu */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Preferences & Shortcuts
        </h4>

        <div className="medical-card divide-y divide-white/5 overflow-hidden">
          <button
            onClick={() => navigate('/patient-dashboard/appointments')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <CalendarCheck className="w-5 h-5 text-blue-400" />
              <div>
                <h5 className="text-sm font-bold text-white">My Appointments</h5>
                <p className="text-xs text-slate-400">Check upcoming visits and past consultation history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => navigate('/patient-dashboard/reports')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div>
                <h5 className="text-sm font-bold text-white">Diagnostic Reports & Prescriptions</h5>
                <p className="text-xs text-slate-400">View or download digital health files</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => setIsLangOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <Globe className="w-5 h-5 text-purple-400" />
              <div>
                <h5 className="text-sm font-bold text-white">App Language / भाषा</h5>
                <p className="text-xs text-slate-400">
                  Current: {language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी (Hindi)' : 'मराठी (Marathi)'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-rose-500/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <LogOut className="w-5 h-5 text-rose-400" />
              <div>
                <h5 className="text-sm font-bold text-rose-400 group-hover:text-rose-300">
                  Logout Session
                </h5>
                <p className="text-xs text-slate-400">Sign out of your MediTrack account</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Patient Profile" maxWidth="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-2.5 px-4 rounded-xl glow-btn-primary font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Language Modal */}
      <Modal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} title="Select Application Language" maxWidth="sm">
        <div className="space-y-2">
          {[
            { id: 'en', name: 'English', native: 'English' },
            { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
            { id: 'mr', name: 'Marathi', native: 'मराठी' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                dispatch(setLanguage(item.id));
                setIsLangOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                language === item.id
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                  : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div>
                <span className="text-sm block">{item.name}</span>
                <span className="text-xs text-slate-400">{item.native}</span>
              </div>
              {language === item.id && <Check className="w-5 h-5 text-blue-400" />}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default PatientProfileScreen;
