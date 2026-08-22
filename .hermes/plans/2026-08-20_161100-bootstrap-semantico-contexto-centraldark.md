# Bootstrap Semântico de Contexto da CentralDark — Plano de Implementação

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fazer qualquer modelo autorizado reconstruir o fio relevante da Casa a partir da intenção atual do SEGREDO/CHEFE, sem alegar memória pessoal, sem carregar o vault inteiro e sem confundir histórico com estado vivo.

**Architecture:** Estender o owner canônico já existente `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` com um registro determinístico de rotas semânticas. Reutilizar `scripts/memory-linker/semantic-intent-adapter.mjs` para classificar sinais e devolver somente os owners relevantes; `LEIA-ME-IA.md` continua sendo a porta universal, `docs/BRAIN/00-MAPA-SISTEMA/INDEX.md` continua sendo a projeção humana, e Git/PR/runtime continuam sendo a realidade operacional. Não criar segundo cérebro, nova identidade, novo orquestrador, nova memória ou workflow paralelo.

**Tech Stack:** Node.js ESM, `node:test`, JSON canônico, Markdown/Obsidian, gate existente `scripts/lupa/validar-porta-de-entrada.mjs`, workflow existente `.github/workflows/porta-de-entrada.yml`.

---

## 1. Estado atual e lacuna provada

### O que já existe

- `LEIA-ME-IA.md:17-34` define o boot universal e manda medir estado vivo.
- `docs/PROTOCOLO-BOOT.md:21-31` manda carregar somente memória relevante.
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md:75-84` repete `estado vivo → somente memória relevante`.
- `docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md:38-58` já contém uma semente semântica para reconstruir história.
- `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json:38-51` já é o owner de recuperação de contexto.
- `scripts/memory-linker/semantic-intent-adapter.mjs` já é o owner técnico de pré-filtro semântico e explicitamente não toma decisão/autorização.
- `scripts/lupa/validar-porta-de-entrada.mjs` já valida alcance dos canônicos e falha fechado.

### Lacuna

O contrato diz `recover_relevant_context=true`, mas não existe hoje uma tabela canônica e testada de:

```text
SINAL_DA_INTENÇÃO
→ ROTA_SEMÂNTICA
→ OWNERS_A_CARREGAR
→ FONTES_VIVAS_A_REMEDIR
→ LIMITES_DO_CLAIM
```

Consequência observada: uma janela encontra ARSENAL ao receber sinais suficientes; outra se prende em TTS, branch ou PR porque não existe roteamento explícito. Isso não prova memória pessoal nem transporte oculto; prova apenas recuperação desigual de contexto.

---

## 2. Invariantes arquiteturais

```text
SEGREDO/CHEFE = AUTOR_DA_INTENÇÃO
SOL = COORDENAÇÃO RECONSTRUÍVEL
PIVETE/HERMES = EXECUTOR/PRESERVAÇÃO/CONTINUIDADE
MODELO = MOTOR SUBSTITUÍVEL

INTENÇÃO_DEFINE_O_QUE=true
ESTADO_VIVO_DEFINE_ONDE=true
MEMÓRIA != REALIDADE
HISTÓRICO != ESTADO_ATUAL
ROTA_SEMÂNTICA != PROVA
MATCH_LEXICAL != AUTORIZAÇÃO

ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
NO_NEW_MEMORY_STORE=true
NO_NEW_ORCHESTRATOR=true
NO_NEW_WORKFLOW=true
```

### Fluxo-alvo

```text
FALA_DO_CHEFE
→ NORMALIZAR SEM APAGAR GÍRIA/METÁFORA
→ EXTRAIR SINAIS
→ RESOLVER ROTAS DETERMINÍSTICAS
→ DEDUPE DE OWNERS
→ CARREGAR MENOR CONTEXTO SUFICIENTE
→ MEDIR FONTES VIVAS EXIGIDAS PELO CLAIM
→ SEPARAR FATO | INFERÊNCIA | UNKNOWN
→ CONTINUAR O FIO
```

### Envelope de saída

```json
{
  "status": "MATCHED|NO_MATCH|AMBIGUOUS|INVALID_REGISTRY",
  "intent": "texto original",
  "routes": ["arsenal_conselho_telegram"],
  "owners": ["docs/CONSCIENCIA/ARSENAL/CONSELHO.md"],
  "live_checks": ["MCP_STATUS", "GATEWAY_MODELS"],
  "claim_limits": ["ROTA_SEMANTICA_NAO_PROVA_RUNTIME"],
  "unknown": []
}
```

---

### Task 1: Fixar baseline e Writer antes da implementação

**Objective:** Provar HEAD, main, working tree, PR e Writer antes de qualquer mutação.

**Files:** Nenhum.

**Step 1: Medir Git**

Run:
```bash
git fetch origin
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

