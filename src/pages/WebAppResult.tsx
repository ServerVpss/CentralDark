import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle, ExternalLink, MoreVertical, X } from "lucide-react";

// Tipagem mínima do Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        themeParams: Record<string, string>;
        ready: () => void;
        expand: () => void;
        close: () => void;
        BackButton?: { show: () => void; onClick: (cb: () => void) => void };
        MainButton?: any;
        colorScheme?: "light" | "dark";
      };
    };
  }
}

interface ResultData {
  query_type: string;
  query_input: string;
  result_data: any;
  created_at: string;
  user?: { first_name?: string; username?: string; id?: number };
  bot_username?: string;
  bot_name?: string;
}

// Campos internos da API que não devem ser exibidos ao usuário final
const HIDDEN_KEYS = new Set([
  "sucesso", "success", "protocolo", "usuario", "consumo_hoje", "consumo",
  "total_diario", "reset_em", "inicio_uso", "vencimento", "tempo_restante",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais",
  "modulo", "comando", "duration_ms", "module_disabled", "error", "notfound",
  "fromcache", "cache_ttl_hours", "foto", "image", "photo", "fotobase64",
  "base64", "conta", "saldo", "tempo_segundos", "temposegundos", "cache",
  "cached_at", "expiracao", "limites", "plano", "requests_used",
  "requests_remaining", "daily_limit", "fallback_provider", "apikey",
  "prioridade", "raw", "meta", "request_id", "erro", "err", "status",
  "status_code", "statuscode", "code",
]);

// Chaves que indicam mensagem de erro vinda da API
const ERROR_KEYS = ["erro", "err", "error", "mensagem", "message", "msg", "detail", "detalhe"];

