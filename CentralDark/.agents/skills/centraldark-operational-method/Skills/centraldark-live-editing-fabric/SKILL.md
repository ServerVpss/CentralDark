---
name: centraldark-live-editing-fabric
description: Modo padrão da CentralDark para edição viva determinística. Use quando o CHEFE quiser editar/refinar e ver no runtime rápido, sem transformar CI profundo em freio de MVP.
metadata:
  type: operational
  version: "1.3"
  owner: SEGREDO/CHEFE
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# CENTRALDARK LIVE EDITING FABRIC

## Quando usar

Use por padrão quando a intenção for construir, ajustar, refinar, publicar no site/runtime, ver vivo e repetir.

Não trate como emergência. `main-pinned-runtime-fast-path` é o mecanismo de execução runtime do modo vivo quando houver delta rastreável para promover; deploy canônico profundo fica como guarda/esteira maior ou prensa quando o CHEFE mandar.

## Fluxo

```text
CHEFE_EDITA
→ INTENT_DELTA
→ LOCK
→ ASSERT_SCRATCH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ DELTA
→ TESTE_MINIMO
→ MICRODEPLOY_OWNER
→ PROVA_RUNTIME
→ RECEIPT
→ CLEAN_SCRATCH
→ NEXT_TIK_TAK
```

## Prensa profunda

```text
MVP_FAST_LOOP = default
CI_DEEP_LOOP = somente quando CHEFE mandar torcer a uva / ponto fixo profundo
DEPLOY_CANONICO = guarda, não freio padrão do MVP
```

## Seleção de gatilhos

```text
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
PERTINENCE_FIRST=true
MINIMUM_SUFFICIENT_LOOP=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true

runtime/site/painel/feature → LIVE_EDITING_FABRIC + MAIN_PINNED_FAST_PATH
hub/provider/secret/oauth → HUB_CREDENTIAL_CONTROL_PLANE
doc/canon → EDIT_OWNER_EXISTING + RECEIPT
pass material → MICRO_DEPLOY_DO_ESCOPO_AFETADO + HEALTH/PROVA + RECEIPT
```

## 🔙 Avanço + backcheck adaptativo

Este é o modo de edição da Casa: avançar sem perder a trilha anterior.

```text
PROGRESSO != ESQUECIMENTO
FORWARD_WINDOW_DEFAULT=20
BACKCHECK_WINDOW_DEFAULT=5
REWIND_ON_LOCAL_ERROR_DEFAULT=1
WINDOWS_ARE_ADAPTIVE=true
```

```text
⚙️ EDITA
→ ⏩ AVANÇA N
→ 🔙 AUDITA K anteriores
   ├─ sem delta material → continua
   └─ erro/drift → ↩️ menor ponto causal
                 → 🪡 COSTURA
                 → 🧪 RETESTA
                 → 🔙 BACKCHECK
                 → ⏩ REENTRA NO MESMO TRILHO
```

`N` e `K` são adaptativos. O padrão 20/5 é referência operacional, não lei fixa.

```text
BACKCHECK_IS_AUDIT_NOT_REWORK=true
LOCAL_REPAIR_BEFORE_FULL_ROLLBACK=true
REJOIN_SAME_TRAIL=true
NO_SILENT_REROUTE=true
```

Quando delegação/healing existir, reutilizar `scripts/agent-call.md` com revisão ida/volta e checkpoints antes/depois; não criar protocolo paralelo.

## 🪝 Gatilhos visuais

Use símbolos como âncoras semânticas consistentes para recuperação rápida de contexto:

```text
👑 CHEFE/autoridade
🎯 intenção
🖥️ sistema
🧠 cognição/agente
⚙️ execução
⏩ avanço
🔙 backcheck
🪡 costura
🧪 teste/contraprova
🪬 Reality Judge
🧾 receipt
🗝️ cristal/NEXT_CURSOR
```

