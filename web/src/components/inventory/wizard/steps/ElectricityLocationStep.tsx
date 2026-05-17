"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GWP } from "@/lib/data/emission-factors";
import { emptyMonthly, sumMonthly, calculateEmissions } from "@/lib/data/calculations";
import { MonthlyGrid } from "../shared/MonthlyGrid";
import { EmissionPreview } from "../shared/EmissionPreview";
import { StepCard } from "../shared/StepCard";
import type { ElectricityLocationRecord, MonthlyData } from "@/lib/data/inventory-types";

interface ElectricityLocationStepProps {
  records: ElectricityLocationRecord[];
  newRecordIds: Set<string>;
  onAdd: (record: Omit<ElectricityLocationRecord, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

export function ElectricityLocationStep({ records, newRecordIds, onAdd, onDelete }: ElectricityLocationStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [sourceType, setSourceType] = useState<"sin" | "electricVehicle" | "isolatedSystem">("sin");
  const [form, setForm] = useState({
    sourceId: "",
    description: "",
    vehicleType: "",
    reportingMode: "monthly" as "monthly" | "annual",
    monthlyConsumption: emptyMonthly(),
    annualConsumption: 0,
    monthlyDistance: emptyMonthly(),
    annualDistance: 0,
    averageConsumption: 0,
    sinFactor: 0.0566,
  });

  const [preview, setPreview] = useState({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });

  function handleConsumptionChange(data: MonthlyData) {
    setForm((prev) => ({ ...prev, monthlyConsumption: data }));
    const total = sumMonthly(data);
    const co2 = total * form.sinFactor;
    setPreview({ co2, ch4: 0, n2o: 0, co2e: co2, biogenicCO2: 0 });
  }

  function handleAnnualChange(val: number) {
    setForm((prev) => ({ ...prev, annualConsumption: val }));
    const co2 = val * form.sinFactor;
    setPreview({ co2, ch4: 0, n2o: 0, co2e: co2, biogenicCO2: 0 });
  }

  function handleAdd() {
    const consumption = form.reportingMode === "monthly" ? sumMonthly(form.monthlyConsumption) : form.annualConsumption;
    const totalCO2 = consumption * form.sinFactor;

    onAdd({
      inventoryId: "",
      sourceId: form.sourceId || `EL-${Date.now()}`,
      description: form.description || `Energia ${sourceType === "sin" ? "SIN" : sourceType === "electricVehicle" ? "Veículo Elétrico" : "Sistema Isolado"}`,
      sourceType,
      vehicleType: sourceType === "electricVehicle" ? form.vehicleType : undefined,
      reportingMode: form.reportingMode,
      monthlyConsumption: form.reportingMode === "monthly" ? form.monthlyConsumption : undefined,
      annualConsumption: form.reportingMode === "annual" ? form.annualConsumption : undefined,
      monthlyDistance: sourceType === "electricVehicle" ? form.monthlyDistance : undefined,
      annualDistance: sourceType === "electricVehicle" ? form.annualDistance : undefined,
      averageConsumption: sourceType === "electricVehicle" ? form.averageConsumption : undefined,
      totalCO2,
      totalCH4: 0,
      totalN2O: 0,
      totalCO2e: totalCO2,
    });

    setForm({ sourceId: "", description: "", vehicleType: "", reportingMode: "monthly", monthlyConsumption: emptyMonthly(), annualConsumption: 0, monthlyDistance: emptyMonthly(), annualDistance: 0, averageConsumption: 0, sinFactor: 0.0566 });
    setPreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });
    setShowForm(false);
  }

  const totalCO2e = records.reduce((a, r) => a + r.totalCO2e, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Energia Elétrica — Localização</h2>
            <p className="text-sm text-[#4e4634]">Escopo 2 — Emissões indiretas pelo consumo de eletricidade (location-based).</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            <div className="flex gap-2">
              {[
                { id: "sin", label: "SIN", desc: "Sistema Interligado Nacional" },
                { id: "electricVehicle", label: "Veículo Elétrico", desc: "Emissões de recarga" },
                { id: "isolatedSystem", label: "Sistema Isolado", desc: "Fora do SIN" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSourceType(t.id as any)}
                  className={`flex-1 rounded-lg border p-3 text-left transition-all ${sourceType === t.id ? "border-[#efc13e] bg-[#efc13e]/10" : "border-[#d1c5ae] bg-white"}`}
                >
                  <p className="text-sm font-medium text-[#1b1c1c]">{t.label}</p>
                  <p className="text-[10px] text-[#807662]">{t.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <input placeholder="ID da fonte" value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              {sourceType === "sin" && (
                <input type="number" placeholder="Fator SIN (tCO₂/MWh)" value={form.sinFactor} onChange={(e) => { const v = Number(e.target.value); setForm({ ...form, sinFactor: v }); handleConsumptionChange(form.monthlyConsumption); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.0001" />
              )}
              {sourceType === "electricVehicle" && (
                <>
                  <input placeholder="Tipo de veículo" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input type="number" placeholder="Consumo médio (km/kWh)" value={form.averageConsumption} onChange={(e) => setForm({ ...form, averageConsumption: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.1" />
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, reportingMode: "monthly" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "monthly" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Mensal</button>
              <button onClick={() => setForm({ ...form, reportingMode: "annual" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "annual" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Anual</button>
            </div>

            {form.reportingMode === "monthly" ? (
              <MonthlyGrid data={form.monthlyConsumption} onChange={handleConsumptionChange} label="Consumo mensal (MWh)" unit="MWh" />
            ) : (
              <input type="number" placeholder="Consumo anual (MWh)" value={form.annualConsumption || ""} onChange={(e) => handleAnnualChange(Number(e.target.value))} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            )}

            <EmissionPreview {...preview} compact />

            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!form.description} className="rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c] disabled:opacity-50">
                Adicionar
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {records.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
            <p className="text-sm text-[#4e4634]">Nenhum registro de energia elétrica (location-based).</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <StepCard
                key={r.id}
                title={r.description}
                subtitle={`${r.sourceId} · ${r.sourceType === "sin" ? "SIN" : r.sourceType === "electricVehicle" ? "Veículo Elétrico" : "Sistema Isolado"}`}
                value={r.totalCO2e.toFixed(3)}
                isNew={newRecordIds.has(r.id)}
                onDelete={() => onDelete(r.id)}
              />
            ))}
            {records.length > 0 && (
              <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#765b00]">Total Energia (Location-Based)</span>
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
