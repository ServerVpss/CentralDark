/**
 * Skills Manager — Core
 * 
 * Carrega, lista, ativa/desativa e categoriza skills.
 * Compatível com skills existentes (.md) e novas (.js).
 * 
 * Uso:
 *   const manager = require('./skills/core/manager');
 *   manager.listAll();
 *   manager.listByCategory('ai');
 *   manager.enable('find-skills');
 *   manager.disable('brainstorming');
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'skills.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return { methodology: { skills: [] }, executable: { skills: [] }, categories: [] };
  }
}

function saveConfig(config) {
  config.lastUpdated = new Date().toISOString().split('T')[0];
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function allSkills() {
  const config = loadConfig();
  const methodology = (config.methodology?.skills || []).map(s => ({ ...s, layer: 'methodology' }));
  const executable = (config.executable?.skills || []).map(s => ({ ...s, layer: 'executable' }));
  return [...methodology, ...executable];
}

module.exports = {
  // Listar todas as skills (metodologia + executáveis)
  listAll() {
    return allSkills();
  },

  // Listar por tipo (methodology ou executable)
  listByType(type) {
    return allSkills().filter(s => s.type === type);
  },

  // Listar por categoria
  listByCategory(category) {
    return allSkills().filter(s => (s.category || s.type) === category);
  },

  // Listar ativas
  listActive() {
    return allSkills().filter(s => s.active);
  },

  // Listar categorias
  categories() {
    return loadConfig().categories || [];
  },

  // Buscar skill
  get(slug) {
    return allSkills().find(s => s.slug === slug) || null;
  },

  // Ativar skill
  enable(slug) {
    const config = loadConfig();
    let found = false;
    for (const section of ['methodology', 'executable']) {
      const skill = config[section]?.skills?.find(s => s.slug === slug);
      if (skill) { skill.active = true; found = true; break; }
    }
    if (!found) return { ok: false, error: 'Skill não encontrada' };
    saveConfig(config);
    return { ok: true };
  },

  // Desativar skill
  disable(slug) {
    const config = loadConfig();
    let found = false;
    for (const section of ['methodology', 'executable']) {
      const skill = config[section]?.skills?.find(s => s.slug === slug);
      if (skill) { skill.active = false; found = true; break; }
    }
    if (!found) return { ok: false, error: 'Skill não encontrada' };
    saveConfig(config);
    return { ok: true };
  },

  // Toggle
  toggle(slug) {
    const skill = this.get(slug);
    if (!skill) return { ok: false, error: 'Skill não encontrada' };
    return skill.active ? this.disable(slug) : this.enable(slug);
  },

  // Adicionar skill executável
  addExecutable({ slug, path: skillPath, category, description }) {
    const config = loadConfig();
    if (allSkills().find(s => s.slug === slug)) return { ok: false, error: 'Slug já existe' };
    config.executable.skills.push({
      slug, path: skillPath, type: 'executable',
      category: category || 'external', active: false, description: description || '',
    });
    saveConfig(config);
    return { ok: true };
  },

  // Relatório
  report() {
    const all = allSkills();
    return {
      total: all.length,
      active: all.filter(s => s.active).length,
      methodology: all.filter(s => s.type === 'methodology').length,
      executable: all.filter(s => s.type === 'executable').length,
      byCategory: all.reduce((acc, s) => {
        const cat = s.category || s.type;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    };
  },

  // Para menu Telegram: gera lista formatada
  forTelegramMenu() {
    return allSkills().map(s => ({
      text: `${s.active ? '✅' : '⬜'} ${s.slug}`,
      callback_data: `skill:toggle:${s.slug}`,
      description: s.description || s.slug,
      category: s.category || s.type,
    }));
  },
};