```text
TITLE_HAS_SEMANTIC_TRIGGER=true
TRIGGER_MUST_MATCH_CONCEPT=true
VISUAL_TRIGGER != AUTHORITY
VISUAL_TRIGGER != PROOF
CALLBACK_RECONNECTS_PRIOR_CONTEXT=true
CALLBACK_DOES_NOT_REPEAT_WHOLE_HISTORY=true
```

## Segredos temporários

Trate segredo temporário como trânsito:

```text
USE
→ APPLY_TO_OWNER
→ DO_NOT_ECHO
→ DO_NOT_COMMIT
→ DO_NOT_WRITE_VALUE_TO_RECEIPT
→ SCRUB_CONTROLLED_LOGS
→ DISCARD_OR_ROTATE
```

Se precisar registrar, registre apenas nome lógico, owner, destino e resultado. Nunca o valor.

## Cadeados

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
NO_SECRET_ECHO
NO_SECRET_COMMIT
NO_SECRET_RECEIPT_VALUE
RUNTIME_EFFECT_REQUIRED
REPLAY_BEFORE_REDISCOVERY
RUNTIME_IS_NOT_SCRATCH
CASA_IS_NOT_SCRATCH
```

## Dono

- humano: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md`
- máquina: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- binding: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- fast path: `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`
- hub/credenciais: `.agents/skills/centraldark-hub-credential-control-plane/SKILL.md`
- bot: `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`
- trigger fabric: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`
## 🍒 Cockpit-in-the-Loop — Cline/VSCODE + navegador da Casa (21/10/2026)

**Decisão do CHEFE:** quando uma missão altera ou valida UI, painel, botões ou integração projetada no Cockpit, o Writer atual (inclusive Cline no VS Code) deve operar a **mesma superfície visível** e conferir o efeito real, não encerrar apenas com arquivo escrito, HTML carregado, curl 200 ou build concluído. É uma extensão do Live Editing Fabric, **não** um novo agente, um segundo cockpit ou uma dependência do Desktop Commander externo.

Ponto de partida local **quando confirmado na Casa**: `http://127.0.0.1:8080/sala-controle` (TanStack Start, sessão autenticada). **LOCALHOST_IS_ORIGIN_SCOPED:** `127.0.0.1` na VPS não é a Casa; medir host/URL/porta e autenticação antes de inferir equivalência. Usar a aba já aberta no navegador ou preview do VS Code. O endereço é um binding medido, não uma porta universal fixa.

### GOAL → browser → ação → realidade

```text
INTENT_DELTA + OWNER + WRITER + MAIN_SHA
→ MAPEAR_CONTROLES_DO_CONE_AFETADO (rotas, abas, botões, labels e estado atual)
→ BROWSER_READ_T0 (URL, host, horário, auth, DOM acessível, sensor, screenshot se permitido)
→ EDITAR_SOMENTE_OWNER_AUTORIZADO
→ TESTE_DE_CODIGO + BUILD_APLICAVEL
→ ABRIR/ATUALIZAR_COCKPIT_NO_BROWSER_DA_CASA
→ OPERAR_CONTROLE_RELACIONADO_AO_DELTA_SEGURO_E_AUTORIZADO
→ BROWSER_READ_T1 (efeito visual + estado funcional, log/API quando aplicável)
→ BACKCHECK_CONTROLES_ADJACENTES_ESSENCIAIS
→ CONTRAPROVA_NEGATIVA + RECEIPT + NEXT_CURSOR
```

**No Cline:** habilitar a capacidade de navegador ou o teste UI já instalado (Playwright, preview ou ferramenta semântica autorizada). Descobrir os controles por `role`, nome acessível, `aria-label` ou texto visível; confirmar qual página está ativa e qual botão pertence à missão. Se o executor só consegue `fetch`, `curl` ou ler DOM, marcar `UI_READ_ONLY`: isso **não** prova clique, seleção, autenticação ou efeito. Não pedir repetidamente ao CHEFE a URL já identificada; recuperar contexto e bindings existentes.

