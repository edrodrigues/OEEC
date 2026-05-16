import { ALL_FUELS, type FuelEmissionFactor } from "@/lib/data/emission-factors";

interface FuelSelectorProps {
  value: string;
  onChange: (fuel: string, factor: FuelEmissionFactor | null) => void;
  placeholder?: string;
  filter?: "fossil" | "biofuel" | "all";
  className?: string;
}

export function FuelSelector({ value, onChange, placeholder = "Selecionar combustível...", filter = "all", className = "" }: FuelSelectorProps) {
  const fuels = filter === "all" ? ALL_FUELS : ALL_FUELS.filter((f) => f.category === filter);

  const grouped = fuels.reduce<Record<string, FuelEmissionFactor[]>>((acc, fuel) => {
    const key = fuel.category === "fossil" ? "Combustíveis Fósseis" : "Biocombustíveis";
    if (!acc[key]) acc[key] = [];
    acc[key].push(fuel);
    return acc;
  }, {});

  return (
    <select
      value={value}
      onChange={(e) => {
        const selected = ALL_FUELS.find((f) => f.name === e.target.value) || null;
        onChange(e.target.value, selected);
      }}
      className={`rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none ${className}`}
    >
      <option value="">{placeholder}</option>
      {Object.entries(grouped).map(([group, fuels]) => (
        <optgroup key={group} label={group}>
          {fuels.map((f) => (
            <option key={f.id} value={f.name}>
              {f.name} ({f.unit})
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
