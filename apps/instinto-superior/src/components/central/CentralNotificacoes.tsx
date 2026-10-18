import { useEffect, useState } from "react";
import { Bell, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotificationsLog,
  type NotificationLog,
  type PeriodoFiltro,
} from "@/hooks/useNotificationsLog";

/** Notificação é ponte para a próxima intenção, nunca execução automática. */
function receitaCompleta(evento: NotificationLog): string {
  const meta = evento.metadata && typeof evento.metadata === "object" && !Array.isArray(evento.metadata)
    ? evento.metadata : {};
  const cmd = typeof meta["full_command"] === "string" ? meta["full_command"]
    : typeof meta["command"] === "string" ? meta["command"] : "";
  const cursor = typeof meta["next_cursor"] === "string" ? meta["next_cursor"] : "";
  const owner = typeof meta["owner"] === "string" ? meta["owner"] : evento.origem;
  return [
    `MISSÃO: ${evento.titulo}`, `OWNER: ${owner}`, `EVENTO: ${evento.id}`,
    `DATA: ${evento.created_at}`, evento.mensagem,
    cursor ? `PRÓXIMO: ${cursor}` : "",
    cmd ? `COMANDO COMPLETO: ${cmd}` : "",
    "Execução depende de aprovação, gate e recibo.",
  ].filter(Boolean).join("\n").slice(0, 12000);
}
/** Mesmo ledger e auth da CentralDark. Aviso NÃO executa agentes, nem prova o runtime. */
function Eventos({ items, limite }: { items: NotificationLog[]; limite: number }) {
  if (!items.length)
    return <p className="p-3 text-sm text-muted-foreground">Nenhum evento nesta janela.</p>;
  return (
    <ol className="max-h-96 space-y-2 overflow-y-auto" aria-label="Eventos recebidos">
      {items.slice(0, limite).map((evento) => (
        <li key={evento.id} className="rounded-lg border border-border p-3">
          <p className="text-sm font-medium">
            {evento.tipo === "critico" || evento.tipo === "erro"
              ? "🔴"
              : evento.tipo === "aviso"
                ? "🟡"
                : "🧿"}{" "}
            {evento.titulo}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-gold">
              Ver receita completa e próximo passo
            </summary>
            <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background/70 p-2 font-mono text-[11px]">
              {receitaCompleta(evento)}
            </pre>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => { void navigator.clipboard.writeText(receitaCompleta(evento)); }}
            >
              <Copy className="mr-1 size-3" /> Copiar missão para encaminhar
            </Button>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Envio direto exige o broker do setor autorizado. Copiar não executa.
            </p>
          </details>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Origem: {evento.origem} · {new Date(evento.created_at).toLocaleString("pt-BR")}
          </p>
        </li>
      ))}
    </ol>
  );
}

type Props =
  { modo: "sininho"; abrirCentral: () => void } | { modo: "painel"; abrirCentral?: never };
export function CentralNotificacoes(props: Props) {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");
  const [vistoAte, setVistoAte] = useState<number | null>(null);
  const { items, loading, erro, lastEventAt, realtimeStatus, refresh } =
    useNotificationsLog(periodo);
  useEffect(() => {
    if (!loading && vistoAte === null) setVistoAte(Date.now());
  }, [loading, vistoAte]);
  const novos =
    vistoAte === null ? 0 : items.filter((item) => Date.parse(item.created_at) > vistoAte).length;
  const estado = erro
    ? "FALHA DE LEITURA"
    : loading
      ? "CONSULTANDO"
      : realtimeStatus === "LIVE"
        ? "RECEBENDO AO VIVO"
        : "REALTIME NÃO COMPROVADO";
  const prova = lastEventAt
    ? lastEventAt.toLocaleString("pt-BR")
    : "Sem evento confirmado na janela";
  const lista = erro ? (
    <p role="alert" className="text-xs text-destructive">
      Leitura indisponível. UNKNOWN; não presumir lista vazia.
    </p>
  ) : (
    <Eventos items={items} limite={props.modo === "sininho" ? 5 : 100} />
  );

  if (props.modo === "sininho")
    return (
      <DropdownMenu
        onOpenChange={(aberto) => {
          if (aberto) setVistoAte(Date.now());
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Central de Notificações"
            aria-label={`Central de Notificações: ${novos} eventos novos nesta sessão`}
            className="relative"
          >
            <Bell className="size-4" />
            {novos > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1 text-[10px] text-white">
                {novos > 9 ? "9+" : novos}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-[min(92vw,380px)] space-y-2 p-3">
          <p className="text-sm font-semibold">🔔 Central de Notificações</p>
          <p className="text-xs text-muted-foreground">
            {estado} · Último evento: {prova}
          </p>
          {lista}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={props.abrirCentral}
          >
            Abrir Central no Admin
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Fonte: notifications_log · RLS/admin · notificação não é execução.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  return (
    <section aria-label="Central de Notificações" className="panel space-y-3 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">🔔 Central de Notificações</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="notify-periodo" className="text-xs">
            Janela
          </label>
          <select
            id="notify-periodo"
            className="rounded-md border border-border bg-background p-2 text-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
          >
            <option value="1h">1 hora</option>
            <option value="24h">24 horas</option>
            <option value="7d">7 dias</option>
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => void refresh()}
          >
            <RefreshCw className="size-4" /> Atualizar
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {estado} · Último evento: {prova}
      </p>
      {lista}
      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
        <p>Responsabilidade: receber e mostrar avisos autorizados; não executar comandos.</p>
        <p>Fonte: notifications_log com RLS e Realtime. Telegram usa notification_routes.</p>
        <p>
          Roteamento para setor, Hermes ou Harness ainda depende de adapter autorizado e recibo;
          single/parallel não são execução comprovada.
        </p>
      </div>
    </section>
  );
}
