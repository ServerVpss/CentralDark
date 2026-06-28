/**
 * Skills Executor — Core (v2: pipeline + consciência)
 * 
 * Executa skill por nome. Valida se está ativa. Retorna resultado.
 * Suporta execução direta OU via consciência.
 * Suporta cadeia de execução (pipeline de skills).
 * 
 * Uso direto:
 *   executor.run('find-skills', { query: 'agent' })
 * 
 * Via consciência:
 *   consciousness.process('como resolver esse bug?')
 *   // → consciência escolhe 'systematic-debugging' e chama executor
 * 
 * Pipeline:
 *   executor.pipeline(['brainstorming', 'writing-plans'], { topic: 'melhorar chat' })
 */

const path = require('path');
const manager = require('./manager.cjs');

const moduleCache = new Map();

function loadSkillModule(skillPath) {
  const fullPath = path.join(__dirname, '..', skillPath);
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath);

  try {
    const mod = require(fullPath);
    moduleCache.set(fullPath, mod);
    return mod;
  } catch (err) {
    return null;
  }
}

module.exports = {
  // Executar skill por slug
  async run(slug, params = {}) {
    const skill = manager.get(slug);

    if (!skill) {
      return { ok: false, error: `Skill "${slug}" não encontrada` };
    }

    if (!skill.active) {
      return { ok: false, error: `Skill "${slug}" desativada. Ative primeiro.` };
    }

    if (skill.type === 'methodology') {
      return {
        ok: true,
        type: 'methodology',
        message: `"${slug}" é metodologia. Leia: skills/${skill.path}`,
        path: skill.path,
        advice: getMethodologyAdvice(slug),
      };
    }

    const mod = loadSkillModule(skill.path);
    if (!mod) {
      return { ok: false, error: `Módulo não encontrado: ${skill.path}` };
    }

    if (typeof mod.execute !== 'function') {
      return { ok: false, error: `"${slug}" não exporta execute()` };
    }

    try {
      const result = await mod.execute(params);
      return { ok: true, type: 'executable', slug, result };
    } catch (err) {
      return { ok: false, error: `Erro em "${slug}": ${err.message}` };
    }
  },

  // Pipeline: executar skills em sequência, output → input
  async pipeline(skillSlugs, params = {}) {
    const results = [];
    let chainedParams = { ...params };

    for (const slug of skillSlugs) {
      const result = await this.run(slug, chainedParams);
      results.push({ slug, ...result });

      if (!result.ok) break;

      // Encadear: resultado vira input do próximo
      if (result.result) {
        chainedParams = { ...chainedParams, previousResult: result.result, previousSkill: slug };
      }
    }

    return {
      action: 'pipeline',
      skills: skillSlugs,
      results,
      success: results.every(r => r.ok),
      totalSteps: skillSlugs.length,
      completedSteps: results.filter(r => r.ok).length,
    };
  },

  // Listar executáveis
  listExecutable() {
    return manager.listByType('executable');
  },

  // Pode executar?
  canRun(slug) {
    const skill = manager.get(slug);
    return skill && skill.active && skill.type === 'executable';
  },

  // Limpar cache
  clearCache() {
    moduleCache.clear();
  },
};

// Conselhos rápidos para skills de metodologia
function getMethodologyAdvice(slug) {
  const advices = {
    'code-review': 'Revise: segurança, performance, legibilidade, testes.',
    'systematic-debugging': 'Sem tentativa e erro. Logs → hipótese → validação → fix.',
    'documentation-memory': 'Atualize STATE.md e CHANGELOG ao final de cada tarefa.',
    'runtime-error-prevention': 'Verifique imports, tipos, null checks antes de concluir.',
    'using-superpowers': 'Use todas as ferramentas disponíveis (bash, fetch, file).',
    'verification-before-completion': 'Build deve passar. Console sem erros. Evidência real.',
    'writing-plans': 'Plano de 7 pontos para tarefas multi-arquivo.',
  };
  return advices[slug] || 'Leia o SKILL.md para detalhes.';
}
