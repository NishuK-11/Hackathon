import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const OpdSchedule = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState(
    DAYS.map((day) => ({
      day,
      from: "",
      to: "",
      isAvailable: false,
    }))
  );

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3000/api/admin/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.doctor.opdSchedule?.length) {
        setSchedule(res.data.doctor.opdSchedule);
      }
    } catch (err) {
      toast.error("Unable to load OPD schedule");
    }
  };

  const handleAvailability = (index) => {
    const temp = [...schedule];

    temp[index].isAvailable = !temp[index].isAvailable;

    if (!temp[index].isAvailable) {
      temp[index].from = "";
      temp[index].to = "";
    }

    setSchedule(temp);
  };

  const handleTime = (index, field, value) => {
    const temp = [...schedule];
    temp[index][field] = value;
    setSchedule(temp);
  };

  const saveSchedule = async () => {
    for (let item of schedule) {
      if (item.isAvailable) {
        if (!item.from || !item.to) {
          return toast.error(`${item.day}: Please select timings`);
        }

        if (item.from >= item.to) {
          return toast.error(`${item.day}: End time must be after start time`);
        }
      }
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `http://localhost:3000/api/opd-schedule/${doctorId}`,
        {
          opdSchedule: schedule,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
     setTimeout(() => {
        navigate("/hospital-dashboard/doctors");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-5xl mx-auto">

      <h2 className="text-2xl font-bold mb-2">
        OPD Schedule
      </h2>

      <p className="text-gray-500 mb-8">
        Configure doctor's weekly availability.
      </p>

      <div className="space-y-5">

        {schedule.map((item, index) => (

          <div
            key={item.day}
            className="grid grid-cols-4 gap-6 items-center border rounded-lg p-4"
          >

            <div className="font-semibold">
              {item.day}
            </div>

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={item.isAvailable}
                onChange={() => handleAvailability(index)}
              />

              {item.isAvailable ? "Available" : "Unavailable"}

            </label>

            <input
              type="time"
              value={item.from}
              disabled={!item.isAvailable}
              onChange={(e) =>
                handleTime(index, "from", e.target.value)
              }
              className="border rounded-lg px-3 py-2 disabled:bg-gray-100"
            />

            <input
              type="time"
              value={item.to}
              disabled={!item.isAvailable}
              onChange={(e) =>
                handleTime(index, "to", e.target.value)
              }
              className="border rounded-lg px-3 py-2 disabled:bg-gray-100"
            />

          </div>

        ))}

      </div>

      <div className="flex justify-end mt-8">

        <button
          onClick={saveSchedule}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg"
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>

      </div>

    </div>
  );
};

export default OpdSchedule;