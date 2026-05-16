"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getInventories } from "@/lib/services/inventory";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Cloud,
  Flame,
  Zap,
  Cable,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function CarbonPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventories, setInventories] = useState<{ id: string; year: number }[]>([]);

  useEffect(() => {
    if (!user?.organizationId) return;
    loadData();
  }, [user?.organizationId]);

  async function loadData() {
    setLoading(true);
    const invs = await getInventories(user!.organizationId!);
    setInventories(invs);
    setLoading(false);
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
          Inventário de Carbono
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Calcule e acompanhe suas emissões de carbono por Escopo 1, 2 e 3.
        </p>
      </div>

      {inventories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <Cloud className="mx-auto h-12 w-12 text-[#d1c5ae]" />
          <h2 className="mt-4 text-lg font-semibold text-[#1b1c1c]">
            Nenhum inventário disponível
          </h2>
          <p className="mt-2 text-sm text-[#4e4634]">
            Crie um inventário energético para visualizar suas emissões de carbono.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <ScopeCard
            title="Escopo 1"
            subtitle="Emissões Diretas"
            description="Combustão estacionária, fontes móveis, processos industriais"
            icon={Flame}
            color="text-[#efc13e]"
          />
          <ScopeCard
            title="Escopo 2"
            subtitle="Emissões Indiretas — Energia"
            description="Eletricidade comprada, vapor, aquecimento, refrigeração"
            icon={Zap}
            color="text-[#765b00]"
          />
          <ScopeCard
            title="Escopo 3"
            subtitle="Outras Emissões Indiretas"
            description="Perdas T&D, cadeia de valor, transporte, resíduos"
            icon={Cable}
            color="text-[#5f5e5e]"
          />
        </div>
      )}
    </div>
  );
}

function ScopeCard({ title, subtitle, description, icon: Icon, color }: {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", color)} />
        <div>
          <h3 className="font-semibold text-[#1b1c1c]">{title}</h3>
          <p className="text-xs text-[#4e4634]">{subtitle}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-[#4e4634]">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-[#1b1c1c]">—</span>
        <span className="text-xs text-[#807662]">tCO₂e</span>
      </div>
    </div>
  );
}
