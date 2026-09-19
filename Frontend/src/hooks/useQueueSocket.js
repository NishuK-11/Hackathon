import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateCurrentToken,
  pauseQueue,
  resumeQueue,
  stopQueue,
  setIncomingCall,
} from '../redux/slices/queueSlice';

const SOCKET_URL = 'http://localhost:3000';

export const useQueueSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const patientId = useSelector((state) => state.auth.user?.patientId || state.auth.user?.id);
  const hasActiveQueue = useSelector((state) => state.queue.queue?.hasActiveQueue);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !patientId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 [Patient Socket] Connected, ID:', socket.id);
      socket.emit('patient-join', { patientId });
    });

    socket.on('connect_error', (err) => {
      console.info('ℹ️ [Patient Socket] Socket server offline (Safe fallback):', err.message);
    });

    socket.on('queueUpdated', (data) => {
      if (data?.currentToken !== undefined) {
        dispatch(updateCurrentToken(data.currentToken));
      }
    });

    socket.on('opdPaused', () => {
      dispatch(pauseQueue());
    });

    socket.on('opdResumed', (data) => {
      dispatch(resumeQueue(data?.currentToken));
    });

    socket.on('opdStopped', () => {
      dispatch(stopQueue());
    });

    socket.on('incoming-call', (data) => {
      dispatch(setIncomingCall(data));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, patientId, dispatch]);

  return {
    socket: socketRef.current,
    hasActiveQueue,
  };
};

export default useQueueSocket;
