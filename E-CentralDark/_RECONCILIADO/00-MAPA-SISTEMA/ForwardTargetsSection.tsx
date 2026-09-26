import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Forward, Plus, Trash2, Pencil, FlaskConical, CheckCircle2, XCircle, Copy } from "lucide-react";
import {
  adminListForwardTargets,
  adminUpsertForwardTarget,
  adminDeleteForwardTarget,
  adminTestForwardTarget,
  type ForwardTarget,
} from "@/lib/webhook-forward.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export function ForwardTargetsSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListForwardTargets);
  const upsertFn = useServerFn(adminUpsertForwardTarget);
  const delFn = useServerFn(adminDeleteForwardTarget);
  const testFn = useServerFn(adminTestForwardTarget);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-forward-targets"],
    queryFn: () => listFn(),
  });

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ForwardTarget | null>(null);

  type UpsertVars = { id?: string; name: string; target_url: string; phone_number_id: string | null; secret?: string; active: boolean };
  const upsertM = useMutation({
    mutationFn: (vars: UpsertVars) => upsertFn({ data: vars }),
    onSuccess: () => {
      toast.success("Destino salvo.");
      setOpen(false); setEdit(null);
      qc.invalidateQueries({ queryKey: ["admin-forward-targets"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Destino removido."); qc.invalidateQueries({ queryKey: ["admin-forward-targets"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const testM = useMutation({
    mutationFn: (id: string) => testFn({ data: { id } }),
    onSuccess: (r) => r.ok
      ? toast.success(`Teste OK (HTTP ${r.status})`)
      : toast.error(`Teste falhou: HTTP ${r.status} — ${r.body}`),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Forward className="h-5 w-5 text-emerald-500" />
            Reenvio de webhook (espelhar pra outro sistema)
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Cada evento que a Meta manda pra cá é também copiado pras URLs abaixo.
            Útil pra manter um sistema antigo (n8n, outro Supabase) recebendo as mesmas mensagens.
            Deixe o telefone vazio pra reenviar de TODAS as conexões.
          </p>
        </div>
        <Button onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Novo destino
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">URL de destino</th>
              <th className="px-3 py-2 text-left">Telefone (filtro)</th>
              <th className="px-3 py-2 text-right">Enviados</th>
              <th className="px-3 py-2 text-right">Erros</th>
              <th className="px-3 py-2 text-left">Ativo</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>
            )}
            {!isLoading && (data ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                Nenhum destino cadastrado. Clique em "Novo destino" pra começar.
              </td></tr>
            )}
            {(data ?? []).map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2 font-medium">{t.name}</td>
                <td className="px-3 py-2 max-w-xs">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-mono text-xs">{t.target_url}</span>
                    <button onClick={() => { navigator.clipboard.writeText(t.target_url); toast.success("Copiado"); }}>
                      <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  {t.has_secret && <span className="text-[10px] text-emerald-500">🔐 com segredo</span>}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {t.phone_number_id || <span className="text-muted-foreground italic">todos</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-500">{t.forward_count}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className={t.error_count > 0 ? "text-red-500" : "text-muted-foreground"}>{t.error_count}</span>
                  {t.last_error && (
                    <div className="text-[10px] text-red-500/70 truncate max-w-[160px]" title={t.last_error}>
                      {t.last_error}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  {t.active ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => testM.mutate(t.id)} disabled={testM.isPending} title="Enviar payload de teste">
                      <FlaskConical className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEdit(t); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Remover "${t.name}"?`)) delM.mutate(t.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ForwardTargetDialog
        open={open}
        edit={edit}
        onClose={() => { setOpen(false); setEdit(null); }}
        onSubmit={(v) => upsertM.mutate(v)}
        pending={upsertM.isPending}
      />
    </div>
  );
}

function ForwardTargetDialog({
  open, edit, onClose, onSubmit, pending,
}: {
  open: boolean;
  edit: ForwardTarget | null;
  onClose: () => void;
  onSubmit: (v: { id?: string; name: string; target_url: string; phone_number_id: string | null; secret?: string; active: boolean }) => void;
  pending: boolean;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [url, setUrl] = useState(edit?.target_url ?? "");
  const [phone, setPhone] = useState(edit?.phone_number_id ?? "");
  const [secret, setSecret] = useState("");
  const [active, setActive] = useState(edit?.active ?? true);

  // reset state when opening
  useState(() => {
    setName(edit?.name ?? "");
    setUrl(edit?.target_url ?? "");
    setPhone(edit?.phone_number_id ?? "");
    setSecret("");
    setActive(edit?.active ?? true);
  });

  const submit = () => {
    if (!name.trim() || !url.trim()) { toast.error("Preencha nome e URL."); return; }
    onSubmit({
      id: edit?.id,
      name: name.trim(),
      target_url: url.trim(),
      phone_number_id: phone.trim() || null,
      secret: secret.trim() || undefined,
      active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{edit ? "Editar destino" : "Novo destino de reenvio"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome amigável</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Supabase antigo" />
          </div>
          <div>
            <Label>URL de destino (https)</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://outro-sistema.com/webhook" />
          </div>
          <div>
            <Label>Filtrar por telefone (phone_number_id) — opcional</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Vazio = reenvia de TODAS as conexões" />
            <p className="text-xs text-muted-foreground mt-1">
              Se preencher, só reenvia eventos desse número específico.
            </p>
          </div>
          <div>
            <Label>Segredo (opcional)</Label>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={edit?.has_secret ? "(deixe vazio pra manter o atual)" : "Pra assinar com HMAC-SHA256"} type="password" />
            <p className="text-xs text-muted-foreground mt-1">
              Se preenchido, vai como header <code>x-forward-signature: sha256=…</code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label className="!m-0 cursor-pointer" onClick={() => setActive(!active)}>Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
