import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const HospitalLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default HospitalLayout;
