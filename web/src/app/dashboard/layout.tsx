import DashboardClientLayout from "./layout-client";

export const dynamic = "force-dynamic";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
