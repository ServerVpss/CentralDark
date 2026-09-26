import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getActiveMaintenance } from "@/lib/maintenance.functions";
import { AlertTriangle, Wrench } from "lucide-react";
import { formatDateTimeBR } from "@/lib/datetime";

/**
 * Banner exibido apenas em /app/chat quando há manutenção rodando ou agendada
 * pra começar dentro do período de antecedência. Texto leigo, sem jargão técnico.
 */
export function MaintenanceBanner() {
  const fn = useServerFn(getActiveMaintenance);
  const { data } = useQuery({
    queryKey: ["maintenance-banner"],
    queryFn: () => fn(),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  if (!data?.active) return null;

  const isRunning = data.state === "running";
  const Icon = isRunning ? Wrench : AlertTriangle;
  const title = isRunning
    ? "Manutenção em andamento"
    : data.state === "upcoming"
      ? `Manutenção em ${data.minutes_until ?? 0} min`
      : "Janela de manutenção ativa";

  const subtitle = isRunning
    ? "Algumas conexões WhatsApp podem reconectar nos próximos minutos."
    : data.state === "upcoming"
      ? `Programada pra ${data.scheduled_for ? formatDateTimeBR(data.scheduled_for) : "em breve"}. Conexões podem oscilar.`
      : "Atualizações automáticas podem rolar agora. Conexões podem oscilar.";

  return (
    <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-amber-200">
      <div className="mx-auto flex max-w-7xl items-center gap-3 text-sm">
        <Icon className="h-4 w-4 shrink-0" />
        <div className="flex flex-col leading-tight sm:flex-row sm:items-center sm:gap-2">
          <span className="font-semibold">{title}</span>
          <span className="text-amber-100/80">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
