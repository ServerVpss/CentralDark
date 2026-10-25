import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function panel() {
  const source = fs.readFileSync(new URL('./admin.js', import.meta.url), 'utf8');
  const template = source.match(/const NOC_HTML = (`[\s\S]*?<\/body><\/html>`);/)[1];
  const html = vm.runInNewContext(template);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  new vm.Script(script);
  const elements = new Map();
  const context = vm.createContext({
    $: id => {
      if (!elements.has(id)) elements.set(id, { style: {}, textContent: '', innerHTML: '' });
      return elements.get(id);
    },
    horaBr: value => String(value),
  });
  vm.runInContext(script.slice(script.indexOf('const deltaState'), script.indexOf('async function carregarHealth')), context);
  return { elements, run: code => vm.runInContext(code, context) };
}

test('Repeated health events do not obscure errors or trigger critical alert', () => {
  const p = panel();
  p.run(`for(let i=0;i<50;i++) registrarDeltaUtil({level:'info',msg:'http_request_end',meta:{path:'/health',status:200}})`);
  assert.equal(p.elements.get('deltaHot').style.display, 'none');
  p.run(`registrarDeltaUtil({level:'error',msg:'hub_mission_consumer_error',meta:{error:'HUB_POSTGREST_401: Invalid API key'}})`);
  const rows = p.elements.get('deltaRows').innerHTML;
  assert.ok(rows.indexOf('HUB_POSTGREST_401') < rows.indexOf('HTTP_200'));
  assert.equal(p.elements.get('deltaErrors').textContent, '1');
});

test('Error count includes groups outside visible rows; retained memory is bounded', () => {
  const p = panel();
  p.run(`for(let i=0;i<15;i++) registrarDeltaUtil({level:'error',msg:'error-'+i})`);
  assert.equal(p.elements.get('deltaErrors').textContent, '15');
  p.run(`for(let i=0;i<250;i++) registrarDeltaUtil({level:'info',msg:'event-'+i})`);
  assert.equal(p.run('deltaState.groups.size'), 200);
  p.run('limparDeltaUtil()');
  assert.equal(p.run('deltaState.groups.size'), 0);
  assert.equal(p.elements.get('deltaTotal').textContent, '0');
});

test('Details escape untrusted log content and preserve first occurrence', () => {
  const p = panel();
  p.run(`registrarDeltaUtil({level:'error',msg:'example',t:'first',meta:{error:'<img src=x onerror=alert(1)>'}}); registrarDeltaUtil({level:'error',msg:'example',t:'last',meta:{error:'<img src=x onerror=alert(1)>'}})`);
  const rows = p.elements.get('deltaRows').innerHTML;
  assert.ok(!rows.includes('<img'));
  assert.ok(rows.includes('&lt;img'));
  assert.ok(rows.includes('Primeiro: first'));
  assert.ok(rows.includes('2×'));
});
