/* 🧿 CentralDark · Erros Visíveis — Instinto Superior
 * Um único arquivo. Cole no fim de qualquer página da CentralDark:
 *   <script>window.CD_ERROS_CONFIG={coracao:''}<\/script>
 *   <script src="/centraldark-erros-visiveis.js"><\/script>
 * Captura: erro de código, promessa rejeitada, console.error, recurso que não carregou
 * e pedido de rede que falhou (HTTP 4xx/5xx ou sem resposta).
 * Mostra tudo em português simples, com botão para mandar ao Instinto corrigir.
 * Herda as cores da pele da página (--a1, --a2, --a3, --bad) quando existirem.
 * Não guarda nada no disco; remove parâmetros de endereço para não vazar chave.
 */
(function () {
  if (window.__cdErros) return;
  var cfg = Object.assign({ coracao: '', apiHealth: '', apiProbeMs: 60000, max: 50 }, window.CD_ERROS_CONFIG || {});
  var lista = [];
  var aberto = false;
  var ultimoClique = null;
  var sinais = [];
  var apiStatus = 'UNKNOWN';
  var transporteStatus = 'UNKNOWN';
  var falhasApi = 0;
  var somAtivo = false;
  var somCtx = null;
  var ultimoSom = 0;

  function seguro(v) {
    return String(v == null ? '' : v)
      .replace(/Bearer\s+[^\s,;&]+/gi, 'Bearer [REDACTED]')
      .replace(/(password|token|secret|api_key)\s*[:=]\s*[^\s,;&]+/gi, '$1=[REDACTED]')
      .replace(/https?:\/\/[^\s"'<>)]+/gi, function(url) { return limparUrl(url); })
      .slice(0, 500);
  }
  function origemLocal(url) {
    try { return new URL(url, location.href).origin === location.origin; } catch (_) { return false; }
  }
  function sinal(tipo, estado, dado) {
    try { window.dispatchEvent(new CustomEvent('centraldark:sentinela', {
      detail: Object.assign({ tipo: tipo, estado: estado, pagina: limparUrl(location.href),
        em: new Date().toISOString() }, dado || {})
    })); } catch (_) {}
  }
  function alerta() {
    if (!somAtivo || document.hidden || Date.now() - ultimoSom < 8000) return;
    ultimoSom = Date.now();
    try {
      var Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      somCtx = somCtx || new Audio();
      if (somCtx.state !== 'running') return;
      var oscillator = somCtx.createOscillator(), gain = somCtx.createGain();
      oscillator.frequency.value = 660; gain.gain.value = 0.025;
      oscillator.connect(gain); gain.connect(somCtx.destination);
      oscillator.start(); oscillator.stop(somCtx.currentTime + 0.12);
    } catch (_) {}
  }
  function controlePerto() {
    return ultimoClique && Date.now() - ultimoClique.em < 15000 ? ultimoClique.id : '';
  }
  function enviarSinal(tipo, estado, item) {
    // Transporte só para API autenticada e explicitamente configurada na mesma origem.
    if (!cfg.coracao || !origemLocal(cfg.coracao) || !fOriginal) return;
    try {
      fOriginal.call(window, cfg.coracao, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fonte: 'erros-visiveis', evento: tipo, estado: estado,
          pagina: limparUrl(location.href), controle: item && item.id || null,
          evento_id: item && item.evento_id || null, hora: new Date().toISOString() })
      }).then(function(res) {
        transporteStatus = res.ok ? 'HTTP_ACK' : 'HTTP_' + res.status;
        if (!res.ok) registrar('api', 'O registro foi recusado: HTTP ' + res.status, limparUrl(cfg.coracao));
      }).catch(function() {
        transporteStatus = 'UNKNOWN';
        registrar('api', 'A API de eventos não respondeu.', limparUrl(cfg.coracao));
      });
    } catch (_) { transporteStatus = 'UNKNOWN'; }
  }
  document.addEventListener('click', function(e) {
    try {
      var el = e.target && e.target.closest && e.target.closest('button,[role="button"],[role="tab"],a[href],input[type="submit"]');
      if (!el || el.closest('#cd-erros-visiveis')) return;
      var id = seguro(el.getAttribute('data-cd-flow') || el.getAttribute('aria-label') ||
        el.getAttribute('title') || el.getAttribute('role') || el.tagName).slice(0, 120);
      ultimoClique = { id: id, em: Date.now(),
        evento_id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7) };
      sinais.unshift(ultimoClique);
      if (sinais.length > 50) sinais.pop();
      sinal('ui_click', 'CLICK_SEEN', { controle: id, evento_id: ultimoClique.evento_id });
      enviarSinal('ui_click', 'CLICK_SEEN', ultimoClique);
    } catch (_) {}
  }, true);
  function medirApi() {
    if (!cfg.apiHealth || !fOriginal || document.hidden) return;
    fOriginal.call(window, cfg.apiHealth, { cache: 'no-store', credentials: 'omit' })
      .then(function(res) {
        falhasApi = 0;
        apiStatus = res.ok ? 'HTTP_ACK' : (res.status === 401 || res.status === 403 ? 'AUTH_REQUIRED' : 'HTTP_' + res.status);
        sinal('api_health', apiStatus, { http_status: res.status });
        if (res.status >= 500) registrar('api', 'API retornou HTTP ' + res.status, limparUrl(cfg.apiHealth));
        desenhar();
      }).catch(function() {
        falhasApi++;
        // Falha cross-origin pode ser CORS: nunca converter para OFFLINE sem prova.
        apiStatus = origemLocal(cfg.apiHealth) && falhasApi >= 2 ? 'FAIL' : 'UNKNOWN';
        sinal('api_health', apiStatus);
        if (apiStatus === 'FAIL') registrar('api', 'API sem resposta em duas verificações.', limparUrl(cfg.apiHealth));
        desenhar();
      });
  }
  if (cfg.apiHealth) {
    setTimeout(medirApi, 700);
    window.setInterval(medirApi, Math.max(30000, Number(cfg.apiProbeMs) || 60000));
    window.addEventListener('online', medirApi);
  }


  function limparUrl(u) { try { return String(u || '').split('?')[0].split('#')[0].slice(0, 200); } catch (e) { return ''; } }

  function simples(tipo, msg) {
    var m = String(msg || '');
    if (/HTTP 401|HTTP 403/.test(m)) return 'Acesso negado: falta login ou permissão.';
    if (/HTTP 404/.test(m)) return 'Endereço não encontrado.';
    if (/HTTP 429/.test(m)) return 'Muitos pedidos seguidos: o servidor pediu pra esperar.';
    if (/HTTP 5\d\d/.test(m)) return 'O servidor falhou ao responder.';
    if (/HTTP 4\d\d/.test(m)) return 'O servidor recusou o pedido como foi enviado.';
    if (/Failed to fetch|NetworkError|Load failed|ERR_/.test(m)) return 'Não consegui falar com o servidor (rede ou endereço fora do ar).';
    if (/CORS|cross-origin/i.test(m)) return 'O navegador bloqueou o pedido para outro endereço.';
    if (/is not defined/.test(m)) return 'O código usou algo que não existe nesta página.';
    if (/is not a function/.test(m)) return 'O código chamou uma ação que não existe ou mudou de nome.';
    if (/Cannot read prop|undefined is not an object|of null|of undefined|null is not an object/.test(m)) return 'O código tentou usar um dado que ainda não chegou ou veio vazio.';
    if (/Unexpected token|JSON/.test(m)) return 'Uma resposta veio em formato errado.';
    if (tipo === 'recurso') return 'Uma parte da página (imagem, estilo ou código) não carregou.';
    return 'Algo quebrou nesta página.';
  }

  function registrar(tipo, msg, onde, pilha) {
    try {
      msg = seguro(msg || 'erro sem mensagem');
      onde = seguro(onde);
      if (onde.indexOf('?') !== -1 || onde.indexOf('#') !== -1) onde = limparUrl(onde);
      var chave = tipo + '|' + msg + '|' + onde;
      var ja = lista.find(function (x) { return x.chave === chave; });
      if (ja) { ja.vezes++; ja.hora = new Date(); }
      else {
        lista.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), chave: chave, tipo: tipo, msg: msg, onde: onde,
          pilha: seguro(pilha), hora: new Date(), vezes: 1, simples: simples(tipo, msg), controle: controlePerto() });
        alerta();
        if (lista.length > cfg.max) lista.pop();
      }
      sinal('ui_error', 'FAIL', { tipo: tipo, controle: controlePerto(), origem: onde });
      desenhar();
    } catch (e) { /* o sentinela nunca derruba a página */ }
  }

  /* ---------- sensores ---------- */
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) registrar('recurso', 'Falhou ao carregar ' + limparUrl(t.src || t.href), t.tagName);
    else registrar('codigo', e.message, limparUrl(e.filename) + (e.lineno ? ':' + e.lineno + ':' + e.colno : ''), e.error && e.error.stack);
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason; registrar('promessa', (r && r.message) || String(r), '', r && r.stack);
  });
  var ceOriginal = console.error;
  console.error = function () {
    try {
      var a = Array.prototype.slice.call(arguments), err = a.find(function (x) { return x instanceof Error; });
      registrar('console', a.map(function (x) { return x instanceof Error ? x.message : typeof x === 'string' ? x : (function () { try { return JSON.stringify(x); } catch (_) { return String(x); } })(); }).join(' '), '', err && err.stack);
    } catch (_) {}
    return ceOriginal.apply(this, arguments);
  };
  if (window.fetch) {
    var fOriginal = window.fetch;
    window.fetch = function (rec) {
      var url = limparUrl(rec && rec.url ? rec.url : rec);
      if (cfg.coracao && url === limparUrl(cfg.coracao)) return fOriginal.apply(this, arguments);
      return fOriginal.apply(this, arguments).then(function (r) {
        if (!r.ok) registrar('rede', 'HTTP ' + r.status + ' em ' + url, url);
        sinal('api_fetch', r.ok ? 'HTTP_ACK' : 'HTTP_FAIL', { http_status: r.status, destino: url, controle: controlePerto() });
        return r;
      }, function (err) {
        registrar('rede', ((err && err.message) || 'falha de rede') + ' em ' + url, url, err && err.stack);
        sinal('api_fetch', 'NETWORK_FAIL', { destino: url, controle: controlePerto() });
        throw err;
      });
    };
  }

  // XHR legado: observar só código HTTP e rota, sem corpo ou credenciais.
  if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
    var xhrProto = window.XMLHttpRequest.prototype, oldOpen = xhrProto.open, oldSend = xhrProto.send;
    xhrProto.open = function(method, url) {
      this.__cdRota = limparUrl(url);
      return oldOpen.apply(this, arguments);
    };
    xhrProto.send = function() {
      try {
        var xhr = this;
        xhr.addEventListener('loadend', function() {
          var failed = !xhr.status || xhr.status >= 400;
          if (failed) registrar('rede', 'XHR HTTP ' + xhr.status + ' em ' + xhr.__cdRota, xhr.__cdRota);
          sinal('api_xhr', failed ? 'HTTP_FAIL' : 'HTTP_ACK',
            { http_status: xhr.status, destino: xhr.__cdRota, controle: controlePerto() });
        }, { once: true });
      } catch (_) {}
      return oldSend.apply(this, arguments);
    };
  }

  /* ---------- relato para o Instinto ---------- */
  function relato(x) {
    return '🧿 ERRO VISTO NA TELA\n' +
      'Página: ' + limparUrl(location.href) + '\n' +
      'Quando: ' + x.hora.toLocaleString('pt-BR') + (x.vezes > 1 ? ' (' + x.vezes + ' vezes)' : '') + '\n' +
      'O que aconteceu: ' + x.simples + '\n' +
      'Mensagem técnica: ' + x.msg + '\n' +
      (x.onde ? 'Onde: ' + x.onde + '\n' : '') +
      (x.controle ? 'Botão relacionado: ' + x.controle + '\n' : '') +
      (x.pilha ? 'Pilha:\n' + x.pilha + '\n' : '') +
      'Intenção: corrigir só esta parte, preservar o que funciona, testar de novo. UNKNOWN não é PASS.';
  }
  function copiar(txt, botao) {
    function ok() { if (botao) { var t = botao.textContent; botao.textContent = '✅ Copiado'; setTimeout(function () { botao.textContent = t; }, 1500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () { antigo(txt); ok(); });
    else { antigo(txt); ok(); }
  }
  function antigo(txt) { var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (_) {} ta.remove(); }
  function enviar(x, botao) {
    if (!cfg.coracao || !origemLocal(cfg.coracao) || !fOriginal) { botao.textContent = 'API sem rota segura'; return; }
    botao.textContent = 'Enviando…';
    fOriginal.call(window, cfg.coracao, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fonte: 'erros-visiveis', pagina: limparUrl(location.href), erro: { tipo: x.tipo, simples: x.simples, msg: x.msg, onde: x.onde, pilha: x.pilha, vezes: x.vezes, hora: x.hora.toISOString() } }) })
      .then(function (r) { botao.textContent = r.ok ? '✅ Enviado' : '🔴 Coração recusou (' + r.status + ')'; },
            function () { botao.textContent = '🔴 Coração fora do ar'; });
  }

  /* ---------- tela ---------- */
  var raiz, sombra;
  function montar() {
    if (raiz || !document.body) return;
    raiz = document.createElement('div'); raiz.id = 'cd-erros-visiveis';
    sombra = raiz.attachShadow({ mode: 'open' });
    sombra.innerHTML = '<style>' +
      ':host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
      '.bt{position:fixed;right:16px;bottom:16px;z-index:2147483646;border:1px solid var(--bad,#ff4d6d);background:rgba(10,8,24,.92);color:#fff;border-radius:999px;padding:9px 14px;font-size:14px;cursor:pointer;box-shadow:0 0 18px color-mix(in srgb,var(--bad,#ff4d6d) 45%,transparent)}' +
      '.bt.ok{border-color:var(--ok,#39e58c);box-shadow:none;opacity:.55;padding:6px 10px;font-size:12px}' +
      '.gaveta{position:fixed;right:12px;bottom:64px;z-index:2147483647;width:min(440px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:rgba(12,10,30,.97);color:#eef0ff;border:1px solid var(--line,#3a2f7a);border-radius:14px;padding:12px}' +
      'h2{margin:0 0 4px;font-size:15px;color:var(--a1,#ffcc4d)}.sub{color:#9aa0c8;font-size:12px;margin-bottom:8px}' +
      '.it{border:1px solid var(--line,#3a2f7a);border-left:4px solid var(--bad,#ff4d6d);border-radius:10px;padding:8px 10px;margin-bottom:8px}' +
      '.s{font-size:14px;font-weight:600}.m{color:#9aa0c8;font-size:12px;margin-top:3px}' +
      'details{margin-top:4px}summary{color:#9aa0c8;font-size:12px;cursor:pointer}pre{white-space:pre-wrap;font:11px/1.4 ui-monospace,Consolas,monospace;color:#c9cdf0;max-height:140px;overflow:auto;margin:4px 0}' +
      '.row{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}' +
      'button.a{background:rgba(0,0,0,.3);color:#eef0ff;border:1px solid var(--line,#3a2f7a);border-radius:8px;padding:5px 9px;font-size:12px;cursor:pointer}' +
      'button.a.p{border-color:var(--a1,#ffcc4d);color:var(--a1,#ffcc4d)}' +
      '.cdapi{border:1px solid var(--line,#3a2f7a);margin:8px 0;padding:7px;border-radius:7px;font-size:12px}' +
      '</style><button class="bt ok" id="bt" title="Erros desta página">🧿</button><div class="gaveta" id="gv" hidden></div>';
    document.body.appendChild(raiz);
    sombra.getElementById('bt').addEventListener('click', function () { aberto = !aberto; desenhar(); });
    sombra.getElementById('gv').addEventListener('click', function (e) {
      if (e.target && e.target.id === 'cdSom') {
        somAtivo = !somAtivo;
        if (somAtivo) {
          try {
            var Audio = window.AudioContext || window.webkitAudioContext;
            if (Audio) { somCtx = somCtx || new Audio(); void somCtx.resume(); }
          } catch (_) {}
        }
        desenhar(); return;
      }
      var b = e.target.closest('button[data-acao]'); if (!b) return;
      var x = lista.find(function (y) { return y.id === b.dataset.id; });
      if (b.dataset.acao === 'copiar' && x) copiar(relato(x), b);
      if (b.dataset.acao === 'enviar' && x) enviar(x, b);
      if (b.dataset.acao === 'todos') copiar(lista.map(relato).join('\n\n———\n\n'), b);
      if (b.dataset.acao === 'limpar') { lista.length = 0; aberto = false; desenhar(); }
    });
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function desenhar() {
    montar(); if (!sombra) return;
    var bt = sombra.getElementById('bt'), gv = sombra.getElementById('gv');
    var total = lista.reduce(function (s, x) { return s + x.vezes; }, 0);
    bt.className = 'bt' + (lista.length ? '' : ' ok');
    bt.textContent = lista.length ? '🧿 ' + lista.length + (lista.length === 1 ? ' erro' : ' erros') : '🧿';
    gv.hidden = !aberto;
    if (!aberto) return;
    gv.innerHTML = '<h2>🧿 Sentinela · Erros desta página</h2><div class="cdapi">API: ' + esc(apiStatus) +
      ' · eventos: ' + esc(transporteStatus) + '<br>Último controle: ' +
      esc(ultimoClique ? ultimoClique.id : 'nenhum') + '<br><button class="a" id="cdSom">' +
      (somAtivo ? '🔔 Desativar som' : '🔕 Ativar som') +
      '</button><br><small>CLICK_SEEN não é execução. UNKNOWN não significa falha.</small></div><div class="sub">' +
      (lista.length ? lista.length + ' tipos · ' + total + ' ocorrências. Copie e mande pro Instinto corrigir só aquela parte.' : 'Nenhum erro visto até agora. Silêncio aqui não é prova de que está tudo certo: é só o que esta tela enxergou.') + '</div>' +
      lista.map(function (x) {
        return '<div class="it"><div class="s">' + esc(x.simples) + (x.vezes > 1 ? ' ×' + x.vezes : '') + '</div>' +
          '<div class="m">' + esc(x.hora.toLocaleTimeString('pt-BR')) + ' · ' + esc(x.tipo) +
          (x.controle ? ' · botão: ' + esc(x.controle) : '') + '</div>' +
          '<details><summary>detalhe técnico</summary><pre>' + esc(x.msg + (x.onde ? '\n' + x.onde : '') + (x.pilha ? '\n\n' + x.pilha : '')) + '</pre></details>' +
          '<div class="row"><button class="a p" data-acao="copiar" data-id="' + x.id + '">Copiar pro Instinto</button>' +
          (cfg.coracao ? '<button class="a" data-acao="enviar" data-id="' + x.id + '">Enviar ao coração</button>' : '') + '</div></div>';
      }).join('') +
      (lista.length ? '<div class="row"><button class="a" data-acao="todos">Copiar todos</button><button class="a" data-acao="limpar">Limpar</button></div>' : '');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', desenhar); else desenhar();

  window.__cdErros = { lista: lista, sinais: sinais, registrar: registrar, medirApi: medirApi,
    estado: function () { return { api: apiStatus, transporte: transporteStatus, erros: lista.length }; },
    abrir: function () { aberto = true; desenhar(); } };
  window.cdErro = function (msg, onde) { registrar('manual', msg, onde); };
})();
