import React, { useState, useEffect } from 'react';
import { GatewayCard } from './GatewayCard';
import { useMCP } from '@/hooks/useMCP';

interface Connector {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastPing: string;
  endpoint: string;
}

export function ConnectorsTab() {
  const { tools } = useMCP();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento de conectores
    const mockConnectors: Connector[] = [
      { id: '1', name: 'MCP Gateway', type: 'mcp', status: 'connected', lastPing: new Date().toISOString(), endpoint: 'https://mcp.centralldark.com' },
      { id: '2', name: 'Telegram MTProto', type: 'telegram', status: 'connected', lastPing: new Date().toISOString(), endpoint: 'https://status.centralldark.com/mtproto' },
      { id: '3', name: 'Supabase HUB', type: 'database', status: 'connected', lastPing: new Date().toISOString(), endpoint: 'https://lyoigsqluyktoclwdaft.supabase.co' },
    ];
    setConnectors(mockConnectors);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando conectores...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Conectores</h2>
      <p className="text-sm text-muted-foreground">Gateways e conexões ativas do HUB</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connectors.map((conn) => (
          <GatewayCard key={conn.id} connector={conn} />
        ))}
      </div>
    </div>
  );
}
