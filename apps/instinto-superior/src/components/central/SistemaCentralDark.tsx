import { useState } from "react";
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

import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
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
          ] satisfies Array<[string, LucideIcon, string]>
        ).map(([titulo, Icone, tipo]) => (
          <article key={String(titulo)} className="panel p-4">
            <Icone className="size-4 text-muted-foreground" />
            <p className="mt-3 text-xs text-muted-foreground">{String(titulo)}</p>
            <p className="mt-1 font-mono text-lg">
              {tipo === "sucesso"
                ? "UNKNOWN"
                : estado?.mcpEventosNiveis?.[tipo as keyof NonNullable<EstadoCentralDark["mcpEventosNiveis"]>] ?? "UNKNOWN"}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        Eventos do MCP oficial · {estado?.mcpEventosEstado ?? "UNKNOWN"} ·
        amostra limitada aos 15 minutos mais recentes ·
        sucesso não é inferido de level=info · {estado?.mcpEventosFonte ?? "SEM FONTE"}
      </p>
      {estado?.mcpEventosRecentes?.length ? (
        <div className="mt-3 rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Eventos setoriais recentes (sanitizados)</p>
          <ol className="mt-2 divide-y divide-border">
            {estado.mcpEventosRecentes.map((ev, index) => (
              <li key={index} className="py-2 font-mono text-[11px]">
                {ev.at ?? "SEM HORARIO"} · {ev.sector ?? "UNKNOWN"}/
                {ev.service ?? "UNKNOWN"} · {ev.level} · {ev.kind ?? "UNKNOWN"}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

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
          detalhe="MCP, Gateway, Serve, A2A e webhook exigem fontes próprias. Saúde do Live Fabric não comprova esses serviços."
          estado="UNKNOWN"
        />
        <ItemCofre
          titulo="Eventos oficiais MCP"
          detalhe={
            estado?.mcpEventosContagem == null
              ? `Fonte oficial: ${estado?.mcpEventosFonte ?? "UNKNOWN"} · ${estado?.mcpEventosEstado ?? "UNKNOWN"}`
              : `${estado.mcpEventosContagem} evento(s) observados na amostra de 15 minutos; não é histórico integral nem porcentagem de sucesso.`
          }
          estado={estado?.mcpEventosEstado === "OBSERVED" ? "PASS" : "UNKNOWN"}
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
