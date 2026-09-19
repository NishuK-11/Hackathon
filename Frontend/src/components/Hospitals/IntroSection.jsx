import { useEffect, useState } from "react";
import { MdCalendarMonth } from "react-icons/md";

export default function IntroSection() {
  const [dateInfo, setDateInfo] = useState({
    date: "",
    day: "",
  });


  const [time, setTime] = useState("");

useEffect(() => {
  const interval = setInterval(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000);

  return () => clearInterval(interval);
}, []);
  useEffect(() => {
    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const dayName = today.toLocaleDateString("en-GB", {
      weekday: "long",
    });

    setDateInfo({
      date: formattedDate,
      day: dayName,
    });
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-white px-6 py-6 rounded-xl">

      {/* LEFT SIDE */}
      <div>
        <h1 className="text-2xl md:text-3xl text-blue-600 dark:text-blue-300 font-semibold">
          Welcome to Medireach 🎊
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-md mt-2">
          Here’s what’s happening in your hospital today.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="mt-4 md:mt-0 bg-blue-100 dark:bg-blue-900/20 rounded-lg px-8 py-4 flex md:items-end gap-10">
        <div className="bg-blue-300 p-2 rounded-lg">
            <MdCalendarMonth className="rounded-full text-black" size={34}/>
        </div>
        <div className="flex flex-col gap-1">
            <div className="flex gap-3">
                <p className="font-medium text-gray-900 dark:text-white">{dateInfo.date}</p>
                <div className="text-gray-400 dark:text-gray-400">|</div>
                <p className="text-gray-700 dark:text-slate-100">{dateInfo.day}</p>
            </div>
            <div className="text-left text-sm text-gray-500 dark:text-slate-300">
              <p className="font-medium">{time}</p>
            </div>
        </div>

        {/* Date + Day */}
        {/* <div className="text-sm text-slate-300 md:text-right">
          
          <p className="text-slate-400">{dateInfo.day}</p>
          <div className="text-right text-sm text-slate-300">
  <p className="font-medium">{time}</p>
</div>
        </div> */}

        {/* Live Clock Widget */}
        <div className="text-right">

        </div>

      </div>
    </div>
  );
}