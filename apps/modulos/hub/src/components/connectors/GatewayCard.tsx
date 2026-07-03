import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Globe, Shield, RefreshCw } from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastPing: string;
  endpoint: string;
}

interface GatewayCardProps {
  connector: Connector;
}

export function GatewayCard({ connector }: GatewayCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{connector.name}</CardTitle>
        <Badge variant={connector.status === 'connected' ? 'default' : 'destructive'}>
          {connector.status.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Globe className="mr-1 h-3 w-3" /> {connector.endpoint}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Shield className="mr-1 h-3 w-3" /> {connector.type}
          </div>
          <div className="text-xs text-muted-foreground">
            Último ping: {new Date(connector.lastPing).toLocaleString('pt-BR')}
          </div>
          <Button variant="outline" size="sm" className="mt-2 w-full">
            <RefreshCw className="mr-2 h-3 w-3" /> Testar Latência
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
