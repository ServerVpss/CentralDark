// Painel GitHub / Deploy VPS — usado dentro da aba de /admin/integracao
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import {
  Plug, PlugZap, RefreshCw, Power,
  CheckCircle2, AlertCircle, XCircle, Loader2, ShieldAlert, Link as LinkIcon,
  Rocket, Server, Check, ChevronsUpDown, ExternalLink, Lock, GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  getGithubIntegrationStatus,
  connectGithub,
  disconnectGithubIntegration,
  selectGithubRepository,
  syncGithubRepository,
  listGithubIntegrationLogs,
  listGithubRepositories,
  listGithubBranches,
  getVpsDeployConfig,
  saveVpsDeployConfig,
  triggerVpsDeploy,
  testVpsWebhookSignature,
  listVpsDeploys,
  startGithubOAuth,
} from "@/lib/github.functions";
import {
  runPublishAndDeploy,
  getRemoteCommit,
  repairQrWebhook,
  runGatewayDiagnostic,
} from "@/lib/github-deploy-flow.functions";

type StatusData = Awaited<ReturnType<typeof getGithubIntegrationStatus>>;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    not_connected: { label: "Não conectado", className: "bg-muted text-muted-foreground", Icon: XCircle },
    connected:     { label: "Conectado",     className: "bg-blue-500/15 text-blue-600 border-blue-500/30", Icon: CheckCircle2 },
    permission_error: { label: "Erro de permissão", className: "bg-amber-500/15 text-amber-600 border-amber-500/30", Icon: ShieldAlert },
    syncing:       { label: "Sincronizando",  className: "bg-purple-500/15 text-purple-600 border-purple-500/30", Icon: Loader2 },
    ready:         { label: "Pronto",         className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", Icon: CheckCircle2 },
    failed:        { label: "Falhou",         className: "bg-rose-500/15 text-rose-600 border-rose-500/30", Icon: AlertCircle },
  };
  const it = map[status] ?? map.not_connected;
  const Icon = it.Icon;
  return (
    <Badge variant="outline" className={`gap-1 ${it.className}`}>
      <Icon className={`h-3 w-3 ${status === "syncing" ? "animate-spin" : ""}`} />
      {it.label}
    </Badge>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</div>
    </div>
  );
}

