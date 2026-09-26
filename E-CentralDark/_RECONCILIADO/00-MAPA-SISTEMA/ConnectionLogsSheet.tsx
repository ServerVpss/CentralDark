// Drawer com o log completo de uma conexão WhatsApp.
// Mostra timeline unificada (Meta + Webhook + Mensagens + Auditoria),
// filtros, auto-refresh e expansão de payload JSON.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listConnectionFullLog, type ConnectionLogItem, type LogCategory } from "@/lib/whatsapp-logs.functions";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Webhook,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LoadingDots } from "@/components/ui/loading-dots";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string | null;
  connectionName?: string | null;
  /** Tipo da conexão. Para 'multizap_qr' / 'wuzapi_gateway' a categoria
   *  "Meta API" é escondida (não faz sentido pro QR). */
  provider?: string | null;
};

const CATEGORY_LABEL: Record<LogCategory, string> = {
  meta: "Meta API",
  webhook: "Webhook",
  message: "Mensagens",
  audit: "Auditoria",
};

const CATEGORY_ICON: Record<LogCategory, React.ComponentType<{ className?: string }>> = {
  meta: Zap,
  webhook: Webhook,
  message: MessageSquare,
  audit: ShieldAlert,
};

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return formatDateTimeBR(iso);
}

export function ConnectionLogsSheet({ open, onOpenChange, connectionId, connectionName, provider }: Props) {
  const fetchLogs = useServerFn(listConnectionFullLog);
  const p = (provider ?? "").toLowerCase();
  const isQr = p === "wuzapi_gateway" || p === "multizap_qr";
  // QR não fala com Meta — esconde categoria "meta" totalmente.
  const visibleCats: LogCategory[] = isQr
    ? ["webhook", "message", "audit"]
    : ["meta", "webhook", "message", "audit"];
  const [categories, setCategories] = useState<Set<LogCategory>>(new Set(visibleCats));

  const [onlyErrors, setOnlyErrors] = useState(false);
  const [search, setSearch] = useState("");
  const [sinceMinutes, setSinceMinutes] = useState<string>("1440"); // 24h
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const query = useQuery({
    enabled: !!connectionId && open,
    queryKey: ["connection-full-log", connectionId, Array.from(categories).sort().join(","), onlyErrors, search, sinceMinutes],
    queryFn: () => fetchLogs({
      data: {
        connectionId: connectionId!,
        categories: Array.from(categories),
        onlyErrors,
        search: search || undefined,
        sinceMinutes: sinceMinutes === "all" ? undefined : Number(sinceMinutes),
        limit: 300,
      },
    }),
    refetchInterval: autoRefresh ? 5000 : false,
    refetchOnWindowFocus: false,
  });

  const items = query.data?.items ?? [];
  const stats = query.data?.stats;

  function toggleCat(c: LogCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      if (next.size === 0) next.add(c); // sempre tem pelo menos 1
      return next;
    });
  }

  function copyAll() {
    if (!items.length) return;
    navigator.clipboard.writeText(JSON.stringify(items, null, 2));
    toast.success("Log copiado.");
  }

  function downloadAll() {
    if (!items.length) return;
    const blob = new Blob([JSON.stringify({ connectionId, exportedAt: new Date().toISOString(), items }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log-conexao-${connectionId?.slice(0, 8)}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-3xl flex-col gap-0 p-0 sm:max-w-3xl">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Log completo da conexão
          </SheetTitle>
          <SheetDescription className="truncate">
            {connectionName ?? connectionId ?? "—"}
          </SheetDescription>
        </SheetHeader>

        {/* Resumo */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 border-b p-3 text-center text-xs">
            <Stat label="Total" value={stats.total} />
            <Stat label="Eventos 24h" value={stats.events24h} />
            <Stat label="Erros 24h" value={stats.errors24h} tone={stats.errors24h > 0 ? "danger" : "muted"} />
            {isQr ? (
              <Stat label="Webhook" value={stats.byCategory.webhook} />
            ) : (
              <Stat label="Meta / Webhook" value={`${stats.byCategory.meta} / ${stats.byCategory.webhook}`} />
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="space-y-3 border-b p-3">
          <div className="flex flex-wrap gap-1.5">
            {visibleCats.map((c) => {

              const active = categories.has(c);
              const Icon = CATEGORY_ICON[c];
              return (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {CATEGORY_LABEL[c]}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar texto, ação, código…"
                className="h-9 pl-7 text-xs"
              />
            </div>
            <Select value={sinceMinutes} onValueChange={setSinceMinutes}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">Última 1h</SelectItem>
                <SelectItem value="360">Últimas 6h</SelectItem>
                <SelectItem value="1440">Últimas 24h</SelectItem>
                <SelectItem value="10080">Últimos 7d</SelectItem>
                <SelectItem value="43200">Últimos 30d</SelectItem>
                <SelectItem value="all">Tudo</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1.5">
              <Switch id="only-errors" checked={onlyErrors} onCheckedChange={setOnlyErrors} />
              <Label htmlFor="only-errors" className="text-xs">Só erros</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh" className="text-xs">Auto</Label>
            </div>
            <Button size="sm" variant="ghost" onClick={() => query.refetch()} disabled={query.isFetching}>
              <RefreshCw className={cn("h-3.5 w-3.5", query.isFetching && "animate-spin")} />
            </Button>
            <Button size="sm" variant="ghost" onClick={copyAll} disabled={!items.length}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={downloadAll} disabled={!items.length}>
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-3">
          {query.isLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>
          ) : query.error ? (
            <div className="rounded border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
              Erro ao carregar: {(query.error as Error).message}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-8 w-8 opacity-40" />
              Nenhum evento no período/filtro selecionado.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {items.map((it: ConnectionLogItem) => (
                <LogRow
                  key={it.id}
                  item={it}
                  expanded={expanded.has(it.id)}
                  onToggle={() => {
                    setExpanded((p) => {
                      const n = new Set(p);
                      if (n.has(it.id)) n.delete(it.id); else n.add(it.id);
                      return n;
                    });
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "danger" | "muted" }) {
  return (
    <div className="rounded border bg-card p-2">
      <div className={cn("text-base font-semibold", tone === "danger" && "text-red-500", tone === "muted" && "text-muted-foreground")}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function LogRow({ item, expanded, onToggle }: { item: ConnectionLogItem; expanded: boolean; onToggle: () => void }) {
  const Icon = CATEGORY_ICON[item.category];
  const isError = item.status === "error";
  const StatusIcon = isError ? AlertCircle : item.status === "started" ? Clock : CheckCircle2;

  return (
    <li className="overflow-hidden rounded border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-2 p-2 text-left transition hover:bg-muted/40"
      >
        <div className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isError ? "bg-red-500/15 text-red-500"
            : item.status === "started" ? "bg-amber-500/15 text-amber-500"
              : "bg-emerald-500/15 text-emerald-500",
        )}>
          <StatusIcon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
              <Icon className="h-2.5 w-2.5" /> {CATEGORY_LABEL[item.category]}
            </Badge>
            <code className="text-[11px] font-medium">{item.action}</code>
            {item.errorCode && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">cod {item.errorCode}</Badge>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">{relTime(item.createdAt)}</span>
          </div>
          {item.message && (
            <p className={cn("mt-0.5 truncate text-xs", isError ? "text-red-600" : "text-muted-foreground")}>
              {item.message}
            </p>
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t bg-muted/30 p-2">
          {item.errorMessage && (
            <div className="mb-2 rounded border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-600">
              <strong>Erro original da Meta:</strong> {item.errorMessage}
            </div>
          )}
          <pre className="max-h-72 overflow-auto rounded bg-background p-2 text-[10px] leading-relaxed">
{(() => {
  if (!item.payload) return "{}";
  try { return JSON.stringify(JSON.parse(item.payload), null, 2); } catch { return item.payload; }
})()}
          </pre>
          <div className="mt-1 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(JSON.stringify(item, null, 2));
                toast.success("Item copiado.");
              }}
            >
              <Copy className="mr-1 h-3 w-3" /> Copiar
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
