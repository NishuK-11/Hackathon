import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '../../redux/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui?.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-emerald-950/80',
    error: 'border-rose-500/30 bg-rose-950/80',
    info: 'border-blue-500/30 bg-blue-950/80',
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-in">
      <div
        className={`flex items-center gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${
          borderColors[toast.type] || borderColors.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <p className="text-xs font-medium text-white flex-1">{toast.message}</p>
        <button
          onClick={() => dispatch(clearToast())}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