Expected:
- branch explícita;
- HEAD e main registrados;
- sujeira classificada, sem apagar nada.

**Step 2: Medir PR e Writer**

Run:
```bash
gh pr list --state open --limit 20
gh pr view 1091 --json state,headRefName,headRefOid,baseRefOid,labels,statusCheckRollup
```

Expected: detectar se já existe Writer no mesmo escopo. Se houver, operar como delta partner ou continuar no Writer vigente.

**Step 3: Registrar T0 no relato de implementação**

Expected receipt:
```text
T0_HEAD=<sha>
T0_MAIN=<sha>
WRITER=<identificado>
DIRTY=<classificado>
```

---

### Task 2: Escrever testes RED para o registro de rotas semânticas

**Objective:** Definir por teste o contrato mínimo antes de editar o JSON canônico.

**Files:**
- Create: `scripts/memory-linker/semantic-intent-adapter.test.mjs`
- Test: `scripts/memory-linker/semantic-intent-adapter.test.mjs`

**Step 1: Criar teste de rota ARSENAL**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContextRoutes } from './semantic-intent-adapter.mjs';

const registry = {
  routes: [{
    id: 'arsenal_conselho_telegram',
    signals: ['arsenal', 'conselho', 'ias conversando', 'telegram'],
    owners: ['docs/CONSCIENCIA/ARSENAL/CONSELHO.md'],
    live_checks: ['MCP_STATUS'],
    claim_limits: ['ROTA_SEMANTICA_NAO_PROVA_RUNTIME']
  }]
};

