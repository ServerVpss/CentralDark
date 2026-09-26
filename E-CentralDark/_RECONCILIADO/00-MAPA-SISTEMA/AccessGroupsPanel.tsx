// Painel de Grupos de Acesso (escopo workspace).
// - Lista de grupos com busca/paginação
// - Modal Criar/Editar
// - Modal Permissões (cards por categoria com checkboxes e "selecionar todos do grupo")
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { formatDateBR, formatTimeBR } from "@/lib/datetime";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { KeyRound, Pencil, Plus, Search, Trash2, Smartphone } from "lucide-react";
import {
  listAccessGroups,
  createAccessGroup,
  updateAccessGroup,
  deleteAccessGroup,
  getAccessGroupPermissions,
  setAccessGroupPermissions,
  getAccessGroupConnections,
  setAccessGroupConnections,
  listWorkspaceConnectionsForGroups,
  type AccessGroupRow,
} from "@/lib/access-groups.functions";

import { PERMISSION_GROUPS } from "@/lib/access-permissions";
import { LoadingDots } from "@/components/ui/loading-dots";


function formatDate(iso: string) {
  return `${formatDateBR(iso)} às ${formatTimeBR(iso)}`;
}

export function AccessGroupsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(listAccessGroups);
  const create = useServerFn(createAccessGroup);
  const update = useServerFn(updateAccessGroup);
  const remove = useServerFn(deleteAccessGroup);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["access-groups"],
    queryFn: () => list(),
  });

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AccessGroupRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [permsFor, setPermsFor] = useState<AccessGroupRow | null>(null);
  const [connsFor, setConnsFor] = useState<AccessGroupRow | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<AccessGroupRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  const createMut = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      create({ data: { name: data.name, description: data.description || null } }),
    onSuccess: () => {
      toast.success("Grupo criado");
      qc.invalidateQueries({ queryKey: ["access-groups"] });
      setCreating(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao criar"),
  });

  const updateMut = useMutation({
    mutationFn: (data: { id: string; name: string; description: string }) =>
      update({ data: { id: data.id, name: data.name, description: data.description || null } }),
    onSuccess: () => {
      toast.success("Grupo atualizado");
      qc.invalidateQueries({ queryKey: ["access-groups"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Grupo excluído");
      qc.invalidateQueries({ queryKey: ["access-groups"] });
      setConfirmDelete(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Grupos de Acesso</h2>
            <p className="text-sm text-muted-foreground">
              Crie cargos e defina exatamente o que cada atendente pode fazer.
            </p>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    <div className="flex justify-center py-2"><LoadingDots size="sm" /></div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum grupo cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">
                      {g.name}
                      {g.description ? (
                        <div className="text-xs text-muted-foreground">{g.description}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{g.permission_count}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(g.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Permissões"
                          onClick={() => setPermsFor(g)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="WhatsApps liberados"
                          onClick={() => setConnsFor(g)}
                        >
                          <Smartphone className="h-4 w-4" />
                        </Button>
                        <Button

                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => setEditing(g)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Excluir"
                          onClick={() => setConfirmDelete(g)}
                          disabled={g.is_system}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Mostrando {filtered.length} de {groups.length}
        </div>
      </Card>

      <EditDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          if (editing) {
            updateMut.mutate({ id: editing.id, ...values });
          } else {
            createMut.mutate(values);
          }
        }}
        saving={createMut.isPending || updateMut.isPending}
      />

      <PermissionsDialog
        group={permsFor}
        onClose={() => setPermsFor(null)}
      />

      <ConnectionsDialog
        group={connsFor}
        onClose={() => setConnsFor(null)}
      />


      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O grupo "{confirmDelete?.name}" será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && deleteMut.mutate(confirmDelete.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditDialog({
  open,
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  initial: AccessGroupRow | null;
  onClose: () => void;
  onSubmit: (v: { name: string; description: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // sincroniza ao abrir
  useMemo(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Grupo de Acesso" : "Novo Grupo de Acesso"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ag-name">Nome</Label>
            <Input
              id="ag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ex.: Suporte, Vendas"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ag-desc">Descrição</Label>
            <Textarea
              id="ag-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onSubmit({ name: name.trim(), description: description.trim() })}
            disabled={saving || !name.trim()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsDialog({
  group,
  onClose,
}: {
  group: AccessGroupRow | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const get = useServerFn(getAccessGroupPermissions);
  const set = useServerFn(setAccessGroupPermissions);

  const enabled = !!group;
  const { data: current = [] } = useQuery({
    queryKey: ["access-group-perms", group?.id],
    queryFn: () => get({ data: { id: group!.id } }),
    enabled,
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // hidrata seleção quando os dados chegam
  useMemo(() => {
    if (enabled) setSelected(new Set(current));
  }, [enabled, current.join("|")]);

  const toggleKey = (k: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const toggleGroup = (keys: string[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (checked) next.add(k);
        else next.delete(k);
      }
      return next;
    });

  const saveMut = useMutation({
    mutationFn: () => set({ data: { id: group!.id, keys: Array.from(selected) } }),
    onSuccess: () => {
      toast.success("Permissões atualizadas");
      qc.invalidateQueries({ queryKey: ["access-groups"] });
      qc.invalidateQueries({ queryKey: ["access-group-perms", group?.id] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  return (
    <Dialog open={enabled} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Permissões — {group?.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-2">
          {PERMISSION_GROUPS.map((pg) => {
            const groupKeys = pg.items.map((i) => i.key);
            const allChecked = groupKeys.every((k) => selected.has(k));
            const someChecked = groupKeys.some((k) => selected.has(k));
            return (
              <Card key={pg.key} className="p-4">
                <label className="flex cursor-pointer items-start gap-2">
                  <Checkbox
                    checked={allChecked ? true : someChecked ? "indeterminate" : false}
                    onCheckedChange={(c) => toggleGroup(groupKeys, c === true)}
                  />
                  <div>
                    <div className="font-medium">{pg.label}</div>
                    <div className="text-xs text-muted-foreground">{pg.description}</div>
                  </div>
                </label>
                <div className="mt-3 space-y-2 border-l pl-4">
                  {pg.items.map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-start gap-2">
                      <Checkbox
                        checked={selected.has(item.key)}
                        onCheckedChange={() => toggleKey(item.key)}
                      />
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConnectionsDialog({
  group,
  onClose,
}: {
  group: AccessGroupRow | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const listConns = useServerFn(listWorkspaceConnectionsForGroups);
  const getLinked = useServerFn(getAccessGroupConnections);
  const setLinked = useServerFn(setAccessGroupConnections);

  const enabled = !!group;

  const { data: conns = [], isLoading: loadingConns } = useQuery({
    queryKey: ["wa-connections-for-access-groups"],
    queryFn: () => listConns(),
    enabled,
  });


  const { data: linked = [], isLoading: loadingLinked } = useQuery({
    queryKey: ["access-group-conns", group?.id],
    queryFn: () => getLinked({ data: { id: group!.id } }),
    enabled,
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useMemo(() => {
    if (enabled) setSelected(new Set(linked));
  }, [enabled, linked.join("|")]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const saveMut = useMutation({
    mutationFn: () =>
      setLinked({ data: { id: group!.id, connectionIds: Array.from(selected) } }),
    onSuccess: () => {
      toast.success("WhatsApps atualizados");
      qc.invalidateQueries({ queryKey: ["access-group-conns", group?.id] });
      qc.invalidateQueries({ queryKey: ["access-groups"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const loading = loadingConns || loadingLinked;

  return (
    <Dialog open={enabled} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>WhatsApps liberados — {group?.name}</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground">
          Escolha quais números este grupo pode usar. Se nenhum for marcado, o
          grupo tem acesso a <strong>todos</strong> os números do workspace
          (comportamento padrão).
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingDots size="sm" />
            </div>
          ) : (conns as any[]).length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma conexão de WhatsApp cadastrada ainda.
            </div>
          ) : (
            (conns as any[]).map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/30"
              >
                <Checkbox
                  checked={selected.has(c.id)}
                  onCheckedChange={() => toggle(c.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{c.name ?? "Sem nome"}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.display_phone_number ?? c.phone ?? "—"}
                    {c.provider ? ` · ${c.provider}` : ""}
                    {c.status ? ` · ${c.status}` : ""}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
