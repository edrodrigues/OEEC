"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Cloud,
  Leaf,
  Trophy,
  Map,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Organização", href: "/organization", icon: Building2 },
  { name: "Inventário Energético", href: "/inventory", icon: FileText },
  { name: "Inventário Carbono", href: "/carbon", icon: Cloud },
  { name: "ESG", href: "/esg", icon: Leaf },
  { name: "Ranking Nacional", href: "/ranking", icon: Trophy },
  { name: "Mapa Inteligente", href: "/map", icon: Map },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-[#d1c5ae]/20 bg-[#303031] lg:flex">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efc13e]">
          <span className="text-sm font-bold text-[#1b1c1c]">O</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">OEEC</h1>
          <p className="text-[10px] text-[#d1c5ae]">Eficiência Energética</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#efc13e]/10 text-[#efc13e]"
                  : "text-[#d1c5ae] hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-xs text-[#807662]">v0.1.0</p>
      </div>
    </aside>
  );
}
