// Comparação determinística GitHub main <-> checkout implantado.
// Lógica pura: recebe um executor `git` injetável para ser 100% testável
// sem depender da VPS real. run.mjs faz a integração com execFileSync real.

const FULL_SHA = /^[0-9a-f]{40}$/;

export function isFullSha(value) {
  return typeof value === 'string' && FULL_SHA.test(value);
}

export function sanitizeForLog(text) {
  if (!text) return text;
  return String(text)
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/g, '[REDACTED_TOKEN]')
    .replace(/github_pat_[A-Za-z0-9_]{20,}/g, '[REDACTED_TOKEN]')
    .replace(/Bearer\s+[A-Za-z0-9._-]{10,}/gi, 'Bearer [REDACTED]')
    .replace(/((?:api|access|secret)[-_]?key|token|password|senha)\s*[:=]\s*\S+/gi, '$1=[REDACTED]');
}

function isGitMissing(error) {
  const signal = String((error && (error.code || error.message)) || '');
  return /ENOENT|not found|not recognized|command not found/i.test(signal);
}

function safeRevParse(git, repoPath, ref) {
  try {
    return git(['-C', repoPath, 'rev-parse', ref]).trim();
  } catch {
    return '';
  }
}

/**
 * Avalia o drift entre o checkout local (repoPath) e origin/<branch>.
 * `git(args: string[]) => string` é injetado — nenhum caminho é inventado
 * aqui; quem chama decide de onde vem repoPath (fonte canônica: secret).
 */
export function evaluateDrift({ repoPath, expectedRepo = 'ServerVpss/CentralDark', branch = 'main', git }) {
  if (typeof git !== 'function') throw new Error('git runner obrigatório (injeção de dependência)');

  const base = { at: new Date().toISOString(), repository: expectedRepo, path: repoPath };

  if (!repoPath) {
    return { ...base, status: 'ERROR', code: 'CAMINHO_AUSENTE', motivo: 'nenhum caminho de checkout foi fornecido (fonte canônica indisponível)' };
  }

  let insideWorkTree;
  try {
    insideWorkTree = git(['-C', repoPath, 'rev-parse', '--is-inside-work-tree']).trim();
  } catch (error) {
    if (isGitMissing(error)) {
      return { ...base, status: 'ERROR', code: 'GIT_INDISPONIVEL', motivo: sanitizeForLog(String(error.message || error)) };
    }
    return { ...base, status: 'ERROR', code: 'CHECKOUT_AUSENTE', motivo: sanitizeForLog(String(error.message || error)) };
  }
  if (insideWorkTree !== 'true') {
    return { ...base, status: 'ERROR', code: 'CHECKOUT_AUSENTE', motivo: 'caminho informado não é um checkout git válido' };
  }

  try {
    git(['-C', repoPath, 'fetch', '--quiet', 'origin', branch]);
  } catch (error) {
    // Fetch falho nunca vira OK silencioso — é ERROR explícito.
    return { ...base, status: 'ERROR', code: 'FETCH_FALHOU', motivo: sanitizeForLog(String(error.message || error)) };
  }

  let currentBranch;
  try {
    currentBranch = git(['-C', repoPath, 'symbolic-ref', '--quiet', '--short', 'HEAD']).trim();
  } catch {
    currentBranch = 'DETACHED';
  }

  const localSha = safeRevParse(git, repoPath, 'HEAD');
  const originSha = safeRevParse(git, repoPath, `origin/${branch}`);
  if (!isFullSha(localSha) || !isFullSha(originSha)) {
    return { ...base, status: 'ERROR', code: 'DADOS_INCOMPLETOS', motivo: 'HEAD local ou origin/main não retornaram SHA válido' };
  }

  const statusPorcelain = git(['-C', repoPath, 'status', '--porcelain']);
  const dirty = statusPorcelain.trim().length > 0;

  const countsRaw = git(['-C', repoPath, 'rev-list', '--left-right', '--count', `${localSha}...${originSha}`]).trim();
  const [aheadStr, behindStr] = countsRaw.split(/\s+/);
  const ahead = Number(aheadStr);
  const behind = Number(behindStr);
  if (!Number.isFinite(ahead) || !Number.isFinite(behind)) {
    return { ...base, status: 'ERROR', code: 'DADOS_INCOMPLETOS', motivo: `contagem ahead/behind ilegível: "${countsRaw}"` };
  }

  let commitsFaltando = [];
  if (behind > 0) {
    try {
      commitsFaltando = git(['-C', repoPath, 'log', '--oneline', `${localSha}..${originSha}`, '-n', '5'])
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    } catch {
      commitsFaltando = [];
    }
  }

  const evidence = {
    ...base,
    branchLocal: currentBranch,
    shaLocal: localSha,
    shaOrigin: originSha,
    ahead,
    behind,
    dirty,
    commitsFaltando,
  };

  if (currentBranch !== branch) {
    return { ...evidence, status: 'DRIFT', code: 'BRANCH_DIVERGENTE', motivo: `checkout está em "${currentBranch}", esperado "${branch}"` };
  }
  if (dirty) {
    return { ...evidence, status: 'DRIFT', code: 'WORKING_TREE_SUJA', motivo: 'working tree tem alterações não commitadas' };
  }
  if (ahead > 0 && behind > 0) {
    return { ...evidence, status: 'DRIFT', code: 'DIVERGENCIA_DUPLA', motivo: `local tem ${ahead} commit(s) que origin não tem e está ${behind} atrás` };
  }
  if (behind > 0) {
    return { ...evidence, status: 'DRIFT', code: 'VPS_ATRASADA', motivo: `VPS está ${behind} commit(s) atrás de origin/${branch}` };
  }
  if (ahead > 0) {
    return { ...evidence, status: 'DRIFT', code: 'VPS_ADIANTADA', motivo: `VPS está ${ahead} commit(s) à frente de origin/${branch}` };
  }
  return { ...evidence, status: 'OK', code: 'ESTADO_OK', motivo: 'VPS sincronizada com origin/main' };
}

