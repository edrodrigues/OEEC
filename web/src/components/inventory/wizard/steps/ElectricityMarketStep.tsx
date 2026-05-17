"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GWP, RENEWABLE_SOURCES } from "@/lib/data/emission-factors";
import { emptyMonthly, sumMonthly, isRenewable } from "@/lib/data/calculations";
import { MonthlyGrid } from "../shared/MonthlyGrid";
import { EmissionPreview } from "../shared/EmissionPreview";
import { StepCard } from "../shared/StepCard";
import type { ElectricityMarketRecord, MonthlyData } from "@/lib/data/inventory-types";

const GENERATION_TYPES = ["Termoelétrica", "Hidrelétrica", "Eólica", "Solar", "Biomassa", "Nuclear"];

interface ElectricityMarketStepProps {
  records: ElectricityMarketRecord[];
  newRecordIds: Set<string>;
  onAdd: (record: Omit<ElectricityMarketRecord, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

export function ElectricityMarketStep({ records, newRecordIds, onAdd, onDelete }: ElectricityMarketStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sourceId: "",
    description: "",
    generationType: "",
    fuel: "",
    hasCustomFactor: false,
    plantEfficiency: 0,
    reportingMode: "monthly" as "monthly" | "annual",
    monthlyConsumption: emptyMonthly(),
    annualConsumption: 0,
    customCO2: 0,
    customCH4: 0,
    customN2O: 0,
    customBiogenicCO2: 0,
    suggestedCO2: 0,
    suggestedCH4: 0.0001,
    suggestedN2O: 0.00001,
    suggestedBiogenicCO2: 0.3604,
  });

  const [preview, setPreview] = useState({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });

  function handleConsumptionChange(data: MonthlyData) {
    setForm((prev) => ({ ...prev, monthlyConsumption: data }));
    const total = sumMonthly(data);
    const factor = form.hasCustomFactor
      ? { co2: form.customCO2, ch4: form.customCH4, n2o: form.customN2O, biogenicCO2: form.customBiogenicCO2 }
      : { co2: form.suggestedCO2, ch4: form.suggestedCH4, n2o: form.suggestedN2O, biogenicCO2: form.suggestedBiogenicCO2 };
    const co2 = total * factor.co2;
    const ch4 = total * factor.ch4;
    const n2o = total * factor.n2o;
    const biogenicCO2 = total * factor.biogenicCO2;
    setPreview({ co2, ch4, n2o, co2e: co2 + ch4 * GWP.CH4 + n2o * GWP.N2O, biogenicCO2 });
  }

  function handleAnnualChange(val: number) {
    setForm((prev) => ({ ...prev, annualConsumption: val }));
    const factor = form.hasCustomFactor
      ? { co2: form.customCO2, ch4: form.customCH4, n2o: form.customN2O, biogenicCO2: form.customBiogenicCO2 }
      : { co2: form.suggestedCO2, ch4: form.suggestedCH4, n2o: form.suggestedN2O, biogenicCO2: form.suggestedBiogenicCO2 };
    const co2 = val * factor.co2;
    const ch4 = val * factor.ch4;
    const n2o = val * factor.n2o;
    const biogenicCO2 = val * factor.biogenicCO2;
    setPreview({ co2, ch4, n2o, co2e: co2 + ch4 * GWP.CH4 + n2o * GWP.N2O, biogenicCO2 });
  }

