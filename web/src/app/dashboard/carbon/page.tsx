"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getInventories, getInventoryTotals, type InventoryTotals } from "@/lib/services/inventory";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Cloud,
  Flame,
  Zap,
  Cable,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  Factory,
  Car,
  Plane,
  Users,
  Laptop,
  RadioTower,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const SCOPE_COLORS = {
  scope1: "#efc13e",
  scope2: "#765b00",
  scope3: "#5f5e5e",
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function CarbonPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventories, setInventories] = useState<{ id: string; year: number }[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [totals, setTotals] = useState<InventoryTotals | null>(null);
  const [expandedScope, setExpandedScope] = useState<string | null>(null);
  const [showEducation, setShowEducation] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    const invs = await getInventories(user.organizationId);
    setInventories(invs);
    if (invs.length > 0) {
      const id = selectedInventoryId || invs[0].id;
      setSelectedInventoryId(id);
      const t = await getInventoryTotals(id);
      setTotals(t);
    }
    setLoading(false);
  }, [user?.organizationId, selectedInventoryId]);

  useEffect(() => {
    if (!user?.organizationId) return;
    loadData();
  }, [user?.organizationId, loadData]);

  async function handleInventoryChange(id: string) {
    setSelectedInventoryId(id);
    setLoading(true);
    const t = await getInventoryTotals(id);
    setTotals(t);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  if (inventories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
            Inventário de Carbono
          </h1>
          <p className="mt-1 text-[#4e4634]">
            Acompanhe suas emissões de GEE conforme o GHG Protocol.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-10 text-center shadow-sm">
          <Cloud className="mx-auto h-14 w-14 text-[#d1c5ae]" />
          <h2 className="mt-5 text-lg font-semibold text-[#1b1c1c]">
            Nenhum inventário disponível
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#4e4634]">
            Crie um inventário energético para visualizar suas emissões de carbono
            organizadas por Escopo 1, 2 e 3.
          </p>
        </div>
      </div>
    );
  }

  const hasData = totals && totals.grandTotal > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
            Inventário de Carbono
          </h1>
          <p className="mt-1 text-[#4e4634]">
            Emissões de GEE por escopo — GHG Protocol Corporate Standard
          </p>
        </div>

        {inventories.length > 1 && (
          <select
            value={selectedInventoryId || inventories[0].id}
            onChange={(e) => handleInventoryChange(e.target.value)}
            className="rounded-lg border border-[#d1c5ae] bg-white px-4 py-2 text-sm font-medium text-[#1b1c1c] shadow-sm focus:border-[#efc13e] focus:outline-none focus:ring-1 focus:ring-[#efc13e]"
          >
            {inventories.map((inv) => (
              <option key={inv.id} value={inv.id}>
                Inventário {inv.year}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grand Total Banner */}
      {hasData && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#4e4634]">
                Emissões Totais do Inventário
              </p>
              <p className="mt-1 text-4xl font-bold text-[#1b1c1c] sm:text-5xl">
                {totals!.grandTotal.toFixed(1)}
                <span className="ml-2 text-xl font-medium text-[#807662]">tCO₂e</span>
              </p>
            </div>
            <button
              onClick={() => setShowEducation(!showEducation)}
              className="inline-flex items-center gap-2 rounded-full border border-[#d1c5ae] bg-[#f5f3f3] px-4 py-2 text-sm font-medium text-[#4e4634] transition-colors hover:bg-[#e9e8e7]"
            >
              <Info className="h-4 w-4" />
              O que são Escopos 1, 2 e 3?
              {showEducation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Education Panel */}
          {showEducation && (
            <div className="mt-6 rounded-lg border border-[#d1c5ae]/30 bg-[#f5f3f3] p-5">
              <h3 className="text-base font-bold text-[#1b1c1c]">
                GHG Protocol — Escopos de Emissões
              </h3>
              <p className="mt-1 text-sm text-[#4e4634]">
                O GHG Protocol classifica as emissões de gases de efeito estufa em três escopos
                para facilitar o inventário corporativo e a gestão de carbono.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border-l-4 border-[#efc13e] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-[#efc13e]" />
                    <h4 className="font-bold text-[#1b1c1c]">Escopo 1 — Diretas</h4>
                  </div>
                  <p className="mt-2 text-sm text-[#4e4634]">
                    Emissões de fontes que <strong>pertencem ou são controladas</strong> pela organização.
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[#4e4634]">
                    <li>• Combustão estacionária (caldeiras, geradores, fornos)</li>
                    <li>• Combustão móvel (frota de veículos, empilhadeiras)</li>
                    <li>• Emissões fugitivas (vazamentos de refrigeração)</li>
                    <li>• Processos industriais</li>
                  </ul>
                </div>
                <div className="rounded-lg border-l-4 border-[#765b00] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#765b00]" />
                    <h4 className="font-bold text-[#1b1c1c]">Escopo 2 — Energia Indireta</h4>
                  </div>
                  <p className="mt-2 text-sm text-[#4e4634]">
                    Emissões associadas à <strong>geração de energia comprada</strong> pela organização.
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[#4e4634]">
                    <li>• Eletricidade consumida (location-based, fator SIN)</li>
                    <li>• Vapor, aquecimento e refrigeração comprados</li>
                    <li>• Método market-based (fator do fornecedor)</li>
                  </ul>
                </div>
                <div className="rounded-lg border-l-4 border-[#5f5e5e] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Cable className="h-5 w-5 text-[#5f5e5e]" />
                    <h4 className="font-bold text-[#1b1c1c]">Escopo 3 — Cadeia de Valor</h4>
                  </div>
                  <p className="mt-2 text-sm text-[#4e4634]">
                    Emissões que ocorrem na <strong>cadeia de valor</strong> mas não são controladas diretamente.
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[#4e4634]">
                    <li>• Perdas de transmissão e distribuição (T&D)</li>
                    <li>• Viagens corporativas (aéreo, rodoviário)</li>
                    <li>• Deslocamento casa-trabalho</li>
                    <li>• Trabalho remoto (eletricidade em casa)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-white p-3 text-xs text-[#4e4634]">
                <strong>Nota:</strong> O CO₂ biogênico (de biomassa renovável) é reportado separadamente
                e não é incluído no total de tCO₂e, conforme diretrizes do IPCC.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scope Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ScopeCard
          title="Escopo 1"
          subtitle="Emissões Diretas"
          value={totals?.scope1.total ?? 0}
          grandTotal={totals?.grandTotal ?? 0}
          icon={Flame}
          borderColor="#efc13e"
          iconColor="text-[#efc13e]"
          expanded={expandedScope === "scope1"}
          onToggle={() => setExpandedScope(expandedScope === "scope1" ? null : "scope1")}
          breakdown={
            totals
              ? [
                  { label: "Combustão Estacionária", value: totals.scope1.stationaryCombustion, icon: Factory },
                  { label: "Combustão Móvel", value: totals.scope1.mobileCombustion, icon: Car },
                ]
              : []
          }
        />
        <ScopeCard
          title="Escopo 2"
          subtitle="Emissões Indiretas — Energia"
          value={totals?.scope2.total ?? 0}
          grandTotal={totals?.grandTotal ?? 0}
          icon={Zap}
          borderColor="#765b00"
          iconColor="text-[#765b00]"
          expanded={expandedScope === "scope2"}
          onToggle={() => setExpandedScope(expandedScope === "scope2" ? null : "scope2")}
          breakdown={
            totals
              ? [
                  { label: "Location-Based (SIN)", value: totals.scope2.locationBased, icon: RadioTower },
                  { label: "Market-Based", value: totals.scope2.marketBased, icon: BarChart3 },
                ]
              : []
          }
        />
        <ScopeCard
          title="Escopo 3"
          subtitle="Outras Emissões Indiretas"
          value={totals?.scope3.total ?? 0}
          grandTotal={totals?.grandTotal ?? 0}
          icon={Cable}
          borderColor="#5f5e5e"
          iconColor="text-[#5f5e5e]"
          expanded={expandedScope === "scope3"}
          onToggle={() => setExpandedScope(expandedScope === "scope3" ? null : "scope3")}
          breakdown={
            totals
              ? [
                  { label: "Perdas T&D", value: totals.scope3.tdLosses, icon: RadioTower },
                  { label: "Viagens Corporativas", value: totals.scope3.businessTravel, icon: Plane },
                  { label: "Deslocamento Casa-Trabalho", value: totals.scope3.commute, icon: Users },
                  { label: "Trabalho Remoto", value: totals.scope3.remoteWork, icon: Laptop },
                ]
              : []
          }
        />
      </div>

      {/* Charts */}
      {hasData && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Donut Chart */}
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#4e4634]">
                Distribuição por Escopo
              </h3>
              <p className="mb-4 text-xs text-[#807662]">
                Participação de cada escopo nas emissões totais
              </p>
              <div className="flex h-64 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Escopo 1", value: totals!.scope1.total },
                        { name: "Escopo 2", value: totals!.scope2.total },
                        { name: "Escopo 3", value: totals!.scope3.total },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Escopo 1", value: totals!.scope1.total },
                        { name: "Escopo 2", value: totals!.scope2.total },
                        { name: "Escopo 3", value: totals!.scope3.total },
                      ]
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Escopo 1"
                                ? SCOPE_COLORS.scope1
                                : entry.name === "Escopo 2"
                                  ? SCOPE_COLORS.scope2
                                  : SCOPE_COLORS.scope3
                            }
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)} tCO₂e`}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #d1c5ae",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#4e4634]">
                Detalhamento por Fonte
              </h3>
              <p className="mb-4 text-xs text-[#807662]">
                Emissões em toneladas de CO₂ equivalente
              </p>
              <div className="space-y-4">
                {totals &&
                  [
                    {
                      scope: "Escopo 1 — Diretas",
                      color: SCOPE_COLORS.scope1,
                      items: [
                        { label: "Combustão Estacionária", value: totals.scope1.stationaryCombustion },
                        { label: "Combustão Móvel", value: totals.scope1.mobileCombustion },
                      ],
                    },
                    {
                      scope: "Escopo 2 — Energia Indireta",
                      color: SCOPE_COLORS.scope2,
                      items: [
                        { label: "Location-Based (SIN)", value: totals.scope2.locationBased },
                        { label: "Market-Based", value: totals.scope2.marketBased },
                      ],
                    },
                    {
                      scope: "Escopo 3 — Cadeia de Valor",
                      color: SCOPE_COLORS.scope3,
                      items: [
                        { label: "Perdas T&D", value: totals.scope3.tdLosses },
                        { label: "Viagens Corporativas", value: totals.scope3.businessTravel },
                        { label: "Deslocamento Casa-Trabalho", value: totals.scope3.commute },
                        { label: "Trabalho Remoto", value: totals.scope3.remoteWork },
                      ],
                    },
                  ].map((group) => {
                    const maxVal = Math.max(...group.items.map((i) => i.value), 0.001);
                    return (
                      <div key={group.scope}>
                        <p className="mb-2 text-xs font-semibold text-[#1b1c1c]">{group.scope}</p>
                        <div className="space-y-2">
                          {group.items.map((item) => {
                            const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                            return (
                              <div key={item.label}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#4e4634]">{item.label}</span>
                                  <span className="font-semibold text-[#1b1c1c]">
                                    {item.value.toFixed(2)} tCO₂e
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e4e2e2]">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, backgroundColor: group.color }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Monthly Emissions Chart */}
          <MonthlyEmissionsChart inventoryId={selectedInventoryId!} />

          {/* Biogenic Note */}
          {totals && totals.totalBiogenicCO2 > 0 && (
            <div className="rounded-lg border border-[#d1c5ae]/30 bg-[#f5f3f3] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#765b00]" />
                <div>
                  <h4 className="text-sm font-semibold text-[#1b1c1c]">CO₂ Biogênico</h4>
                  <p className="mt-1 text-sm text-[#4e4634]">
                    Este inventário contém <strong>{totals.totalBiogenicCO2.toFixed(2)} tCO₂</strong> de
                    CO₂ biogênico (proveniente de biomassa renovável). Conforme as diretrizes do IPCC,
                    este valor é reportado separadamente e <strong>não está incluído</strong> no total de
                    tCO₂e apresentado acima.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!hasData && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-8 text-center shadow-sm">
          <BarChart3 className="mx-auto h-10 w-10 text-[#d1c5ae]" />
          <h3 className="mt-3 text-sm font-semibold text-[#1b1c1c]">
            Dados de emissão pendentes
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#4e4634]">
            Preencha as seções do inventário energético (combustão, eletricidade, etc.)
            para visualizar os cálculos de emissões por escopo.
          </p>
        </div>
      )}
    </div>
  );
}

function ScopeCard({
  title,
  subtitle,
  value,
  grandTotal,
  icon: Icon,
  borderColor,
  iconColor,
  expanded,
  onToggle,
  breakdown,
}: {
  title: string;
  subtitle: string;
  value: number;
  grandTotal: number;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  breakdown: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }[];
}) {
  const percentage = grandTotal > 0 ? (value / grandTotal) * 100 : 0;

  return (
    <div
      className="rounded-xl border border-[#d1c5ae]/20 bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f3f3]">
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-[#1b1c1c]">{title}</h3>
              <p className="text-xs text-[#4e4634]">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-[#807662] transition-colors hover:bg-[#f5f3f3] hover:text-[#1b1c1c]"
            aria-label={expanded ? "Recolher detalhes" : "Expandir detalhes"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#1b1c1c]">
              {value.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-[#807662]">tCO₂e</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4e2e2]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: borderColor }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-[#4e4634]">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Breakdown */}
      {expanded && breakdown.length > 0 && (
        <div className="border-t border-[#d1c5ae]/20 bg-[#f5f3f3] px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#807662]">
            Fontes de Emissão
          </p>
          <div className="space-y-3">
            {breakdown.map((item) => {
              const ItemIcon = item.icon;
              const itemPct = value > 0 ? (item.value / value) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ItemIcon className="h-3.5 w-3.5 text-[#807662]" />
                      <span className="text-[#4e4634]">{item.label}</span>
                    </div>
                    <span className="font-semibold text-[#1b1c1c]">
                      {item.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#e4e2e2]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${itemPct}%`, backgroundColor: borderColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthlyEmissionsChart({ inventoryId }: { inventoryId: string }) {
  const [data, setData] = useState<
    { month: string; scope1: number; scope2: number; scope3: number }[]
  >([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    async function loadMonthly() {
      setChartLoading(true);
      // Fetch monthly data from electricity, stationary, and td_losses
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const [stationarySnap, electricitySnap, tdSnap] = await Promise.all([
        getDocs(query(collection(db, "stationary_combustion"), where("inventoryId", "==", inventoryId))),
        getDocs(query(collection(db, "electricity_consumption"), where("inventoryId", "==", inventoryId))),
        getDocs(query(collection(db, "td_losses"), where("inventoryId", "==", inventoryId))),
      ]);

      const monthly: Record<string, { scope1: number; scope2: number; scope3: number }> = {};
      MONTHS.forEach((m) => {
        monthly[m] = { scope1: 0, scope2: 0, scope3: 0 };
      });

      // Stationary combustion — approximate monthly from annual
      const statTotal = stationarySnap.docs.reduce((s, d) => s + (d.data().emissionCO2e || 0), 0);
      if (statTotal > 0) {
        const perMonth = statTotal / 12;
        MONTHS.forEach((m) => { monthly[m].scope1 += perMonth; });
      }

      // Electricity — use monthlyConsumption if available
      electricitySnap.docs.forEach((d) => {
        const record = d.data();
        const mc = record.monthlyConsumption || {};
        const factors = record.sinFactors || {};
        const annualFactor = record.annualSinFactor || 0;
        MONTHS.forEach((m, i) => {
          const consumption = mc[m.toLowerCase()] || mc[MONTHS[i].toLowerCase()] || 0;
          const factor = factors[m.toLowerCase()] || factors[MONTHS[i].toLowerCase()] || annualFactor / 12;
          monthly[m].scope2 += consumption * factor;
        });
      });

      // T&D losses — approximate monthly
      const tdTotal = tdSnap.docs.reduce((s, d) => s + (d.data().totalCO2e || 0), 0);
      if (tdTotal > 0) {
        const perMonth = tdTotal / 12;
        MONTHS.forEach((m) => { monthly[m].scope3 += perMonth; });
      }

      setData(MONTHS.map((m) => ({ month: m, ...monthly[m] })));
      setChartLoading(false);
    }

    if (inventoryId) loadMonthly();
  }, [inventoryId]);

  if (chartLoading) {
    return (
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#4e4634]">
          Emissões Mensais por Escopo
        </h3>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#efc13e]" />
        </div>
      </div>
    );
  }

  const hasMonthlyData = data.some((d) => d.scope1 > 0 || d.scope2 > 0 || d.scope3 > 0);

  if (!hasMonthlyData) return null;

  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#4e4634]">
        Emissões Mensais por Escopo
      </h3>
      <p className="mb-4 text-xs text-[#807662]">
        Distribuição mensal das emissões em tCO₂e
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#807662" }} />
            <YAxis tick={{ fontSize: 11, fill: "#807662" }} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #d1c5ae",
                fontSize: "13px",
              }}
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} tCO₂e`,
                name === "scope1" ? "Escopo 1" : name === "scope2" ? "Escopo 2" : "Escopo 3",
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "scope1" ? "Escopo 1" : value === "scope2" ? "Escopo 2" : "Escopo 3"
              }
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar dataKey="scope1" name="scope1" fill={SCOPE_COLORS.scope1} radius={[4, 4, 0, 0]} />
            <Bar dataKey="scope2" name="scope2" fill={SCOPE_COLORS.scope2} radius={[4, 4, 0, 0]} />
            <Bar dataKey="scope3" name="scope3" fill={SCOPE_COLORS.scope3} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
