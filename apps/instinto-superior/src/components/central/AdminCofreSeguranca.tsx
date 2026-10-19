import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Boxes,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ClipboardCopy,
  LockKeyhole,
  Database,
  Server,
  Cloud,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";
import { useNotificationsLog } from "@/hooks/useNotificationsLog";
import { useTelegramBotsResumo } from "@/hooks/useTelegramBotsResumo";

export const SEM_FONTE = "Sem fonte operacional autorizada nesta superfície.";

export function RotuloEstado({ estado }: { estado: EstadoOperacional }) {
  return (
    <span className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">
      {estado}
    </span>
  );
}

export function ItemCofre({
  titulo,
  detalhe,
  estado = "UNKNOWN",
}: {
  titulo: string;
  detalhe: string;
  estado?: EstadoOperacional;
}) {
  return (
    <article className="panel flex min-h-32 flex-col justify-between gap-4 p-5">
      <div>
        <h4 className="font-semibold">{titulo}</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detalhe}</p>
      </div>
      <RotuloEstado estado={estado} />
    </article>
  );
}


type ProvedorInfra = "supabase" | "contabo" | "cloudflare";
type MetricaInfra = { titulo: string; valor: string; detalhe: string };

function ProvedoresInfraSeguranca({ estado }: { estado: EstadoCentralDark | undefined }) {
  const [provedor, setProvedor] = useState<ProvedorInfra>("supabase");
  const medidoEm = estado?.atualizadoEm ? Date.parse(estado.atualizadoEm) : NaN;
  const fresco = Number.isFinite(medidoEm) && Date.now() - medidoEm >= 0 && Date.now() - medidoEm < 60_000;
  const valorVivo = (v: string | undefined) => fresco && v ? v : "UNKNOWN";

  const botoes: { id: ProvedorInfra; nome: string; icone: typeof Database }[] = [
    { id: "supabase", nome: "Supabase", icone: Database },
    { id: "contabo", nome: "Contabo", icone: Server },
    { id: "cloudflare", nome: "Cloudflare", icone: Cloud },
  ];
  const metricas: Record<ProvedorInfra, MetricaInfra[]> = {
    supabase: [
      { titulo: "API Gateway", valor: "—", detalhe: "Requisições: fonte de telemetria ainda não conectada" },
      { titulo: "Postgres", valor: "—", detalhe: "Erros e requisições do banco: sem medição" },
      { titulo: "Edge Functions", valor: "—", detalhe: "Execuções e erros: sem medição" },
      { titulo: "Avisos do Advisor", valor: "—", detalhe: "Consulta de segurança não conectada a este Cockpit" },
    ],
    contabo: [
      { titulo: "API CentralDark", valor: valorVivo(estado?.apiHealth), detalhe: "Medição do estado existente do Cockpit" },
      { titulo: "Deploy VPS", valor: valorVivo(estado?.deploy), detalhe: "Estado do deploy; não equivale à saúde integral da VPS" },
      { titulo: "Omni Router", valor: valorVivo(estado?.omniRouter), detalhe: "Medição do roteador existente" },
      { titulo: "CPU / RAM / Disco", valor: "—", detalhe: "Telemetria Contabo ainda não conectada" },
    ],
    cloudflare: [
      { titulo: "DNS / Zonas", valor: "—", detalhe: "Consulta de zonas ainda não conectada" },
      { titulo: "Requisições", valor: "—", detalhe: "Série temporal indisponível" },
      { titulo: "Erros HTTP", valor: "—", detalhe: "Série temporal indisponível" },
      { titulo: "Proteção / WAF", valor: "—", detalhe: "Métricas de segurança indisponíveis" },
    ],
  };
  const nome = botoes.find((b) => b.id === provedor)?.nome ?? "Supabase";
  const indicador = provedor === "contabo" && fresco ? "Estado medido no Cockpit" : "Sem telemetria ao vivo";

  return (
    <section aria-labelledby="infra-provedores-titulo" className="mt-8 rounded-[28px] border border-white/15 bg-[#090909] p-4 text-white sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h4 id="infra-provedores-titulo" className="flex items-center gap-3 text-xl font-semibold sm:text-3xl">
          <span aria-hidden="true">🪬</span> CentralDark — Infraestrutura
        </h4>
        <span className="rounded-full bg-[#242424] px-4 py-2 text-xs text-white/75 sm:text-sm">
          Painel operacional
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4" role="group" aria-label="Selecionar provedor de infraestrutura">
        {botoes.map(({ id, nome: rotulo, icone: Icone }) => (
          <button
            type="button"
            key={id}
            aria-pressed={provedor === id}
            onClick={() => setProvedor(id)}
            className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border p-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-36 sm:text-xl ${
              provedor === id ? "border-white/35 bg-[#232323]" : "border-white/15 bg-[#1c1c1c] hover:bg-[#292929]"
            }`}
          >
            <Icone aria-hidden="true" className="size-6 sm:size-8" strokeWidth={1.8} />
            <span>{rotulo}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-3xl bg-[#191919] p-4 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h5 className="text-xl font-semibold sm:text-2xl">{nome} — CentralDark</h5>
          <span className="rounded-full bg-[#282828] px-3 py-1.5 text-xs text-white/75">
            {indicador}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {metricas[provedor].map((m) => (
            <article key={m.titulo} className="min-h-32 rounded-2xl bg-[#242424] p-4 sm:p-5">
              <h6 className="text-sm font-normal text-white/70 sm:text-base">{m.titulo}</h6>
              <div className="mt-2 break-words font-mono text-2xl font-semibold tabular-nums sm:text-3xl">{m.valor}</div>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{m.detalhe}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-white/65">
          {provedor === "contabo" && fresco && estado?.atualizadoEm
            ? `Última leitura do estado CentralDark: ${new Date(estado.atualizadoEm).toLocaleString("pt-BR")}. Não é a API de métricas da Contabo.`
            : "Dados deste provedor ainda não têm fonte de telemetria autorizada no Cockpit. Não são valores zerados."}
        </p>
        <div className="mt-5 rounded-2xl bg-[#242424] p-4 sm:p-5">
          <h6 className="text-lg font-semibold sm:text-xl">Segurança — {provedor === "supabase" ? "Advisor" : "Monitoramento"}</h6>
          <div className="mt-4 flex items-start gap-3 text-sm text-white/85">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <p>
              {provedor === "supabase"
                ? "Há alertas conhecidos no Supabase, mas a quantidade atual não está sendo consultada nesta tela."
                : "Dados de segurança do provedor ainda não conectados; estado UNKNOWN."}
            </p>
          </div>
          <p className="mt-3 text-sm text-white/60">Exibir gravidade, objeto afetado, horário da leitura e referência de correção somente após resposta da fonte real.</p>
          {provedor === "supabase" ? (
            <a href="https://supabase.com/dashboard/project/lyoigsqluyktoclwdaft/advisors/security" target="_blank" rel="noopener noreferrer"
               className="mt-4 inline-flex items-center gap-2 text-sm text-white underline underline-offset-4 hover:text-white/80">
              Abrir Advisor no Supabase <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function HubSeguranca({ estado }: { estado: EstadoCentralDark | undefined }) {
  return (
    <section aria-labelledby="hub-seguranca-titulo">
      <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
        Proteção e fronteiras
      </p>
      <h3 id="hub-seguranca-titulo" className="mt-3 text-3xl font-semibold">
        Hub Segurança
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Visão central dos controles de acesso, fontes e superfícies críticas. Este espaço não
        concede permissões nem expõe credenciais.
      </p>
      <ProvedoresInfraSeguranca estado={estado} />
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BlocoEstado
          titulo="Acesso administrativo"
          estado="PASS"
          codigo="Papel verificado no servidor"
          detalhe="A Sala de Controle permanece fechada para contas sem papel administrativo."
          icone={<ShieldCheck className="size-5" />}
        />
        <BlocoEstado
          titulo="GitHub oficial"
          estado={(estado?.github ?? "UNKNOWN") as EstadoOperacional}
          codigo={estado?.sha?.slice(0, 12) ?? "UNKNOWN"}
          detalhe={estado?.fonte ?? SEM_FONTE}
          icone={<KeyRound className="size-5" />}
        />
        <BlocoEstado
          titulo="Grafo vivo"
          estado={(estado?.grafoVivo ?? "UNKNOWN") as EstadoOperacional}
          codigo={estado?.grafoHttp ? `HTTP ${estado.grafoHttp}` : "Sem resposta medida"}
          detalhe="A topologia só é aceita quando a fonte viva responde ao contrato."
          icone={<Boxes className="size-5" />}
        />
        <BlocoEstado
          titulo="Gmail"
          estado={(estado?.gmail ?? "AUTH_REQUIRED") as EstadoOperacional}
          codigo="Consentimento humano"
          detalhe="A falta dessa autorização não rebaixa a segurança das demais áreas."
          icone={<ShieldAlert className="size-5" />}
        />
      </div>
      <PreparadorPermissoesForja />
    </section>
  );
}


type CredencialMetadata = { id?: string; name: string; kind?: string; description?: string | null; updated_at?: string | null };

// Fonte existente: Supabase Edge Function "vault". Nunca requisitar "get" nem renderizar valores.
function CredenciaisCofre() {
  const [items, setItems] = useState<CredencialMetadata[]>([]);
  const [status, setStatus] = useState("Carregando metadados do cofre...");
  const [nome, setNome] = useState("CENTRALDARK_GITHUB_DISPATCH_TOKEN");
  const [valor, setValor] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function carregar() {
    setStatus("Consultando cofre autorizado...");
    try {
      const { data, error } = await supabase.functions.invoke("vault", { body: { action: "list" } });
      if (error || !Array.isArray(data?.items)) throw new Error("VAULT_UNAVAILABLE");
      setItems(data.items);
      setLoaded(true);
      setStatus(`${data.items.length} credencial(is) catalogada(s); valores sempre ocultos.`);
    } catch {
      setLoaded(false);
      setItems([]);
      setStatus("AUTH_REQUIRED / UNKNOWN — cofre Supabase não comprovado nesta sessão.");
    }
  }
  useEffect(() => { void carregar(); }, []);

  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loaded || !nome.trim() || !valor) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("vault", {
        body: { action: "put", name: nome.trim(), kind: "token", value: valor },
      });
      if (error || data?.ok !== true) throw new Error("VAULT_WRITE_FAILED");
      setValor("");
      setStatus("Credencial enviada ao cofre criptografado. Uso pelo executor ainda exige integração e prova.");
      await carregar();
    } catch {
      setStatus("Gravação não confirmada. Não copie o token para Git, logs ou chat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <article className="panel space-y-3 p-5">
        <h4 className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-5" /> Cofre de credenciais</h4>
        <p className="text-sm text-muted-foreground">Nomes e tipos das credenciais existentes no Vault Supabase. Valores nunca são exibidos ou copiados. Cofre Obsidian é separado.</p>
        <p role="status" className="text-xs text-muted-foreground">{status}</p>
        <button type="button" className="rounded border border-border px-3 py-2 text-sm" onClick={() => void carregar()}>Atualizar lista</button>
        {loaded && (items.length === 0
          ? <p className="text-sm">Nenhuma credencial cadastrada nesta fonte.</p>
          : <ul className="grid gap-2 md:grid-cols-2">{items.map((item) =>
              <li key={item.id ?? item.name} className="rounded-lg border border-border p-3">
                <div className="break-all font-mono text-sm">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.kind ?? "generic"} · ••••••••••••</div>
              </li>
            )}</ul>
        )}
      </article>
      <form className="panel space-y-3 p-5" onSubmit={(event) => void salvar(event)}>
        <h4 className="font-semibold">Adicionar ou atualizar credencial</h4>
        <label className="block text-sm" htmlFor="cofre-secret-name">Nome da credencial</label>
        <input id="cofre-secret-name" autoComplete="off" spellCheck={false} className="w-full rounded border border-border bg-background p-2 font-mono text-sm" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <label className="block text-sm" htmlFor="cofre-secret-value">Valor secreto</label>
        <input id="cofre-secret-value" type="password" autoComplete="new-password" spellCheck={false} className="w-full rounded border border-border bg-background p-2 text-sm" value={valor} onChange={(e) => setValor(e.target.value)} required />
        <button type="submit" disabled={!loaded || busy || !valor.trim()} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">{busy ? "Salvando..." : "Salvar no Cofre"}</button>
        <p className="text-xs text-muted-foreground">Somente admin. O token não vai para GitHub nem para recibos. Salvar não configura automaticamente a variável do serviço VPS.</p>
      </form>
      <p className="text-xs text-muted-foreground">Fonte adicional VPS (/etc, secrets): inventário ainda não integrado; não afirmar que esta lista representa todos os segredos do servidor.</p>
    </div>
  );
}

export function CofreAdministrativo({ estado }: { estado: EstadoCentralDark | undefined }) {
  const notificacoes = useNotificationsLog("24h");
  const bots = useTelegramBotsResumo();
  const botsAtivos = bots.bots.filter((b) => b.is_active).length;
  return (
    <section aria-labelledby="cofre-titulo">
      <p className="font-mono text-[10px] tracking-[0.2em] text-gold uppercase">Acesso restrito</p>
      <h3 id="cofre-titulo" className="mt-3 text-3xl font-semibold">
        Cofre (ADM)
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Centro do dono para enxergar bots, rotas, contas, módulos e instaladores. Ações sem owner
        conectado permanecem fechadas.
      </p>

      <Tabs defaultValue="visao" className="mt-7">
        <div className="overflow-x-auto border-b border-border pb-3">
          <TabsList className="h-auto min-w-max justify-start">
            <TabsTrigger value="visao">Visão</TabsTrigger>
            <TabsTrigger value="bots">Bots</TabsTrigger>
            <TabsTrigger value="rotas">Rotas</TabsTrigger>
            <TabsTrigger value="contas">Contas</TabsTrigger>
            <TabsTrigger value="credenciais">Credenciais</TabsTrigger>
            <TabsTrigger value="infra">Infra</TabsTrigger>
            <TabsTrigger value="modulos">Módulos</TabsTrigger>
            <TabsTrigger value="instalador">Instalador</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visao" className="mt-6 grid gap-4 md:grid-cols-3">
          <ItemCofre
            titulo="Notificações 24h"
            detalhe={
              notificacoes.stats
                ? `${notificacoes.stats.total} evento(s) · ${notificacoes.stats.sucessoPct}% sem erro/crítico`
                : SEM_FONTE
            }
            estado={notificacoes.stats ? "PASS" : "AUTH_REQUIRED"}
          />
          <ItemCofre
            titulo="Bots ativos"
            detalhe={
              bots.erro
                ? `Sem acesso: ${bots.erro}`
                : `${botsAtivos} ativo(s) de ${bots.bots.length} cadastrado(s)`
            }
            estado={bots.erro ? "AUTH_REQUIRED" : "PASS"}
          />
          <ItemCofre
            titulo="Última medição"
            detalhe={
              estado?.atualizadoEm
                ? new Date(estado.atualizadoEm).toLocaleString("pt-BR")
                : SEM_FONTE
            }
            estado="UNKNOWN"
          />
        </TabsContent>
        <TabsContent value="bots" className="mt-6 grid gap-4 md:grid-cols-2">
          {bots.erro ? (
            <ItemCofre
              titulo="Bots cadastrados"
              detalhe={`Sem acesso: ${bots.erro}`}
              estado="AUTH_REQUIRED"
            />
          ) : bots.bots.length === 0 ? (
            <ItemCofre titulo="Bots cadastrados" detalhe="Nenhum bot cadastrado." />
          ) : (
            bots.bots.map((b) => (
              <ItemCofre
                key={b.id}
                titulo={b.name}
                detalhe={`@${b.bot_username ?? "sem username"} · ${b.health_status ?? "saúde não medida"}`}
                estado={b.is_active ? "PASS" : "BLOCKED"}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="rotas" className="mt-6 grid gap-4 md:grid-cols-2">
          <ItemCofre
            titulo="Roteador oficial"
            detalhe="A medição usa o owner já existente; nenhuma segunda camada foi criada."
            estado={(estado?.omniRouter ?? "UNKNOWN") as EstadoOperacional}
          />
          <ItemCofre titulo="Entrega de alertas" detalhe={SEM_FONTE} />
        </TabsContent>
        <TabsContent value="credenciais" className="mt-6"><CredenciaisCofre /></TabsContent>
        <TabsContent value="contas" className="mt-6 grid gap-4 md:grid-cols-2">
          <ItemCofre
            titulo="Conta administrativa"
            detalhe="Acesso atual validado pelo papel administrativo no servidor; dados pessoais não são exibidos."
            estado="PASS"
          />
          <ItemCofre titulo="Contas de serviço" detalhe={SEM_FONTE} estado="AUTH_REQUIRED" />
        </TabsContent>
        <TabsContent value="infra" className="mt-6 grid gap-4 md:grid-cols-3">
          <ItemCofre
            titulo="Live Fabric"
            detalhe={estado?.liveFabricFonte ?? SEM_FONTE}
            estado={(estado?.liveFabric ?? "UNKNOWN") as EstadoOperacional}
          />
          <ItemCofre
            titulo="Roteador"
            detalhe="Leitura do owner oficial, sem criar outro roteador."
            estado={(estado?.omniRouter ?? "UNKNOWN") as EstadoOperacional}
          />
          <ItemCofre
            titulo="Provedores"
            detalhe="Nenhum plano de controle de provedores está conectado nesta superfície."
            estado="AUTH_REQUIRED"
          />
        </TabsContent>
        <TabsContent value="modulos" className="mt-6 grid gap-4 md:grid-cols-3">
          <ItemCofre
            titulo="Cockpit CentralDark"
            detalhe="Owner ativo desta superfície administrativa."
            estado="PASS"
          />
          <ItemCofre
            titulo="TelePainel"
            detalhe="Fora desta medição; nenhuma saúde operacional foi inferida."
            estado="UNKNOWN"
          />
          <ItemCofre
            titulo="Financeiro e CRM"
            detalhe="Fora do escopo desta missão; nenhum estado foi inferido."
          />
        </TabsContent>
        <TabsContent value="instalador" className="mt-6">
          <ItemCofre
            titulo="Instaladores e pacotes"
            detalhe="Os downloads existentes permanecem no Download Center. Execução física exige prova própria antes de liberar comandos administrativos."
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}

/** Prévia segura integrada ao Admin. O HUB PDP/PEP segue sendo a autoridade:
 * esta interface apenas copia um pedido escopado, nunca instala allowlist ou grant.
 * Intentão: reduzir microaprovações sem inventar autorização de outro executor.
 */
const CAPACIDADES_FORJA = [
  {
    id: "repo_read",
    titulo: "Ler código e diagnosticar",
    tier: 1,
    descricao: "Ler arquivos e estado Git apenas no repositório escolhido.",
  },
  {
    id: "local_test",
    titulo: "Executar testes do projeto",
    tier: 2,
    descricao: "Build e testes no checkout autorizado, sem deploy implícito.",
  },
  {
    id: "scoped_edit",
    titulo: "Editar owner existente",
    tier: 2,
    descricao: "Mudanças reversíveis no owner definido, com diff e readback.",
  },
  {
    id: "remote_command",
    titulo: "Comando remoto na VPS",
    tier: 3,
    descricao: "Exige identidade e comando exatos; nunca libera shell irrestrito.",
  },
  {
    id: "sensitive_change",
    titulo: "Segredos, contas ou alteração destrutiva",
    tier: 4,
    descricao: "Permanece sob aprovação humana específica, sem autorização permanente.",
  },
] as const;

function PreparadorPermissoesForja() {
  const [executor, setExecutor] = useState("Hermes");
  const [capacidade, setCapacidade] = useState<string>("repo_read");
  const [ambiente, setAmbiente] = useState("Casa · K:/CentralDark");
  const [validade, setValidade] = useState("session");
  const [feedback, setFeedback] = useState<string | null>(null);
  const selecionada = CAPACIDADES_FORJA.find((c) => c.id === capacidade) ?? CAPACIDADES_FORJA[0];
  const sensivel = selecionada.tier >= 3;
  const duracaoEfetiva = sensivel ? "single_action_requires_approval" : validade;

  async function copiarSolicitacao() {
    // Pedido local estruturado: copiar texto não altera políticas nem bypass nativo.
    const pedido = {
      schema: "centraldark.permission-request.draft.v1",
      status: "REQUEST_ONLY_NOT_APPROVED",
      executor_id: executor,
      capability: selecionada.id,
      owner_scope: ambiente,
      duration: duracaoEfetiva,
      tier: selecionada.tier,
      requires_native_executor_verification: true,
      requires_pdp_pep_decision: true,
      native_allowlist_applied: false,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(pedido, null, 2));
      setFeedback("Solicitação copiada. Nenhuma permissão foi concedida.");
    } catch {
      setFeedback("Clipboard indisponível. Nenhuma permissão foi alterada.");
    }
  }

  return (
    <div
      className="mt-7 rounded-xl border border-border bg-card/60 p-5"
      data-testid="forja-permissoes"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
            🪬 Forja / Governança de agentes
          </p>
          <h4 className="mt-2 text-xl font-semibold">Permissões da Forja</h4>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Defina um pedido por executor, capacidade, ambiente e validade. A autorização verdadeira
            pertence ao HUB e ao executor nativo.
          </p>
        </div>
        <span className="rounded-md border border-amber-500/40 px-3 py-1 font-mono text-xs text-amber-500">
          DRAFT · NÃO APLICADO
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span>Executor</span>
          <select
            aria-label="Executor"
            className="h-10 rounded-md border border-border bg-background px-3"
            value={executor}
            onChange={(e) => setExecutor(e.target.value)}
          >
            <option>Hermes</option>
            <option>Claude Code</option>
            <option>Codex</option>
            <option>VS Code / Harness</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>Capacidade</span>
          <select
            aria-label="Capacidade"
            className="h-10 rounded-md border border-border bg-background px-3"
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
          >
            {CAPACIDADES_FORJA.map((item) => (
              <option key={item.id} value={item.id}>
                {item.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>Ambiente / owner</span>
          <select
            aria-label="Ambiente"
            className="h-10 rounded-md border border-border bg-background px-3"
            value={ambiente}
            onChange={(e) => setAmbiente(e.target.value)}
          >
            <option>Casa · K:/CentralDark</option>
            <option>VPS · /root/CentralDark</option>
            <option>GitHub · ServerVpss/CentralDark</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>Validade da autorização solicitada</span>
          <select
            aria-label="Validade"
            className="h-10 rounded-md border border-border bg-background px-3"
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            disabled={sensivel}
          >
            <option value="once">Somente esta ação</option>
            <option value="session">Durante esta sessão</option>
            <option value="24h">24 horas</option>
            <option value="persistent">Persistente e revogável</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-col gap-2 rounded-lg border border-border bg-background/70 p-4 text-sm">
        <div className="flex items-center gap-2">
          {sensivel ? (
            <LockKeyhole className="size-4 text-amber-500" />
          ) : (
            <ShieldCheck className="size-4 text-neon-blue" />
          )}
          <strong>
            {sensivel ? "REQUIRE_APPROVAL · pedido individual" : "CANDIDATE · política escopada"}
          </strong>
        </div>
        <p className="text-muted-foreground">{selecionada.descricao}</p>
        <p className="text-xs text-muted-foreground">
          Fonte de autoridade: HUB policies / PDP / PEP · Permissão no Claude/Hermes: NÃO VERIFICADA
          · Auditoria real: UNKNOWN.
        </p>
        <p className="text-xs text-muted-foreground">
          OAuth interativo, segredos, comandos destrutivos e regras nativas de terceiros não são
          liberados por esta tela.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copiarSolicitacao()}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
        >
          <ClipboardCopy className="size-4" /> Copiar pedido de regra
        </button>
        <span className="text-xs text-muted-foreground">
          Solicitar não é autorizar · ALLOW não é execução provada.
        </span>
      </div>
      {feedback ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
