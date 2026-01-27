import { Bot, Plus, RefreshCw, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Adicionar Bot", color: "text-primary" },
  { icon: Shield, label: "Ativar Proteção", color: "text-success" },
  { icon: RefreshCw, label: "Reiniciar Todos", color: "text-warning" },
  { icon: Zap, label: "Boost Rápido", color: "text-accent" },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Ações Rápidas</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:border-primary/30 hover:bg-primary/5"
          >
            <action.icon className={`h-5 w-5 ${action.color}`} />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
