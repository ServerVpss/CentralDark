/**
 * Skills Manager — Core
 * 
 * Gerencia skills: listar, ativar, desativar, categorias.
 * Estado persistido em skills.json.
 * Pronto para integração com skills.sh marketplace.
 */

const fs = require('fs');
const path = require('path');

const SKILLS_FILE = path.join(__dirname, 'skills.json');

function loadSkills() {
  try {
    return JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
  } catch {
    return { version: '1.0.0', categories: [], skills: [] };
  }
}

function saveSkills(data) {
  data.lastUpdated = new Date().toISOString().split('T')[0];
  fs.writeFileSync(SKILLS_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  // Listar todas as skills
  list() {
    return loadSkills().skills;
  },

  // Listar por categoria
  listByCategory(category) {
    return loadSkills().skills.filter(s => s.category === category);
  },

  // Listar categorias
  categories() {
    return loadSkills().categories;
  },

  // Listar ativas
  listEnabled() {
    return loadSkills().skills.filter(s => s.enabled);
  },

  // Buscar uma skill
  get(slug) {
    return loadSkills().skills.find(s => s.slug === slug);
  },

  // Ativar skill
  enable(slug) {
    const data = loadSkills();
    const skill = data.skills.find(s => s.slug === slug);
    if (!skill) return { ok: false, error: 'Skill não encontrada' };
    skill.enabled = true;
    saveSkills(data);
    return { ok: true, skill };
  },

  // Desativar skill
  disable(slug) {
    const data = loadSkills();
    const skill = data.skills.find(s => s.slug === slug);
    if (!skill) return { ok: false, error: 'Skill não encontrada' };
    skill.enabled = false;
    saveSkills(data);
    return { ok: true, skill };
  },

  // Toggle
  toggle(slug) {
    const skill = this.get(slug);
    if (!skill) return { ok: false, error: 'Skill não encontrada' };
    return skill.enabled ? this.disable(slug) : this.enable(slug);
  },

  // Adicionar skill customizada
  addCustom({ slug, name, category, icon, source = 'custom' }) {
    const data = loadSkills();
    if (data.skills.find(s => s.slug === slug)) return { ok: false, error: 'Slug já existe' };
    data.skills.push({ slug, name, category, icon, enabled: false, source });
    saveSkills(data);
    return { ok: true };
  },

  // Remover skill customizada
  remove(slug) {
    const data = loadSkills();
    const idx = data.skills.findIndex(s => s.slug === slug && s.source === 'custom');
    if (idx === -1) return { ok: false, error: 'Skill não encontrada ou built-in' };
    data.skills.splice(idx, 1);
    saveSkills(data);
    return { ok: true };
  },

  // Relatório completo
  report() {
    const data = loadSkills();
    const total = data.skills.length;
    const enabled = data.skills.filter(s => s.enabled).length;
    const byCategory = {};
    data.categories.forEach(c => {
      byCategory[c.key] = data.skills.filter(s => s.category === c.key).length;
    });
    return { total, enabled, disabled: total - enabled, byCategory };
  },
};
