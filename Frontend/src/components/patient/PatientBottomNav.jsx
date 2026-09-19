import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, User, FileText, Pill } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSelector } from 'react-redux';

export const PatientBottomNav = () => {
  const { t } = useTranslation();
  const queue = useSelector((state) => state.queue?.queue);

  const navItems = [
    { to: '/patient-dashboard', label: t.home, icon: Home },
    { to: '/patient-dashboard/appointments', label: t.appointments, icon: Calendar },
    { 
      to: '/patient-dashboard/queue', 
      label: t.queue, 
      icon: Users,
      badge: queue?.hasActiveQueue
    },
    { to: '/patient-dashboard/reports', label: t.reports, icon: FileText },
    { to: '/patient-dashboard/pharmacy', label: t.pharmacy, icon: Pill },
    { to: '/patient-dashboard/profile', label: t.profile, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 bg-[#05070D]/95 backdrop-blur-2xl px-2 py-1.5 pb-safe">
      <nav className="flex items-center justify-around" aria-label="Mobile Bottom Navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-400 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-gradient-to-r from-blue-500 to-teal-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default PatientBottomNav;
