import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { adminListSystemRoutes, adminUpdateRouteStatus } from "@/lib/system-map.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/mapa")({ component: SystemMapPage });

type Row = {
  id: string; path: string; label: string; area: string;
  category: string; subcategory: string | null;
  status: "ok" | "placeholder" | "broken" | "hidden" | "wip";
  permission: string | null; notes: string | null; last_checked_at: string | null;
};

const STATUS_VARIANT: Record<Row["status"], string> = {
  ok: "bg-emerald-600", placeholder: "bg-amber-500", broken: "bg-red-600",
  hidden: "bg-zinc-500", wip: "bg-blue-500",
};
const STATUS_LABEL: Record<Row["status"], string> = {
  ok: "Funcionando", placeholder: "Placeholder", broken: "Quebrado", hidden: "Oculto", wip: "Em desenvolvimento",
};

function SystemMapPage() {
  const list = useServerFn(adminListSystemRoutes);
  const update = useServerFn(adminUpdateRouteStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-system-routes"],
    queryFn: () => list({}),
  });
  const mut = useMutation({
    mutationFn: (vars: { id: string; status: Row["status"] }) =>
      update({ data: { id: vars.id, status: vars.status } }),
    onSuccess: () => { toast.success("Status atualizado"); qc.invalidateQueries({ queryKey: ["admin-system-routes"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const rows = (data?.routes ?? []) as Row[];
  const filtered = useMemo(() => rows.filter(r => {
    if (areaFilter !== "all" && r.area !== areaFilter) return false;
    if (search && !`${r.path} ${r.label} ${r.category}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [rows, search, areaFilter]);

  const counts = useMemo(() => {
    const c = { ok: 0, placeholder: 0, broken: 0, wip: 0, hidden: 0, total: rows.length };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mapa do sistema</h1>
        <p className="text-sm text-muted-foreground">Todas as rotas do app, painel master e APIs públicas.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{counts.total}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Funcionando</p><p className="text-2xl font-bold text-emerald-600">{counts.ok}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Placeholder</p><p className="text-2xl font-bold text-amber-600">{counts.placeholder}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Em dev</p><p className="text-2xl font-bold text-blue-600">{counts.wip}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Quebrado</p><p className="text-2xl font-bold text-red-600">{counts.broken}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Ocultos</p><p className="text-2xl font-bold text-zinc-500">{counts.hidden}</p></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Input placeholder="Buscar rota, página ou categoria..." value={search} onChange={e => setSearch(e.target.value)} className="md:max-w-md" />
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as áreas</SelectItem>
              <SelectItem value="app">App (cliente)</SelectItem>
              <SelectItem value="admin">Admin (master)</SelectItem>
              <SelectItem value="public">Públicas</SelectItem>
              <SelectItem value="api">APIs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Rota</th><th>Página</th><th>Categoria</th><th>Permissão</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{r.path}</td>
                    <td>{r.label}</td>
                    <td className="text-muted-foreground">{r.category}{r.subcategory ? ` › ${r.subcategory}` : ""}</td>
                    <td className="text-muted-foreground">{r.permission ?? "—"}</td>
                    <td><Badge className={`${STATUS_VARIANT[r.status]} text-white`}>{STATUS_LABEL[r.status]}</Badge></td>
                    <td>
                      <Select value={r.status} onValueChange={(v) => mut.mutate({ id: r.id, status: v as Row["status"] })}>
                        <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ok">Funcionando</SelectItem>
                          <SelectItem value="placeholder">Placeholder</SelectItem>
                          <SelectItem value="wip">Em dev</SelectItem>
                          <SelectItem value="broken">Quebrado</SelectItem>
                          <SelectItem value="hidden">Oculto</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nenhuma rota encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        Limpeza automática: logs gerais ficam por <strong>30 dias</strong>; mensagens e webhooks de WhatsApp ficam por <strong>90 dias</strong> (motivo legal/auditoria).
      </p>
    </div>
  );
}