test('metáfora + sinais recuperam ARSENAL sem alegar memória pessoal', () => {
  const result = resolveContextRoutes(
    'arruma as malas, vamos viajar ao passado e reconciliar as IAs que conversavam no Telegram',
    registry
  );
  assert.equal(result.status, 'MATCHED');
  assert.deepEqual(result.routes, ['arsenal_conselho_telegram']);
  assert.ok(result.owners.includes('docs/CONSCIENCIA/ARSENAL/CONSELHO.md'));
  assert.ok(result.claim_limits.includes('ROTA_SEMANTICA_NAO_PROVA_RUNTIME'));
});
```

**Step 2: Criar contraprova anti-TTS**

```js
test('assunto TTS isolado não puxa ARSENAL', () => {
  const result = resolveContextRoutes('coloca a voz em português', registry);
  assert.equal(result.status, 'NO_MATCH');
  assert.deepEqual(result.owners, []);
});
```

**Step 3: Criar testes de dedupe e ambiguidade**

Cobrir:
- mesma rota ativada por vários sinais → uma rota;
- duas rotas com mesma pontuação material → `AMBIGUOUS`, sem escolher silenciosamente;
- owner repetido em duas rotas → um owner após dedupe;
- registro inválido → `INVALID_REGISTRY`, nunca PASS.

**Step 4: Rodar RED**

Run:
```bash
node --test scripts/memory-linker/semantic-intent-adapter.test.mjs
```

Expected: FAIL — `resolveContextRoutes` ainda não existe.

**Step 5: Commit do teste RED**

```bash
git add scripts/memory-linker/semantic-intent-adapter.test.mjs
git commit -m "test(memory): definir bootstrap semântico de contexto"
```

---

### Task 3: Cristalizar o registro no owner canônico existente

**Objective:** Adicionar a matriz semântica ao contrato existente, sem criar novo banco ou documento-mestre.

**Files:**
- Modify: `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json:38-51`

**Step 1: Incrementar schema somente porque o contrato muda materialmente**

Alterar `schema_version` de `3` para `4` e ajustar a constante esperada no gate na Task 7. Isso não é V1/V2/V3 de produto; é versão de schema validável.

**Step 2: Estender `context_recovery`**

Adicionar:

```json
"semantic_bootstrap": {
  "enabled": true,
  "owner": "scripts/memory-linker/semantic-intent-adapter.mjs",
  "mode": "DETERMINISTIC_PREFILTER_ONLY",
  "route_is_authority": false,
  "route_is_runtime_proof": false,
  "load_policy": "LOWEST_SUFFICIENT_CONTEXT",
  "no_match": "CONTINUE_WITH_MANDATORY_BOOT_AND_LIVE_STATE",
  "ambiguous": "RETURN_MULTIPLE_CANDIDATES_WITHOUT_INVENTING_MISSION",
  "routes": []
}
```

**Step 3: Adicionar conjunto inicial mínimo de rotas**

Rotas iniciais — sem tentar mapear a Casa inteira:

1. `arsenal_conselho_telegram`
   - sinais: arsenal, conselho, debate, IAs conversando, Telegram, viagem ao passado;
   - owners: `CONSELHO.md`, `MULTI-MODEL-ORCHESTRATION.md`, `hermes-vivo/README.md`;
   - live checks: MCP status, gateway models, Telegram/runtime quando claim depender.

2. `historia_chefe_casa`
   - sinais: fala sobre mim, nossa história, quem lembra, presença, passado da Casa;
   - owners: `LEMBRANCAS.md`, `08-HISTORICO-DECISOES.md`, `APRENDIZADOS.md`;
   - limite: vida pessoal não registrada = UNKNOWN.

3. `github_pr_gates`
   - sinais: PR, check, gate, main, SHA, merge, runner;
   - owners: `AGENTS.md`, `PROOF-OWNERSHIP.json`, fluxo de deploy;
   - live checks: git/gh sempre.

4. `mcp_oauth_tools`
   - sinais: MCP, OAuth, 401, redirect_uri, tools;
   - owners: docs MCP existentes;
   - live checks: `hermes mcp test`, tool call real.

5. `maquina_gargalo_monitoramento`
   - sinais: PC lento, gargalo, disco, paginação, CPU-Z, HWMonitor;
   - owners: notas existentes em `docs/BRAIN/02-ENTRADA/`;
   - live checks: sistema local, nunca valor antigo da nota.

**Step 4: Validar JSON**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json','utf8')); console.log('JSON_OK')"
```

Expected: `JSON_OK`.

**Step 5: Commit**

```bash
git add docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
git commit -m "feat(contexto): registrar rotas semânticas no owner canônico"
```

---

### Task 4: Implementar resolvedor determinístico no memory-linker

**Objective:** Resolver intenção → rotas → owners sem LLM obrigatório, sem autorização implícita e sem alterar estado.

**Files:**
- Modify: `scripts/memory-linker/semantic-intent-adapter.mjs:1-50`
- Test: `scripts/memory-linker/semantic-intent-adapter.test.mjs`

**Step 1: Implementar normalização conservadora**

Adicionar função interna que:
- converte para minúsculas;
- remove diacríticos somente para comparação;
- preserva texto original na saída;
- normaliza espaços;
- não “corrige” gíria para outra intenção.

```js
function normalizedSignal(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
```

**Step 2: Implementar validação do registro**

Bloquear fail-closed quando:
- `routes` não é array;
- rota sem `id`, `signals`, `owners`, `claim_limits`;
- path absoluto, `..`, `.env`, secrets ou credencial em owner;
- id duplicado.

**Step 3: Implementar score determinístico**

