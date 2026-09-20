'use strict';

const TIME_ZONE = 'America/Sao_Paulo';
const LOCALE = 'pt-BR';
const DISPLAY_LABEL = 'BRT';

function asDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`invalid_date:${value}`);
  return date;
}

function formatBrasilia(value = new Date(), options = {}) {
  const date = asDate(value);
  const formatted = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options,
  }).format(date);
  return `${formatted} ${DISPLAY_LABEL}`;
}

function formatBrasiliaDate(value = new Date()) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(asDate(value));
}

function formatBrasiliaTime(value = new Date(), { seconds = true } = {}) {
  const options = {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  if (seconds) options.second = '2-digit';
  return `${new Intl.DateTimeFormat(LOCALE, options).format(asDate(value))} ${DISPLAY_LABEL}`;
}

function utcIso(value = new Date()) {
  return asDate(value).toISOString();
}

function nowPair() {
  const now = new Date();
  return {
    utc: utcIso(now),
    brasilia: formatBrasilia(now),
    timeZone: TIME_ZONE,
    label: DISPLAY_LABEL,
  };
}

module.exports = {
  TIME_ZONE,
  LOCALE,
  DISPLAY_LABEL,
  formatBrasilia,
  formatBrasiliaDate,
  formatBrasiliaTime,
  utcIso,
  nowPair,
};
