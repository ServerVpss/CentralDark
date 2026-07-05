// 🏗️ Gerenciador de Processos PM2 — gerado pelo Artifacts Builder
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
          '<h1 style="font-size: 2.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #34d399, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">' + "Gerenciador de Processos PM2" + '</h1>',
          '<p style="color: #9fb8aa; font-size: 1.1rem; margin-top: 0.5rem;">' + "gerenciador de processos pm2" + '</p>',
        '</header>',
        '<div class="grid-auto" style="margin-bottom: 2rem;">',
          "\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Lista completa dos 24 processos</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.1s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Status 🟢/🔴 com cor</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.2s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Ações: start, stop, restart (via API)</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.30000000000000004s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Gráfico de CPU por processo</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.4s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Gráfico de memória por processo</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.5s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Busca por nome</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.6000000000000001s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Ordenação: críticos primeiro</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>\n            <div class=\"card dark-card glow fade-in\" style=\"animation-delay: 0.7000000000000001s;\">\n              <div style=\"font-size: 2rem; margin-bottom: 0.5rem;\">📦</div>\n              <h3 style=\"margin: 0 0 0.5rem; font-size: 1rem;\">Confirmação antes de ações destrutivas</h3>\n              <p style=\"color: #9fb8aa; font-size: 0.875rem; margin: 0;\">Módulo do sistema CentralDark</p>\n            </div>",
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
