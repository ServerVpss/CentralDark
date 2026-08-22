# Navegação Agentic no Chrome + WebMCP — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Dar à CentralDark uma navegação de Chrome rápida, estável, observável e ensinável: WebMCP para ações estruturadas da página, Chrome DevTools MCP para inspeção/automação/performance, e CUA/Browser Use para mouse visível, rolagem e fallback humano.

**Architecture:** Um único fluxo de decisão escolhe o menor mecanismo suficiente. O PowerShell apenas prepara e diagnostica um Chrome dedicado no Windows; não tenta substituir o navegador nem virar automação de mouse. O site Mega Painel expõe ferramentas WebMCP read-only/visuais; o Chrome DevTools MCP oficial descobre e executa essas tools, lê DOM/console/rede e roda Lighthouse; o CUA mantém o cursor visível e ensina clique, hover, drag, scroll e navegação quando a página não oferece uma tool estruturada.

**Tech Stack:** Windows PowerShell 5.1+, Chrome 151, Chrome DevTools Protocol, `chrome-devtools-mcp@1.7.0`, WebMCP nativo (`document.modelContext`), JavaScript clássico, Node.js ESM + `node:test`, CUA/computer-use, Lighthouse/DevTools.

---

## 1. Medições e fatos que fundamentam o plano

### Ambiente atual

```text
Chrome instalado: 151.0.7922.140
Hermes browser backend: browser-use
Hermes computer_use backend: cua
Browser Use: sessões gravadas
Chrome existente: sem endpoint DevTools owned pelo cua-driver
```

A tentativa read-only de conectar o navegador atual retornou:

```text
browser_requires_setup: no owned DevTools endpoint for pid 23980
```

Isso não significa que o Chrome esteja quebrado. Significa que a sessão pessoal atual não foi lançada/assumida pelo driver com endpoint CDP autorizado.

### WebMCP

Fonte: `webmachinelearning/webmcp`, HEAD observado `fca7462d703c...`.

- WebMCP deixa a própria página registrar funções/forms como tools para agentes.
- API nativa proposta: `document.modelContext`.
- Complementa MCP backend; não o substitui.
- Se a página não expõe tool suficiente, o agente pode voltar para automação geral.
- Chrome possui Origin Trial desde Chrome 149; máquina atual está no Chrome 151.
- Suporte real no domínio/aba continua `UNKNOWN` até feature detection:

```js
typeof document.modelContext?.registerTool === 'function'
```

### Chrome DevTools MCP

Fonte: `ChromeDevTools/chrome-devtools-mcp`, HEAD observado `8f25f69e79a5...`.

- Pacote oficial observado: `chrome-devtools-mcp@1.7.0`.
- Controla Chrome via DevTools/Puppeteer.
- Possui navegação, click, fill, hover, drag, screenshot, snapshot, console, rede, performance e Lighthouse.
- WebMCP existe como categoria experimental:

```text
--categoryExperimentalWebmcp=true
list_webmcp_tools
execute_webmcp_tool
```

- Telemetria vem ligada por padrão; plano opta por desligar:

```text
--no-usage-statistics
--no-performance-crux
```

### Quickstart comunitário

Fonte: `WebMCP-org/chrome-devtools-quickstart`, HEAD observado `73389a63a256...`.

- Pacotes observados:
  - `@mcp-b/chrome-devtools-mcp@3.0.0`
  - `@mcp-b/global@4.0.0`
- Usa `navigator.modelContext`, enquanto a proposta nativa usa `document.modelContext`.
- É referência/fallback, não será instalado junto do servidor oficial no primeiro corte.
- Claim externo de redução de tokens (77–89%) permanece `BENCHMARK_DA_FONTE`, não resultado provado na CentralDark.

### Evidências dos screenshots

O relatório mostrado pertence a `https://chatgpt.com/`, não à CentralDark:

```text
Performance: 1/1 auditoria visível
Accessibility: 21/21
Best Practices: 4/4
SEO: 5/5
Agentic Browsing: 1/2
```

Falha Agentic Browsing visível:

```text
llms.txt does not follow recommendations
File is missing a required H1 header (e.g., "# Title").
```

Issue CSS visível:

```css
initial-value: .5lh
```

Recurso afetado:

