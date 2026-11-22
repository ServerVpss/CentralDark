import { describe, expect, it } from 'vitest';
import {
  calculateRetryDelay,
  classifyError,
  diagnoseError,
  extractMissingPackages,
  shouldRetry,
  MAX_AUTOMATIC_ATTEMPTS,
} from './error-classifier';

describe('classifyError', () => {
  it('detecta pacote ausente em todas as formas que o runtime reporta', () => {
    expect(classifyError("Error: Cannot find module 'lodash'")).toBe('missing-package');
    expect(classifyError('Failed to resolve import "react-dom" from "src/main.tsx"')).toBe('missing-package');
    expect(classifyError("Module not found: Error: Can't resolve 'axios'")).toBe('missing-package');
    expect(classifyError({ code: 'ERR_MODULE_NOT_FOUND' })).toBe('unknown');
    expect(classifyError({ message: 'ERR_MODULE_NOT_FOUND' })).toBe('missing-package');
  });

  it('separa porta ocupada de erro de rede', () => {
    expect(classifyError('listen EADDRINUSE: address already in use :::5173')).toBe('port-in-use');
    expect(classifyError('Port 3000 is already in use')).toBe('port-in-use');
    expect(classifyError('connect ECONNREFUSED 127.0.0.1:8082')).toBe('network-error');
    expect(classifyError('fetch failed')).toBe('network-error');
  });

  it('reconhece erro de escrita do código', () => {
    expect(classifyError('SyntaxError: Unexpected token }')).toBe('syntax-error');
    expect(classifyError('Transform failed with 1 error')).toBe('syntax-error');
  });

  it('reconhece falhas de ambiente', () => {
    expect(classifyError('sh: pnpm: command not found')).toBe('command-not-found');
    expect(classifyError('EACCES: permission denied, open /app/x')).toBe('permission-denied');
    expect(classifyError('FATAL ERROR: JavaScript heap out of memory')).toBe('out-of-memory');
  });

  it('cai em vite-error só quando nenhum padrão específico casa', () => {
    expect(classifyError('[vite] Internal server error')).toBe('vite-error');

    // pacote ausente vence vite, mesmo o texto tendo as duas marcas
    expect(classifyError('[vite] Failed to resolve import "zod"')).toBe('missing-package');
  });

  it('não inventa classificação para entrada vazia ou desconhecida', () => {
    expect(classifyError('')).toBe('unknown');
    expect(classifyError(null)).toBe('unknown');
    expect(classifyError(undefined)).toBe('unknown');
    expect(classifyError('   ')).toBe('unknown');
    expect(classifyError('algo deu errado')).toBe('unknown');
  });

  it('lê Error e objetos com stderr/output', () => {
    expect(classifyError(new Error("Cannot find module 'vite'"))).toBe('missing-package');
    expect(classifyError({ stderr: 'EADDRINUSE' })).toBe('port-in-use');
    expect(classifyError({ output: 'SyntaxError: bad' })).toBe('syntax-error');
  });
});

describe('extractMissingPackages', () => {
  it('extrai o nome do pacote', () => {
    expect(extractMissingPackages("Cannot find module 'lodash'")).toEqual(['lodash']);
  });

  it('reduz subcaminho à raiz instalável', () => {
    expect(extractMissingPackages(`Failed to resolve import "lodash/merge"`)).toEqual(['lodash']);
    expect(extractMissingPackages(`Failed to resolve import "@scope/pkg/dist/x"`)).toEqual(['@scope/pkg']);
  });

  it('ignora import relativo e builtin — não são instaláveis', () => {
    expect(extractMissingPackages(`Failed to resolve import "./missing"`)).toEqual([]);
    expect(extractMissingPackages(`Failed to resolve import "../x/y"`)).toEqual([]);
    expect(extractMissingPackages(`Failed to resolve import "~/utils/path"`)).toEqual([]);
    expect(extractMissingPackages("Cannot find module 'node:fs'")).toEqual([]);
  });

  it('deduplica e junta múltiplos erros', () => {
    const log = [
      "Cannot find module 'react'",
      'Failed to resolve import "react"',
      'Failed to resolve import "zod"',
    ].join('\n');

    expect(extractMissingPackages(log).sort()).toEqual(['react', 'zod']);
  });

  it('devolve lista vazia quando não há pacote no texto', () => {
    expect(extractMissingPackages('EADDRINUSE')).toEqual([]);
    expect(extractMissingPackages(null)).toEqual([]);
  });
});

describe('calculateRetryDelay', () => {
  it('cresce exponencialmente e respeita o teto', () => {
    expect(calculateRetryDelay(1, 'missing-package')).toBe(400);
    expect(calculateRetryDelay(2, 'missing-package')).toBe(800);
    expect(calculateRetryDelay(3, 'missing-package')).toBe(1600);
    expect(calculateRetryDelay(99, 'port-in-use')).toBe(15_000);
  });

  it('não espera para erro que só o modelo corrige', () => {
    expect(calculateRetryDelay(1, 'syntax-error')).toBe(0);
    expect(calculateRetryDelay(3, 'command-not-found')).toBe(0);
    expect(calculateRetryDelay(2, 'permission-denied')).toBe(0);
  });

  it('trata attempt inválido sem quebrar', () => {
    expect(calculateRetryDelay(0, 'missing-package')).toBe(400);
    expect(calculateRetryDelay(-5, 'missing-package')).toBe(400);
  });
});

describe('shouldRetry', () => {
  it('para no limite de tentativas automáticas', () => {
    expect(shouldRetry('missing-package', 1)).toBe(true);
    expect(shouldRetry('missing-package', MAX_AUTOMATIC_ATTEMPTS - 1)).toBe(true);
    expect(shouldRetry('missing-package', MAX_AUTOMATIC_ATTEMPTS)).toBe(false);
  });

  it('nunca repete erro que precisa de correção do código', () => {
    expect(shouldRetry('syntax-error', 1)).toBe(false);
    expect(shouldRetry('permission-denied', 1)).toBe(false);
  });
});

describe('diagnoseError', () => {
  it('entrega diagnóstico completo para pacote ausente', () => {
    const d = diagnoseError("Cannot find module 'zod'");

    expect(d.type).toBe('missing-package');
    expect(d.missingPackages).toEqual(['zod']);
    expect(d.retryable).toBe(true);
    expect(d.humanHint).toContain('dependência');
  });

  it('não sugere pacote quando o erro não é de pacote', () => {
    const d = diagnoseError('SyntaxError: Unexpected token');

    expect(d.type).toBe('syntax-error');
    expect(d.missingPackages).toEqual([]);
    expect(d.retryable).toBe(false);
  });

  it('deixa de ser retryable ao esgotar as tentativas', () => {
    expect(diagnoseError("Cannot find module 'x'", MAX_AUTOMATIC_ATTEMPTS).retryable).toBe(false);
  });
});
