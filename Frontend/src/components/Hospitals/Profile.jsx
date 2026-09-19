import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Clock3,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { getHospitalProfile } from "../../api/backend";

export default function Profile() {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getHospitalProfile();

      setHospital(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen ">
      <div className="w-full bg-[#08275E]/50  border  border-gray-700/50 rounded-3xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-5xl mb-10 font-semibold">
            Hospital Profile Overview
          </h2>

          <button className="border border-blue-500 text-white px-10 py-2 rounded-lg hover:bg-blue-600 transition">
            Edit Profile
          </button>
        </div> 

        {/* Main Section */}
        <div className="grid md:grid-cols-[590px_1fr] gap-40">

          {/* Left Image */}
          <div className="relative">

            <img
                src={hospital.coverImage}
                alt="Cover"
                className="w-full h-150 object-cover rounded-2xl"
            />
            </div>

          {/* Right Content */}
          <div>

            {/* Name */}
            <div className="flex items-center gap-10">
                <img
                src={hospital.logo}
                alt="Logo"
                className="
                w-20
                h-20
                rounded-2xl
                border-4
                border-[#08275E]
                object-cover
                bg-white
                "
            />
                <h1 className="text-3xl text-white font-bold">
                    {hospital.name}
                </h1>
                

              <ShieldCheck
                size={35}
                className="text-sky-400"
              />
            </div>

            {/* Badge */}
            <div className="inline-block mt-10 px-10 py-3 rounded-full bg-cyan-500/20 text-cyan-300 text-lg">
              {hospital.description}
            </div>

            {/* Information */}
            <div className="mt-8 space-y-5">


              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Address Card */}
                <div className="
                  bg-white/[0.04]
                  backdrop-blur-xl
                  border border-white/[0.08]
                  rounded-2xl
                  p-6
                ">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-cyan-400" size={24} />
                    <h3 className="text-white text-xl font-semibold">
                      Address
                    </h3>
                  </div>

                  <p className="text-slate-300 leading-7">
                    {hospital.address}
                  </p>
                </div>

                {/* Contact Card */}
                <div className="
                  bg-white/[0.04]
                  backdrop-blur-xl
                  border border-white/[0.08]
                  rounded-2xl
                  p-6
                ">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="text-cyan-400" size={24} />
                    <h3 className="text-white text-xl font-semibold">
                      Contact Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">
                        Phone Number
                      </p>
                      <p className="text-white font-medium">
                        {hospital.phone_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">
                        Email Address
                      </p>
                      <p className="text-white font-medium break-all">
                        {hospital.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timings Card */}
                <div className="
                  bg-white/[0.04]
                  backdrop-blur-xl
                  border border-white/[0.08]
                  rounded-2xl
                  p-6
                ">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock3 className="text-cyan-400" size={24} />
                    <h3 className="text-white text-xl font-semibold">
                      Working Hours
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(hospital.timings || {}).map(
                      ([day, time]) => (
                        <div
                          key={day}
                          className="flex justify-between border-b border-white/5 pb-2"
                        >
                          <span className="capitalize text-slate-300">
                            {day}
                          </span>

                          <span className="text-white font-medium">
                            {time}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Facilities Card */}
                <div className="
                  bg-white/[0.04]
                  backdrop-blur-xl
                  border border-white/[0.08]
                  rounded-2xl
                  p-6
                ">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="text-cyan-400" size={24} />
                    <h3 className="text-white text-xl font-semibold">
                      Facilities
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {hospital.facilities?.map((facility, index) => (
                      <span
                        key={index}
                        className="
                          px-4
                          py-2
                          rounded-xl
                          bg-cyan-500/10
                          border
                          border-cyan-500/20
                          text-cyan-300
                          text-sm
                          font-medium
                        "
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
          {/* Gallery */}
            <div className="mt-10">
            <h3 className="text-white text-3xl font-semibold mb-4">
                Hospital Gallery
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-blue-600">
                {hospital.galleryImages?.map((img, index) => (
                <img
                    key={index}
                    src={img}
                    alt={`gallery-${index}`}
                    className="w-120 h-80 object-cover rounded-xl border border-blue-700 flex-shrink-0 hover:scale-105 transition duration-300"
                />
                ))}
            </div>
            </div>
      </div>
    </div>
  );
}






