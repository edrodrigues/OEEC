"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e4e2e2] bg-[#fbf9f8] px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-[#4e4634] hover:bg-[#efeded] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-[#4e4634] hover:bg-[#efeded]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#efc13e]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#4e4634] hover:bg-[#efeded]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efc13e] text-sm font-semibold text-[#1b1c1c]">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden font-medium sm:inline">{user?.name || "Usuário"}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#d1c5ae]/20 bg-white py-1 shadow-lg">
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#4e4634] hover:bg-[#f5f3f3]">
                <User className="h-4 w-4" />
                Perfil
              </button>
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#fff5f5]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
