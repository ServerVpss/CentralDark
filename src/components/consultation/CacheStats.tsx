import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Zap, TrendingUp, Clock, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CacheStatsData {
  totalEntries: number;
  totalHits: number;
  topQueries: { query_type: string; hit_count: number }[];
  recentEntries: number;
}

export function CacheStats() {
  const queryClient = useQueryClient();
  const [clearing, setClearing] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery<CacheStatsData>({
    queryKey: ["cache-stats"],
    queryFn: async () => {
      // Get total count without row limit
      const { count: totalEntries, error: countError } = await supabase
        .from("query_cache")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Get recent entries count (last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: recentEntries, error: recentError } = await supabase
        .from("query_cache")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneDayAgo);

      if (recentError) throw recentError;

      // Get hit_count and query_type for top queries (fetch all with pagination)
      const { data: cacheData, error } = await supabase
        .from("query_cache")
        .select("query_type, hit_count");

      if (error) throw error;

      const totalHits = cacheData?.reduce((sum, row) => sum + (row.hit_count || 0), 0) || 0;

      const hitsByType: Record<string, number> = {};
      cacheData?.forEach(row => {
        const type = row.query_type || "unknown";
        hitsByType[type] = (hitsByType[type] || 0) + (row.hit_count || 0);
      });

      const topQueries = Object.entries(hitsByType)
        .map(([query_type, hit_count]) => ({ query_type, hit_count }))
        .sort((a, b) => b.hit_count - a.hit_count)
        .slice(0, 5);

      return { totalEntries: totalEntries || 0, totalHits, topQueries, recentEntries: recentEntries || 0 };
    },
    refetchInterval: 30000,
  });

  const clearAllCache = async () => {
    setClearing("all");
    try {
      const { error } = await supabase
        .from("query_cache")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      toast.success("Cache limpo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
    } catch (err) {
      toast.error("Erro ao limpar cache");
      console.error(err);
    } finally {
      setClearing(null);
    }
  };

  const clearExpiredCache = async () => {
    setClearing("expired");
    try {
      const { error } = await supabase
        .from("query_cache")
        .delete()
        .lt("expires_at", new Date().toISOString());

      if (error) throw error;
      toast.success("Cache expirado removido!");
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
    } catch (err) {
      toast.error("Erro ao limpar cache expirado");
      console.error(err);
    } finally {
      setClearing(null);
    }
  };

  const clearByType = async (queryType: string) => {
    setClearing(queryType);
    try {
      const { error } = await supabase
        .from("query_cache")
        .delete()
        .eq("query_type", queryType);

      if (error) throw error;
      toast.success(`Cache de ${queryType.toUpperCase()} limpo!`);
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
    } catch (err) {
      toast.error(`Erro ao limpar cache de ${queryType}`);
      console.error(err);
    } finally {
      setClearing(null);
    }
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Cache de Índice
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={!stats?.totalEntries || clearing !== null}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Limpar todo o cache?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá <strong>{stats?.totalEntries || 0} entradas</strong> do cache. 
                  As próximas consultas serão feitas diretamente na API externa, 
                  podendo ser mais lentas e consumir créditos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={clearAllCache}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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

        {/* Cache Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={clearExpiredCache}
            disabled={clearing !== null}
          >
            <Clock className="h-3 w-3 mr-1.5" />
            {clearing === "expired" ? "Limpando..." : "Limpar expirados"}
          </Button>
        </div>

        {/* Top Query Types with clear per type */}
        {stats?.topQueries && stats.topQueries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Mais acessados (clique para limpar)
            </div>
            <div className="flex flex-wrap gap-1">
              {stats.topQueries.map(({ query_type, hit_count }) => (
                <Badge 
                  key={query_type} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                  onClick={() => clearByType(query_type)}
                >
                  {clearing === query_type ? "..." : `${query_type.toUpperCase()} (${hit_count})`}
                  <Trash2 className="h-2.5 w-2.5 ml-1 opacity-50" />
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
