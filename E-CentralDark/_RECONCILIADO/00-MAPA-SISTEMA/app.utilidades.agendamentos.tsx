import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/app/utilidades/agendamentos")({ component: Page });

type Sched = { id: string; title: string; notes: string | null; scheduled_at: string; status: "pending" | "done" | "cancelled"; assigned_to: string | null };

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [when, setWhen] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "done" | "cancelled">("pending");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["schedules", ws?.id, filter],
    enabled: !!ws?.id,
    queryFn: async () => {
      let q = supabase.from("schedules").select("id, title, notes, scheduled_at, status, assigned_to").eq("workspace_id", ws!.id).order("scheduled_at");
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Sched[];
    },
  });

  const reset = () => { setTitle(""); setNotes(""); setWhen(""); };
  const create = useMutation({
    mutationFn: async () => {
      if (!ws?.id) throw new Error("Sem workspace");
      if (!title.trim()) throw new Error("Título obrigatório");
      if (!when) throw new Error("Data e hora obrigatórias");
      const { error } = await supabase.from("schedules").insert({
        workspace_id: ws.id,
        title: title.trim(),
        notes: notes.trim() || null,
        scheduled_at: new Date(when).toISOString(),
        status: "pending",
        assigned_to: user?.id ?? null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Agendamento criado"); qc.invalidateQueries({ queryKey: ["schedules", ws?.id] }); setOpen(false); reset(); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "done" | "cancelled" }) => {
      const { error } = await supabase.from("schedules").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules", ws?.id] }),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["schedules", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const fmt = (s: string) => formatDateTimeBR(s, { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Agendamentos</h1>
            <p className="text-xs text-muted-foreground">Lembretes e tarefas com data e hora.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Novo agendamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo agendamento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Retornar pra cliente João" /></div>
              <div><Label>Quando</Label><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
              <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>{create.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex gap-1">
          {(["pending", "done", "cancelled", "all"] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "ghost"} onClick={() => setFilter(s)}>
              {s === "pending" ? "Pendentes" : s === "done" ? "Concluídos" : s === "cancelled" ? "Cancelados" : "Todos"}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum agendamento {filter === "all" ? "" : "nesse filtro"}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((s) => (
              <div key={s.id} className="flex items-start justify-between rounded-lg border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {s.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {s.status === "cancelled" && <XCircle className="h-4 w-4 text-zinc-500" />}
                    {s.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                    <p className="font-medium">{s.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{fmt(s.scheduled_at)}</p>
                  {s.notes && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{s.notes}</p>}
                </div>
                <div className="ml-2 flex shrink-0 gap-1">
                  {s.status !== "done" && <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: s.id, status: "done" })}>Concluir</Button>}
                  {s.status === "pending" && <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: s.id, status: "cancelled" })}>Cancelar</Button>}
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover?")) remove.mutate(s.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
