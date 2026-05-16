"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GWP } from "@/lib/data/emission-factors";
import { calculateEmissions } from "@/lib/data/calculations";
import { EmissionPreview } from "../shared/EmissionPreview";
import { StepCard } from "../shared/StepCard";
import type { BusinessTravelRecord } from "@/lib/data/inventory-types";

interface BusinessTravelStepProps {
  records: BusinessTravelRecord[];
  onAdd: (record: Omit<BusinessTravelRecord, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

const TRAVEL_TYPES = [
  { id: "air", label: "Aérea", icon: "✈️", desc: "Voos comerciais e particulares" },
  { id: "rail", label: "Ferroviário", icon: "🚂", desc: "Trens e metrô" },
  { id: "bus", label: "Ônibus", icon: "🚌", desc: "Ônibus de viagem e municipal" },
  { id: "car", label: "Automóvel", icon: "🚗", desc: "Carros de terceiros" },
  { id: "ferry", label: "Balsa", icon: "⛴️", desc: "Balsas de passageiros" },
];

export function BusinessTravelStep({ records, onAdd, onDelete }: BusinessTravelStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tripId: "",
    description: "",
    travelType: "",
    transportType: "",
    passengers: 1,
    segmentDistance: 0,
    totalDistance: 0,
    emissionFactorCO2: 0,
    emissionFactorCH4: 0,
    emissionFactorN2O: 0,
  });

  const [preview, setPreview] = useState({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });

  function handleDistanceChange(distance: number) {
    setForm((prev) => ({ ...prev, totalDistance: distance }));
    const e = calculateEmissions(
      distance,
      form.emissionFactorCO2,
      form.emissionFactorCH4,
      form.emissionFactorN2O
    );
    setPreview({ ...e, biogenicCO2: 0 });
  }

  function handleAdd() {
    if (!form.travelType || form.totalDistance <= 0) return;

    const e = calculateEmissions(
      form.totalDistance,
      form.emissionFactorCO2,
      form.emissionFactorCH4,
      form.emissionFactorN2O
    );

    onAdd({
      inventoryId: "",
      tripId: form.tripId || `BT-${Date.now()}`,
      description: form.description || `${form.travelType} - ${form.transportType}`,
      travelType: form.travelType as any,
      transportType: form.transportType,
      passengers: form.passengers,
      totalDistance: form.totalDistance,
      emissionFactors: { co2: form.emissionFactorCO2, ch4: form.emissionFactorCH4, n2o: form.emissionFactorN2O },
      totalCO2: e.co2,
      totalCH4: e.ch4,
      totalN2O: e.n2o,
      totalCO2e: e.co2e,
      biogenicCO2: 0,
    });

    setForm({ tripId: "", description: "", travelType: "", transportType: "", passengers: 1, segmentDistance: 0, totalDistance: 0, emissionFactorCO2: 0, emissionFactorCH4: 0, emissionFactorN2O: 0 });
    setPreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });
    setShowForm(false);
  }

  const totalCO2e = records.reduce((a, r) => a + r.totalCO2e, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Viagens a Negócio</h2>
            <p className="text-sm text-[#4e4634]">Escopo 3 (Categoria 6) — Transporte de funcionários em veículos de terceiros.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {TRAVEL_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm({ ...form, travelType: t.id })}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-all ${form.travelType === t.id ? "border-[#efc13e] bg-[#efc13e]/10" : "border-[#d1c5ae] bg-white"}`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>

            {form.travelType && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input placeholder="ID da viagem" value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input placeholder="Tipo de transporte" value={form.transportType} onChange={(e) => setForm({ ...form, transportType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input type="number" placeholder="Nº passageiros" value={form.passengers} onChange={(e) => setForm({ ...form, passengers: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" min="1" />
                  <input type="number" placeholder="Distância total (km)" value={form.totalDistance || ""} onChange={(e) => handleDistanceChange(Number(e.target.value))} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="mb-2 text-xs font-medium text-[#4e4634]">Fatores de emissão (kg/passenger-km)</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input type="number" placeholder="CO₂" value={form.emissionFactorCO2 || ""} onChange={(e) => { setForm({ ...form, emissionFactorCO2: Number(e.target.value) }); handleDistanceChange(form.totalDistance); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                    <input type="number" placeholder="CH₄" value={form.emissionFactorCH4 || ""} onChange={(e) => { setForm({ ...form, emissionFactorCH4: Number(e.target.value) }); handleDistanceChange(form.totalDistance); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                    <input type="number" placeholder="N₂O" value={form.emissionFactorN2O || ""} onChange={(e) => { setForm({ ...form, emissionFactorN2O: Number(e.target.value) }); handleDistanceChange(form.totalDistance); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                  </div>
                </div>

                <EmissionPreview {...preview} compact />

                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={!form.description || form.totalDistance <= 0} className="rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c] disabled:opacity-50">
                    Adicionar
                  </button>
                  <button onClick={() => setShowForm(false)} className="rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {records.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
            <p className="text-sm text-[#4e4634]">Nenhum registro de viagens a negócio.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <StepCard
                key={r.id}
                title={r.description}
                subtitle={`${r.tripId} · ${r.travelType} · ${r.totalDistance} km`}
                value={r.totalCO2e.toFixed(3)}
                onDelete={() => onDelete(r.id)}
              />
            ))}
            {records.length > 0 && (
              <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#765b00]">Total Viagens a Negócio</span>
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
