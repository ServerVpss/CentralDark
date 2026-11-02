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
  var VERSION = '2.2.0';
  var cfg = Object.assign({ coracao: '', apiHealth: '', apiProbeMs: 60000, transportStaleMs: 120000, max: 50 }, window.CD_ERROS_CONFIG || {});
  var lista = [];
  var aberto = false;
  var ultimoClique = null;
  var sinais = [];
  var apiStatus = 'UNKNOWN';
  var transporteStatus = 'UNKNOWN';
  var ultimoTransporteEm = 0;
  var transporteTimer = null;
  var falhasApi = 0;
  var somAtivo = false;
  var somCtx = null;
  var ultimoSom = 0;

  function seguro(v) {
    return String(v == null ? '' : v)
      .replace(/Bearer\s+[^\s,;&]+/gi, 'Bearer [REDACTED]')
      .replace(/(["']?(?:password|token|secret|api[_-]?key|authorization)["']?\s*[:=]\s*["']?)[^\s,;&"'}]+/gi, '$1[REDACTED]')
      .replace(/https?:\/\/[^\s"'<>)]+/gi, function(url) { return limparUrl(url); })
      .slice(0, 500);
  }
  function hash(texto) {
    var h = 2166136261, i;
    texto = String(texto || '');
    for (i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function gravidade(tipo, msg) {
    if (tipo === 'code' || tipo === 'promise') return 'CRITICAL';
    if (/HTTP 5\d\d|NETWORK_FAIL|Failed to fetch|NetworkError|Load failed|ERR_/i.test(String(msg || ''))) return 'HIGH';
    if (/HTTP 4\d\d/i.test(String(msg || ''))) return 'MEDIUM';
    return tipo === 'resource' ? 'LOW' : 'MEDIUM';
  }
  function tipoCanonico(tipo) {
    return ({ codigo: 'code', promessa: 'promise', console: 'console', recurso: 'resource', rede: 'network', xhr: 'xhr', manual: 'manual', api: 'network' })[tipo] || tipo || 'manual';
  }
  function rotuloGravidade(tipo) {
    return ({ CRITICAL: 'CRÍTICO', HIGH: 'ALTO', MEDIUM: 'MÉDIO', LOW: 'BAIXO' })[tipo] || 'NÃO CLASSIFICADO';
  }
  function correlation() { return 'cd-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function transporteSaude() {
    if (!cfg.coracao) return 'TRANSPORT_UNKNOWN';
    if (transporteStatus === 'HTTP_ACK' && ultimoTransporteEm && Date.now() - ultimoTransporteEm > Math.max(30000, Number(cfg.transportStaleMs) || 120000)) return 'STALE';
    if (/^HTTP_/.test(transporteStatus) && transporteStatus !== 'HTTP_ACK') return 'TRANSPORT_FAIL';
    return transporteStatus === 'HTTP_ACK' ? 'TRANSPORT_READY' : 'TRANSPORT_UNKNOWN';
  }
  function atualizarTransporte(estado) {
    transporteStatus = estado;
    if (estado === 'HTTP_ACK') ultimoTransporteEm = Date.now();
    sinal('sentinel_transport', transporteSaude(), { destino: cfg.coracao ? limparUrl(cfg.coracao) : '', ultimo_ack_em: ultimoTransporteEm ? new Date(ultimoTransporteEm).toISOString() : null });
    desenhar();
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
  function payloadSentinel(item, estado) {
    return { schema: 'centraldark.sentinel.event.v2', source: 'cockpit-sentinel', status: estado === 'FAIL' ? 'FAIL' : 'UNKNOWN',
      page: limparUrl(location.href), route: location.pathname, control: item && item.controle || null,
      event_id: item && item.id || null, correlation_id: item && item.correlation_id || correlation(), fingerprint: item && item.fingerprint || null,
      severity: item && item.gravidade || 'UNKNOWN', kind: item && item.tipo || 'manual', message: item && item.msg || null,
      simplified_message: item && item.simples || null, first_seen: item && item.primeiraHora ? item.primeiraHora.toISOString() : null,
      last_seen: item && item.hora ? item.hora.toISOString() : new Date().toISOString(), occurrences: item && item.vezes || 1,
      sentinel_version: VERSION, metadata: { onde: item && item.onde || null, pilha: item && item.pilha || null } };
  }
  function enviarSinal(tipo, estado, item) {
    // Transporte somente para uma rota explicitamente configurada. O navegador
    // nunca recebe chave administrativa e o corpo não contém headers/segredos.
    if (!cfg.coracao || !fOriginal || tipo !== 'ui_error') return;
    try {
      fOriginal.call(window, cfg.coracao, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CentralDark-Sentinel': VERSION, 'X-CentralDark-Correlation-Id': item && item.correlation_id || '' },
        body: JSON.stringify(payloadSentinel(item, estado))
      }).then(function(res) {
        atualizarTransporte(res.ok ? 'HTTP_ACK' : 'HTTP_' + res.status);
        if (!res.ok && tipo !== 'api') registrar('api', 'O registro foi recusado: HTTP ' + res.status, limparUrl(cfg.coracao));
      }).catch(function() {
        atualizarTransporte('UNKNOWN');
      });
    } catch (_) { atualizarTransporte('UNKNOWN'); }
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
  if (cfg.coracao) {
    transporteTimer = window.setInterval(function () { desenhar(); }, 30000);
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
    if (tipo === 'recurso' || tipo === 'resource') return 'Uma parte da página (imagem, estilo ou código) não carregou.';
    return 'Algo quebrou nesta página.';
  }

  function registrar(tipo, msg, onde, pilha) {
    try {
      tipo = tipoCanonico(tipo);
      msg = seguro(msg || 'erro sem mensagem');
      onde = seguro(onde);
      if (onde.indexOf('?') !== -1 || onde.indexOf('#') !== -1) onde = limparUrl(onde);
      var chave = tipo + '|' + msg + '|' + onde;
      var ja = lista.find(function (x) { return x.chave === chave; });
      if (ja) { ja.vezes++; ja.hora = new Date(); }
      else {
        lista.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), chave: chave, tipo: tipo, msg: msg, onde: onde,
          pilha: seguro(pilha), hora: new Date(), primeiraHora: new Date(), vezes: 1, simples: simples(tipo, msg),
          gravidade: gravidade(tipo, msg), fingerprint: hash(chave), correlation_id: correlation(), controle: controlePerto() });
        alerta();
        if (lista.length > cfg.max) lista.pop();
      }
      var eventoAtual = ja || lista[0];
      sinal('ui_error', 'FAIL', { tipo: tipo, gravidade: eventoAtual.gravidade, fingerprint: eventoAtual.fingerprint,
        correlation_id: eventoAtual.correlation_id, controle: controlePerto(), origem: onde });
      enviarSinal('ui_error', 'FAIL', eventoAtual);
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
      var inicio = Date.now(), metodo = rec && rec.method ? rec.method : (arguments[1] && arguments[1].method) || 'GET';
      if (cfg.coracao && url === limparUrl(cfg.coracao)) return fOriginal.apply(this, arguments);
      return fOriginal.apply(this, arguments).then(function (r) {
        if (!r.ok) registrar('rede', 'HTTP ' + r.status + ' em ' + url, url);
        sinal('api_fetch', r.ok ? 'HTTP_ACK' : 'HTTP_FAIL', { http_status: r.status, metodo: metodo, duracao_ms: Date.now() - inicio, destino: url, controle: controlePerto() });
        return r;
      }, function (err) {
        registrar('rede', ((err && err.message) || 'falha de rede') + ' em ' + url, url, err && err.stack);
        sinal('api_fetch', 'NETWORK_FAIL', { metodo: metodo, duracao_ms: Date.now() - inicio, destino: url, controle: controlePerto() });
        throw err;
      });
    };
  }

  // XHR legado: observar só código HTTP e rota, sem corpo ou credenciais.
  if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
    var xhrProto = window.XMLHttpRequest.prototype, oldOpen = xhrProto.open, oldSend = xhrProto.send;
    xhrProto.open = function(method, url) {
      this.__cdRota = limparUrl(url); this.__cdMetodo = method; this.__cdInicio = Date.now();
      return oldOpen.apply(this, arguments);
    };
    xhrProto.send = function() {
      try {
        var xhr = this;
        xhr.addEventListener('loadend', function() {
          var failed = !xhr.status || xhr.status >= 400;
          if (failed) registrar('rede', 'XHR HTTP ' + xhr.status + ' em ' + xhr.__cdRota, xhr.__cdRota);
          sinal('api_xhr', failed ? 'HTTP_FAIL' : 'HTTP_ACK',
            { http_status: xhr.status, metodo: xhr.__cdMetodo || 'GET', duracao_ms: Date.now() - (xhr.__cdInicio || Date.now()), destino: xhr.__cdRota, controle: controlePerto() });
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
    fOriginal.call(window, cfg.coracao, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CentralDark-Sentinel': VERSION },
      body: JSON.stringify(payloadSentinel(x, 'FAIL')) })
      .then(function (r) { atualizarTransporte(r.ok ? 'HTTP_ACK' : 'HTTP_' + r.status); botao.textContent = r.ok ? '✅ Enviado' : '🔴 Gateway recusou (' + r.status + ')'; },
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
    gv.innerHTML = '<h2>🧿 Sentinela · Erros desta página</h2><div class="cdapi">versão: ' + VERSION + ' · captura: CAPTURING · API: ' + esc(apiStatus) +
      ' · transporte: ' + esc(transporteSaude()) + '<br>Último controle: ' +
      esc(ultimoClique ? ultimoClique.id : 'nenhum') + '<br><button class="a" id="cdSom">' +
      (somAtivo ? '🔔 Desativar som' : '🔕 Ativar som') +
      '</button><br><small>CLICK_SEEN não é execução. UNKNOWN não significa falha.</small></div><div class="sub">' +
      (lista.length ? lista.length + ' tipos · ' + total + ' ocorrências. Copie e mande pro Instinto corrigir só aquela parte.' : 'Nenhum erro visto até agora. Silêncio aqui não é prova de que está tudo certo: é só o que esta tela enxergou.') + '</div>' +
      lista.map(function (x) {
        return '<div class="it"><div class="s">' + esc(rotuloGravidade(x.gravidade)) + ' · ' + esc(x.simples) + (x.vezes > 1 ? ' ×' + x.vezes : '') + '</div>' +
          '<div class="m">' + esc(x.hora.toLocaleTimeString('pt-BR')) + ' · ' + esc(x.tipo) + ' · fingerprint: ' + esc(x.fingerprint) +
          (x.controle ? ' · botão: ' + esc(x.controle) : '') + '</div>' +
          '<details><summary>detalhe técnico</summary><pre>' + esc('correlation_id: ' + x.correlation_id + '\nprimeiro: ' + x.primeiraHora.toISOString() + '\núltimo: ' + x.hora.toISOString() + '\n' + x.msg + (x.onde ? '\n' + x.onde : '') + (x.pilha ? '\n\n' + x.pilha : '')) + '</pre></details>' +
          '<div class="row"><button class="a p" data-acao="copiar" data-id="' + x.id + '">Copiar pro Instinto</button>' +
          (cfg.coracao ? '<button class="a" data-acao="enviar" data-id="' + x.id + '">Enviar ao coração</button>' : '') + '</div></div>';
      }).join('') +
      (lista.length ? '<div class="row"><button class="a" data-acao="todos">Copiar todos</button><button class="a" data-acao="limpar">Limpar</button></div>' : '');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', desenhar); else desenhar();

  window.__cdErros = { versao: VERSION, lista: lista, sinais: sinais, registrar: registrar, medirApi: medirApi,
    estado: function () { return { versao: VERSION, api: apiStatus, transporte: transporteSaude(), ultimoTransporteEm: ultimoTransporteEm ? new Date(ultimoTransporteEm).toISOString() : null, erros: lista.length, ocorrencias: lista.reduce(function (n, x) { return n + x.vezes; }, 0) }; },
    abrir: function () { aberto = true; desenhar(); } };
  window.cdErro = function (msg, onde) { registrar('manual', msg, onde); };
})();
