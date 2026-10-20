import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lerEstadoCentralDark } from "@/lib/cockpit.functions";
import { Card } from "@/components/ui/card";
import { RefreshCcw, Pause, Activity, GitBranch, Database } from "lucide-react";

const FORJA_MODES = [
  { id: "sync", label: "🔄 Sincronizar", icon: "🔄", desc: "Casa ↔ Forja ↔ GitHub" },
  { id: "deploy", label: "🚀 Deploy VPS", icon: "🚀", desc: "Push para VPS remota" },
  { id: "monitor", label: "📊 Monitorar", icon: "📊", desc: "Status em tempo real" },
] as const;

const SETORES_FORJA = [
  { id: "hermes", label: "Hermes", emoji: "⚙️", path: "K:\\apps\\modulos\\hermes-config" },
  { id: "skills", label: "Skills", emoji: "🛠️", path: "K:\\apps\\modulos\\skills-registry" },
  { id: "modulos", label: "Módulos", emoji: "📦", path: "K:\\apps\\modulos\\modulos-inventory" },
  { id: "casa", label: "Casa", emoji: "🏠", path: "K:\\apps\\instinto-superior\\src" },
] as const;

/**
 * Inventário medido na Casa em 2026-10-15. Checkbox verde = prova identificada
 * naquela leitura, NUNCA heartbeat live nem permissão para escrever no vault.
 * Próximas fases só viram PASS depois de evidência real e readback.
 */
const OBSIDIAN_CRITERIOS = [
  {
    id: "O01",
    titulo: "Aplicativo instalado e protocolo obsidian:// presente",
    prova: "Casa: Obsidian.exe + processo + protocolo registrados",
    comprovado: true,
  },
  {
    id: "O02",
    titulo: "Vault BRAIN identificado sem mover ou duplicar notas",
    prova: "Obsidian config: K:/docs/BRAIN existente",
    comprovado: true,
  },
  {
    id: "O03",
    titulo: "Plugin Grafo Vivo reaproveitado em módulos",
    prova: "apps/modulos/obsidian-plugin-grafo-vivo + plugin no vault",
    comprovado: true,
  },
  {
    id: "O04",
    titulo: "Script de sincronização já inventariado",
    prova: "scripts/casa/sync-hermes-obsidian.ps1 existe; execução ainda não testada",
    comprovado: true,
  },
  {
    id: "O05",
    titulo: "Botão nativo abre o BRAIN na Casa",
    prova: "Pendente: clique real na interface e abertura do vault",
    comprovado: false,
  },
  {
    id: "O06",
    titulo: "Sincronização com hash, conflito e readback",
    prova: "Pendente: status/sync seguro e receipt atual",
    comprovado: false,
  },
  {
    id: "O07",
    titulo: "Memória acessível no HUB autenticado",
    prova: "Pendente: consulta real por owner, com privacidade",
    comprovado: false,
  },
  {
    id: "O08",
    titulo: "Checklist reage a recibos atuais, não a snapshots",
    prova: "Pendente: conectar critérios ao intent-cycle/receipts já existentes",
    comprovado: false,
  },
  {
    id: "O09",
    titulo: "Provar isolamento de notas privadas",
    prova: "Pendente: teste de autorização, negação e ausência de vazamento",
    comprovado: false,
  },
  {
    id: "O10",
    titulo: "Comprovar UI, build e runtime no SHA correto",
    prova: "Pendente: navegação real, build aplicável, PR/HEAD e smoke test",
    comprovado: false,
  },
] as const;

