import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

type HybridMode = 'public-admin' | 'tunnel-admin' | 'both-admin';

const STORAGE_KEY = 'centraldark.hybridMcpAdmin.mode';
const PUBLIC_MCP_URL = 'https://mcp.centralldark.com/mcp';
const LOCAL_MCP_URL = 'http://127.0.0.1:9100/mcp';
const TUNNEL_HINT = 'CentralDark / Remote Desktop Commander';

function modeLabel(mode: HybridMode) {
  if (mode === 'public-admin') return 'MCP público admin';
  if (mode === 'tunnel-admin') return 'Túnel local admin';
  return 'Híbrido: público + túnel';
}

export function HybridMcpAdminCard() {
  const initial = (() => {
    try { return (localStorage.getItem(STORAGE_KEY) as HybridMode) || 'both-admin'; } catch { return 'both-admin'; }
  })();
  const [mode, setMode] = useState<HybridMode>(initial);
  const [copied, setCopied] = useState(false);

  function choose(next: HybridMode) {
    setMode(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* noop */ }
    setCopied(false);
  }

  const config = useMemo(() => JSON.stringify({
    centraldark_hybrid_admin: {
      selected_mode: mode,
      public_mcp: {
        enabled: mode === 'public-admin' || mode === 'both-admin',
        type: 'http',
        url: PUBLIC_MCP_URL,
        auth: 'oauth_or_bearer_admin',
      },
      remote_desktop_commander_tunnel: {
        enabled: mode === 'tunnel-admin' || mode === 'both-admin',
        type: 'tunnel',
        hint: TUNNEL_HINT,
        local_url: LOCAL_MCP_URL,
        auth: 'none_or_local_admin_gate',
      },
      admin_rules: {
        activate_both_when_selected: mode === 'both-admin',
        github_is_official: true,
        tunnel_is_runtime_bridge: true,
        unknown_is_not_pass: true,
      },
    },
  }, null, 2), [mode]);

  async function copyConfig() {
    await navigator.clipboard.writeText(config);
    setCopied(true);
  }

  return (
    <Card className="card-premium border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>🔌 MCP híbrido admin</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha como o HUB liga a CentralDark: público, túnel local ou os dois juntos.
            </p>
          </div>
          <Badge className="bg-primary/15 text-primary border-primary/40">{modeLabel(mode)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <button onClick={() => choose('public-admin')} className={`rounded-lg border p-4 text-left transition ${mode === 'public-admin' ? 'border-primary bg-primary/10' : 'border-border bg-card/60'}`}>
            <div className="font-semibold">🌐 Público admin</div>
            <div className="text-xs text-muted-foreground mt-2">Usa {PUBLIC_MCP_URL} com OAuth ou Bearer válido.</div>
          </button>
          <button onClick={() => choose('tunnel-admin')} className={`rounded-lg border p-4 text-left transition ${mode === 'tunnel-admin' ? 'border-primary bg-primary/10' : 'border-border bg-card/60'}`}>
            <div className="font-semibold">🏠 Túnel local admin</div>
            <div className="text-xs text-muted-foreground mt-2">Usa Remote Desktop Commander / túnel para alcançar a Casa.</div>
          </button>
          <button onClick={() => choose('both-admin')} className={`rounded-lg border p-4 text-left transition ${mode === 'both-admin' ? 'border-primary bg-primary/10' : 'border-border bg-card/60'}`}>
            <div className="font-semibold">🧬 Os dois</div>
            <div className="text-xs text-muted-foreground mt-2">Ativa público + túnel. O Chefe escolhe a rota viva.</div>
          </button>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-4 text-sm">
          <div className="font-medium mb-2">Leitura da Casa</div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>🏛️ MCP público: <span className="text-muted-foreground">fonte externa/admin</span></div>
            <div>🏠 Túnel/RDC: <span className="text-muted-foreground">ponte local/runtime</span></div>
            <div>⚖️ Regra: <span className="text-muted-foreground">TOOL_LISTADO != TOOL_ATIVO</span></div>
            <div>🧾 Prova: <span className="text-muted-foreground">health + tools/list + chamada real</span></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={copyConfig}>{copied ? 'Config copiada' : 'Copiar config do modo'}</Button>
          <span className="text-xs text-muted-foreground">Senha/token não aparece aqui. O login/admin continua no fluxo autorizado.</span>
        </div>
      </CardContent>
    </Card>
  );
}
