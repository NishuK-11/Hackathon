import { Eye } from "lucide-react";

const QueueItem = ({ appointment, token }) => {

    const patient = appointment.patient.userId;

    return (

        <div className="grid grid-cols-12 items-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 transition-all duration-200 hover:border-blue-500 hover:bg-slate-800">

            {/* Token */}

            <div className="col-span-2">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">

                    #{token}

                </div>

            </div>

            {/* Patient */}

            <div className="col-span-4">

                <h3 className="font-semibold text-white">

                    {patient.name}

                </h3>

                <p className="text-sm text-gray-400">

                    {patient.email}

                </p>

            </div>

            {/* Time */}

            <div className="col-span-2 text-gray-300">

                {new Date(appointment.slotDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}

            </div>

            {/* Status */}

            <div className="col-span-2">

                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">

                    Waiting

                </span>

            </div>

            {/* Action */}

            <div className="col-span-2 flex justify-end">

                <button className="flex items-center gap-2 rounded-lg border border-blue-500 px-4 py-2 text-sm text-blue-400 transition hover:bg-blue-500 hover:text-white">

                    <Eye size={16} />

                    View

                </button>

            </div>

        </div>

    );

};

export default QueueItem;