import { Lock } from "lucide-react";
import { lockedFeatures } from "./LockedFeatures";
import { TbBadgeFilled } from "react-icons/tb";
import { useEffect, useState } from "react";
import { getDoctorStatus } from "../../api/backend";
import CompleteProfileModal from "./CompleteProfileModal";

export default function AccessFeatures({refreshDoctorStatus,onClose}) {
    const [showModal, setShowModal] = useState(false);
     
    const fetchDoctorStatus = async()=>{
        try{
            const res = await getDoctorStatus();
            setDoctorStatus(res.data);
        }catch(error){
            console.log(error);
        }finally{
            setLoading(false);
        }
    };
  return (
   <>
    <div className="flex flex-col gap-10 items-center justify-center">
     <div className="grid md:grid-cols-3 gap-6 mt-20 p-10">
      {lockedFeatures.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
              <Icon className="text-blue-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {card.title}
            </h3>

            <p className="text-slate-400 mb-5">
              {card.description}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm mb-5">
              <Lock size={14} />
              {card.status}
            </div>

            <button
            onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {card.buttonText}
            </button>
          </div>
        );
      })}
      
    </div>
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex justify-between p-13 w-7xl ">
            <div className="flex items-center gap-7">
                <TbBadgeFilled size={40} className="text-blue-300"/>
                <div className="flex flex-col gap-1">
                    <h1 className="text-white font-bold text-lg">Complete your profile</h1>
                    <p className="text-gray-600">Add your persolnalised deatils, specialisation, experience and consultation fee to let patient know more about you.</p>
                </div>
            </div>
            <button
            onClick={() => setShowModal(true)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 py-4 px-7 text-white font-medium"
            >
              Complete your profile
            </button>
      </div>
      
   </div>
   {showModal && (
    <CompleteProfileModal  refreshDoctorStatus={refreshDoctorStatus} onClose={()=>setShowModal(false)} />
   )}
   </>
  );
}