import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { mcpClient } from '@/services/mcp-client';

interface SyncResult {
  status: string;
  tools_found: number;
  tools_added: number;
  tools_updated: number;
  errors?: string[];
}

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
        title: 'Sincronização concluída',
        description: `${res.tools_added} adicionados, ${res.tools_updated} atualizados`,
        variant: res.status === 'completed' ? 'default' : 'destructive',
      });
      onSyncComplete?.();
    } catch (err) {
      toast({ title: 'Erro na sincronização', description: String(err), variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
        {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
        {syncing ? 'Sincronizando...' : 'Sincronizar Catálogo'}
      </Button>
      {result && (
        <span className="text-xs text-muted-foreground">
          {result.status === 'completed' ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-3 w-3" /> OK
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="h-3 w-3" /> Falha
            </span>
          )}
        </span>
      )}
    </div>
  );
}