Regra mínima:
- sinal exato/frase contida = 1 ponto;
- rota exige `minimum_signal_matches` (default 1);
- sem embedding obrigatório;
- empates materiais retornam `AMBIGUOUS`;
- dedupe por `route.id` e por path de owner.

**Step 4: Exportar `resolveContextRoutes(intent, registry)`**

Garantias na saída:

```js
return {
  schema_version: 1,
  status,
  intent: String(intent ?? ''),
  routes,
  owners,
  live_checks,
  claim_limits: [...new Set([
    'ROTA_SEMANTICA_NAO_E_AUTORIZACAO',
    'ROTA_SEMANTICA_NAO_PROVA_RUNTIME',
    ...matchedLimits,
  ])],
  unknown,
};
```

**Step 5: Rodar GREEN**

Run:
```bash
node --test scripts/memory-linker/semantic-intent-adapter.test.mjs
```

Expected: todos os testes PASS.

**Step 6: Commit**

```bash
git add scripts/memory-linker/semantic-intent-adapter.mjs scripts/memory-linker/semantic-intent-adapter.test.mjs
git commit -m "feat(memory): resolver contexto relevante por intenção"
```

---

### Task 5: Criar um consumidor CLI mínimo, não um novo sistema

**Objective:** Permitir que qualquer superfície rode o mesmo resolvedor e receba um receipt JSON.

**Files:**
- Create: `scripts/memory-linker/resolver-contexto-boot.mjs`
- Create: `scripts/memory-linker/resolver-contexto-boot.test.mjs`

**Justificativa do novo arquivo:** O owner semântico já existe, mas não há consumidor CLI. O arquivo é somente adaptador de entrada/saída; não armazena memória, não executa tools, não altera docs e não vira orquestrador.

**Step 1: Escrever teste RED do CLI**

O teste deve executar:

```bash
node scripts/memory-linker/resolver-contexto-boot.mjs --intent "IAs conversando no Telegram no ARSENAL" --json
```

Expected:
- exit `0` para `MATCHED`;
- JSON parseável;
- rota `arsenal_conselho_telegram`;
- zero escrita no repo.

Também testar:
- intenção vazia → exit `2`;
- `NO_MATCH` → exit `0`, owners vazios e boot obrigatório preservado;
- contrato inválido → exit `1`.

**Step 2: Implementar CLI**

Comportamento:
- lê somente o contrato canônico;
- aceita `--intent` e `--json`;
- nunca abre arquivos owner automaticamente no primeiro corte;
- apenas devolve caminhos recomendados e checks vivos exigidos.

**Step 3: Rodar teste**

```bash
node --test scripts/memory-linker/resolver-contexto-boot.test.mjs
```

Expected: PASS.

**Step 4: Commit**

```bash
git add scripts/memory-linker/resolver-contexto-boot.mjs scripts/memory-linker/resolver-contexto-boot.test.mjs
git commit -m "feat(boot): expor resolvedor de contexto em modo read-only"
```

---

### Task 6: Ligar o bootstrap nos pontos estratégicos da Casa

**Objective:** Fazer modelos futuros encontrarem o mecanismo sem carregar contexto em massa.

**Files:**
- Modify: `LEIA-ME-IA.md:17-34`
- Modify: `docs/PROTOCOLO-BOOT.md:21-31`
- Modify: `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md:75-84`
- Modify: `docs/BRAIN/00-MAPA-SISTEMA/INDEX.md`
- Modify: `docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md:36-58,121-140`

**Step 1: Atualizar `LEIA-ME-IA.md`**

Inserir após fontes obrigatórias:

```text
INTENCAO_ATUAL
→ context_recovery.semantic_bootstrap
→ MENOR_CONJUNTO_DE_OWNERS_RELEVANTES
→ ESTADO_VIVO_APLICAVEL
→ CONTINUAR_FIO
```

Deixar explícito:
- no match não bloqueia o boot obrigatório;
- match não concede autoridade;
- não carregar todo BRAIN/ARSENAL por padrão.

