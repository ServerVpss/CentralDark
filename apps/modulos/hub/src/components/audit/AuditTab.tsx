import React, { useState, useEffect, useCallback } from 'react';
import { useAudit } from '@/hooks/useAudit';
import { DecisionRow } from './DecisionRow';
import { AuditExport } from './AuditExport';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';

interface AuditEntry {
  id: string;
  event_type: string;
  agent: string;
  action: string;
  target: string;
  result: 'approved' | 'vetoed' | 'pending' | 'error';
  veto_reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export function AuditTab() {
  const { entries, loading, error, page, totalPages, setPage, refresh } = useAudit();
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');

  const filtered = entries.filter((e: AuditEntry) => {
    if (search && !e.event_type.toLowerCase().includes(search.toLowerCase()) && !e.agent.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterResult !== 'all' && e.result !== filterResult) return false;
    return true;
  });

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando auditoria...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">Erro ao carregar auditoria: {error}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Auditoria</h2>
        <div className="flex gap-2">
          <AuditExport entries={filtered} />
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por evento ou agente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="all">Todos</option>
          <option value="approved">Aprovado</option>
          <option value="vetoed">Vetado</option>
          <option value="pending">Pendente</option>
          <option value="error">Erro</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum registro de auditoria encontrado.</p>
        ) : (
          filtered.map((entry: AuditEntry) => (
            <DecisionRow key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
