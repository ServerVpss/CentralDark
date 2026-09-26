# CONTRATO - SecurityPausedBanner.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\clone-deck\apps\crm\src\components\workspace\SecurityPausedBanner.tsx
**SHA:** 80fd251bf1b47061
**Timestamp:** 2026-08-26T19:34:17.887441
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12,

### Ouro Bruto (primeiros 5000 chars)
```
// Banner exibido pro dono do workspace quando o envio WhatsApp está pausado por segurança.
// Não mostra botão de reativar — apenas instrui a contatar o suporte.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSecurityPauseStatus } from "@/lib/security-pause.functions";

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

export function SecurityPausedBanner({ workspaceId }: { workspaceId: string | null | undefined }) {
  const fn = useServerFn(getSecurityPauseStatus);
  const q = useQuery({
    queryKey: ["security-pause-status", workspaceId],
    enabled: !!workspaceId,
    queryFn: () => fn({ data: { workspaceId: workspaceId! } }),
    refetchInterval: 60_000,
  });

  if (!q.data?.paused) return null;

  return (
    <div
      role="alert"
      style={{
        padding: 16,
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid #ef4444",
        borderRadius: 8,
        marginBottom: 16,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 24 }}>🔒</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>
          Envios pausados por segurança
        </h3>
        <p style={{ fontSize: 13, color: "var(--foreground)", marginBottom: 8 }}>
          Uma tentativa de envio fora da janela de 24h foi detectada
          {q.data.paused_at ? ` em ${fmtBR(q.data.paused_at)}` : ""}. Por proteção da sua
          conta WhatsApp, o envio foi automaticamente pausado.
        </p>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Para reativar, entre em contato com o suporte. Esta ação não pode ser revertida
          pelo dono do workspace.
        </p>
      </div>
    </div>
  );
}

```