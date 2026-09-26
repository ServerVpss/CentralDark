// ═══════════════════════════════════════════════════════════════════
// 🕐 Central de Horário — versão frontend (TypeScript/ESM)
// ═══════════════════════════════════════════════════════════════════
// Fuso oficial do projeto: America/Sao_Paulo (Brasília).
// Documentação completa: central-horario/README.md
// NÃO duplicar essas funções em outros lugares. Sempre importar daqui.
// ═══════════════════════════════════════════════════════════════════

export const FUSO_BR = "America/Sao_Paulo";
export const LOCALE_BR = "pt-BR";

type EntradaData = Date | string | number;

function paraData(input: EntradaData): Date {
  return input instanceof Date ? input : new Date(input);
}

/** Data + hora completas: 03/06/2026 10:21 */
export function formatDateTimeBR(
  input: EntradaData = new Date(),
  options: Intl.DateTimeFormatOptions = {}
): string {
  return paraData(input).toLocaleString(LOCALE_BR, {
    timeZone: FUSO_BR,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

/** Apenas data: 03/06/2026 */
export function formatDateBR(
  input: EntradaData = new Date(),
  options: Intl.DateTimeFormatOptions = {}
): string {
  return paraData(input).toLocaleDateString(LOCALE_BR, {
    timeZone: FUSO_BR,
    ...options,
  });
}

/** Apenas hora: 10:21 */
export function formatTimeBR(
  input: EntradaData = new Date(),
  options: Intl.DateTimeFormatOptions = {}
): string {
  return paraData(input).toLocaleTimeString(LOCALE_BR, {
    timeZone: FUSO_BR,
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

/** Hora com segundos: 10:21:45 */
export function formatTimeWithSecondsBR(input: EntradaData = new Date()): string {
  return formatTimeBR(input, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Data curta tipo "qua., 03 jun" */
export function formatShortDateBR(input: EntradaData = new Date()): string {
  return paraData(input).toLocaleDateString(LOCALE_BR, {
    timeZone: FUSO_BR,
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** ISO no fuso BR: 2026-06-03T10:21:45-03:00 */
export function isoBR(input: EntradaData = new Date()): string {
  const d = paraData(input);
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO_BR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const pega = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return `${pega("year")}-${pega("month")}-${pega("day")}T${pega("hour")}:${pega("minute")}:${pega("second")}-03:00`;
}

/** Timestamp legível pra prefixar logs: 2026-06-03 10:21:45 -03 */
export function logTimeBR(input: EntradaData = new Date()): string {
  const d = paraData(input);
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO_BR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const pega = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return `${pega("year")}-${pega("month")}-${pega("day")} ${pega("hour")}:${pega("minute")}:${pega("second")} -03`;
}

// Aliases em português (atalhos pra quem preferir nomes em PT-BR)
export const formatarDataHoraBR = formatDateTimeBR;
export const formatarDataBR = formatDateBR;
export const formatarHoraBR = formatTimeBR;
export const formatarHoraComSegundosBR = formatTimeWithSecondsBR;
export const formatarDataCurtaBR = formatShortDateBR;
