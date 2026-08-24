import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout page="dashboard" onNav={() => {}} onLogout={() => {}}>
      <h1>Dashboard</h1>
    </AppLayout>
  );
}
