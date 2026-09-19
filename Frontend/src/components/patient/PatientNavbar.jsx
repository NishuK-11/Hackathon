import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { setLanguage, setEmergencyModalOpen } from '../../redux/slices/uiSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Activity, 
  LogOut, 
  Globe, 
  ShieldAlert, 
  Users,
  Calendar,
  FileText,
  Pill,
  Home,
  LayoutDashboard
} from 'lucide-react';

export const PatientNavbar = () => {
  const { t, language } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const queue = useSelector((state) => state.queue?.queue);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    dispatch(setLanguage(e.target.value));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#05070D]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link to="/patient-dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Medi<span className="text-blue-500">Reach</span>
                </span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  PATIENT
                </span>
              </div>
              <p className="hidden text-[10px] text-slate-400 sm:block -mt-1">Smart Queue & OPD Care</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-white/5 text-sm font-medium text-slate-300">
          <Link to="/patient-dashboard" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors">
            <Home className="w-4 h-4 text-blue-400" />
            <span>{t.home}</span>
          </Link>
          <Link to="/patient/appointments" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{t.appointments}</span>
          </Link>
          <Link to="/patient/queue" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors relative">
            <Users className="w-4 h-4 text-blue-400" />
            <span>{t.queue}</span>
            {queue?.hasActiveQueue && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </Link>
          <Link to="/patient/reports" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>{t.reports}</span>
          </Link>
          <Link to="/patient/pharmacy" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors">
            <Pill className="w-4 h-4 text-blue-400" />
            <span>{t.pharmacy}</span>
          </Link>
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency SOS Button */}
          <button
            onClick={() => dispatch(setEmergencyModalOpen(true))}
            className="flex items-center gap-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1.5 text-xs font-bold transition-all shadow-sm shadow-red-500/20 active:scale-95 cursor-pointer"
            title="Emergency SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span className="hidden sm:inline">EMERGENCY SOS</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-medium"
              aria-label="Select Language"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
            </select>
          </div>

          {/* User Account / Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/patient/profile"
                className="flex items-center gap-2 rounded-full bg-slate-900/90 border border-white/10 p-1 sm:px-3 sm:py-1 hover:border-blue-500/40 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
                </div>
                <span className="hidden sm:block text-xs font-medium text-slate-200 max-w-[100px] truncate">
                  {user?.name || 'Patient'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="glow-btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
            >
              {t.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar;
