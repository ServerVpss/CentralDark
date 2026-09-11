export const CENTRALDARK_TIME_ZONE = 'America/Sao_Paulo';
export const CENTRALDARK_TIME_LOCALE = 'pt-BR';
export const CENTRALDARK_TIME_LABEL = 'BRT';

let dateFormattingInstalled = false;

function asDate(value: Date | string | number = new Date()): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`invalid_date:${String(value)}`);
  return date;
}

function withBrasilia(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
  if (options?.timeZone) return options;
  return { ...(options ?? {}), timeZone: CENTRALDARK_TIME_ZONE };
}

export function installCentralDarkDateFormatting(): void {
  if (dateFormattingInstalled || typeof Date === 'undefined') return;

  const nativeToLocaleString = Date.prototype.toLocaleString;
  const nativeToLocaleDateString = Date.prototype.toLocaleDateString;
  const nativeToLocaleTimeString = Date.prototype.toLocaleTimeString;

  Date.prototype.toLocaleString = function (
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return nativeToLocaleString.call(this, locales ?? CENTRALDARK_TIME_LOCALE, withBrasilia(options));
  } as typeof nativeToLocaleString;

  Date.prototype.toLocaleDateString = function (
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return nativeToLocaleDateString.call(this, locales ?? CENTRALDARK_TIME_LOCALE, withBrasilia(options));
  } as typeof nativeToLocaleDateString;

  Date.prototype.toLocaleTimeString = function (
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return nativeToLocaleTimeString.call(this, locales ?? CENTRALDARK_TIME_LOCALE, withBrasilia(options));
  } as typeof nativeToLocaleTimeString;

  dateFormattingInstalled = true;
}

export function formatBrasilia(
  value: Date | string | number = new Date(),
  options: Intl.DateTimeFormatOptions = {},
): string {
  const formatted = new Intl.DateTimeFormat(CENTRALDARK_TIME_LOCALE, {
    timeZone: CENTRALDARK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options,
  }).format(asDate(value));
  return `${formatted} ${CENTRALDARK_TIME_LABEL}`;
}

export function formatBrasiliaDate(value: Date | string | number = new Date()): string {
  return new Intl.DateTimeFormat(CENTRALDARK_TIME_LOCALE, {
    timeZone: CENTRALDARK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(asDate(value));
}

export function formatBrasiliaTime(
  value: Date | string | number = new Date(),
  seconds = true,
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: CENTRALDARK_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  if (seconds) options.second = '2-digit';
  return `${new Intl.DateTimeFormat(CENTRALDARK_TIME_LOCALE, options).format(asDate(value))} ${CENTRALDARK_TIME_LABEL}`;
}

export function utcIso(value: Date | string | number = new Date()): string {
  return asDate(value).toISOString();
}
