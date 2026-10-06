---
name: screenpipe-live-observer
description: Sensor global read-only da Casa para qualquer ator CentralDark autorizado recuperar tela, OCR, accessibility, áudio, input, clipboard, atividade, frames, URLs e contexto temporal via Screenpipe; normaliza evidência para o handoff canônico.
status: CANONICAL_CANDIDATE
owner: SEGREDO/CHEFE
runtime_role: GLOBAL_LIVE_OBSERVATION_SENSOR
boot_discoverable: true
mutation_authority: false
---

## Integração prática com Screenpipe + Hermes via Omni Router

Esta seção é o delta absorvido da skill local `screenpipe-hermes-integration` (Pivete/skills/screenpipe-hermes-integration/SKILL.md) via Kimetsu/17 Respirações.

### Gatilhos de ativação
Use esta integração quando precisar que Screenpipe ou qualquer agente Screenpipe-enabled consulte o Hermes Agent via CentralDark Omni Router, mantendo o Hermes escondido atrás do router.

### PRÉ-REQUISITOS
- Screenpipe Desktop rodando localmente (`http://127.0.0.1:3030`)
- Screenpipe Browser Bridge extension instalada e conectada/autenticada no Chrome/Chromium
- CentralDark Omni Router instalado e escutando na porta `8099`
- Hermes Agent disponível na mesma máquina (`hermes` command works)

### PASSOS
1. **Habilitar o motor Hermes no Omni Router** — editar `config.yaml` do router: `engines.hermes.configured: true`; deixar `base_url` e `api_key` vazios se usar transporte CLI padrão; salvar.
2. **(Re)iniciar o Omni Router** para pegar a mudança.
3. **Verificar** que o router reporta `hermes: {configured: true}` em `/health` e que `hermes/hermes` aparece em `/v1/models`.
4. **Testar chamada direta** opcional: `POST /v1/chat/completions` com `model=hermes/hermes`, esperar chat.completion JSON válido.
5. **Configurar Screenpipe para usar o Omni Router como Provider OpenAI-compatible**:
   - Provider ID: `centraldark-hermes`
   - Base URL: `http://127.0.0.1:8099/v1`
   - Model Source URL: `http://127.0.0.1:8099/v1/models`
   - Model: `auto` ou `hermes/hermes`
   - API Key: deixar vazio (router local CLI não exige chave)
   - Clicar Save & test → deve listar modelos disponíveis.
6. **Usar**: Screenpipe/Screenpipe-enabled agent envia requisições para `http://127.0.0.1:8099/v1`; o router roteia para Hermes Agent.

### PITFALLS & TROUBLESHOOTING
- Router ainda mostra `hermes.configured: false`: editou arquivo errado ou esqueceu de salvar/restartar o processo exato na porta 8099.
- `There was an error parsing the body`: payload JSON malformado (aspas simples) ou nome de modelo desconhecido. Verificar `model` contra `/v1/models`.
- Teste de conexão do Screenpipe falha: garantir Screenpipe Desktop alcançável em `127.0.0.1:3030` e Base URL correto (sem trailing slash).
- Hermes Agent não responde: se `base_url` vazio, o router usa CLI do Hermes; garantir `hermes` no PATH (`hermes --version`). Ou subir Hermes em servidor (`hermes server --port 11434`) e setar `base_url: "http://127.0.0.1:11434/v1"`.
- Conflito de porta: se outro serviço usa 8099, mudar porta no config do router e atualizar provider no Screenpipe.

### Monitoração in-the-job
Ver `references/monitor-doctrine.md` para o contrato do monitor live, setup de cronjob e armadilhas bash neste ambiente.

### Windows cron + bash pitfall (execvpe /bin/bash failed)
Se script `.sh` do monitor falha em cron com `CreateProcessCommon:... execvpe(/bin/bash) failed: No such file or directory`, o problema é o contexto de execução do cron (sem `/bin/bash` alcançável), não o conteúdo do `.sh`. Alternativa resiliente: monitor Python-native (`.py`) que não dependa de bash/WSL. Ver `references/windows-cron-bash-execvpe-pitfall.md`.

