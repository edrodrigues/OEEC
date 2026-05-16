"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getESGData,
  getESGHistory,
  calculateAndSaveESG,
  type ESGIndicator,
} from "@/lib/services/esg";
import { getInventories } from "@/lib/services/inventory";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Leaf,
  Users,
  Shield,
  Save,
  Target,
  TrendingUp,
  AlertCircle,
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
  LineChart,
  Line,
} from "recharts";

const ODS_ITEMS = [
  { key: "ods7", label: "ODS 7", name: "Energia Limpa", icon: "\u26A1" },
  { key: "ods11", label: "ODS 11", name: "Cidades Sustent\u00E1veis", icon: "\uD83C\uDFD9\uFE0F" },
  { key: "ods12", label: "ODS 12", name: "Consumo Respons\u00E1vel", icon: "\u267B\uFE0F" },
  { key: "ods13", label: "ODS 13", name: "A\u00E7\u00E3o Clim\u00E1tica", icon: "\uD83C\uDF21\uFE0F" },
  { key: "ods15", label: "ODS 15", name: "Vida Terrestre", icon: "\uD83C\uDF3F" },
];

const ENV_METRICS = [
  { key: "energyIntensity", label: "Intensidade Energética" },
  { key: "carbonIntensity", label: "Intensidade Carbônica" },
  { key: "renewablePercentage", label: "% Renovável" },
  { key: "wasteManagement", label: "Gestão de Resíduos" },
  { key: "waterUsage", label: "Uso de Água" },
  { key: "biodiversity", label: "Biodiversidade" },
];

const SOCIAL_METRICS = [
  { key: "workforceDiversity", label: "Diversidade" },
  { key: "employeeSafety", label: "Segurança" },
  { key: "communityEngagement", label: "Comunidade" },
  { key: "trainingHours", label: "Treinamento" },
  { key: "laborPractices", label: "Práticas Trabalhistas" },
  { key: "humanRights", label: "Direitos Humanos" },
];

const GOV_METRICS = [
  { key: "boardDiversity", label: "Diversidade do Conselho" },
  { key: "antiCorruption", label: "Anticorrupção" },
  { key: "transparency", label: "Transparência" },
  { key: "riskManagement", label: "Gestão de Riscos" },
  { key: "compliance", label: "Compliance" },
  { key: "ethicsPolicy", label: "Política de Ética" },
];

