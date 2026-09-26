// Página /app/contatos — réplica visual do Underchat
// Abas: Contatos / Grupos de Contatos
// Tabela: checkbox + avatar + Nome / Sobrenome / Apelido / Email /
// Telefone / Etiqueta / Atendente Responsável / Status / Data / Ações
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Plus,
  Upload,
  Download,
  Search,
  Edit2,
  Trash2,
  User as UserIcon,
  Users,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listContacts,
  deleteContact,
  listWorkspaceAgents,
  bulkDeleteContacts,
  bulkAssignContacts,
} from "@/lib/contacts.functions";
import { ContactImportDialog } from "@/components/contacts/ContactImportDialog";
import { ContactFormDialog } from "@/components/contacts/ContactFormDialog";
import { ContactGroupsPanel } from "@/components/contacts/ContactGroupsPanel";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/contatos")({ component: Page });

type ContactRow = Awaited<ReturnType<typeof listContacts>>[number];

function Page() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContacts);
  const agentsFn = useServerFn(listWorkspaceAgents);
  const deleteFn = useServerFn(deleteContact);
  const bulkDeleteFn = useServerFn(bulkDeleteContacts);
  const bulkAssignFn = useServerFn(bulkAssignContacts);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["app-contacts"],
    queryFn: () => listFn(),
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["workspace-agents"],
    queryFn: () => agentsFn(),
  });

  const [q, setQ] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("__all__");
  const [pageSize, setPageSize] = useState("10");
  const [pageNum, setPageNum] = useState(1);

  const [importOpen, setImportOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContactRow | null>(null);
  const [toDelete, setToDelete] = useState<ContactRow | null>(null);

  // ===== Seleção em lote =====
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkAssignee, setBulkAssignee] = useState<string>("__none__");
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return data.filter((c) => {
      const matchQ =
        !q ||
        (c.name ?? "").toLowerCase().includes(s) ||
        (c.last_name ?? "").toLowerCase().includes(s) ||
        (c.nickname ?? "").toLowerCase().includes(s) ||
        (c.phone ?? "").includes(q) ||
        (c.email ?? "").toLowerCase().includes(s);
      const matchAssignee =
        assigneeFilter === "__all__" || c.assignee_id === assigneeFilter;
      return matchQ && matchAssignee;
    });
  }, [data, q, assigneeFilter]);

  const size = parseInt(pageSize, 10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const pageItems = filtered.slice((pageNum - 1) * size, pageNum * size);

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((c) => selected.has(c.id));
  const toggleAllOnPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageItems.forEach((c) => (checked ? next.add(c.id) : next.delete(c.id)));
      return next;
    });
  };

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Contato excluído");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["app-contacts"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: () => bulkDeleteFn({ data: { ids: Array.from(selected) } }),
    onSuccess: (res) => {
      toast.success(`${res.deleted} contato(s) excluído(s)`);
      setBulkDeleteOpen(false);
      clearSelection();
      qc.invalidateQueries({ queryKey: ["app-contacts"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const bulkAssignMut = useMutation({
    mutationFn: () =>
      bulkAssignFn({
        data: {
          ids: Array.from(selected),
          assignee_id: bulkAssignee === "__none__" ? null : bulkAssignee,
        },
      }),
    onSuccess: (res) => {
      toast.success(`Atendente atribuído a ${res.updated} contato(s)`);
      setBulkAssignOpen(false);
      clearSelection();
      qc.invalidateQueries({ queryKey: ["app-contacts"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const exportCsv = () => {
    const header = [
      "Nome",
      "Sobrenome",
      "Apelido",
      "Email",
      "Telefone",
      "Etiqueta",
      "Atendente Responsável",
      "Status",
      "Data de Inscrição",
    ];
    const rows = filtered.map((c) => [
      c.name ?? "",
      c.last_name ?? "",
      c.nickname ?? "",
      c.email ?? "",
      c.phone ?? "",
      c.label ?? "",
      c.assignee_name ?? "",
      c.status,
      formatDateTimeBR(c.created_at),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-auto">
          <TabsTrigger
            value="contacts"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
          >
            <Users className="h-4 w-4" /> Contatos
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
          >
            <UsersRound className="h-4 w-4" /> Grupos De Contatos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Contatos</h2>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Mostrar</Label>
                <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPageNum(1); }}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Importar Contatos
              </Button>
              <Button variant="outline" onClick={exportCsv}>
                <Download className="mr-2 h-4 w-4" /> Exportar Para CSV
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Atendente responsável:</Label>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Selecione o atendente responsável</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Buscar:</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-64 pl-9"
                    placeholder="Buscar..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPageNum(1); }}
                  />
                </div>
              </div>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
              <span className="text-sm font-medium">
                {selected.size} contato(s) selecionado(s)
              </span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setBulkAssignee("__none__"); setBulkAssignOpen(true); }}>
                  Atribuir atendente
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir selecionados
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Limpar
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={(v) => toggleAllOnPage(Boolean(v))}
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <th className="px-3 py-3 w-12"></th>
                  <th className="px-3 py-3 text-left">Nome</th>
                  <th className="px-3 py-3 text-left">Sobrenome</th>
                  <th className="px-3 py-3 text-left">Apelido</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-left">Telefone</th>
                  <th className="px-3 py-3 text-left">Etiqueta</th>
                  <th className="px-3 py-3 text-left">Atendente Responsável</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Data de Inscrição</th>
                  <th className="px-3 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={12} className="p-8 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>
                )}
                {!isLoading && pageItems.length === 0 && (
                  <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">Nenhum dado disponível</td></tr>
                )}
                {pageItems.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={(v) => toggleOne(c.id, Boolean(v))}
                        aria-label={`Selecionar ${c.name ?? c.phone ?? c.id}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Avatar className="h-8 w-8">
                        {c.avatar_url ? <AvatarImage src={c.avatar_url} /> : null}
                        <AvatarFallback className="bg-muted">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-3 py-3 font-medium">{c.name ?? "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.last_name ?? "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.nickname ?? "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                    <td className="px-3 py-3">{c.phone ?? "—"}</td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary" className="text-muted-foreground">
                        {c.label ?? "-"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{c.assignee_name ?? "—"}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} blocked={c.blocked} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDateTimeBR(c.created_at, {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }).replace(", ", " às ")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setEditing(c); setFormOpen(true); }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Contato</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setToDelete(c)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir Contato</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {pageItems.length === 0 ? 0 : (pageNum - 1) * size + 1} to{" "}
              {(pageNum - 1) * size + pageItems.length} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={pageNum === 1} onClick={() => setPageNum(1)}>«</Button>
              <Button variant="outline" size="sm" disabled={pageNum === 1} onClick={() => setPageNum(pageNum - 1)}>‹</Button>
              <span className="px-3 text-sm">{pageNum}</span>
              <Button variant="outline" size="sm" disabled={pageNum >= totalPages} onClick={() => setPageNum(pageNum + 1)}>›</Button>
              <Button variant="outline" size="sm" disabled={pageNum >= totalPages} onClick={() => setPageNum(totalPages)}>»</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <ContactGroupsPanel />
        </TabsContent>
      </Tabs>

      <ContactImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={() => refetch()} />
      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editing}
        onSaved={() => refetch()}
      />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name ?? toDelete?.phone} — essa ação não pode ser desfeita.
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

      {/* Confirmar exclusão em lote */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selected.size} contato(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os contatos selecionados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); bulkDeleteMut.mutate(); }}
              disabled={bulkDeleteMut.isPending}
            >
              {bulkDeleteMut.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Atribuir atendente em lote */}
      <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir atendente a {selected.size} contato(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Atendente responsável</Label>
            <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem atendente</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkAssignOpen(false)}>Cancelar</Button>
            <Button onClick={() => bulkAssignMut.mutate()} disabled={bulkAssignMut.isPending}>
              {bulkAssignMut.isPending ? "Atribuindo..." : "Atribuir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status, blocked }: { status?: string | null; blocked?: boolean | null }) {
  if (blocked || status === "blocked") {
    return <Badge variant="destructive">Bloqueado</Badge>;
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/20">
        Pendente
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20">
      Ativo
    </Badge>
  );
}
