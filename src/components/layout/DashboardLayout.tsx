import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Logo } from "./Logo";
import { BottomNav } from "./BottomNav";
import { MobileAvatarMenu } from "./MobileAvatarMenu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuRevealTransition } from "@/components/transitions/MenuRevealTransition";

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
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm xl:hidden"
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
        sidebarCollapsed ? "xl:ml-[72px]" : "xl:ml-72"
      )}>
        {/* Mobile Header with Menu Button */}
        <div className="xl:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-border/40 glass px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={2.25} />
          </Button>
          <Logo size={28} />
          <span className="text-lg font-bold text-foreground tracking-tight">TelePanel</span>
          <div className="ml-auto">
            <MobileAvatarMenu />
          </div>
        </div>

        <Header className="hidden xl:block" />
        <main className="p-4 xl:p-6 pb-28 xl:pb-6">
          <MenuRevealTransition>{children}</MenuRevealTransition>
        </main>
      </div>

      {/* Bottom nav mobile com FAB central */}
      <BottomNav />
    </div>
  );
}
