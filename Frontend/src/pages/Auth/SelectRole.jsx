import React from 'react';
import {
  Building2,
  Stethoscope,
  Pill,
  User,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    title: 'Patient Portal',
    badge: 'Patients & Families',
    description:
      'Book doctor appointments, view live OPD queue tokens, access pathology reports & order medicines.',
    icon: User,
    color: 'from-blue-600 to-cyan-500',
    route: '/signup/patient',
  },
  {
    title: 'Doctor',
    badge: 'Practitioners',
    description:
      'Manage patient consultations, electronic health records, OPD queue status, and video calls.',
    icon: Stethoscope,
    color: 'from-violet-600 to-purple-500',
    route: '/login',
    loginOnly: true,
  },
  {
    title: 'Hospital Admin',
    badge: 'Institutions',
    description:
      'Manage doctors, hospital departments, emergency beds, OPD schedules, and operations.',
    icon: Building2,
    color: 'from-sky-600 to-blue-500',
    route: '/signup/hospital',
  },
  {
    title: 'Diagnostic Lab',
    badge: 'New Role • Pathology',
    description:
      'Process lab orders, barcode sample tracking, digital parameter report builder & direct dispatch.',
    icon: FlaskConical,
    color: 'from-rose-600 to-pink-500',
    route: '/signup/lab',
  },
  {
    title: 'Pharmacy Partner',
    badge: 'Medical Store',
    description:
      'Manage medicine inventory, active salts, batch stocks, customer prescriptions, and delivery.',
    icon: Pill,
    color: 'from-emerald-600 to-teal-500',
    route: '/pharmacy/signup',
  },
];

export const SelectRole = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070B14] relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-12 bg-gradient-to-b from-[#090F1C] to-[#04060A]">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-cyan-500/15 blur-[140px]" />
      <div className="absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-rose-500/15 blur-[140px]" />

      <div className="relative z-10 w-full max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" />
            Unified Healthcare Network
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400">MediReach</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Choose your role to get started with unified queues, digital prescriptions, lab pathology reports, and real-time patient care.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(role.route)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] cursor-pointer flex flex-col justify-between"
              >
                {/* Radial Glow on card */}
                <div
                  className={`absolute top-0 right-0 h-40 w-40 bg-gradient-to-br ${role.color} opacity-15 blur-3xl`}
                />

                <div>
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {role.title}
                    </h2>
                    {role.loginOnly && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Login
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {role.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wide group-hover:underline">
                  <span>{role.loginOnly ? 'Login to Portal' : 'Register Now'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-400 font-bold hover:underline ml-1"
            >
              Sign In to Any Role
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
