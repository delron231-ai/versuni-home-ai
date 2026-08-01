import React, { useEffect } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type?: "success" | "info" | "amber";
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onDismiss(toasts[0].id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 max-w-sm w-full p-3.5 rounded-xl shadow-xl backdrop-blur-md transition-all animate-slide-down border ${
            toast.type === "amber"
              ? "bg-[#16204A]/95 text-amber-200 border-[#F5A623]/40"
              : toast.type === "info"
              ? "bg-[#16204A]/95 text-white border-[#3B82F6]/40"
              : "bg-[#16204A]/95 text-white border-[#3B82F6]/60"
          }`}
        >
          {toast.type === "amber" ? (
            <AlertTriangle className="w-5 h-5 text-[#F5A623] shrink-0" />
          ) : toast.type === "info" ? (
            <Info className="w-5 h-5 text-[#3B82F6] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium leading-snug flex-1">{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
