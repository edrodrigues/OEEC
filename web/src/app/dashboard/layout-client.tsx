"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2 } from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf9f8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>;
}
