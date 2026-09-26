// Painel Master de Grupos de Acesso.
// Permite ao super_admin criar/editar/apagar/configurar grupos de QUALQUER empresa.
// Botão "Abrir como esta empresa" filtra a tela ao escopo daquela workspace.
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { KeyRound, Pencil, Plus, Search, Trash2, Smartphone, Users, Building2, X } from "lucide-react";
import { formatDateBR, formatTimeBR } from "@/lib/datetime";
import { LoadingDots } from "@/components/ui/loading-dots";
import { PERMISSION_GROUPS } from "@/lib/access-permissions";
import {
  adminListAccessGroups,
  adminListWorkspacesForGroups,
  adminListWorkspaceConnections,
  adminCreateAccessGroup,
  adminUpdateAccessGroup,
  adminDeleteAccessGroup,
  adminGetAccessGroupPermissions,
  adminSetAccessGroupPermissions,
  adminGetAccessGroupConnections,
  adminSetAccessGroupConnections,
  adminListAccessGroupUsers,
  type AdminAccessGroupRow,
} from "@/lib/admin-access-groups.functions";

function fmt(iso: string) { return `${formatDateBR(iso)} ${formatTimeBR(iso)}`; }

export function AdminAccessGroupsPanel() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { ws?: string };
  const wsFilter = search.ws ?? "";

  const listFn = useServerFn(adminListAccessGroups);
  const wsFn = useServerFn(adminListWorkspacesForGroups);
  const delFn = useServerFn(adminDeleteAccessGroup);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["admin", "access-groups"],
    queryFn: () => listFn(),
  });
  const { data: workspaces = [] } = useQuery({
    queryKey: ["admin", "access-groups", "workspaces"],
    queryFn: () => wsFn(),
  });

  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminAccessGroupRow | null>(null);
  const [permsFor, setPermsFor] = useState<AdminAccessGroupRow | null>(null);
  const [connsFor, setConnsFor] = useState<AdminAccessGroupRow | null>(null);
  const [usersFor, setUsersFor] = useState<AdminAccessGroupRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminAccessGroupRow | null>(null);

  const filtered = useMemo(() => {
    let rows = groups;
    if (wsFilter) rows = rows.filter((g) => g.workspace_id === wsFilter);
    const q = text.trim().toLowerCase();
    if (q) rows = rows.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      (g.workspace_name ?? "").toLowerCase().includes(q));
    return rows;
  }, [groups, wsFilter, text]);

  const currentWs = workspaces.find((w) => w.id === wsFilter);

  const deleteMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Grupo excluído");
      qc.invalidateQueries({ queryKey: ["admin", "access-groups"] });
      setConfirmDelete(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  function setWsFilter(id: string | "") {
    navigate({ to: "/admin/grupos-acesso", search: id ? { ws: id } : {} } as any);
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Gerenciar Grupos de Acesso (Master)</h2>
            <p className="text-sm text-muted-foreground">
              Crie, edite e configure grupos de qualquer empresa. Toda ação fica
              registrada no log de auditoria.
            </p>
            {currentWs && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs">
                <Building2 className="h-3.5 w-3.5" />
                <span>Vendo como: <strong>{currentWs.name}</strong></span>
                <button
                  onClick={() => setWsFilter("")}
                  className="ml-1 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  title="Voltar pra visão de todas as empresas"
                >
                  <X className="h-3 w-3" /> sair
                </button>
              </div>
            )}
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Novo grupo
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Buscar por grupo ou empresa..."
              className="pl-8"
            />
          </div>
          <Select value={wsFilter || "__all"} onValueChange={(v) => setWsFilter(v === "__all" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas as empresas</SelectItem>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>WhatsApps</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center"><div className="flex justify-center py-2"><LoadingDots size="sm" /></div></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum grupo encontrado.</TableCell></TableRow>
              ) : filtered.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{g.workspace_name ?? "—"}</span>
                      <button
                        onClick={() => setWsFilter(g.workspace_id)}
                        className="text-xs text-primary hover:underline"
                        title="Abrir como esta empresa (filtra a tela)"
                      >
                        Abrir
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {g.name}
                    {g.is_system && <Badge variant="outline" className="ml-2">sistema</Badge>}
                    {g.description && <div className="text-xs text-muted-foreground">{g.description}</div>}
                  </TableCell>
                  <TableCell><Badge variant="secondary">{g.permission_count}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{g.connection_count === 0 ? "Todos" : g.connection_count}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{g.user_count}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{fmt(g.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button size="icon" variant="ghost" title="Permissões" onClick={() => setPermsFor(g)}><KeyRound className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" title="WhatsApps" onClick={() => setConnsFor(g)}><Smartphone className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" title="Usuários" onClick={() => setUsersFor(g)}><Users className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" title="Editar" onClick={() => setEditing(g)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" title="Excluir" disabled={g.is_system} onClick={() => setConfirmDelete(g)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Mostrando {filtered.length} de {groups.length} grupos.
        </div>
      </Card>

      <EditDialog
        open={creating || !!editing}
        initial={editing}
        defaultWorkspaceId={wsFilter || null}
        workspaces={workspaces}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin", "access-groups"] });
          setCreating(false);
          setEditing(null);
        }}
      />

      <PermsDialog group={permsFor} onClose={() => setPermsFor(null)} />
      <ConnsDialog group={connsFor} onClose={() => setConnsFor(null)} />
      <UsersDialog group={usersFor} onClose={() => setUsersFor(null)} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo "{confirmDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Usuários vinculados a este grupo perderão suas permissões deste cargo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && deleteMut.mutate(confirmDelete.id)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============== Dialog: Criar/Editar ==============
function EditDialog({
  open, initial, defaultWorkspaceId, workspaces, onClose, onSaved,
}: {
  open: boolean;
  initial: AdminAccessGroupRow | null;
  defaultWorkspaceId: string | null;
  workspaces: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const createFn = useServerFn(adminCreateAccessGroup);
  const updateFn = useServerFn(adminUpdateAccessGroup);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setWorkspaceId(initial?.workspace_id ?? defaultWorkspaceId ?? "");
    }
  }, [open, initial, defaultWorkspaceId]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (initial) {
        return updateFn({ data: { id: initial.id, name: name.trim(), description: description.trim() || null } });
      }
      if (!workspaceId) throw new Error("Escolha a empresa");
      return createFn({ data: { workspaceId, name: name.trim(), description: description.trim() || null } });
    },
    onSuccess: () => { toast.success(initial ? "Grupo atualizado" : "Grupo criado"); onSaved(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar grupo" : "Novo grupo de acesso"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!initial && (
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger><SelectValue placeholder="Escolha a empresa" /></SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {initial && (
            <div className="text-xs text-muted-foreground">
              Empresa: <strong>{initial.workspace_name ?? "—"}</strong>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ex.: Suporte, Vendas" />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !name.trim() || (!initial && !workspaceId)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============== Dialog: Permissões ==============
function PermsDialog({ group, onClose }: { group: AdminAccessGroupRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetAccessGroupPermissions);
  const setFn = useServerFn(adminSetAccessGroupPermissions);
  const enabled = !!group;

  const { data: current = [] } = useQuery({
    queryKey: ["admin", "access-group-perms", group?.id],
    queryFn: () => getFn({ data: { id: group!.id } }),
    enabled,
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => { if (enabled) setSelected(new Set(current)); }, [enabled, current.join("|")]);

  const toggleKey = (k: string) => setSelected((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleGroup = (keys: string[], on: boolean) => setSelected((p) => { const n = new Set(p); for (const k of keys) on ? n.add(k) : n.delete(k); return n; });

  const saveMut = useMutation({
    mutationFn: () => setFn({ data: { id: group!.id, keys: Array.from(selected) } }),
    onSuccess: () => {
      toast.success("Permissões atualizadas");
      qc.invalidateQueries({ queryKey: ["admin", "access-groups"] });
      qc.invalidateQueries({ queryKey: ["admin", "access-group-perms", group?.id] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  return (
    <Dialog open={enabled} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Permissões — {group?.name} <span className="text-sm font-normal text-muted-foreground">({group?.workspace_name})</span></DialogTitle>
        </DialogHeader>
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-2">
          {PERMISSION_GROUPS.map((pg) => {
            const keys = pg.items.map((i) => i.key);
            const all = keys.every((k) => selected.has(k));
            const some = keys.some((k) => selected.has(k));
            return (
              <Card key={pg.key} className="p-4">
                <label className="flex cursor-pointer items-start gap-2">
                  <Checkbox checked={all ? true : some ? "indeterminate" : false} onCheckedChange={(c) => toggleGroup(keys, c === true)} />
                  <div>
                    <div className="font-medium">{pg.label}</div>
                    <div className="text-xs text-muted-foreground">{pg.description}</div>
                  </div>
                </label>
                <div className="mt-3 space-y-2 border-l pl-4">
                  {pg.items.map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-start gap-2">
                      <Checkbox checked={selected.has(item.key)} onCheckedChange={() => toggleKey(item.key)} />
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
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============== Dialog: WhatsApps ==============
function ConnsDialog({ group, onClose }: { group: AdminAccessGroupRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListWorkspaceConnections);
  const getFn = useServerFn(adminGetAccessGroupConnections);
  const setFn = useServerFn(adminSetAccessGroupConnections);
  const enabled = !!group;

  const { data: conns = [], isLoading: l1 } = useQuery({
    queryKey: ["admin", "ws-conns", group?.workspace_id],
    queryFn: () => listFn({ data: { workspaceId: group!.workspace_id } }),
    enabled,
  });
  const { data: linked = [], isLoading: l2 } = useQuery({
    queryKey: ["admin", "access-group-conns", group?.id],
    queryFn: () => getFn({ data: { id: group!.id } }),
    enabled,
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => { if (enabled) setSelected(new Set(linked)); }, [enabled, linked.join("|")]);

  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const saveMut = useMutation({
    mutationFn: () => setFn({ data: { id: group!.id, connectionIds: Array.from(selected) } }),
    onSuccess: () => {
      toast.success("WhatsApps atualizados");
      qc.invalidateQueries({ queryKey: ["admin", "access-groups"] });
      qc.invalidateQueries({ queryKey: ["admin", "access-group-conns", group?.id] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  return (
    <Dialog open={enabled} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>WhatsApps liberados — {group?.name} <span className="text-sm font-normal text-muted-foreground">({group?.workspace_name})</span></DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground">
          Se nenhum for marcado, o grupo tem acesso a <strong>todos</strong> os números da empresa.
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-2">
          {(l1 || l2) ? (
            <div className="flex justify-center py-6"><LoadingDots size="sm" /></div>
          ) : (conns as any[]).length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Nenhuma conexão cadastrada nesta empresa.</div>
          ) : (conns as any[]).map((c) => (
            <label key={c.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/30">
              <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.name ?? "Sem nome"}</div>
                <div className="text-xs text-muted-foreground">
                  {c.display_phone_number ?? c.phone ?? "—"}{c.provider ? ` · ${c.provider}` : ""}{c.status ? ` · ${c.status}` : ""}
                </div>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============== Dialog: Usuários ==============
function UsersDialog({ group, onClose }: { group: AdminAccessGroupRow | null; onClose: () => void }) {
  const getFn = useServerFn(adminListAccessGroupUsers);
  const enabled = !!group;
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "access-group-users", group?.id],
    queryFn: () => getFn({ data: { id: group!.id } }),
    enabled,
  });
  return (
    <Dialog open={enabled} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Usuários do grupo — {group?.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-6"><LoadingDots size="sm" /></div>
          ) : users.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Nenhum usuário vinculado a este grupo ainda.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.user_id}>
                    <TableCell>{u.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell>{u.is_active ? <Badge variant="secondary">sim</Badge> : <Badge variant="outline">não</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
