// Formatação de datas e horários no fuso de Brasília (America/Sao_Paulo).
// Todo o sistema deve usar estes helpers em vez de toLocale*("pt-BR") direto,
// pra que mesmo rodando em servidores em outro fuso (Cloudflare, Vercel etc.)
// o usuário sempre veja a hora local do Brasil.

const TZ = "America/Sao_Paulo";
const LOCALE = "pt-BR";

type Input = Date | string | number | null | undefined;

function toDate(input: Input): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/** Data + hora (ex.: "20/05/2026 10:18"). */
export function formatDateTimeBR(input: Input, options?: Intl.DateTimeFormatOptions): string {
  const d = toDate(input);
  if (!d) return "—";
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
    timeZone: TZ,
  };
  return new Intl.DateTimeFormat(LOCALE, opts).format(d);
}

/** Apenas data (ex.: "20/05/2026"). */
export function formatDateBR(input: Input, options?: Intl.DateTimeFormatOptions): string {
  const d = toDate(input);
  if (!d) return "—";
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
    timeZone: TZ,
  };
  return new Intl.DateTimeFormat(LOCALE, opts).format(d);
}

/** Apenas hora (ex.: "10:18"). */
export function formatTimeBR(input: Input, options?: Intl.DateTimeFormatOptions): string {
  const d = toDate(input);
  if (!d) return "—";
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
    timeZone: TZ,
  };
  return new Intl.DateTimeFormat(LOCALE, opts).format(d);
}

/** Retorna a data/hora "agora" no fuso de Brasília (objeto Date no instante atual). */
export function nowBR(): Date {
  return new Date();
}

/** String ISO formatada para logs no fuso de Brasília (ex.: "2026-05-20 10:18:42"). */
export function isoBR(input: Input = new Date()): string {
  const d = toDate(input);
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
