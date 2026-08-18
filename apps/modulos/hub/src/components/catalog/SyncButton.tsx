import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { mcpClient, type SyncResult } from '@/services/mcp-client';

interface SyncButtonProps {
  onSyncComplete?: () => void;
}

export function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await mcpClient.syncCatalog();
      setResult(res);
      toast({
        title: res.no_change ? 'Nenhuma melhoria nova' : 'SOURCE_DELTA concluído',
        description: `${res.delta_found} delta(s), ${res.absorbed} absorvido(s), ${res.pending_refinery} para refinaria`,
        variant: res.status === 'completed' ? 'default' : 'destructive',
      });
      onSyncComplete?.();
    } catch (err) {
      toast({ title: 'Erro ao buscar melhorias', description: String(err), variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          {syncing ? 'Minerando deltas...' : 'Buscar / Aplicar Melhorias'}
        </Button>
        {result && (
          <span className="text-xs text-muted-foreground">
            {result.status === 'completed' ? (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="h-3 w-3" /> {result.no_change ? 'NO_CHANGE' : 'OK'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500">
                <XCircle className="h-3 w-3" /> Falha
              </span>
            )}
          </span>
        )}
      </div>
      {result && (
        <div className="max-w-[620px] text-[11px] text-muted-foreground text-right leading-5">
          SOURCE {result.sources_scanned} · DELTA_FOUND {result.delta_found} · ABSORBED {result.absorbed} · DROP {result.dropped_duplicate} · REJECTED {result.rejected} · REFINERY {result.pending_refinery} · STATUS {result.status}
        </div>
      )}
    </div>
  );
}
