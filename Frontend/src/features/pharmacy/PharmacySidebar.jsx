import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  PlusCircle,
  Tags,
  AlertTriangle,
  ShoppingCart,
  FileText,
  UserRound,
  BarChart3,
  Settings,
  LogOut,
  Cross
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

const PharmacySidebar = () => {
  const dispatch = useDispatch();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-200 hover:bg-white/10"
    }`;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[236px] bg-gradient-to-b from-[#082957] to-[#061d3d] text-white">

      {/* Pharmacy Info */}
      <div className="border-b border-white/10 px-5 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <Cross
              size={24}
              className="text-blue-600"
              strokeWidth={3}
            />
          </div>

          <div>
            <h2 className="text-[15px] font-bold">
              Swasth Pharmacy
            </h2>

            <p className="text-[11px] text-slate-300">
              Main Road, Bhagalpur
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}
      <div className="flex h-[calc(100vh-130px)] flex-col">

        <div className="flex-1 overflow-y-auto px-3 py-4">

          {/* Dashboard */}
          <NavLink
            to="/pharmacy-dashboard"
            end
            className={linkClass}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          {/* Inventory */}
          <div className="mt-7">

            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Inventory
            </p>

            <div className="space-y-1">

              <NavLink
                to="/pharmacy-dashboard/medicines"
                className={linkClass}
              >
                <Pill size={19} />
                <span>Medicines</span>
              </NavLink>

              <NavLink
                to="/pharmacy-dashboard/add-medicine"
                className={linkClass}
              >
                <PlusCircle size={19} />
                <span>Add Medicine</span>
              </NavLink>

              <NavLink
                to="/pharmacy-dashboard/categories"
                className={linkClass}
              >
                <Tags size={19} />
                <span>Categories</span>
              </NavLink>

              <NavLink
                to="/pharmacy-dashboard/stock-alerts"
                className={linkClass}
              >
                <AlertTriangle size={19} />
                <span>Stock Alerts</span>
              </NavLink>

            </div>

          </div>

          {/* Orders */}
          <div className="mt-7">

            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Orders
            </p>

            <div className="space-y-1">

              <NavLink
                to="/pharmacy-dashboard/orders"
                className={linkClass}
              >
                <ShoppingCart size={19} />
                <span>Orders</span>
              </NavLink>

              <NavLink
                to="/pharmacy-dashboard/prescriptions"
                className={linkClass}
              >
                <FileText size={19} />
                <span>Prescriptions</span>
              </NavLink>

            </div>

          </div>

          {/* Pharmacy */}
          <div className="mt-7">

            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pharmacy
            </p>

            <div className="space-y-1">

              <NavLink
                to="/pharmacy-dashboard/profile"
                className={linkClass}
              >
                <UserRound size={19} />
                <span>Profile</span>
              </NavLink>

              <NavLink
                to="/pharmacy-dashboard/reports"
                className={linkClass}
              >
                <BarChart3 size={19} />
                <span>Reports</span>
              </NavLink>

              <NavLink
                to="/pharmacy-dashboard/settings"
                className={linkClass}
              >
                <Settings size={19} />
                <span>Settings</span>
              </NavLink>

            </div>

          </div>

        </div>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>

      </div>

    </aside>
  );
};

export default PharmacySidebar;