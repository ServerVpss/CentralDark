import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Logo } from "./Logo";
import { BottomNav } from "./BottomNav";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-72"
      )}>
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-border/40 glass px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={2.25} />
          </Button>
          <Logo size={28} />
          <span className="text-lg font-bold text-foreground tracking-tight">TelePanel</span>
        </div>

        <Header className="hidden lg:block" />
        <main className="p-4 lg:p-6 pb-28 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile com FAB central */}
      <BottomNav />
    </div>
  );
}
