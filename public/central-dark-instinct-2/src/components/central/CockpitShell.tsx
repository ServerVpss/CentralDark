import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PainelConsumo } from "@/components/central/PainelConsumo";
import { PainelAdminCentralDark } from "@/components/central/PainelAdminCentralDark";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Download,
  Github,
  Mail,
  PackageCheck,
  Radar,
  Server,
  ShieldCheck,
} from "lucide-react";

import { PainelHermes } from "@/components/central/HermesPet";
import { DesignCenter } from "@/components/central/DesignCenter";
import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { SyncCenter } from "@/components/central/SyncCenter";
import { SistemaCentralDark } from "@/components/central/SistemaCentralDark";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lerEstadoCentralDark } from "@/lib/cockpit.functions";
import pacoteHermes from "@/../public/downloads/Hermes-CentralDark-Pacotao.zip.asset.json";

function formatarTamanho(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export function CockpitShell({ autenticado = false }: { autenticado?: boolean }) {
  const lerEstado = useServerFn(lerEstadoCentralDark);
  const estado = useQuery({
    queryKey: ["centraldark", "estado-vivo"],
    queryFn: () => lerEstado(),
    refetchInterval: 60_000,
  });
  const dado = estado.data;
  const queryClient = useQueryClient();
  const navegar = useNavigate();
  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navegar({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-dvh pb-52">
      <header className="border-b border-border bg-surface/85 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="font-mono text-xs tracking-[0.2em] text-gold uppercase">
            CentralDark
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
              {autenticado ? "COCKPIT AUTENTICADO" : "ENTRADA DO COCKPIT"}
            </span>
            {!autenticado ? (
              <Button asChild size="sm">
                <Link to="/auth">Entrar</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={sair}>
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border px-4 py-20 sm:px-6">
        <div aria-hidden className="grid-mesh absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mono text-[10px] tracking-[0.22em] text-neon-blue uppercase">
            {autenticado ? "SALA DE CONTROLE" : "ACESSO OPERACIONAL"}
          </p>
          <h1 className="text-gold-gradient mt-4 max-w-4xl text-5xl font-semibold sm:text-7xl">
            Cockpit vivo
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Estado atual, conexões e Hermes reunidos numa única superfície, sem transformar
            histórico em prova.
          </p>
          {!autenticado ? (
            <Button asChild size="lg" className="mt-8">
              <Link to="/auth">Abrir cockpit</Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Radar className="size-5 text-neon-blue" />
            <h2 className="text-2xl font-semibold">HUD de estado</h2>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              ATUALIZAÇÃO 60S
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BlocoEstado
              titulo="Main oficial"
              estado={
                estado.isPending ? "RUNNING" : ((dado?.github ?? "UNKNOWN") as EstadoOperacional)
              }
              codigo={dado?.sha?.slice(0, 12) ?? "Aguardando medição"}
              detalhe="Medição via CentralDark; OAuth externo não bloqueia."
              icone={<Github className="size-5" />}
            />
            <BlocoEstado
              titulo="Build local"
              estado={(dado?.build ?? "UNKNOWN") as EstadoOperacional}
              codigo="Sem medição viva"
              detalhe="Sem fonte real de build com horário medido."
              icone={<Activity className="size-5" />}
            />
            <BlocoEstado
              titulo="Servidor publicado"
              estado={(dado?.deploy ?? "UNKNOWN") as EstadoOperacional}
              codigo={dado?.vpsSha?.slice(0, 12) ?? "UNKNOWN"}
              detalhe={
                dado?.deltaVps != null
                  ? `${dado.deltaVps} commit(s) atrás.`
                  : "Sem fonte viva do servidor."
              }
              icone={<Server className="size-5" />}
            />
            <BlocoEstado
              titulo="Gmail"
              estado={(dado?.gmail ?? "AUTH_REQUIRED") as EstadoOperacional}
              detalhe="Autorização humana pendente; o restante continua operando."
              icone={<Mail className="size-5" />}
            />
          </div>
          {autenticado ? (
            <div className="mt-10">
              <PainelConsumo />
            </div>
          ) : null}

          <Tabs defaultValue="visao" className="mt-14">
            <div className="sticky top-0 z-30 -mx-4 overflow-x-auto border-y border-border bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
              <TabsList className="h-auto min-w-max justify-start">
                <TabsTrigger value="visao">Visão geral</TabsTrigger>
                <TabsTrigger value="sync">Sync Center</TabsTrigger>
                <TabsTrigger value="design">Design Center</TabsTrigger>
                {autenticado ? (
                  <TabsTrigger value="admin">Admin CentralDark</TabsTrigger>
                ) : null}
                {autenticado ? (
                  <TabsTrigger value="sistema">Sistema CentralDark</TabsTrigger>
                ) : null}
                <TabsTrigger value="hermes">Hermes</TabsTrigger>
                <TabsTrigger value="downloads">Downloads</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="visao" className="mt-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <BlocoEstado
                  titulo="Writer material único"
                  estado="UNKNOWN"
                  codigo="agent/centraldark-cockpit-vivo"
                  detalhe="Declarado; sem lease medido ao vivo."
                  icone={<ShieldCheck className="size-5" />}
                />
                <BlocoEstado
                  titulo="Hermes Desktop"
                  estado={(dado?.desktop ?? "UNKNOWN") as EstadoOperacional}
                  detalhe="Ponte encontrada; execução física ainda exige prova própria."
                  icone={<Activity className="size-5" />}
                />
                <BlocoEstado
                  titulo="Pacote Hermes"
                  estado="UNKNOWN"
                  codigo={formatarTamanho(pacoteHermes.size)}
                  detalhe="Manifesto local encontrado; publicação e integridade do ZIP não foram remedidas."
                  icone={<PackageCheck className="size-5" />}
                />
              </div>
            </TabsContent>
            <TabsContent value="sync" className="mt-10">
              {dado ? <SyncCenter estado={dado} /> : <SyncCenter />}
            </TabsContent>
            <TabsContent value="design" className="mt-10">
              <DesignCenter />
            </TabsContent>
            {autenticado ? (
              <TabsContent value="admin" className="mt-10">
                <PainelAdminCentralDark />
              </TabsContent>
            ) : null}
            {autenticado ? (
              <TabsContent value="sistema" className="mt-10">
                <SistemaCentralDark
                  estado={dado}
                  atualizando={estado.isFetching}
                  atualizar={() => void estado.refetch()}
                />
              </TabsContent>
            ) : null}
            <TabsContent value="hermes" className="mt-10">
              <div className="mb-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Controle compartilhado
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Hermes ao vivo</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Pele, ação, quadro, direção e velocidade atuam no mesmo Hermes flutuante.
                </p>
              </div>
              <PainelHermes compacto />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                  A seleção ao vivo usa o mesmo catálogo incluído no pacote para Windows, com
                  instalação protegida por backup e rollback.
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href={pacoteHermes.url} download>
                    <Download />
                    Baixar para Windows
                  </a>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="downloads" className="mt-10">
              <section id="download-center" className="scroll-mt-24">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-purple uppercase">
                  Pacote único auditável
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Download Center</h2>
                <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                  <article className="panel p-6">
                    <Download className="size-6 text-neon-purple" />
                    <h3 className="mt-4 text-xl font-semibold">Hermes CentralDark para Windows</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      O manifesto referencia um ZIP com instalador, backup e rollback. A existência
                      e a integridade do arquivo precisam de medição própria.
                    </p>
                    <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Tamanho declarado</dt>
                        <dd className="mt-1 font-mono">{formatarTamanho(pacoteHermes.size)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Registrado em</dt>
                        <dd className="mt-1 font-mono">
                          {new Date(pacoteHermes.created_at).toLocaleString("pt-BR")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Formato declarado</dt>
                        <dd className="mt-1 font-mono">ZIP · PowerShell/BAT</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Conteúdo declarado</dt>
                        <dd className="mt-1 font-mono">16 ações · 256 quadros</dd>
                      </div>
                    </dl>
                    <p className="mt-5 break-all font-mono text-[10px] text-muted-foreground">
                      SHA-256 UNKNOWN · sem hash derivado do arquivo nesta medição
                    </p>
                    <Button asChild className="mt-6">
                      <a href={pacoteHermes.url} download>
                        <Download />
                        Tentar baixar ZIP
                      </a>
                    </Button>
                  </article>
                  <article className="panel p-6">
                    <ShieldCheck className="size-6 text-gold" />
                    <h3 className="mt-4 text-xl font-semibold">Proteção da instalação</h3>
                    <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <li>
                        <span className="text-foreground">1.</span> Detecta os dois destinos atuais.
                      </li>
                      <li>
                        <span className="text-foreground">2.</span> Move cada estado anterior para
                        backup.
                      </li>
                      <li>
                        <span className="text-foreground">3.</span> Instala o pacote canônico.
                      </li>
                      <li>
                        <span className="text-foreground">4.</span> <code>REVERTER-HERMES.bat</code>{" "}
                        restaura os backups.
                      </li>
                    </ol>
                    <div className="mt-6 border-t border-border pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">Integridade e execução física</span>
                        <span className="rounded-md border border-muted-foreground/40 bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                          UNKNOWN
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        Scripts e metadados existem; download, hash, backup, rollback e instalação
                        ainda não foram contraposados nesta superfície.
                      </p>
                    </div>
                  </article>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
