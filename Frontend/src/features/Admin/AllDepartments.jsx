import React, { useEffect, useState } from 'react'
import { DepartmentsDoctorsCount } from '../../api/backend';
import { allDepartments } from '../../hooks/UseAllDepartment';

const AllDepartments = () => {


    //  const [departments, setDepartments] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await DepartmentsDoctorsCount();
  //       setDepartments(res.data.department);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   fetchData();
  // }, []);


  const {data, isLoading, refetch,isError } = allDepartments();
  const departments = data?.departments ?? [];

   return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-blue-950 p-10">
      
      <h1 className="text-3xl font-bold text-center text-white mb-10 uppercase tracking-wide">
        Departments Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="relative group bg-slate-900/60 border border-slate-700 rounded-2xl p-5 shadow-lg hover:shadow-blue-500/20 hover:border-blue-500 transition-all duration-300"
          >
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition" />

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-blue-300 uppercase tracking-wide">
                {dept.name}
              </h2>

              <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500">
                {dept.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {dept.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between mt-4">
              
              <div className="text-center">
                <p className="text-slate-400 text-xs">Doctors</p>
                <p className="text-2xl font-bold text-white">
                  {dept.totalDoctors}
                </p>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-xs">Created</p>
                <p className="text-sm text-blue-200">
                  {new Date(dept.createdAt).toLocaleDateString()}
                </p>
              </div>

            </div>

            {/* Bottom accent bar */}
            <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(dept.totalDoctors * 20, 100)}%` }}
              />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default AllDepartments