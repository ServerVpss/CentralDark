import { ExternalLink, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

type HarnessModule = {
  id: string;
  label: string;
  owner: string;
  transport: string;
  status: "PROVEN" | "UNKNOWN";
  runtimeUrl?: string;
  evidence?: string;
  lastObserved?: "OFFLINE_2026_10_17";
};

const MODULES: HarnessModule[] = [
  { id: "deepseek", label: "DeepSeek", owner: "apps/modulos/deepseek-harness", transport: "owner existente", status: "PROVEN" },
  { id: "hermes", label: "Hermes", owner: "apps/modulos/HERMES-CORE", transport: "MCP/RDC", status: "PROVEN" },
  { id: "claude-code", label: "Claude Code", owner: "owner externo / VS Code", transport: "VS Code/SSH", status: "UNKNOWN" },
  { id: "chatgpt-cowork", label: "ChatGPT / Cowork", owner: "owner externo / Work", transport: "Work/browser", status: "UNKNOWN" },
  { id: "vscode", label: "VS Code", owner: "apps/modulos/HERMES-CORE/extensions/hermes-vscode-router-provider", transport: "VS Code Remote", status: "PROVEN" },
  { id: "figma", label: "Figma", owner: "Figma connector", transport: "MCP", status: "PROVEN" },
  { id: "obsidian", label: "Obsidian", owner: "apps/modulos/obsidian-plugin-grafo-vivo", transport: "Grafo Vivo", status: "UNKNOWN" },
  { id: "notifications-recipe", label: "Notificações e receitas", owner: "apps/instinto-superior/src/components/central/CentralNotificacoes.tsx", transport: "Supabase/RLS · comando ao abrir · broker pendente", status: "UNKNOWN" },
  { id: "voice-semantic", label: "Classificador de voz", owner: ".claude/skills/synced/voice-semantic-classifier/SKILL.md", transport: "Fala → intenção → agente autorizado", status: "UNKNOWN" },
  { id: "screenpipe-audio-casa", label: "Screenpipe · áudio da Casa", owner: ".agents/skills/screenpipe-live-observer/SKILL.md", transport: "Tailscale/Screenpipe · áudio degradado na última medição", status: "UNKNOWN" },
  { id: "casa-vps-ssh", label: "Casa → VPS · Tailscale SSH", owner: "scripts/remote-bridge/canonical/CENTRALDARK-VPS-UPDATE.ps1", transport: "100.90.199.124:22 · host key estrita · fallback público existente", status: "PROVEN", lastObserved: "OFFLINE_2026_10_17", evidence: "docs/receipts/SSH-CASA-VPS-LOCK-20261014.md" },
  { id: "vscode-restore", label: "CentralDark VS Code Restore 0.1.4", owner: "VS Code · Casa SEGREDO", transport: "Extensão instalada · prova em sessão histórica", status: "PROVEN", lastObserved: "OFFLINE_2026_10_17", evidence: "Captura de sessão Windows/VS Code fornecida pelo CHEFE em 17/10" },
  { id: "vscode-remote-ssh", label: "VS Code Remote-SSH 0.128.0", owner: "VS Code · Casa SEGREDO", transport: "Remote-SSH oficial · transporte Casa → VPS", status: "PROVEN", lastObserved: "OFFLINE_2026_10_17", evidence: "Captura de sessão Windows/VS Code fornecida pelo CHEFE em 17/10" },
];

export function HarnessModuleRegistry() {
  return (
    <section aria-labelledby="harness-module-registry" className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="harness-module-registry" className="font-semibold">🧩 Módulos do Harness</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            O cockpit orquestra; cada motor continua no seu owner e transporte.
            Verde representa prova documentada; sessão atual é uma camada separada.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">ONE_SYSTEM_ONLY</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {MODULES.map((modulo) => (
          <article key={modulo.id} className="rounded-md border border-border bg-muted/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm">{modulo.label}</strong>
              <span className={modulo.status === "PROVEN" ? "text-xs text-emerald-500" : "text-xs text-amber-500"}>
                {modulo.status === "PROVEN" ? "EVIDÊNCIA PROVADA" : "SEM PROVA DE RUNTIME"}
              </span>
            </div>
            <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">OWNER · {modulo.owner}</p>
            <p className="mt-1 text-xs text-muted-foreground">TRANSPORTE · {modulo.transport}</p>
            {modulo.evidence ? <p className="mt-1 break-all text-[10px] text-muted-foreground">RECIBO · {modulo.evidence}</p> : null}
            <p className="mt-1 text-[10px] text-muted-foreground">
              SESSÃO AO VIVO · NÃO MEDIDA NESTA TELA{modulo.lastObserved ? " · ÚLTIMA CONSULTA 17/10: CONECTOR OFFLINE" : ""}
            </p>
            {modulo.runtimeUrl ? (
              <Button asChild size="sm" variant="outline" className="mt-2">
                <a href={modulo.runtimeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 size-3" /> Abrir runtime
                </a>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="mt-2" disabled title="Rota de runtime ainda não comprovada">
                <CircleHelp className="mr-1 size-3" /> Runtime UNKNOWN
              </Button>
            )}
          </article>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Regra: intenção entra pela porta CentralDark; despacho só ocorre com owner, transporte,
        sessão e receipt comprovados. UNKNOWN não vira PASS.
      </p>
    </section>
  );
}
