import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAvailableGateways,
  listWorkspaceGateways,
  saveWorkspaceGateway,
  getWorkspacePaymentSettings,
  saveWorkspacePaymentSettings,
} from "@/lib/workspace-payments.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Clock, Lock, Star } from "lucide-react";

export const Route = createFileRoute("/app/configuracoes/pagamentos")({
  component: WorkspacePaymentsPage,
});

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ativo: { label: "Disponível", variant: "default" },
  em_breve: { label: "Em breve", variant: "outline" },
  pendente_adapter: { label: "Em breve", variant: "outline" },
  manutencao: { label: "Em manutenção", variant: "secondary" },
};

function WorkspacePaymentsPage() {
  const wsQuery = useCurrentWorkspace();
  const workspaceId = wsQuery.data?.id;

  if (!workspaceId) return <div className="p-6"><Skeleton className="h-64" /></div>;

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          Gateway de Pagamento
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure os gateways PIX para receber cobranças automáticas no atendimento.
        </p>
      </header>

      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança automática</TabsTrigger>
          <TabsTrigger value="templates">Mensagens</TabsTrigger>
        </TabsList>
        <TabsContent value="gateways"><GatewaysTab workspaceId={workspaceId} /></TabsContent>
        <TabsContent value="cobranca"><CollectionTab workspaceId={workspaceId} /></TabsContent>
        <TabsContent value="templates"><TemplatesTab workspaceId={workspaceId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function GatewaysTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const availFn = useServerFn(listAvailableGateways);
  const myFn = useServerFn(listWorkspaceGateways);
  const saveFn = useServerFn(saveWorkspaceGateway);

  const { data: avail, isLoading: l1 } = useQuery({ queryKey: ["available-gws"], queryFn: () => availFn() });
  const { data: mine, isLoading: l2 } = useQuery({
    queryKey: ["ws-gws", workspaceId],
    queryFn: () => myFn({ data: { workspace_id: workspaceId } }),
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ client_id: string; client_secret: string; environment: "production" | "sandbox"; webhook_url: string; webhook_secret: string; is_default: boolean }>({
    client_id: "", client_secret: "", environment: "production", webhook_url: "", webhook_secret: "", is_default: false,
  });

  const save = useMutation({
    mutationFn: () => saveFn({
      data: {
        workspace_id: workspaceId,
        provider_key: editing!,
        is_enabled: true,
        is_default: form.is_default,
        environment: form.environment,
        webhook_url: form.webhook_url || null,
        credentials: { client_id: form.client_id, client_secret: form.client_secret },
        webhook_secret: form.webhook_secret || null,
      },
    }),
    onSuccess: () => {
      toast.success("Gateway configurado");
      qc.invalidateQueries({ queryKey: ["ws-gws", workspaceId] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setDefault = useMutation({
    mutationFn: (provider_key: string) => saveFn({
      data: { workspace_id: workspaceId, provider_key, is_enabled: true, is_default: true, environment: "production" },
    }),
    onSuccess: () => {
      toast.success("Definido como padrão");
      qc.invalidateQueries({ queryKey: ["ws-gws", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const configured = useMemo(() => new Map((mine?.items ?? []).map((g) => [g.provider_key, g])), [mine]);

  if (l1 || l2) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Suas credenciais ficam protegidas</AlertTitle>
        <AlertDescription className="text-xs">
          Salvas com criptografia no backend. Nenhum token completo aparece aqui ou no histórico.
        </AlertDescription>
      </Alert>

      <div className="grid gap-3 md:grid-cols-2">
        {(avail?.items ?? []).map((g) => {
          const my = configured.get(g.provider_key);
          const meta = STATUS_META[g.global_status] ?? STATUS_META.em_breve;
          const usable = g.global_status === "ativo" && g.is_implemented;
          return (
            <Card key={g.provider_key} className="bg-card/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {g.name}
                      {my?.is_default && <Star className="h-4 w-4 text-amber-400 fill-amber-400" aria-label="Padrão" />}
                    </CardTitle>
                    {g.description && <CardDescription className="text-xs">{g.description}</CardDescription>}
                  </div>
                  <Badge variant={my?.is_enabled ? "default" : meta.variant}>
                    {my?.is_enabled ? "Conectado" : meta.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" disabled={!usable} onClick={() => { setEditing(g.provider_key); setForm({ client_id: "", client_secret: "", environment: "production", webhook_url: "", webhook_secret: "", is_default: !my?.is_default }); }}>
                  {my ? "Reconfigurar" : "Conectar"}
                </Button>
                {my?.is_enabled && !my.is_default && (
                  <Button size="sm" variant="outline" onClick={() => setDefault.mutate(g.provider_key)}>
                    <Star className="h-4 w-4 mr-1" /> Tornar padrão
                  </Button>
                )}
                {!usable && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Em breve neste plano
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar {editing}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Client ID</Label>
              <Input value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} />
            </div>
            <div>
              <Label>Client Secret</Label>
              <Input type="password" value={form.client_secret} onChange={(e) => setForm({ ...form, client_secret: e.target.value })} />
            </div>
            <div>
              <Label>Webhook URL (opcional)</Label>
              <Input value={form.webhook_url} onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Webhook Secret (opcional)</Label>
              <Input type="password" value={form.webhook_secret} onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })} />
            </div>
            <label className="flex items-center justify-between rounded-md border p-2">
              <span className="text-sm">Definir como gateway padrão</span>
              <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.client_id || !form.client_secret}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollectionTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const getFn = useServerFn(getWorkspacePaymentSettings);
  const saveFn = useServerFn(saveWorkspacePaymentSettings);
  const { data, isLoading } = useQuery({
    queryKey: ["ws-pay-settings", workspaceId],
    queryFn: () => getFn({ data: { workspace_id: workspaceId } }),
  });
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const s = (draft ?? data?.settings ?? {}) as Record<string, unknown>;
  const master = data?.master ?? ({} as Record<string, unknown>);
  const canOverrideLimits = Boolean(master.payments_allow_workspace_override_limits);

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) => saveFn({ data: { workspace_id: workspaceId, ...patch } as never }),
    onSuccess: () => {
      toast.success("Salvo");
      qc.invalidateQueries({ queryKey: ["ws-pay-settings", workspaceId] });
      setDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string, v: unknown) => setDraft((d) => ({ ...(d ?? data?.settings ?? {}), [k]: v }));

  if (isLoading) return <Skeleton className="h-96" />;
  if (!master.payments_auto_collection_enabled) {
    return <Alert><AlertTitle>Cobrança automática desativada no SaaS</AlertTitle><AlertDescription>Entre em contato com o administrador.</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Regras de cobrança</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            ["auto_collection_enabled", "Ativar cobrança automática"],
            ["pix_commands_enabled", "Permitir comandos PIX no chat"],
            ["customer_can_generate_pix", "Cliente pode gerar PIX"],
            ["auto_regenerate_expired_pix", "Gerar novo PIX após expirar"],
            ["require_admin_approval_after_expired", "Exigir aprovação admin"],
            ["business_hours_only", "Cobrar apenas em horário comercial"],
            ["stop_on_customer_reply", "Pausar se cliente responder"],
            ["stop_on_agent_takeover", "Pausar se atendente assumir"],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{label}</span>
              <Switch checked={Boolean(s[k])} onCheckedChange={(v) => set(k, v)} />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Limites</CardTitle>
          {!canOverrideLimits && <CardDescription className="text-amber-500">Limites travados pelo administrador master.</CardDescription>}
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            ["min_amount", "Valor mínimo (R$)", "number"],
            ["max_amount", "Valor máximo (R$)", "number"],
            ["pix_expiration_minutes", "Validade PIX (min)", "number"],
            ["max_reminders_per_payment", "Máx. lembretes / cobrança", "number"],
            ["max_reminders_per_day", "Máx. lembretes / dia", "number"],
            ["business_hours_start", "Horário inicial", "time"],
            ["business_hours_end", "Horário final", "time"],
          ].map(([k, label, type]) => (
            <div key={k}>
              <Label className="text-xs">{label}</Label>
              <Input
                disabled={!canOverrideLimits}
                type={type}
                value={(s[k] as string | number | undefined) ?? ""}
                onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => draft && save.mutate(draft)} disabled={!draft || save.isPending}>Salvar</Button>
      </div>
    </div>
  );
}

function TemplatesTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const getFn = useServerFn(getWorkspacePaymentSettings);
  const saveFn = useServerFn(saveWorkspacePaymentSettings);
  const { data, isLoading } = useQuery({
    queryKey: ["ws-pay-settings", workspaceId],
    queryFn: () => getFn({ data: { workspace_id: workspaceId } }),
  });
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const s = (draft ?? data?.settings ?? {}) as Record<string, string>;
  const master = data?.master ?? ({} as Record<string, unknown>);
  const canEdit = Boolean(master.payments_allow_workspace_custom_templates);

  const save = useMutation({
    mutationFn: (patch: Record<string, string>) => saveFn({ data: { workspace_id: workspaceId, ...patch } as never }),
    onSuccess: () => {
      toast.success("Templates salvos");
      qc.invalidateQueries({ queryKey: ["ws-pay-settings", workspaceId] });
      setDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  const fields: [string, string, string][] = [
    ["msg_pix_template", "PIX gerado", (master.payments_tpl_pix_generated as string) ?? ""],
    ["msg_reminder_template", "Lembrete", (master.payments_tpl_reminder as string) ?? ""],
    ["msg_expired_template", "PIX expirado", (master.payments_tpl_pix_expired as string) ?? ""],
    ["msg_paid_template", "Pagamento confirmado", (master.payments_tpl_payment_confirmed as string) ?? ""],
    ["msg_paused_template", "Cobrança pausada", (master.payments_tpl_collection_paused as string) ?? ""],
  ];

  return (
    <div className="space-y-4">
      {!canEdit && <Alert><AlertTitle>Personalização travada</AlertTitle><AlertDescription>O administrador master bloqueou alterações em templates.</AlertDescription></Alert>}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mensagens</CardTitle>
          <CardDescription className="text-xs">Variáveis: {"{nome}, {valor}, {pix_copia_e_cola}, {expira_em}, {empresa}"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {fields.map(([k, label, fallback]) => (
            <div key={k}>
              <Label className="text-xs">{label}</Label>
              <Textarea
                rows={3}
                disabled={!canEdit}
                placeholder={fallback}
                value={s[k] ?? ""}
                onChange={(e) => setDraft({ ...(draft ?? {}), [k]: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => draft && save.mutate(draft)} disabled={!draft || save.isPending || !canEdit}>Salvar</Button>
      </div>
    </div>
  );
}
