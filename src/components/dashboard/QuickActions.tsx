import { Bot, Plus, RefreshCw, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const actions = [
  { 
    icon: Plus, 
    label: "Adicionar Bot", 
    gradient: "from-amber-500 to-orange-500",
    path: "/bots"
  },
  { 
    icon: Shield, 
    label: "Segurança", 
    gradient: "from-emerald-500 to-green-500",
    path: "/security"
  },
  { 
    icon: RefreshCw, 
    label: "Consultas", 
    gradient: "from-violet-500 to-purple-500",
    path: "/logs"
  },
  { 
    icon: Zap, 
    label: "Transações", 
    gradient: "from-cyan-500 to-blue-500",
    path: "/pix"
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/50 p-6" style={{
      background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 20% 5%))",
    }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Ações Rápidas</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            className="group relative h-auto flex-col gap-3 py-5 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(220 20% 10%), hsl(220 20% 8%))",
            }}
            onClick={() => navigate(action.path)}
          >
            {/* Hover gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg transition-transform group-hover:scale-110`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="relative text-xs font-medium text-foreground">{action.label}</span>
            
            {/* Arrow on hover */}
            <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        ))}
      </div>
    </div>
  );
}