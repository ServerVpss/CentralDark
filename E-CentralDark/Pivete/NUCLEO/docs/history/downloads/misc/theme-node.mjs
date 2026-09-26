import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
const themeDependencyState = await ensureNodeDependencies(['chalk'], {
  taskName: process.env.NETFLIX_THEME_TASK_NAME || 'theme-node-dependencies',
});
const chalkModule = await importNodeDependency('chalk', {
  ensure: false,
  projectRoot: themeDependencyState.projectRoot,
});
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

export async function ensureNodeDependencies(dependencies = [], options = {}) {
  const requested = [...new Set(dependencies.filter(Boolean))];
  const taskName = options.taskName || process.env.NETFLIX_THEME_TASK_NAME || 'node-dependencies';
  const projectRoot = await findProjectRoot(options.projectRoot);
  const logPath = path.join(getDefaultRevisoesDir(taskName), 'dependencies.log');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse((await readFile(packageJsonPath, 'utf8')).replace(/^\uFEFF/, ''));
  const missing = [];

  for (const dependency of requested) {
    const available = await canImportDependency(dependency, projectRoot);
    if (available) continue;
    if (!isDependencyDeclared(packageJson, dependency)) {
      throw new Error(
        `Dependencia '${dependency}' nao esta instalada nem declarada em ${packageJsonPath}. ` +
        `Declare no package.json antes de executar. Log esperado: ${logPath}`,
      );
    }
    missing.push(dependency);
  }

  if (missing.length === 0) {
    return { ok: true, projectRoot, installed: false, missing: [], logPath };
  }

  if (process.env.NETFLIX_THEME_AUTO_INSTALL === '0') {
    throw new Error(
      `Dependencias ausentes (${missing.join(', ')}) e auto-install desativado. ` +
      `Log esperado: ${logPath}`,
    );
  }

  const hasPackageLock = await exists(path.join(projectRoot, 'package-lock.json'));
  const args = hasPackageLock ? ['ci'] : ['install'];
  const commandLabel = `npm ${args.join(' ')} --no-audit --no-fund`;
  const installResult = await runDependencyInstall(projectRoot, args, logPath, missing);

  if (!installResult.ok) {
    throw new Error(
      `Falha ao instalar dependencias Node com '${commandLabel}' em ${projectRoot}. ` +
      `Veja o log completo em ${installResult.logPath}.`,
    );
  }

  const stillMissing = [];
  for (const dependency of missing) {
    const available = await canImportDependency(dependency, projectRoot);
    if (!available) stillMissing.push(dependency);
  }

  if (stillMissing.length > 0) {
    throw new Error(
      `Instalacao terminou, mas ainda nao foi possivel resolver: ${stillMissing.join(', ')}. ` +
      `Veja o log completo em ${installResult.logPath}.`,
    );
  }

  return { ok: true, projectRoot, installed: true, missing, logPath: installResult.logPath };
}

