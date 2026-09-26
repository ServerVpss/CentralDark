import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  listWorkspaceUsers, createWorkspaceUser, updateWorkspaceUser, removeWorkspaceUser,
  getMemberBusinessHours, saveMemberBusinessHours,
  type WorkspaceUserRow, type BusinessHourRow,
} from "@/lib/workspace-users.functions";
import { listAccessGroups } from "@/lib/access-groups.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus, Pencil, Trash2, Clock, Eye, EyeOff, Search, Info, UserPlus, X,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { InvitesTab } from "@/components/users/InvitesTab";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/usuarios")({ component: UsersPage });

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function mask(value: string | null, type: "email" | "phone" | "doc") {
  if (!value) return "-";
  if (type === "email") {
    const [u, d] = value.split("@");
    if (!d) return value;
    return `${u.slice(0, 5)}${"*".repeat(Math.max(3, u.length - 5))}@${d}`;
  }
  if (type === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 4) return value;
    return digits.length > 10
      ? `(${digits.slice(0, 2)}) *****-${digits.slice(-4)}`
      : `**${digits.slice(-2)}`;
  }
  if (type === "doc") {
    const d = value.replace(/\D/g, "");
    if (d.length === 11) return `${d.slice(0, 3)}.***.***-${d.slice(-2)}`;
    if (d.length === 14) return `${d.slice(0, 2)}.***.***/****-${d.slice(-2)}`;
    return value;
  }
  return value;
}

