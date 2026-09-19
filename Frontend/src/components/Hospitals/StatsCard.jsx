import { useNavigate } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import { useState } from "react";
export default function StatsCard({ title, count,bg, icon: Icon, route,options }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const handleToggleMenu=async()=>{
    setOpenMenu(!openMenu);
  }

  return (
    <div className="z-10 relative bg-blue-50 dark:bg-blue-900/17 text-gray-900 dark:text-white p-8 mt-3 rounded-xl shadow-md flex gap-20 items-center hover:bg-blue-100 dark:hover:bg-black transition">
      <div style={{ backgroundColor: bg }} className="text-white rounded-full p-4">
        <Icon size={35} />
      </div>
      {/* Left content */}
      <div>
        <p className="text-xl text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wide">
          {title}
        </p>
        <h2 className="text-2xl font-bold mt-1">
          {count}
        </h2>
        <button
          onClick={() => navigate(route)}
          className="text-blue-600 dark:text-blue-400 text-xl font-bold mt-4 hover:underline"
        >
          View All →
        </button>
      </div>
      <div className="relative">
        <CiMenuKebab
            onClick={handleToggleMenu}
            size={30}
            className="cursor-pointer"
        />

        {openMenu && (
        <div
            onMouseLeave={() => setOpenMenu(false)}
            className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50"
        >
            {options?.map((item, index) => (
            <div
                key={index}
                className="px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-md"
                onClick={() => {
                navigate(item.route);   // 🔥 NAVIGATE HERE
                setOpenMenu(false);
                }}
            >
                {item.label}
            </div>
            ))}
        </div>
        )}
        </div>

      {/* Icon */}
      
    </div>
  );
}