### Investigação & Forensics (READ_ONLY, ZERO_MUTATION)
1. **Runtime** — `Get-NetTCPConnection -State Listen -LocalPort 3030` (Screenpipe) e `8099` (Omni). Registrar PID + exe. Não imprimir segredos.
2. **Config refs (sem segredos)** — `search_files` com `file_glob` restrito (yaml/json); `grep -ivE ".env|token=|credential"`. Evitar grep amplo em `node_modules`/dist.
3. **Screenpipe vivo** — `curl 127.0.0.1:3030/health` → 200 = alcançável; 403 root = auth ok (não é falha).
4. **Omni vivo + invocação** — `POST /v1/chat/completions` com `model=hermes/hermes`. Se `hermes_stdio_turn_failed` → OMNI_RUNTIME PASS, OMNI→HERMES FAIL (engine não responde; não investigar env para evitar violação "do not tamper").
5. **Ferramenta carregada na sessão?** — listar tools no system prompt. Se nenhum `screenpipe`/MCP → `HERMES_SCREENPIPE_TOOL_LOADED=UNKNOWN`; invocação impossível.
6. **Teste causal (A vs B)** — A: query Screenpipe direto (fingerprint). B: via ferramenta Hermes (fingerprint). Comparar. Se B não executável (ferramenta ausente) → `SCREENPIPE_TO_HERMES_CAUSAL=UNKNOWN`. Não declarar PASS.
7. **Traçar E2E** — propagar `TRACE_ID` através Screenpipe→Hermes→Omni→engine; buscar ID nos logs. Mesmo ID + timestamps consistentes = forte corrente causal.

### Status codes
- `PASS` — provado por medição (process/health/port).
- `FAIL` — provado por evidência de falha (invoke error).
- `UNKNOWN` — não provado, não negado (sem evidência em qualquer direção).
- `CONFIGURED_NOT_PROVEN` — config existe mas instância não confirmada.

### Leis (não-negociáveis)
```
CONFIGURED != ACTIVE
ACTIVE != INVOCATION_PROVEN
HEALTH != PROVIDER_INVOCATION_PROOF
CORRELATION != CAUSE
UNKNOWN != PASS
ACTION != PROOF
```

### O que NÃO prova
- Ferramenta existe ≠ ferramenta carregada na sessão
- Processo roda ≠ Hermes consome
- Health green ≠ invocação aconteceu
- Screenpipe conectado ≠ Hermes recebe contexto

O protocolo forense completo vive em `references/e2e-forensic-protocol.md`.

### Hermes Screenpipe Tool Gap (limitação conhecida)
Enquanto esta sessão, o Hermes Agent pode NÃO ter a ferramenta/MCP Screenpipe carregada mesmo quando Screenpipe e Omni estão rodando. Isso é um gap de instrumentação de sessão, não bug do pipeline. Para claim `HERMES_SCREENPIPE_INVOCATION=PASS` é MANDATÓRIO observar invocação real com request_id/trace. Não inferir a partir de Screenpipe rodando ou Omni roteando.

# Screenpipe Live Observer — sensor global da Casa

## Finalidade

Screenpipe é um **sensor/arquivo temporal local** do estado visto/dito/digitado na Casa. Ele não é cérebro, owner, Writer, Judge, handoff próprio nem fonte absoluta da verdade.

```text
SCREENPIPE = SENSOR + HISTORY + LIVE_CONTEXT_PROVIDER
SCREENPIPE != AUTHORITY
SCREENPIPE != WRITER
SCREENPIPE != JUDGE
SCREENPIPE != NEW_BRAIN
SCREENPIPE != NEW_HANDOFF_PROTOCOL
REALITY = JUDGE
```

Qualquer agente, modelo, skill, worker, runtime, superfície ou processo CentralDark **autorizado no host** pode requisitar esta capacidade pelo `MEGAZORD-CENTRALDARK` / `Capability Contract Router` quando tela, histórico, input, áudio, accessibility ou contexto temporal discriminarem um fato material. SOL/Codex e HERMES são apenas exemplos de consumidores, nunca limite do contrato.

```text
ANY_AUTHORIZED_CENTRALDARK_ACTOR
+ NEEDS_DESKTOP_EVIDENCE
+ SCREENPIPE_AVAILABLE
→ SCREENPIPE_LIVE_OBSERVER
→ NORMALIZED_EVIDENCE
→ CALLER_CONTINUES
```

## Fontes oficiais observadas