export function ForjaExecutor() {
  // Owner ja existente do sensor do Cockpit; heartbeat da API nao prova execucao.
  const consultarEstado = useServerFn(lerEstadoCentralDark);
  const leitura = useQuery({
    queryKey: ["centraldark", "forja-executor", "native-health"],
    queryFn: () => consultarEstado(),
    refetchInterval: 15_000,
    staleTime: 15_000,
    retry: false,
  });
  const leituraFresca = leitura.dataUpdatedAt > 0
    && Date.now() - leitura.dataUpdatedAt <= 45_000
    && !leitura.isError;
  const apiEstado = leituraFresca ? (leitura.data?.apiHealth ?? "UNKNOWN") : "UNKNOWN";
  const apiDisponivel = apiEstado === "PASS";
  const ultimaLeitura = leituraFresca
    ? new Date(leitura.dataUpdatedAt).toLocaleTimeString("pt-BR")
    : "NÃO MEDIDO";

  const [selectedMode, setSelectedMode] = useState<"sync" | "deploy" | "monitor">("sync");
  const [selectedSetor, setSelectedSetor] = useState("all");
  const [modoHarness, setModoHarness] = useState<"individual" | "paralelo">("individual");
  const [perguntaHarness, setPerguntaHarness] = useState("");
  const [harnesses, setHarnesses] = useState(["deepseek"]);
  const [avisoHarness, setAvisoHarness] = useState<string | null>(null);
  const ambienteLocal =
    typeof window !== "undefined" && ["127.0.0.1", "localhost"].includes(window.location.hostname);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔧</span>
          <div>
            <h1 className="text-2xl font-bold">FORJA EXECUTOR — PowerShell 7</h1>
            <p className="text-sm text-muted-foreground">
              Orquestrador paralelo em background • Casa ↔ Forja ↔ GitHub ↔ VPS
            </p>
          </div>
        </div>
      </div>

      {/* Medição da API nativa; a execução de comandos permanece UNKNOWN sem ACK. */}
      <Card className="p-6 border-border/60">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">MCP CentralDark · API</div>
            <div className={`text-lg font-bold ${apiDisponivel ? "text-green-600" : "text-muted-foreground"}`}>
              {apiDisponivel ? "🟢 API ACESSÍVEL" : apiEstado === "FAIL" ? "🔴 API FALHOU" : "🟡 NÃO COMPROVADA"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Última leitura da API</div>
            <div className="text-lg font-mono">{ultimaLeitura}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Executor Casa / VPS</div>
            <div className="text-lg font-bold text-muted-foreground">UNKNOWN · sem ACK</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Modo solicitado</div>
            <div className="text-lg font-semibold text-orange-600">{selectedMode.toUpperCase()}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Fonte: lerEstadoCentralDark /health, leitura atualizada no Cockpit.
          HTTP acessível não prova sessão SSH, PID remoto, Hermes ou sincronização.
        </p>
      </Card>

      {/* Sem endpoint autorizado para pausa/restart de processo neste componente. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button type="button" onClick={() => void leitura.refetch()}
          disabled={leitura.isFetching}
          className="rounded-lg border border-border/60 bg-muted/20 p-4 font-semibold disabled:opacity-50">
          <RefreshCcw className="mr-2 inline h-4 w-4" />
          {leitura.isFetching ? "Medindo API…" : "Atualizar leitura nativa"}
        </button>
        <button type="button" disabled
          title="Requer comando autenticado no executor nativo e recibo de confirmação"
          className="rounded-lg border border-border/60 bg-muted/20 p-4 font-semibold opacity-50">
          <Pause className="mr-2 inline h-4 w-4" />
          Pausar / reiniciar · não ligado
        </button>
        <a href="https://api.centralldark.com/admin" target="_blank" rel="noopener noreferrer"
          className="rounded-lg border border-border/60 bg-muted/20 p-4 text-center font-semibold">
          <Activity className="mr-2 inline h-4 w-4" />
          Abrir auditoria MCP existente
        </a>
      </div>

      {/* Seleção de Modo */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">🎯 Modo de Execução</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FORJA_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id as typeof selectedMode)}
              className={`rounded-lg border p-4 text-left transition ${
                selectedMode === m.id
                  ? "bg-blue-50/40 border-blue-500/50 shadow-sm"
                  : "bg-background/40 border-border/60 hover:bg-background/60"
              }`}
            >
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="font-semibold text-sm">{m.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Seleção de Setores */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">📍 Setores da Forja</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SETORES_FORJA.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSetor(s.id)}
              className={`rounded-lg border p-4 text-center transition ${
                selectedSetor === s.id
                  ? "bg-green-50/40 border-green-500/50"
                  : "bg-background/40 border-border/60 hover:bg-background/60"
              }`}
            >
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="font-semibold text-sm">{s.label}</div>
            </button>
          ))}
          <button
            onClick={() => setSelectedSetor("all")}
            className={`rounded-lg border p-4 text-center transition ${
              selectedSetor === "all"
                ? "bg-purple-50/40 border-purple-500/50"
                : "bg-background/40 border-border/60 hover:bg-background/60"
            }`}
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold text-sm">Todos</div>
          </button>
        </div>
      </Card>

      {/* CentralDark HUB: mesmos owners; catálogo+intenção, não inventa dispatcher funcional. */}
      <Card className="border border-border p-6" aria-label="Hub de Harnesses">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">🪬 Hub de Harnesses · Forja</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Um GOAL, vários motores. Cada produto mantém processo, porta e identidade próprios; o
              despacho real pertence ao HUB/MCP já existente.
            </p>
          </div>
          <span className="rounded border border-amber-500/40 px-3 py-1 text-xs text-amber-500">
            UI conectada · FAN-OUT NÃO PROVADO
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              id: "deepseek",
              title: "🧠 DeepSeek Harness",
              detail: "Original MIT em apps/modulos/deepseek-harness · Web UI :3080",
            },
            {
              id: "hermes",
              title: "⚙️ Hermes",
              detail: "Gateway original; execução pela rota e política existentes",
            },
            {
              id: "claude",
              title: "🤖 Claude Code",
              detail: "CLI original; integração requer adapter autorizado",
            },
          ].map((h) => (
            <label key={h.id} className="rounded-lg border border-border/70 p-3 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={harnesses.includes(h.id)}
                  onChange={(e) =>
                    setHarnesses((v) =>
                      e.target.checked ? [...v, h.id] : v.filter((id) => id !== h.id),
                    )
                  }
                  aria-label={`Selecionar ${h.title}`}
                />
                <strong>{h.title}</strong>
              </span>
              <p className="mt-2 text-xs text-muted-foreground">{h.detail}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Integração de mensagens: UNKNOWN
              </p>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">Modo de consulta:</span>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="forja-harness-mode"
              checked={modoHarness === "individual"}
              onChange={() => setModoHarness("individual")}
            />{" "}
            Individual
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="forja-harness-mode"
              checked={modoHarness === "paralelo"}
              onChange={() => setModoHarness("paralelo")}
            />{" "}
            Paralelo
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold" htmlFor="centraldark-harness-goal">
          GOAL / pergunta comum
        </label>
        <textarea
          id="centraldark-harness-goal"
          value={perguntaHarness}
          onChange={(e) => setPerguntaHarness(e.target.value)}
          rows={3}
          className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Descreva o objetivo; o HUB manterá respostas separadas por motor quando os adapters estiverem conectados."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm"
            onClick={() => {
              const request = {
                schema: "centraldark.hub-harness.draft.v1",
                status: "DRAFT_NOT_DISPATCHED",
                mode: modoHarness,
                targets: harnesses,
                goal: perguntaHarness,
                requires_authorized_hub_adapter: true,
              };
              void navigator.clipboard
                .writeText(JSON.stringify(request, null, 2))
                .then(() => setAvisoHarness("GOAL copiado; não foi despachado."))
                .catch(() => setAvisoHarness("Não foi possível copiar. Nenhum envio realizado."));
            }}
            disabled={!harnesses.length || !perguntaHarness.trim()}
          >
            📋 Copiar GOAL do HUB
          </button>
          {ambienteLocal ? (
            <a
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              href="http://127.0.0.1:3080/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ Abrir DeepSeek :3080
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              DeepSeek local exige sessão na Casa; nunca encaminhar localhost de cliente remoto.
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            O produto só responde quando o serviço :3080 e seu provedor estiverem configurados.
          </span>
        </div>
        {avisoHarness ? (
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            {avisoHarness}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          O modo paralelo prepara a intenção; não envia comandos simultâneos sem adapters e
          aprovações. Respostas não são misturadas: cada executor deve gerar seu receipt e evidência
          próprios. Incorporação iframe permanece desligada até acesso autenticado e proteção
          anti-clickjacking.
        </p>
      </Card>

      {/* Obsidian já existe no projeto e na Casa: acoplar, NÃO clonar binário proprietário. */}
      <Card className="border border-border p-6" aria-label="Obsidian e Memória Persistente">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">💎 Obsidian · Memória Persistente da Forja</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Vault BRAIN já existente na Casa. Notas Markdown + plugin CentralDark Grafo Vivo
              complementam os bancos de dados e receipts; não substituem o banco transacional.
            </p>
          </div>
          <span className="rounded border border-amber-500/40 px-3 py-1 text-xs text-amber-500">
            SNAPSHOT CASA · NÃO É STATUS AO VIVO
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {ambienteLocal ? (
            <a
              href="obsidian://open?vault=BRAIN"
              className="inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted"
            >
              💎 Abrir Obsidian · BRAIN
            </a>
          ) : (
            <span className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground">
              Abrir no computador da Casa; link nativo indisponível em cliente remoto.
            </span>
          )}
          <a
            href="https://github.com/ServerVpss/CentralDark/tree/main/apps/modulos/obsidian-plugin-grafo-vivo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm hover:bg-muted"
          >
            🕸️ Ver módulo Grafo Vivo
          </a>
          <span className="text-xs text-muted-foreground">
            Obsidian usa seu aplicativo nativo, sem segunda instalação e sem serviço público.
          </span>
        </div>
        <div className="mt-5 rounded-lg border border-border bg-background/40 p-4">
          <h3 className="font-semibold text-sm">☑️ Critérios da integração · prova por etapa</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Verde = leitura comprovada em 15/10/2026 (pode envelhecer). Cinza = pendente. As caixas
            são somente leitura; marcar sem teste não vira PASS.
          </p>
          <div className="mt-3 space-y-2">
            {OBSIDIAN_CRITERIOS.map((criterio) => (
              <label
                key={criterio.id}
                className="flex items-start gap-3 rounded-md border border-border/60 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-green-600"
                  readOnly
                  checked={criterio.comprovado}
                  aria-label={criterio.titulo}
                />
                <span className="flex-1">
                  <span
                    className={
                      criterio.comprovado
                        ? "font-semibold text-green-600"
                        : "font-semibold text-muted-foreground"
                    }
                  >
                    {criterio.id} · {criterio.titulo}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{criterio.prova}</span>
                </span>
                <span
                  className={
                    criterio.comprovado
                      ? "text-xs font-semibold text-green-600"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {criterio.comprovado ? "✓ PROVADO" : "○ PENDENTE"}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Cada atualização futura deve carregar evidência/receipt real do mesmo owner e do GOAL na
            PR #1832. Nunca exportar notas privadas, tokens ou o vault inteiro para a main.
          </p>
        </div>
      </Card>

      {/* Status de Sincronização */}
      <Card className="p-6 border-green-500/30">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5" />
          <h2 className="font-semibold text-lg">🔀 Fluxo de Sincronização</h2>
        </div>
        <div className="font-mono text-sm text-muted-foreground space-y-2 bg-muted/20 p-4 rounded">
          <div>Casa (instinto-superior)</div>
          <div className="text-center text-green-600 font-bold">↓↓↓</div>
          <div>Forja (modulos) — PS7 Job Background</div>
          <div className="text-center text-green-600 font-bold">↓↓↓</div>
          <div>GitHub (Fonte da Verdade)</div>
          <div className="text-center text-green-600 font-bold">↓↓↓</div>
          <div>VPS (/root/CentralDark) — PM2 Microsserviços</div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <strong>Contrato de prova:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Casa, GitHub e VPS exigem readbacks independentes por SHA e horário.</li>
            <li>Acesso Tailscale ou resposta HTTP não equivale a execução remota autenticada.</li>
            <li>Hermes só passa a PASS com tarefa, ACK, saída e receipt correlacionados.</li>
            <li>Deploy requer gate aprovado e prova no runtime; MERGED não implica DEPLOYED.</li>
            <li>Desktop Commander é fallback opcional, não pré-requisito do MCP CentralDark.</li>
          </ul>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-6">
        <p>🪬 CentralDark MCP · controle nativo em evolução · execução requer ACK e receipt</p>
        <p>Casa ↔ Forja ↔ GitHub ↔ VPS: sincronização e FIXED_POINT ainda não comprovados neste painel.</p>
      </div>
    </div>
  );
}