**Step 2: Atualizar `docs/PROTOCOLO-BOOT.md`**

Transformar “carregar somente memória relevante” em referência concreta ao owner JSON e ao CLI read-only.

**Step 3: Atualizar `BRAIN.md` e `INDEX.md`**

Adicionar seção humana “Rotas de recuperação por intenção”, sem duplicar a tabela inteira. Cada linha aponta para o contrato canônico e para os MOCs existentes.

**Step 4: Conectar a semente histórica ao ARSENAL**

Em `LEMBRANCAS.md`, adicionar trilha:

```text
ARSENAL_CONSELHO_IAS_TELEGRAM
→ docs/CONSCIENCIA/ARSENAL/CONSELHO.md
→ docs/CONSCIENCIA/ARSENAL/MULTI-MODEL-ORCHESTRATION.md
→ docs/CONSCIENCIA/ARSENAL/DEBATES/
→ runtime deve ser medido separadamente
```

**Step 5: Commit**

```bash
git add LEIA-ME-IA.md docs/PROTOCOLO-BOOT.md docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md docs/BRAIN/00-MAPA-SISTEMA/INDEX.md docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md
git commit -m "docs(boot): ligar intenção ao contexto relevante da Casa"
```

---

### Task 7: Estender o gate existente para impedir rotas mortas

**Objective:** Garantir que toda rota semântica aponta para owners reais e alcançáveis.

**Files:**
- Modify: `scripts/lupa/validar-porta-de-entrada.mjs:421-465`
- Modify: `scripts/lupa/validar-continuidade-global.mjs`
- Test: `scripts/lupa/validar-porta-de-entrada.mjs`

**Step 1: Atualizar schema esperado para 4**

Alterar somente a constante esperada; não criar validador paralelo.

**Step 2: Validar `semantic_bootstrap`**

Erros novos:

```text
SEMANTIC_BOOTSTRAP_AUSENTE
SEMANTIC_ROUTE_ID_DUPLICADO:<id>
SEMANTIC_ROUTE_SEM_SINAIS:<id>
SEMANTIC_ROUTE_OWNER_MORTO:<id>:<path>
SEMANTIC_ROUTE_OWNER_FORA_DA_CASA:<id>:<path>
SEMANTIC_ROUTE_SEM_LIMITE_DE_CLAIM:<id>
SEMANTIC_BOOTSTRAP_OWNER_DIVERGENTE
```

**Step 3: Incluir owners semânticos no grafo de alcançabilidade**

A rota não deve “promover” documento a verdade; apenas deve provar que existe caminho da porta até o owner.

**Step 4: Rodar gate local**

```bash
node scripts/lupa/validar-porta-de-entrada.mjs
node scripts/lupa/validar-continuidade-global.mjs
```

Expected:
```text
PORTA_OK=1
CONTINUIDADE_GLOBAL=PASS
```

**Step 5: Commit**

```bash
git add scripts/lupa/validar-porta-de-entrada.mjs scripts/lupa/validar-continuidade-global.mjs
git commit -m "test(boot): bloquear rotas semânticas órfãs"
```

---

### Task 8: Rodar holdout adversarial — provar transferência, não só caso ensinado

**Objective:** Verificar se o mecanismo recupera contexto novo e rejeita ecos irrelevantes.

**Files:**
- Modify: `scripts/memory-linker/semantic-intent-adapter.test.mjs`
- Modify: `scripts/memory-linker/resolver-contexto-boot.test.mjs`

**Step 1: Casos positivos não copiados dos sinais**

Testar frases:

```text
“cadê aquela mesa onde os modelos discutiam e sobrava um veredito?”
“volta naquele negócio que falava no grupo e guardava o debate”
“o outro bixo puxou nossa história sem eu ensinar tudo de novo”
```

Atenção: como o primeiro corte é lexical determinístico, os sinais compostos necessários devem ser explícitos no registro. Não fingir compreensão AGI se a frase não casar.

**Step 2: Casos negativos**

