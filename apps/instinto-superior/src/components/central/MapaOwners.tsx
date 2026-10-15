import { useState } from "react";
import { SeloEstado } from "@/components/central/EstadoCentralDark";
import { MAPA_OWNERS, type DonoVisual, CRISTAL } from "@/data/painel-unico";
import { ChevronRight, Layers, CornerDownRight } from "lucide-react";

const ORDEM: DonoVisual[] = ["Admin", "Sistema", "Hermes", "Downloads", "Design"];
const DESTINOS: Record<DonoVisual, string> = {
  Admin: "admin",
  Sistema: "sistema",
  Hermes: "hermes",
  Downloads: "downloads",
  Design: "design",
};

// Snapshot de auditoria: fonte histórica C:\\CentralDark (12/10) e comparação SHA-256 Casa (15/10).
// Métrica descreve evidência; NÃO converte divergência em falha nem substitui status vivo.
const METRICAS_DIVERGENCIA = [
  {
    id: "sha",
    nome: "Arquivos com SHA-256 diferente",
    quantidade: 5,
    total: 5,
    fonte: "C:\\CentralDark × K:\\ · SHA-256 medido em 15/10/2026",
    pendencia: "Comparar comportamento e evolução sem restaurar versões antigas.",
  },
  {
    id: "rotas",
    nome: "Rotas sem PASS histórico completo",
    quantidade: 9,
    total: 13,
    fonte: "EVIDENCIAS/ROTAS-20261012.json · snapshot 12/10/2026",
    pendencia: "Revalidar cada rota no runtime atual antes de afirmar saúde.",
  },
].sort((a, b) => b.quantidade / b.total - a.quantidade / a.total);

const HASHES_SNAPSHOT = [
  { owner: "admin-guard.js", legado: "50874E1B233CB194", casa: "966CCD0D7BE8F316" },
  { owner: "mcp-admin.js", legado: "62EB7514732FDDA1", casa: "85AFC0642B74B776" },
  { owner: "admin-guard-core.test.mjs", legado: "EF75EE3564D321D6", casa: "9B63F2534CD73BF4" },
  {
    owner: "centraldark-inventory-reconcile.sh",
    legado: "B56706F65FD045AC",
    casa: "FAAA3337B0AE62E2",
  },
  { owner: "main-pulse-reconciler.sh", legado: "C932A1202EE7DD54", casa: "DAA0704FF31AF043" },
];

