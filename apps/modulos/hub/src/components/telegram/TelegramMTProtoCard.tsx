import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Send, Phone, KeyRound, CheckCircle2, XCircle, Loader2, LogOut, ShieldAlert, RefreshCw } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface MTProtoStatus {
  connected: boolean;
  phone?: string;
  dc?: number;
  lastPing?: string;
  error?: string;
}

interface TelegramMTProtoCardProps {
  onReconnect?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}

export function TelegramMTProtoCard({ onReconnect, onDisconnect }: TelegramMTProtoCardProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<MTProtoStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('https://status.centralldark.com/mtproto/status');
      if (!res.ok) throw new Error('Falha ao obter status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({ connected: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleReconnect = async () => {
    if (!onReconnect) return;
    setReconnecting(true);
    try {
      await onReconnect();
      toast({ title: 'Reconectando ao Telegram...', variant: 'default' });
      await fetchStatus();
    } catch (err: any) {
      toast({ title: 'Erro ao reconectar', description: err.message, variant: 'destructive' });
    } finally {
      setReconnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!onDisconnect) return;
    try {
      await onDisconnect();
      toast({ title: 'Desconectado do Telegram', variant: 'default' });
      setStatus({ connected: false });
    } catch (err: any) {
      toast({ title: 'Erro ao desconectar', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Telegram MTProto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verificando conexão...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Telegram MTProto
          <Badge variant={status.connected ? 'default' : 'destructive'} className="ml-2">
            {status.connected ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" />Conectado</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" />Desconectado</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.connected ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{status.phone || 'Telefone não informado'}</span>
            </div>
            {status.dc && (
              <div className="flex items-center gap-2 text-sm">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <span>DC {status.dc}</span>
              </div>
            )}
            {status.lastPing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Último ping: {new Date(status.lastPing).toLocaleString()}</span>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleReconnect} disabled={reconnecting}>
                {reconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Reconectar
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDisconnect}>
                <LogOut className="h-4 w-4 mr-1" />
                Desconectar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-destructive">
              <ShieldAlert className="h-4 w-4" />
              <span>{status.error || 'Conexão perdida com o Telegram'}</span>
            </div>
            <Button size="sm" variant="default" onClick={handleReconnect} disabled={reconnecting} className="mt-2">
              {reconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Tentar reconectar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}