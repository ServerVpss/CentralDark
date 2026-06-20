import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle, ExternalLink, MoreVertical, X, Copy, Check, Sparkles } from "lucide-react";
import { NewsTicker } from "@/components/webapp/NewsTicker";



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
  "fromcache", "cache_ttl_hours",
  "conta", "saldo", "tempo_segundos", "temposegundos", "cache",
  "cached_at", "expiracao", "limites", "plano", "requests_used",
  "requests_remaining", "daily_limit", "fallback_provider", "apikey",
  "prioridade", "raw", "meta", "request_id", "erro", "err", "status",
  "status_code", "statuscode", "code",
]);

// Chaves que sinalizam que o valor é uma imagem (renderizar como <img>)
const PHOTO_KEY_HINTS = ["foto", "fotos", "image", "imagem", "photo", "picture", "img", "avatar", "fotobase64", "base64"];
function isPhotoKey(k: string): boolean {
  const n = k.toLowerCase();
  return PHOTO_KEY_HINTS.some((h) => n === h || n.includes(h));
}
function isPhotoValue(v: any): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  // Data URL completa
  if (/^data:image\/(png|jpe?g|webp|gif|bmp);base64,/i.test(s)) return s;
  // URL direta de imagem
  if (/^https?:\/\/.+\.(png|jpe?g|webp|gif|bmp)(\?.*)?$/i.test(s)) return s;
  // Base64 puro grande (>200 chars, só caracteres base64) — assume JPEG
  if (s.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(s)) {
    return `data:image/jpeg;base64,${s.replace(/\s+/g, "")}`;
  }
  return null;
}

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

