import { Card } from "@/compartilhado/ui/card";
import { Badge } from "@/compartilhado/ui/badge";
import { Skeleton } from "@/compartilhado/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/compartilhado/ui/table";
import { ScrollText, ShieldCheck } from "lucide-react";
import type { AuditEntry } from "./mcp-adapter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AuditLogPanel({ entries, loading }: { entries: AuditEntry[]; loading: boolean }) {
  return (
    <Card className="p-4 md:p-5 space-y-4">
      <header className="flex items-center gap-2">
        <ScrollText className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Auditoria</h2>
          <p className="text-xs text-muted-foreground">Últimas chamadas ao MCP · erros sanitizados</p>
        </div>
      </header>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duração</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
            ))}

            {!loading && entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-muted-foreground/60" />
                    <span>Sem chamadas registradas ainda.</span>
                    <span className="text-xs">Assim que o endpoint <code>/admin/audit</code> estiver ativo, elas aparecem aqui.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(e.timestamp), "dd/MM HH:mm:ss", { locale: ptBR })}
                </TableCell>
                <TableCell className="font-mono text-xs">{e.tool}</TableCell>
                <TableCell className="text-xs">{e.client}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyle(e.status)}>{e.status}</Badge>
                  {e.errorSanitized && (
                    <div className="text-[11px] text-muted-foreground mt-1 max-w-xs truncate">{e.errorSanitized}</div>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">{e.durationMs}ms</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function statusStyle(s: AuditEntry["status"]) {
  if (s === "ok") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  if (s === "bloqueado") return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
  return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";
}
