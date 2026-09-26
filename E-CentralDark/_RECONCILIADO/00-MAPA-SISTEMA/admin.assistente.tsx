import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Bot, AlertTriangle, MessageSquare, Copy, Send, Filter, Sparkles } from "lucide-react";
import { listAssistantConversations } from "@/lib/assistant.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingDots } from "@/components/ui/loading-dots";
import { formatDateTimeBR } from "@/lib/datetime";
import { friendlyError } from "@/lib/friendly-error";

export const Route = createFileRoute("/admin/assistente")({ component: Page });

type ErrRow = {
  id: string;
  source: string;
  page_path: string | null;
  message: string;
  friendly_summary: string | null;
  telegram_sent_at: string | null;
  created_at: string;
  user_id: string | null;
  mode: string;
};

type ConvRow = {
  id: string;
  mode: string;
  page_path: string | null;
  model: string | null;
  title: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

function Page() {
  const fn = useServerFn(listAssistantConversations);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-assistente"],
    queryFn: () => fn(),
  });

  const [tab, setTab] = useState<"errors" | "conversations">("errors");
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"all" | "master" | "user" | "anon">("all");

  const errors = (data?.errors ?? []) as ErrRow[];
  const conversations = (data?.conversations ?? []) as ConvRow[];

  const filteredErrors = useMemo(() => {
    return errors.filter((e) => {
      if (mode !== "all" && e.mode !== mode) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        e.message?.toLowerCase().includes(s) ||
        e.page_path?.toLowerCase().includes(s) ||
        e.friendly_summary?.toLowerCase().includes(s)
      );
    });
  }, [errors, q, mode]);

  const filteredConvs = useMemo(() => {
    return conversations.filter((c) => {
      if (mode !== "all" && c.mode !== mode) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return c.title?.toLowerCase().includes(s) || c.page_path?.toLowerCase().includes(s);
    });
  }, [conversations, q, mode]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{friendlyError(error)}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Assistente — Histórico</h1>
        <Badge variant="outline" className="ml-2 gap-1">
          <Sparkles className="h-3 w-3" /> openai/gpt-5.5
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Tudo que a Assistente conversou e todo erro capturado no MultiZap (automático ou enviado pelo usuário).
        Aqui você vê o que aconteceu, em que tela, copia o relatório técnico e cola direto no chat da Lovable pra eu consertar.
      </p>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por mensagem, tela ou resumo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "master", "user", "anon"] as const).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "default" : "outline"}
                onClick={() => setMode(m)}
              >
                {m === "all" ? "Todos" : m === "master" ? "Master" : m === "user" ? "Usuário" : "Visitante"}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("errors")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "errors" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          <AlertTriangle className="inline h-4 w-4 mr-1" />
          Erros capturados ({filteredErrors.length})
        </button>
        <button
          onClick={() => setTab("conversations")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "conversations" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          <MessageSquare className="inline h-4 w-4 mr-1" />
          Conversas ({filteredConvs.length})
        </button>
      </div>

      {tab === "errors" && (
        <div className="space-y-3">
          {filteredErrors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhum erro registrado. Bom sinal!
              </CardContent>
            </Card>
          ) : (
            filteredErrors.map((e) => <ErrorCard key={e.id} row={e} />)
          )}
        </div>
      )}

      {tab === "conversations" && (
        <div className="space-y-3">
          {filteredConvs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma conversa ainda.
              </CardContent>
            </Card>
          ) : (
            filteredConvs.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={c.mode === "master" ? "default" : "secondary"}>{c.mode}</Badge>
                      {c.page_path && (
                        <span className="text-xs text-muted-foreground truncate">{c.page_path}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium truncate">{c.title ?? "(sem título)"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTimeBR(c.updated_at)} · {c.model ?? "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ErrorCard({ row }: { row: ErrRow }) {
  const [open, setOpen] = useState(false);
  const report = buildReport(row);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={row.mode === "master" ? "default" : "secondary"}>{row.mode}</Badge>
              <Badge variant="outline">{row.source}</Badge>
              {row.telegram_sent_at ? (
                <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
                  <Send className="h-3 w-3" /> Telegram enviado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Telegram pendente
                </Badge>
              )}
              {row.page_path && (
                <span className="text-xs text-muted-foreground truncate">{row.page_path}</span>
              )}
            </div>
            <CardTitle className="text-base">{row.friendly_summary ?? row.message}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">{formatDateTimeBR(row.created_at)}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(report);
              toast.success("Relatório copiado — cole no chat da Lovable.");
            }}
          >
            <Copy className="h-4 w-4 mr-1" /> Copiar relatório
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          {open ? "Ocultar detalhes técnicos" : "Ver detalhes técnicos"}
        </Button>
        {open && (
          <pre className="mt-3 text-xs bg-muted/40 rounded-md p-3 overflow-auto whitespace-pre-wrap break-words max-h-80">
            {report}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

function buildReport(e: ErrRow): string {
  return [
    `# Erro MultiZap`,
    `Data: ${formatDateTimeBR(e.created_at)}`,
    `Tela: ${e.page_path ?? "—"}`,
    `Modo: ${e.mode}`,
    `Fonte: ${e.source}`,
    `User ID: ${e.user_id ?? "—"}`,
    ``,
    `## Resumo leigo`,
    e.friendly_summary ?? "(sem resumo)",
    ``,
    `## Mensagem original`,
    e.message,
    ``,
    `## Pedido pra Lovable`,
    `Por favor analisar e corrigir o erro acima na tela ${e.page_path ?? "?"}. Manter o resto intacto.`,
  ].join("\n");
}