function extractErrorMessage(payload: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  // sucesso/success === false sinaliza erro
  const sucesso = payload.sucesso ?? payload.success;
  const hasErrorFlag = sucesso === false || payload.error === true || payload.notFound === true || payload.notfound === true;
  for (const k of ERROR_KEYS) {
    const v = payload[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  if (hasErrorFlag) return "Consulta sem resultados.";
  return null;
}

const HIDDEN_SUFFIXES = ["_consultada", "_consultado"];

function shouldHide(key: string): boolean {
  const n = key.toLowerCase().replace(/[\s-]/g, "_");
  if (HIDDEN_KEYS.has(n)) return true;
  return HIDDEN_SUFFIXES.some((s) => n.endsWith(s));
}

function isEmptyValue(v: any): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "" || s === "-" || s === "null" || s === "undefined";
  }
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

function formatLabel(key: string): string {
  // Converte snake_case / camelCase em "PALAVRAS MAIÚSCULAS"
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  return spaced.toUpperCase();
}

function formatValue(v: any): string {
  if (v === null || v === undefined) return "NÃO INFORMADO";
  if (typeof v === "boolean") return v ? "SIM" : "NÃO";
  if (typeof v === "number") return String(v);
  return String(v);
}

// Pega o payload real dentro de wrappers comuns usados por TODAS as APIs
// (data / dados / result / resultado / response / retorno / pessoas / registros / records / topLevelRecords)
function unwrap(d: any): any {
  if (!d || typeof d !== "object") return d;
  const wrappers = [
    "data", "dados", "result", "resultado", "response", "retorno", "payload", "body",
  ];
  for (const w of wrappers) {
    const inner = d[w];
    if (inner && typeof inner === "object") {
      // Não descer se houver outras chaves úteis no nível atual (evita perder contexto)
      const otherKeys = Object.keys(d).filter(
        (k) => k !== w && !shouldHide(k) && !isEmptyValue(d[k]),
      );
      if (otherKeys.length === 0) return unwrap(inner);
    }
  }
  // Quando o payload é só um array dentro de pessoas/registros/records, devolve o array
  const listKeys = ["pessoas", "registros", "records", "topLevelRecords", "items", "lista"];
  for (const w of listKeys) {
    if (Array.isArray(d[w])) {
      const otherKeys = Object.keys(d).filter(
        (k) => k !== w && !shouldHide(k) && !isEmptyValue(d[k]),
      );
      if (otherKeys.length === 0) return d[w];
    }
  }
  return d;
}

// ---- Render de seções no estilo X Buscas ----

function Section({
  title,
  children,
  empty,
}: {
  title: string;
  children?: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-stretch rounded-t-sm overflow-hidden border border-zinc-800/80 border-b-0">
        <div className="w-1 bg-amber-500/80" />
        <div className="flex-1 bg-zinc-900/60 px-3 py-2">
          <span className="font-mono text-[12px] tracking-wider text-zinc-300 font-semibold">
            {title}
          </span>
        </div>
      </div>
      {empty ? (
        <div className="border border-zinc-800/80 bg-zinc-950/40 rounded-b-sm px-3 py-2">
          <span className="font-mono text-[11px] text-zinc-500">• SEM INFORMAÇÕES</span>
        </div>
      ) : (
        <div className="border border-zinc-800/80 bg-zinc-950/40 rounded-b-sm divide-y divide-zinc-800/60">
          {children}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 self-center">
        {formatLabel(label)}
      </span>
      <span className="font-mono text-[12px] text-zinc-100 break-all">
        {formatValue(value)}
      </span>
    </div>
  );
}

function ArrayTable({ rows }: { rows: any[] }) {
  // Coleta todas as chaves visíveis
  const keys = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r && typeof r === "object" && !Array.isArray(r)) {
        Object.keys(r).forEach((k) => {
          if (!shouldHide(k)) set.add(k);
        });
      }
    });
    return Array.from(set);
  }, [rows]);

  if (keys.length === 0) {
    return (
      <div className="px-3 py-2">
        <span className="font-mono text-[11px] text-zinc-500">• SEM INFORMAÇÕES</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-[11px]">
        <thead>
          <tr className="text-zinc-500 border-b border-zinc-800/60">
            <th className="text-left px-3 py-2 font-normal tracking-wider">#</th>
            {keys.map((k) => (
              <th key={k} className="text-left px-3 py-2 font-normal tracking-wider whitespace-nowrap">
                {formatLabel(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-zinc-800/40 last:border-0">
              <td className="px-3 py-2 text-zinc-500">{i + 1}</td>
              {keys.map((k) => (
                <td key={k} className="px-3 py-2 text-zinc-100 whitespace-nowrap">
                  {formatValue(r?.[k] ?? "Não Informado")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Renderiza uma chave→valor decidindo se é seção, tabela, sub-seção ou linha
function renderEntry(key: string, value: any): React.ReactNode {
  if (shouldHide(key)) return null;

  // Array de objetos → tabela dentro de uma seção
  if (Array.isArray(value)) {
    if (value.length === 0) return <Section key={key} title={formatLabel(key)} empty />;
    if (typeof value[0] === "object" && value[0] !== null) {
      return (
        <Section key={key} title={formatLabel(key)}>
          <ArrayTable rows={value} />
        </Section>
      );
    }
    // Array de primitivos → lista
    return (
      <Section key={key} title={formatLabel(key)}>
        {value.map((v, i) => (
          <Row key={i} label={String(i + 1)} value={v} />
        ))}
      </Section>
    );
  }

  // Objeto → seção com linhas (e sub-seções quando aninhado)
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([k, v]) => !shouldHide(k) && !isEmptyValue(v));
    if (entries.length === 0) return <Section key={key} title={formatLabel(key)} empty />;

    const simpleRows = entries.filter(([, v]) => typeof v !== "object" || v === null);
    const nestedEntries = entries.filter(([, v]) => typeof v === "object" && v !== null);

    return (
      <div key={key}>
        {(simpleRows.length > 0 || nestedEntries.length === 0) && (
          <Section title={formatLabel(key)}>
            {simpleRows.length > 0
              ? simpleRows.map(([k, v]) => <Row key={k} label={k} value={v} />)
              : <div className="px-3 py-2"><span className="font-mono text-[11px] text-zinc-500">• SEM INFORMAÇÕES</span></div>}
          </Section>
        )}
        {nestedEntries.map(([k, v]) => renderEntry(k, v))}
      </div>
    );
  }

  // Valor escalar solto no topo → mostra como seção de uma linha
  return (
    <Section key={key} title={formatLabel(key)}>
      <Row label="VALOR" value={value} />
    </Section>
  );
}

export default function WebAppResult() {
  const { pathToken, secretToken } = useParams<{
    pathToken: string;
    secretToken: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResultData | null>(null);
  const [themeReady, setThemeReady] = useState(false);

  // Proteção anti-inspeção
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && (k === "u" || k === "s" || k === "p")) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k))
      ) {
        e.preventDefault();
      }
    };
    const blockDrag = (e: DragEvent) => e.preventDefault();
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("dragstart", blockDrag);
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    (document.body.style as any).webkitUserSelect = "none";
    (document.body.style as any).webkitTouchCallout = "none";
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("dragstart", blockDrag);
      document.body.style.userSelect = prev;
    };
  }, []);

  // Inicializa Telegram WebApp
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }
      setThemeReady(true);
    };
    script.onerror = () => setThemeReady(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // Busca o resultado validando initData
  useEffect(() => {
    if (!themeReady || !pathToken || !secretToken) return;

    const fetchResult = async () => {
      try {
        const initData = window.Telegram?.WebApp?.initData || "";
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(
          `${supabaseUrl}/functions/v1/webapp-get-result`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
            body: JSON.stringify({
              path_token: pathToken,
              secret_token: secretToken,
              init_data: initData,
            }),
          },
        );

        const json = await res.json();
        if (!res.ok) {
          const map: Record<string, string> = {
            tokens_ausentes: "Link inválido.",
            nao_encontrado: "Resultado não encontrado.",
            token_invalido: "Link inválido ou adulterado.",
            expirado: "Este resultado expirou. Faça a consulta novamente.",
            abra_pelo_telegram: "Abra esta página pelo botão dentro do Telegram.",
            assinatura_invalida: "Assinatura do Telegram inválida. Reabra pelo bot.",
            consulta_de_outro_usuario: "Este resultado pertence a outro usuário.",
            bot_nao_encontrado: "Configuração do bot ausente.",
            erro_interno: "Erro interno. Tente novamente.",
          };
          setError(map[json.error] || json.error || "Erro ao carregar.");
          return;
        }

        setData(json as ResultData);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o resultado.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [themeReady, pathToken, secretToken]);

  if (loading || !themeReady) {
    return (
      <div className="min-h-screen bg-black text-zinc-200 flex flex-col items-center justify-center gap-3 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm opacity-70 font-mono">Carregando resultado…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-zinc-200 p-4">
        <div className="rounded-xl p-5 flex flex-col items-center gap-3 text-center border border-zinc-800 bg-zinc-900/60">
          <AlertCircle className="h-10 w-10 text-amber-400" />
          <h2 className="text-base font-semibold">Não foi possível abrir</h2>
          <p className="text-sm opacity-80 max-w-sm font-mono">{error}</p>
          <a
            href="https://t.me"
            className="inline-flex items-center gap-1 text-xs text-amber-400 mt-2"
          >
            <ExternalLink className="h-3 w-3" /> Voltar ao Telegram
          </a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const brand = (data.bot_name || data.bot_username || "BOT").toString();
  const brandUpper = brand.toUpperCase();
  const username = data.bot_username ? `@${data.bot_username.toLowerCase()}` : "";
  const userLabel = data.user?.first_name
    ? `${data.user.first_name}${data.user.username ? ` (@${data.user.username})` : ""}`
    : data.user?.username
    ? `@${data.user.username}`
    : `ID ${data.user?.id ?? "—"}`;

  const dt = new Date(data.created_at);
  const dtStr = dt.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Desempacota o payload e remove metadados antes de iterar
  const payload = unwrap(data.result_data);
  const errorMessage = extractErrorMessage(payload);
  const topEntries =
    !errorMessage && payload && typeof payload === "object" && !Array.isArray(payload)
      ? Object.entries(payload).filter(([k, v]) => !shouldHide(k) && !isEmptyValue(v))
      : [];

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Barra de título estilo Mini App */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-950/90 backdrop-blur px-3 py-2.5 border-b border-zinc-800/80">
        <span className="font-mono text-sm font-semibold text-zinc-100">
          {brand}
        </span>
        <div className="flex items-center gap-2 text-zinc-400">
          <MoreVertical className="h-4 w-4" />
          <button
            onClick={() => window.Telegram?.WebApp?.close()}
            className="hover:text-zinc-200"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3 py-3 max-w-3xl mx-auto">
        {/* Faixa com logo/identidade */}
        <div className="bg-white rounded-sm px-3 py-3 mb-3 inline-block">
          <span className="font-mono text-sm font-bold text-black tracking-tight">
            {brand}
          </span>
        </div>

        {/* Título principal da consulta */}
        <Section
          title={`CONSULTA ${data.query_type.toUpperCase()} ${brandUpper}`}
        />

        {/* Banner de erro amigável quando a API retornou mensagem de erro */}
        {errorMessage ? (
          <div className="mb-2 border border-amber-500/40 bg-amber-500/5 rounded-sm px-3 py-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-1">
                Sem resultado
              </div>
              <div className="font-mono text-[12px] text-zinc-100 break-words">
                {errorMessage}
              </div>
            </div>
          </div>
        ) : topEntries.length === 0 ? (
          <Section title="RESULTADO" empty />
        ) : (
          topEntries.map(([k, v]) => renderEntry(k, v))
        )}

        {/* Rodapé estilo X Buscas */}
        <div className="mt-3 space-y-2">
          <div className="border border-zinc-800/80 bg-zinc-950/40 rounded-sm px-3 py-2">
            <span className="font-mono text-[11px] text-zinc-300">
              {data.query_type.toUpperCase()} FULL: {data.query_input}
            </span>
          </div>
          <div className="border border-zinc-800/80 bg-zinc-950/40 rounded-sm px-3 py-2">
            <span className="font-mono text-[11px] text-zinc-300">
              BY: {username || brand}
            </span>
          </div>
          <div className="border border-zinc-800/80 bg-zinc-950/40 rounded-sm px-3 py-2">
            <span className="font-mono text-[11px] text-zinc-300">
              USER: {userLabel}
            </span>
          </div>
        </div>


        <div className="mt-2 px-1 border-t border-zinc-800/60 pt-2">
          <span className="font-mono text-[10px] text-zinc-500">
            {data.query_type.toLowerCase()} • {dtStr}
          </span>
        </div>
      </div>

      {/* Rodapé fixo com username do bot */}
      <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800/80 px-3 py-2 text-center">
        <span className="font-mono text-[11px] text-zinc-400">
          {username || brand}
        </span>
      </div>
    </div>
  );
}
