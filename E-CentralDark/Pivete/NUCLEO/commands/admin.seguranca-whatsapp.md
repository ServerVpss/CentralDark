# COMANDO - admin.seguranca-whatsapp.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.seguranca-whatsapp.tsx
**SHA:** 3564359565a867de
**Timestamp:** 2026-08-26T19:31:50.131425
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- pendente: "Pendente",
- <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
- <div style={{ display: "grid", gap: 12 }}>
- <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
- <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
- <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>

### Ouro Bruto (primeiros 5000 chars)
```
// Tela master: lista incidentes de segurança WhatsApp + liberar pausa.
// Acesso restrito a super_admin. Exige confirmação "CONFIRMO A LIBERAÇÃO" + motivo.
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  listSecurityIncidents,
  releaseSecurityPause,
  type SecurityIncident,
} from "@/lib/security-pause.functions";

export const Route = createFileRoute("/admin/seguranca-whatsapp")({
  component: SegurancaWhatsAppPage,
});

const severityColor: Record<SecurityIncident["severity"], string> = {
  low: "#64748b",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const statusLabel: Record<SecurityIncident["status"], string> = {
  pendente: "Pendente",
  liberado: "Liberado",
  reincidente: "Reincidente",
  bloqueado_manual: "Bloqueio manual",
};

function fmtBR(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function SegurancaWhatsAppPage() {
  const router = useRouter();
  const listFn = useServerFn(listSecurityIncidents);
  const releaseFn = useServerFn(releaseSecurityPause);
  const [filter, setFilter] = useState<SecurityIncident["status"] | "all">("all");
  const [selected, setSelected] = useState<SecurityIncident | null>(null);

  const q = useQuery({
    queryKey: ["admin-security-incidents", filter],
    queryFn: () => listFn({ data: { status: filter, limit: 200 } }),
  });

  const m = useMutation({
    mutationFn: (input: { workspaceId: string; incidentId: string; confirmText: string; reason: string }) =>
      releaseFn({ data: input }),
    onSuccess: () => {
      toast.success("Pausa liberada. Envio reativado.");
      setSelected(null);
      router.invalidate();
      q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🔒 Segurança WhatsApp</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
          Tentativas de envio fora da janela de 24h. Workspaces são pausados automaticamente.
          Apenas Super Admin pode liberar após auditoria.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "pendente", "reincidente", "liberado", "bloqueado_manual"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: filter === f ? "var(--primary)" : "transparent",
              color: filter === f ? "var(--primary-foreground)" : "var(--foreground)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {f === "all" ? "Todos" : statusLabel[f]}
          </button>
        ))}
      </div>

      {q.isLoading && <p>Carregando…</p>}
      {q.data && q.data.length === 0 && (
        <p style={{ color: "var(--muted-foreground)" }}>Nenhum incidente registrado.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {(q.data ?? []).map((inc) => (
          <div
            key={inc.id}
            style={{
              padding: 16,
              border: "1px solid var(--border)",
              borderLeft: `4px solid ${severityColor[inc.severity]}`,
              borderRadius: 8,
              background: "var(--card)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{inc.workspace_name ?? inc.workspace_id}</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: severityColor[inc.severity],
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {inc.severity}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {statusLabel[inc.status]} · tentativa #{inc.tamper_count}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 
```