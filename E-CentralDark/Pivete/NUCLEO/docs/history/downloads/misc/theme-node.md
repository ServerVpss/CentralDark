# OUTRO - theme-node.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\lib\theme-node.mjs
**SHA:** 197cf6deec8cc561
**Timestamp:** 2026-08-26T19:32:51.262578
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = [];
- return { ok: true, projectRoot, installed: false, missing: [], logPath };
- const stillMissing = [];
- `Missing: ${missing.join(', ')}`,

### Ouro Bruto (primeiros 5000 chars)
```
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
  if (typeof options.silent === 'boolean') state.silent =
```