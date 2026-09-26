// Página dedicada: histórico de resets de dados de demonstração.
// Filtra automaticamente audit_log por action = workspace_seed_reset.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminAuditLog } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { LoadingDots } from "@/components/ui/loading-dots";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/seed-resets")({
  component: SeedResetsPage,
});

type Row = {
  id: string;
  created_at: string;
  action: string;
  actor_user_id: string | null;
  workspace_id: string | null;
  payload: {
    deleted?: Record<string, number>;
    total_deleted?: number;
    workspace_name?: string;
  } | null;
  workspace_name: string;
  actor_name: string;
};

function SeedResetsPage() {
  const fetchLog = useServerFn(adminAuditLog);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-seed-resets", page],
    queryFn: () =>
      fetchLog({
        data: {
          actionLike: "workspace_seed_reset",
          page,
          pageSize: 50,
          workspaceId: null,
          actorUserId: null,
          category: null,
          entity: null,
          entityId: null,
          from: null,
          to: null,
        },
      }),
    placeholderData: keepPreviousData,
  });

  const rows = (data?.rows ?? []) as Row[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Soma de tudo o que já foi apagado (todas as páginas combinadas só desta página)
  const sumThisPage = rows.reduce(
    (acc, r) => acc + (r.payload?.total_deleted ?? 0),
    0,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-8 w-8 text-destructive mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Resets de dados de demonstração</h1>
            <Badge variant="destructive" className="ml-2">
              <Trash2 className="h-3 w-3 mr-1" />
              ação sensível
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Histórico de todas as vezes que um Super Admin apagou os dados de
            demonstração de algum workspace. Cada linha mostra quem fez, quando,
            em qual workspace e quantos registros foram removidos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/auditoria">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Auditoria completa
            </Link>
          </Button>
          <Button onClick={() => refetch()} disabled={isFetching} size="sm">
            Atualizar
          </Button>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total de resets</p>
          <p className="text-2xl font-bold mt-1">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            Registros apagados (esta página)
          </p>
          <p className="text-2xl font-bold mt-1">{sumThisPage}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Último reset</p>
          <p className="text-sm font-medium mt-1">
            {rows[0]
              ? formatDateTimeBR(rows[0].created_at)
              : "—"}
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingDots size="md" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            Nenhum reset registrado ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Quem resetou</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead className="text-right">Registros apagados</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => setSelected(r)}
                >
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTimeBR(r.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">{r.actor_name}</TableCell>
                  <TableCell>
                    {r.payload?.workspace_name ?? r.workspace_name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        (r.payload?.total_deleted ?? 0) > 0
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {r.payload?.total_deleted ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">
                      Ver tabelas
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
          {isFetching && " · atualizando..."}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Modal de detalhes — tabelas + contagem por tabela */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do reset</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  {formatDateTimeBR(selected.created_at)} · por{" "}
                  <b>{selected.actor_name}</b> · workspace{" "}
                  <b>
                    {selected.payload?.workspace_name ?? selected.workspace_name}
                  </b>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selected?.payload?.deleted ? (
            <div className="space-y-1 max-h-80 overflow-auto">
              {Object.entries(selected.payload.deleted)
                .sort(([, a], [, b]) => b - a)
                .map(([table, count]) => (
                  <div
                    key={table}
                    className="flex justify-between text-sm py-1 border-b"
                  >
                    <span className="font-mono text-xs">{table}</span>
                    <Badge variant={count > 0 ? "default" : "outline"}>
                      {count}
                    </Badge>
                  </div>
                ))}
              <div className="flex justify-between font-semibold pt-3">
                <span>Total apagado</span>
                <span>{selected.payload.total_deleted ?? 0}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem detalhes registrados.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
