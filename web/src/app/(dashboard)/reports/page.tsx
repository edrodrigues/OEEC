"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getInventories } from "@/lib/services/inventory";
import { cn } from "@/lib/utils";
import {
  Loader2,
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  BarChart3,
  Leaf,
  Cloud,
  Clock,
  CheckCircle,
} from "lucide-react";

const REPORT_TEMPLATES = [
  {
    id: "executive",
    name: "Relatório Executivo",
    description: "Resumo gerencial com KPIs principais e gráficos de tendência.",
    icon: BarChart3,
    format: "PDF",
  },
  {
    id: "ghg",
    name: "Relatório GHG Protocol",
    description: "Inventário detalhado de emissões por Escopo 1, 2 e 3.",
    icon: Cloud,
    format: "PDF",
  },
  {
    id: "esg",
    name: "Relatório ESG",
    description: "Indicadores ambientais, sociais e de governança com alinhamento ODS.",
    icon: Leaf,
    format: "PDF",
  },
  {
    id: "data",
    name: "Planilha de Dados",
    description: "Exportação completa de todos os registros de consumo e emissões.",
    icon: FileSpreadsheet,
    format: "Excel",
  },
  {
    id: "ranking",
    name: "Relatório de Ranking",
    description: "Posição no ranking nacional, score detalhado e comparação com pares.",
    icon: FileText,
    format: "PDF",
  },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [inventories, setInventories] = useState<{ id: string; year: number }[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<string>("");
  const [reportHistory, setReportHistory] = useState<
    { id: string; name: string; format: string; date: string; status: string }[]
  >([]);

  async function loadData() {
    setLoading(true);
    const invs = await getInventories(user!.organizationId!);
    setInventories(invs);
    if (invs.length > 0) setSelectedInventory(invs[0].id);

    setReportHistory([
      { id: "1", name: "Relatório Executivo", format: "PDF", date: "2026-04-15", status: "ready" },
      { id: "2", name: "Relatório GHG Protocol", format: "PDF", date: "2026-04-15", status: "ready" },
      { id: "3", name: "Planilha de Dados", format: "Excel", date: "2026-03-20", status: "ready" },
    ]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!user?.organizationId) return;
    loadData();
  }, [user?.organizationId]);

  async function handleGenerate(templateId: string) {
    setGenerating(templateId);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const template = REPORT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setReportHistory((prev) => [
        {
          id: Date.now().toString(),
          name: template.name,
          format: template.format,
          date: new Date().toISOString().split("T")[0],
          status: "ready",
        },
        ...prev,
      ]);
    }
    setGenerating(null);
  }

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
          Central de Relatórios
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Gere e exporte relatórios em PDF e Excel.
        </p>
      </div>

      {inventories.length > 0 && (
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-[#4e4634]" />
          <span className="text-sm text-[#4e4634]">Inventário:</span>
          <select
            value={selectedInventory}
            onChange={(e) => setSelectedInventory(e.target.value)}
            className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
          >
            {inventories.map((inv) => (
              <option key={inv.id} value={inv.id}>
                Inventário {inv.year}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efc13e]/10">
                <template.icon className="h-5 w-5 text-[#765b00]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1b1c1c]">{template.name}</h3>
                <p className="mt-1 text-xs text-[#4e4634]">{template.description}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-[#f5f3f3] px-2 py-0.5 text-xs font-medium text-[#4e4634]">
                {template.format}
              </span>
              <button
                onClick={() => handleGenerate(template.id)}
                disabled={generating !== null}
                className={cn(
                  "flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-xs font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02]",
                  generating !== null && "cursor-not-allowed opacity-50"
                )}
              >
                {generating === template.id ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3" />
                    Gerar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {reportHistory.length > 0 && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1b1c1c]">
            <Clock className="h-4 w-4" />
            Histórico de Relatórios
          </h3>
          <div className="space-y-3">
            {reportHistory.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-[#d1c5ae]/10 p-3"
              >
                <div className="flex items-center gap-3">
                  {report.format === "PDF" ? (
                    <FileText className="h-5 w-5 text-[#ba1a1a]" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#1b1c1c]">{report.name}</p>
                    <p className="text-xs text-[#807662]">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Pronto
                  </span>
                    <button
                      className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-xs text-[#4e4634] hover:bg-[#f5f3f3]"
                      onClick={() => alert("Funcionalidade de download estará disponível em breve.")}
                    >
                      <Download className="h-3 w-3" />
                      Baixar
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
