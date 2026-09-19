import React from 'react'
import { RxModulzLogo } from "react-icons/rx";
import landingSVG from '../images/landing_page.png'
import opd from "../images/opd1.png"
import queue from "../images/queue.png"
import medicine from "../images/medicine.png"
import workflow from "../images/workflow.png"
import { FaUserDoctor } from "react-icons/fa6";
import { FaHospitalUser } from "react-icons/fa";
import { TbHeartRateMonitor } from "react-icons/tb";

import { LiaUsersSolid } from "react-icons/lia";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/Role';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice';

const LandingPage = () => {
    const navigate = useNavigate();
    const mode = useSelector((state) => state.theme.mode)
    const dispatch = useDispatch();
  return (
    <div className='relative h-screen w-screen bg-white text-gray-900 dark:bg-black dark:text-white items-center flex '>
        <div className='absolute inset-4 border rounded-md border-blue-200 dark:border-blue-900/25 bg-gradient-to-b from-white to-gray-100 dark:from-[#00091E] dark:to-[#000000] flex flex-col'>
            <div className='navbar border rounded-full mt-5 mx-4 border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-black/25  backdrop-blur-sm h-[4vw] flex justify-between items-center'>
                <div className='px-10 py-6 flex w-[12vw] justify-between'>
                    <RxModulzLogo size={25}/>
                    <h1 className='text-2xl font-bold'>Medi<span className='text-[#418AFF] font-bold'>Reach</span></h1>
                </div>
                <div className='flex px-30 py-6 gap-10'>
                    <Link to='/signup' className=' px-7 py-3 rounded-md bg-[#3979E2] text-white'>Signup</Link>
                    <Link to='/login' className=' px-7 py-3 rounded-md bg-[#3979E2] text-white'>Login</Link>
                    <button onClick={()=>dispatch(toggleTheme())} 
                        className='px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        >{mode === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
                </div>
            </div>
            <div className='center flex flex-1 w-full px-30  pb-10 gap-5'>
                <div className='left flex-1 mt-10 mr-25'>
                    <div className='flex flex-col gap-10'>
                        <h1 className='text-7xl font-bold'>
                            One Platform. 
                        </h1>
                        <h2 className='text-6xl text-wrap text-[#418AFF] font-bold'>
                            Every Medical Need Connected.
                        </h2>
                        <p className='text-md font-bold text-gray-600 dark:text-gray-500 '>MediReach is a connected healthcare platform that brings doctors, patients, and <br/>  medical shopkeepers together in one place. It makes healthcare faster, easier, <br/> and more accessible for everyone.</p>   
                        <div className='flex w-full flex-1 justify-between'>
                            <div className='flex flex-col gap-2 '>
                                <div className='h-[123px] w-[123px] bg-blue-100 dark:bg-blue-800/25 rounded-full flex items-center justify-center overflow-hidden'>
                                    <img
                                        src={queue}
                                        className='h-[120px] w-[120px] object-cover'
                                        alt=""
                                    />
                                </div>
                                <p className='text-sm text-center w-[160px]'>Smart Queue Management</p>
                            </div>
                             <div className='flex flex-col gap-2 '>
                                <div className='h-[123px] w-[123px] bg-blue-100 dark:bg-blue-800/25 rounded-full flex items-center justify-center overflow-hidden'>
                                    <img
                                        src={medicine}
                                        className='h-[120px] w-[120px] object-cover'
                                        alt=""
                                    />
                                </div>
                                <p className='text-sm text-center w-[160px]'>Medicine Availability Access</p>
                            </div>
                             <div className='flex flex-col gap-2 '>
                                <div className='h-[123px] w-[123px] bg-blue-100 dark:bg-blue-800/25 rounded-full flex items-center justify-center overflow-hidden'>
                                    <img
                                        src={workflow}
                                        className='h-[120px] w-[120px] object-cover'
                                        alt=""
                                    />
                                </div>
                                <p className='text-sm text-center  w-[160px]'>AI-powered workflow optimization</p>
                            </div>
                             <div className='flex flex-col gap-2 '>
                                <div className='h-[123px] w-[123px] bg-blue-100 dark:bg-blue-800/25 rounded-full flex items-center justify-center overflow-hidden'>
                                    <img
                                        src={opd}
                                        className='h-[140px] w-[140px] object-contain'
                                        alt=""
                                    />
                                </div>
                                <p className='text-sm text-center w-[160px]'>Online OPD Booking</p>
                            </div>
                        </div>    
                    </div>
                    <button className=' px-10 py-3 mt-10 rounded-md bg-[#3979E2] text-white text-3xl'>Get Started</button>
                </div>
                <div className='right  flex-1'>
                    <img src={landingSVG}  className="w-full h-full " alt="" />
                </div>

            </div>
          <div className='bottom mx-30 mb-10 px-12 py-6 rounded-xl bg-blue-100/60 dark:bg-blue-800/20 backdrop-blur-sm border border-blue-300/30 dark:border-blue-500/10'>
            <div className='flex justify-between items-center'>

                <div className='flex items-center gap-4'>
                <LiaUsersSolid className='h-12 w-12 text-[#418AFF]' />
                <div>
                    <p className='text-3xl font-bold'>120+</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Happy Patients</p>
                </div>
                </div>

                <div className='flex items-center gap-4'>
                <FaUserDoctor className='h-12 w-12 text-[#418AFF]' />
                <div>
                    <p className='text-3xl font-bold'>1100+</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Expert Doctors</p>
                </div>
                </div>

                <div className='flex items-center gap-4'>
                <FaHospitalUser className='h-12 w-12 text-[#418AFF]' />
                <div>
                    <p className='text-3xl font-bold'>90+</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Hospitals</p>
                </div>
                </div>

                <div className='flex items-center gap-4'>
                <TbHeartRateMonitor className='h-12 w-12 text-[#418AFF]' />
                <div>
                    <p className='text-3xl font-bold'>99%+</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Satisfaction Rate</p>
                </div>
                </div>

            </div>
           </div>
        </div>
    </div>
  )
}

export default LandingPage