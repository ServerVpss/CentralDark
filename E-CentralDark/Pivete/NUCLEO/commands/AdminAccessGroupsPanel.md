# COMANDO - AdminAccessGroupsPanel.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\access-groups\AdminAccessGroupsPanel.tsx
**SHA:** a57295c413ab051f
**Timestamp:** 2026-08-26T19:31:35.885715
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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
  
```