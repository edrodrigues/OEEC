"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icon = toast.type === "success" ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : toast.type === "error" ? (
    <AlertCircle className="h-4 w-4 text-red-600" />
  ) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-white p-3 shadow-lg transition-all duration-300",
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        toast.type === "success" ? "border-green-200" : toast.type === "error" ? "border-red-200" : "border-[#d1c5ae]"
      )}
    >
      {icon}
      <p className="flex-1 text-sm text-[#1b1c1c]">{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
        className="rounded p-0.5 text-[#807662] hover:bg-[#f5f3f3]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
