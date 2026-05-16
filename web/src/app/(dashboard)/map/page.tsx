"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getInventories } from "@/lib/services/inventory";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { cn } from "@/lib/utils";
import {
  Loader2,
  MapPin,
  Layers,
  Zap,
  Cloud,
  Droplets,
  Bus,
  Sun,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const LAYERS = [
  { id: "energy", label: "Consumo Energético", icon: Zap, color: "#efc13e" },
  { id: "emissions", label: "Emissões", icon: Cloud, color: "#765b00" },
  { id: "sanitation", label: "Saneamento", icon: Droplets, color: "#3b82f6" },
  { id: "mobility", label: "Mobilidade", icon: Bus, color: "#8b5cf6" },
  { id: "renewable", label: "Energia Renovável", icon: Sun, color: "#22c55e" },
  { id: "vulnerability", label: "Vulnerabilidade Climática", icon: AlertTriangle, color: "#ef4444" },
];

const HEATMAP_COLORS = {
  low: "#e4e2e2",
  medium: "#efc13e",
  high: "#765b00",
  critical: "#ba1a1a",
};

const BRAZILIAN_STATES_DATA = [
  { uf: "AC", name: "Acre", energy: 120, emissions: 45, renewable: 85 },
  { uf: "AL", name: "Alagoas", energy: 340, emissions: 120, renewable: 60 },
  { uf: "AP", name: "Amapá", energy: 90, emissions: 30, renewable: 90 },
  { uf: "AM", name: "Amazonas", energy: 560, emissions: 200, renewable: 75 },
  { uf: "BA", name: "Bahia", energy: 2800, emissions: 980, renewable: 55 },
  { uf: "CE", name: "Ceará", energy: 1900, emissions: 650, renewable: 70 },
  { uf: "DF", name: "Distrito Federal", energy: 1200, emissions: 420, renewable: 40 },
  { uf: "ES", name: "Espírito Santo", energy: 1100, emissions: 400, renewable: 50 },
  { uf: "GO", name: "Goiás", energy: 1400, emissions: 500, renewable: 65 },
  { uf: "MA", name: "Maranhão", energy: 800, emissions: 280, renewable: 55 },
  { uf: "MT", name: "Mato Grosso", energy: 1600, emissions: 600, renewable: 60 },
  { uf: "MS", name: "Mato Grosso do Sul", energy: 1000, emissions: 350, renewable: 70 },
  { uf: "MG", name: "Minas Gerais", energy: 5200, emissions: 1800, renewable: 65 },
  { uf: "PA", name: "Pará", energy: 1800, emissions: 650, renewable: 80 },
  { uf: "PB", name: "Paraíba", energy: 700, emissions: 250, renewable: 65 },
  { uf: "PR", name: "Paraná", energy: 3800, emissions: 1300, renewable: 70 },
  { uf: "PE", name: "Pernambuco", energy: 2200, emissions: 780, renewable: 55 },
  { uf: "PI", name: "Piauí", energy: 500, emissions: 180, renewable: 75 },
  { uf: "RJ", name: "Rio de Janeiro", energy: 5800, emissions: 2100, renewable: 45 },
  { uf: "RN", name: "Rio Grande do Norte", energy: 900, emissions: 320, renewable: 80 },
  { uf: "RS", name: "Rio Grande do Sul", energy: 4200, emissions: 1500, renewable: 60 },
  { uf: "RO", name: "Rondônia", energy: 400, emissions: 150, renewable: 70 },
  { uf: "RR", name: "Roraima", energy: 80, emissions: 25, renewable: 85 },
  { uf: "SC", name: "Santa Catarina", energy: 3200, emissions: 1100, renewable: 65 },
  { uf: "SP", name: "São Paulo", energy: 12000, emissions: 4200, renewable: 50 },
  { uf: "SE", name: "Sergipe", energy: 500, emissions: 180, renewable: 55 },
  { uf: "TO", name: "Tocantins", energy: 300, emissions: 100, renewable: 80 },
];

export default function MapPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeLayers, setActiveLayers] = useState<string[]>(["energy"]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ totalEnergy: number; totalEmissions: number } | null>(null);

  useEffect(() => {
    if (!user?.organizationId) return;
    loadData();
  }, [user?.organizationId]);

  async function loadData() {
    setLoading(true);
    const data = await getDashboardSummary(user!.organizationId!);
    setSummary({ totalEnergy: data.totalEnergyConsumption, totalEmissions: data.totalEmissions });
    setLoading(false);
  }

  function toggleLayer(id: string) {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  function getHeatColor(value: number, max: number) {
    const ratio = value / max;
    if (ratio < 0.25) return HEATMAP_COLORS.low;
    if (ratio < 0.5) return HEATMAP_COLORS.medium;
    if (ratio < 0.75) return HEATMAP_COLORS.high;
    return HEATMAP_COLORS.critical;
  }

  const maxEnergy = Math.max(...BRAZILIAN_STATES_DATA.map((s) => s.energy));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
          Mapa Inteligente
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Visualize dados energéticos e climáticos em mapas interativos.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1b1c1c]">
                Mapa do Brasil — Dados por Estado
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#4e4634]">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: HEATMAP_COLORS.low }} />
                  Baixo
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: HEATMAP_COLORS.medium }} />
                  Médio
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: HEATMAP_COLORS.high }} />
                  Alto
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: HEATMAP_COLORS.critical }} />
                  Crítico
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
              {BRAZILIAN_STATES_DATA.map((state) => (
                <button
                  key={state.uf}
                  onClick={() => setSelectedState(selectedState === state.uf ? null : state.uf)}
                  className={cn(
                    "flex flex-col items-center rounded-lg border p-2 text-center transition-all hover:scale-105",
                    selectedState === state.uf
                      ? "border-[#efc13e] ring-2 ring-[#efc13e]/30"
                      : "border-[#d1c5ae]/20"
                  )}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      backgroundColor: getHeatColor(
                        activeLayers.includes("energy")
                          ? state.energy
                          : state.emissions,
                        activeLayers.includes("energy") ? maxEnergy : maxEnergy * 0.4
                      ),
                    }}
                  >
                    {state.uf}
                  </span>
                  <span className="mt-1 text-[10px] text-[#4e4634]">
                    {activeLayers.includes("energy")
                      ? `${state.energy} MWh`
                      : `${state.emissions} tCO₂e`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1b1c1c]">
              <Layers className="h-4 w-4" />
              Camadas
            </h3>
            <div className="space-y-2">
              {LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeLayers.includes(layer.id)
                      ? "bg-[#efc13e]/10 text-[#765b00]"
                      : "text-[#4e4634] hover:bg-[#f5f3f3]"
                  )}
                >
                  <layer.icon className="h-4 w-4" style={{ color: layer.color }} />
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {selectedState && (
            <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4 shadow-sm">
              {(() => {
                const state = BRAZILIAN_STATES_DATA.find((s) => s.uf === selectedState);
                if (!state) return null;
                return (
                  <>
                    <h3 className="mb-2 text-sm font-semibold text-[#1b1c1c]">
                      {state.name} ({state.uf})
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#4e4634]">Energia</span>
                        <span className="font-medium text-[#1b1c1c]">{state.energy} MWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4e4634]">Emissões</span>
                        <span className="font-medium text-[#1b1c1c]">{state.emissions} tCO₂e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4e4634]">Renovável</span>
                        <span className="font-medium text-green-600">{state.renewable}%</span>
                      </div>
                    </dl>
                  </>
                );
              })()}
            </div>
          )}

          {summary && (
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-[#1b1c1c]">
                Sua Organização
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4e4634]">Energia</span>
                  <span className="font-medium text-[#1b1c1c]">{summary.totalEnergy.toFixed(0)} MWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4e4634]">Emissões</span>
                  <span className="font-medium text-[#1b1c1c]">{summary.totalEmissions.toFixed(0)} tCO₂e</span>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
