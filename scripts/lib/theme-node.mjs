import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fallback = {
  red: (text) => `\x1b[38;2;229;9;20m${text}\x1b[0m`,
  green: (text) => `\x1b[38;2;0;210;106m${text}\x1b[0m`,
  cyan: (text) => `\x1b[38;2;0;229;255m${text}\x1b[0m`,
  yellow: (text) => `\x1b[38;2;255;193;7m${text}\x1b[0m`,
  blue: (text) => `\x1b[38;2;67;160;255m${text}\x1b[0m`,
  magenta: (text) => `\x1b[38;2;178;102;255m${text}\x1b[0m`,
  gray: (text) => `\x1b[38;2;148;163;184m${text}\x1b[0m`,
  white: (text) => `\x1b[38;2;245;245;245m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

const noColor = process.env.NO_COLOR === '1';
const shouldForceColor = process.env.CD_FORCE_COLOR === '1';
const shouldUseColor = !noColor && (shouldForceColor || Boolean(process.stdout.isTTY));
const chalkModule = await import('chalk').catch(() => null);
const chalk = shouldUseColor ? (chalkModule?.default ?? fallback) : createPlainChalk();

const state = {
  silent: process.env.NETFLIX_THEME_SILENT === '1',
  verbose: process.env.NETFLIX_THEME_VERBOSE === '1',
};

function createPlainChalk() {
  const plain = (text) => String(text ?? '');
  return {
    red: plain,
    green: plain,
    cyan: plain,
    yellow: plain,
    blue: plain,
    magenta: plain,
    gray: plain,
    white: plain,
    bold: plain,
  };
}

function print(line = '') {
  if (!state.silent) {
    console.log(line);
  }
}

function line() {
  return chalk.red('============================================================');
}

function label(text, color) {
  return `${color(text)} `;
}

export function setNetflixThemeOptions(options = {}) {
  if (typeof options.silent === 'boolean') state.silent = options.silent;
  if (typeof options.verbose === 'boolean') state.verbose = options.verbose;
}

export function netflixHeader(title = 'CentralDark / MultiZap') {
  if (!state.silent && process.stdout.isTTY) {
    console.clear();
  }
  print(line());
  print(chalk.red(chalk.bold(`  ${sanitizeLog(title)}`)));
  print(chalk.gray('  Tema Netflix Centralizado para Node'));
  print(line());
}

export function netflixStep(current, total, message) {
  print(`${chalk.blue(`[${current}/${total}]`)} ${chalk.white(sanitizeLog(message))}`);
}

export function netflixSuccess(message = 'Concluido') {
  print(`${label('OK', chalk.green)}${sanitizeLog(message)}`);
}

export function netflixInfo(message = 'Informacao') {
  if (state.verbose || !state.silent) {
    print(`${label('INFO', chalk.cyan)}${sanitizeLog(message)}`);
  }
}

export function netflixWarning(message = 'Atencao') {
  print(`${label('AVISO', chalk.yellow)}${sanitizeLog(message)}`);
}

export function netflixError(message = 'Falha') {
  print(`${label('ERRO', chalk.red)}${sanitizeLog(message)}`);
}

export function netflixDone() {
  print(line());
  print(chalk.green(chalk.bold('CONCLUIDO')));
}

export function netflixLog(message, level = 'info') {
  const clean = sanitizeLog(message);
  if (level === 'error') return netflixError(clean);
  if (level === 'warning') return netflixWarning(clean);
  if (level === 'success') return netflixSuccess(clean);
  return netflixInfo(clean);
}

export function createSpinner(message = 'Processando') {
  const frames = ['|', '/', '-', '\\'];
  let index = 0;
  let timer = null;
  let active = false;
  let currentMessage = sanitizeLog(message);
  const canAnimate = Boolean(process.stdout.isTTY);

  function render(frame) {
    if (state.silent || !canAnimate) return;
    process.stdout.write(`\r${chalk.magenta(frame)} ${currentMessage}`);
  }

  return {
    start(nextMessage) {
      if (nextMessage) currentMessage = sanitizeLog(nextMessage);
      if (state.silent || active) return this;
      active = true;
      if (!canAnimate) return this;
      render(frames[index]);
      timer = setInterval(() => {
        index = (index + 1) % frames.length;
        render(frames[index]);
      }, 90);
      return this;
    },
    text(nextMessage) {
      currentMessage = sanitizeLog(nextMessage);
      return this;
    },
    stop(finalMessage = '') {
      if (timer) clearInterval(timer);
      timer = null;
      if (active && !state.silent && canAnimate) {
        process.stdout.write('\r\x1b[2K');
        if (finalMessage) print(sanitizeLog(finalMessage));
      }
      active = false;
      return this;
    },
    succeed(finalMessage = currentMessage) {
      this.stop();
      netflixSuccess(finalMessage);
      return this;
    },
    fail(finalMessage = currentMessage) {
      this.stop();
      netflixError(finalMessage);
      return this;
    },
  };
}

export async function runWithSpinner(message, fn) {
  const spinner = createSpinner(message).start();
  try {
    const result = await fn();
    spinner.succeed(message);
    return result;
  } catch (error) {
    spinner.fail(message);
    throw error;
  }
}

export function sanitizeLog(text) {
  let clean = String(text ?? '');
  const replacements = [
    [/(authorization\s*[:=]\s*bearer\s+)[^\s"'`]+/gi, '$1[REDACTED]'],
    [/(bearer\s+)[A-Za-z0-9._~+/=-]{12,}/gi, '$1[REDACTED]'],
    [/(token|secret|password|passwd|pwd|api[_-]?key|session|cookie)(\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1$2[REDACTED]'],
    [/(database[_-]?url|redis[_-]?url|mongo(?:db)?[_-]?uri|connection[_-]?string|private[_-]?key|access[_-]?key|client[_-]?secret)(\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1$2[REDACTED]'],
    [/\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s"'`]+/gi, '$1://[REDACTED]'],
    [/([A-Za-z0-9_-]*TOKEN[A-Za-z0-9_-]*\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/g, '$1[REDACTED]'],
    [/([A-Za-z0-9_-]*SECRET[A-Za-z0-9_-]*\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/g, '$1[REDACTED]'],
    [/([A-Za-z0-9_-]*(?:PASSWORD|COOKIE|SESSION)[A-Za-z0-9_-]*\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1[REDACTED]'],
    [/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED_GITHUB_TOKEN]'],
    [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[REDACTED_JWT]'],
  ];

  for (const [pattern, replacement] of replacements) {
    clean = clean.replace(pattern, replacement);
  }
  return clean;
}

export async function writeLog(filePath, content) {
  const target = path.resolve(filePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${sanitizeLog(content)}\n`, 'utf8');
  return target;
}

export function getDefaultRevisoesDir(taskName = 'tema-node') {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
  const base = process.env.CENTRALDARK_REVISOES_DIR || '/root/Multizap/revisoes';
  return path.join(base, timestamp, taskName);
}

export function isMainModule(importMetaUrl) {
  return process.argv[1] === fileURLToPath(importMetaUrl);
}