```text
root-ng7jmzvg.css:2
```

O repo CentralDark foi pesquisado e contém:

```text
initial-value usando lh: 0 ocorrências
llms.txt: 0 arquivos
WebMCP registerTool/modelContext: 0 ocorrências
```

Portanto:

```text
ERRO_CSS_CHATGPT != ERRO_CSS_CENTRALDARK
LIGHTHOUSE_CHATGPT != LIGHTHOUSE_CENTRALDARK
```

A lição será aplicada preventivamente à CentralDark, sem tentar corrigir arquivo externo do ChatGPT.

---

## 2. Escada canônica de navegação

A Casa deve usar esta ordem, parando no primeiro mecanismo que resolve e prova:

```text
1. MCP/API DIRETA
   → ação de backend, estado remoto, dados estruturados

2. WEBMCP DA PÁGINA
   → ação client-side exposta pelo próprio site

3. CHROME DEVTOOLS MCP / TYPED BROWSER
   → DOM, AX, console, rede, performance, refs semânticas

4. CUA / BROWSER USE COM MOUSE VISÍVEL
   → UI sem tool, canvas, browser chrome, fallback didático

5. PLAYWRIGHT ISOLADO
   → teste repetível/headless, não sessão pessoal do CHEFE
```

Regras:

```text
WEBMCP_AVAILABLE != WEBMCP_TOOL_APPLICABLE
TOOL_RETURNED != EFFECT_PROVEN_WITHOUT_STATE_READBACK
CDP_CONNECTED != USER_PROFILE_AUTHORIZED
SCREENSHOT != DOM
DOM != VISUAL_QUALITY
MOUSE_CLICK_SENT != EFFECT_CONFIRMED
LIGHTHOUSE_REPORT != RUNTIME_CAUSE
```

---

### Task 1: Arqueologia read-only do conjunto antigo

**Objective:** Distinguir extensão removida, capacidade ainda viva e ferramenta ausente antes de instalar.

**Files:** Nenhum.

**Step 1: Inventariar peças no repo**

Run:
```bash
search_files target=files pattern=manifest.json path=.
search_files target=content pattern="chrome-extension|remote-debugging-port|zendriver|puppeteer|playwright|CDP.connect|WebMCP|Lighthouse" path=.
```

Expected:
- extensão `apps/modulos/centraldark-voice/manifest.json` identificada como voz, não navegação;
- Elite Gateway/zendriver/CDP identificado como rota VPS;
- Playwright existente no root e no Bolt;
- zero WebMCP atual.

**Step 2: Inventariar Chrome instalado**

Run:
```powershell
(Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo.FileVersion
```

Expected: versão atual registrada.

**Step 3: Inventariar extensões sem ler dados pessoais**

Listar somente IDs/nomes/manifestos instalados; não ler cookies, storage, senhas ou histórico.

**Step 4: Classificar cada peça**

```text
ACTIVE
AVAILABLE_NOT_ACTIVE
REMOVED
HISTORICAL
DUPLICATE
UNKNOWN
```

**Step 5: Commit**

Nenhum commit: arqueologia é receipt do trabalho, não artefato novo por si só.

---

### Task 2: Fixar owner e contrato da navegação

**Objective:** Garantir uma rota única de decisão sem criar segundo navegador/orquestrador.

**Files:**
- Modify: `LEIA-ME-IA.md`
- Modify: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md`
- Create: `.agents/skills/navegacao-navegador-centraldark/SKILL.md`

**Step 1: Criar teste documental RED**

Create:
- `scripts/lupa/navegacao-navegador.test.mjs`

O teste deve exigir:

```text
MCP_API_FIRST
WEBMCP_SECOND
DEVTOOLS_TYPED_THIRD
CUA_MOUSE_FALLBACK
PLAYWRIGHT_TEST_ONLY
MOUSE_EFFECT_REQUIRES_READBACK
SCROLL_REQUIRES_FRESH_STATE
```

**Step 2: Rodar RED**

```bash
node --test scripts/lupa/navegacao-navegador.test.mjs
```

Expected: FAIL — skill/markers ainda ausentes.

**Step 3: Criar skill canônica**

Frontmatter proposto:

```yaml
---
name: navegacao-navegador-centraldark
description: Navega no browser por tools, DOM e mouse verificado.
version: 0.1.0
author: SEGREDO/CHEFE, Hermes Agent
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [Browser, Chrome, WebMCP, CDP, CUA]
    related_skills: [meta-lupa]