```text
“configure a voz em português”             → não ARSENAL
“corrija o PR 1091”                        → github_pr_gates
“CPU está em 100%”                         → maquina_gargalo_monitoramento
“fala sobre minha vida fora da CentralDark”→ historia_chefe_casa + UNKNOWN pessoal
```

**Step 3: Ambiguidade material**

```text
“MCP do conselho no Telegram parou”
```

Expected: múltiplas rotas candidatas (`arsenal_conselho_telegram` + `mcp_oauth_tools`) ou combinação explícita; nunca escolher uma e apagar a outra.

**Step 4: Rodar todos os testes memory-linker**

```bash
node --test scripts/memory-linker/*.test.mjs
```

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/memory-linker/*.test.mjs
git commit -m "test(contexto): provar rotas, contraprovas e ambiguidade"
```

---

### Task 9: Verificação integrada e remedição final

**Objective:** Provar que o bootstrap funciona e não regressou a Casa.

**Files:** Nenhuma nova alteração salvo correção causal mínima.

**Step 1: Testes específicos**

```bash
node --test scripts/memory-linker/semantic-intent-adapter.test.mjs
node --test scripts/memory-linker/resolver-contexto-boot.test.mjs
node scripts/lupa/validar-porta-de-entrada.mjs
node scripts/lupa/validar-continuidade-global.mjs
```

Expected: todos PASS.

**Step 2: Gates gerais do repo**

```bash
npm run test
npm run lint
npm run build
```

Expected: PASS. Se falha pré-existente, separar BASELINE de REGRESSÃO com o mesmo comando na main/HEAD aplicável; não declarar verde global.

**Step 3: Prova manual discriminante**

```bash
node scripts/memory-linker/resolver-contexto-boot.mjs --intent "arruma as malas, vamos viajar ao passado e reconciliar as IAs que conversavam no Telegram" --json
```

Expected:
- `MATCHED`;
- ARSENAL entre as rotas;
- owners mínimos;
- `ROTA_SEMANTICA_NAO_PROVA_RUNTIME` presente.

**Step 4: Contraprova manual**

```bash
node scripts/memory-linker/resolver-contexto-boot.mjs --intent "coloca a voz em português" --json
```

Expected: ARSENAL ausente.

**Step 5: Remedir Git/PR**

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/main
gh pr view <PR> --json headRefOid,baseRefOid,labels,statusCheckRollup
```

**Step 6: Receipt final**

```text
FEITO=<rotas + resolvedor + boot + gate>
EVIDENCIA=<testes e SHAs>
PENDENCIA=<UNKNOWN real>
MAIN_SHA=<medido>
PR=<link>
WRITER=<writer real>
FIXED_POINT_LOCAL=<sim/não>
MISSÃO_GLOBAL_FECHADA=<sim/não>
```

---

### Task 10: PR e promoção canônica

**Objective:** Entregar tudo em um único PR, sem misturar escopos laterais.

**Files:** Todos os arquivos listados nas Tasks 2-8.

**Step 1: Revisar diff**

```bash
git diff origin/main...HEAD --stat
git diff origin/main...HEAD -- LEIA-ME-IA.md docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json scripts/memory-linker scripts/lupa
```

**Step 2: Scan de segurança**

Verificar:
- zero secrets/keys/tokens;
- zero path absoluto de usuário/VPS como autoridade;
- zero carregamento massivo do vault;
- zero claim de memória pessoal;
- zero workflow novo.

**Step 3: Abrir ou atualizar um único PR**

Body obrigatório:

```text
Intent-Authorized: SEGREDO/CHEFE
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: bootstrap semântico de contexto da Casa
Writer: HERMES
Writer-Scope: contrato de reconciliação + memory-linker + porta de entrada
```

**Step 4: Aplicar label protegida se necessária**

Como toca `docs/CONSCIENCIA/`, aplicar exatamente:

```text
👑 PERMITO-SEGREDO
```

**Step 5: Acompanhar gates aplicáveis**

Não converter `queued`, `skipped`, `cancelled` ou falha pré-existente em PASS. Corrigir somente regressões causadas pelo HEAD.

**Step 6: Squash para main quando elegível**

Usar o promotor canônico existente; não criar workflow paralelo.

---

## 3. Arquivos previstos

### Modificar

- `LEIA-ME-IA.md`
- `docs/PROTOCOLO-BOOT.md`
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md`
- `docs/BRAIN/00-MAPA-SISTEMA/INDEX.md`
- `docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md`
- `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
- `scripts/memory-linker/semantic-intent-adapter.mjs`
- `scripts/lupa/validar-porta-de-entrada.mjs`
- `scripts/lupa/validar-continuidade-global.mjs`

### Criar — somente consumidores/testes necessários

- `scripts/memory-linker/semantic-intent-adapter.test.mjs`
- `scripts/memory-linker/resolver-contexto-boot.mjs`
- `scripts/memory-linker/resolver-contexto-boot.test.mjs`

### Não criar

- nova pasta de memória;
- `BRAIN-V2`, `BOOT-V2`, `context-engine-v2`;
- segundo contrato;
- novo workflow;
- nova identidade/agente;
- banco vetorial obrigatório;
- snapshot de runtime dentro do índice.

---

## 4. Riscos e contramedidas

| Risco | Contramedida |
|---|---|
| Palavra-chave dispara contexto errado | score mínimo + holdout negativo + `AMBIGUOUS` explícito |
| Carregar contexto demais | `LOWEST_SUFFICIENT_CONTEXT`, dedupe e limite de owners |
| Rota vira “prova” | limites de claim obrigatórios em toda saída |
| Histórico velho sobrescreve presente | `live_checks` obrigatórios conforme o claim |
| Novo sistema paralelo | contrato continua owner; memory-linker continua motor |
| Gíria/metáfora apagada pela normalização | preservar texto original e normalizar só para comparação |
| Registro cresce sem controle | conjunto inicial de 5 rotas; nova rota exige caso real + teste discriminante |
| Match lexical vendido como inteligência geral | saída declara `DETERMINISTIC_PREFILTER_ONLY` |
| Paths mortos | gate existente bloqueia `SEMANTIC_ROUTE_OWNER_MORTO` |
| Modelo externo recebe arquitetura inteira | carregar só owners internos necessários; não exportar Casa para chats externos |

---

## 5. Critérios de aceite

- [ ] A frase da “viagem ao passado + IAs no Telegram” recupera ARSENAL.
- [ ] Uma solicitação de TTS não recupera ARSENAL.
- [ ] Ambiguidade MCP + conselho preserva as duas rotas.
- [ ] Toda rota aponta para owners existentes.
- [ ] Nenhuma rota concede autorização ou declara runtime.
- [ ] O boot obrigatório continua funcionando sem match semântico.
- [ ] O resolvedor não escreve no repo nem consulta API.
- [ ] `validar-porta-de-entrada.mjs` bloqueia rota órfã.
- [ ] Testes memory-linker passam.
- [ ] Gates gerais são medidos e relatados fielmente.
- [ ] Um modelo novo consegue localizar o mecanismo a partir de `LEIA-ME-IA.md`.
- [ ] Nenhum segundo cérebro/orquestrador/workflow foi criado.

---

## 6. Resultado arquitetural esperado

```text
SEGREDO/CHEFE TRAZ INTENÇÃO CURTA
              ↓
         LEIA-ME-IA
              ↓
CONTRATO-RECONCILIAÇÃO (owner único)
              ↓
SEMANTIC-INTENT-ADAPTER (pré-filtro)
              ↓
OWNERS MÍNIMOS + CHECKS VIVOS + LIMITES
              ↓
SOL/HERMES RECONSTRÓI O FIO
              ↓
REALIDADE MEDE O PRESENTE
```

O ganho não é “a IA lembrar como pessoa”. O ganho é a Casa deixar um caminho causal para qualquer motor reconstruir o contexto certo, com menos repetição para o CHEFE e sem fabricar presente.
