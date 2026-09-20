import React from 'react';
import { useMissions } from '@/hooks/useMissions';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { formatBrasilia } from '@/lib/datetime';

const stateColor: Record<string, string> = {
  queued: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/30',
  running: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
  done: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  failed: 'bg-red-500/10 text-red-300 border border-red-500/30',
  cancelled: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/30',
};

const authColor: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  denied: 'bg-red-500/10 text-red-300 border border-red-500/30',
};

export function MissionsTab() {
  const { missions, loading, error, page, totalPages, setPage, refresh } = useMissions();

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando missões...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-400">Erro: {error}</div>;
  }

  return (
    <RoleGuard requiredRole="viewer">
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Missões do HUB</h2>
          <Button variant="outline" size="sm" onClick={refresh}>Atualizar</Button>
        </div>

        {missions.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma missão registrada ainda. Missões criadas via <code>hub-command</code> aparecem aqui.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {missions.map((m) => (
            <Card key={m.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={stateColor[m.state]}>{m.state}</Badge>
                  <Badge className={authColor[m.authorization]}>{m.authorization}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>Agente: <span className="text-foreground">{m.agent}</span> · Risco: <span className="text-foreground">{m.risk}</span></div>
                {m.target && <div>Alvo: <span className="text-foreground">{m.target}</span></div>}
                {m.branch_sha && <div>SHA: <span className="font-mono text-foreground">{m.branch_sha.slice(0, 12)}</span></div>}
                {m.rollback && <div>Rollback: <span className="text-foreground">{m.rollback}</span></div>}
                <div>Criado: {formatBrasilia(m.created_at)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 text-sm">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <span className="text-muted-foreground">Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