---
```

A skill não duplica ferramentas. Ela ensina a escolher a rota e verificar efeito.

**Step 4: Referenciar a skill no boot**

Adicionar ao `LEIA-ME-IA.md` somente quando a missão envolver navegador/UI/DevTools.

**Step 5: Rodar GREEN e commit**

```bash
node --test scripts/lupa/navegacao-navegador.test.mjs
git add LEIA-ME-IA.md docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md .agents/skills/navegacao-navegador-centraldark scripts/lupa/navegacao-navegador.test.mjs
git commit -m "docs(browser): cristalizar escada de navegação verificada"
```

---

### Task 3: Criar orquestrador PowerShell estável

**Objective:** Subir/parar/diagnosticar somente um Chrome agentic dedicado, sem tocar no Chrome pessoal.

**Files:**
- Create: `scripts/navegacao-navegador/navegador-centraldark.ps1`
- Create: `scripts/navegacao-navegador/navegador-centraldark.test.mjs`
- Create: `scripts/navegacao-navegador/README.md`

**Por que PowerShell:** É nativo no Windows, encontra executável/versão, abre processo com argumentos corretos, testa HTTP/CDP, registra PID e produz JSON determinístico.

**O que PowerShell NÃO fará:** clicar, interpretar DOM, executar WebMCP ou substituir CUA/DevTools.

**Step 1: Escrever teste RED do modo `doctor`**

O teste deve executar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\navegacao-navegador\navegador-centraldark.ps1 -Acao doctor -Json
```

Expected JSON:

```json
{
  "chrome_found": true,
  "chrome_version": "151.0.7922.140",
  "node_found": true,
  "npm_found": true,
  "port": 9223,
  "port_free": true,
  "profile_mode": "ISOLATED_CENTRALDARK",
  "ready": true
}
```

**Step 2: Implementar ações**

```text
-Acao doctor  → pré-requisitos, zero mutação
-Acao start   → Chrome dedicado visível + CDP 9223
-Acao status  → PID + /json/version + tabs count
-Acao stop    → encerra apenas PID registrado pelo próprio script
-Acao logs    → lê log sanitizado
```

**Step 3: Perfil isolado**

Derivar em runtime:

```powershell
$ProfileDir = Join-Path $env:LOCALAPPDATA 'CentralDark\Chrome-Agent'
$StateFile  = Join-Path $env:LOCALAPPDATA 'CentralDark\browser-runtime.json'
$LogFile    = Join-Path $env:LOCALAPPDATA 'CentralDark\logs\browser-centraldark.log'
```

Nunca usar o perfil padrão automaticamente.

**Step 4: Argumentos do Chrome**

```text
--remote-debugging-port=9223
--user-data-dir=<perfil isolado>
--no-first-run
--no-default-browser-check
about:blank
```

Chrome moderno exige `user-data-dir` não padrão para remote debugging; isso também protege as abas pessoais.

**Step 5: Readiness real**

Poll de:

```text
http://127.0.0.1:9223/json/version
```

Timeout explícito; sem sleep cego.

**Step 6: Rollback**

`stop` lê o PID do state file, confirma executável Chrome + profile esperado e só então encerra aquela árvore.

**Step 7: Testar e commit**

```bash
node --test scripts/navegacao-navegador/navegador-centraldark.test.mjs
git add scripts/navegacao-navegador
git commit -m "feat(browser): orquestrar Chrome agentic no Windows"
```

---

### Task 4: Integrar Chrome DevTools MCP oficial no Hermes

**Objective:** Dar ao Hermes tools estruturadas de Chrome sem configurar dois servidores concorrentes.

**Files:** Configuração do Hermes via consent card; não editar config manualmente.

**Step 1: Usar somente o servidor oficial no primeiro corte**

Pin:

```text
chrome-devtools-mcp@1.7.0
```

Não usar `@latest` em runtime canônico.

**Step 2: Configuração proposta**