function formatDateBR(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function UsersPage() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const isAdmin = ws?.role === "admin";

  const listFn = useServerFn(listWorkspaceUsers);
  const groupsFn = useServerFn(listAccessGroups);
  const removeFn = useServerFn(removeWorkspaceUser);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["ws-users", ws?.id],
    enabled: !!ws,
    queryFn: () => listFn(),
  });
  const { data: groups = [] } = useQuery({
    queryKey: ["access-groups", ws?.id],
    enabled: !!ws,
    queryFn: () => groupsFn(),
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-list", ws?.id],
    enabled: !!ws,
    queryFn: async () => {
      const { data, error } = await supabase.from("sectors")
        .select("id, name, color").eq("workspace_id", ws!.id).order("name");
      if (error) throw error;
      return data as { id: string; name: string; color: string | null }[];
    },
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-list", ws?.id],
    enabled: !!ws,
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_connections")
        .select("id, name").eq("workspace_id", ws!.id).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const [editing, setEditing] = useState<WorkspaceUserRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [bhUser, setBhUser] = useState<WorkspaceUserRow | null>(null);
  const [linkGroupUser, setLinkGroupUser] = useState<WorkspaceUserRow | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter === "active" && !u.is_active) return false;
      if (statusFilter === "inactive" && u.is_active) return false;
      if (groupFilter !== "all" && u.access_group_id !== groupFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(u.full_name?.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [users, statusFilter, groupFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const removeMut = useMutation({
    mutationFn: (uid: string) => removeFn({ data: { user_id: uid } }),
    onSuccess: () => { toast.success("Usuário removido"); qc.invalidateQueries({ queryKey: ["ws-users", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Atendentes</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>
          <TabsContent value="invites" className="mt-4"><InvitesTab /></TabsContent>
          <TabsContent value="users" className="mt-4">
        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h1 className="text-lg font-semibold">Usuários</h1>
          </div>

          <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>{[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
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
                <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Grupo de Acesso:</Label>
                <Select value={groupFilter} onValueChange={(v) => { setGroupFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Selecione o grupo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Buscar:</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..." className="w-60 pl-9" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Grupo de acesso</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Documento</th>
                  <th className="px-4 py-3 text-left font-medium">Criado em</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
                ) : pageItems.map((u) => {
                  const isOwn = reveal[u.user_id];
                  return (
                    <tr key={u.user_id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.avatar_url ?? undefined} />
                            <AvatarFallback>{(u.full_name ?? u.email)[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1.5">
                            {u.role === "admin" && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
                            <span className="font-medium">{u.full_name ?? "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.access_group_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        {u.is_active ? (
                          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">Ativo</span>
                        ) : (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Inativo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{isOwn ? u.email : mask(u.email, "email")}</span>
                          <button className="text-muted-foreground hover:text-foreground" onClick={() => setReveal((r) => ({ ...r, [u.user_id]: !r[u.user_id] }))}>
                            {isOwn ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{isOwn ? (u.phone ?? "-") : mask(u.phone, "phone")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{isOwn ? (u.document ?? "-") : mask(u.document, "doc")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDateBR(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" title="Vincular Grupo de Acesso" onClick={() => setLinkGroupUser(u)}>
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing(u)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" title="Horário de atendimento" onClick={() => setBhUser(u)}><Clock className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" title="Remover" onClick={() => { if (confirm("Remover este usuário do workspace?")) removeMut.mutate(u.user_id); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t px-6 py-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              Mostrando {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de {filtered.length} registros
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
          </TabsContent>
        </Tabs>
      </div>

      {creating && <UserDialog onClose={() => setCreating(false)} groups={groups} sectors={sectors} channels={channels} />}
      {editing && <UserDialog user={editing} onClose={() => setEditing(null)} groups={groups} sectors={sectors} channels={channels} />}
      {bhUser && <BusinessHoursDialog user={bhUser} onClose={() => setBhUser(null)} />}
      {linkGroupUser && <LinkGroupDialog user={linkGroupUser} groups={groups} onClose={() => setLinkGroupUser(null)} />}
    </div>
  );
}

function MultiSelectChips({
  options, value, onChange, placeholder, renderOption,
}: {
  options: { id: string; label: string; color?: string | null }[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  renderOption?: (opt: { id: string; label: string; color?: string | null }) => React.ReactNode;
}) {
  const selected = options.filter((o) => value.includes(o.id));
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm">
          {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
          {selected.map((o) => (
            <span key={o.id}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
              style={o.color ? { backgroundColor: o.color, color: "#000" } : { backgroundColor: "hsl(var(--muted))" }}>
              {o.label}
              <X className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); toggle(o.id); }} />
            </span>
          ))}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1">
        <div className="max-h-60 overflow-y-auto">
          {options.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">Nenhuma opção disponível.</p>}
          {options.map((o) => (
            <button key={o.id} type="button" onClick={() => toggle(o.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent ${value.includes(o.id) ? "bg-accent" : ""}`}>
              <input type="checkbox" readOnly checked={value.includes(o.id)} className="pointer-events-none" />
              {renderOption ? renderOption(o) : <span>{o.label}</span>}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LinkGroupDialog({
  user, groups, onClose,
}: { user: WorkspaceUserRow; groups: { id: string; name: string }[]; onClose: () => void }) {
  const qc = useQueryClient();
  const ws = useCurrentWorkspace().data;
  const updateFn = useServerFn(updateWorkspaceUser);
  const [groupId, setGroupId] = useState(user.access_group_id ?? "");

  const save = useMutation({
    mutationFn: () => updateFn({ data: { user_id: user.user_id, access_group_id: groupId || null } }),
    onSuccess: () => {
      toast.success("Grupo vinculado");
      qc.invalidateQueries({ queryKey: ["ws-users", ws?.id] });
      onClose();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular Grupo de Acesso</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Grupo de Acesso:</Label>
          <Select value={groupId || "none"} onValueChange={(v) => setGroupId(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Selecione o grupo de acesso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem grupo</SelectItem>
              {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const TABS = ["dados", "permissoes", "info", "endereco"] as const;
type TabKey = typeof TABS[number];

function UserDialog({
  user, onClose, groups, sectors, channels,
}: {
  user?: WorkspaceUserRow;
  onClose: () => void;
  groups: { id: string; name: string }[];
  sectors: { id: string; name: string; color: string | null }[];
  channels: { id: string; name: string }[];
}) {
  const qc = useQueryClient();
  const ws = useCurrentWorkspace().data;
  const createFn = useServerFn(createWorkspaceUser);
  const updateFn = useServerFn(updateWorkspaceUser);

  const [tab, setTab] = useState<TabKey>("dados");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [ddi, setDdi] = useState(user?.ddi ?? "+55");
  const [document, setDocument] = useState(user?.document ?? "");
  const [documentType, setDocumentType] = useState(user?.document_type ?? "");
  const [birthDate, setBirthDate] = useState(user?.birth_date ?? "");
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [role, setRole] = useState<"admin" | "agent">(user?.role === "admin" ? "admin" : "agent");
  const [accessGroupId, setAccessGroupId] = useState<string>(user?.access_group_id ?? "");
  const [sectorIds, setSectorIds] = useState<string[]>(user?.sector_ids ?? []);
  const [channelIds, setChannelIds] = useState<string[]>(user?.channel_ids ?? []);
  const [country, setCountry] = useState(user?.country ?? "");
  const [cep, setCep] = useState(user?.cep ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [addressComplement, setAddressComplement] = useState(user?.address_complement ?? "");
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const idx = TABS.indexOf(tab);
  const goPrev = () => setTab(TABS[Math.max(0, idx - 1)]);
  const goNext = () => setTab(TABS[Math.min(TABS.length - 1, idx + 1)]);

  const save = useMutation({
    mutationFn: async () => {
      if (password && password !== password2) throw new Error("Senhas não conferem");
      const common = {
        full_name: fullName,
        last_name: lastName || null,
        phone: phone || null,
        ddi: ddi || null,
        document: document || null,
        document_type: documentType || null,
        birth_date: birthDate || null,
        country: country || null,
        cep: cep || null,
        state: state || null,
        city: city || null,
        address: address || null,
        address_complement: addressComplement || null,
        neighborhood: neighborhood || null,
        is_active: isActive,
        role,
        access_group_id: accessGroupId || null,
        sector_ids: sectorIds,
        channel_ids: channelIds,
      };
      if (user) {
        return updateFn({ data: { user_id: user.user_id, ...common, new_password: password || undefined } });
      }
      if (!password || password.length < 8) throw new Error("Senha mínima de 8 caracteres");
      return createFn({ data: {
        email, password,
        full_name: fullName,
        phone: phone || null,
        document: document || null,
        access_group_id: accessGroupId || null,
        is_active: isActive, role,
      }});
    },
    onSuccess: () => {
      toast.success(user ? "Usuário atualizado" : "Usuário criado");
      qc.invalidateQueries({ queryKey: ["ws-users", ws?.id] });
      onClose();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Dados do Usuário</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            <TabsTrigger value="info">Informações Adicionais</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome:</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Email:</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} />
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
              <div className="space-y-2">
                <Label>{user ? "Nova senha (opcional):" : "Senha:"}</Label>
                <div className="relative">
                  <Input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPwd((v) => !v)}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmar senha:</Label>
                <Input type={showPwd ? "text" : "password"} value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Confirmar senha" />
              </div>
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Requisitos de Senha:</p>
              <ul className="ml-4 mt-1 list-disc space-y-0.5">
                <li>Mínimo de 8 caracteres</li>
                <li>Pelo menos um caractere minúsculo</li>
                <li>Pelo menos um número, símbolo ou caractere de espaço em branco</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="permissoes" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Grupo de Acesso:</Label>
                <Select value={accessGroupId || "none"} onValueChange={(v) => setAccessGroupId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Sem grupo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem grupo</SelectItem>
                    {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Setor:</Label>
                <MultiSelectChips
                  placeholder="Selecione setores"
                  value={sectorIds}
                  onChange={setSectorIds}
                  options={sectors.map((s) => ({ id: s.id, label: s.name, color: s.color }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Canais:</Label>
                <MultiSelectChips
                  placeholder="Selecione canais"
                  value={channelIds}
                  onChange={setChannelIds}
                  options={channels.map((c) => ({ id: c.id, label: c.name }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Papel:</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Atendente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>DDI:</Label>
                <Select value={ddi || "+55"} onValueChange={setDdi}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+55">Brasil (+55)</SelectItem>
                    <SelectItem value="+1">Estados Unidos (+1)</SelectItem>
                    <SelectItem value="+351">Portugal (+351)</SelectItem>
                    <SelectItem value="+54">Argentina (+54)</SelectItem>
                    <SelectItem value="+34">Espanha (+34)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Telefone:</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(84) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label>Nome:</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome" />
              </div>
              <div className="space-y-2">
                <Label>Sobrenome:</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Documento:</Label>
                <Select value={documentType || "none"} onValueChange={(v) => setDocumentType(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Tipo de Documento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="rg">RG</SelectItem>
                    <SelectItem value="passport">Passaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento:</Label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Documento:</Label>
                <Input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="CPF / CNPJ" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endereco" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>País:</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="País" />
              </div>
              <div className="space-y-2">
                <Label>CEP:</Label>
                <Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="CEP" />
              </div>
              <div className="space-y-2">
                <Label>Estado:</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" />
              </div>
              <div className="space-y-2">
                <Label>Cidade:</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" />
              </div>
              <div className="space-y-2">
                <Label>Endereço:</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço" />
              </div>
              <div className="space-y-2">
                <Label>Complemento:</Label>
                <Input value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} placeholder="Complemento" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bairro:</Label>
                <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {idx > 0 && <Button type="button" variant="outline" onClick={goPrev}>Anterior</Button>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            {idx < TABS.length - 1 ? (
              <Button type="button" onClick={goNext}>Próximo</Button>
            ) : (
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Salvando..." : (user ? "Salvar" : "Criar")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function BusinessHoursDialog({ user, onClose }: { user: WorkspaceUserRow; onClose: () => void }) {
  const qc = useQueryClient();
  const ws = useCurrentWorkspace().data;
  const getFn = useServerFn(getMemberBusinessHours);
  const saveFn = useServerFn(saveMemberBusinessHours);

  const [enabled, setEnabled] = useState(user.business_hours_enabled);
  const [rows, setRows] = useState<{ day_of_week: number; start_time: string; end_time: string }[]>([]);

  const { data } = useQuery({
    queryKey: ["bh", user.user_id],
    queryFn: () => getFn({ data: { user_id: user.user_id } }),
  });

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled);
      setRows(data.hours.map((h: BusinessHourRow) => ({
        day_of_week: h.day_of_week,
        start_time: h.start_time.slice(0, 5),
        end_time: h.end_time.slice(0, 5),
      })));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { user_id: user.user_id, enabled, hours: rows } }),
    onSuccess: () => {
      toast.success("Horários salvos");
      qc.invalidateQueries({ queryKey: ["ws-users", ws?.id] });
      qc.invalidateQueries({ queryKey: ["bh", user.user_id] });
      onClose();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Horário de atendimento</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">As regras abaixo seguem o fuso horário America/Sao_Paulo.</p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Label>Ativar horário de atendimento</Label>
          </div>
          <Button size="sm" disabled={!enabled} onClick={() => setRows((r) => [...r, { day_of_week: 1, start_time: "09:00", end_time: "18:00" }])}>
            Adicionar
          </Button>
        </div>

        {!enabled && (
          <div className="flex items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/10 p-3 text-xs text-cyan-700 dark:text-cyan-300">
            <Info className="h-4 w-4" />
            <span>Com o horário desativado, não haverá bloqueio por horário de atendimento.</span>
          </div>
        )}

        {enabled && (
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-xs text-muted-foreground">Nenhum horário cadastrado. Clique em "Adicionar".</p>}
            {rows.map((r, idx) => (
              <div key={idx} className="grid grid-cols-[1fr,auto,auto,auto] items-end gap-2 rounded-md border p-3">
                <div className="space-y-1">
                  <Label className="text-xs">Dia da semana</Label>
                  <Select value={String(r.day_of_week)} onValueChange={(v) => {
                    const cp = [...rows]; cp[idx] = { ...r, day_of_week: Number(v) }; setRows(cp);
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Início</Label>
                  <Input type="time" value={r.start_time} onChange={(e) => { const cp = [...rows]; cp[idx] = { ...r, start_time: e.target.value }; setRows(cp); }} className="w-32" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim</Label>
                  <Input type="time" value={r.end_time} onChange={(e) => { const cp = [...rows]; cp[idx] = { ...r, end_time: e.target.value }; setRows(cp); }} className="w-32" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setRows((arr) => arr.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