export function MapaOwners({
  onNavigate,
  autenticado = false,
}: {
  onNavigate?: (aba: string) => void;
  autenticado?: boolean;
}) {
  const [nivelDiagnostico, definirNivelDiagnostico] = useState<"resumo" | "detalhe" | "prova">(
    "resumo",
  );
  return (
    <div className="mt-8 space-y-6">
      {/* Arquitetura Mental */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <h4 className="font-semibold text-sm">🧠 Mapa Mental — Arquitetura Completa</h4>
        <div className="mt-3 space-y-2 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-foreground">👑 CHEFE</span>
            <ChevronRight className="h-4 w-4" />
            <span>INTENÇÃO</span>
          </div>
          <div className="ml-6 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4" />
            <span className="text-foreground">🪬 INSTINTO SUPERIOR</span>
            <span className="text-xs">(visual + shell)</span>
          </div>
          <div className="ml-12 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4" />
            <span className="text-foreground">7 Abas Distribuídas</span>
            <span className="text-xs">
              (Admin, Sistema, Hermes, Sync, Design, Downloads, Overview)
            </span>
          </div>
          <div className="ml-18 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4" />
            <span className="text-foreground">⚙️ HARNESS (ligação)</span>
            <span className="text-xs">→ modulos/</span>
          </div>
          <div className="ml-24 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4" />
            <span className="text-foreground">20 Módulos (motores)</span>
            <span className="text-xs">HUB, HERMES-CORE, MCP, status...</span>
          </div>
          <div className="ml-30 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4" />
            <span className="text-foreground">🏠 FORJA CASA (K:\)</span>
            <span className="text-xs">BUILD + TESTES</span>
          </div>
          <div className="ml-36 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4" />
            <span className="text-foreground">👑 APROVAÇÃO CHEFE</span>
            <span className="text-xs">→ VPS (produção)</span>
          </div>
        </div>
      </div>

      {/* Status de Consolidação */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <h4 className="font-semibold text-sm">📊 Status de Absorção Visual</h4>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-mono text-muted-foreground">Interfaces consolidadas:</span>
            <span className="ml-2 text-foreground">16 COPIED · WIRED não medido</span>
          </div>
          <div>
            <span className="font-mono text-muted-foreground">Módulos mapeados:</span>
            <span className="ml-2 text-foreground">20 MAPPED (inventário) · WIRED não medido</span>
          </div>
          <div>
            <span className="font-mono text-muted-foreground">Abas do Cockpit:</span>
            <span className="ml-2 text-foreground">7 destinos · UI_TESTED UNKNOWN</span>
          </div>
          <div>
            <span className="font-mono text-muted-foreground">Build local:</span>
            <span className="ml-2 text-foreground">UNKNOWN (sem receipt vinculado)</span>
          </div>
        </div>
      </div>

      {/* HUD existente: projeção fiel da contraprova, sem criar segundo motor. */}
      <section
        className="rounded-lg border border-border/60 bg-muted/20 p-4"
        aria-labelledby="hud-divergencias-titulo"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 id="hud-divergencias-titulo" className="font-semibold text-sm">
              🧿 Divergências · métricas auditáveis
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Snapshot fixado: pacote C:\\CentralDark (12/10) × Casa K:\\ (15/10). Não representa
              saúde em tempo real.
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label="Nível de detalhe das divergências"
          >
            {(["resumo", "detalhe", "prova"] as const).map((nivel) => (
              <button
                key={nivel}
                type="button"
                aria-pressed={nivelDiagnostico === nivel}
                onClick={() => definirNivelDiagnostico(nivel)}
                className={`rounded border px-2 py-1 text-xs capitalize ${nivelDiagnostico === nivel ? "border-foreground bg-muted font-semibold" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                {nivel === "prova" ? "Evidência" : nivel}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {METRICAS_DIVERGENCIA.map((metrica) => {
            const percentual = (metrica.quantidade / metrica.total) * 100;
            return (
              <div
                key={metrica.id}
                className="rounded-md border border-border/70 bg-background/40 p-3"
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium">{metrica.nome}</span>
                  <span className="shrink-0 font-mono tabular-nums">
                    {percentual.toFixed(1).replace(".", ",")}%{" "}
                    <span className="text-muted-foreground">
                      ({metrica.quantidade}/{metrica.total})
                    </span>
                  </span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="meter"
                  aria-label={metrica.nome}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentual}
                >
                  <div
                    className="h-full rounded-full bg-amber-500/70"
                    style={{ width: `${percentual}%` }}
                  />
                </div>
                {nivelDiagnostico !== "resumo" ? (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Fonte: {metrica.fonte}</p>
                    <p>Próximo delta: {metrica.pendencia}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <p>
            Rotas com PASS no registro de 12/10: 4/13 (30,8%). Isso NÃO significa que estejam online
            agora.
          </p>
          <p className="mt-1">
            Runtime MCP: UNKNOWN · Pulso legado: UNKNOWN · WIRED no cockpit: NÃO MEDIDO. Sem
            porcentagem inventada.
          </p>
        </div>
        {nivelDiagnostico === "prova" ? (
          <div
            className="mt-4 overflow-x-auto rounded-md border border-border"
            aria-label="Amostra de hashes auditados"
          >
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-2">Owner</th>
                  <th className="p-2">C:\\ (SHA prefixo)</th>
                  <th className="p-2">K:\\ (SHA prefixo)</th>
                  <th className="p-2">Interpretação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HASHES_SNAPSHOT.map((item) => (
                  <tr key={item.owner}>
                    <td className="p-2 font-mono">{item.owner}</td>
                    <td className="p-2 font-mono">{item.legado}</td>
                    <td className="p-2 font-mono">{item.casa}</td>
                    <td className="p-2">Diferente ≠ quebrado</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {/* Tabela de Capacidades (original) */}
      <div>
        <h4 className="font-semibold text-sm mb-2">📋 Mapa de Capacidades por Dono</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Capacidade → dono físico (K:\apps\modulos\) → dono visual (abas do Cockpit)
        </p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-muted/40 font-mono text-[10px] tracking-[0.15em] uppercase">
              <tr>
                <th className="px-3 py-2">Capacidade</th>
                <th className="px-3 py-2">Dono Físico</th>
                <th className="px-3 py-2">Visual</th>
                <th className="px-3 py-2">Estado cadastrado (não é prova de runtime)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ORDEM.flatMap((dono) => MAPA_OWNERS.filter((i) => i.visual === dono)).map((i) => (
                <tr key={i.capacidade} className="hover:bg-muted/30 transition">
                  <td className="px-3 py-2">
                    {i.capacidade}
                    <span className="block text-xs text-muted-foreground">{i.nota}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{i.fisico}</td>
                  <td className="px-3 py-2 text-xs">
                    <button
                      type="button"
                      className="rounded border border-border px-2 py-1 text-neon-blue hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !onNavigate ||
                        (!autenticado && (i.visual === "Admin" || i.visual === "Sistema"))
                      }
                      onClick={() => onNavigate?.(DESTINOS[i.visual])}
                      title={`Abrir ${i.visual} no cockpit`}
                    >
                      Abrir {i.visual} →
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <SeloEstado estado={i.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cristal de Capacidades */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" /> 💎 Cristal de Capacidades
        </h4>
        <p className="text-xs text-muted-foreground mt-2">Baseado em {CRISTAL.pasta}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-mono">Total de capacidades:</span>
            <span className="ml-2 text-foreground">{CRISTAL.capacidades.total}</span>
          </div>
          <div>
            <span className="font-mono">Existentes:</span>
            <span className="ml-2 text-green-600">{CRISTAL.capacidades.EXISTING}</span>
          </div>
          <div>
            <span className="font-mono">Parciais:</span>
            <span className="ml-2 text-yellow-600">{CRISTAL.capacidades.PARTIAL}</span>
          </div>
          <div>
            <span className="font-mono">Novos deltas:</span>
            <span className="ml-2 text-blue-600">{CRISTAL.capacidades.NEW_DELTA}</span>
          </div>
          <div>
            <span className="font-mono">Gaps:</span>
            <span className="ml-2 text-red-600">{CRISTAL.capacidades.GAP}</span>
          </div>
          <div>
            <span className="font-mono">Verificar ao vivo:</span>
            <span className="ml-2">{CRISTAL.capacidades.VERIFY_LIVE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