- Screenpipe MCP source/README: `https://github.com/screenpipe/screenpipe/tree/main/packages/screenpipe-mcp`
- MCP setup/docs: documentação oficial Screenpipe para Codex/Claude/Cursor.

Contrato observado na documentação oficial:

```text
SCREENPIPE_LOCAL_API=http://localhost:3030
SCREENPIPE_MCP_HTTP_DEFAULT=http://localhost:3031/mcp
SCREENPIPE_MCP_HTTP_HEALTH=http://localhost:3031/health
```

`3030` é o daemon/API local. `3031` é transporte MCP HTTP opcional. O modo stdio expõe o conjunto completo de ferramentas; o transporte HTTP pode ter superfície menor e deve ser medido antes de presumir paridade.

## Capacidades operacionais

Quando disponíveis no runtime, podem ser usadas:

```text
search-content
  → all | ocr | audio | input | accessibility | parsed
  → filtros por tempo, app, janela, speaker, frame

activity-summary
  → resumo comprimido de uso de apps, atividade e contexto recente

search-elements
  → árvore/accessibility + blocos OCR
  → purpose=automation para contexto de automação fresco

get-frame-elements
  → árvore completa de um frame

frame-context
  → accessibility + parsed nodes + URLs extraídas

keyword-search
  → busca FTS5 rápida em OCR + áudio

export-video
  → reconstrução visual por intervalo

meetings
  → list/get/update/start/stop quando disponível

speaker tools
  → busca, nomeação e merge de speakers quando disponível

add-tags
  → etiqueta frame/audio para recuperação futura

update-memory
  → memória Screenpipe quando explicitamente aplicável; NÃO substitui memória canônica CentralDark

send-notification
  → notificação na UI Screenpipe

control-recording
  → iniciar/parar áudio; NÃO equivale a pausar captura de tela

health-check
  → estado de gravação, frames/audio e timestamps

list-audio-devices
list-monitors

pipes
  → list/create/run/logs de automações Screenpipe quando explicitamente autorizadas
```

## Regra de leitura primeiro

A sequência normal é:

```text
NEED_FACT
→ health-check / API health
→ localizar janela/app/período
→ activity-summary OU keyword-search
→ search-content / search-elements
→ frame-context quando necessário
→ cruzar com runtime/log/Git/arquivo aplicável
→ CLASSIFY FACT|INFERENCE|HYPOTHESIS|UNKNOWN
```

Não fazer OCR amplo se accessibility/element search resolver com menos ruído.

```text
ACCESSIBILITY_FIRST_WHEN_SUFFICIENT=true
OCR_IS_FALLBACK_OR_CROSSCHECK=true
MINIMUM_SUFFICIENT_CONTEXT=true
```

## Tempo real e logs

Screenpipe registra contexto temporal, não "verdade eterna".

```text
FRAME_TIMESTAMP_REQUIRED_FOR_LIVE_CLAIM=true
OLD_FRAME != CURRENT_STATE
SCREENSHOT != LIVE_STATE
HISTORY != CURRENT_STATE
```

Para acompanhar agentes/processos em tela:

```text
OBSERVE_WINDOW
→ capture latest matching evidence
→ normalize timestamp + app + window + frame_id
→ compare last_seen_fingerprint
→ DELTA?
   ├─ NO  → DROP_DUPLICATE
   └─ YES → emit normalized evidence + continue
```

Se a tela mostra logs/copied text, preservar o texto como `SCREEN_OBSERVATION`; quando possível cruzar com o log/processo/arquivo original antes de tratá-lo como causalidade técnica.

## Input, clipboard e texto copiado

`search-content(content_type=input)` pode recuperar eventos de entrada quando a captura correspondente estiver habilitada. Isso inclui contexto útil como cliques, teclas, clipboard e troca de app conforme a versão/configuração observada.

```text
INPUT_EVENT = OBSERVATION
INPUT_EVENT != SUCCESS_PROOF
COPIED_TEXT = TRANSPORTED_TEXT_OBSERVATION
COPIED_TEXT != SOURCE_AUTHORITY
```

Texto copiado da tela pode alimentar handoff/contexto, mas claim técnico material continua sujeito ao `REALITY_JUDGE`.

## Automação e referências frescas

Para localizar controles da UI, preferir `search-elements` / `get-frame-elements` com `purpose=automation` quando suportado.

