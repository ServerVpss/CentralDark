# COMANDO - admin.sistema.index.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.sistema.index.tsx
**SHA:** c17f93321e5e3ac3
**Timestamp:** 2026-08-26T19:31:50.696395
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const canStart = !active && hasNewCommits && !startM.isPending;

### Padroes
- <p className="text-xs text-muted-foreground">Mínimo 15s, máximo 10min. Padrão: 60s.</p>

### Riscos
- function RiskBadge({ risk }: { risk: "low" | "medium" | "high" | "none" }) {
- if (risk === "none") return <Badge variant="outline" className="bg-muted text-muted-foreground">Sem novidades</Badge>;
- if (risk === "high") return <Badge variant="outline" className="bg-red-500/10 text-red-600">Risco alto</Badge>;
- if (risk === "medium") return <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Risco médio</Badge>;
- {data && <RiskBadge risk={data.risk} />}
- {data?.risk === "high" && (
- <p className="font-medium text-foreground">Por que esse risco:</p>
- <RiskBadge risk={h.risk} />
- const blockedByRisk = !!analysis?.block_direct_update && !recentlyPromoted;

### Ouro Bruto (primeiros 5000 chars)
```
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

  if (isLoading) return <p className="text
```