import { AlertTriangle, CheckCircle, Link, MessageSquare, Shield, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "security" | "user" | "message" | "link" | "success" | "warning";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "security",
    title: "Link bloqueado",
    description: "Anti-link ativado no grupo @comunidade",
    time: "2 min atrás",
  },
  {
    id: "2",
    type: "user",
    title: "Novo assinante",
    description: "João Silva assinou o plano Pro",
    time: "15 min atrás",
  },
  {
    id: "3",
    type: "success",
    title: "Bot reiniciado",
    description: "@MeuBotPrincipal reiniciou com sucesso",
    time: "1h atrás",
  },
  {
    id: "4",
    type: "warning",
    title: "Spam detectado",
    description: "5 mensagens bloqueadas em @canal_vendas",
    time: "2h atrás",
  },
  {
    id: "5",
    type: "message",
    title: "Alta atividade",
    description: "1.2k mensagens processadas hoje",
    time: "3h atrás",
  },
];

const iconMap = {
  security: Shield,
  user: UserPlus,
  message: MessageSquare,
  link: Link,
  success: CheckCircle,
  warning: AlertTriangle,
};

const colorMap = {
  security: "text-primary bg-primary/10",
  user: "text-success bg-success/10",
  message: "text-accent bg-accent/10",
  link: "text-warning bg-warning/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Atividade Recente</h2>
        <button className="text-sm text-primary hover:underline">Ver tudo</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/30"
            >
              <div className={cn("rounded-lg p-2", colorMap[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
