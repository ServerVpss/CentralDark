import { useEffect, useState } from "react";
import { Bell, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncActionButton } from "@/components/central/SyncActionButton";
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

/** O RED é uma projeção do ledger existente, nunca uma fila paralela. */
function isRedCentralDark(evento: NotificationLog): boolean {
  return evento.origem === "cline_toolcall_red"
    || (evento.metadata?.["pr_number"] === "1903"
      && typeof evento.metadata?.["red_id"] === "string");
}

function linkRedValido(evento: NotificationLog): string | null {
  const value = evento.metadata?.["pr_url"];
  if (typeof value !== "string") return null;
  // URL fixa por repositório e PR; não usar href arbitrário de telemetria.
  return /^https:\/\/github\.com\/ServerVpss\/CentralDark\/pull\/1903$/.test(value)
    ? value : null;
}

/** Notificação é ponte para a próxima intenção, nunca execução automática. */
function receitaCompleta(evento: NotificationLog): string {
  const meta = evento.metadata && typeof evento.metadata === "object" && !Array.isArray(evento.metadata)
    ? evento.metadata : {};
  const cmd = typeof meta["full_command"] === "string" ? meta["full_command"]
    : typeof meta["command"] === "string" ? meta["command"] : "";
  const cursor = typeof meta["next_cursor"] === "string" ? meta["next_cursor"] : "";
  const owner = typeof meta["owner"] === "string" ? meta["owner"] : evento.origem;
  const estadoProva = typeof meta["proof_state"] === "string" ? meta["proof_state"] : "UNKNOWN";
  const publicacao = typeof meta["publication_mode"] === "string" ? meta["publication_mode"] : "NOT_ATTESTED";
  const fonte = typeof meta["source_surface"] === "string" ? meta["source_surface"] : "NOT_ATTESTED";
  return [
    `MISSÃO: ${evento.titulo}`, `OWNER: ${owner}`, `EVENTO: ${evento.id}`,
    `DATA: ${evento.created_at}`,
    `ESTADO DA PROVA: ${estadoProva}`,
    `PUBLICAÇÃO: ${publicacao} · FONTE: ${fonte}`,
    evento.mensagem,
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
          {isRedCentralDark(evento) ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-destructive">
                RED #{String(evento.metadata?.["red_id"] ?? "UNKNOWN").slice(0, 8)}
              </span>
              <span className="font-mono text-muted-foreground">
                {String(evento.metadata?.["error_code"] ?? "ERROR").slice(0, 60)}
              </span>
              {linkRedValido(evento) ? (
                <a href={linkRedValido(evento) ?? undefined} target="_blank"
                  rel="noopener noreferrer" className="text-gold underline">
                  🧠 PR DOS RED #1903
                </a>
              ) : null}
            </div>
          ) : null}
          {typeof evento.metadata?.["proof_state"] === "string" ? (
            <p className="mt-1 text-xs text-muted-foreground">
              PROVA: {String(evento.metadata["proof_state"]).slice(0, 24)}
              {" · "}{String(evento.metadata["publication_mode"] ?? "FONTE NÃO COMPROVADA").slice(0, 60)}
            </p>
          ) : null}
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

// Filtros visuais por origem, sem tocar em rotas de entrega ou executar scripts.
type FonteNotificacao = "claude" | "powershell" | "hermes" | "dream" | "sistema";
const FONTES: ReadonlyArray<{ id: FonteNotificacao; titulo: string }> = [
  { id: "claude", titulo: "Claude" }, { id: "powershell", titulo: "PowerShell" },
  { id: "hermes", titulo: "Hermes" }, { id: "dream", titulo: "Dream" },
  { id: "sistema", titulo: "CentralDark / Sistema" },
];
function fonteEvento(evento: NotificationLog): FonteNotificacao {
  const origem = evento.origem.toLowerCase();
  if (origem.includes("claude")) return "claude";
  if (origem.includes("powershell")) return "powershell";
  if (origem.includes("hermes")) return "hermes";
  if (origem.includes("dream")) return "dream";
  return "sistema";
}
type Props =
  { modo: "sininho"; abrirCentral: () => void } | { modo: "painel"; abrirCentral?: never };
export function CentralNotificacoes(props: Props) {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");
  const [soReds, definirSoReds] = useState(false);
  const [preferenciasCarregadas, definirPreferenciasCarregadas] = useState(false);
  const [fontesAtivas, definirFontesAtivas] = useState<Record<FonteNotificacao, boolean>>({
    claude: true, powershell: true, hermes: true, dream: true, sistema: true,
  });
  const [vistoAte, setVistoAte] = useState<number | null>(null);
  // Preferencias locais de EXIBICAO, nao da entrega: sem credenciais no storage.
  useEffect(() => {
    try {
      const gravadas = JSON.parse(window.localStorage.getItem("centraldark-notify-fontes-v1") || "{}") as Record<string, unknown>;
      definirFontesAtivas((atuais) => {
        const novas = { ...atuais };
        for (const fonte of FONTES)
          if (typeof gravadas[fonte.id] === "boolean") novas[fonte.id] = gravadas[fonte.id] as boolean;
        return novas;
      });
    } catch { /* Sem storage: preferencias somente nesta montagem. */ }
    definirPreferenciasCarregadas(true);
  }, []);
  useEffect(() => {
    if (!preferenciasCarregadas) return;
    try { window.localStorage.setItem("centraldark-notify-fontes-v1", JSON.stringify(fontesAtivas)); }
    catch { /* storage opcional */ }
  }, [preferenciasCarregadas, fontesAtivas]);
  const { items, loading, erro, lastEventAt, realtimeStatus, refresh } =
    useNotificationsLog(periodo);
  useEffect(() => {
    if (!loading && vistoAte === null) setVistoAte(Date.now());
  }, [loading, vistoAte]);
  const visiveis = items.filter((evento) => fontesAtivas[fonteEvento(evento)]);
  const reds = visiveis.filter(isRedCentralDark);
  const novos =
    vistoAte === null ? 0 : items.filter((item) => Date.parse(item.created_at) > vistoAte).length;
  const novosReds =
    vistoAte === null ? 0 : reds.filter((item) => Date.parse(item.created_at) > vistoAte).length;
  const estado = erro
    ? "FALHA DE LEITURA"
    : loading
      ? "CONSULTANDO"
      : realtimeStatus === "LIVE"
        ? "CANAL REALTIME CONECTADO · ENTREGA AINDA DEPENDE DE EVENTO"
        : "REALTIME NÃO COMPROVADO · CONSULTA DE RECUPERAÇÃO ATIVA";
  const prova = lastEventAt
    ? lastEventAt.toLocaleString("pt-BR")
    : "Sem evento confirmado na janela";
  const lista = erro ? (
    <p role="alert" className="text-xs text-destructive">
      Leitura indisponível. UNKNOWN; não presumir lista vazia.
    </p>
  ) : (
    <Eventos items={props.modo === "painel" && soReds ? reds : visiveis}
      limite={props.modo === "sininho" ? 5 : 100} />
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
                {novosReds > 0 ? "🔴" : novos > 9 ? "9+" : novos}
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
        <h3 className="text-lg font-semibold">🔔 Central de Notificações CentralDark</h3>
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
          <SyncActionButton
            label="Atualizar"
            onClick={() => void refresh()}
            isFetching={loading}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {estado} · Último evento: {prova}
      </p>
      <fieldset className="rounded-lg border border-border/70 p-3">
        <legend className="px-1 text-xs font-semibold">Origens visíveis · ligar / desligar</legend>
        <div className="flex flex-wrap gap-3">
          {FONTES.map((fonte) => (
            <label key={fonte.id} className="flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" checked={fontesAtivas[fonte.id]}
                aria-label={`Exibir notificações de ${fonte.titulo}`}
                onChange={(evento) => definirFontesAtivas((anterior) => ({
                  ...anterior, [fonte.id]: evento.target.checked,
                }))} />
              {fonte.titulo}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Filtros desta tela; não modificam envio, assinaturas, segurança nem execução automática.
        </p>
      </fieldset>
      <div className="flex flex-wrap items-center gap-2" aria-label="Filtro do PR dos RED">
        <Button size="sm" type="button" variant={soReds ? "default" : "outline"}
          aria-pressed={soReds} onClick={() => definirSoReds(!soReds)}>
          🔴 PR DOS RED · {erro ? "UNKNOWN" : reds.length}
        </Button>
        <span className="text-[11px] text-muted-foreground">
          Origem: Supabase / notifications_log · PR #1903 · somente leitura
        </span>
      </div>
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
