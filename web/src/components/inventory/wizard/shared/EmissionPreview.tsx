import { cn } from "@/lib/utils";

interface EmissionPreviewProps {
  co2: number;
  ch4: number;
  n2o: number;
  co2e: number;
  biogenicCO2?: number;
  compact?: boolean;
}

export function EmissionPreview({ co2, ch4, n2o, co2e, biogenicCO2, compact = false }: EmissionPreviewProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 rounded-lg bg-white p-3">
        <span className="text-xs font-medium text-[#4e4634]">Emissões:</span>
        <span className="text-xs text-[#1b1c1c]">CO₂: {co2.toFixed(2)} t</span>
        <span className="text-xs font-semibold text-[#765b00]">CO₂e: {co2e.toFixed(2)} t</span>
        {biogenicCO2 !== undefined && biogenicCO2 > 0 && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Biogênico: {biogenicCO2.toFixed(2)} t
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#efc13e]/20 bg-[#fffcf0] p-4">
      <p className="mb-2 text-sm font-semibold text-[#765b00]">Emissões Calculadas</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-3">
          <p className="text-[10px] font-medium text-[#807662]">CO₂</p>
          <p className="text-lg font-bold text-[#1b1c1c]">{co2.toFixed(3)}</p>
          <p className="text-[10px] text-[#807662]">toneladas</p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-[10px] font-medium text-[#807662]">CH₄</p>
          <p className="text-lg font-bold text-[#1b1c1c]">{ch4.toFixed(4)}</p>
          <p className="text-[10px] text-[#807662]">toneladas</p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-[10px] font-medium text-[#807662]">N₂O</p>
          <p className="text-lg font-bold text-[#1b1c1c]">{n2o.toFixed(4)}</p>
          <p className="text-[10px] text-[#807662]">toneladas</p>
        </div>
        <div className={cn(
          "rounded-lg p-3",
          co2e > 0 ? "bg-[#efc13e]/10" : "bg-white"
        )}>
          <p className="text-[10px] font-medium text-[#765b00]">CO₂e Total</p>
          <p className="text-lg font-bold text-[#765b00]">{co2e.toFixed(3)}</p>
          <p className="text-[10px] text-[#807662]">toneladas</p>
        </div>
      </div>
      {biogenicCO2 !== undefined && biogenicCO2 > 0 && (
        <div className="mt-3 rounded-lg bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700">
            CO₂ Biogênico: {biogenicCO2.toFixed(3)} t (não incluído no total)
          </p>
        </div>
      )}
    </div>
  );
}
