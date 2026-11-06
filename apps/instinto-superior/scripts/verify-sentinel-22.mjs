import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../public/centraldark-erros-visiveis.js", import.meta.url), "utf8");
assert.match(source, /centraldark\.sentinel\.event\.v2/);
assert.match(source, /transportStaleMs/);
assert.match(source, /fingerprint/);
assert.match(source, /first_seen|primeiraHora/);
assert.match(source, /X-CentralDark-Correlation-Id/);
assert.match(source, /XMLHttpRequest/);
assert.match(source, /HTTP 401|HTTP 403/);
assert.match(source, /HTTP 404/);
assert.match(source, /HTTP 429/);
assert.match(source, /HTTP 5\\d\\d/);

const listeners = {};
const controls = new Map();
const shadow = {
  set innerHTML(_value) {},
  getElementById(id) {
    if (!controls.has(id)) controls.set(id, { id, hidden: false, textContent: "", className: "", addEventListener() {} });
    return controls.get(id);
  },
};
const document = {
  readyState: "complete",
  hidden: false,
  body: { appendChild() {} },
  addEventListener(name, fn) { listeners[name] = fn; },
  createElement() { return { id: "", attachShadow() { return shadow; } }; },
};
const window = {
  CD_ERROS_CONFIG: { max: 2 },
  addEventListener(name, fn) { listeners[name] = fn; },
  dispatchEvent() {},
  setInterval() { return 1; },
  setTimeout(fn) { fn(); return 1; },
  __cdErros: undefined,
};
const context = {
  window,
  document,
  location: { href: "http://127.0.0.1:8080/sala-controle?token=secret", pathname: "/sala-controle", origin: "http://127.0.0.1:8080" },
  URL,
  CustomEvent: class CustomEvent {},
  navigator: {},
  console,
  Date,
  Math,
  String,
  Number,
  JSON,
  Array,
  Object,
  RegExp,
  Error,
  setTimeout,
  clearTimeout,
};
runInNewContext(source, context, { filename: "centraldark-erros-visiveis.js" });
assert.ok(window.__cdErros, "sensor não inicializou");
window.__cdErros.registrar("manual", "Bearer segredo password=abc", "https://exemplo.invalid/api?token=nao-expor");
window.__cdErros.registrar("manual", "Bearer segredo password=abc", "https://exemplo.invalid/api?token=nao-expor");
const estado = window.__cdErros.estado();
assert.equal(estado.erros, 1, "deduplicação não agrupou o mesmo erro");
assert.equal(estado.ocorrencias, 2, "ocorrências não foram incrementadas");
const evento = window.__cdErros.lista[0];
assert.equal(evento.fingerprint, window.__cdErros.lista[0].fingerprint, "fingerprint não é estável");
assert.equal(evento.vezes, 2);
assert.equal(evento.gravidade, "MEDIUM");
assert.equal(evento.onde, "https://exemplo.invalid/api");
assert.ok(!evento.msg.includes("segredo"));
assert.ok(!evento.msg.includes("abc"));
assert.ok(!evento.msg.includes("nao-expor"));

console.log("Sentinel 2.2: fingerprint, deduplicação, first_seen, redaction, limite e contrato v2 PASS");
