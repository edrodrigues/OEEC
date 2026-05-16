"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  getDashboardSummary,
  getScopeBreakdown,
  getMonthlyTrend,
  getYearOverYearComparison,
  getFuelBreakdown,
  subscribeToInventory,
  type DashboardSummary,
  type ScopeBreakdown,
  type MonthlyData,
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
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [scopeBreakdown, setScopeBreakdown] = useState<ScopeBreakdown[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [yearOverYear, setYearOverYear] = useState<
    { year: number; emissions: number; energy: number }[]
  >([]);
  const [fuelBreakdown, setFuelBreakdown] = useState<
    { fuel: string; emissions: number }[]
  >([]);
  const [activeInventoryId, setActiveInventoryId] = useState<string | null>(
    null
  );

  async function loadData() {
    if (!user?.organizationId) return;
    setLoading(true);

    const inventories = await getInventories(user.organizationId);
    if (inventories.length > 0) {
      setActiveInventoryId(inventories[0].id);
      const [summaryData, scopeData, monthlyData, yoyData, fuelData] =
        await Promise.all([
          getDashboardSummary(user.organizationId),
          getScopeBreakdown(inventories[0].id),
          getMonthlyTrend(inventories[0].id),
          getYearOverYearComparison(user.organizationId),
          getFuelBreakdown(inventories[0].id),
        ]);
      setSummary(summaryData);
      setScopeBreakdown(scopeData);
      setMonthlyTrend(monthlyData);
      setYearOverYear(yoyData);
      setFuelBreakdown(fuelData);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!user) return;
    if (!user.organizationId) {
      router.push("/onboarding");
      return;
    }
    loadData();
  }, [user, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!activeInventoryId) return;
    const unsub = subscribeToInventory(activeInventoryId, () => {
      loadData();
    });
    return () => unsub();
  }, [activeInventoryId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  if (!summary) {
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
            onClick={() => router.push("/inventory")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#efc13e] px-6 py-2.5 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            Iniciar Inventário
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const hasData = summary.totalEmissions > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
          Dashboard Executivo
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Visão geral do desempenho energético e de emissões da sua organização.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Consumo Energético Total"
          value={summary.totalEnergyConsumption.toFixed(1)}
          unit="MWh"
          icon={Zap}
          color="text-[#efc13e]"
        />
        <StatCard
          title="Emissões Totais"
          value={summary.totalEmissions.toFixed(1)}
          unit="tCO₂e"
          icon={Cloud}
          color="text-[#765b00]"
        />
        <StatCard
          title="Escopo 1 — Diretas"
          value={summary.scope1Emissions.toFixed(1)}
          unit="tCO₂e"
          icon={Flame}
          color="text-[#efc13e]"
        />
        <StatCard
          title="Escopo 2 — Localização"
          value={summary.scope2LocationEmissions.toFixed(1)}
          unit="tCO₂e"
          icon={Zap}
          color="text-[#5f5e5e]"
        />
        <StatCard
          title="Escopo 3 — T&D"
          value={summary.scope3Emissions.toFixed(1)}
          unit="tCO₂e"
          icon={Cable}
          color="text-[#615e55]"
        />
        <StatCard
          title="Escopo 2 — Market-Based"
          value={summary.scope2MarketEmissions.toFixed(1)}
          unit="tCO₂e"
          icon={ShoppingCart}
          color="text-[#765b00]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Intensidade Energética"
          value={summary.energyIntensity.toFixed(2)}
          unit="MWh/m²"
          icon={BarChart3}
        />
        <KpiCard
          label="% Renovável"
          value={summary.renewablePercentage.toFixed(1)}
          unit="%"
          icon={TrendingUp}
          positive
        />
        <KpiCard
          label="Perdas T&D"
          value={summary.tdLossPercentage.toFixed(1)}
          unit="%"
          icon={Cable}
          positive={summary.tdLossPercentage < 5}
        />
        <KpiCard
          label="Variação Anual"
          value={
            summary.yearOverYearChange > 0
              ? `+${summary.yearOverYearChange.toFixed(1)}`
              : summary.yearOverYearChange.toFixed(1)
          }
          unit="%"
          icon={
            summary.yearOverYearChange > 0 ? TrendingUp : TrendingDown
          }
          positive={summary.yearOverYearChange <= 0}
        />
      </div>

      {hasData && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
                Emissões por Escopo
              </h3>
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
                      {scopeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        `${value.toFixed(2)} tCO₂e`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
                Consumo e Emissões Mensais
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="consumption"
                      name="Consumo (MWh)"
                      fill="#efc13e"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="emissions"
                      name="Emissões (tCO₂e)"
                      fill="#765b00"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {yearOverYear.length > 1 && (
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
                Evolução Anual de Emissões
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearOverYear}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      name="Emissões (tCO₂e)"
                      stroke="#efc13e"
                      strokeWidth={2}
                      dot={{ fill: "#efc13e" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energia (MWh)"
                      stroke="#765b00"
                      strokeWidth={2}
                      dot={{ fill: "#765b00" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {fuelBreakdown.length > 0 && (
            <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
                Emissões por Combustível (Escopo 1)
              </h3>
              <div className="space-y-3">
                {fuelBreakdown.map((item) => {
                  const maxEmissions = Math.max(
                    ...fuelBreakdown.map((f) => f.emissions)
                  );
                  const width =
                    maxEmissions > 0
                      ? (item.emissions / maxEmissions) * 100
                      : 0;
                  return (
                    <div key={item.fuel}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#1b1c1c]">
                          {item.fuel}
                        </span>
                        <span className="text-[#4e4634]">
                          {item.emissions.toFixed(2)} tCO₂e
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
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
            onClick={() => router.push("/inventory")}
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

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm font-medium text-[#4e4634]">{title}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#1b1c1c]">{value}</span>
        <span className="text-sm text-[#807662]">{unit}</span>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  positive,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  positive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm",
        positive
          ? "border-green-200 bg-green-50/50"
          : "border-[#d1c5ae]/20 bg-white"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            positive ? "text-green-600" : "text-[#4e4634]"
          )}
        />
        <span className="text-xs font-medium text-[#4e4634]">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={cn(
            "text-xl font-bold",
            positive ? "text-green-700" : "text-[#1b1c1c]"
          )}
        >
          {value}
        </span>
        <span className="text-xs text-[#807662]">{unit}</span>
      </div>
    </div>
  );
}