function ConnectionCard({ status, isLoading }: { status: StatusData | undefined; isLoading: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const connectFn = useServerFn(connectGithub);
  const disconnectFn = useServerFn(disconnectGithubIntegration);
  const oauthFn = useServerFn(startGithubOAuth);
  const oauthMut = useMutation({
    mutationFn: () => oauthFn(),
    onSuccess: (r) => { window.location.href = r.url; },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const connectMut = useMutation({
    mutationFn: () => connectFn({ data: { auth_type: "pat", access_token: token } }),
    onSuccess: (r) => {
      toast.success(`Conectado como @${r.gh_login}`);
      setOpen(false);
      setToken("");
      qc.invalidateQueries({ queryKey: ["github-integration-status"] });
      qc.invalidateQueries({ queryKey: ["github-integration-logs"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const disconnectMut = useMutation({
    mutationFn: () => disconnectFn(),
    onSuccess: () => {
      toast.success("Desconectado");
      qc.invalidateQueries({ queryKey: ["github-integration-status"] });
      qc.invalidateQueries({ queryKey: ["github-integration-logs"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const connected = !!status?.configured;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" /> Status da conexão
            </CardTitle>
            <CardDescription>
              Conecte uma conta GitHub para sincronizar repositório e preparar deploy.
            </CardDescription>
          </div>
          {status && <StatusBadge status={status.status} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Info label="Modo" value={status?.auth_type === "app" ? "GitHub App" : "Personal Access Token"} />
              <Info label="Token" value={status?.token_preview ?? "—"} mono />
              <Info label="Conectado em" value={status?.connected_at ? formatDateTimeBR(status.connected_at) : "—"} />
            </div>
            {status?.last_error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status.last_error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => oauthMut.mutate()}
                disabled={oauthMut.isPending}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {oauthMut.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Abrindo GitHub…</>
                ) : (
                  <><PlugZap className="h-4 w-4 mr-2" /> {connected ? "Reconectar com GitHub (1 clique)" : "Entrar com GitHub (1 clique)"}</>
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plug className="h-4 w-4 mr-2" /> Usar token (avançado)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Conectar GitHub</DialogTitle>
                    <DialogDescription>
                      Cole um <strong>Personal Access Token</strong> (clássico ou fine-grained) com
                      permissão de leitura e escrita no repositório.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Label htmlFor="gh-token">Token</Label>
                    <Input
                      id="gh-token"
                      type="password"
                      autoComplete="off"
                      placeholder="ghp_… ou github_pat_…"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Crie em <a className="underline" target="_blank" rel="noreferrer"
                        href="https://github.com/settings/tokens?type=beta">github.com/settings/tokens</a>.
                      O token vai direto pro backend e <strong>nunca</strong> aparece em logs nem no navegador.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                      onClick={() => connectMut.mutate()}
                      disabled={token.length < 20 || connectMut.isPending}
                    >
                      {connectMut.isPending ? "Validando…" : "Salvar e validar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {connected && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Tem certeza que quer desconectar? O token será removido.")) {
                      disconnectMut.mutate();
                    }
                  }}
                  disabled={disconnectMut.isPending}
                >
                  <Power className="h-4 w-4 mr-2" /> Desconectar
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RepositoryCard({ status }: { status: StatusData | undefined }) {
  const qc = useQueryClient();
  const ready = !!status?.configured;

  const [owner, setOwner] = useState(status?.repo_owner ?? "");
  const [name, setName] = useState(status?.repo_name ?? "");
  const [branch, setBranch] = useState(status?.branch ?? "main");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  const selectFn = useServerFn(selectGithubRepository);
  const syncFn = useServerFn(syncGithubRepository);
  const listReposFn = useServerFn(listGithubRepositories);
  const listBranchesFn = useServerFn(listGithubBranches);

  // Sincroniza com status salvo (ao carregar/atualizar)
  useEffect(() => {
    if (status?.repo_owner) setOwner(status.repo_owner);
    if (status?.repo_name) setName(status.repo_name);
    if (status?.branch) setBranch(status.branch);
  }, [status?.repo_owner, status?.repo_name, status?.branch]);

  const reposQuery = useQuery({
    queryKey: ["github-repos-list"],
    queryFn: () => listReposFn(),
    enabled: ready,
    staleTime: 60_000,
  });

  const repoKey = owner && name ? `${owner}/${name}` : "";

  const branchesQuery = useQuery({
    queryKey: ["github-branches", owner, name],
    queryFn: () => listBranchesFn({ data: { owner, name } }),
    enabled: ready && !!owner && !!name,
    staleTime: 60_000,
  });

  const selectMut = useMutation({
    mutationFn: () => selectFn({ data: { owner, name, branch } }),
    onSuccess: () => {
      toast.success("Repositório selecionado");
      qc.invalidateQueries({ queryKey: ["github-integration-status"] });
      qc.invalidateQueries({ queryKey: ["github-integration-logs"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const syncMut = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r) => {
      if (r.pushed_new_commit) {
        toast.success(
          `Commit novo criado · ${r.commit_short} (${r.changed_files.length} arquivo${r.changed_files.length === 1 ? "" : "s"})`
        );
      } else {
        toast.info(`Sem mudanças a enviar · GitHub continua em ${r.commit_short}`);
      }
      qc.invalidateQueries({ queryKey: ["github-integration-status"] });
      qc.invalidateQueries({ queryKey: ["github-integration-logs"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const handlePickRepo = (full: string) => {
    const repo = reposQuery.data?.find((r) => r.full_name === full);
    if (!repo) return;
    setOwner(repo.owner);
    setName(repo.name);
    setBranch(repo.default_branch || "main");
    setPickerOpen(false);
  };

  const dirty =
    ready &&
    !!owner &&
    !!name &&
    !!branch &&
    (owner !== status?.repo_owner || name !== status?.repo_name || branch !== status?.branch);

  return (
    <Card className={ready ? "" : "opacity-60"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" /> Repositório
        </CardTitle>
        <CardDescription>
          Escolha o repositório e a branch direto do GitHub conectado — sem precisar digitar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 items-end">
          {/* Combobox de repositório */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              Repositório
              {reposQuery.isFetching && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={!ready}
                  className="w-full justify-between font-mono text-xs h-10"
                >
                  <span className="truncate">
                    {repoKey || (reposQuery.isLoading ? "Carregando…" : "Selecionar repositório")}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar repositório…" />
                  <CommandList>
                    <CommandEmpty>
                      {reposQuery.isError
                        ? friendlyError(reposQuery.error)
                        : "Nenhum repositório encontrado."}
                    </CommandEmpty>
                    <CommandGroup>
                      {(reposQuery.data ?? []).map((r) => (
                        <CommandItem
                          key={r.full_name}
                          value={r.full_name}
                          onSelect={() => handlePickRepo(r.full_name)}
                          className="gap-2"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              r.full_name === repoKey ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="font-mono text-xs truncate flex-1">{r.full_name}</span>
                          {r.private && (
                            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          {!r.can_push && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              sem push
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Select de branch */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5" /> Branch
              {branchesQuery.isFetching && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Select
              value={branch}
              onValueChange={setBranch}
              disabled={!ready || !owner || !name || branchesQuery.isLoading}
            >
              <SelectTrigger className="h-10 font-mono text-xs">
                <SelectValue placeholder="Selecionar branch" />
              </SelectTrigger>
              <SelectContent>
                {(branchesQuery.data ?? []).map((b) => (
                  <SelectItem key={b.name} value={b.name} className="font-mono text-xs">
                    <span className="flex items-center gap-2">
                      {b.name}
                      {b.protected && (
                        <Badge variant="outline" className="text-[10px]">protegida</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
                {/* Mantém a branch atual mesmo se a query ainda não respondeu */}
                {branch && !branchesQuery.data?.some((b) => b.name === branch) && (
                  <SelectItem value={branch} className="font-mono text-xs">
                    {branch}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!ready || reposQuery.isFetching}
            onClick={() => {
              reposQuery.refetch();
              if (owner && name) branchesQuery.refetch();
            }}
            className="h-10"
          >
            <RefreshCw className={cn("h-4 w-4", reposQuery.isFetching && "animate-spin")} />
            <span className="sr-only">Atualizar lista</span>
          </Button>
        </div>

        {repoKey && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="gap-1.5 font-mono">
              <LinkIcon className="h-3 w-3" />
              {repoKey}@{branch}
            </Badge>
            <a
              href={`https://github.com/${owner}/${name}/tree/${branch}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              Abrir no GitHub <ExternalLink className="h-3 w-3" />
            </a>
            {dirty && (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                Alterações não salvas
              </Badge>
            )}
          </div>
        )}

        {status?.last_sync_at && (
          <div className="text-xs text-muted-foreground">
            Última sincronização: {formatDateTimeBR(status.last_sync_at)}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!ready || !owner || !name || !branch || selectMut.isPending}
            onClick={() => selectMut.mutate()}
          >
            {selectMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar repositório
          </Button>
          <Button
            disabled={!ready || !status?.repo_owner || syncMut.isPending}
            onClick={() => syncMut.mutate()}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", syncMut.isPending && "animate-spin")} />
            Sincronizar repositório
          </Button>
        </div>

        <Collapsible open={advanced} onOpenChange={setAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
              {advanced ? "Ocultar" : "Modo avançado"} (editar manualmente)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Owner</Label>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} disabled={!ready} />
              </div>
              <div>
                <Label className="text-xs">Repositório</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!ready} />
              </div>
              <div>
                <Label className="text-xs">Branch</Label>
                <Input value={branch} onChange={(e) => setBranch(e.target.value)} disabled={!ready} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}



function VpsDeployCard({ repoReady }: { repoReady: boolean }) {
  const qc = useQueryClient();
  const cfgFn = useServerFn(getVpsDeployConfig);
  const saveFn = useServerFn(saveVpsDeployConfig);
  const deployFn = useServerFn(triggerVpsDeploy);
  const testSigFn = useServerFn(testVpsWebhookSignature);
  const listFn = useServerFn(listVpsDeploys);

  const { data: cfg } = useQuery({
    queryKey: ["vps-deploy-config"],
    queryFn: () => cfgFn(),
    refetchInterval: 15000,
  });
  const { data: deploys } = useQuery({
    queryKey: ["vps-deploys"],
    queryFn: () => listFn(),
    refetchInterval: 10000,
  });

  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [pm2Process, setPm2Process] = useState("");
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useMemo(() => {
    if (!cfg || hydrated) return;
    setWebhookUrl(cfg.webhook_url ?? "");
    setTargetPath(cfg.target_path ?? "");
    setPm2Process(cfg.pm2_process ?? "");
    setAutoDeploy(cfg.auto_deploy);
    setHydrated(true);
  }, [cfg, hydrated]);

  const saveMut = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          webhook_url: webhookUrl.trim(),
          webhook_secret: webhookSecret,
          target_path: targetPath.trim(),
          pm2_process: pm2Process.trim(),
          auto_deploy: autoDeploy,
        },
      }),
    onSuccess: () => {
      toast.success("Configuração salva");
      setWebhookSecret("");
      qc.invalidateQueries({ queryKey: ["vps-deploy-config"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const deployMut = useMutation({
    mutationFn: () => deployFn(),
    onSuccess: (r) => {
      toast.success(`Deploy disparado · ${r.commit_short ?? "ok"} (${r.duration_ms}ms)`);
      qc.invalidateQueries({ queryKey: ["vps-deploys"] });
      qc.invalidateQueries({ queryKey: ["vps-deploy-config"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const testSigMut = useMutation({
    mutationFn: () => testSigFn(),
    onSuccess: (r) => {
      if (r.ok) toast.success(`Assinatura OK (HTTP ${r.http_status}) — segredo confere.`);
      else toast.error(r.message);
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const canDeploy = repoReady && !!cfg?.webhook_url;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" /> Deploy automático na VPS
            </CardTitle>
            <CardDescription>
              Quando o código vai pro GitHub, a VPS atualiza sozinha via webhook.
              Aqui você configura o gatilho e dispara manualmente quando quiser.
            </CardDescription>
          </div>
          {cfg?.last_deploy_status && (
            <Badge
              variant="outline"
              className={
                cfg.last_deploy_status === "success"
                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-600 border-rose-500/30"
              }
            >
              Último: {cfg.last_deploy_status === "success" ? "ok" : "erro"}
              {cfg.last_deploy_at && ` · ${formatDateTimeBR(cfg.last_deploy_at)}`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>URL do webhook na VPS</Label>
            <Input
              placeholder="https://meudominio.com/deploy ou http://IP:PORTA/hook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Endpoint que sua VPS já escuta pra fazer <code>git pull</code> + restart.
            </p>
          </div>
          <div className="md:col-span-2">
            <Label>Segredo do webhook</Label>
            <Input
              type="password"
              autoComplete="off"
              placeholder={cfg?.has_secret ? `salvo: ${cfg.secret_preview ?? "***"}` : "deixe em branco se não usa"}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usado pra assinar a requisição com HMAC-SHA256 (formato webhook do GitHub).
              Deve ser igual ao <code>MULTIZAP_GITHUB_WEBHOOK_SECRET</code> da VPS.
              Deixe em branco aqui pra manter o que já está salvo.
            </p>
          </div>
          <div>
            <Label>Pasta destino na VPS (informativo)</Label>
            <Input
              placeholder="/root/multizap"
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
            />
          </div>
          <div>
            <Label>Processo PM2 (informativo)</Label>
            <Input
              placeholder="multizap"
              value={pm2Process}
              onChange={(e) => setPm2Process(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="text-sm font-medium">Deploy automático a cada push no GitHub</div>
            <div className="text-xs text-muted-foreground">
              Se sua VPS já faz git pull sozinha por webhook do próprio GitHub, deixe ligado.
            </div>
          </div>
          <Switch checked={autoDeploy} onCheckedChange={setAutoDeploy} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending ? "Salvando…" : "Salvar configuração"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => testSigMut.mutate()}
            disabled={!cfg?.webhook_url || !cfg?.has_secret || testSigMut.isPending}
            title="Manda um evento 'ping' assinado, sem deploy real, só pra confirmar o segredo."
          >
            {testSigMut.isPending ? "Testando…" : "Testar assinatura"}
          </Button>
          <Button onClick={() => deployMut.mutate()} disabled={!canDeploy || deployMut.isPending}>
            <Rocket className={`h-4 w-4 mr-2 ${deployMut.isPending ? "animate-pulse" : ""}`} />
            {deployMut.isPending ? "Disparando…" : "Fazer deploy agora"}
          </Button>
        </div>

        {!canDeploy && (
          <p className="text-xs text-muted-foreground">
            {!repoReady
              ? "Selecione e salve o repositório acima antes."
              : "Cole a URL do webhook e salve pra liberar o botão."}
          </p>
        )}

        {deploys && deploys.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">Últimos deploys</div>
              <div className="rounded border divide-y max-h-72 overflow-auto">
                {deploys.map((d) => (
                  <div key={d.id} className="p-2.5 text-sm flex items-start gap-3">
                    <div className="mt-0.5">
                      {d.status === "success"
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        : <XCircle className="h-4 w-4 text-rose-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs">
                          {d.commit_sha ? d.commit_sha.slice(0, 7) : "—"}
                          {d.http_status ? ` · HTTP ${d.http_status}` : ""}
                          {d.duration_ms ? ` · ${d.duration_ms}ms` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTimeBR(d.created_at)}
                        </span>
                      </div>
                      {d.response_message && (
                        <div className="text-xs text-muted-foreground break-words mt-0.5">
                          {d.response_message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type FlowStep = { key: string; label: string; status: "ok" | "error" | "warning" | "skipped" | "pending"; detail?: string };

function StepIcon({ status }: { status: FlowStep["status"] }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-rose-600" />;
  if (status === "warning") return <AlertCircle className="h-4 w-4 text-amber-600" />;
  if (status === "pending") return <Loader2 className="h-4 w-4 text-blue-600" />;
  return <AlertCircle className="h-4 w-4 text-muted-foreground/50" />;
}

function PublishAndDeployCard({ enabled }: { enabled: boolean }) {
  const qc = useQueryClient();
  const publishFn = useServerFn(runPublishAndDeploy);
  const commitFn = useServerFn(getRemoteCommit);
  const repairFn = useServerFn(repairQrWebhook);
  const diagFn = useServerFn(runGatewayDiagnostic);

  const [steps, setSteps] = useState<FlowStep[] | null>(null);

  const publishMut = useMutation({
    mutationFn: () => publishFn(),
    onMutate: () => setSteps([{ key: "starting", label: "Iniciando fluxo…", status: "pending" }]),
    onSuccess: (r) => {
      setSteps(r.steps);
      if (r.ok) toast.success(`Fluxo concluído em ${r.duration_ms}ms`);
      else toast.error("Fluxo terminou com erros — veja o checklist");
      qc.invalidateQueries({ queryKey: ["vps-deploys"] });
      qc.invalidateQueries({ queryKey: ["github-integration-logs"] });
    },
    onError: (e) => { setSteps(null); toast.error(friendlyError(e)); },
  });

  const commitMut = useMutation({
    mutationFn: () => commitFn(),
    onSuccess: (r) => {
      toast.success(`Remoto: ${r.remote_sha_short} · ${r.has_new_commit ? "novo" : "já deployado"}`);
      setSteps([
        { key: "repo", label: `Repo: ${r.repo}@${r.branch}`, status: "ok" },
        { key: "remote", label: `Commit remoto: ${r.remote_sha_short}`, status: "ok", detail: r.remote_message },
        { key: "deployed", label: `Último deployado: ${r.last_deployed_short ?? "—"}`, status: r.last_deployed_short ? "ok" : "warning", detail: r.last_deployed_at ?? undefined },
        { key: "new", label: r.has_new_commit ? "Há commit novo pra deployar" : "Sem commit novo", status: r.has_new_commit ? "ok" : "warning" },
      ]);
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const repairMut = useMutation({
    mutationFn: () => repairFn(),
    onSuccess: (r) => {
      const rAny = r as { ok: boolean; message?: string; connection_id?: string; connection_name?: string; applied_at?: string };
      if (!rAny.ok) {
        toast.warning(rAny.message ?? "Sem conexão QR ativa");
        setSteps([{ key: "qr", label: "Reparar webhook QR", status: "warning", detail: rAny.message }]);
      } else {
        toast.success("Webhook QR reaplicado");
        setSteps([{
          key: "qr", label: `Webhook reaplicado: ${rAny.connection_name ?? rAny.connection_id?.slice(0, 8)}`,
          status: "ok", detail: rAny.applied_at ? `às ${formatDateTimeBR(rAny.applied_at)}` : undefined,
        }]);
      }
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const diagMut = useMutation({
    mutationFn: () => diagFn(),
    onSuccess: (r) => { setSteps(r.steps); toast.success("Diagnóstico executado"); },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const busy = publishMut.isPending || commitMut.isPending || repairMut.isPending || diagMut.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" /> Publicar atualização e deployar
        </CardTitle>
        <CardDescription>
          Sincroniza o GitHub, dispara deploy na VPS, valida Gateway e reaplica webhook QR.
          Tudo guiado, com checklist e auditoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => publishMut.mutate()} disabled={!enabled || busy}>
            <Rocket className={`h-4 w-4 mr-2 ${publishMut.isPending ? "animate-pulse" : ""}`} />
            {publishMut.isPending ? "Executando…" : "Publicar + Deployar"}
          </Button>
        </div>

        {!enabled && (
          <p className="text-xs text-muted-foreground">
            Conecte o GitHub, salve um repositório e configure o webhook da VPS pra liberar.
          </p>
        )}

        <details className="group rounded-md border border-border/60 bg-muted/30">
          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-between">
            <span>Ações avançadas (diagnóstico e reparo)</span>
            <span className="text-[10px] opacity-60 group-open:hidden">use só em emergência</span>
          </summary>
          <div className="p-3 pt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => commitMut.mutate()} disabled={!enabled || busy}>
              <RefreshCw className={`h-4 w-4 mr-2 ${commitMut.isPending ? "animate-spin" : ""}`} />
              Verificar último commit
            </Button>
            <Button size="sm" variant="outline" onClick={() => repairMut.mutate()} disabled={busy}>
              <PlugZap className="h-4 w-4 mr-2" />
              Reparar webhook QR
            </Button>
            <Button size="sm" variant="outline" onClick={() => diagMut.mutate()} disabled={busy}>
              <Server className="h-4 w-4 mr-2" />
              Rodar diagnóstico
            </Button>
          </div>
        </details>


        {steps && (
          <div className="rounded border divide-y">
            {steps.map((s) => (
              <div key={s.key} className="p-2.5 text-sm flex items-start gap-3">
                <div className="mt-0.5"><StepIcon status={s.status} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{s.label}</div>
                  {s.detail && <div className="text-xs text-muted-foreground break-words mt-0.5">{s.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LogsCard() {
  const logsFn = useServerFn(listGithubIntegrationLogs);
  const { data: logs, isLoading } = useQuery({
    queryKey: ["github-integration-logs"],
    queryFn: () => logsFn(),
    refetchInterval: 10000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de integração</CardTitle>
        <CardDescription>Últimas 100 ações. Token nunca é registrado.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum log ainda.</div>
        ) : (
          <div className="max-h-96 overflow-auto rounded border divide-y">
            {logs.map((l) => (
              <div key={l.id} className="p-3 text-sm flex items-start gap-3">
                <div className="mt-0.5">
                  {l.status === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {l.status === "error" && <XCircle className="h-4 w-4 text-rose-600" />}
                  {l.status === "warning" && <AlertCircle className="h-4 w-4 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium">{l.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeBR(l.created_at)}
                    </span>
                  </div>
                  {l.message && (
                    <div className="text-muted-foreground mt-0.5 break-words">{l.message}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GithubDeployPanel() {
  const statusFn = useServerFn(getGithubIntegrationStatus);
  const { data: status, isLoading } = useQuery({
    queryKey: ["github-integration-status"],
    queryFn: () => statusFn(),
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Área restrita · Super Admin</AlertTitle>
        <AlertDescription>
          Integração <strong>global do sistema</strong>. Token nunca aparece no
          frontend, nunca é salvo no navegador e ações ficam registradas em log de auditoria.
        </AlertDescription>
      </Alert>

      <ConnectionCard status={status} isLoading={isLoading} />
      <RepositoryCard status={status} />
      <PublishAndDeployCard enabled={!!status?.repo_owner && !!status?.configured} />
      <details className="group rounded-lg border border-border bg-card/50">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-between">
          <span>Configurações avançadas de deploy (webhook da VPS)</span>
          <span className="text-xs opacity-60 group-open:hidden">já configurado · clique pra editar</span>
        </summary>
        <div className="p-4 pt-0">
          <VpsDeployCard repoReady={!!status?.repo_owner} />
        </div>
      </details>
      <LogsCard />

    </div>
  );
}