/** Chave estável de dedupe — mesma condição não abre Issue duplicada. */
export function driftDedupeKey(evidence) {
  return `drift|${evidence.code}|${evidence.branchLocal || ''}`;
}

/** Converte o resultado do drift no formato de divergência já usado pelo run.mjs. */
export function toDivergencia(evidence) {
  if (evidence.status === 'OK') return null;
  const sev = evidence.status === 'ERROR' ? 'p1' : evidence.code === 'DIVERGENCIA_DUPLA' ? 'p1' : 'p2';
  const linhas = [
    `Repositório: ${evidence.repository}`,
    `Branch local: ${evidence.branchLocal ?? '-'}`,
    `SHA local: ${evidence.shaLocal ?? '-'}`,
    `SHA origin/main: ${evidence.shaOrigin ?? '-'}`,
    `Ahead: ${evidence.ahead ?? '-'}`,
    `Behind: ${evidence.behind ?? '-'}`,
    `Working tree suja: ${evidence.dirty ?? '-'}`,
    evidence.commitsFaltando?.length ? `Commits faltando:\n${evidence.commitsFaltando.join('\n')}` : null,
    `Motivo: ${sanitizeForLog(evidence.motivo)}`,
  ].filter(Boolean);
  return {
    area: 'Drift-VPS',
    bot: 'claude',
    sev,
    titulo: `${evidence.status} (${evidence.code}) — VPS divergente do GitHub`,
    detalhe: linhas.join('\n'),
  };
}

/** Compara com o snapshot anterior e descreve recuperação, se houver. */
export function describeRecovery(previousSnapshot, currentEvidence) {
  const previousStatus = previousSnapshot?.vpsDrift?.status;
  if (previousStatus && previousStatus !== 'OK' && currentEvidence.status === 'OK') {
    return `Recuperado: estado anterior era ${previousStatus}/${previousSnapshot.vpsDrift.code}, agora ESTADO_OK.`;
  }
  return null;
}
