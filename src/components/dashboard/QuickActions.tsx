import { Plus, Shield, RefreshCw, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  { 
    icon: Plus, 
    label: "Novo Bot", 
    description: "Adicionar bot",
    gradient: "from-amber-500 to-orange-500",
    path: "/bots"
  },
  { 
    icon: Shield, 
    label: "Segurança", 
    description: "Configurações",
    gradient: "from-emerald-500 to-green-500",
    path: "/security"
  },
  { 
    icon: RefreshCw, 
    label: "Logs", 
    description: "Ver consultas",
    gradient: "from-violet-500 to-purple-500",
    path: "/logs"
  },
  { 
    icon: Zap, 
    label: "PIX", 
    description: "Transações",
    gradient: "from-cyan-500 to-blue-500",
    path: "/pix"
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-amber-600/10 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Ações Rápidas</h2>
          <p className="text-xs text-muted-foreground">Acesso direto</p>
        </div>
      </div>
      
      {/* Actions Grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className={cn(
                "group relative h-auto flex-col items-start gap-2 p-4 rounded-xl",
                "border border-transparent hover:border-border/50",
                "bg-transparent hover:bg-muted/50 transition-all duration-200"
              )}
              onClick={() => navigate(action.path)}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-md",
                "transition-transform duration-200 group-hover:scale-105",
                action.gradient
              )}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              
              <div className="text-left">
                <span className="block text-sm font-medium text-foreground">{action.label}</span>
                <span className="block text-xs text-muted-foreground">{action.description}</span>
              </div>
              
              <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
