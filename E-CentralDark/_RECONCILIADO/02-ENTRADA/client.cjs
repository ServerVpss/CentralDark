/**
 * Skills.sh API Client
 * 
 * Cliente para o marketplace skills.sh (https://www.skills.sh/docs)
 * Preparado para quando a API REST estiver disponível.
 * 
 * Uso:
 *   const skillsAPI = require('./integracoes/skills-api/client');
 *   const results = await skillsAPI.search('agent');
 *   const skill = await skillsAPI.getSkill('vercel-labs/agent-skills');
 */

const SKILLS_SH_BASE = 'https://www.skills.sh';

module.exports = {
  name: 'skills-api',
  description: 'Cliente para marketplace skills.sh',

  // Buscar skills no marketplace
  async search(query = '', options = {}) {
    const { limit = 20, category = null } = options;

    try {
      // Quando a API estiver disponível:
      // const res = await fetch(`${SKILLS_SH_BASE}/api/skills?q=${query}&limit=${limit}`);
      // return res.json();

      // Por enquanto: retorna skills conhecidas
      return {
        source: 'skills.sh',
        apiReady: false,
        query,
        results: [
          { owner: 'vercel-labs', repo: 'agent-skills', url: `${SKILLS_SH_BASE}/vercel-labs/agent-skills` },
          { owner: 'anthropics', repo: 'skills', url: `${SKILLS_SH_BASE}/anthropics/skills` },
        ],
        note: 'API skills.sh em desenvolvimento. Instale via CLI: npx skills add owner/repo',
      };
    } catch (err) {
      return { source: 'skills.sh', error: err.message, results: [] };
    }
  },

  // Detalhes de uma skill
  async getSkill(ownerRepo) {
    return {
      source: 'skills.sh',
      skill: ownerRepo,
      url: `${SKILLS_SH_BASE}/${ownerRepo}`,
      install: `npx skills add ${ownerRepo}`,
      badge: `https://skills.sh/b/${ownerRepo}`,
      apiReady: false,
    };
  },

  // Instalar skill (prepara comando, não executa)
  installCommand(ownerRepo) {
    return `npx skills add ${ownerRepo}`;
  },

  // Badge URL
  badgeUrl(ownerRepo) {
    return `https://skills.sh/b/${ownerRepo}`;
  },
};
