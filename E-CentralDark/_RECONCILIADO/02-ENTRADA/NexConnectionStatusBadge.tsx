import { NexConnectionStatus } from "./types";

const MAP: Record<NexConnectionStatus, { label: string; tone: string }> = {
  connected:    { label: "Conectado",    tone: "success" },
  disconnected: { label: "Desconectado", tone: "danger" },
  error:        { label: "Erro",         tone: "danger" },
  pending:      { label: "Pendente",     tone: "warn" },
};

export function NexConnectionStatusBadge({ status }: { status: NexConnectionStatus }) {
  const m = MAP[status];
  return <span className="nx-badge" data-tone={m.tone}>{m.label}</span>;
}
