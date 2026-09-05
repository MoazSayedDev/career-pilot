// app/(dashboard)/layout.tsx

import { AppLayout } from "@/components/layout/AppLayout";
import { UserInfoProvider } from "@/components/layout/UserInfo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserInfoProvider>
      <AppLayout>{children}</AppLayout>
    </UserInfoProvider>
  );
}