Essas respostas podem trazer refs locais à resposta, keys estáveis best-effort, estado, bounds e ações permitidas.

Regra dura:

```text
HISTORICAL_DATABASE_ID != LIVE_CONTROL_HANDLE
AUTOMATION_REF_MUST_BE_REFRESHED_BEFORE_ACTION=true
BOUNDS_MUST_BE_CURRENT=true
```

Screenpipe pode fornecer **contexto de targeting**; a ação física usa a ferramenta de computer/browser/UI disponível no runtime. Não inventar capacidade de clique se a superfície atual só oferece observação.

```text
SCREENPIPE_TARGET_CONTEXT + COMPUTER_CONTROL_TOOL → UI_ACTION_CANDIDATE
SCREENPIPE_WITHOUT_CONTROL_TOOL → OBSERVATION_ONLY
```

## Dependências de automação e token do router

Uma automação Screenpipe pode consumir capacidades extras da CentralDark, mas isso não torna toda variável opcional do router uma pré-condição global do sensor.

```text
SCREENPIPE_LOCAL_OBSERVATION
!= CENTRALDARK_ROUTER_AUTH

CENTRALDARK_ROUTER_TOKEN_MISSING
!= SCREENPIPE_DOWN
!= SCREENPIPE_DATA_INVALID
!= GLOBAL_AUTOMATION_FAILURE
```

`CENTRALDARK_ROUTER_TOKEN` só é obrigatório para uma etapa quando o runtime/endpoint selecionado provar que exige autenticação por esse token. O repositório aceita configuração em que o token do router está vazio/opcional; portanto um validador não pode rejeitar uma timeline local apenas porque a variável não existe, salvo quando aquela timeline realmente chama uma rota autenticada que exige o token.

Classificação fail-closed:

```text
TOKEN_REQUIRED_BY_SELECTED_ROUTE=true
+ TOKEN_ABSENT
→ SELECTED_ROUTE_AUTH_BLOCKED

TOKEN_REQUIRED_BY_SELECTED_ROUTE=false
+ SCREENPIPE_LOCAL_API_HEALTHY
→ CONTINUE_LOCAL_OBSERVATION

TOKEN_REQUIREMENT_UNKNOWN
→ UNKNOWN
```

Quando uma UI/pipeline disser apenas `Missing environment variable: CENTRALDARK_ROUTER_TOKEN`, registrar como `AUTOMATION_DEPENDENCY_BLOCKED` para aquela execução; não promover para causa raiz do Screenpipe nem do sistema inteiro sem prova do consumidor que exigiu a variável.

## API direta e compressão

Quando MCP não estiver disponível, a API local pode ser usada como fallback autorizado após medir `http://localhost:3030/health`.

Os endpoints de lista observados na documentação suportam formatos compactos como CSV/TSV e seleção de campos; elementos podem usar `outline` ou `automation` quando suportado.

```text
PREFER_COMPACT_FORMAT=true
FIELDS_ONLY_WHEN_KNOWN=true
TOKEN_WASTE=FORBIDDEN_WHEN_COMPACT_EQUIVALENT_EXISTS
```

## Privacidade e storage

Pelo contrato oficial, o MCP atua como ponte local para o daemon Screenpipe. O armazenamento de gravações/OCR/áudio/eventos fica no dispositivo sob o diretório Screenpipe configurado (tipicamente `~/.screenpipe/`).

```text
RAW_SCREEN_HISTORY_IS_SENSITIVE=true
DO_NOT_COMMIT_RAW_CAPTURE=true
DO_NOT_PUBLISH_SCREENPIPE_DB=true
DO_NOT_EXPOSE_LOCAL_API_KEY=true
DO_NOT_PUT_SECRETS_IN_HANDOFF=true
```

Telemetria de crash do MCP e recursos cloud opcionais são fronteiras separadas do fluxo local e não devem ser presumidos ligados/desligados sem medir configuração.

## Handoff: onde entra

Screenpipe **não cria um novo protocolo de handoff da CentralDark**.

Ele produz evidência para o owner já existente:

`docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`

Fluxo:

```text
SCREENPIPE_OBSERVATION
→ NORMALIZE
→ EVIDENCE_REF
→ CENTRALDARK_HANDOFF
→ POMBO_CHECKSUM
→ NEXT_CURSOR
```