**Escopo proporcional:** não percorrer nem clicar todos os botões em toda missão. Testar o botão/aba/card alvo e as adjacências causais; testar módulo não relacionado apenas se aparecer regressão real. `Medir agora` e navegação podem ser probes; `Executar Automação`, `Sincronizar Tudo`, `Sair`, `deploy`, alterações de permissões e operações destrutivas **não** devem ser disparadas como teste genérico: exigem intenção, auth e gate específicos. Nunca relaxar autenticação/RLS para fabricar um PASS.

**Árvore de prova independente** (sem falso verde):
- `UI_PRESENT`: DOM renderizado e elemento presente, não prova ação.
- `CLICK_ACK`: clique/ação semântica executada com retorno observável.
- `EFFECT_PROVED`: estado esperado do escopo mudou ou permaneceu correto, confirmado por T0/T1 e fonte independente quando pertinente.
- `DEPLOYED`: somente após SHA do runtime, readiness e receipt; não inferir de CI.
- `UNKNOWN`: navegador só leitura, auth ausente, sensor obsoleto, ação não executada ou retorno incerto; bloquear só a alegação dependente.
- `FAIL`: causa reproduzida e alvo comprovadamente falhou, não mera ausência de observador.

Cada receipt deve apontar `OWNER`, `SOURCE_SHA`, `TARGET_ORIGIN`, `PAGE_ROUTE`, `CONTROL_ROLE+NAME`, `ACTION`, `T0/T1`, `EXPECTED/OBSERVED`, `RUNTIME_SOURCE`, `CONTRAPROOF`, `RESULT` e `NEXT_CURSOR` com evidências sanitizadas. Um status verde anterior não torna o novo verde automaticamente; discrepância entre cartão e saída do sensor pede investigação de classificação/freshness, não pintura da interface.

**Caneta e delegação:** Cline continua Writer da Casa enquanto possuir aquele escopo. JARVIS/SOL consulta o cockpit em leitura, aponta o delta e entrega o mesmo GOAL ao executor disponível; nunca simular envio direto ao Cline ou clique no navegador. Exigir ACK/receipt para declarar delegação ou execução. Manter `SCREENPIPE` como sensor, `MCP_CENTRALDARK` como control plane e `TAILSCALE` como transporte privado. `DESKTOP_COMMANDER_TERCEIRO_REQUIRED=false`; não reativar o serviço externo para operar o cockpit.

**Critério de conclusão:** código/build verde **e**, quando houver mudança de UI/controle, prova funcional no navegador do escopo alterado + contraprova + receipt. Se o navegador for inacessível, registrar `UI_E2E_PENDING` e continuar somente as partes independentes.
## 🔴 Red Loop — Tool Calling do Cline, independente do modelo (2026-10-22)

**CHEFE autorizou um PR cumulativo** chamado **🧠 PR DOS RED 🔴**. Ao receber novo RED, recuperar o PR atual e o receipt `docs/CONSCIENCIA/RECEIPTS/2026-10-22-pr-dos-red-cline-tool-routing.md`; deduplicar por fingerprint, observar se é uma causa nova ou só recorrência, anexar prova e evolução com commit no mesmo PR; não criar PR por print. Nunca fechar o GOAL de 50 micro-passos porque houve uma falha de ferramenta.

**Duas falhas distintas foram observadas no Cline**: (001) `ask_ou_bot`/`read_arch` inexistentes; (002) `read_files`/`run_commands` aparecem no `Available tools` da mensagem, mas também são rejeitados `AI_NoSuchToolError` **antes da execução**. A segunda é possível `TOOL_REGISTRY_PARITY_BLOCKED`, não apenas erro de digitação. A lista apresentada pelo erro e a lista de ferramentas efetivamente despacháveis podem divergir. Nunca inferir que duas ferramentas com nomes parecidos são aliases.

### Resolver concreto do mesmo harness

