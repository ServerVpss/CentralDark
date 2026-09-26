#!/usr/bin/env node

const DEFAULT_ALLOWED_PREFIXES = [
  '🧿',
  '🛠️',
  '🤖',
  '🔐',
  '🔒',
  '🧮',
  '🧠',
  '📚',
  '⚙️',
  '✨',
  '🐞',
];

function splitEmojiPrefix(title) {
  const text = String(title ?? '').trim();
  const match = text.match(/^(\p{Extended_Pictographic}\uFE0F?)/u);
  if (!match) return { prefix: '', rest: text, hasEmoji: false };
  return {
    prefix: match[1],
    rest: text.slice(match[1].length).trim(),
    hasEmoji: true,
  };
}

export function validatePrTitle(rawTitle, options = {}) {
  const title = String(rawTitle ?? '').trim();
  const allowedPrefixes = options.allowedPrefixes ?? DEFAULT_ALLOWED_PREFIXES;
  const requireKnownPrefix = options.requireKnownPrefix ?? true;

  const errors = [];

  if (!title) {
    errors.push('PR_TITLE_EMPTY');
    return { ok: false, title, prefix: '', rest: '', errors };
  }

  const { prefix, rest, hasEmoji } = splitEmojiPrefix(title);

  if (!hasEmoji) {
    errors.push('PR_TITLE_MISSING_EMOJI_PREFIX');
  }

  if (requireKnownPrefix && !allowedPrefixes.includes(prefix)) {
    errors.push('PR_TITLE_EMOJI_PREFIX_NOT_CANONICAL');
  }

  if (!rest) {
    errors.push('PR_TITLE_TEXT_EMPTY_AFTER_EMOJI');
  }

  const letters = rest.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) {
    errors.push('PR_TITLE_TEXT_HAS_NO_LETTERS');
  }

  if (rest !== rest.toLocaleUpperCase('pt-BR')) {
    errors.push('PR_TITLE_TEXT_NOT_UPPERCASE');
  }

  return {
    ok: errors.length === 0,
    title,
    prefix,
    rest,
    errors,
  };
}

export function suggestedPrTitle(rawTitle, fallbackPrefix = '🧿') {
  const title = String(rawTitle ?? '').trim();
  if (!title) return `${fallbackPrefix} PR TITLE REQUIRED`;

  const detected = splitEmojiPrefix(title);
  const prefix = detected.hasEmoji ? detected.prefix : fallbackPrefix;
  const rest = detected.hasEmoji ? detected.rest : title;

  return `${prefix} ${rest.toLocaleUpperCase('pt-BR')}`.trim();
}

export function formatTitleValidation(result) {
  if (result.ok) {
    return `PASS: PR_TITLE_CONTRACT prefix=${result.prefix} title=${JSON.stringify(result.title)}`;
  }

  return [
    'FAIL: PR_TITLE_CONTRACT',
    `title=${JSON.stringify(result.title)}`,
    `errors=${result.errors.join(',')}`,
    `suggested=${JSON.stringify(suggestedPrTitle(result.title))}`,
  ].join('\n');
}

function runCli() {
  const title = process.env.PR_TITLE ?? process.argv.slice(2).join(' ');
  const result = validatePrTitle(title);
  const output = formatTitleValidation(result);

  if (result.ok) {
    console.log(output);
    return 0;
  }

  console.error(output);
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
