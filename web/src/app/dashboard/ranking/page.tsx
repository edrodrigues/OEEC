"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getRankings,
  getOrganizationRanking,
  type RankingEntry,
  calculateTier,
} from "@/lib/services/ranking";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const TIER_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 border-green-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-yellow-100 text-yellow-700 border-yellow-200",
  D: "bg-orange-100 text-orange-700 border-orange-200",
  E: "bg-red-100 text-red-700 border-red-200",
};

const TIER_LABELS: Record<string, string> = {
  A: "Alta eficiência",
  B: "Boa eficiência",
  C: "Em transição",
  D: "Baixa eficiência",
  E: "Crítica",
};

const SECTORS = [
  "Todos",
  "Indústria",
  "Comércio",
  "Serviços",
  "Administração Pública",
  "Saúde",
  "Educação",
  "Transporte",
  "Agronegócio",
];

const BRAZILIAN_STATES = [
  "Todos",
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

export default function RankingPage() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [orgRanking, setOrgRanking] = useState<RankingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState("Todos");
  const [filterState, setFilterState] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function loadData() {
    setLoading(true);
    const allRankings = await getRankings();
    setRankings(allRankings);

    if (user?.organizationId) {
      const org = await getOrganizationRanking(user.organizationId);
      setOrgRanking(org);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadData();
  }, []);

  const filteredRankings = rankings.filter((r) => {
    if (filterSector !== "Todos" && r.sector !== filterSector) return false;
    if (filterState !== "Todos" && r.state !== filterState) return false;
    if (
      searchTerm &&
      !r.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const tierDistribution = [
    { tier: "A", count: rankings.filter((r) => r.tier === "A").length },
    { tier: "B", count: rankings.filter((r) => r.tier === "B").length },
    { tier: "C", count: rankings.filter((r) => r.tier === "C").length },
    { tier: "D", count: rankings.filter((r) => r.tier === "D").length },
    { tier: "E", count: rankings.filter((r) => r.tier === "E").length },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
          Ranking Nacional
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Classificação nacional de eficiência energética e selos OEEC.
        </p>
      </div>

      {orgRanking && (
        <div className="rounded-xl border-2 border-[#efc13e]/30 bg-[#fffcf0] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#4e4634]">
                Sua classificação
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-3xl font-bold text-[#765b00]">
                  #{orgRanking.position || "—"}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-semibold",
                    TIER_COLORS[orgRanking.tier]
                  )}
                >
                  Classe {orgRanking.tier}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#4e4634]">
                Score: {orgRanking.scoreTotal.toFixed(1)} / 100
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-[#efc13e]" />
              <div>
                <p className="text-sm font-semibold text-[#1b1c1c]">
                  Selo OEEC — Classe {orgRanking.tier}
                </p>
                <p className="text-xs text-[#4e4634]">
                  {TIER_LABELS[orgRanking.tier]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#807662]" />
          <input
            type="text"
            placeholder="Buscar por cidade ou organização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#d1c5ae] bg-white py-2 pl-10 pr-3 text-sm focus:border-[#efc13e] focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-[#d1c5ae] bg-white px-4 py-2 text-sm text-[#4e4634] hover:bg-[#f5f3f3]"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-3 rounded-lg border border-[#d1c5ae]/20 bg-white p-4">
          <div>
            <label className="block text-xs font-medium text-[#4e4634]">
              Setor
            </label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="mt-1 rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2 text-sm"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4e4634]">
              Estado
            </label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="mt-1 rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2 text-sm"
            >
              {BRAZILIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Organização
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Cidade/UF
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Setor
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Classe
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#4e4634]">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredRankings.slice(0, 50).map((r, i) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-b border-[#e4e2e2]/50 last:border-0",
                        r.organizationId === user?.organizationId &&
                          "bg-[#fffcf0]"
                      )}
                    >
                      <td className="px-4 py-3">
                        {i < 3 ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#efc13e] text-xs font-bold text-[#1b1c1c]">
                            {r.position || i + 1}
                          </span>
                        ) : (
                          <span className="text-[#4e4634]">{r.position || i + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1b1c1c]">
                        {r.organizationName}
                      </td>
                      <td className="px-4 py-3 text-[#4e4634]">
                        {r.city}/{r.state}
                      </td>
                      <td className="px-4 py-3 text-[#4e4634]">{r.sector}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold",
                            TIER_COLORS[r.tier]
                          )}
                        >
                          {r.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#765b00]">
                        {r.scoreTotal.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
              Distribuição por Classe
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
                  <XAxis dataKey="tier" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Organizações" radius={[4, 4, 0, 0]}>
                    {tierDistribution.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.tier === "A"
                            ? "#22c55e"
                            : entry.tier === "B"
                              ? "#3b82f6"
                              : entry.tier === "C"
                                ? "#eab308"
                                : entry.tier === "D"
                                  ? "#f97316"
                                  : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
              Classificação OEEC
            </h3>
            <div className="space-y-2">
              {Object.entries(TIER_LABELS).map(([tier, label]) => (
                <div key={tier} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                      TIER_COLORS[tier]
                    )}
                  >
                    {tier}
                  </span>
                  <span className="text-sm text-[#4e4634]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