1. **CAPTURE:** salvar só metadados sanitizados de `error`, `requested_tool`, `advertised_tools`, `model/session quando observados`, `executor/host`, `timestamp` e `fingerprint`.
2. **RESOLVE:** inspecionar inventário de ferramentas **da sessão ativa do Cline**; separar tool nativa do Cline, MCP, Composio e CLI. Nome, namespace, caixa e schema devem bater literalmente. Não traduzir `read_files` para `read_file`, `comando_shel` ou `run_commands` para `comando_shell`. Não executar aliases inventados.
3. **GUARD:** reutilizar `scripts/ci/centraldark-toolcall-red-guard.mjs` (guarda pura). `NOT_ADVERTISED` rejeita nome desconhecido. `ADVERTISED_BUT_REJECTED`/ `TOOL_REGISTRY_PARITY_BLOCKED` pede inspeção real do dispatcher, sem um festival de tentativas; `UNKNOWN_RESOLVER` não concede execução; `RETRY_LOOP_BLOCKED` impede a mesma falha consecutiva. A guarda não é um hook instalado no Cline enquanto não houver integração e teste autorizados no owner do cliente.
4. **ACTION:** se a rota estiver autenticada e o schema correto, executar **um probe não destrutivo** do recurso pertinente e coletar exit/ACK/readback. Quando a lista e o resolver discordarem, não insistir com tool names sugeridos pelo modelo: examinar adaptação/configuração/estado da conexão; recuperar sessão canônica do Cline sem apagar contexto ou trabalho.
5. **RECOVERY:** salvar RED no mesmo PR com tentativa, causa demonstrada, menor delta, teste negativo/positivo, owner, versão e `NEXT_CURSOR`. **Falha antes da ferramenta** não prova falha do MCP, Casa, SSH, VPS nem do arquivo-alvo.
6. **MICHELIN:** `CONSTRUIR + INTEGRAR + PROVAR` com três provas separadas. `SOURCE_GUARD_TEST_PASS != CLINE_ADAPTER_HOOK_INSTALLED != CLINE_TOOL_CALL_E2E_PASS`. Quando a falha for apenas documentada, manter `FIX_CANDIDATE`/ `UNKNOWN`, nunca declarar consertado.

**Regra de compatibilidade universal:** o modelo (GPT, Claude, Gemini, outro) propõe intenção; o catálogo atual **e** o resolver real da superfície decidem a ferramenta. O roteador bloqueia names/schemas não resolvidos sem pedir ao CHEFE para escolher uma ferramenta. O Cline continua Writer único da Casa; Hermes coordena pelo Kanban existente, não reescreve a sessão do Cline.

**Gatilho real do RED para qualquer modelo:** ao observar `AI_NoSuchToolError` ou outra falha demonstrada, o executor que possui ferramentas FUNCIONANDO constrói apenas um JSON allowlisted (`surface`, `category`, `error_code`, `tool_name`, `host`, `model`, `source_sha`) e o envia **por STDIN** para `node scripts/ci/centraldark-red-dispatch.mjs` usando a mesma rota autorizada. O script normaliza/faz fingerprint e pede `repository_dispatch=centraldark_red_v1` à API Github com token de secret store do executor. O workflow em `.github/workflows/centraldark-pr-dos-red.yml` (após merge seguro na main) grava no MESMO PR #1903 e no `notifications_log` via credencial server-side. Se a ferramenta de origem estiver quebrada, **não fingir envio**: registrar `SOURCE_DISPATCH_BLOCKED`, preservar checkpoint e deixar outro executor autorizado publicar. `DISPATCH_ACCEPTED != PR_COMMENT_ACK != SUPABASE_DELIVERED != CLINE_ROUTER_FIXED`. Não gravar corpo de conversa, raw log, env nem token no Github. Se erro ocorrer antes do hook, nenhum hook pós-ferramenta é evidência de captura; observar o erro no boundary apropriado.

**NEXT_CURSOR inicial:** `PR_DOS_RED_TEST → CLINE_SESSION_REAL_TOOL_SCHEMA → SAFE_TOOL_ACK → MICHELIN_STEP_01_REPLAY → CHECKPOINT_50`.
