import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Sparkles, RefreshCw, KeyRound, Bot } from 'lucide-react';
import { abacusApi, AbacusStatus, AbacusModel } from '@/services/abacus-client';

const GATEWAY_URL = 'https://api.centralldark.com/v1';

type PingState = 'checking' | 'on' | 'off';

export function AbacusApiCard() {
  const [status, setStatus] = useState<AbacusStatus | null>(null);
  const [ping, setPing] = useState<PingState>('checking');
  const [models, setModels] = useState<AbacusModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [open, setOpen] = useState(false);

  const refreshStatus = useCallback(async () => {
    setPing('checking');
    try {
      const s = await abacusApi.status();
      setStatus(s);
      setPing('on');
    } catch {
      setPing('off');
    }
  }, []);

  const refreshModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const m = await abacusApi.models();
      setModels(m);
    } catch {
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const iv = setInterval(refreshStatus, 60_000);
    return () => clearInterval(iv);
  }, [refreshStatus]);

  useEffect(() => {
    if (open) refreshModels();
  }, [open, refreshModels]);

  const dot =
    ping === 'on'
      ? 'bg-emerald-500'
      : ping === 'off'
      ? 'bg-red-500'
      : 'bg-amber-500 animate-pulse';
  const label = ping === 'on' ? 'Online' : ping === 'off' ? 'Offline' : 'checando';
  const keyOk = status?.keyConfigured ?? false;
  const activeCount = models.filter((m) => m.active).length;

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-300" />
          <CardTitle className="text-sm font-semibold">Abacus API Gateway</CardTitle>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Gateway OpenAI-compat com modelos free-tier. Use em qualquer app que aceita
          OpenAI API: base URL abaixo + sua chave do HUB.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-emerald-500/10 bg-black/20 p-2">
            <div className="text-muted-foreground">Chave configurada</div>
            <div className="flex items-center gap-1.5 font-medium">
              <KeyRound className="h-3 w-3" />
              {keyOk ? (
                <span className="text-emerald-300">
                  sim {status?.keyHint ? `(…${status.keyHint})` : ''}
                </span>
              ) : (
                <span className="text-amber-300">pendente</span>
              )}
            </div>
          </div>
          <div className="rounded border border-emerald-500/10 bg-black/20 p-2">
            <div className="text-muted-foreground">Modelos</div>
            <div className="font-medium">
              {status?.modelCount ?? '—'}{' '}
              <span className="text-muted-foreground">disponíveis</span>
            </div>
          </div>
        </div>

        <code className="block truncate rounded bg-black/30 px-2 py-1 text-[10px] text-emerald-200/80">
          {GATEWAY_URL}
        </code>

        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 flex-1 text-xs">
                Ver modelos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Modelos Abacus (free-tier)
                </DialogTitle>
                <DialogDescription>
                  {loadingModels
                    ? 'Sincronizando…'
                    : `${models.length} modelos · ${activeCount} ativos · atualiza sozinho ao abrir`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs"
                  onClick={refreshModels}
                  disabled={loadingModels}
                >
                  <RefreshCw
                    className={`h-3 w-3 ${loadingModels ? 'animate-spin' : ''}`}
                  />
                  Sincronizar
                </Button>
              </div>

              <div className="max-h-[420px] overflow-y-auto rounded border border-border/60">
                {models.length === 0 && !loadingModels && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nenhum modelo retornado. Confira se a chave Abacus está configurada
                    e se o endpoint <code>/models</code> respondeu.
                  </div>
                )}
                <ul className="divide-y divide-border/40">
                  {models.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          m.active ? 'bg-emerald-500' : 'bg-red-500/70'
                        }`}
                        title={m.active ? 'On' : 'Off'}
                      />
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{m.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.id}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          m.active
                            ? 'border-emerald-500/40 text-emerald-300'
                            : 'border-red-500/30 text-red-300/80'
                        }
                      >
                        {m.active ? 'ativo' : 'off'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-emerald-500/10 bg-black/20 p-3 text-xs">
                <div className="mb-1 font-medium text-emerald-300">
                  Como usar como gateway
                </div>
                <p className="text-muted-foreground">
                  Base URL: <code className="text-emerald-200">{GATEWAY_URL}</code>
                  <br />
                  Header: <code className="text-emerald-200">Authorization: Bearer &lt;seu token do HUB&gt;</code>
                  <br />
                  Compatível com clientes OpenAI (Cursor, VSCode, Claude Code, etc).
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={refreshStatus}
          >
            <RefreshCw
              className={`h-3 w-3 ${ping === 'checking' ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
