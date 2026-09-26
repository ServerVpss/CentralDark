import { useWorkspaceControls } from "@/hooks/use-workspace-controls";
import { AlertTriangle, Info, Octagon, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspaceBanner() {
  const { data: c } = useWorkspaceControls();
  if (!c) return null;

  const items: Array<{ key: string; level: "info" | "warning" | "danger"; text: string }> = [];

  if (c.is_paused) {
    items.push({
      key: "paused",
      level: "danger",
      text: c.paused_reason
        ? `Conta pausada pelo administrador: ${c.paused_reason}`
        : "Conta pausada pelo administrador. Os envios estão bloqueados.",
    });
  }

  if (c.subscription_status === "past_due") {
    items.push({ key: "sub", level: "warning", text: "Sua assinatura está em atraso. Regularize para evitar suspensão." });
  } else if (c.subscription_status === "expired") {
    items.push({ key: "sub", level: "danger", text: "Sua assinatura venceu. Renove para continuar usando o sistema." });
  } else if (c.subscription_status === "suspended") {
    items.push({ key: "sub", level: "danger", text: "Sua assinatura está suspensa. Entre em contato com o suporte." });
  }

  if (c.banner_enabled && c.banner_text) {
    items.push({ key: "custom", level: c.banner_level, text: c.banner_text });
  }

  if (!items.length) return null;

  return (
    <div className="space-y-1 border-b">
      {items.map((it) => {
        const Icon = it.level === "danger" ? Octagon : it.level === "warning" ? AlertTriangle : it.key === "paused" ? PauseCircle : Info;
        const styles =
          it.level === "danger"
            ? "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
            : it.level === "warning"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
              : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30";
        return (
          <div key={it.key} className={cn("flex items-center gap-2 px-4 py-2 text-sm border-l-4", styles)}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
}
