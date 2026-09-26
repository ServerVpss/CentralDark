// Página nova: /app/canais/meta — fluxo simplificado em 4 abas
// (Perfis → Números → Webhook → Diagnóstico). Substitui a ideia do
// formulão único pelo modelo "perfil + descoberta automática".
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Radio, Plus, Trash2, RefreshCw, Copy, Check, ChevronLeft,
  Eye, EyeOff, ShieldCheck, AlertTriangle, Loader2, Phone,
} from "lucide-react";
import { AddPhoneNumberWizard } from "@/components/whatsapp/AddPhoneNumberWizard";
import { PageScaffold } from "@/components/page-scaffold";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import {
  listMetaProfiles, createMetaProfile, deleteMetaProfile,
  listMetaProfileNumbers, importMetaPhoneNumber, requestPhoneRegistration,
  updateWebhookEvents, getConnectionBasics, runConnectionDiagnostic,
  updateConnectionSecurity,
} from "@/lib/meta-profiles.functions";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

const tabSchema = z.object({
  tab: z.enum(["perfis", "numeros", "webhook", "diagnostico"]).default("perfis").catch("perfis"),
  profile: z.string().optional(),
  connection: z.string().optional(),
});

export const Route = createFileRoute("/app/canais/meta")({
  validateSearch: (s) => tabSchema.parse(s),
  component: Page,
});

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/app/canais/meta" });

  const setTab = (tab: "perfis" | "numeros" | "webhook" | "diagnostico") =>
    navigate({ search: { ...search, tab } });

  return (
    <PageScaffold
      title="Conectar WhatsApp Meta"
      description="Crie um perfil com sua WABA, escolha o número e configure o webhook."
      icon={Radio}
      adminHref="/admin/whatsapp"
    >
      <div className="space-y-6 p-6">
        <Link
          to="/app/canais"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para Canais
        </Link>

        {!ws ? (
          <div className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando workspace" /></div>
        ) : (
          <Tabs value={search.tab} onValueChange={(v) => setTab(v as never)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="perfis">1. Perfis</TabsTrigger>
              <TabsTrigger value="numeros" disabled={!search.profile}>2. Números</TabsTrigger>
              <TabsTrigger value="webhook" disabled={!search.connection}>3. Webhook</TabsTrigger>
              <TabsTrigger value="diagnostico" disabled={!search.connection}>4. Diagnóstico</TabsTrigger>
            </TabsList>

            <TabsContent value="perfis" className="mt-6">
              <PerfisTab workspaceId={ws.id} onAccess={(id) => navigate({ search: { tab: "numeros", profile: id } })} />
            </TabsContent>
            <TabsContent value="numeros" className="mt-6">
              {search.profile ? (
                <NumerosTab
                  profileId={search.profile}
                  onSelected={(connId) => navigate({ search: { ...search, tab: "webhook" as const, connection: connId } })}
                />
              ) : (
                <Empty msg="Selecione um perfil primeiro." />
              )}
            </TabsContent>
            <TabsContent value="webhook" className="mt-6">
              {search.connection ? (
                <WebhookTab connectionId={search.connection} />
              ) : <Empty msg="Selecione um número primeiro." />}
            </TabsContent>
            <TabsContent value="diagnostico" className="mt-6">
              {search.connection ? (
                <DiagnosticoTab connectionId={search.connection} />
              ) : <Empty msg="Selecione um número primeiro." />}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageScaffold>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{msg}</div>;
}

// --------------------------------------------------------------------
// Tab 1: Perfis
// --------------------------------------------------------------------
function PerfisTab({ workspaceId, onAccess }: { workspaceId: string; onAccess: (id: string) => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMetaProfiles);
  const createFn = useServerFn(createMetaProfile);
  const delFn = useServerFn(deleteMetaProfile);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["meta-profiles", workspaceId],
    queryFn: () => listFn({ data: { workspaceId } }),
  });

  const [showToken, setShowToken] = useState(false);
  const [form, setForm] = useState({ name: "", waba_id: "", access_token: "" });

  const createM = useMutation({
    mutationFn: () => createFn({ data: { workspaceId, ...form } }),
    onSuccess: (r) => {
      if (r.existed) {
        toast.success("Essa WABA já está cadastrada. Abrimos o perfil existente para você.");
      } else {
        toast.success("Perfil salvo e validado com a Meta!");
      }
      qc.invalidateQueries({ queryKey: ["meta-profiles", workspaceId] });
      setForm({ name: "", waba_id: "", access_token: "" });
      onAccess(r.id);
    },
    onError: (e: Error) => {
      const msg = e.message ?? "";
      if (/duplicate key|whatsapp_meta_profiles_ws_waba_uq|já foi adicionada/i.test(msg)) {
        toast.error("Essa conta WhatsApp Business já foi adicionada. Use o perfil existente ou atualize o token.");
      } else {
        toast.error(msg || "Falha ao salvar o perfil.");
      }
    },
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Perfil removido.");
      qc.invalidateQueries({ queryKey: ["meta-profiles", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-[#0A1218] p-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Meus Perfis Meta</h3>
        <p className="text-sm text-muted-foreground">Cada perfil representa uma conta WhatsApp Business (WABA).</p>
        <div className="mt-4 space-y-3">
          {isLoading && <div className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>}
          {profiles?.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
              Nenhum perfil ainda. Crie o primeiro ao lado.
            </div>
          )}
          {profiles?.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/10 bg-[#0d1820] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">WABA: {p.waba_id}</div>
                  <div className="text-xs text-muted-foreground">Token: {p.access_token}</div>
                  {p.last_error && (
                    <div className="mt-1 text-xs text-red-400">{p.last_error}</div>
                  )}
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => onAccess(p.id)} className="bg-emerald-600 hover:bg-emerald-700">
                  Acessar
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  if (confirm(`Excluir perfil "${p.name}"?`)) delM.mutate(p.id);
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-[#0A1218] p-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Adicionar novo perfil</h3>
        <p className="text-sm text-muted-foreground">Informe os dados da sua WABA — vamos validar com a Meta na hora.</p>
        <div className="mt-4 space-y-3">
          <div>
            <Label className="text-xs">Nome do projeto</Label>
            <Input
              placeholder="Ex: Cliente X"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border-white/10 bg-[#070D12]"
            />
          </div>
          <div>
            <Label className="text-xs">WABA ID</Label>
            <Input
              placeholder="ID da Conta WhatsApp Business"
              value={form.waba_id}
              onChange={(e) => setForm({ ...form, waba_id: e.target.value.replace(/\D/g, "") })}
              className="border-white/10 bg-[#070D12]"
            />
          </div>
          <div>
            <Label className="text-xs">Access Token permanente</Label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                placeholder="Token Permanente"
                value={form.access_token}
                onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                className="border-white/10 bg-[#070D12] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Mostrar/ocultar token"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300/90">
            <strong className="text-emerald-300">App Secret é opcional.</strong> Com WABA ID + Token você já consegue criar
            o perfil, listar números, validar PIN e receber mensagens. Configure o App Secret depois, na aba <em>Webhook → Segurança avançada</em>, para validar a assinatura dos webhooks da Meta.
          </div>
          <Button
            onClick={() => createM.mutate()}
            disabled={createM.isPending || !form.name || !form.waba_id || !form.access_token}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {createM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Salvar e acessar
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Conectado", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    pending: { label: "Pendente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    invalid: { label: "Token inválido", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={cn("inline-flex rounded border px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>;
}

// --------------------------------------------------------------------
// Tab 2: Números
// --------------------------------------------------------------------
function NumerosTab({ profileId, onSelected }: { profileId: string; onSelected: (connectionId: string) => void }) {
  const listFn = useServerFn(listMetaProfileNumbers);
  const importFn = useServerFn(importMetaPhoneNumber);

  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ["meta-profile-numbers", profileId],
    queryFn: () => listFn({ data: { profileId } }),
  });

  const [pinFor, setPinFor] = useState<{ connectionId: string; phone: string } | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const importM = useMutation({
    mutationFn: (n: { phone_number_id: string; display_phone_number?: string | null; verified_name?: string | null }) =>
      importFn({
        data: {
          profileId,
          phone_number_id: n.phone_number_id,
          display_phone_number: n.display_phone_number ?? undefined,
          verified_name: n.verified_name ?? undefined,
        },
      }),
    onSuccess: (r) => {
      toast.success(r.created ? "Número importado!" : "Número já existia — vinculado ao perfil.");
      onSelected(r.connection_id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Números da sua WABA</h3>
          <p className="text-sm text-muted-foreground">Carregados automaticamente da Meta.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} /> Atualizar
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar número
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {(error as Error).message}
        </div>
      )}

      {isLoading && <div className="text-sm text-muted-foreground">Buscando números…</div>}

      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((n) => {
          const verified = n.code_verification_status === "VERIFIED";
          return (
            <div key={n.phone_number_id} className="rounded-xl border border-white/10 bg-[#0A1218] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    {n.verified_name ?? "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">{n.display_phone_number}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">ID: {n.phone_number_id}</div>
                  {n.quality_rating && (
                    <div className="text-xs text-muted-foreground">Qualidade: {n.quality_rating}</div>
                  )}
                </div>
                <span className={cn(
                  "inline-flex rounded border px-2 py-0.5 text-xs",
                  verified
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30",
                )}>
                  {verified ? "Conectado" : "Aguardando PIN"}
                </span>
              </div>
              <div className="mt-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-xs">
                {verified ? (
                  <span className="text-emerald-300">
                    → Próximo passo: <strong>configurar Webhook</strong> pra começar a receber mensagens.
                  </span>
                ) : (
                  <span className="text-amber-300">
                    → Próximo passo: <strong>validar com SMS ou ligação</strong> (código de 6 dígitos da Meta).
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => importM.mutate({
                    phone_number_id: n.phone_number_id,
                    display_phone_number: n.display_phone_number,
                    verified_name: n.verified_name,
                  })}
                  disabled={importM.isPending}
                >
                  {n.connection_id ? "Selecionar" : "Importar e selecionar"}
                </Button>
                {!verified && n.connection_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    onClick={() => setPinFor({ connectionId: n.connection_id!, phone: n.display_phone_number ?? "" })}
                    title="Só use se o número estiver pendente — não funciona em número já conectado."
                  >
                    Validar PIN
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed border-white/10 bg-[#0A1218] p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Quer cadastrar um número novo?</strong> Clique em <em>Adicionar número</em> acima — fazemos tudo por aqui (SMS, ligação, registro). Se a Meta não permitir, mostramos o atalho para o WhatsApp Manager.
      </div>

      <AddPhoneNumberWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        profileId={profileId}
        onConcluido={(connId) => { refetch(); onSelected(connId); }}
      />

      <ValidatePinDialog
        open={!!pinFor}
        onClose={() => setPinFor(null)}
        connectionId={pinFor?.connectionId ?? null}
        phone={pinFor?.phone ?? ""}
        onSuccess={() => { setPinFor(null); refetch(); }}
      />
    </div>
  );
}

function ValidatePinDialog({
  open, onClose, connectionId, phone, onSuccess,
}: {
  open: boolean; onClose: () => void;
  connectionId: string | null; phone: string;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const registerFn = useServerFn(requestPhoneRegistration);
  const m = useMutation({
    mutationFn: () => registerFn({ data: { connectionId: connectionId!, pin } }),
    onSuccess: () => {
      toast.success("Número ativado com sucesso!");
      setPin("");
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  useEffect(() => { if (!open) setPin(""); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" /> Validar PIN
          </DialogTitle>
          <DialogDescription>
            Insira o código de 6 dígitos recebido por SMS ou ligação no número <strong>{phone}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="text-center text-2xl tracking-[0.5em]"
          />
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={pin.length !== 6 || m.isPending}
            onClick={() => m.mutate()}
          >
            {m.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar Registro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------
// Tab 3: Webhook
// --------------------------------------------------------------------
const WEBHOOK_EVENTS: { id: string; title: string; desc: string }[] = [
  { id: "messages", title: "Mensagens", desc: "Recebimento de mensagens, status de entrega e leitura." },
  { id: "message_template_status_update", title: "Status de Templates", desc: "Mudanças na aprovação ou rejeição de modelos." },
  { id: "phone_number_quality_update", title: "Qualidade do Número", desc: "Alertas sobre a classificação de qualidade." },
  { id: "account_update", title: "Atualização da Conta", desc: "Mudanças nas configurações da WABA." },
  { id: "payment_configuration_update", title: "Faturamento", desc: "Alertas sobre crédito e pagamentos." },
  { id: "security", title: "Segurança", desc: "Notificações de segurança da conta." },
  { id: "account_review_update", title: "Revisão da Conta", desc: "Status de banimento ou restrição." },
];

function WebhookTab({ connectionId }: { connectionId: string }) {
  const qc = useQueryClient();
  const basicsFn = useServerFn(getConnectionBasics);
  const updateFn = useServerFn(updateWebhookEvents);

  const { data: conn } = useQuery({
    queryKey: ["conn-basics", connectionId],
    queryFn: () => basicsFn({ data: { connectionId } }),
  });

  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (conn) {
      const ev = (conn.selected_webhook_events ?? []) as unknown as string[];
      setSelected(Array.isArray(ev) && ev.length > 0 ? ev : ["messages"]);
    }
  }, [conn]);

  const callbackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/public/whatsapp/webhook/${connectionId}`
    : "";

  const saveM = useMutation({
    mutationFn: () => updateFn({ data: { connectionId, events: selected } }),
    onSuccess: () => {
      toast.success("Eventos salvos.");
      qc.invalidateQueries({ queryKey: ["conn-basics", connectionId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copiado!");
    setTimeout(() => setCopied(null), 1500);
  };

  const toggle = (id: string) =>
    setSelected((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="rounded-2xl border border-white/10 bg-[#0A1218] p-6 lg:col-span-3">
        <h3 className="text-lg font-semibold tracking-tight">Eventos do webhook</h3>
        <p className="text-sm text-muted-foreground">
          Selecione os eventos que quer receber. O <strong>messages</strong> é o essencial.
        </p>
        <div className="mt-4 grid gap-3">
          {WEBHOOK_EVENTS.map((ev) => (
            <label key={ev.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 hover:border-emerald-500/30">
              <Checkbox checked={selected.includes(ev.id)} onCheckedChange={() => toggle(ev.id)} />
              <div>
                <div className="text-sm font-medium">{ev.title}</div>
                <div className="text-xs text-muted-foreground">{ev.desc}</div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">{ev.id}</div>
              </div>
            </label>
          ))}
        </div>
        <Button onClick={() => saveM.mutate()} disabled={saveM.isPending} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          {saveM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar Configuração
        </Button>
      </section>

      <section className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl border border-white/10 bg-[#0A1218] p-6">
          <h3 className="text-lg font-semibold tracking-tight">Dados do Webhook</h3>
          <p className="text-sm text-muted-foreground">Cole estes valores no app da Meta.</p>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">Callback URL</Label>
              <div className="flex gap-2">
                <Input readOnly value={callbackUrl} className="border-white/10 bg-[#070D12] font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copy("url", callbackUrl)}>
                  {copied === "url" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Verify Token</Label>
              <div className="flex gap-2">
                <Input readOnly value={conn?.verify_token ?? ""} className="border-white/10 bg-[#070D12] font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copy("vt", conn?.verify_token ?? "")}>
                  {copied === "vt" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A1218] p-6 text-sm">
          <div className="font-medium">Última atividade</div>
          <div className="text-xs text-muted-foreground">
            {conn?.last_webhook_at
              ? formatDateTimeBR(conn.last_webhook_at)
              : "Nenhum evento recebido ainda. Envie um 'oi' para o número."}
          </div>
        </div>

        <SecurityAdvancedCard connectionId={connectionId} conn={conn} />
      </section>
    </div>
  );
}

function SecurityAdvancedCard({
  connectionId,
  conn,
}: {
  connectionId: string;
  conn: { has_app_secret?: boolean; webhook_signature_mode?: string | null } | undefined;
}) {
  const qc = useQueryClient();
  const updateFn = useServerFn(updateConnectionSecurity);
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [mode, setMode] = useState<"optional" | "required">(
    (conn?.webhook_signature_mode as "optional" | "required") ?? "optional",
  );
  useEffect(() => {
    if (conn?.webhook_signature_mode) setMode(conn.webhook_signature_mode as "optional" | "required");
  }, [conn?.webhook_signature_mode]);

  const saveM = useMutation({
    mutationFn: (payload: { app_secret?: string; webhook_signature_mode?: "optional" | "required"; clear_secret?: boolean }) =>
      updateFn({ data: { connectionId, ...payload } }),
    onSuccess: () => {
      toast.success("Segurança atualizada.");
      setSecret("");
      qc.invalidateQueries({ queryKey: ["conn-basics", connectionId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const has = !!conn?.has_app_secret;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A1218] p-6 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Validação de assinatura da Meta
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Opcional, porém recomendado. O App Secret permite validar a assinatura
            <span className="mx-1 font-mono">X-Hub-Signature-256</span> dos webhooks enviados pela Meta.
          </p>
        </div>
        <span className={cn(
          "inline-flex rounded border px-2 py-0.5 text-[10px]",
          has
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : "bg-amber-500/15 text-amber-400 border-amber-500/30",
        )}>
          {has ? "Configurado" : "Opcional"}
        </span>
      </div>

      {!open ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          onClick={() => setOpen(true)}
        >
          {has ? "Atualizar App Secret" : "Adicionar App Secret para segurança máxima"}
        </Button>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <Label className="text-xs">App Secret (Meta → Configurações → Básico)</Label>
            <Input
              type="password"
              placeholder={has ? "Cole para substituir o atual" : "Cole o App Secret aqui"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="border-white/10 bg-[#070D12] font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Modo de validação</Label>
            <div className="mt-1 grid gap-2">
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 p-2 hover:border-emerald-500/30">
                <input
                  type="radio"
                  checked={mode === "optional"}
                  onChange={() => setMode("optional")}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <div className="text-xs font-medium">Opcional (padrão)</div>
                  <div className="text-[11px] text-muted-foreground">
                    Aceita webhooks mesmo sem App Secret. Se houver, valida a assinatura.
                  </div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 p-2 hover:border-emerald-500/30">
                <input
                  type="radio"
                  checked={mode === "required"}
                  onChange={() => setMode("required")}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <div className="text-xs font-medium">Obrigatório</div>
                  <div className="text-[11px] text-muted-foreground">
                    Exige App Secret válido. Webhooks sem assinatura ou inválidos são rejeitados.
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={saveM.isPending || (mode === "required" && !has && secret.trim().length < 10)}
              onClick={() => saveM.mutate({
                app_secret: secret.trim().length >= 10 ? secret.trim() : undefined,
                webhook_signature_mode: mode,
              })}
            >
              {saveM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar segurança
            </Button>
            {has && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  if (confirm("Remover o App Secret? O modo voltará para opcional automaticamente.")) {
                    saveM.mutate({ clear_secret: true, webhook_signature_mode: "optional" });
                  }
                }}
              >
                <Trash2 className="mr-2 h-3 w-3" /> Remover App Secret
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setSecret(""); }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------
// Tab 4: Diagnóstico
// --------------------------------------------------------------------
function DiagnosticoTab({ connectionId }: { connectionId: string }) {
  const diagFn = useServerFn(runConnectionDiagnostic);
  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["meta-diagnostic", connectionId],
    queryFn: () => diagFn({ data: { connectionId } }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Diagnóstico da conexão</h3>
          <p className="text-sm text-muted-foreground">Checklist completo de saúde do número.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} /> Rodar de novo
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {(error as Error).message}
        </div>
      )}

      <div className="space-y-2">
        {data?.checks.map((c) => (
          <div key={c.key} className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#0A1218] p-4">
            <Dot status={c.status} />
            <div className="flex-1">
              <div className="text-sm font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">{c.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dot({ status }: { status: "ok" | "warn" | "error" }) {
  const map = {
    ok: { Icon: Check, cls: "text-emerald-400 bg-emerald-500/15" },
    warn: { Icon: AlertTriangle, cls: "text-amber-400 bg-amber-500/15" },
    error: { Icon: AlertTriangle, cls: "text-red-400 bg-red-500/15" },
  };
  const { Icon, cls } = map[status];
  return (
    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", cls)}>
      <Icon className="h-4 w-4" />
    </span>
  );
}