```json
{
  "command": "cmd",
  "args": [
    "/c",
    "npx",
    "-y",
    "chrome-devtools-mcp@1.7.0",
    "--browser-url=http://127.0.0.1:9223",
    "--categoryExperimentalWebmcp=true",
    "--no-usage-statistics",
    "--no-performance-crux"
  ]
}
```

**Step 3: Autorizar pelo mecanismo correto**

Usar `setup_mcp` no Hermes para mostrar consent card. Não escrever `mcp.json` à mão.

**Step 4: Não instalar o fork comunitário ainda**

`@mcp-b/chrome-devtools-mcp@3.0.0` só entra se um teste discriminante provar que o oficial não consegue listar/executar tools WebMCP necessárias.

**Step 5: Verificar tools**

Esperado:

```text
list_pages
navigate_page
take_snapshot
click
fill
hover
drag
lighthouse_audit
list_webmcp_tools
execute_webmcp_tool
```

**Step 6: Testar sem site CentralDark ainda**

- abrir página neutra;
- `list_pages`;
- `take_snapshot`;
- sem login, sem aba pessoal, sem secrets.

**Step 7: Receipt**

```text
MCP_CONNECTED=true
CHROME_DEDICATED=true
WEBMCP_CATEGORY_VISIBLE=true|false
```

---

### Task 5: Preservar o ensinamento do mouse visível

**Objective:** Ensinar modelos futuros a manejar mouse, scroll e navegação sem clicks cegos.

**Files:**
- Modify: `.agents/skills/navegacao-navegador-centraldark/SKILL.md`
- Test: `scripts/lupa/navegacao-navegador.test.mjs`

**Step 1: Cristalizar o loop do mouse**

```text
CAPTURE
→ LOCALIZAR ELEMENTO/REF
→ HOVER QUANDO AJUDAR O HUMANO A VER
→ CLICK/DRAG/SCROLL
→ CAPTURE NOVO
→ CONFIRMAR EFEITO
```

**Step 2: Ordem de endereçamento**

```text
WEBMCP_TOOL
→ TYPED PAGE REF
→ AX/SOM ELEMENT
→ PIXEL
→ FOREGROUND SOMENTE SE DRIVER MANDAR
```

**Step 3: Rolagem didática**

Definir:

```text
scroll down 1–3 ticks → movimento curto, leitura de seção
scroll down 5–8 ticks → avanço de página
scroll up equivalente → retorno controlado
PageDown/PageUp → somente quando foco/viewport foram confirmados
Home/End → somente com intenção explícita
```

Após cada scroll:
- snapshot novo;
- verificar título/heading/elemento âncora;
- não reutilizar refs antigas.

**Step 4: Navegação dentro do próprio browser**

Preferir:
- WebMCP para funções da página;
- `navigate_page`, `go_back`, `go_forward`, `refresh` para navegação;
- mouse apenas para chrome nativo, canvas ou ausência de ferramenta.

**Step 5: Cursor público**

Manter o cursor overlay do CUA para o CHEFE ver onde o agente atua. Não tentar mover o cursor físico do usuário.

**Step 6: Contraprovas**

Testar que a skill proíbe:
- repetir click confirmado;
- scroll sem captura posterior;
- click em senha/pagamento/2FA;
- foreground previsto só porque Chrome é Electron/Chromium;
- navegar por screenshot quando WebMCP já resolve.

---

### Task 6: Criar piloto WebMCP no Mega Painel

**Objective:** Expor ações seguras do frontend CentralDark como tools nativas da página.

**Files:**
- Create: `apps/modulos/status/webmcp-tools.js`
- Create: `apps/modulos/status/webmcp-tools.test.mjs`
- Modify: `apps/modulos/status/index.html:490-493`
- Modify: `apps/modulos/status/app.js:60-65,341-364`

**Step 1: Teste RED de feature detection**

```js
assert.equal(registerCentralDarkWebMcp({ modelContext: null }).status, 'UNAVAILABLE');
```

Nenhum erro quando WebMCP não estiver disponível.

**Step 2: Standards-first adapter**

```js
function getModelContext(doc = document, nav = navigator) {
  return doc.modelContext ?? nav.modelContext ?? null;
}
```

- `document.modelContext` = nativo/proposta W3C;
- `navigator.modelContext` = compatibilidade comunitária futura;
- não instalar polyfill no primeiro corte.

**Step 3: Tools iniciais, sem mutação de backend**

