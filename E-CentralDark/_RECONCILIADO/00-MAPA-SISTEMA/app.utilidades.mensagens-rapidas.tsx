import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Pencil, Trash2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

export const Route = createFileRoute("/app/utilidades/mensagens-rapidas")({ component: Page });

type QR = { id: string; shortcut: string; body: string; sector_id: string | null };

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QR | null>(null);
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["quick-replies", ws?.id],
    enabled: !!ws?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_replies")
        .select("id, shortcut, body, sector_id")
        .eq("workspace_id", ws!.id)
        .order("shortcut");
      if (error) throw error;
      return (data ?? []) as QR[];
    },
  });

  const reset = () => { setEditing(null); setShortcut(""); setBody(""); };
  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (q: QR) => { setEditing(q); setShortcut(q.shortcut); setBody(q.body); setOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      if (!ws?.id) throw new Error("Sem workspace");
      if (!shortcut.trim()) throw new Error("Atalho obrigatório");
      if (!body.trim()) throw new Error("Mensagem obrigatória");
      const sc = shortcut.trim().startsWith("/") ? shortcut.trim() : `/${shortcut.trim()}`;
      if (editing) {
        const { error } = await supabase.from("quick_replies").update({ shortcut: sc, body: body.trim() }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quick_replies").insert({ workspace_id: ws.id, shortcut: sc, body: body.trim() });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Mensagem atualizada" : "Mensagem criada");
      qc.invalidateQueries({ queryKey: ["quick-replies", ws?.id] });
      setOpen(false); reset();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quick_replies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removida"); qc.invalidateQueries({ queryKey: ["quick-replies", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const filtered = items.filter((q) => !filter || q.shortcut.toLowerCase().includes(filter.toLowerCase()) || q.body.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Mensagens Rápidas</h1>
            <p className="text-xs text-muted-foreground">Atalhos /comando pra responder no chat sem digitar tudo de novo. Variáveis: {"{nome}"}, {"{empresa}"}, {"{telefone}"}.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nova mensagem</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar mensagem" : "Nova mensagem rápida"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Atalho</Label>
                <Input value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="/ola" />
                <p className="mt-1 text-xs text-muted-foreground">Será adicionado a / no começo se faltar.</p>
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Olá {nome}, como posso te ajudar?" />
                <p className="mt-1 text-xs text-muted-foreground">Use {"{nome}"}, {"{empresa}"}, {"{telefone}"} pra personalizar.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Input placeholder="Buscar atalho ou mensagem..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-md" />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <Zap className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{items.length === 0 ? "Nenhuma mensagem rápida criada." : "Nenhuma mensagem encontrada com esse filtro."}</p>
            {items.length === 0 && <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Criar primeira</Button>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((q) => (
              <div key={q.id} className="flex items-start justify-between rounded-lg border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-semibold text-primary">{q.shortcut}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{q.body}</p>
                </div>
                <div className="ml-2 flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(q.body); toast.success("Copiado"); }}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Remover ${q.shortcut}?`)) remove.mutate(q.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
