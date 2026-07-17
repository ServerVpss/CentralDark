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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const manager = require('./manager.cjs');

const moduleCache = new Map();
const methodologyCache = new Map();
const skillsRoot = path.resolve(__dirname, '..');

function resolveSkillPath(skillPath) {
  const fullPath = path.resolve(skillsRoot, skillPath);
  const insideSkillsRoot = fullPath === skillsRoot || fullPath.startsWith(`${skillsRoot}${path.sep}`);
  return insideSkillsRoot ? fullPath : null;
}

function loadSkillModule(skillPath) {
  const fullPath = resolveSkillPath(skillPath);
  if (!fullPath) return null;
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath);

  try {
    const mod = require(fullPath);
    moduleCache.set(fullPath, mod);
    return mod;
  } catch (err) {
    return null;
  }
}

function loadMethodologyDocument(skillPath) {
  const fullPath = resolveSkillPath(skillPath);
  if (!fullPath) {
    return { ok: false, error: `Caminho de metodologia fora de skills/: ${skillPath}` };
  }

  if (methodologyCache.has(fullPath)) return methodologyCache.get(fullPath);

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (!content.trim()) {
      return { ok: false, error: `Metodologia vazia: ${skillPath}` };
    }

    const loaded = {
      ok: true,
      content,
      sha256: crypto.createHash('sha256').update(content, 'utf-8').digest('hex'),
      fullPath,
    };
    methodologyCache.set(fullPath, loaded);
    return loaded;
  } catch (err) {
    return { ok: false, error: `Falha ao carregar metodologia "${skillPath}": ${err.message}` };
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
      const loaded = loadMethodologyDocument(skill.path);
      if (!loaded.ok) return loaded;

      const advice = getMethodologyAdvice(slug);
      const methodologyResult = {
        skillSlug: slug,
        skillPath: skill.path,
        skillSha256: loaded.sha256,
        skillContent: loaded.content,
        advice,
      };

      return {
        ok: true,
        type: 'methodology',
        slug,
        message: `Metodologia "${slug}" carregada de skills/${skill.path}`,
        path: skill.path,
        loaded: true,
        sha256: loaded.sha256,
        content: loaded.content,
        advice,
        result: methodologyResult,
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
    methodologyCache.clear();
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
    'tecnica-da-lupa-premium': 'Aplique Regra de Ouro, Zoom Out, Zoom In, Feynman, cenários, prova e rollback antes do veredito.',
  };
  return advices[slug] || 'Leia o SKILL.md para detalhes.';
}
