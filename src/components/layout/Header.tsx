import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const navigate = useNavigate();

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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/settings")}
            className="h-8 w-8 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-8 w-8 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              50
            </span>
          </Button>

        </div>
      </div>
    </header>
  );
}