1. `get_centraldark_overview`
   - retorna projeto, progresso, MCP, tools e updatedAt do `painel-data.json`.

2. `show_dashboard_section`
   - enum de IDs permitidos;
   - usa `scrollIntoView` e foco visual;
   - não aceita seletor arbitrário.

3. `refresh_dashboard`
   - chama o `refresh()` já existente;
   - retorna timestamp/estado após render.

4. `filter_timeline`
   - usa controles existentes;
   - enum/strings limitadas;
   - atualiza UI, sem backend.

**Step 4: Segurança**

Não expor:
- admin login;
- passwords/hashes;
- secrets;
- deploy/restart;
- mutation GitHub/VPS;
- execução arbitrária de selector/JS.

**Step 5: Carregar depois de `app.js`**

```html
<script src="./app.js?v=..."></script>
<script src="./webmcp-tools.js?v=..."></script>
```

**Step 6: Testar**

```bash
node --test apps/modulos/status/webmcp-tools.test.mjs
```

Expected: schema, allowlist, no-op fallback e resultados estruturados PASS.

**Step 7: Commit**

```bash
git add apps/modulos/status/webmcp-tools.js apps/modulos/status/webmcp-tools.test.mjs apps/modulos/status/index.html apps/modulos/status/app.js
git commit -m "feat(status): expor painel por WebMCP seguro"
```

---

### Task 7: Criar `llms.txt` correto para o Agentic Browsing

**Objective:** Dar contexto textual conciso aos agentes e passar a recomendação observada no Lighthouse.

**Files:**
- Create: `apps/modulos/status/llms.txt`
- Create: `apps/modulos/status/agentic-surface.test.mjs`

**Step 1: Escrever RED**

Teste exige:
- primeira linha não vazia começa com `# `;
- título único;
- links relativos/URLs válidos;
- zero secret/token/path privado;
- conteúdo PT-BR.

**Step 2: Conteúdo mínimo**

```markdown
# CentralDark Mega Painel

Painel observável da Casa CentralDark. Mostra estado de projeto, serviços, MCP e histórico operacional.

## Páginas
- / — visão geral
- /protocolos.html — protocolos operacionais
- /conselho.html — conselho de IAs
- /infra.html — infraestrutura observável

## Capacidades para agentes
- WebMCP read-only para visão geral, navegação de seções, refresh e filtros.

## Limites
- Estado vivo deve ser medido.
- O painel não concede autorização para deploy, restart ou escrita.
```

**Step 3: Testar e commit**

```bash
node --test apps/modulos/status/agentic-surface.test.mjs
git add apps/modulos/status/llms.txt apps/modulos/status/agentic-surface.test.mjs
git commit -m "docs(status): adicionar llms.txt agentic válido"
```

---

### Task 8: Tratar corretamente o warning `initial-value: .5lh`

**Objective:** Preservar o aprendizado sem alterar recurso externo nem inventar bug local.

**Files:**
- Modify: `apps/modulos/status/agentic-surface.test.mjs`
- Modify: `.agents/skills/navegacao-navegador-centraldark/SKILL.md`

**Step 1: Registrar classificação**

```text
OBSERVADO_NO_CHATGPT=true
OBSERVADO_NA_CENTRALDARK=false
```

`lh` depende de line-height e pode não satisfazer a exigência de valor inicial computacionalmente independente em `@property`. Para propriedade `<length>` própria, usar valor independente comprovado, por exemplo `8px`, quando semanticamente equivalente.

**Step 2: Teste preventivo**

Escanear CSS próprio por `@property` + `initial-value` com unidades dependentes (`lh`, `em`, `%`) e falhar somente no código CentralDark.

**Step 3: Não tocar em `root-ng7jmzvg.css`**

Esse recurso é do ChatGPT.com e não pertence ao repo nem ao Writer da Casa.

---

### Task 9: Provar WebMCP no Chrome real

**Objective:** Demonstrar tool registration, listagem, execução e efeito visual no Chrome dedicado.

**Files:** Nenhuma alteração salvo correção causal mínima.

**Step 1: Subir Chrome dedicado**

```powershell
powershell -File scripts\navegacao-navegador\navegador-centraldark.ps1 -Acao start -Json
```

**Step 2: Servir Mega Painel localmente**

