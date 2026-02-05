import { Bell, Search, User, LogOut, Settings, Sparkles, Crown } from "lucide-react";
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

  return (
    <header className={cn(
      "sticky top-0 z-30 h-14 border-b border-border/30",
      className
    )} style={{
      background: "linear-gradient(to right, hsl(220 20% 5% / 0.95), hsl(220 20% 6% / 0.95))",
      backdropFilter: "blur(16px) saturate(180%)",
    }}>
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Search - left aligned */}
        <div className="relative w-full max-w-xs lg:max-w-sm group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Buscar bots, assinantes, configurações..."
            className="pl-10 h-9 bg-white/5 border-white/10 rounded-lg focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-muted-foreground/70 text-sm"
          />
        </div>

        {/* Actions - right aligned and centered vertically */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-[8px] font-bold text-primary-foreground">
                3
              </span>
            </span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="gap-2 px-2 h-9 rounded-lg hover:bg-white/5 bg-white/[0.03]"
              >
                {/* Avatar com borda e status */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-amber-600/10 border-2 border-primary">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-emerald-500" />
                </div>
                {/* Nome + Badge */}
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-foreground">
                    {profile?.full_name || user?.email?.split("@")[0] || "Usuário"}
                  </span>
                  <span className="text-[10px] text-primary flex items-center gap-0.5">
                    <Crown className="h-2.5 w-2.5" />
                    Premium
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2" style={{
              background: "linear-gradient(145deg, hsl(220 20% 10%), hsl(220 20% 8%))",
              border: "1px solid hsl(220 15% 15%)",
            }}>
              <DropdownMenuLabel className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-amber-600/10 border-2 border-primary">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {profile?.full_name || "Usuário"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user?.email}
                    </span>
                    <span className="text-xs text-primary flex items-center gap-1 mt-0.5">
                      <Sparkles className="h-3 w-3" />
                      Plano Premium
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
              >
                <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="rounded-lg py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sair da conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}