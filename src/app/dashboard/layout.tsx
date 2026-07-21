import AdminPanelLayout from "@/components/layout/dashboard-layout/admin-panel-layout";
import AuthGuard from "@/src/components/guards/auth-guard";

interface DashboardLayoutPageProps {
  children: React.ReactNode;
}

export default function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  return (
    <AuthGuard>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AuthGuard>
  );
}