"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GWP } from "@/lib/data/emission-factors";
import { calculateEmissions } from "@/lib/data/calculations";
import { EmissionPreview } from "../shared/EmissionPreview";
import { StepCard } from "../shared/StepCard";
import type { CommuteRecord, RemoteWorkRecord } from "@/lib/data/inventory-types";

interface CommuteStepProps {
  commuteRecords: CommuteRecord[];
  remoteWorkRecords: RemoteWorkRecord[];
  onAddCommute: (record: Omit<CommuteRecord, "id" | "createdAt" | "updatedAt">) => void;
  onAddRemoteWork: (record: Omit<RemoteWorkRecord, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteCommute: (id: string) => void;
  onDeleteRemoteWork: (id: string) => void;
}

const TRANSPORT_TYPES = [
  { id: "metroRail", label: "Metrô/Trem", icon: "🚇" },
  { id: "bus", label: "Ônibus", icon: "🚌" },
  { id: "ferry", label: "Balsa", icon: "⛴️" },
  { id: "private", label: "Veículo Particular", icon: "🚗" },
];

export function CommuteStep({ commuteRecords, remoteWorkRecords, onAddCommute, onAddRemoteWork, onDeleteCommute, onDeleteRemoteWork }: CommuteStepProps) {
  const [showCommuteForm, setShowCommuteForm] = useState(false);
  const [showRemoteForm, setShowRemoteForm] = useState(false);
  const [commuteForm, setCommuteForm] = useState({
    collaboratorId: "",
    description: "",
    transportType: "",
    passengers: 1,
    segmentDistance: 0,
    workDaysPerYear: 230,
    emissionFactorCO2: 0,
    emissionFactorCH4: 0,
    emissionFactorN2O: 0,
  });

  const [remoteForm, setRemoteForm] = useState({
    description: "",
    numberOfEmployees: 0,
    remoteDaysPerWeek: 0,
    electricityPerEmployee: 0,
    emissionFactor: 0.0566,
  });

  const [commutePreview, setCommutePreview] = useState({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });

  function handleCommuteDistanceChange(distance: number) {
    setCommuteForm((prev) => ({ ...prev, segmentDistance: distance }));
    const roundTrip = distance * 2;
    const annualDistance = roundTrip * commuteForm.workDaysPerYear * commuteForm.passengers;
    const e = calculateEmissions(annualDistance, commuteForm.emissionFactorCO2, commuteForm.emissionFactorCH4, commuteForm.emissionFactorN2O);
    setCommutePreview({ ...e, biogenicCO2: 0 });
  }

  function handleAddCommute() {
    if (!commuteForm.transportType || commuteForm.segmentDistance <= 0) return;
    const roundTrip = commuteForm.segmentDistance * 2;
    const annualDistance = roundTrip * commuteForm.workDaysPerYear * commuteForm.passengers;
    const e = calculateEmissions(annualDistance, commuteForm.emissionFactorCO2, commuteForm.emissionFactorCH4, commuteForm.emissionFactorN2O);

    onAddCommute({
      inventoryId: "",
      collaboratorId: commuteForm.collaboratorId || `COM-${Date.now()}`,
      description: commuteForm.description || `${commuteForm.transportType}`,
      commuteType: commuteForm.transportType === "private" ? "privateVehicle" : "publicTransport",
      transportSubType: commuteForm.transportType as any,
      passengers: commuteForm.passengers,
      segmentDistance: commuteForm.segmentDistance,
      workDaysPerYear: commuteForm.workDaysPerYear,
      emissionFactors: { co2: commuteForm.emissionFactorCO2, ch4: commuteForm.emissionFactorCH4, n2o: commuteForm.emissionFactorN2O },
      totalCO2: e.co2,
      totalCH4: e.ch4,
      totalN2O: e.n2o,
      totalCO2e: e.co2e,
      biogenicCO2: 0,
    });

    setCommuteForm({ collaboratorId: "", description: "", transportType: "", passengers: 1, segmentDistance: 0, workDaysPerYear: 230, emissionFactorCO2: 0, emissionFactorCH4: 0, emissionFactorN2O: 0 });
    setCommutePreview({ co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 });
    setShowCommuteForm(false);
  }

  function handleAddRemoteWork() {
    if (!remoteForm.numberOfEmployees || !remoteForm.remoteDaysPerWeek) return;
    const workDaysPerYear = 230;
    const remoteDaysPerYear = (remoteForm.remoteDaysPerWeek / 5) * workDaysPerYear;
    const totalElectricity = remoteForm.numberOfEmployees * remoteForm.electricityPerEmployee * remoteDaysPerYear / workDaysPerYear;
    const totalCO2e = totalElectricity * remoteForm.emissionFactor;

    onAddRemoteWork({
      inventoryId: "",
      description: remoteForm.description || `Trabalho remoto - ${remoteForm.numberOfEmployees} funcionários`,
      numberOfEmployees: remoteForm.numberOfEmployees,
      remoteDaysPerWeek: remoteForm.remoteDaysPerWeek,
      electricityConsumptionPerEmployee: remoteForm.electricityPerEmployee,
      totalElectricityConsumption: totalElectricity,
      emissionFactor: remoteForm.emissionFactor,
      totalCO2: totalCO2e,
      totalCH4: 0,
      totalN2O: 0,
      totalCO2e,
    });

    setRemoteForm({ description: "", numberOfEmployees: 0, remoteDaysPerWeek: 0, electricityPerEmployee: 0, emissionFactor: 0.0566 });
    setShowRemoteForm(false);
  }

  const totalCommuteCO2e = commuteRecords.reduce((a, r) => a + r.totalCO2e, 0);
  const totalRemoteCO2e = remoteWorkRecords.reduce((a, r) => a + r.totalCO2e, 0);
  const totalCO2e = totalCommuteCO2e + totalRemoteCO2e;

  return (
    <div className="space-y-6">
      {/* Commute Section */}
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Deslocamento Casa-Trabalho</h2>
            <p className="text-sm text-[#4e4634]">Escopo 3 (Categoria 7) — Transporte de funcionários no deslocamento diário.</p>
          </div>
          <button onClick={() => setShowCommuteForm(true)} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showCommuteForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRANSPORT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCommuteForm({ ...commuteForm, transportType: t.id })}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-all ${commuteForm.transportType === t.id ? "border-[#efc13e] bg-[#efc13e]/10" : "border-[#d1c5ae] bg-white"}`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>

            {commuteForm.transportType && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input placeholder="ID do colaborador" value={commuteForm.collaboratorId} onChange={(e) => setCommuteForm({ ...commuteForm, collaboratorId: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input placeholder="Descrição da rota" value={commuteForm.description} onChange={(e) => setCommuteForm({ ...commuteForm, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input type="number" placeholder="Nº colaboradores" value={commuteForm.passengers} onChange={(e) => setCommuteForm({ ...commuteForm, passengers: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" min="1" />
                  <input type="number" placeholder="Distância por trecho (km)" value={commuteForm.segmentDistance || ""} onChange={(e) => handleCommuteDistanceChange(Number(e.target.value))} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                  <input type="number" placeholder="Dias úteis/ano" value={commuteForm.workDaysPerYear} onChange={(e) => setCommuteForm({ ...commuteForm, workDaysPerYear: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="mb-2 text-xs font-medium text-[#4e4634]">Fatores de emissão (g/passenger-km)</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input type="number" placeholder="CO₂" value={commuteForm.emissionFactorCO2 || ""} onChange={(e) => { setCommuteForm({ ...commuteForm, emissionFactorCO2: Number(e.target.value) }); handleCommuteDistanceChange(commuteForm.segmentDistance); }} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.01" />
                    <input type="number" placeholder="CH₄" value={commuteForm.emissionFactorCH4 || ""} onChange={(e) => setCommuteForm({ ...commuteForm, emissionFactorCH4: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                    <input type="number" placeholder="N₂O" value={commuteForm.emissionFactorN2O || ""} onChange={(e) => setCommuteForm({ ...commuteForm, emissionFactorN2O: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.00001" />
                  </div>
                </div>

                <div className="rounded-lg bg-white p-3 text-xs text-[#4e4634]">
                  <p>Distância ida e volta: {(commuteForm.segmentDistance * 2).toFixed(1)} km</p>
                  <p>Distância anual total: {(commuteForm.segmentDistance * 2 * commuteForm.workDaysPerYear * commuteForm.passengers).toLocaleString()} km</p>
                </div>

                <EmissionPreview {...commutePreview} compact />

                <div className="flex gap-2">
                  <button onClick={handleAddCommute} disabled={!commuteForm.description || commuteForm.segmentDistance <= 0} className="rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c] disabled:opacity-50">
                    Adicionar
                  </button>
                  <button onClick={() => setShowCommuteForm(false)} className="rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {commuteRecords.length === 0 && !showCommuteForm ? (
          <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
            <p className="text-sm text-[#4e4634]">Nenhum registro de deslocamento.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {commuteRecords.map((r) => (
              <StepCard
                key={r.id}
                title={r.description}
                subtitle={`${r.collaboratorId} · ${r.transportSubType} · ${r.segmentDistance} km/trecho`}
                value={r.totalCO2e.toFixed(3)}
                onDelete={() => onDeleteCommute(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Remote Work Section */}
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1c1c]">Trabalho Remoto (Home Office)</h2>
            <p className="text-sm text-[#4e4634]">Emissões de eletricidade da estação de trabalho remota.</p>
          </div>
          <button onClick={() => setShowRemoteForm(true)} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Novo Registro
          </button>
        </div>

        {showRemoteForm && (
          <div className="space-y-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <input placeholder="Descrição" value={remoteForm.description} onChange={(e) => setRemoteForm({ ...remoteForm, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
              <input type="number" placeholder="Nº funcionários remotos" value={remoteForm.numberOfEmployees || ""} onChange={(e) => setRemoteForm({ ...remoteForm, numberOfEmployees: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" min="1" />
              <input type="number" placeholder="Dias remotos/semana" value={remoteForm.remoteDaysPerWeek || ""} onChange={(e) => setRemoteForm({ ...remoteForm, remoteDaysPerWeek: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" min="1" max="5" />
              <input type="number" placeholder="Consumo elétrico/func (MWh/ano)" value={remoteForm.electricityPerEmployee || ""} onChange={(e) => setRemoteForm({ ...remoteForm, electricityPerEmployee: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.01" />
              <input type="number" placeholder="Fator de emissão SIN" value={remoteForm.emissionFactor} onChange={(e) => setRemoteForm({ ...remoteForm, emissionFactor: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" step="0.0001" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddRemoteWork} disabled={!remoteForm.numberOfEmployees || !remoteForm.remoteDaysPerWeek} className="rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c] disabled:opacity-50">
                Adicionar
              </button>
              <button onClick={() => setShowRemoteForm(false)} className="rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {remoteWorkRecords.length > 0 && (
          <div className="space-y-2">
            {remoteWorkRecords.map((r) => (
              <StepCard
                key={r.id}
                title={r.description}
                subtitle={`${r.numberOfEmployees} funcionários · ${r.remoteDaysPerWeek} dias/semana`}
                value={r.totalCO2e.toFixed(3)}
                onDelete={() => onDeleteRemoteWork(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      {totalCO2e > 0 && (
        <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#765b00]">Total Casa-Trabalho + Remoto</span>
            <span className="text-lg font-bold text-[#765b00]">{totalCO2e.toFixed(3)} tCO₂e</span>
          </div>
        </div>
      )}
    </div>
  );
}
