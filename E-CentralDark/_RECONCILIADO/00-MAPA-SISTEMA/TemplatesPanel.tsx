import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listTemplates, upsertTemplate, deleteTemplate, syncTemplatesFromMeta } from "@/lib/templates.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RefreshCw, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

type Scope = "workspace" | "admin";
type Tpl = Awaited<ReturnType<typeof listTemplates>>[number];

const STATUS_META: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  approved: { label: "Aprovado", icon: CheckCircle2, cls: "text-green-500" },
  pending: { label: "Em análise", icon: Clock, cls: "text-amber-500" },
  rejected: { label: "Rejeitado", icon: XCircle, cls: "text-destructive" },
  draft: { label: "Rascunho", icon: FileText, cls: "text-muted-foreground" },
};

export function TemplatesPanel({ workspaceId, scope = "workspace" }: { workspaceId?: string; scope?: Scope }) {
  const fnList = useServerFn(listTemplates);
  const fnUpsert = useServerFn(upsertTemplate);
  const fnDelete = useServerFn(deleteTemplate);
  const fnSync = useServerFn(syncTemplatesFromMeta);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tpl | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates", scope, workspaceId],
    queryFn: () => fnList({ data: { workspace_id: workspaceId, scope } }),
    enabled: scope === "admin" || !!workspaceId,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["wa-connections", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data } = await supabase.from("whatsapp_connections")
        .select("id, name, waba_id").eq("workspace_id", workspaceId!);
      // O token é validado no backend (server function de sync); aqui só checamos que a WABA foi configurada.
      return (data ?? []).filter((c) => c.waba_id);
    },
  });

  type UpsertPayload = { id?: string; workspace_id: string; name: string; language: string; category: "UTILITY" | "MARKETING" | "AUTHENTICATION"; body: string; header?: string | null; footer?: string | null; buttons: { type: string; text: string }[] };
  const upsert = useMutation({
    mutationFn: (data: UpsertPayload) => fnUpsert({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); setOpen(false); setEditing(null); toast.success("Template salvo"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => fnDelete({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); toast.success("Removido"); },
  });
  const sync = useMutation({
    mutationFn: (connId: string) => fnSync({ data: { workspace_id: workspaceId!, connection_id: connId } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success(`Sincronizado: ${r.imported} novos, ${r.updated} atualizados`);
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const stats = {
    total: templates.length,
    approved: templates.filter((t) => t.status === "approved").length,
    pending: templates.filter((t) => t.status === "pending").length,
    rejected: templates.filter((t) => t.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total" value={stats.total} />
        <Stat label="Aprovados" value={stats.approved} accent="text-green-500" />
        <Stat label="Em análise" value={stats.pending} accent="text-amber-500" />
        <Stat label="Rejeitados" value={stats.rejected} accent="text-destructive" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Modelos aprovados pela Meta. Necessários para falar com o cliente fora da janela de 24h.
        </p>
        {scope === "workspace" && workspaceId && (
          <div className="flex gap-2">
            {connections.length > 0 && (
              <Button size="sm" variant="outline" disabled={sync.isPending} onClick={() => sync.mutate(connections[0].id)}>
                <RefreshCw className={`mr-1 h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />
                Sincronizar com Meta
              </Button>
            )}
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Novo template</Button>
              </DialogTrigger>
              <TemplateDialog
                key={editing?.id ?? "new"}
                workspaceId={workspaceId}
                tpl={editing}
                onSubmit={(d) => upsert.mutate(d)}
                loading={upsert.isPending}
              />
            </Dialog>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>}
        {!isLoading && templates.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum template ainda. Cadastre um e envie pra Meta aprovar, ou sincronize os já aprovados.</p>
          </div>
        )}
        {templates.map((t) => {
          const meta = STATUS_META[t.status] ?? STATUS_META.draft;
          const Icon = meta.icon;
          return (
            <div key={t.id} className="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:border-primary/30">
              <div className={`mt-1 rounded-md bg-muted p-2 ${meta.cls}`}><Icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium font-mono text-sm">{t.name}</p>
                  <Badge variant="outline" className="text-[10px]">{t.language}</Badge>
                  <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{meta.label}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{t.body}</p>
                {t.rejection_reason && <p className="mt-1 text-xs text-destructive">Motivo: {t.rejection_reason}</p>}
              </div>
              {scope === "workspace" && (
                <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover template (apenas localmente, não exclui na Meta)?")) remove.mutate(t.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function TemplateDialog({ workspaceId, tpl, onSubmit, loading }: {
  workspaceId: string;
  tpl: Tpl | null;
  onSubmit: (d: { id?: string; workspace_id: string; name: string; language: string; category: "UTILITY" | "MARKETING" | "AUTHENTICATION"; body: string; header?: string | null; footer?: string | null; buttons: { type: string; text: string }[] }) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(tpl?.name ?? "");
  const [language, setLanguage] = useState(tpl?.language ?? "pt_BR");
  const [category, setCategory] = useState<"UTILITY" | "MARKETING" | "AUTHENTICATION">((tpl?.category as "UTILITY" | "MARKETING" | "AUTHENTICATION") ?? "UTILITY");
  const [body, setBody] = useState(tpl?.body ?? "");
  const [header, setHeader] = useState(tpl?.header ?? "");
  const [footer, setFooter] = useState(tpl?.footer ?? "");

  const submit = () => {
    if (!name.trim() || !body.trim()) { toast.error("Nome e corpo são obrigatórios"); return; }
    if (!/^[a-z0-9_]+$/.test(name)) { toast.error("Nome só pode ter letras minúsculas, números e _"); return; }
    onSubmit({
      id: tpl?.id, workspace_id: workspaceId, name: name.trim(), language, category, body: body.trim(),
      header: header.trim() || null, footer: footer.trim() || null, buttons: [],
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{tpl ? "Editar template" : "Novo template"}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Nome (identificador interno na Meta)</Label>
          <Input value={name} onChange={(e) => setName(e.target.value.toLowerCase())} placeholder="boas_vindas_cliente" disabled={!!tpl} />
          <p className="mt-1 text-xs text-muted-foreground">Apenas minúsculas, números e _. Não pode ser alterado depois.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pt_BR">Português (BR)</SelectItem>
                <SelectItem value="en_US">English (US)</SelectItem>
                <SelectItem value="es_ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as "UTILITY" | "MARKETING" | "AUTHENTICATION")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UTILITY">Utilidade (transacional)</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="AUTHENTICATION">Autenticação (OTP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Cabeçalho (opcional, máx 60)</Label>
          <Input value={header} onChange={(e) => setHeader(e.target.value)} maxLength={60} />
        </div>
        <div>
          <Label>Corpo da mensagem</Label>
          <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1024}
            placeholder="Olá {{1}}, seu pedido {{2}} foi confirmado!" />
          <p className="mt-1 text-xs text-muted-foreground">Use {`{{1}}, {{2}}`} para variáveis dinâmicas.</p>
        </div>
        <div>
          <Label>Rodapé (opcional, máx 60)</Label>
          <Input value={footer} onChange={(e) => setFooter(e.target.value)} maxLength={60} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