export default function ESGPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "ods" | "history">("overview");
  const [esgData, setEsgData] = useState<ESGIndicator | null>(null);
  const [esgHistory, setEsgHistory] = useState<ESGIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [socialForm, setSocialForm] = useState<Record<string, number>>({
    workforceDiversity: 0,
    employeeSafety: 0,
    communityEngagement: 0,
    trainingHours: 0,
    laborPractices: 0,
    humanRights: 0,
    wasteManagement: 0,
    waterUsage: 0,
    biodiversity: 0,
  });

  const [govForm, setGovForm] = useState<Record<string, number>>({
    boardDiversity: 0,
    antiCorruption: 0,
    transparency: 0,
    riskManagement: 0,
    compliance: 0,
    ethicsPolicy: 0,
  });

  async function loadData() {
    setLoading(true);
    const inventories = await getInventories(user!.organizationId!);
    if (inventories.length > 0) {
      const esg = await getESGData(user!.organizationId!);
      const history = await getESGHistory(user!.organizationId!);
      setEsgData(esg);
      setEsgHistory(history);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!user?.organizationId) return;
    loadData();
  }, [user?.organizationId]);

  async function handleSave() {
    if (!user?.organizationId) return;
    setSaving(true);
    const inventories = await getInventories(user.organizationId);
    if (inventories.length > 0) {
      await calculateAndSaveESG(
        user.organizationId,
        inventories[0].id,
        inventories[0].year,
        socialForm,
        govForm
      );
      await loadData();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: Leaf },
    { id: "details" as const, label: "Indicadores", icon: Target },
    { id: "ods" as const, label: "ODS", icon: Target },
    { id: "history" as const, label: "Histórico", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
            ESG
          </h1>
          <p className="mt-1 text-[#4e4634]">
            Indicadores Ambientais, Sociais e de Governança.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]",
            saving && "cursor-not-allowed opacity-70"
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Calcular ESG
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#efc13e] text-[#1b1c1c]"
                : "text-[#4e4634] hover:bg-[#f5f3f3]"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {esgData && activeTab === "overview" && <OverviewTab data={esgData} />}
      {activeTab === "details" && (
        <DetailsTab socialForm={socialForm} setSocialForm={setSocialForm} govForm={govForm} setGovForm={setGovForm} esgData={esgData} />
      )}
      {esgData && activeTab === "ods" && <ODSTab data={esgData} />}
      {esgHistory.length > 0 && activeTab === "history" && <HistoryTab history={esgHistory} />}

      {!esgData && activeTab !== "details" && (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <Leaf className="mx-auto h-10 w-10 text-[#d1c5ae]" />
          <h3 className="mt-3 text-sm font-semibold text-[#1b1c1c]">
            Nenhum dado ESG calculado
          </h3>
          <p className="mt-1 text-sm text-[#4e4634]">
            Preencha os indicadores e clique em &quot;Calcular ESG&quot; para gerar seu score.
          </p>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ data }: { data: ESGIndicator }) {
  const radarData = [
    { metric: "Ambiental", value: data.environmental.totalScore },
    { metric: "Social", value: data.social.totalScore },
    { metric: "Governança", value: data.governance.totalScore },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreCard
          title="Ambiental (E)"
          score={data.environmental.totalScore}
          icon={Leaf}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <ScoreCard
          title="Social (S)"
          score={data.social.totalScore}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <ScoreCard
          title="Governança (G)"
          score={data.governance.totalScore}
          icon={Shield}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
            Score ESG Geral
          </h3>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div
                className={cn(
                  "text-5xl font-bold",
                  data.overallScore >= 70
                    ? "text-green-600"
                    : data.overallScore >= 50
                      ? "text-[#efc13e]"
                      : "text-[#ba1a1a]"
                )}
              >
                {data.overallScore.toFixed(1)}
              </div>
              <p className="mt-2 text-sm text-[#4e4634]">de 100 pontos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
            Radar ESG
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#efc13e"
                  fill="#efc13e"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm font-medium text-[#4e4634]">{title}</span>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1">
          <span className={cn("text-3xl font-bold", color)}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-[#807662]">/100</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
          <div
            className={cn("h-full rounded-full transition-all", bgColor.replace("bg-", "bg-").replace("50", "400"))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DetailsTab({ socialForm, setSocialForm, govForm, setGovForm, esgData }: {
  socialForm: Record<string, number>;
  setSocialForm: (v: React.SetStateAction<Record<string, number>>) => void;
  govForm: Record<string, number>;
  setGovForm: (v: React.SetStateAction<Record<string, number>>) => void;
  esgData: ESGIndicator | null;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1b1c1c]">
          <Leaf className="h-4 w-4 text-green-600" />
          Indicadores Ambientais
        </h3>
        {esgData ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ENV_METRICS.map((m) => (
              <div key={m.key} className="rounded-lg bg-[#f5f3f3] p-3">
                <p className="text-xs text-[#4e4634]">{m.label}</p>
                <p className="mt-1 text-lg font-bold text-[#1b1c1c]">
                  {(esgData.environmental as unknown as Record<string, number>)[m.key]?.toFixed(1) || "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#4e4634]">Preencha os indicadores sociais e de governan\u00E7a e clique em &quot;Calcular ESG&quot;.</p>
        )}
      </div>

      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1b1c1c]">
          <Users className="h-4 w-4 text-blue-600" />
          Indicadores Sociais
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOCIAL_METRICS.map((m) => (
            <div key={m.key}>
              <label className="block text-xs font-medium text-[#4e4634]">
                {m.label}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={socialForm[m.key] || ""}
                onChange={(e) =>
                  setSocialForm({ ...socialForm, [m.key]: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2 text-sm"
                placeholder="0-100"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1b1c1c]">
          <Shield className="h-4 w-4 text-purple-600" />
          Indicadores de Governança
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GOV_METRICS.map((m) => (
            <div key={m.key}>
              <label className="block text-xs font-medium text-[#4e4634]">
                {m.label}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={govForm[m.key] || ""}
                onChange={(e) =>
                  setGovForm({ ...govForm, [m.key]: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2 text-sm"
                placeholder="0-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ODSTab({ data }: { data: ESGIndicator }) {
  const odsData = ODS_ITEMS.map((ods) => ({
    name: ods.label,
    score: (data.odsAlignment as unknown as Record<string, number>)[ods.key] || 0,
    icon: ods.icon,
    description: ods.name,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
          Alinhamento com os Objetivos de Desenvolvimento Sustentável (ODS)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {odsData.map((ods) => (
            <div
              key={ods.name}
              className="rounded-lg border border-[#d1c5ae]/20 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{ods.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1b1c1c]">
                    {ods.name}
                  </p>
                  <p className="text-xs text-[#4e4634]">{ods.description}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#765b00]">
                    {ods.score.toFixed(0)}
                  </span>
                  <span className="text-xs text-[#807662]">/100</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e4e2e2]">
                  <div
                    className="h-full rounded-full bg-[#efc13e]"
                    style={{ width: `${ods.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
          Comparativo ODS
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={odsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="score"
                name="Score"
                fill="#efc13e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ history }: { history: ESGIndicator[] }) {
  const chartData = history.map((d) => ({
    year: d.year,
    ambiental: d.environmental.totalScore,
    social: d.social.totalScore,
    governanca: d.governance.totalScore,
    geral: d.overallScore,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">
          Evolução do Score ESG
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e2" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="geral"
                name="Geral"
                stroke="#efc13e"
                strokeWidth={2}
                dot={{ fill: "#efc13e" }}
              />
              <Line
                type="monotone"
                dataKey="ambiental"
                name="Ambiental"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e" }}
              />
              <Line
                type="monotone"
                dataKey="social"
                name="Social"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="governanca"
                name="Governança"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: "#a855f7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Ano</th>
              <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Ambiental</th>
              <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Social</th>
              <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Governança</th>
              <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Geral</th>
            </tr>
          </thead>
          <tbody>
            {history.map((d) => (
              <tr key={d.id} className="border-b border-[#e4e2e2]/50 last:border-0">
                <td className="px-4 py-3 font-medium text-[#1b1c1c]">{d.year}</td>
                <td className="px-4 py-3 text-green-600">{d.environmental.totalScore.toFixed(1)}</td>
                <td className="px-4 py-3 text-blue-600">{d.social.totalScore.toFixed(1)}</td>
                <td className="px-4 py-3 text-purple-600">{d.governance.totalScore.toFixed(1)}</td>
                <td className="px-4 py-3 font-bold text-[#765b00]">{d.overallScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
