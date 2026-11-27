/**
 * Classificação de erros de execução do workbench.
 *
 * O `ActionRunner` hoje distingue apenas sucesso e falha: qualquer erro vira
 * um `ActionAlert` genérico. Sem saber QUE TIPO de erro ocorreu, não dá pra
 * decidir se vale tentar de novo, se falta instalar um pacote, ou se a única
 * saída é o modelo corrigir o código.
 *
 * Este módulo é lógica pura — sem I/O, sem dependências — para poder ser
 * testado sem WebContainer.
 */

export type ExecutionErrorType =
  | 'missing-package'
  | 'syntax-error'
  | 'port-in-use'
  | 'command-not-found'
  | 'permission-denied'
  | 'out-of-memory'
  | 'network-error'
  | 'vite-error'
  | 'unknown';

export interface ErrorDiagnosis {
  type: ExecutionErrorType;
  /** Pacotes que precisam ser instalados. Só preenchido em `missing-package`. */
  missingPackages: string[];
  /** Se vale tentar de novo sem intervenção do modelo. */
  retryable: boolean;
  /** Frase curta, em PT-BR, para mostrar a quem não lê stack trace. */
  humanHint: string;
}

/** Ordem importa: padrões mais específicos primeiro. */
const PATTERNS: Array<{ type: ExecutionErrorType; re: RegExp }> = [
  { type: 'missing-package', re: /cannot find module|failed to resolve import|module not found|ERR_MODULE_NOT_FOUND|is not installed/i },
  { type: 'port-in-use', re: /EADDRINUSE|address already in use|port \d+ is (?:already )?in use/i },
  { type: 'permission-denied', re: /EACCES|permission denied|operation not permitted/i },
  { type: 'out-of-memory', re: /ENOMEM|out of memory|heap out of memory|allocation failed/i },
  { type: 'command-not-found', re: /command not found|is not recognized as an internal|ENOENT.*spawn|executable not found/i },
  { type: 'network-error', re: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network (?:error|timeout)|fetch failed/i },
  { type: 'syntax-error', re: /syntaxerror|unexpected token|transform failed|parse error|unterminated|expected .*but found/i },
  { type: 'vite-error', re: /\[vite\]|pre-transform error|internal server error|hmr update failed/i },
];

const HINTS: Record<ExecutionErrorType, string> = {
  'missing-package': 'Falta instalar uma dependência.',
  'syntax-error': 'O código tem um erro de escrita e precisa ser corrigido.',
  'port-in-use': 'A porta já está ocupada — aguardando liberar.',
  'command-not-found': 'O comando não existe neste ambiente.',
  'permission-denied': 'Sem permissão para essa operação.',
  'out-of-memory': 'A memória acabou durante a execução.',
  'network-error': 'Falha de rede ao acessar um recurso externo.',
  'vite-error': 'O servidor de desenvolvimento recusou a alteração.',
  unknown: 'Erro não reconhecido.',
};

/** Tipos que se resolvem sozinhos ou com uma ação automática — vale repetir. */
const RETRYABLE: ReadonlySet<ExecutionErrorType> = new Set<ExecutionErrorType>([
  'missing-package',
  'port-in-use',
  'network-error',
  'out-of-memory',
]);

/**
 * Aceita string, Error, ou objeto com `message`/`stderr`/`output` — que são as
 * formas em que o erro chega do WebContainer, do shell e do Vite.
 */
function toText(input: unknown): string {
  if (input == null) {
    return '';
  }

  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof Error) {
    return `${input.message}\n${input.stack ?? ''}`;
  }

  if (typeof input === 'object') {
    const bag = input as Record<string, unknown>;
    return ['message', 'stderr', 'stdout', 'output', 'description', 'error']
      .map((k) => (typeof bag[k] === 'string' ? (bag[k] as string) : ''))
      .filter(Boolean)
      .join('\n');
  }

  return String(input);
}

export function classifyError(input: unknown): ExecutionErrorType {
  const text = toText(input);

  if (!text.trim()) {
    return 'unknown';
  }

  for (const { type, re } of PATTERNS) {
    if (re.test(text)) {
      return type;
    }
  }

  return 'unknown';
}

const PACKAGE_PATTERNS = [
  /cannot find module ['"]([^'"]+)['"]/gi,
  /failed to resolve import ['"]([^'"]+)['"]/gi,
  /module not found:.*?can't resolve ['"]([^'"]+)['"]/gi,
  /package ['"]([^'"]+)['"] is not installed/gi,
];

/** Import local (`./x`, `../x`, `/x`, `~/x`) não é pacote — é arquivo faltando. */
function isBarePackage(specifier: string): boolean {
  return !/^[./~]/.test(specifier) && !specifier.startsWith('node:');
}

/**
 * `@scope/pkg/dist/x` → `@scope/pkg` · `lodash/merge` → `lodash`
 * Sem isso, tentaríamos instalar um subcaminho, que sempre falha.
 */
function toPackageRoot(specifier: string): string {
  const parts = specifier.split('/');

  if (specifier.startsWith('@')) {
    return parts.slice(0, 2).join('/');
  }

  return parts[0];
}

export function extractMissingPackages(input: unknown): string[] {
  const text = toText(input);
  const found = new Set<string>();

  for (const re of PACKAGE_PATTERNS) {
    re.lastIndex = 0;

    for (const match of text.matchAll(re)) {
      const specifier = match[1]?.trim();

      if (specifier && isBarePackage(specifier)) {
        found.add(toPackageRoot(specifier));
      }
    }
  }

  return [...found];
}

const BASE_DELAY_MS: Record<ExecutionErrorType, number> = {
  'missing-package': 400,
  'port-in-use': 1500,
  'network-error': 1000,
  'out-of-memory': 2000,
  'syntax-error': 0,
  'command-not-found': 0,
  'permission-denied': 0,
  'vite-error': 600,
  unknown: 800,
};

const MAX_DELAY_MS = 15_000;

/**
 * Backoff exponencial por tipo. `attempt` é 1-based.
 * Tipos não-retryable devolvem 0 — não faz sentido esperar para repetir algo
 * que só o modelo pode corrigir.
 */
export function calculateRetryDelay(attempt: number, type: ExecutionErrorType): number {
  if (!RETRYABLE.has(type)) {
    return 0;
  }

  const safeAttempt = Math.max(1, Math.floor(attempt));
  const delay = BASE_DELAY_MS[type] * Math.pow(2, safeAttempt - 1);

  return Math.min(delay, MAX_DELAY_MS);
}

export const MAX_AUTOMATIC_ATTEMPTS = 4;

export function shouldRetry(type: ExecutionErrorType, attempt: number): boolean {
  return RETRYABLE.has(type) && attempt < MAX_AUTOMATIC_ATTEMPTS;
}

export function diagnoseError(input: unknown, attempt = 1): ErrorDiagnosis {
  const type = classifyError(input);

  return {
    type,
    missingPackages: type === 'missing-package' ? extractMissingPackages(input) : [],
    retryable: shouldRetry(type, attempt),
    humanHint: HINTS[type],
  };
}
