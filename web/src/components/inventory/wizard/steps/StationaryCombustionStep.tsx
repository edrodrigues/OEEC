"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { FOSSIL_FUELS, BIOFUELS, GWP } from "@/lib/data/emission-factors";
import { calculateEmissions, calculateStationaryEmissions } from "@/lib/data/calculations";
import { FuelSelector } from "../shared/FuelSelector";
import { EmissionPreview } from "../shared/EmissionPreview";
import { StepCard } from "../shared/StepCard";
import type { StationaryCombustionRecord } from "@/lib/data/inventory-types";

interface StationaryCombustionStepProps {
  records: StationaryCombustionRecord[];
  onAdd: (record: Omit<StationaryCombustionRecord, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

export function StationaryCombustionStep({ records, onAdd, onDelete }: StationaryCombustionStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    registryId: "",
    description: "",
    fuel: "",
    quantity: 0,
    unit: "",
    fuelComposition: "fossil" as "fossil" | "biofuel" | "mixed",
    fossilFuel: "",
    biofuel: "",
  });

  const [preview, setPreview] = useState({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });

  const handleFuelSelect = useCallback((fuelName: string, factor: any) => {
    if (!factor) return;
    const isBiofuel = BIOFUELS.some((b) => b.name === fuelName);
    setForm((prev) => ({
      ...prev,
      fuel: fuelName,
      unit: factor.unit,
      fuelComposition: isBiofuel ? "biofuel" : "fossil",
      fossilFuel: isBiofuel ? "" : fuelName,
      biofuel: isBiofuel ? fuelName : "",
    }));

    const e = calculateEmissions(form.quantity || 1, factor.co2, factor.ch4 || 0, factor.n2o || 0);
    const biogenicCO2 = isBiofuel ? (form.quantity || 1) * factor.co2 / 1000 : 0;
    setPreview({ ...e, biogenicCO2 });
  }, [form.quantity]);

  const handleQuantityChange = useCallback((qty: number) => {
    setForm((prev) => ({ ...prev, quantity: qty }));
    const fuel = [...FOSSIL_FUELS, ...BIOFUELS].find((f) => f.name === form.fuel);
    if (fuel) {
      const e = calculateEmissions(qty, fuel.co2, fuel.ch4 || 0, fuel.n2o || 0);
      const biogenicCO2 = BIOFUELS.some((b) => b.name === form.fuel) ? qty * fuel.co2 / 1000 : 0;
      setPreview({ ...e, biogenicCO2 });
    }
  }, [form.fuel]);

  function handleAdd() {
    if (!form.fuel || form.quantity <= 0) return;
    const fuel = [...FOSSIL_FUELS, ...BIOFUELS].find((f) => f.name === form.fuel);
    if (!fuel) return;

    const isBiofuel = BIOFUELS.some((b) => b.name === form.fuel);
    const result = calculateStationaryEmissions(
      form.quantity,
      fuel.unit,
      isBiofuel ? null : form.fuel,
      isBiofuel ? form.fuel : null,
      isBiofuel ? null : { co2: fuel.co2, ch4: fuel.ch4 || 0, n2o: fuel.n2o || 0 },
      isBiofuel ? { co2: fuel.co2, ch4: fuel.ch4 || 0, n2o: fuel.n2o || 0 } : null
    );

    onAdd({
      inventoryId: "",
      registryId: form.registryId || `SC-${Date.now()}`,
      description: form.description || form.fuel,
      fuel: form.fuel,
      quantity: form.quantity,
      unit: fuel.unit,
      fuelComposition: form.fuelComposition,
      fossilQuantity: result.fossilQuantity,
      biofuelQuantity: result.biofuelQuantity,
      emissionFactors: {
        fossil: { co2: isBiofuel ? 0 : fuel.co2, ch4: 0, n2o: 0 },
        biofuel: { co2: isBiofuel ? fuel.co2 : 0, ch4: 0, n2o: 0 },
      },
      totalCO2e: result.totalCO2e,
      biogenicCO2: result.biogenicCO2,
    });

    setForm({ registryId: "", description: "", fuel: "", quantity: 0, unit: "", fuelComposition: "fossil", fossilFuel: "", biofuel: "" });
    setPreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });
    setShowForm(false);
  }

  const totalCO2e = records.reduce((a, r) => a + r.totalCO2e, 0);
  const totalBiogenic = records.reduce((a, r) => a + r.biogenicCO2, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Combustão Estacionária</h2>
            <p className="text-sm text-[#4e4634]">Escopo 1 — Emissões diretas por queima de combustíveis em fontes fixas.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                placeholder="ID da fonte (ex: BLR-001)"
                value={form.registryId}
                onChange={(e) => setForm({ ...form, registryId: e.target.value })}
                className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
              />
              <input
                placeholder="Descrição"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
              />
              <FuelSelector
                value={form.fuel}
                onChange={handleFuelSelect}
                placeholder="Selecionar combustível..."
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={form.quantity || ""}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
                min="0"
                step="0.01"
              />
              {form.unit && (
                <div className="flex items-center rounded-lg bg-white px-3 py-2 text-sm text-[#4e4634]">
                  Unidade: <span className="ml-1 font-semibold">{form.unit}</span>
                </div>
              )}
            </div>

            <EmissionPreview {...preview} />

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!form.fuel || form.quantity <= 0}
                className="flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Adicionar
              </button>
              <button
                onClick={() => { setShowForm(false); setForm({ registryId: "", description: "", fuel: "", quantity: 0, unit: "", fuelComposition: "fossil", fossilFuel: "", biofuel: "" }); setPreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 }); }}
                className="rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {records.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
            <p className="text-sm text-[#4e4634]">Nenhum registro de combustão estacionária.</p>
            <p className="mt-1 text-xs text-[#807662]">Clique em "Novo Registro" para adicionar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <StepCard
                key={r.id}
                title={r.description || r.fuel}
                subtitle={`${r.registryId} · ${r.quantity} ${r.unit} · ${r.fuel}`}
                value={r.totalCO2e.toFixed(3)}
                badge={r.biogenicCO2 > 0 ? { label: "Biogênico", color: "bg-green-50 text-green-700" } : undefined}
                onDelete={() => onDelete(r.id)}
              />
            ))}
            {records.length > 0 && (
              <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#765b00]">Total Escopo 1 (Combustão Estacionária)</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#765b00]">{totalCO2e.toFixed(3)} tCO₂e</span>
                    {totalBiogenic > 0 && (
                      <p className="text-xs text-green-700">Biogênico: {totalBiogenic.toFixed(3)} t</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 rounded-lg bg-[#f5f3f3] p-3">
          <p className="text-xs font-medium text-[#4e4634]">Fatores GWP utilizados:</p>
          <div className="mt-1 flex gap-4 text-xs text-[#807662]">
            <span>CO₂ = {GWP.CO2}</span>
            <span>CH₄ = {GWP.CH4}</span>
            <span>N₂O = {GWP.N2O}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
