import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CloudCog,
  Download,
  Filter,
  Info,
  ListChecks,
  Radio,
  Rocket,
  Route,
  Server,
  Siren,
  XCircle,
} from "lucide-react";

import { BlocoEstado, SeloEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { useNotificationsLog, type NotifyTipo } from "@/hooks/useNotificationsLog";
import { useTelegramBotsResumo } from "@/hooks/useTelegramBotsResumo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";
import { ItemCofre, RotuloEstado, SEM_FONTE } from "@/components/central/AdminCofreSeguranca";
import { RuntimeSistema } from "@/components/central/RuntimeSistema";
import { InfraestruturaSistema } from "@/components/central/InfraestruturaSistema";

type SistemaCentralDarkProps = {
  estado: EstadoCentralDark | undefined;
  atualizando: boolean;
  atualizar: () => void;
};

function MegaPainel({ estado, atualizando, atualizar }: SistemaCentralDarkProps) {
  const origem: EstadoOperacional = estado?.github ?? "UNKNOWN";
  const [periodo, setPeriodo] = useState<"1h" | "24h" | "7d">("24h");
  const commits = estado?.commits ?? [];
  const horas = periodo === "1h" ? 1 : periodo === "7d" ? 168 : 24;
  const limite = Date.now() - horas * 60 * 60 * 1000;
  const eventos = commits.filter((commit) => {
    const data = Date.parse(commit.data);
    return Number.isFinite(data) && data >= limite;
  });
  const notificacoes = useNotificationsLog(periodo);

  return (
    <section aria-labelledby="mega-painel-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-green uppercase">
            Feed unificado
          </p>
          <h3 id="mega-painel-titulo" className="mt-3 text-3xl font-semibold">
            Mega Painel
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Eventos comprováveis da CentralDark reunidos por origem. Ausência de evento não vira
            sucesso automático.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={atualizar} disabled={atualizando}>
          <Activity className={atualizando ? "animate-spin" : ""} />
          {atualizando ? "Medindo…" : "Atualizar"}
        </Button>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <BlocoEstado
          titulo="Eventos do repositório"
          estado={origem}
          codigo={commits.length ? `${commits.length} eventos recentes` : "Sem eventos medidos"}
          detalhe={estado?.fonte ?? SEM_FONTE}
          icone={<Radio className="size-5" />}
        />
        <BlocoEstado
          titulo="Live Fabric"
          estado={(estado?.liveFabric ?? "UNKNOWN") as EstadoOperacional}
          codigo={estado?.liveFabricHttp ? `HTTP ${estado.liveFabricHttp}` : "Sem resposta medida"}
          detalhe={estado?.liveFabricFonte ?? SEM_FONTE}
          icone={<CloudCog className="size-5" />}
        />
        <BlocoEstado
          titulo="Roteador de capacidades"
          estado={(estado?.omniRouter ?? "UNKNOWN") as EstadoOperacional}
          codigo={estado?.omniHttp ? `HTTP ${estado.omniHttp}` : "Sem resposta medida"}
          detalhe="Estado do roteador oficial, sem inferência por documentação."
          icone={<Route className="size-5" />}
        />
      </div>

      <div className="mt-6 grid gap-3 border-y border-border py-4 sm:grid-cols-[1fr_13rem_13rem] sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4 text-neon-blue" />
          Filtros da atividade medida
        </div>
        <Select value={periodo} onValueChange={(valor) => setPeriodo(valor as "1h" | "24h" | "7d")}>
          <SelectTrigger aria-label="Período do Mega Painel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Última hora</SelectItem>
            <SelectItem value="24h">Últimas 24 horas</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
          </SelectContent>
        </Select>
        <Select value="github" disabled>
          <SelectTrigger aria-label="Origem do Mega Painel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="github">GitHub oficial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(
          [
            ["Informações", Info, "info"],
            ["Sucessos", CheckCircle2, "sucesso"],
            ["Avisos", AlertTriangle, "aviso"],
            ["Erros", XCircle, "erro"],
            ["Críticos", Siren, "critico"],
          ] satisfies Array<[string, LucideIcon, NotifyTipo]>
        ).map(([titulo, Icone, tipo]) => (
          <article key={String(titulo)} className="panel p-4">
            <Icone className="size-4 text-muted-foreground" />
            <p className="mt-3 text-xs text-muted-foreground">{String(titulo)}</p>
            <p className="mt-1 font-mono text-lg">
              {notificacoes.stats ? notificacoes.stats.porTipo[tipo] : "UNKNOWN"}
            </p>
          </article>
        ))}
      </div>
      {notificacoes.erro && (
        <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          Notificações: {notificacoes.erro}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-md border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold">Logs no Instinto Superior · fonte existente</h4>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              notifications_log · Supabase com RLS admin · atualizações em tempo real · não equivale ao funil MCP completo
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void notificacoes.refresh()} disabled={notificacoes.loading}>
            <Activity className={notificacoes.loading ? "animate-spin" : ""} /> Conferir logs
          </Button>
        </div>
        {notificacoes.erro ? (
          <p className="px-4 py-4 text-sm text-destructive">LOGS: BLOCKED · {notificacoes.erro}</p>
        ) : notificacoes.loading && !notificacoes.items.length ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">Consultando a fonte de logs autorizada…</p>
        ) : notificacoes.items.length ? (
          <ol aria-label="Eventos da CentralDark" className="max-h-[32rem] divide-y divide-border overflow-y-auto">
            {notificacoes.items.map((evento) => (
              <li key={evento.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[8.5rem_6rem_1fr]">
                <time className="font-mono text-[10px] text-muted-foreground">
                  {Number.isFinite(Date.parse(evento.created_at))
                    ? new Date(evento.created_at).toLocaleString("pt-BR")
                    : "Horário UNKNOWN"}
                </time>
                <span className="font-mono text-[10px] uppercase text-gold">{evento.tipo}</span>
                <div className="min-w-0 break-words text-xs">
                  <span className="font-semibold">{evento.titulo}</span>
                  <span className="ml-2 text-muted-foreground">[{evento.origem}] {evento.mensagem}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            Nenhum evento retornado no período. Vazio não é prova de saúde.
          </p>
        )}
        <p className="border-t border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
          MCP log-funnel → API protegida: consumidor E2E ainda pendente de autenticação/receipt; não publicar logs brutos.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-border">
        <div className="border-b border-border bg-muted/40 px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          Atividade recente comprovada
        </div>
        {eventos.length ? (
          <ol className="divide-y divide-border">
            {eventos.map((commit) => (
              <li
                key={commit.sha}
                className="grid gap-2 px-4 py-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center"
              >
                <code className="text-xs text-neon-blue">{commit.sha.slice(0, 12)}</code>
                <span className="text-sm">{commit.mensagem}</span>
                <time className="font-mono text-[10px] text-muted-foreground">
                  {commit.data ? new Date(commit.data).toLocaleString("pt-BR") : "Horário UNKNOWN"}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma atividade foi medida nesta leitura.
          </p>
        )}
      </div>
    </section>
  );
}

// Microdeploy consulta apenas o HUD vivo; executar continua no owner scripts/micro_deploy.sh.
// Ausência de leitura autenticada de runners, worktrees e rollback mantém o cadeado fechado.
function MicroDeployReadiness({ estado, atualizando, atualizar }: SistemaCentralDarkProps) {
  const [agora, definirAgora] = useState<number | null>(null);
  useEffect(() => {
    const atualizarRelogio = () => definirAgora(Date.now());
    atualizarRelogio();
    const id = setInterval(atualizarRelogio, 15_000);
    return () => clearInterval(id);
  }, []);

  const medidoEm = estado?.atualizadoEm ? Date.parse(estado.atualizadoEm) : Number.NaN;
  const idadeMs = agora !== null && Number.isFinite(medidoEm) ? agora - medidoEm : null;
  const fresco = idadeMs !== null && idadeMs >= -5_000 && idadeMs <= 90_000;
  const medido = fresco ? estado : undefined;
  const main = medido?.mainSha ?? null;
  const vps = medido?.vpsSha ?? null;
  const comparacao: EstadoOperacional =
    !main || !vps ? "UNKNOWN" : main === vps ? "PASS" : "FAIL";
  const gateAutorizacao: EstadoOperacional = "BLOCKED";
  const gateTestes: EstadoOperacional = "UNKNOWN";
  const gateRollback: EstadoOperacional = "UNKNOWN";
  const deployAllowed = false; // Sem adapter autorizado, teste do mesmo SHA e rollback provado.
  const etapas = [
    ["MEDIR", main ? "GitHub consultado; Casa, worktrees e runners exigem leitura própria." : "GitHub/HEAD ou medição atual indisponível."],
    ["COMPARAR", !main || !vps ? "Falta SHA para comparar." : main === vps ? "SHA GitHub e VPS coincidem; deploy ainda não provado." : "SHA GitHub e VPS diferem."],
    ["APLICAR DELTA", "Bloqueado: owner e autorização operacional ainda não comprovados."],
    ["TESTAR", "Aguardar testes obrigatórios do mesmo SHA."],
    ["CONTRAPROVA", "Aguardar health, efeito no runtime e receipt causal."],
    ["SELAR", "Somente após readback com horário, origem e SHA."],
  ] as const;

  return (
    <section aria-labelledby="microdeploy-readiness" className="panel mt-6 p-5" data-owner="microdeploy-canonico">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-neon-blue">
            Forja · Microdeploy por evidência
          </p>
          <h4 id="microdeploy-readiness" className="mt-2 font-semibold">
            Medir → Comparar → Aplicar delta → Testar → Contraprova → Selar
          </h4>
          <p className="mt-2 text-xs text-muted-foreground">
            Visão de leitura do owner existente. Não executa deploy, não altera worktree e não lê segredos.
          </p>
        </div>
        <SeloEstado estado={deployAllowed ? "PASS" : "BLOCKED"} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <BlocoEstado
          titulo="GitHub / main"
          estado={medido?.github ?? "UNKNOWN"}
          codigo={main?.slice(0, 12) ?? "UNKNOWN"}
          detalhe="SHA observado na consulta do Cockpit."
          icone={<Server className="size-5" />}
        />
        <BlocoEstado
          titulo="GitHub ↔ VPS"
          estado={comparacao}
          codigo={vps?.slice(0, 12) ?? "UNKNOWN"}
          detalhe="Compara código, não comprova deploy ou health."
          icone={<CloudCog className="size-5" />}
        />
        <BlocoEstado
          titulo="Serviço /health"
          estado={medido?.apiHealth ?? "UNKNOWN"}
          codigo={medido?.apiHealthHttp ? `HTTP ${medido.apiHealthHttp}` : "UNKNOWN"}
          detalhe="Saúde da API medida; não é prova de todos os componentes."
          icone={<Activity className="size-5" />}
        />
        <BlocoEstado
          titulo="Índice de recibos"
          estado={medido?.receipts ?? "UNKNOWN"}
          codigo={medido?.receiptsHttp ? `HTTP ${medido.receiptsHttp}` : "UNKNOWN"}
          detalhe="Endpoint acessível não comprova receipt do mesmo SHA."
          icone={<ListChecks className="size-5" />}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {([
          ["Autorização operacional", gateAutorizacao, "Acesso a medições não autoriza mutação."],
          ["Worktrees e runners", "UNKNOWN", "Casa/VPS sem sonda autenticada deste owner."],
          ["Testes do mesmo SHA", gateTestes, "Não inferir por GitHub ou por badge."],
          ["Rollback pronto", gateRollback, "Receita existente, readiness não medida."],
        ] as const).map(([nome, estadoGate, descricao]) => (
          <div key={nome} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium">{nome}</span>
              <SeloEstado estado={estadoGate} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{descricao}</p>
          </div>
        ))}
      </div>
      <ol className="mt-4 grid gap-2 md:grid-cols-2" aria-label="Etapas obrigatórias do microdeploy">
        {etapas.map(([nome, descricao]) => (
          <li key={nome} className="rounded-lg border border-border/70 px-3 py-2">
            <span className="font-mono text-xs font-semibold">{nome}</span>
            <p className="mt-1 text-xs text-muted-foreground">{descricao}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>
          Medição: {fresco && estado?.atualizadoEm
            ? new Date(estado.atualizadoEm).toLocaleString("pt-BR")
            : "STALE/UNKNOWN · manter último recibo histórico"}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={atualizar} disabled={atualizando}>
          {atualizando ? "Medindo…" : "Remedir sinais"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Script canônico: scripts/micro_deploy.sh. DEPLOY_ALLOWED=false até
        AUTHORIZED ∧ OWNER_VERIFIED ∧ TESTS_PASS ∧ ROLLBACK_READY;
        dados da Casa e disco C: são UNKNOWN nesta superfície.
      </p>
    </section>
  );
}

function CentralStatus({ estado, atualizando, atualizar }: SistemaCentralDarkProps) {
  const medidoEm = estado?.atualizadoEm
    ? new Date(estado.atualizadoEm).toLocaleString("pt-BR")
    : "UNKNOWN";
  const notificacoes = useNotificationsLog("24h");

  return (
    <section aria-labelledby="status-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-purple uppercase">
            Observabilidade
          </p>
          <h3 id="status-titulo" className="mt-3 text-3xl font-semibold">
            Central de Status
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Saúde do código, serviços e publicação tratadas como estados separados.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={atualizar} disabled={atualizando}>
          <Activity className={atualizando ? "animate-spin" : ""} />
          {atualizando ? "Medindo…" : "Remedir agora"}
        </Button>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BlocoEstado
          titulo="Código oficial"
          estado={(estado?.github ?? "UNKNOWN") as EstadoOperacional}
          codigo={estado?.mainSha?.slice(0, 12) ?? "UNKNOWN"}
          detalhe="Leitura independente do estado do servidor publicado."
          icone={<Server className="size-5" />}
        />
        <BlocoEstado
          titulo="Publicação"
          estado={(estado?.deploy ?? "UNKNOWN") as EstadoOperacional}
          codigo={estado?.vpsSha?.slice(0, 12) ?? "UNKNOWN"}
          detalhe={
            estado?.deltaVps == null
              ? "Delta não medido."
              : `${estado.deltaVps} commit(s) de diferença.`
          }
          icone={<CloudCog className="size-5" />}
        />
        <BlocoEstado
          titulo="Build"
          estado={(estado?.build ?? "UNKNOWN") as EstadoOperacional}
          codigo="Sem fonte viva conectada"
          detalhe="Build não recebe PASS por existir um commit."
          icone={<Activity className="size-5" />}
        />
        <BlocoEstado
          titulo="Desktop"
          estado={(estado?.desktop ?? "UNKNOWN") as EstadoOperacional}
          codigo="Execução física separada"
          detalhe="A ponte local exige contraprova própria."
          icone={<Download className="size-5" />}
        />
      </div>
      <MicroDeployReadiness estado={estado} atualizando={atualizando} atualizar={atualizar} />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ItemCofre
          titulo="MCP e serviços"
          detalhe="MCP, Gateway, Serve, A2A e webhook exigem fontes próprias. Saúde do Live Fabric não comprova esses serviços."
          estado="UNKNOWN"
        />
        <ItemCofre
          titulo="Feed de notificações"
          detalhe={
            notificacoes.stats
              ? `${notificacoes.stats.total} evento(s) nas últimas 24h · ${notificacoes.stats.sucessoPct}% sem erro/crítico.`
              : "Ponte de leitura do TelePainel não configurada nesta superfície."
          }
          estado={notificacoes.stats ? "PASS" : "AUTH_REQUIRED"}
        />
        <article className="panel p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 size-5 text-neon-purple" />
            <div>
              <h4 className="font-semibold">Roteiro e pendências</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A fonte oficial permanece no repositório. Esta tela não converte texto planejado em
                execução concluída.
              </p>
            </div>
          </div>
        </article>
        <article className="panel p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <Rocket className="mt-0.5 size-5 text-gold" />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold">Histórico de publicação</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Sem fonte autorizada para as últimas execuções. O SHA publicado permanece separado
                do SHA do código.
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="font-mono text-xs">
                  {estado?.vpsSha?.slice(0, 12) ?? "UNKNOWN"}
                </span>
                <RotuloEstado estado={(estado?.deploy ?? "UNKNOWN") as EstadoOperacional} />
              </div>
            </div>
          </div>
        </article>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
        <span>Fonte: {estado?.fonte ?? SEM_FONTE}</span>
        <span className="font-mono">MEDIDO EM {medidoEm}</span>
      </div>
    </section>
  );
}

export function SistemaCentralDark({ estado, atualizando, atualizar }: SistemaCentralDarkProps) {
  return (
    <Tabs defaultValue="mega-painel">
      <div className="overflow-x-auto border-b border-border pb-3">
        <TabsList className="h-auto min-w-max justify-start">
          <TabsTrigger value="mega-painel">
            <Radio /> Mega Painel
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity /> Status
          </TabsTrigger>
          <TabsTrigger value="runtime">
            <Route /> Runtime / Capabilities
          </TabsTrigger>
          <TabsTrigger value="infra">
            <Server /> Infraestrutura
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="mega-painel" className="mt-7">
        <MegaPainel estado={estado} atualizando={atualizando} atualizar={atualizar} />
      </TabsContent>
      <TabsContent value="status" className="mt-7">
        <CentralStatus estado={estado} atualizando={atualizando} atualizar={atualizar} />
      </TabsContent>
      <TabsContent value="runtime" className="mt-7">
        <RuntimeSistema estado={estado} />
      </TabsContent>
      <TabsContent value="infra" className="mt-7">
        <InfraestruturaSistema />
      </TabsContent>
    </Tabs>
  );
}
