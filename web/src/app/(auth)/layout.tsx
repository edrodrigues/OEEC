import AuthClientLayout from "./layout-client";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthClientLayout>{children}</AuthClientLayout>;
}
