"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  getDashboardSummary,
  getScopeBreakdown,
  getYearOverYearComparison,
  getFuelBreakdown,
  getScope3Breakdown,
  getSourceBreakdown,
  getESGSummary,
  getRankingSummary,
  getMonthlyEmissionsByScope,
  subscribeToInventory,
  type DashboardSummary,
  type ScopeBreakdown,
  type Scope3Breakdown,
  type SourceBreakdown,
  type ESGSummary,
  type RankingSummary,
} from "@/lib/services/dashboard";
import { getInventories } from "@/lib/services/inventory";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Zap,
  Cloud,
  TrendingUp,
  TrendingDown,
  Flame,
  Cable,
  ShoppingCart,
  BarChart3,
  AlertCircle,
  ArrowRight,
  FileText,
  Leaf,
  Trophy,
  Car,
  Plane,
  Users,
  Laptop,
  Factory,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Target,
  Gauge,
  Award,
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const SCOPE_COLORS = {
  scope1: "#efc13e",
  scope2: "#765b00",
  scope3: "#5f5e5e",
};

const TIER_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#eab308",
  D: "#f97316",
  E: "#ef4444",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [scopeBreakdown, setScopeBreakdown] = useState<ScopeBreakdown[]>([]);
  const [scope3Data, setScope3Data] = useState<Scope3Breakdown | null>(null);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [esgData, setEsgData] = useState<ESGSummary | null>(null);
  const [rankingData, setRankingData] = useState<RankingSummary | null>(null);
  const [yearOverYear, setYearOverYear] = useState<
    { year: number; emissions: number; energy: number }[]
  >([]);
  const [fuelBreakdown, setFuelBreakdown] = useState<
    { fuel: string; emissions: number }[]
  >([]);
  const [monthlyByScope, setMonthlyByScope] = useState<
    { month: string; scope1: number; scope2: number; scope3: number }[]
  >([]);
  const [activeInventoryId, setActiveInventoryId] = useState<string | null>(null);
  const [inventories, setInventories] = useState<{ id: string; year: number }[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");
  const [expandedScope3, setExpandedScope3] = useState(false);
  const [expandedSources, setExpandedSources] = useState(false);

  async function loadData(inventoryId?: string) {
    if (!user?.organizationId) return;
    setLoading(true);

    const inventoriesList = await getInventories(user.organizationId);
    setInventories(inventoriesList);

    const invId = inventoryId || (inventoriesList.length > 0 ? inventoriesList[0].id : null);
    if (!invId) {
      setLoading(false);
      return;
    }

    setActiveInventoryId(invId);
    setSelectedInventoryId(invId);

    const [
      summaryData,
      scopeData,
      yoyData,
      fuelData,
      scope3DataResult,
      sourceData,
      esgResult,
      rankingResult,
      monthlyData,
    ] = await Promise.all([
      getDashboardSummary(user.organizationId),
      getScopeBreakdown(invId),
      getYearOverYearComparison(user.organizationId),
      getFuelBreakdown(invId),
      getScope3Breakdown(invId),
      getSourceBreakdown(invId),
      getESGSummary(user.organizationId),
      getRankingSummary(user.organizationId),
      getMonthlyEmissionsByScope(invId),
    ]);

    setSummary(summaryData);
    setScopeBreakdown(scopeData);
    setYearOverYear(yoyData);
    setFuelBreakdown(fuelData);
    setScope3Data(scope3DataResult);
    setSourceBreakdown(sourceData);
    setEsgData(esgResult);
    setRankingData(rankingResult);
    setMonthlyByScope(monthlyData);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!user) return;
    if (!user.organizationId) {
      router.push("/dashboard/onboarding");
      return;
    }
    loadData();
  }, [user, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!activeInventoryId) return;
    const unsub = subscribeToInventory(activeInventoryId, () => {
      loadData(activeInventoryId);
    });
    return () => unsub();
  }, [activeInventoryId]);

  async function handleInventoryChange(id: string) {
    setSelectedInventoryId(id);
    await loadData(id);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  if (!summary || summary.inventoryCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
            Dashboard Executivo
          </h1>
          <p className="mt-1 text-[#4e4634]">
            Bem-vindo ao OEEC — sua plataforma de eficiência energética
          </p>
        </div>

        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-[#d1c5ae]" />
          <h2 className="mt-4 text-lg font-semibold text-[#1b1c1c]">
            Nenhum dado disponível
          </h2>
          <p className="mt-2 text-sm text-[#4e4634]">
            Cadastre seu inventário energético para visualizar métricas e gerar
            relatórios.
          </p>
          <button
            onClick={() => router.push("/dashboard/inventory")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#efc13e] px-6 py-2.5 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            Iniciar Inventário
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const hasData = summary.totalEmissions > 0 || summary.totalEnergyConsumption > 0;
  const tierColor = rankingData ? TIER_COLORS[rankingData.tier] : "#d1c5ae";

  return (
    <div className="space-y-6">
      {/* Header with inventory selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
            Dashboard Executivo
          </h1>
          <p className="mt-1 text-[#4e4634]">
            {summary.organizationName && (
              <span className="font-medium">{summary.organizationName}</span>
            )}
            {summary.organizationSector && ` — ${summary.organizationSector}`}
            {summary.latestInventoryYear > 0 && ` — Inventário ${summary.latestInventoryYear}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {inventories.length > 1 && (
            <select
              value={selectedInventoryId}
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

          {/* Completion badge */}
          <div className="flex items-center gap-2 rounded-lg border border-[#d1c5ae]/30 bg-white px-3 py-2 text-sm shadow-sm">
            <FileText className="h-4 w-4 text-[#765b00]" />
            <span className="font-medium text-[#1b1c1c]">
              {summary.completionPercentage}%
            </span>
            <span className="text-xs text-[#807662]">completo</span>
          </div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#1b1c1c]">Progresso do Inventário</span>
          <span className="text-xs text-[#807662]">
            {summary.completionPercentage >= 100 ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completo
              </span>
            ) : (
              `${summary.completionPercentage}% preenchido`
            )}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e4e2e2]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              summary.completionPercentage >= 100
                ? "bg-green-500"
                : summary.completionPercentage >= 50
                  ? "bg-[#efc13e]"
                  : "bg-[#d1c5ae]"
            )}
            style={{ width: `${Math.min(summary.completionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroKpiCard
          label="Emissões Totais"
          value={summary.totalEmissions.toFixed(1)}
          unit="tCO₂e"
          icon={Cloud}
          iconColor="text-[#765b00]"
          iconBg="bg-[#765b00]/10"
          trend={
            summary.yearOverYearChange !== 0
              ? {
                  value: `${summary.yearOverYearChange > 0 ? "+" : ""}${summary.yearOverYearChange.toFixed(1)}%`,
                  positive: summary.yearOverYearChange <= 0,
                }
              : undefined
          }
        />
        <HeroKpiCard
          label="Consumo Energético"
          value={summary.totalEnergyConsumption.toFixed(1)}
          unit="MWh"
          icon={Zap}
          iconColor="text-[#efc13e]"
          iconBg="bg-[#efc13e]/10"
        />
        <HeroKpiCard
          label="Intensidade Energética"
          value={summary.energyIntensity.toFixed(2)}
          unit="MWh/m²"
          icon={Gauge}
          iconColor="text-[#5f5e5e]"
          iconBg="bg-[#5f5e5e]/10"
        />
        <HeroKpiCard
          label="Energia Renovável"
          value={summary.renewablePercentage.toFixed(1)}
          unit="%"
          icon={Leaf}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          positive={summary.renewablePercentage > 0}
        />
      </div>

      {/* Scope Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScopeMiniCard
          title="Escopo 1"
          subtitle="Diretas"
          value={summary.scope1Emissions}
          color="#efc13e"
          icon={Flame}
          total={summary.totalEmissions}
        />
        <ScopeMiniCard
          title="Escopo 2"
          subtitle="Localização"
          value={summary.scope2LocationEmissions}
          color="#765b00"
          icon={Zap}
          total={summary.totalEmissions}
        />
        <ScopeMiniCard
          title="Escopo 2"
          subtitle="Market-Based"
          value={summary.scope2MarketEmissions}
          color="#5a4500"
          icon={ShoppingCart}
          total={summary.totalEmissions}
        />
        <ScopeMiniCard
          title="Escopo 3"
          subtitle="Cadeia de Valor"
          value={summary.scope3Emissions}
          color="#5f5e5e"
          icon={Cable}
          total={summary.totalEmissions}
          onClick={() => setExpandedScope3(!expandedScope3)}
          expanded={expandedScope3}
        />
      </div>

      {/* Expanded Scope 3 Breakdown */}
      {expandedScope3 && scope3Data && scope3Data.total > 0 && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
            Detalhamento Escopo 3 — Cadeia de Valor
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Scope3Item
              label="Perdas T&D"
              value={scope3Data.tdLosses}
              icon={Cable}
              total={scope3Data.total}
              color="#5f5e5e"
            />
            <Scope3Item
              label="Viagens Corporativas"
              value={scope3Data.businessTravel}
              icon={Plane}
              total={scope3Data.total}
              color="#4a4949"
            />
            <Scope3Item
              label="Deslocamento Casa-Trabalho"
              value={scope3Data.commute}
              icon={Car}
              total={scope3Data.total}
              color="#3a3939"
            />
            <Scope3Item
              label="Trabalho Remoto"
              value={scope3Data.remoteWork}
              icon={Laptop}
              total={scope3Data.total}
              color="#2a2929"
            />
          </div>
        </div>
      )}

      {/* ESG + Ranking Row */}
      {(esgData || rankingData) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* ESG Scorecard */}
          {esgData && (
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-semibold text-[#1b1c1c]">
                  Score ESG
                </h3>
              </div>

              <div className="flex items-center gap-6">
                {/* Overall Score Circle */}
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#e4e2e2"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={
                        esgData.overallScore >= 70
                          ? "#22c55e"
                          : esgData.overallScore >= 40
                            ? "#eab308"
                            : "#ef4444"
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${esgData.overallScore * 2.64} 264`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-bold text-[#1b1c1c]">
                      {esgData.overallScore.toFixed(0)}
                    </span>
                    <span className="block text-[10px] text-[#807662]">/ 100</span>
                  </div>
                </div>

                {/* Pillar Scores */}
                <div className="flex-1 space-y-3">
                  <PillarBar
                    label="Ambiental"
                    value={esgData.environmental}
                    color="#22c55e"
                  />
                  <PillarBar
                    label="Social"
                    value={esgData.social}
                    color="#3b82f6"
                  />
                  <PillarBar
                    label="Governança"
                    value={esgData.governance}
                    color="#8b5cf6"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ranking / Score */}
          {rankingData && (
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#efc13e]" />
                <h3 className="text-sm font-semibold text-[#1b1c1c]">
                  Ranking OEEC
                </h3>
              </div>

              <div className="flex items-center gap-6">
                {/* Tier Badge */}
                <div
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: tierColor }}
                >
                  <Award className="h-6 w-6" />
                  <span className="text-3xl font-bold">{rankingData.tier}</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-[#807662]">Score Total</p>
                    <p className="text-2xl font-bold text-[#1b1c1c]">
                      {rankingData.scoreTotal.toFixed(1)}
                      <span className="ml-1 text-sm font-normal text-[#807662]">/ 100</span>
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(rankingData.scoreTotal, 100)}%`, backgroundColor: tierColor }}
                    />
                  </div>
                  <p className="text-xs text-[#807662]">
                    Classificação:{" "}
                    <span className="font-semibold" style={{ color: tierColor }}>
                      Classe {rankingData.tier}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      {hasData && (
        <>
          {/* Scope Donut + Monthly Emissions by Scope */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-[#1b1c1c]">
                Distribuição por Escopo
              </h3>
              <p className="mb-4 text-xs text-[#807662]">
                Participação de cada escopo nas emissões totais
              </p>
              <div className="flex h-64 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scopeBreakdown.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percentage }) =>
                        `${name} ${percentage.toFixed(0)}%`
                      }
                    >
                      {scopeBreakdown
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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

            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-[#1b1c1c]">
                Emissões Mensais por Escopo
              </h3>
              <p className="mb-4 text-xs text-[#807662]">
                Distribuição mensal em tCO₂e
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyByScope}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${Number(value).toFixed(2)} tCO₂e`,
                        name === "scope1"
                          ? "Escopo 1"
                          : name === "scope2"
                            ? "Escopo 2"
                            : "Escopo 3",
                      ]}
                    />
                    <Legend
                      formatter={(value: string) =>
                        value === "scope1"
                          ? "Escopo 1"
                          : value === "scope2"
                            ? "Escopo 2"
                            : "Escopo 3"
                      }
                    />
                    <Bar
                      dataKey="scope1"
                      name="scope1"
                      fill={SCOPE_COLORS.scope1}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="scope2"
                      name="scope2"
                      fill={SCOPE_COLORS.scope2}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="scope3"
                      name="scope3"
                      fill={SCOPE_COLORS.scope3}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Source Breakdown + Year-over-Year */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Source Breakdown */}
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1b1c1c]">
                    Emissões por Fonte
                  </h3>
                  <p className="text-xs text-[#807662]">
                    Detalhamento de todas as fontes emissoras
                  </p>
                </div>
                <button
                  onClick={() => setExpandedSources(!expandedSources)}
                  className="rounded-md p-1 text-[#807662] hover:bg-[#f5f3f3]"
                >
                  {expandedSources ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {sourceBreakdown
                  .slice(0, expandedSources ? undefined : 5)
                  .map((item) => {
                    const maxVal = Math.max(...sourceBreakdown.map((s) => s.value), 0.001);
                    const width = (item.value / maxVal) * 100;
                    const pctOfTotal =
                      summary.totalEmissions > 0
                        ? (item.value / summary.totalEmissions) * 100
                        : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-[#1b1c1c]">
                              {item.label}
                            </span>
                            <span className="rounded bg-[#f5f3f3] px-1.5 py-0.5 text-[10px] font-medium text-[#807662]">
                              {item.scope}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-[#1b1c1c]">
                              {item.value.toFixed(2)}
                            </span>
                            <span className="ml-1 text-xs text-[#807662]">
                              tCO₂e ({pctOfTotal.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Year-over-Year Trend */}
            {yearOverYear.length > 1 && (
              <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-[#1b1c1c]">
                  Evolução Anual
                </h3>
                <p className="mb-4 text-xs text-[#807662]">
                  Emissões e consumo energético ao longo dos anos
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearOverYear}>
                      <defs>
                        <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#efc13e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#efc13e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#765b00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#765b00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="emissions"
                        name="Emissões (tCO₂e)"
                        stroke="#efc13e"
                        strokeWidth={2}
                        fill="url(#colorEmissions)"
                      />
                      <Area
                        type="monotone"
                        dataKey="energy"
                        name="Energia (MWh)"
                        stroke="#765b00"
                        strokeWidth={2}
                        fill="url(#colorEnergy)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Fuel Breakdown */}
          {fuelBreakdown.length > 0 && (
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Factory className="h-4 w-4 text-[#efc13e]" />
                <h3 className="text-sm font-semibold text-[#1b1c1c]">
                  Emissões por Combustível (Escopo 1)
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fuelBreakdown.map((item) => {
                  const maxEmissions = Math.max(
                    ...fuelBreakdown.map((f) => f.emissions)
                  );
                  const width =
                    maxEmissions > 0
                      ? (item.emissions / maxEmissions) * 100
                      : 0;
                  const pctOfScope1 =
                    summary.scope1Emissions > 0
                      ? (item.emissions / summary.scope1Emissions) * 100
                      : 0;
                  return (
                    <div
                      key={item.fuel}
                      className="rounded-lg border border-[#d1c5ae]/10 bg-[#f5f3f3] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1b1c1c]">
                          {item.fuel}
                        </span>
                        <span className="text-xs text-[#807662]">
                          {pctOfScope1.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-1 text-lg font-bold text-[#1b1c1c]">
                        {item.emissions.toFixed(2)}
                        <span className="ml-1 text-xs font-normal text-[#807662]">
                          tCO₂e
                        </span>
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e4e2e2]">
                        <div
                          className="h-full rounded-full bg-[#efc13e] transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!hasData && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 text-center shadow-sm">
          <BarChart3 className="mx-auto h-10 w-10 text-[#d1c5ae]" />
          <h3 className="mt-3 text-sm font-semibold text-[#1b1c1c]">
            Dados pendentes
          </h3>
          <p className="mt-1 text-sm text-[#4e4634]">
            Preencha seu inventário energético para visualizar gráficos e
            análises detalhadas.
          </p>
          <button
            onClick={() => router.push("/dashboard/inventory")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#efc13e] px-5 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]"
          >
            Ir para Inventário
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Component: Hero KPI Card ─── */
function HeroKpiCard({
  label,
  value,
  unit,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  positive,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: { value: string; positive: boolean };
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.positive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {trend.positive ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-[#807662]">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#1b1c1c]">{value}</span>
          <span className="text-sm text-[#807662]">{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Component: Scope Mini Card ─── */
function ScopeMiniCard({
  title,
  subtitle,
  value,
  color,
  icon: Icon,
  total,
  onClick,
  expanded,
}: {
  title: string;
  subtitle: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  total: number;
  onClick?: () => void;
  expanded?: boolean;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        onClick && "hover:border-[#d1c5ae]/40"
      )}
      style={{ borderTop: `3px solid ${color}` }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <div>
            <p className="text-xs font-semibold text-[#1b1c1c]">{title}</p>
            <p className="text-[10px] text-[#807662]">{subtitle}</p>
          </div>
        </div>
        {onClick && (
          expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-[#807662]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[#807662]" />
          )
        )}
      </div>
      <div className="mt-3">
        <p className="text-xl font-bold text-[#1b1c1c]">
          {value.toFixed(1)}
          <span className="ml-1 text-xs font-normal text-[#807662]">tCO₂e</span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4e2e2]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-[#807662]">
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Component: Scope 3 Item ─── */
function Scope3Item({
  label,
  value,
  icon: Icon,
  total,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="rounded-lg border border-[#d1c5ae]/10 bg-[#f5f3f3] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-medium text-[#1b1c1c]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-[#1b1c1c]">
        {value.toFixed(2)}
        <span className="ml-1 text-xs font-normal text-[#807662]">tCO₂e</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e4e2e2]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-1 text-[10px] text-[#807662]">{pct.toFixed(1)}% do Escopo 3</p>
    </div>
  );
}

/* ─── Component: ESG Pillar Bar ─── */
function PillarBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#1b1c1c]">{label}</span>
        <span className="font-semibold" style={{ color }}>
          {value.toFixed(0)}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
