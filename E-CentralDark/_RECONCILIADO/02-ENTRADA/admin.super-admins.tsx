import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAllUsers, setUserSuperAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/super-admins")({ component: SuperAdmins });

function SuperAdmins() {
  const qc = useQueryClient();
  const list = useServerFn(listAllUsers);
  const set = useServerFn(setUserSuperAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  const m = useMutation({
    mutationFn: (vars: { userId: string; enable: boolean }) => set({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(vars.enable ? "Promovido a Super Admin" : "Acesso master removido");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const masters = (data ?? []).filter((u) => u.roles.includes("super_admin"));
  const others = (data ?? []).filter((u) => !u.roles.includes("super_admin"));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-red-500" /> Super Admins</h1>
        <p className="text-sm text-muted-foreground">Quem tem acesso master ao sistema inteiro.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Masters atuais ({masters.length})</h2>
        <div className="rounded-xl border bg-card divide-y">
          {isLoading && <div className="p-4 text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>}
          {!isLoading && masters.length === 0 && <div className="p-4 text-sm text-muted-foreground">Nenhum master cadastrado.</div>}
          {masters.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{u.full_name ?? u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Button size="sm" variant="destructive"
                onClick={() => m.mutate({ userId: u.id, enable: false })}
                disabled={m.isPending}>
                <ShieldOff className="mr-1 h-4 w-4" /> Remover master
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Promover usuário</h2>
        <div className="rounded-xl border bg-card divide-y max-h-[60vh] overflow-auto">
          {others.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{u.full_name ?? u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Button size="sm" variant="outline"
                onClick={() => m.mutate({ userId: u.id, enable: true })}
                disabled={m.isPending}>
                <Shield className="mr-1 h-4 w-4" /> Tornar master
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
