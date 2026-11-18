import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border eco-shadow-modal text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#FFFFFF] border-[#3D8B5A]/40 text-[#26332B]'
              : toast.type === 'error'
              ? 'bg-[#FFFFFF] border-[#D9534F]/40 text-[#26332B]'
              : 'bg-[#FFFFFF] border-[#DCE4DB] text-[#26332B]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-[#3D8B5A] shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-[#D9534F] shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-[#286B4A] shrink-0" />
            )}
            <p className="font-medium text-xs sm:text-sm leading-snug">{toast.text}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#718078] hover:text-[#26332B] p-1 ml-2 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
