import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCardProps {
  title: string;
  subtitle?: string;
  value: string;
  valueLabel?: string;
  badge?: { label: string; color: string };
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function StepCard({ title, subtitle, value, valueLabel = "tCO₂e", badge, onDelete, onEdit, className = "" }: StepCardProps) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg border border-[#d1c5ae]/20 bg-white p-3 shadow-sm", className)}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#1b1c1c]">{title}</p>
        {subtitle && <p className="truncate text-xs text-[#807662]">{subtitle}</p>}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-[#765b00]">{value}</span>
          <span className="text-xs text-[#807662]">{valueLabel}</span>
          {badge && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", badge.color)}>
              {badge.label}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onEdit && (
          <button onClick={onEdit} className="rounded p-1 text-[#807662] hover:bg-[#f5f3f3] hover:text-[#4e4634]">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="rounded p-1 text-[#807662] hover:bg-red-50 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
