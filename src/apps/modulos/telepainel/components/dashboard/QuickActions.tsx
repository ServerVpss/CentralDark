import { Plus, Shield, FileText, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

const actions = [
  { icon: Plus, label: "Novo Bot", path: "/bots" },
  { icon: Shield, label: "Segurança", path: "/security" },
  { icon: FileText, label: "Logs", path: "/logs" },
  { icon: DollarSign, label: "PIX", path: "/pix" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground">Ações Rápidas</h3>
      </div>
      <div className="p-2 grid grid-cols-2 gap-1.5">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            className="group h-auto flex-col items-center gap-1.5 p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="h-4 w-4" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
