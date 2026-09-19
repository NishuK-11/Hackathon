import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { getHospitalProfile, searchPatient } from "../api/backend";
import { useNavigate } from "react-router-dom";
import { ROLE } from "../constants/Role";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";
import { logout } from "../redux/slices/authSlice";
import { markAllRead } from "../redux/slices/notificationSlice";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logo,setLogo] = useState("");
  const [profileOpen,setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const role = useSelector((state) => state.auth.role);
  const notifications = useSelector(
    (state)=> state.notification.notifications
  );
  const unreadCount = useSelector(
    (state)=> state.notification.unreadCount
  );
useEffect(() => {
  const getLogo = async () => {
    try {
      const res = await getHospitalProfile();
      setLogo(res.data.data.logo); // URL hona chahiye
    } catch (error) {
      console.log(`error occured ${error}`);
    }
  };

  getLogo();
}, []);


useEffect(() => {
  if (!query.trim()) {
    setSearchResults([]);
    setShowSearchResults(false);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setSearchLoading(true);

      const res = await searchPatient(query.trim());

      setSearchResults(res.data.patients || []);
      setShowSearchResults(true);

    } catch (error) {
      console.error("Patient search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [query]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = () => {
    navigate("/doctor-dashboard/notifications");
  };
  return (
    <header className="relative z-30 sticky top-0  w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 md:px-6 py-7">

        {/* Left - Hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
                setOpen(!open)
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-transparent flex items-center justify-center font-bold text-black">
              {logo?<img src={logo} className="w-full rounded-full h-full object-cover"/>:(<span className="text-xs font-bold text-gray-700 dark:text-white">HC</span>)}
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold">City Care Hospital</h1>
              <p className="text-md text-gray-500 dark:text-slate-400">Smart healthcare system</p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">

            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" 
              size={24} 
            />

            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              type="text"
              placeholder="Search patient by name email phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {/* Search Results */}
            {showSearchResults && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">

                {searchLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Searching patients...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No patients found
                  </div>
                ) : (
                  searchResults.map((patient) => (
                    <button
                      key={patient._id}
                      onClick={() => {
                        const basePath =
                          role === ROLE.doctor
                            ? "/doctor-dashboard"
                            : "/hospital-dashboard";
                        navigate(`${basePath}/patients/${patient._id}`);
                        setQuery("");
                        setShowSearchResults(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >

                      {/* Patient Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <User
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>

                      {/* Patient Info */}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {patient.userId?.name || "Unknown Patient"}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {patient.userId?.email || "No email"}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {patient.phone_number || patient.userId?.phone_number || "No phone"}
                        </p>
                      </div>

                    </button>
                  ))
                )}

              </div>
            )}

          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mode === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {/* Notification */}
         <button
            onClick={handleNotificationClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <Bell size={24} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <Settings size={24} />
          </button>

          {/* Profile */}
          <button
    onClick={() => setProfileOpen(!profileOpen)}
    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
  >
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
      <User size={24} />
    </div>
    {role === ROLE.doctor ? <span className="text-lg hidden md:block">Doctor</span> : <span className="text-lg hidden md:block">Admin</span>}
    
  </button>

    {profileOpen && (
      <div className="absolute right-0 mt-40 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => {
            navigate("/hospital-dashboard/hospital-profile");
            setProfileOpen(false);
          }}
          className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          <User size={18} />
          See Profile
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute left-0 top-20 rounded-md text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
            <button
                onClick={() => {
                navigate("/hospital-dashboard/profile");
                setOpen(false);
                }}
                className="text-left p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400"
            >
                Complete Profile
            </button>
        </div>
      )}
    </header>
  );
}