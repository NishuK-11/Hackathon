import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../socket';
import {
  setQueue,
  updateCurrentToken,
  pauseQueue,
  resumeQueue,
  stopQueue,
  setIncomingCall,
} from '../redux/slices/queueSlice';
import { showToast } from '../redux/slices/uiSlice';
import { queueApi } from '../api/queueApi';

export const useQueueSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const patientId = useSelector((state) => state.auth.user?.patientId || state.auth.user?.id);
  const queue = useSelector((state) => state.queue.queue);

  // Initial load of active queue status from backend
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    queueApi.getActiveQueue().then((data) => {
      if (isMounted && data) {
        dispatch(setQueue(data));
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('🟢 [Patient Socket] Connected, ID:', socket.id);
      socket.emit('patient-join', { patientId });
      if (queue?.doctorId) {
        socket.emit('join-queue', queue.doctorId);
      }
    };

    const onConnectError = (err) => {
      console.info('ℹ️ [Patient Socket] Connection error:', err.message);
    };

    const onQueueUpdated = (data) => {
      if (data?.currentToken !== undefined) {
        dispatch(updateCurrentToken(data.currentToken));
      }
    };

    const onOpdPaused = () => {
      dispatch(pauseQueue());
    };

    const onOpdResumed = (data) => {
      dispatch(resumeQueue(data?.currentToken));
    };

    const onOpdStopped = () => {
      dispatch(stopQueue());
    };

    const onIncomingCall = (data) => {
      dispatch(setIncomingCall(data));
    };

    const onAppointmentCompleted = (data) => {
      dispatch(showToast({ message: data?.message || 'Your consultation is completed!', type: 'success' }));
      // Refresh active queue status
      queueApi.getActiveQueue().then((res) => {
        if (res) dispatch(setQueue(res));
      }).catch(() => {});
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('queueUpdated', onQueueUpdated);
    socket.on('opdPaused', onOpdPaused);
    socket.on('opdResumed', onOpdResumed);
    socket.on('opdStopped', onOpdStopped);
    socket.on('incoming-call', onIncomingCall);
    socket.on('APPOINTMENT_COMPLETED', onAppointmentCompleted);

    // If socket is already connected and doctorId is known, join the queue room
    if (socket.connected && queue?.doctorId) {
      socket.emit('join-queue', queue.doctorId);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('queueUpdated', onQueueUpdated);
      socket.off('opdPaused', onOpdPaused);
      socket.off('opdResumed', onOpdResumed);
      socket.off('opdStopped', onOpdStopped);
      socket.off('incoming-call', onIncomingCall);
      socket.off('APPOINTMENT_COMPLETED', onAppointmentCompleted);
    };
  }, [token, patientId, queue?.doctorId, dispatch]);

  return {
    socket,
    hasActiveQueue: queue?.hasActiveQueue,
  };
};

export default useQueueSocket;
