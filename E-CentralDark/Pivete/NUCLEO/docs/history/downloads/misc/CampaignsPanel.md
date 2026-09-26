# OUTRO - CampaignsPanel.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\campaigns\CampaignsPanel.tsx
**SHA:** 9941f981ff3437af
**Timestamp:** 2026-08-26T19:31:45.438528
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = useServerFn(runCampaignNow);

### Ouro Bruto (primeiros 5000 chars)
```
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Plus, X, Play, Ban, Calendar, Users, AlertTriangle } from "lucide-react";
import { listCampaigns, createCampaign, cancelCampaign, runCampaignNow, type CampaignRow } from "@/lib/campaigns.functions";
import { listWhatsAppConnections } from "@/lib/whatsapp.functions";
import { listTemplates } from "@/lib/templates.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho", scheduled: "Agendada", running: "Enviando",
  paused: "Pausada", completed: "Concluída", canceled: "Cancelada", failed: "Falhou",
};
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-zinc-500", scheduled: "bg-blue-500", running: "bg-amber-500",
  paused: "bg-orange-500", completed: "bg-emerald-600", canceled: "bg-zinc-600", failed: "bg-red-600",
};

export function CampaignsPanel({ scope }: { scope: "workspace" | "admin" }) {
  const list = useServerFn(listCampaigns);
  const create = useServerFn(createCampaign);
  const cancel = useServerFn(cancelCampaign);
  const run = useServerFn(runCampaignNow);
  const connList = useServerFn(listWhatsAppConnections);
  const ws = useCurrentWorkspace();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", scope],
    queryFn: () => list({ data: { scope } }),
  });

  const { data: connData } = useQuery({
    queryKey: ["wa-connections-for-campaigns", ws.data?.id],
    queryFn: () => connList({ data: { workspaceId: ws.data!.id } }),
    enabled: scope === "workspace" && !!ws.data?.id,
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => { toast.success("Campanha cancelada"); qc.invalidateQueries({ queryKey: ["campaigns"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const runMut = useMutation({
    mutationFn: (id: string) => run({ data: { id } }),
    onSuccess: (r) => {
      toast.success(`Disparo iniciado: ${r.sent ?? 0} enviadas, ${r.failed ?? 0} falhas`);
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const campaigns = (data?.campaigns ?? []) as CampaignRow[];
  const stats = useMemo(() => ({
    total: campaigns.length,
    running: campaigns.filter((c) => c.status === "running").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    sent: campaigns.reduce((a, c) => a + (c.total_sent ?? 0), 0),
  }), [campaigns]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{scope === "admin" ? "Campanhas (todas as empresas)" : "Campanhas"}</h1>
          <p className="text-sm text-muted-foreground">
            Disparo em massa pelo WhatsApp · respeita janela de 24h e limite anti-ban.
          </p>
        </div>
        {scope === "workspace" && (
          <NewCampaignDialog
            connections={(connData ?? []).map((c) => ({ id: c.id, name: c.name, status: c.status }))}
            onCreated={() => qc.invalidateQueries({ queryKey: ["campaigns"] })}
            createFn={create}
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Agendadas</p><p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Enviando agora</p><p className="text-2xl font-bold text-amber-600">{stats.running}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Mensagens enviadas</p><p className="text-2xl font-bold text-emerald-600">{stats.sent}</p></Card>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground"><LoadingDots size="sm" labe
```