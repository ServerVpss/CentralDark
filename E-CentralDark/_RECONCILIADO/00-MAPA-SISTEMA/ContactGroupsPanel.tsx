// Aba "Grupos de Contatos" — CRUD completo (criar / editar / excluir)
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, Search, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateBR } from "@/lib/datetime";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  listContactGroups,
  createContactGroup,
  updateContactGroup,
  deleteContactGroup,
} from "@/lib/contacts.functions";
import { LoadingDots } from "@/components/ui/loading-dots";

type Group = { id: string; name: string; description: string | null; created_at: string };

export function ContactGroupsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContactGroups);
  const createFn = useServerFn(createContactGroup);
  const updateFn = useServerFn(updateContactGroup);
  const deleteFn = useServerFn(deleteContactGroup);

  const { data = [], isLoading } = useQuery({
    queryKey: ["contact-groups"],
    queryFn: () => listFn(),
    refetchInterval: 15_000, // mantém em sincronia "ao vivo"
  });

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [toDelete, setToDelete] = useState<Group | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setOpen(true);
  };
  const openEdit = (g: Group) => {
    setEditing(g);
    setForm({ name: g.name, description: g.description ?? "" });
    setOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name.trim(), description: form.description.trim() || null };
      if (editing) return updateFn({ data: { id: editing.id, ...payload } });
      return createFn({ data: payload });
    },
    onSuccess: () => {
      toast.success(editing ? "Grupo atualizado" : "Grupo criado");
      setOpen(false);
      setEditing(null);
      setForm({ name: "", description: "" });
      qc.invalidateQueries({ queryKey: ["contact-groups"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Grupo excluído");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["contact-groups"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const filtered = data.filter((g) => !q || g.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Grupos de Contatos</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-3">
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">Mostrar</Label>
            <select className="h-9 rounded-md border bg-background px-2 text-sm">
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Buscar:</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-64 pl-9"
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Descrição</th>
              <th className="px-4 py-3 text-left">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhum dado disponível</td></tr>
            )}
            {filtered.map((g) => (
              <tr key={g.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{g.description ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateBR(g.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar grupo</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setToDelete(g)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir grupo</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Mostrando {filtered.length === 0 ? 0 : 1} a {filtered.length} de {data.length} registros
      </p>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar grupo de contatos" : "Novo grupo de contatos"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1 block text-xs">Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Descrição</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMut.mutate()} disabled={!form.name.trim() || saveMut.isPending}>
              {saveMut.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} — essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && deleteMut.mutate(toDelete.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
