// Gestão completa de usuários do painel (admin only)
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminUsers, AdminUser } from "@/hooks/useAdminUsers";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Loader2, MoreVertical, UserCog, UserPlus, RefreshCw, Search, ShieldCheck,
  KeyRound, Mail, Ban, CheckCircle2, Trash2, ShieldOff, Lock, Eye, IdCard,
} from "lucide-react";
import { startViewAs } from "@/lib/viewAsMode";
import { clearAdminCache } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function UsuariosPainel() {
  const { user: me } = useAuthContext();
  const {
    users, loading, refresh,
    createUser, updatePassword, sendReset, setRole, confirmEmail, ban, unban, remove,
  } = useAdminUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const navigate = useNavigate();

  const handleViewAs = (u: AdminUser) => {
    startViewAs({ userId: u.id, email: u.email, name: u.full_name });
    clearAdminCache();
    toast.success("Modo espelho ativado — recarregando…");
    setTimeout(() => { window.location.href = "/portal"; }, 400);
  };


  // Diálogos
  const [createOpen, setCreateOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState<AdminUser | null>(null);
  const [pwdValue, setPwdValue] = useState("");
  const [confirmDel, setConfirmDel] = useState<AdminUser | null>(null);
  const [confirmBan, setConfirmBan] = useState<AdminUser | null>(null);

  // Form criar
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.full_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const isBanned = (u: AdminUser) =>
    !!u.banned_until && new Date(u.banned_until) > new Date();

  const handleCreate = async () => {
    if (!newEmail || newPass.length < 6) return;
    setBusy(true);
    const ok = await createUser({
      email: newEmail, password: newPass, full_name: newName, role: newRole,
    });
    setBusy(false);
    if (ok) {
      setCreateOpen(false);
      setNewEmail(""); setNewPass(""); setNewName(""); setNewRole("user");
    }
  };

  const handleNewPassword = async () => {
    if (!pwdTarget || pwdValue.length < 6) return;
    setBusy(true);
    const ok = await updatePassword(pwdTarget.id, pwdValue);
    setBusy(false);
    if (ok) { setPwdTarget(null); setPwdValue(""); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shadow-3d-soft">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Usuários do Painel</h1>
              <p className="text-sm text-muted-foreground">
                Quem tem login web no sistema. {users.length} {users.length === 1 ? "conta" : "contas"}.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refresh} disabled={loading} className="rounded-xl">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="rounded-xl shadow-3d-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo usuário
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="rounded-2xl shadow-3d-soft">
          <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por e-mail ou nome…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-44 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="rounded-2xl shadow-3d-soft">
          <CardHeader>
            <CardTitle className="text-base">Contas cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead className="hidden md:table-cell">Nome</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Criado</TableHead>
                      <TableHead className="hidden lg:table-cell">Último login</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                    {filtered.map((u) => {
                      const banned = isBanned(u);
                      const isSelf = me?.id === u.id;
                      const confirmed = !!u.email_confirmed_at;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              {u.email}
                              {isSelf && <Badge variant="outline" className="text-[10px]">você</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {u.full_name ?? "—"}
                          </TableCell>
                          <TableCell>
                            {u.role === "admin" ? (
                              <Badge className="bg-primary/15 text-primary border-primary/30 rounded-lg">
                                <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="rounded-lg">Usuário</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {banned ? (
                              <Badge variant="destructive" className="rounded-lg">Bloqueado</Badge>
                            ) : confirmed ? (
                              <Badge variant="outline" className="rounded-lg text-emerald-600 border-emerald-300">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-lg text-amber-600 border-amber-300">
                                Pendente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {fmtDate(u.created_at)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {fmtDate(u.last_sign_in_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                title="Perfil 360"
                                onClick={() => navigate(`/usuarios-painel/${u.id}`)}
                              >
                                <IdCard className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-amber-600"
                                title="Ver como este usuário (modo espelho)"
                                disabled={isSelf}
                                onClick={() => handleViewAs(u)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="text-xs">
                                  {u.email}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />


                                {u.role === "admin" ? (
                                  <DropdownMenuItem
                                    disabled={isSelf}
                                    onClick={() => setRole(u.id, "user")}
                                  >
                                    <ShieldOff className="h-4 w-4 mr-2" />
                                    Rebaixar pra usuário
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => setRole(u.id, "admin")}>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Promover a admin
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => { setPwdTarget(u); setPwdValue(""); }}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Definir senha…
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => u.email && sendReset(u.email)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Enviar reset por e-mail
                                </DropdownMenuItem>

                                {!confirmed && (
                                  <DropdownMenuItem onClick={() => confirmEmail(u.id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirmar e-mail
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {banned ? (
                                  <DropdownMenuItem onClick={() => unban(u.id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Desbloquear
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    disabled={isSelf}
                                    onClick={() => setConfirmBan(u)}
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Bloquear acesso
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  disabled={isSelf}
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setConfirmDel(u)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir usuário
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Criar usuário */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Novo usuário do painel</DialogTitle>
            <DialogDescription>
              A conta já é criada confirmada e pode logar na hora.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha (mín. 6)</Label>
              <Input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Papel</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={busy || !newEmail || newPass.length < 6}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Definir senha */}
      <Dialog open={!!pwdTarget} onOpenChange={(o) => !o && setPwdTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Definir nova senha</DialogTitle>
            <DialogDescription>
              {pwdTarget?.email} — a senha vale imediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Nova senha (mín. 6)</Label>
            <Input
              type="text"
              value={pwdValue}
              onChange={(e) => setPwdValue(e.target.value)}
              placeholder="ex: SenhaNova123"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdTarget(null)}>Cancelar</Button>
            <Button onClick={handleNewPassword} disabled={busy || pwdValue.length < 6}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <KeyRound className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar bloqueio */}
      <AlertDialog open={!!confirmBan} onOpenChange={(o) => !o && setConfirmBan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear este acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBan?.email} não vai conseguir mais entrar no painel até ser desbloqueado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmBan) await ban(confirmBan.id);
                setConfirmBan(null);
              }}
            >
              Bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel?.email} será apagado e não tem como reverter. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (confirmDel) await remove(confirmDel.id);
                setConfirmDel(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
