import { Bell, Search, User, LogOut, Settings, Sparkles, Crown, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, profile, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const openSearch = () => {
    // Trigger Ctrl+K programmatically
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <header 
      className={cn(
        "h-14 border-b border-border/40 bg-background/95 backdrop-blur-md",
        className
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left spacer */}
        <div className="w-48 hidden lg:block" />

        {/* Search - Centered */}
        <div className="relative flex-1 max-w-md mx-auto">
          <button
            onClick={openSearch}
            className="w-full flex items-center gap-2 pl-3 pr-2 h-9 bg-muted/50 border border-border/50 rounded-lg text-sm text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-4 w-4 flex items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-primary animate-ping opacity-40" />
              <span className="relative h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                3
              </span>
            </span>
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-2 rounded-lg hover:bg-accent">
                <div className="relative">
                  <div className="h-7 w-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {profile?.full_name || user?.email?.split("@")[0] || "Usuário"}
                  </span>
                  <span className="text-[10px] text-primary flex items-center gap-0.5 leading-tight">
                    <Crown className="h-2.5 w-2.5" />
                    Premium
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{profile?.full_name || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</p>
                    <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                      <Sparkles className="h-3 w-3" />
                      Plano Premium
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}