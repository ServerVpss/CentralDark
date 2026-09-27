import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CloudCog,
  Download,
  Filter,
  Info,
  KeyRound,
  ListChecks,
  Radio,
  Rocket,
  Route,
  Server,
  ShieldAlert,
  ShieldCheck,
  Siren,
  XCircle,
} from "lucide-react";

import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
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

type SistemaCentralDarkProps = {
  estado: EstadoCentralDark | undefined;
  atualizando: boolean;
  atualizar: () => void;
};

const SEM_FONTE = "Sem fonte operacional autorizada nesta superfície.";

function RotuloEstado({ estado }: { estado: EstadoOperacional }) {
  return (
    <span className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">
      {estado}
    </span>
  );
}

function ItemCofre({
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

function MegaPainel({ estado, atualizando, atualizar }: SistemaCentralDarkProps) {
  const origem: EstadoOperacional = estado?.github ?? "UNKNOWN";
  const [periodo, setPeriodo] = useState("24h");
  const commits = estado?.commits ?? [];
  const horas = periodo === "1h" ? 1 : periodo === "7d" ? 168 : 24;
  const limite = Date.now() - horas * 60 * 60 * 1000;
  const eventos = commits.filter((commit) => {
    const data = Date.parse(commit.data);
    return Number.isFinite(data) && data >= limite;
  });

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
        <Select value={periodo} onValueChange={setPeriodo}>
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
          ["Informações", Info],
          ["Sucessos", CheckCircle2],
          ["Avisos", AlertTriangle],
          ["Erros", XCircle],
          ["Críticos", Siren],
          ] satisfies Array<[string, LucideIcon]>
        ).map(([titulo, Icone]) => (
          <article key={String(titulo)} className="panel p-4">
            <Icone className="size-4 text-muted-foreground" />
            <p className="mt-3 text-xs text-muted-foreground">{String(titulo)}</p>
            <p className="mt-1 font-mono text-lg">UNKNOWN</p>
          </article>
        ))}
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

function HubSeguranca({ estado }: { estado: EstadoCentralDark | undefined }) {
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
    </section>
  );
}

function CofreAdministrativo({ estado }: { estado: EstadoCentralDark | undefined }) {
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
            <TabsTrigger value="infra">Infra</TabsTrigger>
            <TabsTrigger value="modulos">Módulos</TabsTrigger>
            <TabsTrigger value="instalador">Instalador</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visao" className="mt-6 grid gap-4 md:grid-cols-3">
          <ItemCofre
            titulo="Saúde operacional"
            detalhe="Resumo derivado somente das medições exibidas no HUD e na Central de Status."
            estado={(estado?.liveFabric ?? "UNKNOWN") as EstadoOperacional}
          />
          <ItemCofre
            titulo="Eventos críticos"
            detalhe="Nenhuma fonte de incidentes críticos foi autorizada para esta leitura."
          />
          <ItemCofre
            titulo="Última medição"
            detalhe={
              estado?.atualizadoEm
                ? new Date(estado.atualizadoEm).toLocaleString("pt-BR")
                : SEM_FONTE
            }
            estado={estado?.atualizadoEm ? "PASS" : "UNKNOWN"}
          />
        </TabsContent>
        <TabsContent value="bots" className="mt-6 grid gap-4 md:grid-cols-2">
          <ItemCofre titulo="Bots cadastrados" detalhe={SEM_FONTE} />
          <ItemCofre titulo="Rotas de notificação" detalhe={SEM_FONTE} />
        </TabsContent>
        <TabsContent value="rotas" className="mt-6 grid gap-4 md:grid-cols-2">
          <ItemCofre
            titulo="Roteador oficial"
            detalhe="A medição usa o owner já existente; nenhuma segunda camada foi criada."
            estado={(estado?.omniRouter ?? "UNKNOWN") as EstadoOperacional}
          />
          <ItemCofre titulo="Entrega de alertas" detalhe={SEM_FONTE} />
        </TabsContent>
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
            detalhe="Permanece separado e operacional durante a convergência."
            estado="RUNNING"
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

function CentralStatus({ estado, atualizando, atualizar }: SistemaCentralDarkProps) {
  const medidoEm = estado?.atualizadoEm
    ? new Date(estado.atualizadoEm).toLocaleString("pt-BR")
    : "UNKNOWN";

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
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ItemCofre
          titulo="MCP e serviços"
          detalhe="A saúde externa depende de medição viva; documentação isolada não conta como prova."
          estado={(estado?.liveFabric ?? "UNKNOWN") as EstadoOperacional}
        />
        <ItemCofre
          titulo="Feed de notificações"
          detalhe="A fonte de notificações do sistema antigo ainda não está ligada ao Cockpit CentralDark."
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
          <TabsTrigger value="hub-seguranca">
            <ShieldCheck /> Hub Segurança
          </TabsTrigger>
          <TabsTrigger value="cofre">
            <ShieldAlert /> Cofre (ADM)
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity /> Status
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="mega-painel" className="mt-7">
        <MegaPainel estado={estado} atualizando={atualizando} atualizar={atualizar} />
      </TabsContent>
      <TabsContent value="hub-seguranca" className="mt-7">
        <HubSeguranca estado={estado} />
      </TabsContent>
      <TabsContent value="cofre" className="mt-7">
        <CofreAdministrativo estado={estado} />
      </TabsContent>
      <TabsContent value="status" className="mt-7">
        <CentralStatus estado={estado} atualizando={atualizando} atualizar={atualizar} />
      </TabsContent>
    </Tabs>
  );
}
