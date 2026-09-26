import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { adminAuditLog, adminAuditFilters } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { LoadingDots } from "@/components/ui/loading-dots";

type AuditSearch = {
  entity?: string;
  entityId?: string;
  workspaceId?: string;
  category?: string;
};

export const Route = createFileRoute("/admin/auditoria")({
  component: AdminAudit,
  validateSearch: (s: Record<string, unknown>): AuditSearch => ({
    entity: typeof s.entity === "string" ? s.entity : undefined,
    entityId: typeof s.entityId === "string" ? s.entityId : undefined,
    workspaceId: typeof s.workspaceId === "string" ? s.workspaceId : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
});

const ALL = "__all__";

type AuditRow = {
  id: string;
  created_at: string;
  category: string | null;
  action: string;
  workspace_id: string | null;
  actor_user_id: string | null;
  entity: string | null;
  entity_id: string | null;
  payload: unknown;
  before: unknown;
  after: unknown;
  diff: unknown;
  workspace_name: string;
  actor_name: string;
};

function AdminAudit() {
  const fetchLog = useServerFn(adminAuditLog);
  const fetchFilters = useServerFn(adminAuditFilters);

  const search = Route.useSearch();
  const [workspaceId, setWorkspaceId] = useState<string>(search.workspaceId ?? ALL);
  const [actorUserId, setActorUserId] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(search.category ?? ALL);
  const [actionLike, setActionLike] = useState("");
  const [entity, setEntity] = useState<string>(search.entity ?? ALL);
  const [entityId, setEntityId] = useState(search.entityId ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  // Volta pra página 1 quando filtros mudam
  useEffect(() => { setPage(1); }, [workspaceId, actorUserId, category, actionLike, entity, entityId, from, to, pageSize]);

  const filters = useQuery({ queryKey: ["admin-audit-filters"], queryFn: () => fetchFilters() });

  const queryArgs = useMemo(() => ({
    workspaceId: workspaceId === ALL ? null : workspaceId,
    actorUserId: actorUserId === ALL ? null : actorUserId,
    category: category === ALL ? null : category,
    actionLike: actionLike.trim() || null,
    entity: entity === ALL ? null : entity,
    entityId: entityId.trim() || null,
    from: from ? new Date(from).toISOString() : null,
    to: to ? new Date(to).toISOString() : null,
    page,
    pageSize,
  }), [workspaceId, actorUserId, category, actionLike, entity, entityId, from, to, page, pageSize]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-audit", queryArgs],
    queryFn: () => fetchLog({ data: queryArgs }),
    placeholderData: keepPreviousData,
  });

  const rows: AuditRow[] = (data?.rows ?? []) as AuditRow[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function clearFilters() {
    setWorkspaceId(ALL); setActorUserId(ALL); setCategory(ALL);
    setActionLike(""); setEntity(ALL); setEntityId(""); setFrom(""); setTo(""); setPageSize(50); setPage(1);
  }

  function exportCsv() {
    const header = ["quando", "categoria", "acao", "ator", "workspace", "entidade", "entidade_id", "payload"];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        new Date(r.created_at).toISOString(),
        r.category ?? "",
        r.action,
        r.actor_name ?? "",
        r.workspace_name ?? "",
        r.entity ?? "",
        r.entity_id ?? "",
        JSON.stringify(r.payload ?? {}),
      ].map(escape).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `auditoria-p${page}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIdx = Math.min(page * pageSize, total);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auditoria do Sistema</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : `${total} evento(s) — mostrando ${fromIdx}-${toIdx}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/seed-resets">Ver resets de demo</Link>
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>Atualizar</Button>
          <Button onClick={exportCsv} disabled={!rows.length}>Exportar página (CSV)</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Workspace</Label>
          <Select value={workspaceId} onValueChange={setWorkspaceId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {(filters.data?.workspaces ?? []).map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Ator</Label>
          <Select value={actorUserId} onValueChange={setActorUserId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {(filters.data?.actors ?? []).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {(filters.data?.categories ?? []).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tipo de evento (busca)</Label>
          <Input placeholder="ex: ticket_, whatsapp_" value={actionLike} onChange={(e) => setActionLike(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Entidade (tabela)</Label>
          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {(filters.data?.entities ?? []).map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">ID da entidade (ticket, contato…)</Label>
          <div className="flex gap-1">
            <Input
              placeholder="cole o UUID aqui"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
            {entityId && (
              <Button variant="ghost" size="sm" onClick={() => setEntityId("")} title="Limpar">×</Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">De</Label>
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Até</Label>
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Por página</Label>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[25, 50, 100, 200].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} linhas</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="ghost" className="w-full" onClick={clearFilters}>Limpar filtros</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Ator</th>
              <th className="px-4 py-3">Workspace</th>
              <th className="px-4 py-3">Entidade</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum evento encontrado para esses filtros.</td></tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t align-top hover:bg-muted/40 cursor-pointer"
                onClick={() => setSelected(row)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTimeBR(row.created_at)}</td>
                <td className="px-4 py-3"><span className="rounded bg-muted px-2 py-0.5 text-xs">{row.category ?? "—"}</span></td>
                <td className="px-4 py-3 font-medium">{row.action}</td>
                <td className="px-4 py-3">{row.actor_name}</td>
                <td className="px-4 py-3">{row.workspace_name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.entity ?? "—"}
                  {row.entity_id && (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setEntity(row.entity ?? ALL);
                        setEntityId(row.entity_id ?? "");
                      }}
                      className="ml-1 text-[10px] underline text-primary hover:opacity-80"
                      title="Filtrar tudo desta entidade"
                    >
                      #{row.entity_id.slice(0, 8)}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Página {page} de {totalPages} {isFetching && "· atualizando..."}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage(1)}>« Primeira</Button>
          <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Anterior</Button>
          <Input
            type="number" min={1} max={totalPages}
            value={page}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v >= 1 && v <= totalPages) setPage(v);
            }}
            className="w-20 text-center"
          />
          <Button variant="outline" size="sm" disabled={page >= totalPages || isFetching} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima ›</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages || isFetching} onClick={() => setPage(totalPages)}>Última »</Button>
        </div>
      </div>

      <DiffDialog row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DiffDialog({ row, onClose }: { row: AuditRow | null; onClose: () => void }) {
  const open = !!row;
  const before = row?.before ?? null;
  const after = row?.after ?? null;
  const diff = row?.diff ?? null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="rounded bg-muted px-2 py-0.5 text-xs">{row?.category ?? "—"}</span>
            <span>{row?.action}</span>
          </DialogTitle>
          <DialogDescription>
            {row && (
              <>
                {formatDateTimeBR(row.created_at)} · por <b>{row.actor_name}</b> · workspace <b>{row.workspace_name}</b>
                {row.entity && <> · entidade <code className="text-xs">{row.entity}</code></>}
                {row.entity_id && <> #<code className="text-xs">{row.entity_id}</code></>}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {diff && (
            <DiffBlock title="O que mudou" subtitle="Apenas campos alterados" data={diff} tone="accent" />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <DiffBlock title="Antes" subtitle="Estado anterior" data={before} tone="danger" empty="Não havia estado anterior (criação)." />
            <DiffBlock title="Depois" subtitle="Estado atual" data={after} tone="success" empty="Sem estado posterior (exclusão)." />
          </div>
          {row?.payload != null && JSON.stringify(row.payload) !== "{}" && (
            <DiffBlock title="Payload extra" subtitle="Contexto da operação" data={row.payload} tone="muted" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DiffBlock({
  title, subtitle, data, tone, empty,
}: {
  title: string;
  subtitle?: string;
  data: unknown;
  tone: "accent" | "danger" | "success" | "muted";
  empty?: string;
}) {
  const tones: Record<string, string> = {
    accent: "border-primary/30 bg-primary/5",
    danger: "border-destructive/30 bg-destructive/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
    muted: "border-muted bg-muted/30",
  };
  const isEmpty = data == null || (typeof data === "object" && data && Object.keys(data as object).length === 0);
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <div className="mb-2">
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground italic">{empty ?? "Vazio."}</p>
      ) : (
        <pre className="text-xs whitespace-pre-wrap break-all bg-background/60 rounded p-2 max-h-72 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
