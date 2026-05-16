"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { FOSSIL_FUELS, BIOFUELS, GWP, MONTHS } from "@/lib/data/emission-factors";
import { emptyMonthly, sumMonthly, calculateEmissions, calculateStationaryEmissions } from "@/lib/data/calculations";
import { FuelSelector } from "../shared/FuelSelector";
import { EmissionPreview } from "../shared/EmissionPreview";
import { StepCard } from "../shared/StepCard";
import { MonthlyGrid } from "../shared/MonthlyGrid";
import type { MobileCombustionRecord, MonthlyData } from "@/lib/data/inventory-types";

interface MobileCombustionStepProps {
  records: MobileCombustionRecord[];
  onAdd: (record: Omit<MobileCombustionRecord, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

const MODALS = [
  { id: "road", label: "Rodoviário", icon: "🚗" },
  { id: "rail", label: "Ferroviário", icon: "🚂" },
  { id: "waterway", label: "Hidroviário", icon: "🚢" },
  { id: "air", label: "Aéreo", icon: "✈️" },
];

const VEHICLE_TYPES = {
  road: ["Automóvel flex a gasolina", "Automóvel flex a etanol", "Motocicleta flex a etanol", "Caminhão diesel", "Ônibus diesel", "Van diesel"],
  rail: ["Locomotiva diesel", "Locomotiva elétrica"],
  waterway: ["Barcaça diesel", "Navio óleo combustível", "Lancha gasolina"],
  air: ["Avião comercial querosene", "Helicóptero querosene", "Avião particular gasolina"],
};

export function MobileCombustionStep({ records, onAdd, onDelete }: MobileCombustionStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    fleetId: "",
    description: "",
    modal: "",
    calculationMethod: "",
    vehicleType: "",
    fuelType: "",
    fleetYear: "",
    reportingMode: "monthly" as "monthly" | "annual",
    monthlyConsumption: emptyMonthly(),
    annualConsumption: 0,
    monthlyDistance: emptyMonthly(),
    annualDistance: 0,
    averageConsumption: 0,
    unit: "litros",
    fossilFuel: "",
    biofuel: "",
  });

  const [preview, setPreview] = useState({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });

  function handleModalSelect(modal: string) {
    setForm((prev) => ({ ...prev, modal }));
    setStep(2);
  }

  function handleMethodSelect(method: string) {
    setForm((prev) => ({ ...prev, calculationMethod: method }));
    setStep(3);
  }

  function handleFuelSelect(fuelName: string, factor: any) {
    if (!factor) return;
    const isBiofuel = BIOFUELS.some((b) => b.name === fuelName);
    setForm((prev) => ({
      ...prev,
      fossilFuel: isBiofuel ? "" : fuelName,
      biofuel: isBiofuel ? fuelName : "",
      unit: factor.unit.toLowerCase().includes("litro") ? "litros" : factor.unit,
    }));

    const qty = form.reportingMode === "monthly" ? sumMonthly(form.monthlyConsumption) : form.annualConsumption;
    if (qty > 0) {
      const e = calculateEmissions(qty, factor.co2, factor.ch4 || 0, factor.n2o || 0);
      const biogenicCO2 = isBiofuel ? qty * factor.co2 / 1000 : 0;
      setPreview({ ...e, biogenicCO2 });
    }
  }

  function updateMonthly(data: MonthlyData) {
    setForm((prev) => ({ ...prev, monthlyConsumption: data }));
    const total = sumMonthly(data);
    const fuel = [...FOSSIL_FUELS, ...BIOFUELS].find((f) => f.name === form.fossilFuel || f.name === form.biofuel);
    if (fuel && total > 0) {
      const e = calculateEmissions(total, fuel.co2, fuel.ch4 || 0, fuel.n2o || 0);
      const biogenicCO2 = BIOFUELS.some((b) => b.name === form.biofuel) ? total * fuel.co2 / 1000 : 0;
      setPreview({ ...e, biogenicCO2 });
    }
  }

