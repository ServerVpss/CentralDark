import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageScaffold } from "@/components/page-scaffold";
import { Settings2, RefreshCw, Play, AlertCircle, CheckCircle2, Download, Package, Server, GitCommit, Tag, ExternalLink, ArrowRight, History, ShieldAlert, AlertTriangle, FileCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { useRealtimeInvalidate } from "@/lib/use-realtime-query";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  adminGetVersionSettings, adminUpdateVersionSettings, adminForceGlobalRefresh,
  adminListSystemJobs, adminToggleSystemJob, adminRunSystemJobNow,
} from "@/lib/system.functions";
import { listWorkspacesLite } from "@/lib/admin-monitor.functions";
import { resyncWorkspaceAvatars, resyncWorkspaceGroupAvatars } from "@/lib/contacts-avatar.functions";
import { Image as ImageIcon, Users, UsersRound } from "lucide-react";

import {
  getWuzapiUpdateStatus, checkWuzapiUpdate, triggerWuzapiUpdate,
} from "@/lib/wuzapi-update.functions";
import { adminDeployStatus } from "@/lib/admin-deploys.functions";
import { getWhatsappEngineInfo } from "@/lib/whatsmeow-info.functions";
import { analyzeWuzapiUpdate, listWuzapiUpdateChecks } from "@/lib/whatsapp-update-analysis.functions";
import {
  startCanaryRun, getActiveCanaryRun, setCanaryHealthCheck,
  refreshCanaryFromGateway, promoteCanary, abortCanary, listCanaryRuns,
  type CanaryRun,
} from "@/lib/wuzapi-canary.functions";
import {
  startProductionDeploy, runHealthCheck, triggerRollback,
  getActiveDeployment, listProductionDeploys, getDeployCooldown,
  type ProductionDeploy,
} from "@/lib/wuzapi-deploy-monitor.functions";
import { LoadingDots } from "@/components/ui/loading-dots";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Beaker, ShieldCheck, XCircle, CheckCheck, Activity, Undo2, Timer } from "lucide-react";
import { useEffect } from "react";


export const Route = createFileRoute("/admin/sistema/")({ component: Page });

function Page() {
  return (
    <PageScaffold
      title="Master · Sistema"
      description="Atualizações automáticas, tempo real e robôs agendados."
      icon={Settings2}
    >
      <div className="p-6 space-y-4">
        <Tabs defaultValue="updates" className="space-y-4">

          <TabsList>
            <TabsTrigger value="updates">Atualizações</TabsTrigger>
            <TabsTrigger value="wuzapi">Atualizações WhatsApp</TabsTrigger>
            <TabsTrigger value="realtime">Tempo real</TabsTrigger>
            <TabsTrigger value="jobs">Robôs agendados</TabsTrigger>
            <TabsTrigger value="fotos">Fotos de perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="updates"><UpdatesTab /></TabsContent>
          <TabsContent value="wuzapi"><AtualizacoesWhatsappTab /></TabsContent>
          <TabsContent value="realtime"><RealtimeTab /></TabsContent>
          <TabsContent value="jobs"><JobsTab /></TabsContent>
          <TabsContent value="fotos"><FotosPerfilTab /></TabsContent>

        </Tabs>
      </div>
    </PageScaffold>
  );
}

