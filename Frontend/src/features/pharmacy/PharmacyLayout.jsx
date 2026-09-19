import { Outlet } from "react-router-dom";
import PharmacySidebar from "./PharmacySidebar";
import PharmacyNavbar from "./PharmacyNavbar";

const PharmacyLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* Sidebar */}
      <PharmacySidebar />

      {/* Right side */}
      <div className="ml-[236px] transition-all">

        {/* Navbar */}
        <PharmacyNavbar />

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default PharmacyLayout;