Usar servidor estático existente ou comando temporário rastreado; não criar servidor paralelo permanente.

**Step 3: Feature detection**

Via DevTools MCP:

```js
JSON.stringify({
  documentModelContext: typeof document.modelContext,
  navigatorModelContext: typeof navigator.modelContext
})
```

**Step 4: Se nativo indisponível**

Classificar:

```text
ORIGIN_TRIAL_TOKEN_MISSING
FEATURE_FLAG_MISSING
IMPLEMENTATION_UNAVAILABLE
```

Não instalar polyfill automaticamente. Só após teste discriminante decidir se:
- registrar Origin Trial no domínio real;
- habilitar flag apenas no perfil dedicado de desenvolvimento;
- usar `@mcp-b/global@4.0.0` como fallback isolado.

**Step 5: Listar tools**

```text
list_webmcp_tools
```

Expected: quatro tools CentralDark.

**Step 6: Executar tools**

- `get_centraldark_overview`;
- `show_dashboard_section`;
- `refresh_dashboard`;
- `filter_timeline`.

**Step 7: Provar efeito**

Para tools visuais, comparar DOM/estado antes e depois; resposta da tool sozinha não fecha o efeito.

---

### Task 10: Provar mouse, hover, scroll e navegação

**Objective:** Validar o modo didático que o CHEFE vê na tela.

**Files:** Nenhuma alteração salvo skill se encontrar lacuna.

**Cenário 1: Hover + click**

```text
capture
→ hover em link do painel
→ CHEFE vê cursor overlay
→ click
→ capture novo
→ URL/heading confirmados
```

**Cenário 2: Scroll para baixo**

```text
capture heading A
→ scroll down amount=3
→ capture heading B
→ provar delta de viewport
```

**Cenário 3: Scroll para cima**

```text
scroll up amount=3
→ capture
→ heading A reaparece
```

**Cenário 4: Página seguinte/anterior**

Preferir `navigate_page`, `go_forward`, `go_back`. Usar click somente quando o link em si é parte do teste humano.

**Cenário 5: Fallback**

Desabilitar/ocultar WebMCP na fixture e provar que typed refs/CUA ainda resolvem sem loops.

**Critério:** Nenhuma ação é repetida após `effect=confirmed`; toda ação `unverifiable` recebe captura fresca antes de retry.

---

### Task 11: Auditoria DevTools + Lighthouse

**Objective:** Medir qualidade do Mega Painel, não inferir pelos prints do ChatGPT.

**Files:**
- Create: `scripts/navegacao-navegador/auditar-navegador.ps1`
- Modify: `scripts/navegacao-navegador/navegador-centraldark.test.mjs`

**Step 1: Lighthouse real**

Usar CLI do pacote oficial:

```text
chrome-devtools lighthouse_audit --mode snapshot
```

Ou tool MCP equivalente.

**Step 2: Categorias**

Registrar:
- Performance;
- Accessibility;
- Best Practices;
- SEO;
- Agentic Browsing;
- auditorias pass/fail, não apenas score agregado.

**Step 3: DevTools WebMCP panel**

Application → WebMCP deve mostrar:
- Available Tools;
- schema válido;
- invocation count;
- Completed/Error;
- input/output.

**Step 4: Console/Issues/Network**

Capturar:
- console errors próprios;
- requests quebradas;
- CSS issues próprios;
- latência das tools.

**Step 5: Receipt causal**

```json
{
  "target": "CentralDark Mega Painel",
  "url": "<url medida>",
  "chrome_version": "151.0.7922.140",
  "webmcp_tools": 4,
  "webmcp_calls_pass": 4,
  "lighthouse": {},
  "console_errors": 0,
  "network_failures": 0
}
```

---

### Task 12: Gates, documentação e promoção

**Objective:** Promover uma única implementação testada sem misturar extensão, MCP e mouse como se fossem a mesma coisa.

**Files:** Todos listados nas Tasks 2–11.

**Step 1: Testes específicos**

```bash
node --test scripts/lupa/navegacao-navegador.test.mjs
node --test scripts/navegacao-navegador/navegador-centraldark.test.mjs
node --test apps/modulos/status/webmcp-tools.test.mjs
node --test apps/modulos/status/agentic-surface.test.mjs
```