export async function importNodeDependency(dependency, options = {}) {
  const dependencyState = options.ensure === false
    ? { projectRoot: options.projectRoot || await findProjectRoot(options.projectRoot) }
    : await ensureNodeDependencies([dependency], options);
  const module = await loadDependencyModule(dependency, dependencyState.projectRoot);

  if (!module) {
    throw new Error(
      `Dependencia '${dependency}' nao pode ser importada apos verificacao. ` +
      `Projeto: ${dependencyState.projectRoot}`,
    );
  }

  return module;
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

async function canImportDependency(dependency, projectRoot) {
  return Boolean(await loadDependencyModule(dependency, projectRoot).catch(() => null));
}

async function loadDependencyModule(dependency, projectRoot) {
  if (projectRoot) {
    try {
      const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
      const resolved = requireFromProject.resolve(dependency);
      return await import(pathToFileURL(resolved).href);
    } catch {
      // Falls back to normal ESM resolution below.
    }
  }

  return await import(dependency).catch(() => null);
}

async function findProjectRoot(explicitRoot) {
  if (explicitRoot || process.env.NETFLIX_THEME_PROJECT_ROOT) {
    const root = path.resolve(explicitRoot || process.env.NETFLIX_THEME_PROJECT_ROOT);
    if (await exists(path.join(root, 'package.json'))) return root;
    throw new Error(`package.json nao encontrado em ${root}`);
  }

  let current = path.dirname(fileURLToPath(import.meta.url));
  while (true) {
    if (await exists(path.join(current, 'package.json'))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error('package.json nao encontrado para verificar dependencias Node.');
}

function isDependencyDeclared(packageJson, dependency) {
  return Boolean(
    packageJson.dependencies?.[dependency] ||
    packageJson.devDependencies?.[dependency] ||
    packageJson.optionalDependencies?.[dependency] ||
    packageJson.peerDependencies?.[dependency],
  );
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runDependencyInstall(projectRoot, args, logPath, missing) {
  const npmCommand = 'npm';
  const installArgs = [...args, '--no-audit', '--no-fund'];
  const npmCache = path.join(path.dirname(logPath), 'npm-cache');
  const commandLabel = `npm ${installArgs.join(' ')}`;
  const startedAt = new Date().toISOString();
  const spinner = createDependencySpinner(`Instalando dependencias Node (${commandLabel})`);
  let output = [
    `Task: instalar dependencias Node`,
    `StartedAt: ${startedAt}`,
    `ProjectRoot: ${projectRoot}`,
    `Missing: ${missing.join(', ')}`,
    `Command: ${commandLabel}`,
    `NpmCache: ${npmCache}`,
    '',
  ].join('\n');

  spinner.start();

  const result = await new Promise((resolve) => {
    const child = spawn(npmCommand, installArgs, {
      cwd: projectRoot,
      env: {
        ...process.env,
        npm_config_cache: npmCache,
        npm_config_audit: 'false',
        npm_config_fund: 'false',
      },
      shell: process.platform === 'win32',
      windowsHide: true,
    });

    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.on('error', (error) => {
      output += `\nPROCESS_ERROR: ${error.message}\n`;
      resolve({ code: 1, error });
    });
    child.on('close', (code) => {
      resolve({ code });
    });
  });

  output += `\nFinishedAt: ${new Date().toISOString()}\nExitCode: ${result.code}\n`;
  await writeLog(logPath, output);

  if (result.code === 0) {
    spinner.succeed(`Dependencias Node instaladas. Log: ${logPath}`);
    return { ok: true, logPath };
  }

  spinner.fail(`Falha ao instalar dependencias Node. Log: ${logPath}`);
  return { ok: false, logPath };
}

function createDependencySpinner(message) {
  const frames = ['|', '/', '-', '\\'];
  const canAnimate = Boolean(process.stdout.isTTY);
  const silent = process.env.NETFLIX_THEME_SILENT === '1';
  let timer = null;
  let index = 0;

  function cleanMessage(text) {
    return sanitizeLog(text);
  }

  return {
    start() {
      if (silent) return this;
      if (!canAnimate) {
        console.log(`INFO ${cleanMessage(message)}`);
        return this;
      }
      process.stdout.write(`\r${frames[index]} ${cleanMessage(message)}`);
      timer = setInterval(() => {
        index = (index + 1) % frames.length;
        process.stdout.write(`\r${frames[index]} ${cleanMessage(message)}`);
      }, 90);
      return this;
    },
    succeed(text) {
      if (timer) clearInterval(timer);
      if (!silent && canAnimate) process.stdout.write('\r\x1b[2K');
      if (!silent) console.log(`OK ${cleanMessage(text)}`);
      return this;
    },
    fail(text) {
      if (timer) clearInterval(timer);
      if (!silent && canAnimate) process.stdout.write('\r\x1b[2K');
      if (!silent) console.error(`ERRO ${cleanMessage(text)}`);
      return this;
    },
  };
}
