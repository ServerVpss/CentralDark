import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  getWorkspaceControls,
  setWorkspaceControl,
  adminForceLogout,
  adminForceLogoutWorkspace,
  adminWorkspaceMembers,
  getWorkspaceControlHistory,
} from "@/lib/admin-controls.functions";
import { adminToggleWhiteLabel } from "@/lib/domains.functions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/workspaces/$workspaceId/controles")({
  component: Controles,
});

function Controles() {
  const { workspaceId } = Route.useParams();
  const qc = useQueryClient();
  const getCtrl = useServerFn(getWorkspaceControls);
  const setCtrl = useServerFn(setWorkspaceControl);
  const forceOne = useServerFn(adminForceLogout);
  const forceAll = useServerFn(adminForceLogoutWorkspace);
  const listMembers = useServerFn(adminWorkspaceMembers);
  const history = useServerFn(getWorkspaceControlHistory);

  const ctrlQ = useQuery({ queryKey: ["wctrl", workspaceId], queryFn: () => getCtrl({ data: { workspaceId } }) });
  const membersQ = useQuery({ queryKey: ["wctrl-members", workspaceId], queryFn: () => listMembers({ data: { workspaceId } }) });
  const histQ = useQuery({ queryKey: ["wctrl-hist", workspaceId], queryFn: () => history({ data: { workspaceId } }) });

  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (ctrlQ.data && !form) setForm(ctrlQ.data); }, [ctrlQ.data, form]);

  const save = useMutation({
    mutationFn: (patch: any) => setCtrl({ data: { workspaceId, patch } }),
    onSuccess: () => {
      toast.success("Salvo");
      qc.invalidateQueries({ queryKey: ["wctrl", workspaceId] });
      qc.invalidateQueries({ queryKey: ["wctrl-hist", workspaceId] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const logoutOne = useMutation({
    mutationFn: (userId: string) => forceOne({ data: { userId } }),
    onSuccess: () => toast.success("Sessão encerrada"),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const logoutAll = useMutation({
    mutationFn: () => forceAll({ data: { workspaceId } }),
    onSuccess: (r: any) => toast.success(`${r.count} sessões encerradas`),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (!form) return <div className="p-8 text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>;

  const setF = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const dirty = ctrlQ.data && JSON.stringify(form) !== JSON.stringify(ctrlQ.data);

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/workspaces" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3 mr-1" /> Voltar</Link>
          <h1 className="text-2xl font-bold mt-2 flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-red-500" /> Controle Remoto</h1>
          <p className="text-sm text-muted-foreground">Pause, bloqueie ou avise esta empresa em tempo real.</p>
        </div>
        <Button onClick={() => save.mutate(form)} disabled={!dirty || save.isPending}>
          <Save className="mr-2 h-4 w-4" /> Salvar alterações
        </Button>
      </div>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Pausar conta</h2>
        <p className="text-xs text-muted-foreground">Cliente continua logando, mas WhatsApp / IA / Campanhas param de enviar.</p>
        <div className="flex items-center justify-between">
          <Label>Conta pausada</Label>
          <Switch checked={form.is_paused} onCheckedChange={(v) => setF("is_paused", v)} />
        </div>
        <div>
          <Label>Motivo (visível no banner do cliente)</Label>
          <Input value={form.paused_reason ?? ""} onChange={(e) => setF("paused_reason", e.target.value || null)} placeholder="ex: inadimplência, uso indevido..." />
        </div>
      </section>

      <WhiteLabelSection workspaceId={workspaceId} />

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Bloqueios individuais</h2>
        <p className="text-xs text-muted-foreground">Trave recursos específicos sem pausar a conta inteira.</p>
        {[
          ["block_whatsapp_send", "Envio de WhatsApp", "Bloqueia toda saída de mensagem WhatsApp."],
          ["block_ai", "IA / Chatbot", "Desativa todos os agentes de IA da empresa."],
          ["block_campaigns", "Campanhas em massa", "Não permite criar nem disparar campanhas."],
          ["block_new_signups", "Cadastros novos", "Trava convite de agente e nova conexão WhatsApp."],
        ].map(([key, label, desc]) => (
          <div key={key} className="flex items-center justify-between border-t pt-3">
            <div>
              <Label className="text-sm">{label}</Label>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch checked={!!form[key as string]} onCheckedChange={(v) => setF(key as string, v)} />
          </div>
        ))}
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Status da assinatura</h2>
        <p className="text-xs text-muted-foreground">Define o banner automático e marca a conta para o financeiro.</p>
        <Select value={form.subscription_status} onValueChange={(v) => setF("subscription_status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="trialing">Em teste</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="past_due">Em atraso</SelectItem>
            <SelectItem value="expired">Vencida</SelectItem>
            <SelectItem value="suspended">Suspensa</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Banner personalizado</h2>
        <p className="text-xs text-muted-foreground">Aparece no topo do painel do cliente.</p>
        <div className="flex items-center justify-between">
          <Label>Mostrar banner</Label>
          <Switch checked={form.banner_enabled} onCheckedChange={(v) => setF("banner_enabled", v)} />
        </div>
        <div>
          <Label>Texto</Label>
          <Textarea value={form.banner_text ?? ""} onChange={(e) => setF("banner_text", e.target.value || null)} placeholder="Sua assinatura vence em 5 dias. Renove pelo PIX..." />
        </div>
        <div>
          <Label>Nível</Label>
          <Select value={form.banner_level} onValueChange={(v) => setF("banner_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Informativo (azul)</SelectItem>
              <SelectItem value="warning">Atenção (amarelo)</SelectItem>
              <SelectItem value="danger">Crítico (vermelho)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Forçar logout</h2>
          <Button variant="destructive" size="sm" onClick={() => logoutAll.mutate()} disabled={logoutAll.isPending}>
            <LogOut className="mr-2 h-4 w-4" /> Derrubar TODOS os usuários
          </Button>
        </div>
        <div className="divide-y">
          {(membersQ.data ?? []).map((m: any) => (
            <div key={m.user_id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{m.full_name ?? m.email}</p>
                <p className="text-xs text-muted-foreground">{m.email} · {m.role}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => logoutOne.mutate(m.user_id)} disabled={logoutOne.isPending}>
                <LogOut className="mr-1 h-3 w-3" /> Derrubar
              </Button>
            </div>
          ))}
          {membersQ.data?.length === 0 && <p className="text-sm text-muted-foreground py-3">Sem membros.</p>}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Histórico (últimas 20 ações master)</h2>
        <div className="divide-y text-sm">
          {(histQ.data ?? []).map((h: any) => (
            <div key={h.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{h.action}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTimeBR(h.created_at)}</span>
            </div>
          ))}
          {histQ.data?.length === 0 && <p className="text-muted-foreground py-2">Sem histórico.</p>}
        </div>
      </section>
    </div>
  );
}


function WhiteLabelSection({ workspaceId }: { workspaceId: string }) {
  const toggle = useServerFn(adminToggleWhiteLabel);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (enabled: boolean | null) => toggle({ data: { workspaceId, enabled } }),
    onSuccess: () => { toast.success("White-label atualizado"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });
  return (
    <section className="rounded-xl border bg-card p-6 space-y-3">
      <h2 className="font-semibold">White-label</h2>
      <p className="text-xs text-muted-foreground">Libera/bloqueia domínio próprio, favicon e remoção da marca MultiZap. Sobrescreve o plano.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="default" onClick={() => mut.mutate(true)}>Forçar liberado</Button>
        <Button size="sm" variant="destructive" onClick={() => mut.mutate(false)}>Forçar bloqueado</Button>
        <Button size="sm" variant="outline" onClick={() => mut.mutate(null)}>Seguir plano</Button>
      </div>
    </section>
  );
}
