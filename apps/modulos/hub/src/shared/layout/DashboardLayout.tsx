import { type ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <span className="text-primary text-xl font-bold">⬡</span>
        <span className="font-semibold text-lg tracking-tight">Hub CentralDark</span>
        <span className="ml-auto text-xs text-muted-foreground">hub.centralldark.com</span>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
