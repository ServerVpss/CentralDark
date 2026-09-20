import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Bot,
  Cloud,
  Compass,
  Cpu,
  Globe,
  Layers,
  Rocket,
  Sparkles,
  Zap,
} from 'lucide-react';

type ApiStatus = 'on' | 'off' | 'checking';

interface ApiDef {
  id: string;
  nome: string;
  descricao: string;
  rota: string;
  healthPath?: string;
  icon: React.ComponentType<{ className?: string }>;
  cor: string;
}

const APIS: ApiDef[] = [
  {
    id: 'darkai',
    nome: 'DarkAI',
    descricao: 'Proxy universal de IAs (Gemini, GPT-5, Claude)',
    rota: 'https://darkai.centralldark.com',
    healthPath: '/health',
    icon: Sparkles,
    cor: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    id: 'lovable-proxy',
    nome: 'Lovable Proxy',
    descricao: 'Roteamento Lovable ↔ modelos externos',
    rota: 'https://lovable-proxy.centralldark.com',
    healthPath: '/health',
    icon: Layers,
    cor: 'from-teal-500/20 to-teal-500/5',
  },
  {
    id: 'zendriver',
    nome: 'Zendriver',
    descricao: 'Navegador headless (multi-contas GPT premium)',
    rota: 'https://elite.centralldark.com/zendriver',
    healthPath: '/health',
    icon: Globe,
    cor: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    id: 'elite-gateway',
    nome: 'Elite Gateway',
    descricao: 'Orquestrador HTTP + WS do Elite',
    rota: 'https://elite.centralldark.com',
    healthPath: '/health',
    icon: Rocket,
    cor: 'from-amber-500/20 to-amber-500/5',
  },
  {
    id: 'mcp',
    nome: 'MCP',
    descricao: 'Model Context Protocol (83 ferramentas)',
    rota: 'https://mcp.centralldark.com',
    healthPath: '/health',
    icon: Cpu,
    cor: 'from-violet-500/20 to-violet-500/5',
  },
  {
    id: 'oauth-broker',
    nome: 'OAuth Broker',
    descricao: 'Cofre de contas e tokens (multi-conta)',
    rota: 'https://oauth.centralldark.com',
    healthPath: '/health',
    icon: Cloud,
    cor: 'from-blue-500/20 to-blue-500/5',
  },
  {
    id: 'hermes',
    nome: 'Hermes',
    descricao: 'Núcleo autônomo (missions + verificador 24h)',
    rota: 'https://hermes.centralldark.com',
    healthPath: '/status',
    icon: Bot,
    cor: 'from-fuchsia-500/20 to-fuchsia-500/5',
  },
  {
    id: 'arsenal',
    nome: 'Arsenal Council',
    descricao: 'Adapter OpenAI-compat do Conselho',
    rota: 'https://arsenal.centralldark.com',
    healthPath: '/v1/models',
    icon: Compass,
    cor: 'from-rose-500/20 to-rose-500/5',
  },
  {
    id: 'artifacts',
    nome: 'Artifacts Builder',
    descricao: 'Crafter + Builder de artefatos',
    rota: 'https://artifacts.centralldark.com',
    healthPath: '/health',
    icon: Zap,
    cor: 'from-lime-500/20 to-lime-500/5',
  },
];

async function pingar(url: string): Promise<ApiStatus> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { method: 'GET', signal: ctrl.signal, mode: 'no-cors' });
    clearTimeout(t);
    // com no-cors o response é opaco — se não caiu, considera on
    return 'on';
  } catch {
    return 'off';
  }
}

export function ApiCardsGrid() {
  const [statuses, setStatuses] = useState<Record<string, ApiStatus>>(
    Object.fromEntries(APIS.map((a) => [a.id, 'checking'])),
  );

  const rodar = async (api: ApiDef) => {
    setStatuses((s) => ({ ...s, [api.id]: 'checking' }));
    const url = `${api.rota}${api.healthPath ?? ''}`;
    const st = await pingar(url);
    setStatuses((s) => ({ ...s, [api.id]: st }));
  };

  useEffect(() => {
    APIS.forEach((a) => rodar(a));
    const iv = setInterval(() => APIS.forEach((a) => rodar(a)), 60_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">APIs conectadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {APIS.map((api) => {
            const st = statuses[api.id];
            const Icon = api.icon;
            const cor =
              st === 'on'
                ? 'bg-emerald-500'
                : st === 'off'
                ? 'bg-red-500'
                : 'bg-amber-500 animate-pulse';
            const label = st === 'on' ? 'On' : st === 'off' ? 'Off' : '...';
            return (
              <div
                key={api.id}
                className={`relative rounded-lg border border-emerald-500/10 bg-gradient-to-br ${api.cor} p-4 transition hover:border-emerald-400/40`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <span className="font-semibold text-sm">{api.nome}</span>
                  </div>
                  <Badge className="gap-1.5" variant="outline">
                    <span className={`h-2 w-2 rounded-full ${cor}`} />
                    {label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {api.descricao}
                </p>
                <code className="block text-[10px] text-emerald-200/80 bg-black/20 rounded px-2 py-1 mb-2 truncate">
                  {api.rota}
                  {api.healthPath ?? ''}
                </code>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs flex-1"
                    onClick={() => rodar(api)}
                  >
                    Testar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    asChild
                  >
                    <a href={api.rota} target="_blank" rel="noreferrer">
                      Abrir
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
