import { MONTHS } from "@/lib/data/emission-factors";
import type { MonthlyData } from "@/lib/data/inventory-types";

interface MonthlyGridProps {
  data: MonthlyData;
  onChange: (data: MonthlyData) => void;
  label: string;
  unit?: string;
}

export function MonthlyGrid({ data, onChange, label, unit }: MonthlyGridProps) {
  function updateMonth(month: keyof MonthlyData, value: number) {
    onChange({ ...data, [month]: value });
  }

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-[#4e4634]">{label}</p>
        {unit && <span className="text-[10px] text-[#807662]">Total: {total.toFixed(2)} {unit}</span>}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {MONTHS.map((m, i) => {
          const key = m.toLowerCase().replace("set", "set") as keyof MonthlyData;
          return (
            <div key={m}>
              <label className="text-[10px] text-[#807662]">{m}</label>
              <input
                type="number"
                value={data[key] || ""}
                onChange={(e) => updateMonth(key, Number(e.target.value))}
                className="w-full rounded border border-[#d1c5ae] bg-white px-2 py-1.5 text-xs focus:border-[#efc13e] focus:outline-none"
                min="0"
                step="0.01"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