function UpdatesTab() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetVersionSettings);
  const upFn = useServerFn(adminUpdateVersionSettings);
  const forceFn = useServerFn(adminForceGlobalRefresh);

  const { data, isLoading } = useQuery({ queryKey: ["admin-version-settings"], queryFn: () => getFn() });

  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [interval, setIntervalSec] = useState<number | null>(null);

  const curEnabled = enabled ?? data?.version_banner_enabled ?? true;
  const curInterval = interval ?? data?.version_check_interval_seconds ?? 60;

  const saveM = useMutation({
    mutationFn: () => upFn({ data: { version_banner_enabled: curEnabled, version_check_interval_seconds: curInterval } }),
    onSuccess: () => { toast.success("Salvo."); qc.invalidateQueries({ queryKey: ["admin-version-settings"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const forceM = useMutation({
    mutationFn: () => forceFn(),
    onSuccess: () => toast.success("Banner enviado para todos os usuários conectados."),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Banner de nova versão</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Mostrar banner para usuários</Label>
              <p className="text-xs text-muted-foreground">Quando publicarmos uma versão nova, aparece aviso no topo.</p>
            </div>
            <Switch checked={curEnabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Verificar a cada</Label>
              <span className="font-mono text-sm">{curInterval}s</span>
            </div>
            <Slider min={15} max={600} step={15} value={[curInterval]} onValueChange={(v) => setIntervalSec(v[0])} />
            <p className="text-xs text-muted-foreground">Mínimo 15s, máximo 10min. Padrão: 60s.</p>
          </div>

          <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>Salvar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Forçar atualização agora</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envia um aviso obrigatório para todos os usuários conectados. As telas recarregam sozinhas em 5 segundos.
          </p>
          <Button variant="destructive" onClick={() => { if (confirm("Forçar reload em todos os usuários?")) forceM.mutate(); }} disabled={forceM.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" /> Forçar refresh global
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0 || !Number.isFinite(diff)) return "—";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

function uptimeText(seconds: number): string {
  if (!seconds || seconds < 1) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function GatewayCard() {
  const fn = useServerFn(adminDeployStatus);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-gateway-status"],
    queryFn: () => fn(),
    refetchInterval: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="h-5 w-5" /> Gateway MultiZap
          {data && !data.gateway_outdated && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Online
            </Badge>
          )}
          {data?.gateway_outdated && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Sem /deploys</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading ? (
          <LoadingDots size="sm" label="Consultando" />
        ) : error ? (
          <p className="flex items-start gap-1 text-red-600 text-xs">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {(error as Error).message}
          </p>
        ) : (
          <>
            <Row label="Commit atual" value={data?.current_commit ? <code className="font-mono text-xs">{data.current_commit.slice(0, 7)}</code> : "—"} />
            <Row label="Último OK" value={data?.last_good_commit ? <code className="font-mono text-xs">{data.last_good_commit.slice(0, 7)}</code> : "—"} />
            <Row label="Uptime" value={uptimeText(data?.uptime_s ?? 0)} />
            <Row label="PID" value={data?.pid ? <code className="font-mono text-xs">{data.pid}</code> : "—"} />
          </>
        )}
        <div className="pt-2">
          <Link to="/admin/deploys" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            Ver histórico de deploys <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function WhatsmeowCard() {
  const fn = useServerFn(getWhatsappEngineInfo);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-engine-info"],
    queryFn: () => fn(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60_000,
  });
  const wm = data?.whatsmeow;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCommit className="h-5 w-5" /> Whatsmeow
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">motor interno</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading ? (
          <LoadingDots size="sm" label="Consultando GitHub" />
        ) : error ? (
          <p className="flex items-start gap-1 text-red-600 text-xs">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {(error as Error).message}
          </p>
        ) : (
          <>
            <Row
              label="Último commit"
              value={
                wm?.latest_commit_short ? (
                  <a href={`https://github.com/${wm.repo}/commit/${wm.latest_commit_sha}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary hover:underline">
                    {wm.latest_commit_short}
                  </a>
                ) : "—"
              }
            />
            {wm?.latest_commit_message && (
              <p className="text-xs text-muted-foreground line-clamp-2 italic">"{wm.latest_commit_message}"</p>
            )}
            <Row label="Commit em" value={wm?.latest_commit_date ? formatDateTimeBR(wm.latest_commit_date) : "—"} />
            <Row
              label="Última tag"
              value={
                wm?.latest_tag ? (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <code className="font-mono text-xs">{wm.latest_tag}</code>
                  </span>
                ) : "—"
              }
            />
            {wm?.error && (
              <p className="flex items-start gap-1 text-amber-600 text-xs">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {wm.error}
              </p>
            )}
            <p className="pt-1 text-xs text-muted-foreground">
              Motor Go interno da WuzAPI. Atualiza junto quando a WuzAPI sobe versão.
            </p>
          </>
        )}
        <div className="pt-2">
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/tulir/whatsmeow" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" /> GitHub
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" | "none" }) {
  if (risk === "none") return <Badge variant="outline" className="bg-muted text-muted-foreground">Sem novidades</Badge>;
  if (risk === "high") return <Badge variant="outline" className="bg-red-500/10 text-red-600">Risco alto</Badge>;
  if (risk === "medium") return <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Risco médio</Badge>;
  return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">Risco baixo</Badge>;
}

function UpdateAnalysisCard() {
  const qc = useQueryClient();
  const fn = useServerFn(analyzeWuzapiUpdate);
  const histFn = useServerFn(listWuzapiUpdateChecks);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-wuzapi-analysis"],
    queryFn: () => fn(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60_000,
  });

  const { data: history } = useQuery({
    queryKey: ["admin-wuzapi-analysis-history"],
    queryFn: () => histFn(),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-wuzapi-analysis"] });
    qc.invalidateQueries({ queryKey: ["admin-wuzapi-analysis-history"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCommit className="h-5 w-5" /> Verificação de atualização
          {data && <RiskBadge risk={data.risk} />}
          {data && data.new_commits_count > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {data.new_commits_count} commit{data.new_commits_count > 1 ? "s" : ""} novo{data.new_commits_count > 1 ? "s" : ""}
            </Badge>
          )}
          {data?.whatsmeow.recently_bumped && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
              <AlertTriangle className="mr-1 h-3 w-3" /> Whatsmeow bumpado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Analisa <span className="font-mono">asternic/wuzapi</span> olhando título <em>e</em> arquivos alterados.
            Mexer em <span className="font-mono">go.mod</span>, <span className="font-mono">session</span>,
            <span className="font-mono"> auth</span>, <span className="font-mono">database</span> ou <span className="font-mono">whatsmeow</span> → risco alto.
          </p>
          <Button variant="outline" size="sm" onClick={refresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> Verificar agora
          </Button>
        </div>

        {data?.risk === "high" && (
          <div className="rounded-md border border-red-500/40 bg-red-500/5 p-3 text-xs">
            <p className="flex items-center gap-1 font-medium text-red-600">
              <ShieldAlert className="h-3.5 w-3.5" /> Atualização sensível. Teste em canary obrigatório.
            </p>
            <p className="mt-1 text-muted-foreground">
              O botão <span className="font-mono">Atualizar WuzAPI</span> ficou bloqueado. Use canary (Fase 3) primeiro.
            </p>
          </div>
        )}

        {isLoading ? (
          <LoadingDots size="sm" label="Consultando GitHub" />
        ) : data?.error ? (
          <p className="flex items-start gap-1 text-red-600 text-xs">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {data.error}
          </p>
        ) : data ? (
          <>
            {/* Bloco Whatsmeow */}
            <div className="rounded-md border bg-muted/20 p-3 text-xs space-y-1">
              <p className="font-medium text-foreground flex items-center gap-1">
                <FileCode className="h-3.5 w-3.5" /> Whatsmeow usado pelo WuzAPI
              </p>
              <div className="grid gap-1 sm:grid-cols-2 text-muted-foreground">
                <div>
                  <span className="text-foreground/70">Referência atual:</span>{" "}
                  <span className="font-mono">{data.whatsmeow.ref ?? "—"}</span>
                </div>
                <div>
                  <span className="text-foreground/70">SHA pseudo-version:</span>{" "}
                  <span className="font-mono">{data.whatsmeow.pseudo_sha ?? "—"}</span>
                </div>
                <div>
                  <span className="text-foreground/70">Detectado em:</span>{" "}
                  <span className="font-mono">{data.whatsmeow.detected_from ?? "—"}</span>
                </div>
                <div>
                  <span className="text-foreground/70">Bumpado recentemente:</span>{" "}
                  {data.whatsmeow.recently_bumped
                    ? <span className="text-amber-600 font-medium">sim (commits novos)</span>
                    : <span>não</span>}
                </div>
              </div>
            </div>

            {data.risk_reasons.length > 0 && (
              <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                <p className="font-medium text-foreground">Por que esse risco:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                  {data.risk_reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="rounded-md border">
              <div className="border-b bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">
                Últimos commits WuzAPI
                {data.last_vps_update_at && (
                  <span className="ml-2 font-normal">
                    (sua VPS atualizou pela última vez em {formatDateTimeBR(data.last_vps_update_at)})
                  </span>
                )}
              </div>
              <ul className="divide-y max-h-80 overflow-y-auto">
                {data.commits.slice(0, 15).map((c) => (
                  <li key={c.sha} className={`flex items-start gap-3 px-3 py-2 text-xs ${c.is_new ? "bg-primary/5" : ""}`}>
                    <a href={c.url} target="_blank" rel="noreferrer" className="font-mono text-primary hover:underline shrink-0">
                      {c.short}
                    </a>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-foreground">{c.message}</p>
                      <p className="text-muted-foreground">
                        {c.author ?? "—"} · {c.date ? formatDateTimeBR(c.date) : "—"}
                      </p>
                      {c.touched_files.length > 0 && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/80 font-mono truncate">
                          📂 {c.touched_files.slice(0, 4).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {c.is_new && <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] px-1.5">novo</Badge>}
                      {c.risk_tags.map((t) => (
                        <Badge key={t} variant="outline" className={
                          t === "alto" ? "bg-red-500/10 text-red-600 text-[10px] px-1.5" :
                          t === "médio" ? "bg-amber-500/10 text-amber-600 text-[10px] px-1.5" :
                          "bg-emerald-500/10 text-emerald-600 text-[10px] px-1.5"
                        }>{t}</Badge>
                      ))}
                      {!c.files_inspected && (
                        <span className="text-[9px] text-muted-foreground/60">só título</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Histórico */}
            {history && history.length > 0 && (
              <div className="rounded-md border">
                <div className="border-b bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <History className="h-3.5 w-3.5" /> Histórico de verificações (últimas 20)
                </div>
                <ul className="divide-y max-h-60 overflow-y-auto">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                      <span className="text-muted-foreground shrink-0 w-32">{formatDateTimeBR(h.created_at)}</span>
                      <RiskBadge risk={h.risk} />
                      <span className="text-muted-foreground shrink-0">{h.new_commits_count} novos</span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">
                        {h.latest_remote_sha?.slice(0, 7) ?? "—"} · {h.whatsmeow_ref ?? "—"}
                        {h.whatsmeow_recently_bumped && " · bump"}
                      </span>
                      <span className="text-muted-foreground/70 text-[10px] truncate max-w-[180px]">
                        {h.checked_by_email ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              Última verificação: {formatDateTimeBR(data.checked_at)}
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}


function AtualizacoesWhatsappTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-medium text-amber-700 dark:text-amber-500">Painel do motor WhatsApp QR</p>
        <p className="mt-1 text-muted-foreground">
          Mostra o que está rodando hoje na VPS (Gateway + WuzAPI) e o que existe de mais novo no autor oficial.
          O botão <span className="font-mono">Atualizar WuzAPI</span> abaixo preserva as sessões conectadas.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GatewayCard />
        <WuzapiTab />
        <WhatsmeowCard />
      </div>

      <UpdateAnalysisCard />

      <CanaryCard />

      <DeployMonitorCard />


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como tudo se conecta</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted/40 p-4 text-xs leading-relaxed">
{`MultiZap CRM (este painel)
        ↓
MultiZap Gateway (Node, PM2, porta 3100)
        ↓
WuzAPI (Docker, asternic/wuzapi, 127.0.0.1:8081)
        ↓
Whatsmeow (Go, motor interno da WuzAPI)
        ↓
WhatsApp Web`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function WuzapiTab() {
  const qc = useQueryClient();
  const getFn = useServerFn(getWuzapiUpdateStatus);
  const checkFn = useServerFn(checkWuzapiUpdate);
  const startDeployFn = useServerFn(startProductionDeploy);
  const analyzeFn = useServerFn(analyzeWuzapiUpdate);
  const cooldownFn = useServerFn(getDeployCooldown);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-wuzapi-status"],
    queryFn: () => getFn(),
    refetchOnWindowFocus: true,
  });

  const { data: analysis } = useQuery({
    queryKey: ["admin-wuzapi-analysis"],
    queryFn: () => analyzeFn(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60_000,
  });
  const listCanaryFn = useServerFn(listCanaryRuns);
  const { data: canaryRuns } = useQuery({
    queryKey: ["admin-canary-runs"],
    queryFn: () => listCanaryFn(),
    refetchOnWindowFocus: false,
  });
  const { data: cooldown } = useQuery({
    queryKey: ["admin-deploy-cooldown"],
    queryFn: () => cooldownFn(),
    refetchInterval: 30_000,
  });
  const recentlyPromoted = (canaryRuns ?? []).find((r) =>
    r.status === "promoted" && r.promoted_at &&
    Date.now() - new Date(r.promoted_at).getTime() < 60 * 60_000
  );
  const blockedByRisk = !!analysis?.block_direct_update && !recentlyPromoted;
  const blockedByCooldown = !!cooldown?.active;

  const checkM = useMutation({
    mutationFn: () => checkFn(),
    onSuccess: () => {
      toast.success("Verificação concluída.");
      qc.invalidateQueries({ queryKey: ["admin-wuzapi-status"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const updateM = useMutation({
    mutationFn: () => startDeployFn({ data: {
      target_sha: analysis?.commits?.[0]?.sha ?? null,
      target_whatsmeow_ref: analysis?.whatsmeow?.ref ?? null,
    }}),
    onSuccess: () => {
      toast.success("Deploy iniciado — monitoramento de 5min em andamento.");
      qc.invalidateQueries({ queryKey: ["admin-wuzapi-status"] });
      qc.invalidateQueries({ queryKey: ["admin-deploy-active"] });
      qc.invalidateQueries({ queryKey: ["admin-deploy-history"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });



  if (isLoading) {
    return <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>;
  }

  const s = data;
  const hasUpdate = !!s?.update_available;
  const neverChecked = !s?.checked_at || new Date(s.checked_at).getTime() === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" /> Versão da WuzAPI
          {hasUpdate ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Atualização disponível</Badge>
          ) : !neverChecked ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Atualizado
            </Badge>
          ) : null}
          {blockedByRisk && (
            <Badge variant="outline" className="bg-red-500/10 text-red-600">
              <ShieldAlert className="mr-1 h-3 w-3" /> Canary obrigatório
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Verifica no autor oficial (<span className="font-mono">asternic/wuzapi:latest</span>) se há uma versão nova publicada e atualiza sua VPS com 1 clique — sem perder sessões de WhatsApp conectadas.
        </p>

        {blockedByRisk && (
          <div className="rounded-md border border-red-500/40 bg-red-500/5 p-3 text-xs">
            <p className="flex items-center gap-1 font-medium text-red-600">
              <ShieldAlert className="h-3.5 w-3.5" /> Atualização sensível. Teste em canary obrigatório.
            </p>
            <p className="mt-1 text-muted-foreground">
              Análise detectou risco alto (auth/sessão/protocolo/whatsmeow). Aplicação direta bloqueada.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs uppercase text-muted-foreground">Rodando agora na VPS</p>
            <p className="mt-1 font-mono text-sm">{s?.current_short ?? "—"}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs uppercase text-muted-foreground">Última versão publicada pelo autor</p>
            <p className="mt-1 font-mono text-sm">{s?.latest_short ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {s?.latest_published_at ? `Publicada ${timeAgo(s.latest_published_at)}` : ""}
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Última verificação: {neverChecked ? "nunca" : `${formatDateTimeBR(s!.checked_at)} (${timeAgo(s!.checked_at)})`}
          {s?.check_error && (
            <span className="mt-1 flex items-start gap-1 text-red-600">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {s.check_error}
            </span>
          )}
          {s?.last_update_at && (
            <div className="mt-1">
              Última atualização: {formatDateTimeBR(s.last_update_at)} —{" "}
              {s.last_update_status === "ok" ? "sucesso" : `erro (${s.last_update_error ?? "sem detalhe"})`}
            </div>
          )}
        </div>

        {blockedByCooldown && (
          <div className="rounded-md border border-orange-500/40 bg-orange-500/5 p-3 text-xs">
            <p className="flex items-center gap-1 font-medium text-orange-600">
              <Timer className="h-3.5 w-3.5" /> Cooldown ativo após rollback recente.
            </p>
            <p className="mt-1 text-muted-foreground">
              Liberado em {cooldown?.until ? formatDateTimeBR(cooldown.until) : "—"}. Motivo: {cooldown?.reason ?? "—"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => checkM.mutate()} disabled={checkM.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checkM.isPending ? "animate-spin" : ""}`} /> Verificar agora
          </Button>
          <Button
            onClick={() => {
              if (confirm("Atualizar a WuzAPI agora? Após o restart, o sistema vai monitorar por 5min e reverter automaticamente se detectar problema.")) {
                updateM.mutate();
              }
            }}
            disabled={!hasUpdate || updateM.isPending || blockedByRisk || blockedByCooldown}
            title={
              blockedByRisk ? "Bloqueado: risco alto — use canary primeiro" :
              blockedByCooldown ? "Bloqueado: cooldown após rollback" : undefined
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {updateM.isPending ? "Iniciando..." :
             blockedByRisk ? "Bloqueado (risco alto)" :
             blockedByCooldown ? "Bloqueado (cooldown)" :
             "Atualizar WuzAPI"}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}



function RealtimeTab() {
  const tables = [
    { name: "plans", desc: "Planos (preços, limites, BYOK)" },
    { name: "master_settings", desc: "Configurações da landing (textos, toggles, métricas)" },
    { name: "workspace_controls", desc: "Bloqueios, pausas e banners por empresa" },
    { name: "notifications", desc: "Sininho de notificações" },
    { name: "subscriptions", desc: "Assinaturas e status de pagamento" },
    { name: "ticket_messages", desc: "Mensagens de chat" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canais em tempo real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Tabelas abaixo enviam atualizações ao vivo para todas as telas abertas. Quando você muda algo aqui no master, o usuário vê na hora — sem F5.
        </p>
        <ul className="divide-y rounded-md border">
          {tables.map((t) => (
            <li key={t.name} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{t.desc}</p>
                <p className="font-mono text-xs text-muted-foreground">{t.name}</p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Ativo
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function JobsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListSystemJobs);
  const toggleFn = useServerFn(adminToggleSystemJob);
  const runFn = useServerFn(adminRunSystemJobNow);

  const { data: jobs, isLoading } = useQuery({ queryKey: ["admin-system-jobs"], queryFn: () => listFn() });
  useRealtimeInvalidate("system-jobs", [{ table: "system_jobs" }], [["admin-system-jobs"]], { scope: "admin" });

  const toggleM = useMutation({
    mutationFn: (v: { id: string; enabled: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-system-jobs"] }),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const runM = useMutation({
    mutationFn: (id: string) => runFn({ data: { id } }),
    onSuccess: () => { toast.success("Robô executado."); qc.invalidateQueries({ queryKey: ["admin-system-jobs"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Card>
      <CardHeader><CardTitle>Robôs agendados ({jobs?.length ?? 0})</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p> :
         !jobs?.length ? <p className="text-sm text-muted-foreground">Nenhum robô cadastrado.</p> : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Nome / descrição</th>
                <th>Quando roda</th>
                <th>Última execução</th>
                <th>Status</th>
                <th>Duração</th>
                <th>Ativo</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t align-top">
                  <td className="py-3">
                    <p className="font-medium">{j.name}</p>
                    <p className="text-xs text-muted-foreground">{j.description}</p>
                    {j.last_error && (
                      <p className="mt-1 flex items-start gap-1 text-xs text-red-600">
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />{j.last_error.slice(0, 120)}
                      </p>
                    )}
                  </td>
                  <td className="font-mono text-xs">{j.cron_expr}</td>
                  <td className="text-xs text-muted-foreground">
                    {j.last_run_at ? formatDateTimeBR(j.last_run_at) : "—"}
                  </td>
                  <td>
                    {j.last_status === "ok" ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">ok</Badge>
                    ) : j.last_status === "error" ? (
                      <Badge variant="outline" className="bg-red-500/10 text-red-600">erro</Badge>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="text-xs">{j.last_duration_ms != null ? `${j.last_duration_ms}ms` : "—"}</td>
                  <td>
                    <Switch checked={j.enabled} onCheckedChange={(v) => toggleM.mutate({ id: j.id, enabled: v })} />
                  </td>
                  <td className="text-right">
                    <Button size="sm" variant="outline" onClick={() => runM.mutate(j.id)} disabled={runM.isPending || !j.enabled}>
                      <Play className="mr-1 h-3 w-3" /> Executar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Fase 3: Canary / teste isolado ──────────────────────────────────────────

const HEALTH_LABELS: Record<string, string> = {
  build_ok: "Build do canary subiu sem erro",
  service_up: "Serviço respondendo (health endpoint OK)",
  qr_generated: "QR Code gerado / sessão aceita",
  test_message_sent: "Mensagem de teste enviada com sucesso",
};

function CanaryCard() {
  const qc = useQueryClient();
  const analyzeFn = useServerFn(analyzeWuzapiUpdate);
  const getActiveFn = useServerFn(getActiveCanaryRun);
  const startFn = useServerFn(startCanaryRun);
  const setHealthFn = useServerFn(setCanaryHealthCheck);
  const refreshFn = useServerFn(refreshCanaryFromGateway);
  const promoteFn = useServerFn(promoteCanary);
  const abortFn = useServerFn(abortCanary);
  const listFn = useServerFn(listCanaryRuns);

  const { data: analysis } = useQuery({
    queryKey: ["admin-wuzapi-analysis"],
    queryFn: () => analyzeFn(),
    staleTime: 5 * 60_000,
  });
  const { data: active, isLoading } = useQuery({
    queryKey: ["admin-canary-active"],
    queryFn: () => getActiveFn(),
    refetchOnWindowFocus: true,
  });
  const { data: history } = useQuery({
    queryKey: ["admin-canary-history"],
    queryFn: () => listFn(),
  });

  const [abortReason, setAbortReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-canary-active"] });
    qc.invalidateQueries({ queryKey: ["admin-canary-history"] });
    qc.invalidateQueries({ queryKey: ["admin-canary-runs"] });
  };

  const startM = useMutation({
    mutationFn: () => startFn({ data: {
      target_sha: analysis?.commits?.[0]?.sha ?? null,
      whatsmeow_ref: analysis?.whatsmeow?.ref ?? null,
    }}),
    onSuccess: (r) => {
      toast.success(r.mode === "gateway"
        ? "Canary iniciado no Gateway."
        : "Canary criado em modo manual — siga o checklist.");
      invalidate();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const refreshM = useMutation({
    mutationFn: () => refreshFn({ data: { canary_id: active!.id } }),
    onSuccess: () => { toast.success("Status atualizado."); invalidate(); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const setHealthM = useMutation({
    mutationFn: (p: { key: keyof CanaryRun["health_checks"]; value: boolean }) =>
      setHealthFn({ data: { canary_id: active!.id, key: p.key, value: p.value } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const promoteM = useMutation({
    mutationFn: () => promoteFn({ data: { canary_id: active!.id, confirm: "PROMOVER CANARY" } }),
    onSuccess: () => {
      toast.success("Canary promovido — atualização de produção liberada por 60min.");
      setConfirmText("");
      invalidate();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const abortM = useMutation({
    mutationFn: () => abortFn({ data: { canary_id: active!.id, reason: abortReason } }),
    onSuccess: () => { toast.success("Canary abortado."); setAbortReason(""); invalidate(); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const hasNewCommits = (analysis?.new_commits_count ?? 0) > 0;
  const canStart = !active && hasNewCommits && !startM.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Beaker className="h-5 w-5 text-purple-500" /> Canary — Teste isolado
          {active && <Badge variant="outline" className="bg-purple-500/10 text-purple-600">{active.status}</Badge>}
          {active?.mode && <Badge variant="outline" className="text-xs">modo: {active.mode}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Antes de atualizar a produção, sobe a nova versão num container isolado e valida 4 health checks.
          Risco alto exige canary; depois de promovido, a atualização de produção fica liberada por 60min.
        </p>

        {isLoading ? (
          <LoadingDots size="sm" label="Carregando canary" />
        ) : !active ? (
          <div className="rounded-md border border-dashed p-4">
            <p className="text-sm">
              {hasNewCommits
                ? `${analysis?.new_commits_count} commit(s) novo(s) detectado(s). Pronto para canary.`
                : "Nenhum commit novo detectado — não há nada para testar."}
            </p>
            <Button className="mt-3" onClick={() => startM.mutate()} disabled={!canStart}>
              <Beaker className="mr-2 h-4 w-4" /> Iniciar canary
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-md border p-3">
                <p className="uppercase text-muted-foreground">Target SHA</p>
                <p className="mt-1 font-mono">{active.target_sha?.slice(0, 12) ?? "—"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="uppercase text-muted-foreground">Whatsmeow</p>
                <p className="mt-1 font-mono truncate">{active.whatsmeow_ref ?? "—"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Health checks</p>
              {(Object.keys(HEALTH_LABELS) as Array<keyof CanaryRun["health_checks"]>).map((k) => (
                <label key={k} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <Checkbox
                    checked={!!active.health_checks[k]}
                    disabled={active.mode === "gateway" || setHealthM.isPending
                      || ["promoted", "aborted", "failed"].includes(active.status)}
                    onCheckedChange={(v) => setHealthM.mutate({ key: k, value: !!v })}
                  />
                  <span className={active.health_checks[k] ? "" : "text-muted-foreground"}>
                    {HEALTH_LABELS[k]}
                  </span>
                  {active.health_checks[k] && <CheckCheck className="ml-auto h-4 w-4 text-emerald-500" />}
                </label>
              ))}
              {active.mode === "gateway" && (
                <Button size="sm" variant="outline" onClick={() => refreshM.mutate()} disabled={refreshM.isPending}>
                  <RefreshCw className={`mr-2 h-3 w-3 ${refreshM.isPending ? "animate-spin" : ""}`} />
                  Atualizar status do Gateway
                </Button>
              )}
            </div>

            {active.last_error && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-700">
                <AlertCircle className="mr-1 inline h-3 w-3" /> {active.last_error}
              </div>
            )}

            {active.status === "healthy" && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 space-y-2">
                <p className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                  <ShieldCheck className="h-4 w-4" /> Tudo verde — pronto para promover.
                </p>
                <Input
                  placeholder='Digite "PROMOVER CANARY" para confirmar'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <Button
                  onClick={() => promoteM.mutate()}
                  disabled={confirmText !== "PROMOVER CANARY" || promoteM.isPending}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  {promoteM.isPending ? "Promovendo..." : "Promover canary → produção"}
                </Button>
              </div>
            )}

            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 space-y-2">
              <p className="text-sm font-medium text-red-600">Abortar canary</p>
              <Textarea
                placeholder="Motivo (mínimo 5 caracteres)"
                value={abortReason}
                onChange={(e) => setAbortReason(e.target.value)}
                rows={2}
              />
              <Button
                variant="destructive" size="sm"
                onClick={() => abortM.mutate()}
                disabled={abortReason.length < 5 || abortM.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" /> Abortar
              </Button>
            </div>
          </>
        )}

        {(history?.length ?? 0) > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">Últimos canaries</p>
            <div className="space-y-1 text-xs">
              {history!.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-md border px-2 py-1">
                  <Badge variant="outline" className={
                    r.status === "promoted" ? "bg-emerald-500/10 text-emerald-600"
                    : r.status === "aborted" ? "bg-muted text-muted-foreground"
                    : r.status === "failed" ? "bg-red-500/10 text-red-600"
                    : "bg-purple-500/10 text-purple-600"
                  }>{r.status}</Badge>
                  <span className="font-mono">{r.target_sha?.slice(0, 8) ?? "—"}</span>
                  <span className="text-muted-foreground">{formatDateTimeBR(r.started_at)}</span>
                  <span className="ml-auto text-muted-foreground">{r.started_by_email ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Fase 4: Monitor de deploy + rollback automático ─────────────────────────

function DeployMonitorCard() {
  const qc = useQueryClient();
  const getActiveFn = useServerFn(getActiveDeployment);
  const listFn = useServerFn(listProductionDeploys);
  const runCheckFn = useServerFn(runHealthCheck);
  const rollbackFn = useServerFn(triggerRollback);

  const { data: active } = useQuery({
    queryKey: ["admin-deploy-active"],
    queryFn: () => getActiveFn(),
    refetchInterval: 5_000,
  });
  const { data: history } = useQuery({
    queryKey: ["admin-deploy-history"],
    queryFn: () => listFn(),
    refetchInterval: 15_000,
  });

  const [rollbackReason, setRollbackReason] = useState("");
  const [rollbackConfirm, setRollbackConfirm] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-deploy-active"] });
    qc.invalidateQueries({ queryKey: ["admin-deploy-history"] });
    qc.invalidateQueries({ queryKey: ["admin-deploy-cooldown"] });
  };

  const checkM = useMutation({
    mutationFn: () => runCheckFn({ data: { deploy_id: active!.id } }),
    onSuccess: invalidate,
  });

  const rollbackM = useMutation({
    mutationFn: () => rollbackFn({ data: {
      deploy_id: active!.id,
      reason: rollbackReason,
      confirm: "ROLLBACK WUZAPI",
    }}),
    onSuccess: () => {
      toast.success("Rollback executado.");
      setRollbackReason(""); setRollbackConfirm("");
      invalidate();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  // Polling automático dos health checks enquanto status = monitoring
  useEffect(() => {
    if (!active || active.status !== "monitoring") return;
    const t = setInterval(() => checkM.mutate(), 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.status]);

  const progress = active ? Math.min(100, (active.check_count / 10) * 100) : 0;
  const lastMetric = active?.health_metrics?.[active.health_metrics.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-blue-500" /> Monitor de Deploy
          {active && (
            <Badge variant="outline" className={
              active.status === "monitoring" ? "bg-blue-500/10 text-blue-600" :
              active.status === "healthy" ? "bg-emerald-500/10 text-emerald-600" :
              active.status === "degraded" ? "bg-amber-500/10 text-amber-600" :
              active.status === "rolled_back" ? "bg-muted text-muted-foreground" :
              "bg-red-500/10 text-red-600"
            }>{active.status}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Depois de atualizar a WuzAPI, o sistema observa a saúde por 5 minutos. Se cair 2x seguidas, reverte sozinho pra versão anterior.
        </p>

        {!active ? (
          <p className="text-sm text-muted-foreground rounded-md border border-dashed p-4">
            Nenhum deploy em andamento.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-md border p-3">
                <p className="uppercase text-muted-foreground">SHA anterior</p>
                <p className="mt-1 font-mono truncate">{active.previous_sha?.slice(-12) ?? "—"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="uppercase text-muted-foreground">SHA alvo</p>
                <p className="mt-1 font-mono truncate">{active.target_sha?.slice(0, 12) ?? "—"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="uppercase text-muted-foreground">Iniciado por</p>
                <p className="mt-1 truncate">{active.triggered_by_email ?? "—"}</p>
              </div>
            </div>

            {active.status === "monitoring" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Health checks: {active.check_count}/10</span>
                  <span className="text-muted-foreground">
                    {active.consecutive_failures > 0 && `${active.consecutive_failures} falha(s) seguida(s)`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {lastMetric && (
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div className="rounded-md border p-2">
                  <p className="text-muted-foreground">Sessões UP</p>
                  <p className="font-mono">
                    {lastMetric.sessions_up ?? "—"} / baseline {lastMetric.sessions_baseline ?? "—"}
                  </p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-muted-foreground">Erro webhook / msgs/min</p>
                  <p className="font-mono">
                    {lastMetric.webhook_error_rate != null ? `${(lastMetric.webhook_error_rate * 100).toFixed(1)}%` : "—"}
                    {" · "}
                    {lastMetric.messages_per_min ?? "—"}
                  </p>
                </div>
              </div>
            )}

            {active.rollback_reason && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-700">
                <AlertCircle className="mr-1 inline h-3 w-3" /> {active.rollback_reason}
              </div>
            )}

            {["monitoring", "degraded", "rollback_failed"].includes(active.status) && (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                <p className="flex items-center gap-1 text-sm font-medium text-red-600">
                  <Undo2 className="h-4 w-4" /> Forçar rollback manual
                </p>
                <Textarea
                  placeholder="Motivo (mínimo 5 caracteres)"
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  rows={2}
                />
                <Input
                  placeholder='Digite "ROLLBACK WUZAPI" para confirmar'
                  value={rollbackConfirm}
                  onChange={(e) => setRollbackConfirm(e.target.value)}
                />
                <Button
                  variant="destructive" size="sm"
                  onClick={() => rollbackM.mutate()}
                  disabled={rollbackReason.length < 5 || rollbackConfirm !== "ROLLBACK WUZAPI" || rollbackM.isPending}
                >
                  <Undo2 className="mr-2 h-4 w-4" />
                  {rollbackM.isPending ? "Revertendo..." : "Reverter agora"}
                </Button>
              </div>
            )}
          </>
        )}

        {(history?.length ?? 0) > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">Últimos deploys</p>
            <div className="space-y-1 text-xs">
              {history!.map((d) => (
                <div key={d.id} className="flex items-center gap-2 rounded-md border px-2 py-1">
                  <Badge variant="outline" className={
                    d.status === "healthy" ? "bg-emerald-500/10 text-emerald-600" :
                    d.status === "rolled_back" ? "bg-muted text-muted-foreground" :
                    d.status === "rollback_failed" ? "bg-red-500/10 text-red-600" :
                    d.status === "degraded" ? "bg-amber-500/10 text-amber-600" :
                    "bg-blue-500/10 text-blue-600"
                  }>{d.status}</Badge>
                  <span className="font-mono">{d.target_sha?.slice(0, 8) ?? "—"}</span>
                  <span className="text-muted-foreground">{formatDateTimeBR(d.triggered_at)}</span>
                  {d.rollback_reason && (
                    <span className="text-muted-foreground truncate max-w-[200px]" title={d.rollback_reason}>
                      · {d.rollback_reason}
                    </span>
                  )}
                  <span className="ml-auto text-muted-foreground truncate max-w-[140px]">{d.triggered_by_email ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Aba: Fotos de perfil (backfill master) =====
function FotosPerfilTab() {
  const wsQ = useQuery({
    queryKey: ["admin-workspaces-lite"],
    queryFn: () => listWorkspacesLite(),
  });
  const [workspaceId, setWorkspaceId] = useState<string>("");

  // Default: primeiro workspace da lista quando carregar.
  useEffect(() => {
    if (!workspaceId && wsQ.data && wsQ.data.length > 0) {
      setWorkspaceId(wsQ.data[0].id);
    }
  }, [wsQ.data, workspaceId]);

  type Resultado = { processed: number; updated: number; skipped: number; failed: number } | null;
  const [resContatos, setResContatos] = useState<Resultado>(null);
  const [resGrupos, setResGrupos] = useState<Resultado>(null);

  const resyncContatos = useServerFn(resyncWorkspaceAvatars);
  const resyncGrupos = useServerFn(resyncWorkspaceGroupAvatars);

  const mContatos = useMutation({
    mutationFn: () => resyncContatos({ data: { workspaceId, limit: 200 } }),
    onSuccess: (r: any) => {
      if (r?.ok === false) {
        toast.error("Sem permissão para atualizar fotos deste workspace.");
        return;
      }
      setResContatos({
        processed: r?.processed ?? 0,
        updated: r?.updated ?? 0,
        skipped: r?.skipped ?? 0,
        failed: r?.failed ?? 0,
      });
      toast.success("Fotos atualizadas com sucesso.");
    },
    onError: (e) => {
      toast.error(friendlyError(e, "Não foi possível atualizar todas as fotos. Tente novamente em alguns minutos."));
    },
  });

  const mGrupos = useMutation({
    mutationFn: () => resyncGrupos({ data: { workspaceId, limit: 100 } }),
    onSuccess: (r: any) => {
      if (r?.ok === false) {
        toast.error("Sem permissão para atualizar fotos deste workspace.");
        return;
      }
      setResGrupos({
        processed: r?.processed ?? 0,
        updated: r?.updated ?? 0,
        skipped: r?.skipped ?? 0,
        failed: r?.failed ?? 0,
      });
      toast.success("Fotos de grupos atualizadas com sucesso.");
    },
    onError: (e) => {
      toast.error(friendlyError(e, "Não foi possível atualizar todas as fotos. Tente novamente em alguns minutos."));
    },
  });

  const semWorkspace = !workspaceId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-4" />
          Fotos de perfil — atualização em massa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aviso simples pro master */}
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground space-y-1">
          <p>Atualiza só fotos antigas (mais de 24h) ou contatos/grupos que nunca tiveram foto.</p>
          <p>Cada clique processa até <b>200 contatos</b> e <b>100 grupos</b>. Se faltar foto, é só clicar de novo.</p>
          <p>Roda uma de cada vez pra não sobrecarregar o WhatsApp.</p>
        </div>

        {/* Seletor de workspace */}
        <div className="space-y-2 max-w-md">
          <Label htmlFor="ws-fotos">Workspace</Label>
          <select
            id="ws-fotos"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={workspaceId}
            onChange={(e) => {
              setWorkspaceId(e.target.value);
              setResContatos(null);
              setResGrupos(null);
            }}
            disabled={wsQ.isLoading || mContatos.isPending || mGrupos.isPending}
          >
            {wsQ.isLoading && <option value="">Carregando workspaces…</option>}
            {!wsQ.isLoading && (wsQ.data ?? []).length === 0 && (
              <option value="">Nenhum workspace encontrado</option>
            )}
            {(wsQ.data ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} {w.slug ? `(${w.slug})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card: Contatos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4" />
                Contatos privados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Baixa a foto de até 200 contatos sem foto ou com foto vencida (mais de 24h).
              </p>
              <Button
                onClick={() => mContatos.mutate()}
                disabled={semWorkspace || mContatos.isPending}
                className="w-full"
              >
                {mContatos.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots /> Atualizando fotos… isso pode levar alguns minutos
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-4" />
                    Atualizar fotos de contatos agora
                  </span>
                )}
              </Button>
              {resContatos && (
                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <div className="font-medium mb-1 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Resultado
                  </div>
                  <div className="text-muted-foreground">
                    Processados: <b>{resContatos.processed}</b> · Atualizados:{" "}
                    <b>{resContatos.updated}</b> · Sem foto: <b>{resContatos.skipped}</b> ·
                    Falharam: <b>{resContatos.failed}</b>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Grupos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UsersRound className="size-4" />
                Grupos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Baixa a foto de até 100 grupos sem foto ou com foto vencida (mais de 24h).
              </p>
              <Button
                onClick={() => mGrupos.mutate()}
                disabled={semWorkspace || mGrupos.isPending}
                className="w-full"
              >
                {mGrupos.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots /> Atualizando fotos… isso pode levar alguns minutos
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-4" />
                    Atualizar fotos de grupos agora
                  </span>
                )}
              </Button>
              {resGrupos && (
                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <div className="font-medium mb-1 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Resultado
                  </div>
                  <div className="text-muted-foreground">
                    Processados: <b>{resGrupos.processed}</b> · Atualizados:{" "}
                    <b>{resGrupos.updated}</b> · Sem foto: <b>{resGrupos.skipped}</b> ·
                    Falharam: <b>{resGrupos.failed}</b>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}


