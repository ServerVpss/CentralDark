import { useQuery } from "@tanstack/react-query";
import { Database, Zap, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  topQueries: { query_type: string; hit_count: number }[];
  recentEntries: number;
}

export function CacheStats() {
  const { data: stats, isLoading } = useQuery<CacheStats>({
    queryKey: ["cache-stats"],
    queryFn: async () => {
      // Get total entries and hits
      const { data: cacheData, error } = await supabase
        .from("query_cache")
        .select("query_type, hit_count, created_at");

      if (error) throw error;

      const totalEntries = cacheData?.length || 0;
      const totalHits = cacheData?.reduce((sum, row) => sum + (row.hit_count || 0), 0) || 0;

      // Count entries from last 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentEntries = cacheData?.filter(row => row.created_at > oneDayAgo).length || 0;

      // Get top query types by hits
      const hitsByType: Record<string, number> = {};
      cacheData?.forEach(row => {
        const type = row.query_type || "unknown";
        hitsByType[type] = (hitsByType[type] || 0) + (row.hit_count || 0);
      });

      const topQueries = Object.entries(hitsByType)
        .map(([query_type, hit_count]) => ({ query_type, hit_count }))
        .sort((a, b) => b.hit_count - a.hit_count)
        .slice(0, 5);

      return {
        totalEntries,
        totalHits,
        topQueries,
        recentEntries,
      };
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Cache de Índice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hitRate = stats && stats.totalEntries > 0 
    ? ((stats.totalHits / (stats.totalHits + stats.totalEntries)) * 100).toFixed(1)
    : "0";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Cache de Índice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/20 text-center">
            <div className="text-2xl font-bold text-primary">{stats?.totalEntries || 0}</div>
            <div className="text-xs text-muted-foreground">Entradas</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/20 text-center">
            <div className="text-2xl font-bold text-success">{stats?.totalHits || 0}</div>
            <div className="text-xs text-muted-foreground">Cache Hits</div>
          </div>
        </div>

        {/* Hit Rate */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Taxa de Acerto</span>
          </div>
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
            {hitRate}%
          </Badge>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Últimas 24h</span>
          </div>
          <span className="text-sm font-medium">{stats?.recentEntries || 0} novas</span>
        </div>

        {/* Top Query Types */}
        {stats?.topQueries && stats.topQueries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Mais acessados
            </div>
            <div className="flex flex-wrap gap-1">
              {stats.topQueries.map(({ query_type, hit_count }) => (
                <Badge 
                  key={query_type} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {query_type.toUpperCase()} ({hit_count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!stats?.totalEntries || stats.totalEntries === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhuma consulta indexada ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
}