Payload adicional quando Screenpipe for material:

```text
SCREENPIPE_EVIDENCE:
  observed_at: <UTC>
  app_name: <app|UNKNOWN>
  window_name: <window|UNKNOWN>
  frame_id: <id|UNKNOWN>
  content_type: <ocr|audio|input|accessibility|parsed|mixed>
  query_scope: <time/app/window/filter>
  evidence_fingerprint: <sha256-normalized-result>
  source: SCREENPIPE_LOCAL
  live_claim: true|false
```

Esse bloco complementa, não substitui:

```text
CHEFE_INTENT
DESTINATION_LOCK
SOURCE_SURFACE
TARGET_SURFACE
OBSERVED_AT
HEAD_SHA / CONTENT_SHA256
OWNER
WRITER_SCOPE
STATE
EVIDENCE_REFS
UNKNOWNS
RESIDUAL
NEXT_CURSOR
```

## Handoff entre quaisquer superfícies autorizadas

Quando dois ou mais atores/superfícies CentralDark autorizados estiverem observáveis e Screenpipe estiver saudável:

```text
SOURCE_ACTOR_NEEDS_TARGET_STATE
→ SCREENPIPE locate target surface
→ extract latest material delta
→ normalize evidence
→ if proven direct handoff channel exists: send HANDOFF payload
→ else shared state / Git / memory / queue / explicit surface channel
→ prove transport channel

TARGET_NEEDS_SOURCE_STATE
→ mesma regra no sentido reverso
```

SOL↔HERMES é apenas um caso particular dessa regra global.

Convergência visual não prova que um agente enviou algo ao outro.

```text
CROSS_SURFACE_TRANSPORT_REQUIRES_PROVEN_CHANNEL=true
SCREENPIPE_OBSERVED_BOTH != HANDOFF_PROVEN
```

## Loop operacional

```text
INTENT
→ NEED_LIVE_CONTEXT?
→ DISCOVER SCREENPIPE
→ MEASURE HEALTH
→ QUERY MINIMUM SUFFICIENT WINDOW
→ NORMALIZE
→ DEDUPE
→ DELTA MATERIAL?
   ├─ NO  → NEXT
   └─ YES → route to requesting actor
              → action if authorized
              → retest
              → counterproof
              → receipt
              → handoff when changing surface
              → NEXT_CURSOR
```

Sem delta novo, não ficar relendo a mesma tela infinitamente.

## Fixed point desta capacidade

```text
SCREENPIPE_HEALTH=PASS
AND REQUESTED_TIME_SCOPE_COVERED=true
AND REQUIRED_SCREEN_FACTS_CLASSIFIED=true
AND DUPLICATE_OBSERVATIONS_COLLAPSED=true
AND MATERIAL_UNKNOWN_FROM_SCREENPIPE=0
→ SCREENPIPE_OBSERVATION_FIXED_POINT
```

Isso prova somente observação Screenpipe para o escopo solicitado, não fixed point da missão inteira.

## Critério de runtime

```text
CONFIGURED != RUNNING
RUNNING != CAPTURING
CAPTURING != QUERYABLE
QUERYABLE != CURRENT_FOR_TARGET
```

Antes de declarar disponibilidade:

```text
HEALTH_OK
+ RECENT_DATA_PRESENT
+ TARGET_QUERY_RETURNS_USABLE_EVIDENCE
→ SCREENPIPE_AVAILABLE_FOR_TARGET=true
```

## Integração com MEGAZORD

Capabilities publicadas:

```text
LIVE_DESKTOP_OBSERVATION
SCREEN_HISTORY_SEARCH
OCR_CONTEXT
ACCESSIBILITY_CONTEXT
AUDIO_TRANSCRIPT_CONTEXT
INPUT_EVENT_CONTEXT
CLIPBOARD_CONTEXT
FRAME_CONTEXT
WINDOW_APP_TIMELINE
SCREENPIPE_ACTIVITY_SUMMARY
SCREENPIPE_MEETING_CONTEXT
SCREENPIPE_AUTOMATION_TARGETING_CONTEXT
SCREENPIPE_VIDEO_EXPORT
```

Qualquer ator autorizado pode requisitar uma dessas capacidades. O router seleciona Screenpipe somente quando medido disponível e necessário ao menor conjunto suficiente.
