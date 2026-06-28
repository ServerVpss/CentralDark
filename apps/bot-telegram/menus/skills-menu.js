// Menu dinâmico de Skills para Telegram
// Gera botões baseados nas skills ativas

function buildSkillsMenu(skills, category = null) {
  const filtered = category
    ? skills.filter(s => s.category === category)
    : skills;

  const buttons = filtered.map(skill => [{
    text: `${skill.enabled ? '✅' : '⬜'} ${skill.icon || '📦'} ${skill.name}`,
    callback_data: `skill:toggle:${skill.slug}`,
  }]);

  buttons.push([{ text: '🔙 Voltar', callback_data: 'cmd:skills' }]);

  return {
    text: `⚡ <b>Skills${category ? ` — ${category}` : ''}</b>\n\nToque para ativar/desativar:`,
    buttons,
  };
}

function buildCategoriesMenu(categories) {
  const buttons = categories.map(cat => [{
    text: `${cat.icon} ${cat.label}`,
    callback_data: `skills:${cat.key}`,
  }]);

  buttons.push([{ text: '🔙 Menu', callback_data: 'cmd:start' }]);

  return {
    text: '⚡ <b>Categorias de Skills</b>\n\nSelecione uma categoria:',
    buttons,
  };
}

module.exports = { buildSkillsMenu, buildCategoriesMenu };