**Step 2: Gates gerais**

```bash
npm run test
npm run lint
npm run build
```

Relatar baseline pré-existente separadamente de regressão do HEAD.

**Step 3: Segurança**

- nenhum cookie/storage/histórico pessoal;
- nenhum perfil Chrome padrão;
- nenhum secret no llms.txt/tool output/log;
- WebMCP sem ações administrativas;
- telemetria DevTools MCP desligada;
- CrUX externo desligado por padrão;
- Chrome dedicado com rollback por PID.

**Step 4: Um PR**

```text
Intent-Authorized: SEGREDO/CHEFE
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: navegação agentic Chrome + WebMCP + mouse verificado
Writer: HERMES
Writer-Scope: scripts/navegacao-navegador + status WebMCP + skill
```

Como toca `apps/modulos/status/` e `docs/CONSCIENCIA/`, aplicar:

```text
👑 PERMITO-SEGREDO
```

**Step 5: Promoção**

Squash pela promoção canônica existente quando os gates aplicáveis fecharem. Não criar workflow novo.

---

## 3. Arquivos previstos

### Criar

- `.agents/skills/navegacao-navegador-centraldark/SKILL.md`
- `scripts/lupa/navegacao-navegador.test.mjs`
- `scripts/navegacao-navegador/navegador-centraldark.ps1`
- `scripts/navegacao-navegador/navegador-centraldark.test.mjs`
- `scripts/navegacao-navegador/auditar-navegador.ps1`
- `scripts/navegacao-navegador/README.md`
- `apps/modulos/status/webmcp-tools.js`
- `apps/modulos/status/webmcp-tools.test.mjs`
- `apps/modulos/status/llms.txt`
- `apps/modulos/status/agentic-surface.test.mjs`

### Modificar

- `LEIA-ME-IA.md`
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md`
- `apps/modulos/status/index.html`
- `apps/modulos/status/app.js`

### Não criar/instalar no primeiro corte

- segundo MCP de Chrome concorrente;
- extensão Chrome nova sem gap provado;
- perfil CDP sobre o Chrome pessoal;
- WebMCP backend paralelo;
- Playwright daemon;
- Lighthouse workflow novo;
- pasta `V2`, `FINAL`, `NOVO` ou cópia do browser.

---

## 4. Critérios de aceite

- [ ] Chrome dedicado abre via PowerShell e `/json/version` responde.
- [ ] `stop` encerra somente o PID criado pelo script.
- [ ] Chrome DevTools MCP oficial conecta com versão pinada.
- [ ] Telemetria e CrUX externos ficam desligados por padrão.
- [ ] Categoria WebMCP aparece com flag experimental correta.
- [ ] Mega Painel registra tools sem quebrar browser sem WebMCP.
- [ ] `list_webmcp_tools` encontra as tools CentralDark.
- [ ] `execute_webmcp_tool` altera UI e o efeito é relido.
- [ ] `llms.txt` começa com H1 e não contém segredo.
- [ ] CSS próprio não usa `initial-value: .5lh`.
- [ ] Mouse visível realiza hover/click/drag quando necessário.
- [ ] Scroll down/up é seguido por captura e prova de viewport.
- [ ] Navegação prefere tool/ref antes de pixel.
- [ ] Lighthouse mede o Mega Painel, não reutiliza score do ChatGPT.
- [ ] Nenhuma aba pessoal é exposta ao MCP.
- [ ] Nenhuma capacidade paralela foi criada.

---

## 5. Decisão arquitetural resumida

```text
POWERSHELL
→ prepara e verifica o Chrome dedicado

CHROME DEVTOOLS MCP
→ inspeciona, navega, depura, mede e chama WebMCP

WEBMCP
→ página oferece funções estruturadas e rápidas

CUA / BROWSER USE
→ mouse visível, scroll, canvas e fallback didático

LIGHTHOUSE
→ audita qualidade; não controla o navegador
```

**Resposta à pergunta do CHEFE:** PowerShell deixa o boot e o diagnóstico mais rápidos e estáveis no Windows. A interação fica melhor quando PowerShell não tenta fazer tudo: WebMCP resolve funções da página, DevTools resolve browser/diagnóstico e CUA resolve o mouse que o CHEFE consegue enxergar.
