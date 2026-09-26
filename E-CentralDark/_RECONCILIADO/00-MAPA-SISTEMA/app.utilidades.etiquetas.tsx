import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

export const Route = createFileRoute("/app/utilidades/etiquetas")({ component: Page });

const CORES = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#06b6d4","#ec4899","#64748b"];

type Etiqueta = { id: string; name: string; color: string; description: string | null; created_at: string };

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Etiqueta | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(CORES[0]);
  const [description, setDescription] = useState("");

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags", ws?.id],
    enabled: !!ws?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, color, description, created_at")
        .eq("workspace_id", ws!.id)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Etiqueta[];
    },
  });

  const reset = () => { setEditing(null); setName(""); setColor(CORES[0]); setDescription(""); };
  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (t: Etiqueta) => { setEditing(t); setName(t.name); setColor(t.color); setDescription(t.description ?? ""); setOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      if (!ws?.id) throw new Error("Sem workspace");
      if (!name.trim()) throw new Error("Nome obrigatório");
      if (editing) {
        const { error } = await supabase.from("tags").update({ name: name.trim(), color, description: description.trim() || null }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tags").insert({ workspace_id: ws.id, name: name.trim(), color, description: description.trim() || null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Etiqueta atualizada" : "Etiqueta criada");
      qc.invalidateQueries({ queryKey: ["tags", ws?.id] });
      setOpen(false); reset();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Etiqueta removida"); qc.invalidateQueries({ queryKey: ["tags", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Etiquetas</h1>
            <p className="text-xs text-muted-foreground">Categorize contatos e atendimentos por cor.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nova etiqueta</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar etiqueta" : "Nova etiqueta"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: VIP, Lead Quente, Sem resposta" /></div>
              <div>
                <Label>Cor</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CORES.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-background ${color === c ? "ring-2 ring-foreground" : ""}`}
                      style={{ backgroundColor: c }} aria-label={c} />
                  ))}
                </div>
              </div>
              <div><Label>Descrição (opcional)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : tags.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <Tag className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma etiqueta ainda.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Criar primeira etiqueta</Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((t) => (
              <div key={t.id} className="flex items-start justify-between rounded-lg border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <p className="truncate font-medium">{t.name}</p>
                  </div>
                  {t.description && <p className="mt-1 truncate text-xs text-muted-foreground">{t.description}</p>}
                </div>
                <div className="ml-2 flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Remover "${t.name}"?`)) remove.mutate(t.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
