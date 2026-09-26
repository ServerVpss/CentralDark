import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAllUsers, setUserSuperAdmin } from "@/lib/admin.functions";
import { adminForceLogout } from "@/lib/admin-controls.functions";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/usuarios")({ component: AdminUsers });

function AdminUsers() {
  const fn = useServerFn(listAllUsers);
  const setSA = useServerFn(setUserSuperAdmin);
  const forceLogout = useServerFn(adminForceLogout);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => fn() });

  const mut = useMutation({
    mutationFn: (v: { userId: string; enable: boolean }) => setSA({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Atualizado"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const logoutMut = useMutation({
    mutationFn: (userId: string) => forceLogout({ data: { userId } }),
    onSuccess: () => toast.success("Sessão encerrada"),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground">Todos os usuários do sistema. Promova/rebaixe Super Admins.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Papel</th><th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {(data ?? []).map((u) => {
              const isSA = u.roles.includes("super_admin");
              return (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {isSA ? <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">Super Admin</span>
                          : <span className="text-xs text-muted-foreground">Usuário</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateBR(u.created_at)}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="sm" variant="ghost"
                      onClick={() => logoutMut.mutate(u.id)} disabled={logoutMut.isPending}
                      title="Forçar logout">
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant={isSA ? "outline" : "default"}
                      onClick={() => mut.mutate({ userId: u.id, enable: !isSA })} disabled={mut.isPending}>
                      {isSA ? <><ShieldOff className="mr-1 h-3.5 w-3.5" />Remover</> : <><Shield className="mr-1 h-3.5 w-3.5" />Promover</>}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
