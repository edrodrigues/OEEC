"use client";

import { AuthProvider } from "@/hooks/use-auth";

export default function AuthClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
