"use client";

import { Flame, Zap, Plane, Car, Home, BarChart3 } from "lucide-react";
import type { InventoryTotals } from "@/lib/data/inventory-types";

interface ReviewStepProps {
  totals: InventoryTotals;
  inventoryName: string;
  inventoryYear: number;
  recordCounts: {
    stationary: number;
    mobile: number;
    electricityLocation: number;
    electricityMarket: number;
    businessTravel: number;
    commute: number;
    remoteWork: number;
  };
}

export function ReviewStep({ totals, inventoryName, inventoryYear, recordCounts }: ReviewStepProps) {
  const scope1Total = totals.scope1.stationaryCombustion + totals.scope1.mobileCombustion;
  const scope2Total = totals.scope2.locationBased + totals.scope2.marketBased;
  const scope3Total = totals.scope3.businessTravel + totals.scope3.commute;

  const scope1Pct = totals.grandTotal > 0 ? (scope1Total / totals.grandTotal) * 100 : 0;
  const scope2Pct = totals.grandTotal > 0 ? (scope2Total / totals.grandTotal) * 100 : 0;
  const scope3Pct = totals.grandTotal > 0 ? (scope3Total / totals.grandTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#1b1c1c]">Revisão do Inventário</h2>
          <p className="text-sm text-[#4e4634]">{inventoryName} — Ano {inventoryYear}</p>
        </div>

        {/* Grand Total */}
        <div className="mb-6 rounded-xl bg-[#efc13e]/10 p-6 text-center">
          <p className="text-sm font-medium text-[#765b00]">Emissões Totais do Inventário</p>
          <p className="mt-2 text-4xl font-bold text-[#1b1c1c]">{totals.grandTotal.toFixed(2)}</p>
          <p className="text-sm text-[#4e4634]">tCO₂e</p>
          {totals.totalBiogenicCO2 > 0 && (
            <p className="mt-2 text-xs text-green-700">CO₂ Biogênico (não incluído): {totals.totalBiogenicCO2.toFixed(2)} t</p>
          )}
        </div>

        {/* Scope Breakdown */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#4e4634]">Distribuição por Escopo</h3>

          {/* Scope 1 */}
          <div className="rounded-lg border border-[#d1c5ae]/20 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <Flame className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1b1c1c]">Escopo 1 — Emissões Diretas</p>
                  <p className="text-xs text-[#807662]">{scope1Pct.toFixed(0)}% do total</p>
                </div>
              </div>
              <span className="text-lg font-bold text-[#1b1c1c]">{scope1Total.toFixed(2)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded bg-[#f5f3f3] p-2">
                <p className="text-[#807662]">Combustão Estacionária</p>
                <p className="font-semibold text-[#1b1c1c]">{totals.scope1.stationaryCombustion.toFixed(2)} tCO₂e</p>
                <p className="text-[#807662]">{recordCounts.stationary} registros</p>
              </div>
              <div className="rounded bg-[#f5f3f3] p-2">
                <p className="text-[#807662]">Combustão Móvel</p>
                <p className="font-semibold text-[#1b1c1c]">{totals.scope1.mobileCombustion.toFixed(2)} tCO₂e</p>
                <p className="text-[#807662]">{recordCounts.mobile} registros</p>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
              <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${scope1Pct}%` }} />
            </div>
          </div>

          {/* Scope 2 */}
          <div className="rounded-lg border border-[#d1c5ae]/20 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#efc13e]/20">
                  <Zap className="h-4 w-4 text-[#765b00]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1b1c1c]">Escopo 2 — Energia Adquirida</p>
                  <p className="text-xs text-[#807662]">{scope2Pct.toFixed(0)}% do total</p>
                </div>
              </div>
              <span className="text-lg font-bold text-[#1b1c1c]">{scope2Total.toFixed(2)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded bg-[#f5f3f3] p-2">
                <p className="text-[#807662]">Location-Based</p>
                <p className="font-semibold text-[#1b1c1c]">{totals.scope2.locationBased.toFixed(2)} tCO₂e</p>
                <p className="text-[#807662]">{recordCounts.electricityLocation} registros</p>
              </div>
              <div className="rounded bg-[#f5f3f3] p-2">
                <p className="text-[#807662]">Market-Based</p>
                <p className="font-semibold text-[#1b1c1c]">{totals.scope2.marketBased.toFixed(2)} tCO₂e</p>
                <p className="text-[#807662]">{recordCounts.electricityMarket} registros</p>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
              <div className="h-full rounded-full bg-[#efc13e] transition-all" style={{ width: `${scope2Pct}%` }} />
            </div>
          </div>

          {/* Scope 3 */}
          <div className="rounded-lg border border-[#d1c5ae]/20 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1b1c1c]">Escopo 3 — Outras Indiretas</p>
                  <p className="text-xs text-[#807662]">{scope3Pct.toFixed(0)}% do total</p>
                </div>
              </div>
              <span className="text-lg font-bold text-[#1b1c1c]">{scope3Total.toFixed(2)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded bg-[#f5f3f3] p-2">
                <p className="text-[#807662]">Viagens a Negócio</p>
                <p className="font-semibold text-[#1b1c1c]">{totals.scope3.businessTravel.toFixed(2)} tCO₂e</p>
                <p className="text-[#807662]">{recordCounts.businessTravel} registros</p>
              </div>
              <div className="rounded bg-[#f5f3f3] p-2">
                <p className="text-[#807662]">Casa-Trabalho + Remoto</p>
                <p className="font-semibold text-[#1b1c1c]">{totals.scope3.commute.toFixed(2)} tCO₂e</p>
                <p className="text-[#807662]">{recordCounts.commute + recordCounts.remoteWork} registros</p>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${scope3Pct}%` }} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 rounded-lg bg-[#f5f3f3] p-4">
          <p className="mb-2 text-sm font-semibold text-[#4e4634]">Resumo do Inventário</p>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-[#807662]">Total de registros</p>
              <p className="text-lg font-bold text-[#1b1c1c]">
                {Object.values(recordCounts).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div>
              <p className="text-[#807662]">Escopos preenchidos</p>
              <p className="text-lg font-bold text-[#1b1c1c]">
                {[scope1Total > 0, scope2Total > 0, scope3Total > 0].filter(Boolean).length}/3
              </p>
            </div>
            <div>
              <p className="text-[#807662]">CO₂ Biogênico</p>
              <p className="text-lg font-bold text-green-700">{totals.totalBiogenicCO2.toFixed(2)} t</p>
            </div>
            <div>
              <p className="text-[#807662]">Intensidade</p>
              <p className="text-lg font-bold text-[#1b1c1c]">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
