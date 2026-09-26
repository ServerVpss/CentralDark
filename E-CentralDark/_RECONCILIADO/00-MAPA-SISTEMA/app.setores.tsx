import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/setores")({
  component: SectorsPage,
});

type Sector = {
  id: string;
  name: string;
  color: string | null;
  is_active: boolean;
  workspace_id: string;
  created_at: string;
};

function formatDateBR(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SectorsPage() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const isAdmin = ws?.role === "admin";

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<Sector | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ["sectors", ws?.id],
    enabled: !!ws,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors").select("*")
        .eq("workspace_id", ws!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Sector[];
    },
  });

  const filtered = useMemo(() => {
    return sectors.filter((s) => {
      if (statusFilter === "active" && !s.is_active) return false;
      if (statusFilter === "inactive" && s.is_active) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [sectors, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, filtered.length);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sectors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Setor removido");
      qc.invalidateQueries({ queryKey: ["sectors", ws?.id] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h1 className="text-lg font-semibold">Setor</h1>
          </div>

          <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <Button onClick={() => setCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status:</Label>
                <Select value={statusFilter} onValueChange={(v: "all" | "active" | "inactive") => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Buscar:</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar..."
                    className="w-64 pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Nome</th>
                  <th className="px-6 py-3 text-left font-medium">Cor</th>
                  <th className="px-6 py-3 text-left font-medium">Criado em</th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">Nenhum setor encontrado.</td></tr>
                ) : pageItems.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-6 py-4 font-medium uppercase">{s.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block rounded px-3 py-1 font-mono text-xs"
                        style={{ backgroundColor: s.color ?? "#3b82f6", color: "#000" }}
                      >
                        {(s.color ?? "#3b82f6").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDateBR(s.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => setEditing(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remover este setor?")) remove.mutate(s.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t px-6 py-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              Mostrando {showingFrom} a {showingTo} de {filtered.length} registros
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="default" size="icon">{page}</Button>
              <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {creating && ws && (
        <SectorDialog
          workspaceId={ws.id}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <SectorDialog
          workspaceId={editing.workspace_id}
          sector={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function SectorDialog({
  workspaceId,
  sector,
  onClose,
}: {
  workspaceId: string;
  sector?: Sector;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(sector?.name ?? "");
  const [color, setColor] = useState(sector?.color ?? "#04ff00");
  const [isActive, setIsActive] = useState(sector?.is_active ?? true);

  const save = useMutation({
    mutationFn: async () => {
      if (sector) {
        const { error } = await supabase.from("sectors")
          .update({ name, color, is_active: isActive })
          .eq("id", sector.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sectors").insert({
          workspace_id: workspaceId, name, color, is_active: isActive,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(sector ? "Setor atualizado" : "Setor criado");
      qc.invalidateQueries({ queryKey: ["sectors", workspaceId] });
      onClose();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sector ? "Editar Setor" : "Novo Setor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sec-name">Nome:</Label>
              <Input id="sec-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Vendas" />
            </div>
            <div className="space-y-2">
              <Label>Status:</Label>
              <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm">Cor:</Label>
            <span className="font-mono text-sm">{color.toUpperCase()}</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border bg-transparent"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
