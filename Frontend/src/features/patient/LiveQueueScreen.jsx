import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  setQueue,
  updateCurrentToken, 
  pauseQueue, 
  resumeQueue, 
  setIncomingCall,
} from '../../redux/slices/queueSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { queueApi } from '../../api/queueApi';
import { 
  Users, 
  Clock, 
  Ticket, 
  Stethoscope, 
  Play, 
  Pause, 
  Video, 
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';

export const LiveQueueScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queue = useSelector((state) => state.queue?.queue);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshQueue = async () => {
    try {
      setRefreshing(true);
      const data = await queueApi.getActiveQueue();
      if (data) {
        dispatch(setQueue(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (!queue || !queue.hasActiveQueue) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4 animate-fadeIn">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-white/10 mx-auto text-slate-500">
          <Ticket className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Queue For Today</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          You do not have an active in-person OPD token assigned for today's consultations.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRefreshQueue}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{refreshing ? 'Checking...' : 'Check Status'}</span>
          </button>
          <button
            onClick={() => navigate('/patient-dashboard/hospitals')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-primary text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>
    );
  }

  const currentToken = queue.currentToken || 0;
  const yourToken = queue.yourToken || 0;
  const patientsAhead = Math.max(0, yourToken - currentToken);
  const isYourTurn = currentToken === yourToken;
  const isTurnDone = currentToken > yourToken;
  const estimatedMinutes = patientsAhead * 12;

  // Simulator controls for testing real-time socket events
  const handleSimulateNext = () => {
    dispatch(updateCurrentToken(currentToken + 1));
  };

  const handleSimulatePause = () => {
    if (queue.isPaused) {
      dispatch(resumeQueue(currentToken));
    } else {
      dispatch(pauseQueue());
    }
  };

  const handleSimulateCall = () => {
    dispatch(
      setIncomingCall({
        callerSocketId: 'mock_doctor_socket_77',
        callerName: queue.doctorName || 'Dr. Attending Specialist',
        offer: {
          type: 'offer',
          sdp: 'mock_webrtc_sdp_offer_packet',
        },
      })
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Live OPD Queue Tracker
            </h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time WebSocket token tracking & notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            queue.isOpdClosed
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : queue.isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {queue.isOpdClosed
              ? 'OPD Closed'
              : queue.isPaused
              ? 'OPD Paused'
              : 'OPD Ongoing'}
          </span>
        </div>
      </div>

      {/* Doctor & Department Card */}
      <div className="medical-card p-5 flex items-center justify-between gap-4 border-blue-500/20">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{queue.doctorName}</h3>
            <p className="text-xs text-blue-400 font-semibold">{queue.department}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">OPD Status</span>
          <span className="text-xs font-bold text-slate-200">{queue.notification}</span>
        </div>
      </div>

      {/* Hero Token Status Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Serving Token */}
        <div className="medical-card p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#161D2B] via-[#0E1522] to-[#0A0F18] border-blue-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
            Currently Serving
          </span>
          <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            #{currentToken}
          </div>
          <span className="text-xs text-slate-400 mt-2">
            Inside Doctor's Cabin
          </span>
        </div>

        {/* Your Token */}
        <div className={`medical-card p-6 sm:p-8 flex flex-col items-center justify-center text-center border-2 transition-all ${
          isYourTurn 
            ? 'border-emerald-400 bg-emerald-950/30 shadow-2xl shadow-emerald-500/20 animate-pulse' 
            : 'border-white/10 bg-slate-900/60'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Your Assigned Token
          </span>
          <div className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${
            isYourTurn ? 'text-emerald-400' : 'text-white'
          }`}>
            #{yourToken}
          </div>
          <span className={`text-xs font-bold mt-2 ${
            isYourTurn ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {isYourTurn
              ? "IT'S YOUR TURN! PLEASE ENTER"
              : isTurnDone
              ? 'Consultation Completed'
              : `${patientsAhead} Patients Ahead of You`}
          </span>
        </div>
      </div>

      {/* Progress & Wait Time Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="medical-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Patients Ahead</span>
            <h4 className="text-xl font-extrabold text-white">{patientsAhead} Patients</h4>
          </div>
        </div>

        <div className="medical-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-teal-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Est. Wait Time</span>
            <h4 className="text-xl font-extrabold text-white">
              {isYourTurn ? '0 mins (Now)' : isTurnDone ? 'Done' : `~${estimatedMinutes} minutes`}
            </h4>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Panel */}
      <div className="medical-card p-5 border-dashed border-blue-500/30 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Queue Simulator (Test Socket Events)
            </h4>
          </div>
          <span className="text-[10px] text-slate-500">For demonstration & evaluation</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleSimulateNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next Token (+1)</span>
          </button>

          <button
            onClick={handleSimulatePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
          >
            {queue.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{queue.isPaused ? 'Resume OPD' : 'Pause OPD'}</span>
          </button>

          <button
            onClick={handleSimulateCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold border border-purple-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Simulate Doctor Video Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveQueueScreen;
