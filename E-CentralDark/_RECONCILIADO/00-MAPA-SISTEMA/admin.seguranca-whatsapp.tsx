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
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>
                  <strong>Quando:</strong> {fmtBR(inc.created_at)}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>
                  <strong>Quem tentou:</strong> {inc.actor_name ?? inc.actor_email ?? inc.actor_user_id ?? "—"}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>
                  <strong>Provider:</strong> {inc.provider ?? "—"} · <strong>Ticket:</strong>{" "}
                  {inc.ticket_id ?? "—"}
                </div>
                {inc.payload && (
                  <pre
                    style={{
                      fontSize: 11,
                      background: "var(--muted)",
                      padding: 8,
                      borderRadius: 4,
                      overflow: "auto",
                      marginTop: 8,
                    }}
                  >
                    {JSON.stringify(inc.payload, null, 2)}
                  </pre>
                )}
                {inc.status === "liberado" && inc.released_reason && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted-foreground)" }}>
                    Liberado em {fmtBR(inc.released_at!)} — motivo: {inc.released_reason}
                  </div>
                )}
              </div>
              {(inc.status === "pendente" || inc.status === "reincidente") && inc.tamper_count < 3 && (
                <button
                  onClick={() => setSelected(inc)}
                  style={{
                    padding: "8px 16px",
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Liberar envio
                </button>
              )}
              {inc.tamper_count >= 3 && (
                <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                  3+ reincidências — contatar suporte técnico
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ReleaseDialog
          incident={selected}
          onClose={() => setSelected(null)}
          onConfirm={(confirmText, reason) =>
            m.mutate({
              workspaceId: selected.workspace_id,
              incidentId: selected.id,
              confirmText,
              reason,
            })
          }
          loading={m.isPending}
        />
      )}
    </div>
  );
}

function ReleaseDialog({
  incident,
  onClose,
  onConfirm,
  loading,
}: {
  incident: SecurityIncident;
  onClose: () => void;
  onConfirm: (confirmText: string, reason: string) => void;
  loading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const valid = confirmText === "CONFIRMO A LIBERAÇÃO" && reason.trim().length >= 20;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 540,
          width: "100%",
          border: "1px solid var(--border)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Liberar envio do workspace
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
          Workspace: <strong>{incident.workspace_name}</strong>
          <br />
          Tentativas anteriores: <strong>{incident.tamper_count}</strong>
          <br />
          Você confirma que revisou o log e está liberando sob sua responsabilidade.
        </p>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
          Digite exatamente: <code>CONFIRMO A LIBERAÇÃO</code>
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid var(--border)",
            borderRadius: 6,
            marginBottom: 12,
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
          Motivo da liberação (mín. 20 caracteres)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid var(--border)",
            borderRadius: 6,
            marginBottom: 16,
            background: "var(--background)",
            color: "var(--foreground)",
            fontFamily: "inherit",
          }}
        />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, background: "transparent", color: "var(--foreground)", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(confirmText, reason)}
            disabled={!valid || loading}
            style={{
              padding: "8px 16px",
              background: valid ? "#22c55e" : "var(--muted)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: valid ? "pointer" : "not-allowed",
              opacity: valid ? 1 : 0.5,
            }}
          >
            {loading ? "Liberando…" : "Confirmar liberação"}
          </button>
        </div>
      </div>
    </div>
  );
}
