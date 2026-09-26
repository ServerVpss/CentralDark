import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listGatewayCatalog,
  updateGatewayCatalogEntry,
  getGlobalPaymentSettings,
  updateGlobalPaymentSettings,
} from "@/lib/admin-payments.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CreditCard, Save, ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/sistema/gateways-pagamento")({
  component: AdminPaymentsPage,
});

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ativo: { label: "Funcional", variant: "default" },
  desativado: { label: "Desativado", variant: "secondary" },
  em_breve: { label: "Em breve", variant: "outline" },
  manutencao: { label: "Em manutenção", variant: "secondary" },
  bloqueado: { label: "Bloqueado", variant: "destructive" },
  pendente_adapter: { label: "Pendente de adapter", variant: "outline" },
};

function AdminPaymentsPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          Gateways e Pagamentos (Master)
        </h1>
        <p className="text-muted-foreground text-sm">
          Controle global de quais gateways estão disponíveis e quais recursos do módulo financeiro estão ligados em todo o SaaS.
        </p>
      </header>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="catalog">Catálogo Global</TabsTrigger>
          <TabsTrigger value="global">Configurações Globais</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog"><CatalogTab /></TabsContent>
        <TabsContent value="global"><GlobalSettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CatalogTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGatewayCatalog);
  const updateFn = useServerFn(updateGatewayCatalogEntry);
  const { data, isLoading } = useQuery({ queryKey: ["admin-gateway-catalog"], queryFn: () => listFn() });
  const update = useMutation({
    mutationFn: (vars: { provider_key: string; patch: Record<string, unknown> }) =>
      updateFn({ data: { provider_key: vars.provider_key, ...vars.patch } as never }),
    onSuccess: () => {
      toast.success("Atualizado");
      qc.invalidateQueries({ queryKey: ["admin-gateway-catalog"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(data?.items ?? []).map((g) => {
        const meta = STATUS_META[g.global_status] ?? STATUS_META.em_breve;
        return (
          <Card key={g.provider_key} className="bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {g.name}
                    {g.is_implemented ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-500" aria-label="Adapter pronto" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="Sem adapter" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">{g.provider_key}</CardDescription>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
              <div className="flex flex-wrap gap-1">
                {g.supports_pix && <Badge variant="outline" className="text-xs">PIX</Badge>}
                {g.supports_dynamic_qr && <Badge variant="outline" className="text-xs">QR dinâmico</Badge>}
                {g.supports_static_qr && <Badge variant="outline" className="text-xs">QR estático</Badge>}
                {g.supports_webhook && <Badge variant="outline" className="text-xs">Webhook</Badge>}
                {g.supports_refund && <Badge variant="outline" className="text-xs">Reembolso</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Status global</Label>
                  <Select
                    value={g.global_status}
                    onValueChange={(v) => update.mutate({ provider_key: g.provider_key, patch: { global_status: v } })}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo" disabled={!g.is_implemented}>Funcional</SelectItem>
                      <SelectItem value="em_breve">Em breve</SelectItem>
                      <SelectItem value="pendente_adapter">Pendente de adapter</SelectItem>
                      <SelectItem value="manutencao">Em manutenção</SelectItem>
                      <SelectItem value="desativado">Desativado</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end justify-end gap-2 pb-1">
                  <Label className="text-xs mr-2">Habilitado</Label>
                  <Switch
                    checked={g.enabled_globally}
                    onCheckedChange={(v) => update.mutate({ provider_key: g.provider_key, patch: { enabled_globally: v } })}
                  />
                </div>
              </div>

              {!g.is_implemented && (
                <p className="text-xs text-amber-500/80 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Adapter ainda não implementado — só pode aparecer como "em breve".
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const TOGGLES = [
  ["payments_module_enabled", "Módulo financeiro"],
  ["payments_pix_commands_enabled", "Comandos de PIX no chat"],
  ["payments_auto_collection_enabled", "Cobrança automática"],
  ["payments_cash_flow_enabled", "Fluxo de caixa"],
  ["payments_manual_confirmation_enabled", "Confirmação manual"],
  ["payments_reminders_enabled", "Régua de cobrança (lembretes)"],
  ["payments_customer_self_pix_enabled", "Cliente gera PIX sozinho"],
  ["payments_allow_workspace_override_limits", "Workspace pode sobrescrever limites"],
  ["payments_allow_workspace_custom_templates", "Workspace pode personalizar templates"],
  ["payments_pause_on_customer_reply", "Pausar cobrança se cliente responder"],
  ["payments_pause_on_agent_takeover", "Pausar cobrança se atendente assumir"],
  ["payments_allow_resend_after_expiration", "Permitir reenvio após expiração"],
  ["payments_require_admin_for_expired_regen", "Exigir aprovação para PIX expirado"],
  ["payments_manual_confirm_admin_only", "Confirmação manual só por admin"],
  ["payments_manual_confirm_require_reason", "Exigir motivo na confirmação manual"],
  ["payments_manual_confirm_require_proof", "Exigir comprovante na confirmação manual"],
  ["payments_allow_outside_business_hours", "Permitir cobrança fora do horário comercial"],
] as const;

const LIMITS = [
  ["payments_default_min_amount", "Valor mínimo (R$)", "number"],
  ["payments_default_max_amount", "Valor máximo (R$)", "number"],
  ["payments_default_pix_expiration_minutes", "Validade PIX (min)", "number"],
  ["payments_default_max_reminders_per_payment", "Máx. lembretes por cobrança", "number"],
  ["payments_default_max_reminders_per_day", "Máx. lembretes por dia", "number"],
  ["payments_default_min_interval_minutes", "Intervalo mínimo (min)", "number"],
  ["payments_default_business_hours_start", "Início horário comercial", "text"],
  ["payments_default_business_hours_end", "Fim horário comercial", "text"],
] as const;

const TEMPLATES = [
  ["payments_tpl_pix_generated", "PIX gerado"],
  ["payments_tpl_reminder", "Lembrete"],
  ["payments_tpl_last_warning", "Último aviso"],
  ["payments_tpl_pix_expired", "PIX expirado"],
  ["payments_tpl_payment_confirmed", "Pagamento confirmado"],
  ["payments_tpl_payment_not_found", "Pagamento não localizado"],
  ["payments_tpl_collection_paused", "Cobrança pausada"],
] as const;

function GlobalSettingsTab() {
  const qc = useQueryClient();
  const getFn = useServerFn(getGlobalPaymentSettings);
  const saveFn = useServerFn(updateGlobalPaymentSettings);
  const { data, isLoading } = useQuery({ queryKey: ["admin-global-payments"], queryFn: () => getFn() });
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const settings = (draft ?? data?.settings ?? {}) as Record<string, unknown>;

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) => saveFn({ data: patch as never }),
    onSuccess: () => {
      toast.success("Configurações globais salvas");
      qc.invalidateQueries({ queryKey: ["admin-global-payments"] });
      setDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string, v: unknown) => setDraft((d) => ({ ...((d ?? data?.settings ?? {}) as Record<string, unknown>), [k]: v }));

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Módulos e políticas</CardTitle>
          <CardDescription>Liga/desliga recursos do financeiro em todo o SaaS.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {TOGGLES.map(([k, label]) => (
            <label key={k} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{label}</span>
              <Switch checked={Boolean(settings[k])} onCheckedChange={(v) => set(k, v)} />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Limites padrão</CardTitle>
          <CardDescription>Usados quando o workspace não sobrescreve.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {LIMITS.map(([k, label, type]) => (
            <div key={k}>
              <Label className="text-xs">{label}</Label>
              <Input
                type={type}
                value={(settings[k] as string | number | undefined) ?? ""}
                onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates globais</CardTitle>
          <CardDescription>Variáveis: {"{nome}, {valor}, {pix_copia_e_cola}, {expira_em}, {empresa}"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {TEMPLATES.map(([k, label]) => (
            <div key={k}>
              <Label className="text-xs">{label}</Label>
              <Textarea
                rows={3}
                value={(settings[k] as string | undefined) ?? ""}
                onChange={(e) => set(k, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur p-3 flex justify-end border-t -mx-4 md:-mx-6">
        <Button onClick={() => draft && save.mutate(draft)} disabled={!draft || save.isPending}>
          <Save className="h-4 w-4 mr-2" /> Salvar alterações
        </Button>
      </div>
    </div>
  );
}