  function handleAdd() {
    const fuel = [...FOSSIL_FUELS, ...BIOFUELS].find((f) => f.name === form.fossilFuel || f.name === form.biofuel);
    if (!fuel) return;

    const qty = form.reportingMode === "monthly" ? sumMonthly(form.monthlyConsumption) : form.annualConsumption;
    const isBiofuel = BIOFUELS.some((b) => b.name === form.biofuel);
    const result = calculateStationaryEmissions(
      qty,
      form.unit,
      isBiofuel ? null : form.fossilFuel,
      isBiofuel ? form.biofuel : null,
      isBiofuel ? null : { co2: fuel.co2, ch4: fuel.ch4 || 0, n2o: fuel.n2o || 0 },
      isBiofuel ? { co2: fuel.co2, ch4: fuel.ch4 || 0, n2o: fuel.n2o || 0 } : null
    );

    onAdd({
      inventoryId: "",
      fleetId: form.fleetId || `MC-${Date.now()}`,
      description: form.description || `${form.modal} - ${form.vehicleType || form.fossilFuel || form.biofuel}`,
      modal: form.modal as any,
      calculationMethod: form.calculationMethod as any,
      vehicleType: form.vehicleType,
      fuelType: form.fuelType,
      fleetYear: form.fleetYear ? Number(form.fleetYear) : undefined,
      reportingMode: form.reportingMode,
      monthlyConsumption: form.reportingMode === "monthly" ? form.monthlyConsumption : undefined,
      annualConsumption: form.reportingMode === "annual" ? form.annualConsumption : undefined,
      unit: form.unit,
      fossilFuel: form.fossilFuel || undefined,
      biofuel: form.biofuel || undefined,
      emissionFactors: {
        fossil: { co2: isBiofuel ? 0 : fuel.co2, ch4: 0, n2o: 0 },
        biofuel: { co2: isBiofuel ? fuel.co2 : 0, ch4: 0, n2o: 0 },
      },
      totalCO2e: result.totalCO2e,
      biogenicCO2: result.biogenicCO2,
    });

    setForm({ fleetId: "", description: "", modal: "", calculationMethod: "", vehicleType: "", fuelType: "", fleetYear: "", reportingMode: "monthly", monthlyConsumption: emptyMonthly(), annualConsumption: 0, monthlyDistance: emptyMonthly(), annualDistance: 0, averageConsumption: 0, unit: "litros", fossilFuel: "", biofuel: "" });
    setPreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });
    setShowForm(false);
    setStep(1);
  }

  const totalCO2e = records.reduce((a, r) => a + r.totalCO2e, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Combustão Móvel</h2>
            <p className="text-sm text-[#4e4634]">Escopo 1 — Emissões de veículos e transporte da organização.</p>
          </div>
          <button onClick={() => { setShowForm(true); setStep(1); }} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex items-center gap-1 ${s <= step ? "text-[#765b00]" : "text-[#d1c5ae]"}`}>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${s <= step ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-[#e4e2e2]"}`}>{s}</div>
                  <span className="hidden sm:inline">{s === 1 ? "Modal" : s === 2 ? "Método" : "Dados"}</span>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <p className="mb-3 text-sm font-medium text-[#4e4634]">Escolha o modal de transporte:</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {MODALS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleModalSelect(m.id)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-all hover:scale-[1.02] ${form.modal === m.id ? "border-[#efc13e] bg-[#efc13e]/10" : "border-[#d1c5ae] bg-white hover:border-[#efc13e]/50"}`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className="font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="mb-3 text-sm font-medium text-[#4e4634]">Escolha o método de cálculo:</p>
                <div className="space-y-2">
                  {[
                    { id: "byFleetType", label: "Tipo e ano da frota", desc: "Mais preciso — requer tipo de veículo e ano" },
                    { id: "byFuelType", label: "Tipo de combustível", desc: "Informe o combustível e consumo" },
                    { id: "byDistance", label: "Distância percorrida", desc: "Informe km e consumo médio" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMethodSelect(m.id)}
                      className="flex w-full items-start gap-3 rounded-lg border border-[#d1c5ae] bg-white p-3 text-left transition-all hover:border-[#efc13e]/50"
                    >
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#efc13e]/20 text-xs font-bold text-[#765b00]">
                        {m.id === "byFleetType" ? "1" : m.id === "byFuelType" ? "2" : "3"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1b1c1c]">{m.label}</p>
                        <p className="text-xs text-[#807662]">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input placeholder="ID da frota (ex: Frota-001)" value={form.fleetId} onChange={(e) => setForm({ ...form, fleetId: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  {form.calculationMethod === "byFleetType" && (
                    <>
                      <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
                        <option value="">Tipo de veículo...</option>
                        {(VEHICLE_TYPES as any)[form.modal]?.map((v: string) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <input type="number" placeholder="Ano da frota" value={form.fleetYear} onChange={(e) => setForm({ ...form, fleetYear: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                    </>
                  )}
                  {form.calculationMethod === "byFuelType" && (
                    <FuelSelector value={form.fossilFuel || form.biofuel} onChange={handleFuelSelect} placeholder="Selecionar combustível..." />
                  )}
                  {form.calculationMethod === "byDistance" && (
                    <>
                      <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
                        <option value="">Tipo de veículo...</option>
                        {(VEHICLE_TYPES as any)[form.modal]?.map((v: string) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <input type="number" placeholder="Consumo médio (km/L)" value={form.averageConsumption || ""} onChange={(e) => setForm({ ...form, averageConsumption: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                    </>
                  )}
                </div>

                {form.calculationMethod !== "byDistance" && (
                  <>
                    <div className="flex gap-2">
                      <button onClick={() => setForm({ ...form, reportingMode: "monthly" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "monthly" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Mensal</button>
                      <button onClick={() => setForm({ ...form, reportingMode: "annual" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "annual" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Anual</button>
                    </div>
                    {form.reportingMode === "monthly" ? (
                      <MonthlyGrid data={form.monthlyConsumption} onChange={updateMonthly} label="Consumo mensal" unit="litros" />
                    ) : (
                      <input type="number" placeholder="Consumo anual" value={form.annualConsumption || ""} onChange={(e) => setForm({ ...form, annualConsumption: Number(e.target.value) })} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                    )}
                  </>
                )}

                {form.calculationMethod === "byDistance" && (
                  <>
                    <div className="flex gap-2">
                      <button onClick={() => setForm({ ...form, reportingMode: "monthly" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "monthly" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Mensal</button>
                      <button onClick={() => setForm({ ...form, reportingMode: "annual" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "annual" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Anual</button>
                    </div>
                    {form.reportingMode === "monthly" ? (
                      <MonthlyGrid data={form.monthlyDistance} onChange={(d) => setForm({ ...form, monthlyDistance: d })} label="Distância mensal" unit="km" />
                    ) : (
                      <input type="number" placeholder="Distância anual (km)" value={form.annualDistance || ""} onChange={(e) => setForm({ ...form, annualDistance: Number(e.target.value) })} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                    )}
                  </>
                )}

                <EmissionPreview {...preview} compact />

                <div className="flex gap-2">
                  <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]">
                    Adicionar
                  </button>
                  <button onClick={() => { setShowForm(false); setStep(1); }} className="rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {records.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
            <p className="text-sm text-[#4e4634]">Nenhum registro de combustão móvel.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <StepCard
                key={r.id}
                title={r.description}
                subtitle={`${r.fleetId} · ${r.modal} · ${r.calculationMethod}`}
                value={r.totalCO2e.toFixed(3)}
                badge={r.biogenicCO2 > 0 ? { label: "Biogênico", color: "bg-green-50 text-green-700" } : undefined}
                onDelete={() => onDelete(r.id)}
              />
            ))}
            {records.length > 0 && (
              <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#765b00]">Total Combustão Móvel</span>
                  <span className="text-lg font-bold text-[#765b00]">{totalCO2e.toFixed(3)} tCO₂e</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
