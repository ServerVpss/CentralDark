import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl",
      className
    )}>
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar bots, assinantes, configurações..."
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile */}
          <Button variant="ghost" className="gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">Admin</span>
              <span className="text-xs text-muted-foreground">Pro Plan</span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
