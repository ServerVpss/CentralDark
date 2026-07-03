import React, { useState, useEffect } from 'react';
import { ToolCard } from './ToolCard';
import { SyncButton } from './SyncButton';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Search, Filter } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  is_deprecated: boolean;
  health_status?: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check?: string;
}

interface SyncRun {
  id: string;
  status: string;
  started_at: string;
  finished_at: string;
  tools_found: number;
  tools_added: number;
  tools_updated: number;
}

export function CatalogTab() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTools();
    loadSyncRuns();
  }, []);

  async function loadTools() {
    try {
      const { hubClient } = await import('@/integrations/supabase/hub-client');
      const { data } = await hubClient.from('catalog_tools').select('*').order('name');
      if (data) setTools(data);
    } catch (err) {
      console.error('Erro ao carregar tools:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSyncRuns() {
    try {
      const { hubClient } = await import('@/integrations/supabase/hub-client');
      const { data } = await hubClient.from('catalog_sync_runs').select('*').order('started_at', { ascending: false }).limit(5);
      if (data) setSyncRuns(data);
    } catch (err) {
      console.error('Erro ao carregar sync runs:', err);
    }
  }

  const categories = ['all', ...new Set(tools.map(t => t.category))];

  const filteredTools = tools.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const healthCounts = {
    healthy: tools.filter(t => t.health_status === 'healthy').length,
    degraded: tools.filter(t => t.health_status === 'degraded').length,
    down: tools.filter(t => t.health_status === 'down').length,
    unknown: tools.filter(t => !t.health_status || t.health_status === 'unknown').length,
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando catálogo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Ferramentas</h2>
          <p className="text-sm text-muted-foreground">{tools.length} ferramentas registradas</p>
        </div>
        <SyncButton onSyncComplete={() => { loadTools(); loadSyncRuns(); }} />
      </div>

      {/* Indicadores de saúde */}
      <div className="flex gap-4 flex-wrap">
        <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/30">
          {healthCounts.healthy} saudáveis
        </Badge>
        <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
          {healthCounts.degraded} degradados
        </Badge>
        <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/30">
          {healthCounts.down} offline
        </Badge>
        <Badge variant="outline">{healthCounts.unknown} desconhecidos</Badge>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ferramentas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma ferramenta encontrada com os filtros atuais.
        </div>
      )}

      {/* Últimos syncs */}
      {syncRuns.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Últimas sincronizações</h3>
          <div className="space-y-2">
            {syncRuns.map(run => (
              <div key={run.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
                <span className={run.status === 'completed' ? 'text-green-500' : run.status === 'running' ? 'text-yellow-500' : 'text-red-500'}>
                  {run.status}
                </span>
                <span>{new Date(run.started_at).toLocaleString()}</span>
                <span>{run.tools_found} encontradas, {run.tools_added} adicionadas, {run.tools_updated} atualizadas</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
