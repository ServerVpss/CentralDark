import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { RefreshCw, KeyRound, Boxes, Radio, Sparkles } from 'lucide-react';
import { abacusApi, AbacusStatus } from '@/services/abacus-client';

/**
 * Card Abacus RouteLLM — resumo seguro do gateway.
 * Mostra apenas: keyConfigured, total de modelos e status /status ao vivo.
 * NÃO exibe chave real, nem token, nem Authorization.
 */
export function AbacusRouteLLMCard() {
  const [data, setData] = useState<AbacusStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const s = await abacusApi.status();
      setData(s);
      setLastCheck(new Date());
    } catch (e: any) {
      setErr(e?.message ?? 'falha ao consultar /status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, []);

  const keyOk = !!data?.keyConfigured;
  const models = data?.modelCount ?? 0;
  const endpointsOk = data?.endpoints?.every((e) => e.ok) ?? false;

  const statusColor = err
    ? 'bg-red-500'
    : loading
    ? 'bg-amber-500 animate-pulse'
    : endpointsOk && keyOk
    ? 'bg-emerald-500'
    : 'bg-amber-500';
  const statusLabel = err ? 'Off' : loading ? '...' : endpointsOk && keyOk ? 'On' : 'Parcial';

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          Abacus RouteLLM
          <Badge variant="outline" className="gap-1.5 ml-2">
            <span className={`h-2 w-2 rounded-full ${statusColor}`} />
            {statusLabel}
          </Badge>
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading} className="h-7 text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Chave */}
          <div className="rounded-lg border border-emerald-500/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <KeyRound className="h-3.5 w-3.5" /> Chave
            </div>
            <div className="text-lg font-semibold">
              {keyOk ? (
                <span className="text-emerald-400">Configurada</span>
              ) : (
                <span className="text-amber-400">Ausente</span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              nunca exposta no frontend
            </div>
          </div>

          {/* Modelos */}
          <div className="rounded-lg border border-emerald-500/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Boxes className="h-3.5 w-3.5" /> Modelos
            </div>
            <div className="text-lg font-semibold text-emerald-300">
              {loading && !data ? '...' : models}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              inventário via /models
            </div>
          </div>

          {/* /status ao vivo */}
          <div className="rounded-lg border border-emerald-500/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Radio className="h-3.5 w-3.5" /> /status
            </div>
            <div className="text-lg font-semibold">
              {err ? (
                <span className="text-red-400">Offline</span>
              ) : endpointsOk ? (
                <span className="text-emerald-400">200 OK</span>
              ) : (
                <span className="text-amber-400">Degradado</span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {lastCheck ? `checado ${lastCheck.toLocaleTimeString('pt-BR')}` : '—'}
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-3 text-xs text-red-300/90 bg-red-500/10 border border-red-500/30 rounded px-2 py-1.5">
            ❌ {err}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
