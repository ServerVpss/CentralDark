import { useEffect, useState, useRef } from "react";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Activity, TrendingUp, User, Bot as BotIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/hub-client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QueryRow {
  id: string;
  query_type: string;
  query_input: string;
  status: string | null;
  created_at: string;
  user_id: string | null;
}

interface TypeStat { type: string; count: number }
interface UserStat { key: string; name: string; username: string | null; count: number; today: number }


export function QueryMonitor() {
  const [recent, setRecent] = useState<QueryRow[]>([]);
  const [byType, setByType] = useState<TypeStat[]>([]);
  const [byUser, setByUser] = useState<UserStat[]>([]);
  const [total24h, setTotal24h] = useState(0);
  const [totalLastHour, setTotalLastHour] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: rows } = await supabase
      .from("query_history")
      .select("id, query_type, query_input, status, created_at, user_id")
      .gte("created_at", since24h)
      .order("created_at", { ascending: false })
      .limit(100);

    const list = rows || [];
    setTotal24h(list.length);
    setTotalLastHour(list.filter((r) => r.created_at >= since1h).length);
    setRecent(list.slice(0, 30));

    // Por tipo (todos os módulos)
    const typeMap = new Map<string, number>();
    list.forEach((r) => typeMap.set(r.query_type, (typeMap.get(r.query_type) || 0) + 1));
    setByType(
      Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    );

    // Top usuários REAIS do bot Telegram (telegram_messages com comando /)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayISO = startOfToday.toISOString();

    const { data: msgs } = await supabase
      .from("telegram_messages")
      .select("from_user_id, from_username, from_first_name, message_text, created_at")
      .gte("created_at", since24h)
      .like("message_text", "/%")
      .limit(500);

    const userMap = new Map<string, { name: string; username: string | null; count: number; today: number }>();
    (msgs || []).forEach((m) => {
      if (!m.from_user_id) return;
      const k = String(m.from_user_id);
      const isToday = m.created_at >= startOfTodayISO;
      const cur = userMap.get(k);
      if (cur) {
        cur.count += 1;
        if (isToday) cur.today += 1;
      } else {
        userMap.set(k, {
          name: m.from_first_name || m.from_username || k,
          username: m.from_username,
          count: 1,
          today: isToday ? 1 : 0,
        });
      }
    });
    const topUsers: UserStat[] = Array.from(userMap.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    setByUser(topUsers);

    if (mountedRef.current) {
      setLoading(false);
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    safetyTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 10000);

    load();

    const scheduleLoad = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (mountedRef.current) load();
      }, 2000);
    };

    const channel = supabase
      .channel("query_monitor")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "query_history" },
        scheduleLoad
      )
      .subscribe();
    const interval = setInterval(load, 30000);
    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const statusColor = (s: string | null) => {
    if (s === "success") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (s === "notfound" || s === "not_found") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  };

  return (
    <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/70 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Monitor de Consultas</h3>
            <p className="text-xs text-muted-foreground">Tempo real • últimas 24h</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" /> {totalLastHour}/h
          </Badge>
          <Badge variant="outline" className="text-xs">{total24h} total</Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Carregando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Por tipo */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Por módulo
            </p>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">

              {byType.length === 0 && (
                <p className="text-xs text-muted-foreground">Sem dados</p>
              )}
              {byType.map((t) => {
                const pct = total24h ? (t.count / total24h) * 100 : 0;
                return (
                  <div key={t.type} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-foreground">/{t.type}</span>
                      <span className="text-muted-foreground">{t.count}</span>
                    </div>
                    <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Por usuário */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Top usuários
            </p>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {byUser.length === 0 && (
                <p className="text-xs text-muted-foreground">Sem dados</p>
              )}
              {byUser.map((u) => {
                const displayName = (u.name && u.name.trim()) || (u.username ? `@${u.username}` : `ID ${u.key}`);
                const handle = u.username ? `@${u.username}` : `ID ${u.key}`;
                return (
                  <div
                    key={u.key}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/40 min-h-[58px]"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted/70 shrink-0">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground leading-tight">{displayName}</div>
                      <div className="truncate text-[10px] text-muted-foreground/70 leading-tight mt-0.5">{handle}</div>
                    </div>
                    <div className="flex items-baseline gap-3 shrink-0 tabular-nums">
                      <div className="flex flex-col items-end leading-tight">
                        <span className="font-mono text-sm font-semibold text-foreground">{u.today}</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">hoje</span>
                      </div>
                      <div className="flex flex-col items-end leading-tight">
                        <span className="font-mono text-xs text-muted-foreground">{u.count}</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">24h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stream */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Stream ao vivo
            </p>
            <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
              {recent.length === 0 && (
                <p className="text-xs text-muted-foreground">Sem consultas</p>
              )}
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 text-xs py-1 border-b border-border/30 last:border-0"
                >
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColor(r.status)}`}>
                    {r.query_type}
                  </Badge>
                  <span className="truncate font-mono text-muted-foreground flex-1">
                    {r.query_input}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 shrink-0">
                    {formatDistanceToNow(new Date(r.created_at), { locale: ptBR, addSuffix: false })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
