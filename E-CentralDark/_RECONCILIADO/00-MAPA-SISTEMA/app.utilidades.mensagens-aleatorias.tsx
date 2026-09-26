import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shuffle, Plus, Pencil, Trash2, Copy, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

export const Route = createFileRoute("/app/utilidades/mensagens-aleatorias")({ component: Page });

type Grupo = { id: string; name: string; description: string | null; active: boolean };
type Variante = { id: string; group_id: string; body: string; sort_order: number };

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Grupo | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [novaVar, setNovaVar] = useState("");

  const { data: grupos = [], isLoading } = useQuery({
    queryKey: ["rmg", ws?.id],
    enabled: !!ws?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("random_message_groups")
        .select("id, name, description, active")
        .eq("workspace_id", ws!.id)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Grupo[];
    },
  });

  const { data: variantes = [] } = useQuery({
    queryKey: ["rmv", ws?.id],
    enabled: !!ws?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("random_message_variants")
        .select("id, group_id, body, sort_order")
        .eq("workspace_id", ws!.id)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Variante[];
    },
  });

  const reset = () => { setEditing(null); setName(""); setDescription(""); };
  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (g: Grupo) => { setEditing(g); setName(g.name); setDescription(g.description ?? ""); setOpen(true); };

  const saveGrupo = useMutation({
    mutationFn: async () => {
      if (!ws?.id) throw new Error("Sem workspace");
      if (!name.trim()) throw new Error("Nome obrigatório");
      if (editing) {
        const { error } = await supabase.from("random_message_groups").update({ name: name.trim(), description: description.trim() || null }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("random_message_groups").insert({ workspace_id: ws.id, name: name.trim(), description: description.trim() || null });
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editing ? "Grupo atualizado" : "Grupo criado"); qc.invalidateQueries({ queryKey: ["rmg", ws?.id] }); setOpen(false); reset(); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const toggleAtivo = useMutation({
    mutationFn: async (g: Grupo) => {
      const { error } = await supabase.from("random_message_groups").update({ active: !g.active }).eq("id", g.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rmg", ws?.id] }),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const removeGrupo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("random_message_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Grupo removido"); qc.invalidateQueries({ queryKey: ["rmg", ws?.id] }); qc.invalidateQueries({ queryKey: ["rmv", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const addVar = useMutation({
    mutationFn: async (group_id: string) => {
      if (!ws?.id) throw new Error("Sem workspace");
      if (!novaVar.trim()) throw new Error("Texto vazio");
      const max = Math.max(0, ...variantes.filter((v) => v.group_id === group_id).map((v) => v.sort_order));
      const { error } = await supabase.from("random_message_variants").insert({ workspace_id: ws.id, group_id, body: novaVar.trim(), sort_order: max + 1 });
      if (error) throw error;
    },
    onSuccess: () => { setNovaVar(""); qc.invalidateQueries({ queryKey: ["rmv", ws?.id] }); toast.success("Variação adicionada"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const removeVar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("random_message_variants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rmv", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Shuffle className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Mensagens Aleatórias</h1>
            <p className="text-xs text-muted-foreground">Grupos de variações pra disparo sem repetir texto e evitar bloqueio.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Novo grupo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar grupo" : "Novo grupo de variações"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Saudação inicial" /></div>
              <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => saveGrupo.mutate()} disabled={saveGrupo.isPending}>{saveGrupo.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : grupos.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <Shuffle className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum grupo criado ainda.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Criar primeiro grupo</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {grupos.map((g) => {
              const vs = variantes.filter((v) => v.group_id === g.id);
              const aberto = openId === g.id;
              return (
                <div key={g.id} className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between p-4">
                    <button className="flex flex-1 items-center gap-2 text-left" onClick={() => setOpenId(aberto ? null : g.id)}>
                      <ChevronDown className={`h-4 w-4 transition ${aberto ? "rotate-180" : ""}`} />
                      <div>
                        <p className="font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{vs.length} variação{vs.length === 1 ? "" : "ões"} · {g.description ?? "sem descrição"}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <Switch checked={g.active} onCheckedChange={() => toggleAtivo.mutate(g)} />
                      <Button size="icon" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Remover grupo "${g.name}" e todas variações?`)) removeGrupo.mutate(g.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {aberto && (
                    <div className="border-t p-4 space-y-2">
                      {vs.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma variação ainda.</p>}
                      {vs.map((v) => (
                        <div key={v.id} className="flex items-start justify-between gap-2 rounded border bg-background p-3">
                          <p className="flex-1 whitespace-pre-wrap text-sm">{v.body}</p>
                          <div className="flex shrink-0 gap-1">
                            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(v.body); toast.success("Copiada"); }}><Copy className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => removeVar.mutate(v.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Textarea value={novaVar} onChange={(e) => setNovaVar(e.target.value)} rows={2} placeholder="Nova variação..." />
                        <Button onClick={() => addVar.mutate(g.id)} disabled={addVar.isPending}>Adicionar</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
