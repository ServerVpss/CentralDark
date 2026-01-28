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
      "sticky top-0 z-30 h-16 border-b border-border/30",
      className
    )} style={{
      background: "linear-gradient(to right, hsl(220 20% 5% / 0.95), hsl(220 20% 6% / 0.95))",
      backdropFilter: "blur(16px) saturate(180%)",
    }}>
      <div className="flex h-full items-center pl-4 lg:pl-6 pr-2 lg:pr-3">
        {/* Search - left aligned but with max width */}
        <div className="relative w-full max-w-sm lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Buscar bots, assinantes, configurações..."
            className="pl-11 h-11 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Spacer - pushes actions to far right */}
        <div className="flex-1 min-w-8" />

        {/* Actions - far right corner */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-10 w-10 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-[9px] font-bold text-primary-foreground">
                3
              </span>
            </span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 px-3 h-11 rounded-xl hover:bg-white/5">
                <div className="relative flex-shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/30">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-gradient-to-br from-emerald-400 to-green-500" />
                </div>
                <div className="hidden lg:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {profile?.full_name || user?.email?.split("@")[0] || "Usuário"}
                  </span>
                  <span className="text-xs text-primary flex items-center gap-1 leading-tight">
                    <Crown className="h-3 w-3" />
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/30">
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