  function handleAdd() {
    const consumption = form.reportingMode === "monthly" ? sumMonthly(form.monthlyConsumption) : form.annualConsumption;
    const factor = form.hasCustomFactor
      ? { co2: form.customCO2, ch4: form.customCH4, n2o: form.customN2O, biogenicCO2: form.customBiogenicCO2 }
      : { co2: form.suggestedCO2, ch4: form.suggestedCH4, n2o: form.suggestedN2O, biogenicCO2: form.suggestedBiogenicCO2 };
    const totalCO2 = consumption * factor.co2;
    const totalCH4 = consumption * factor.ch4;
    const totalN2O = consumption * factor.n2o;
    const totalCO2e = totalCO2 + totalCH4 * GWP.CH4 + totalN2O * GWP.N2O;
    const totalBiogenicCO2 = consumption * factor.biogenicCO2;

    onAdd({
      inventoryId: "",
      sourceId: form.sourceId || `EM-${Date.now()}`,
      description: form.description || form.generationType,
      generationType: form.generationType,
      fuel: form.fuel,
      hasCustomEmissionFactor: form.hasCustomFactor,
      plantEfficiency: form.plantEfficiency || undefined,
      reportingMode: form.reportingMode,
      monthlyConsumption: form.reportingMode === "monthly" ? form.monthlyConsumption : undefined,
      annualConsumption: form.reportingMode === "annual" ? form.annualConsumption : undefined,
      customEmissionFactors: form.hasCustomFactor ? { co2: form.customCO2, ch4: form.customCH4, n2o: form.customN2O, biogenicCO2: form.customBiogenicCO2 } : undefined,
      suggestedEmissionFactors: { co2: form.suggestedCO2, ch4: form.suggestedCH4, n2o: form.suggestedN2O, biogenicCO2: form.suggestedBiogenicCO2 },
      totalCO2,
      totalCH4,
      totalN2O,
      totalCO2e,
      totalBiogenicCO2,
    });

    setForm({ sourceId: "", description: "", generationType: "", fuel: "", hasCustomFactor: false, plantEfficiency: 0, reportingMode: "monthly", monthlyConsumption: emptyMonthly(), annualConsumption: 0, customCO2: 0, customCH4: 0, customN2O: 0, customBiogenicCO2: 0, suggestedCO2: 0, suggestedCH4: 0.0001, suggestedN2O: 0.00001, suggestedBiogenicCO2: 0.3604 });
    setPreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });
    setShowForm(false);
  }

  const totalCO2e = records.reduce((a, r) => a + r.totalCO2e, 0);
  const totalBiogenic = records.reduce((a, r) => a + r.totalBiogenicCO2, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Energia Elétrica — Escolha de Compra</h2>
            <p className="text-sm text-[#4e4634]">Escopo 2 (market-based) — Emissões baseadas na origem da eletricidade comprada.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <input placeholder="ID da fonte" value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              <select value={form.generationType} onChange={(e) => setForm({ ...form, generationType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
                <option value="">Tipo de geração...</option>
                {GENERATION_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <input placeholder="Combustível / Fonte" value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              <input type="number" placeholder="Eficiência da planta (%)" value={form.plantEfficiency || ""} onChange={(e) => setForm({ ...form, plantEfficiency: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
                <input type="checkbox" checked={form.hasCustomFactor} onChange={(e) => setForm({ ...form, hasCustomFactor: e.target.checked })} />
                Fator de emissão próprio?
              </label>
            </div>

            {form.hasCustomFactor ? (
              <div className="grid gap-2 sm:grid-cols-4">
                <input type="number" placeholder="CO₂ (t/MWh)" value={form.customCO2 || ""} onChange={(e) => { setForm({ ...form, customCO2: Number(e.target.value) }); handleConsumptionChange(form.monthlyConsumption); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.0001" />
                <input type="number" placeholder="CH₄ (t/MWh)" value={form.customCH4 || ""} onChange={(e) => { setForm({ ...form, customCH4: Number(e.target.value) }); handleConsumptionChange(form.monthlyConsumption); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                <input type="number" placeholder="N₂O (t/MWh)" value={form.customN2O || ""} onChange={(e) => { setForm({ ...form, customN2O: Number(e.target.value) }); handleConsumptionChange(form.monthlyConsumption); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                <input type="number" placeholder="Biogênico (t/MWh)" value={form.customBiogenicCO2 || ""} onChange={(e) => { setForm({ ...form, customBiogenicCO2: Number(e.target.value) }); handleConsumptionChange(form.monthlyConsumption); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.0001" />
              </div>
            ) : (
              <div className="rounded-lg bg-white p-3 text-xs text-[#4e4634]">
                <p className="font-medium">Usando fatores sugeridos:</p>
                <p>CO₂: {form.suggestedCO2} · CH₄: {form.suggestedCH4} · N₂O: {form.suggestedN2O} · Biogênico: {form.suggestedBiogenicCO2} t/MWh</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, reportingMode: "monthly" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "monthly" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Mensal</button>
              <button onClick={() => setForm({ ...form, reportingMode: "annual" })} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${form.reportingMode === "annual" ? "bg-[#efc13e] text-[#1b1c1c]" : "bg-white text-[#4e4634] border border-[#d1c5ae]"}`}>Anual</button>
            </div>

            {form.reportingMode === "monthly" ? (
              <MonthlyGrid data={form.monthlyConsumption} onChange={handleConsumptionChange} label="Energia mensal (MWh)" unit="MWh" />
            ) : (
              <input type="number" placeholder="Energia anual (MWh)" value={form.annualConsumption || ""} onChange={(e) => handleAnnualChange(Number(e.target.value))} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            )}

            <EmissionPreview {...preview} compact />

            {isRenewable(form.generationType) && (
              <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Fonte renovável
              </span>
            )}

            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!form.description || !form.generationType} className="rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c] disabled:opacity-50">
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
            <p className="text-sm text-[#4e4634]">Nenhum registro de energia (market-based).</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <StepCard
                key={r.id}
                title={r.description}
                subtitle={`${r.generationType} · ${r.fuel}`}
                value={r.totalCO2e.toFixed(3)}
                isNew={newRecordIds.has(r.id)}
                badge={isRenewable(r.generationType) ? { label: "Renovável", color: "bg-green-50 text-green-700" } : undefined}
                onDelete={() => onDelete(r.id)}
              />
            ))}
            {records.length > 0 && (
              <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#765b00]">Total Energia (Market-Based)</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#765b00]">{totalCO2e.toFixed(3)} tCO₂e</span>
                    {totalBiogenic > 0 && <p className="text-xs text-green-700">Biogênico: {totalBiogenic.toFixed(3)} t</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
