import React from "react";
import {
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";

const PharmacyNavbar = () => {

  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-30 h-[76px] border-b border-gray-200 bg-white/90 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">

      <div className="flex h-full items-center justify-between">

        {/* Left */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Pharmacy Dashboard
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your pharmacy inventory and orders
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">

          {/* Search */}
          <div className="relative hidden w-[280px] md:block">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search medicines, orders..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

          </div>

          {/* Notification */}
          <button className="relative rounded-full p-2.5 text-slate-600 transition hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800">

            <Bell size={21} />

            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              3
            </span>

          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-slate-700" />

          {/* Profile */}
          <div className="flex cursor-pointer items-center gap-3">

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "P"}
            </div>

            {/* User info */}
            <div className="hidden text-left md:block">

              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {user?.name || "Pharmacy Owner"}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pharmacy Owner
              </p>

            </div>

            <ChevronDown
              size={17}
              className="text-slate-500"
            />

          </div>

        </div>

      </div>

    </header>
  );
};

export default PharmacyNavbar;