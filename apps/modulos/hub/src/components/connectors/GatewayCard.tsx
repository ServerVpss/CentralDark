import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Globe, Shield, RefreshCw } from 'lucide-react';

interface GatewayProps {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  url: string;
  type: string;
}

export function GatewayCard({ name, status, url, type }: GatewayProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Badge variant={status === 'online' ? 'default' : 'destructive'}>
          {status.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Globe className="mr-1 h-3 w-3" /> {url}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Shield className="mr-1 h-3 w-3" /> {type}
          </div>
          <Button variant="outline" size="sm" className="mt-2 w-full">
            <RefreshCw className="mr-2 h-3 w-3" /> Testar Latência
          </Button>
        </div>
      </CardContent>
    </Card>
  );