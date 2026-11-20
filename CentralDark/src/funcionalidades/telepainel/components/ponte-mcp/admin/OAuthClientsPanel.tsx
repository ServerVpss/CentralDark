import { Card } from "@/compartilhado/ui/card";
import { Badge } from "@/compartilhado/ui/badge";
import { Skeleton } from "@/compartilhado/ui/skeleton";
import { AlertTriangle, KeyRound, Users } from "lucide-react";
import type { OAuthClient } from "./mcp-adapter";

export function OAuthClientsPanel({ clients, loading }: { clients: OAuthClient[]; loading: boolean }) {
  return (
    <Card className="p-4 md:p-5 space-y-4">
      <header className="flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Clientes OAuth</h2>
          <p className="text-xs text-muted-foreground">Aplicações autorizadas, scopes e categorias liberadas</p>
        </div>
      </header>

      {loading && <Skeleton className="h-24 w-full" />}

      {!loading && clients.length === 0 && (
        <div className="text-center py-10 text-sm text-muted-foreground border rounded-lg bg-muted/20">
          <Users className="w-6 h-6 mx-auto mb-2 opacity-60" />
          Nenhum cliente OAuth conectado agora.
          <div className="text-xs mt-1">Quando um agente autorizar via <code>/oauth/authorize</code>, ele aparece aqui.</div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {clients.map((c) => (
          <div key={c.id} className="border rounded-lg p-3 space-y-2 bg-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{c.id}</div>
              </div>
              {c.partialAccess && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1">
                  <AlertTriangle className="w-3 h-3" /> parcial
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {c.scopes.map((s) => (
                <Badge key={s} variant="secondary" className="font-mono text-[10px]">{s}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Categorias: {c.categoriesAllowed.length ? c.categoriesAllowed.join(", ") : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              Expira: {c.expiresAt ? new Date(c.expiresAt).toLocaleString("pt-BR") : "sem expiração"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