// Constrói um texto plano organizado por seção (CHAVE => VALOR), pronto pra copiar
function buildPlainText(payload: any, header?: string): string {
  const lines: string[] = [];
  if (header) {
    lines.push(`╔══════════════════════════════════════`);
    lines.push(`║ ${header}`);
    lines.push(`╚══════════════════════════════════════`);
    lines.push("");
  }

  const writeKV = (label: string, value: any, indent = "") => {
    const v = value === null || value === undefined ? "Não informado" : String(value);
    lines.push(`${indent}${formatLabel(label)} => ${v}`);
  };

  const writeNode = (key: string, value: any, indent = "") => {
    if (shouldHide(key) || isEmptyValue(value)) return;

    if (Array.isArray(value)) {
      lines.push("");
      lines.push(`${indent}━━━ ${formatLabel(key)} (${value.length}) ━━━`);
      value.forEach((item, i) => {
        if (item && typeof item === "object") {
          lines.push(`${indent}• ${formatLabel(key)} #${i + 1}`);
          Object.entries(item).forEach(([k, v]) => writeNode(k, v, indent + "  "));
        } else {
          writeKV(String(i + 1), item, indent + "  ");
        }
      });
      return;
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value).filter(
        ([k, v]) => !shouldHide(k) && !isEmptyValue(v),
      );
      if (entries.length === 0) return;
      lines.push("");
      lines.push(`${indent}━━━ ${formatLabel(key)} ━━━`);
      entries.forEach(([k, v]) => writeNode(k, v, indent + "  "));
      return;
    }

    writeKV(key, value, indent);
  };

  if (Array.isArray(payload)) {
    payload.forEach((item, i) => writeNode(`Registro ${i + 1}`, item));
  } else if (payload && typeof payload === "object") {
    Object.entries(payload).forEach(([k, v]) => writeNode(k, v));
  } else if (payload != null) {
    lines.push(String(payload));
  }

  return lines.join("\n").trim();
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
        <div className="w-2 bg-amber-500/80" />
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
  const photoSrc = isPhotoKey(label) ? isPhotoValue(value) : isPhotoValue(value);
  if (photoSrc) {
    return (
      <div className="px-3 py-3 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 self-start">
          {formatLabel(label)}
        </span>
        <img
          src={photoSrc}
          alt={formatLabel(label)}
          loading="lazy"
          className="max-w-full w-auto max-h-[420px] rounded-sm border border-zinc-700/60 object-contain bg-zinc-900"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    );
  }
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
  const [copied, setCopied] = useState(false);
  const [aiFormatted, setAiFormatted] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);



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

  // Dispara formatação por IA depois que o resultado carrega
  useEffect(() => {
    if (!data || aiFormatted || aiLoading) return;
    const errMsg = extractErrorMessage(unwrap(data.result_data));
    if (errMsg) return; // não chama IA em erro
    setAiLoading(true);
    const run = async () => {
      try {
        const initData = window.Telegram?.WebApp?.initData || "";
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/webapp-format-ai`, {
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
        });
        const json = await res.json();
        if (res.ok && json?.ok && json.formatted) {
          setAiFormatted(json.formatted);
        }
      } catch (err) {
        console.warn("[WebAppResult] IA falhou, usando fallback:", err);
      } finally {
        setAiLoading(false);
      }
    };
    run();
  }, [data, pathToken, secretToken, aiFormatted, aiLoading]);

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
          <button
            onClick={() => {
              try {
                window.Telegram?.WebApp?.close();
              } catch {
                // se não estiver dentro do Telegram, só fecha a aba
                window.close();
              }
            }}
            className="inline-flex items-center gap-1 text-xs text-amber-400 mt-2"
          >
            <ExternalLink className="h-3 w-3" /> Voltar ao Telegram
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const brand = "BRASIL BUSCAS";
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

  // Decide o que renderizar com base no formato real devolvido pela API.
  // Vale para QUALQUER módulo (CPF, CNPJ, Placa, Telefone, etc.).
  let body: React.ReactNode = null;

  if (errorMessage) {
    body = (
      <div className="mb-2 border border-amber-500/40 bg-amber-500/5 rounded-sm px-3 py-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-1">
            Sem resultado
          </div>
          <div className="font-mono text-[12px] text-zinc-100 break-words whitespace-pre-wrap">
            {errorMessage}
          </div>
        </div>
      </div>
    );
  } else if (Array.isArray(payload)) {
    // API devolveu uma lista direto no topo (ex.: várias pessoas, vários veículos)
    if (payload.length === 0) {
      body = <Section title="RESULTADO" empty />;
    } else if (typeof payload[0] === "object" && payload[0] !== null) {
      // Renderiza cada registro como uma seção independente — bem mais legível que tabela no celular
      body = payload.map((item, i) => (
        <Section key={i} title={`REGISTRO ${i + 1}`}>
          {Object.entries(item as Record<string, any>)
            .filter(([k, v]) => !shouldHide(k) && !isEmptyValue(v))
            .map(([k, v]) =>
              typeof v === "object" && v !== null ? (
                <div key={k} className="px-3 py-2">
                  {renderEntry(k, v)}
                </div>
              ) : (
                <Row key={k} label={k} value={v} />
              ),
            )}
        </Section>
      ));
    } else {
      body = (
        <Section title="RESULTADO">
          {payload.map((v, i) => (
            <Row key={i} label={String(i + 1)} value={v} />
          ))}
        </Section>
      );
    }
  } else if (payload && typeof payload === "object") {
    const topEntries = Object.entries(payload).filter(
      ([k, v]) => !shouldHide(k) && !isEmptyValue(v),
    );
    body =
      topEntries.length === 0 ? (
        <Section title="RESULTADO" empty />
      ) : (
        topEntries.map(([k, v]) => renderEntry(k, v))
      );
  } else if (typeof payload === "string" && payload.trim().length > 0) {
    // API devolveu texto cru — exibe em bloco monoespaçado preservando quebras
    body = (
      <Section title="RESULTADO">
        <div className="px-3 py-2">
          <pre className="font-mono text-[12px] text-zinc-100 whitespace-pre-wrap break-words m-0">
            {payload}
          </pre>
        </div>
      </Section>
    );
  } else {
    body = <Section title="RESULTADO" empty />;
  }

  // Se a IA formatou, usa a versão dela (mais bonita)
  if (aiFormatted && Array.isArray(aiFormatted.sections) && !errorMessage) {
    body = (
      <>
        {aiFormatted.sections.map((sec: any, i: number) => {
          const title = String(sec?.title || `SEÇÃO ${i + 1}`).toUpperCase();
          if (sec?.kind === "empty" || (!sec?.rows?.length && !sec?.data?.length && !sec?.text)) {
            return <Section key={i} title={title} empty />;
          }
          if (sec?.kind === "table" && Array.isArray(sec?.headers) && Array.isArray(sec?.data)) {
            return (
              <Section key={i} title={title}>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-[11px]">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-800/60">
                        <th className="text-left px-3 py-2 font-normal tracking-wider">#</th>
                        {sec.headers.map((h: string, j: number) => (
                          <th key={j} className="text-left px-3 py-2 font-normal tracking-wider whitespace-nowrap">
                            {String(h).toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.data.map((row: any[], r: number) => (
                        <tr key={r} className="border-b border-zinc-800/40 last:border-0">
                          <td className="px-3 py-2 text-zinc-500">{r + 1}</td>
                          {sec.headers.map((_: any, c: number) => (
                            <td key={c} className="px-3 py-2 text-zinc-100 whitespace-nowrap">
                              {String(row?.[c] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            );
          }
          if (sec?.kind === "text" && typeof sec?.text === "string") {
            return (
              <Section key={i} title={title}>
                <div className="px-3 py-2">
                  <pre className="font-mono text-[12px] text-zinc-100 whitespace-pre-wrap break-words m-0">
                    {sec.text}
                  </pre>
                </div>
              </Section>
            );
          }
          // rows (default)
          const rows = Array.isArray(sec?.rows) ? sec.rows : [];
          return (
            <Section key={i} title={title}>
              {rows.map((r: any, j: number) => (
                <Row key={j} label={String(r?.label ?? "")} value={r?.value} />
              ))}
            </Section>
          );
        })}
      </>
    );
  }

  // Texto plano completo pra botão "copiar tudo" (sem useMemo — está após early returns)
  const headerLine = `CONSULTA ${data.query_type.toUpperCase()} — ${brandUpper}\n${data.query_type.toUpperCase()}: ${data.query_input}\nData: ${dtStr}`;
  const corpoTxt = errorMessage
    ? `Sem resultado: ${errorMessage}`
    : (aiFormatted?.plain_text && typeof aiFormatted.plain_text === "string"
        ? aiFormatted.plain_text
        : buildPlainText(payload, ""));
  const rodapeTxt = `\n\nConsulta solicitada por: ${userLabel}\nBot: ${username || brand}`;
  const copyText = `${headerLine}\n${corpoTxt}${rodapeTxt}`;


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      try { window.Telegram?.WebApp && (window.Telegram.WebApp as any).HapticFeedback?.notificationOccurred?.("success"); } catch {}
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback antigo
      const ta = document.createElement("textarea");
      ta.value = copyText;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      ta.remove();
    }
  };


  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-zinc-100 overscroll-x-none touch-pan-y">
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

      <div className="w-full px-2 sm:px-4 md:px-6 py-3 max-w-3xl mx-auto text-[clamp(12px,2.8vw,14px)]">
        {/* News ticker — manchetes deslizando na diagonal (direita → esquerda) */}
        <NewsTicker />



        {/* Título principal da consulta */}
        <Section
          title={`CONSULTA ${data.query_type.toUpperCase()} ${brandUpper}`}
        />

        {/* Botão copiar tudo */}
        <button
          onClick={handleCopy}
          className="mb-3 w-full flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 transition rounded-sm px-3 py-2.5 font-mono text-[12px] text-amber-300"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> COPIADO!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> COPIAR TUDO FORMATADO
            </>
          )}
        </button>




        {body}




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
