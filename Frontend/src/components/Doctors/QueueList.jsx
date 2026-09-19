import { useEffect, useState } from "react";
import { getConfirmedAppointments } from "../../api/backend";
import { CgSandClock } from "react-icons/cg";
import { Search, Users } from "lucide-react";
import QueueItem from "./QueueItem";

const QueueList = ({ appointments }) => {
  const [search, setSearch] = useState("");
const filteredAppointments = appointments.filter((appointment) =>
  appointment.patient?.userId?.name
    ?.toLowerCase()
    .includes(search.toLowerCase())
);
  return (
    <div className="w-full rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">

      {/* ================= Header ================= */}
      <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
            <CgSandClock
              size={24}
              className="text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Waiting Queue
            </h2>

            <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
              <Users size={15} />
              <span>
                {appointments.length} Patients Waiting
              </span>
            </div>
          </div>

        </div>

        {/* Search */}

        <div className="relative w-72">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 py-3 pl-11 pr-4 text-white placeholder:text-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

        </div>

      </div>

      {/* ================= Queue ================= */}

      <div className="h-[500px] overflow-y-auto overflow-y-auto px-6 py-5">

        {filteredAppointments.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-20">

            <div className="rounded-full bg-slate-800 p-6">
              <CgSandClock
                size={45}
                className="text-gray-500"
              />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-white">
              No Patients in Queue
            </h3>

            <p className="mt-2 text-center text-gray-400">
              There are currently no confirmed offline appointments.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredAppointments.map((appointment, index) => (

              <QueueItem
                key={appointment._id}
                appointment={appointment}
                token={appointment.token}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default QueueList;