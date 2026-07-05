// 🏗️ Debate Histórico - Timeline — gerado pelo Artifacts Builder
(function() {
  const root = document.getElementById('root');
  if (!root) return;

  const state = {
    pagina: 'home',
    dados: null,
    carregando: false,
  };

  function render() {
    switch(state.pagina) {
      case 'home': renderHome(); break;
      default: renderHome(); break;
    }
  }

  function renderHome() {
    root.innerHTML = [
      '<div class="container fade-in" style="padding: 2rem 1rem;">',
        '<header style="text-align: center; margin-bottom: 3rem;">',
          '<h1 style="font-size: 2.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #34d399, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">' + "Debate Histórico - Timeline" + '</h1>',
          '<p style="color: #9fb8aa; font-size: 1.1rem; margin-top: 0.5rem;">' + "debate histórico   timeline" + '</p>',
        '</header>',
        '<div class="grid-auto" style="margin-bottom: 2rem;">',
          "\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Timeline cronológica vertical</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.1s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Card por debate: data, modelo vencedor, resumo</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.2s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Expansão para ver rodadas completas</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.30000000000000004s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Busca por palavra-chave</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.4s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Filtro por modelo vencedor</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.5s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Estatísticas: total de debates, modelo mais vencedor</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.6000000000000001s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Tema escuro com linhas de conexão</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>",
        '</div>',
        '<div style="text-align: center; padding: 2rem; background: #101a15; border: 1px solid #294235; border-radius: 12px;">',
          '<p style="color: #9fb8aa; margin: 0 0 1rem;">Sistema construído pelo Artifacts Builder · CentralDark</p>',
          '<p style="color: #34d399; font-size: 0.875rem; margin: 0;">🤖 Rodando 24/7 · Missão autônoma</p>',
        '</div>',
      '</div>'
    ].join('\n');
  }

  render();
})();
