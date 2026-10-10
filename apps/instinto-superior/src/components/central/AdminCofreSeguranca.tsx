import { Boxes, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";

import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";
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

export function CofreAdministrativo({ estado }: { estado: EstadoCentralDark | undefined }) {
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
            <TabsTrigger value="infra">Infra</TabsTrigger>
            <TabsTrigger value="modulos">Módulos</TabsTrigger>
            <TabsTrigger value="instalador">Instalador</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visao" className="mt-6 grid gap-4 md:grid-cols-3">
          <ItemCofre
            titulo="Eventos oficiais CentralDark"
            detalhe={
              estado?.mcpEventosContagem == null
                ? `MCP: ${estado?.mcpEventosEstado ?? "UNKNOWN"} · sem amostra comprovada nesta leitura`
                : `${estado.mcpEventosContagem} evento(s) recentes na fonte MCP (15 min; amostra limitada)`
            }
            estado={estado?.mcpEventosEstado === "OBSERVED" ? "PASS" : "UNKNOWN"}
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
