import { AuthLayout } from "../layout/AuthLayout";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {children}
    </AuthLayout>
  );
}
