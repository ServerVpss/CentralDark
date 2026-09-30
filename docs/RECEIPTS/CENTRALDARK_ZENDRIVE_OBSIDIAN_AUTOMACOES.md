---
title: "👑🪬 CENTRALDARK — ZENDRIVE / OBSIDIAN / AUTOMAÇÕES"
status: "ATIVO_RECONCILIADO"
date: 2026-09-10
owner: "docs/RECEIPTS/CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES.md"
truth_scope: "CASA_LOCAL_AND_INTEGRATION_RECEIPT"
canonical: true
aliases:
  - "CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES_2026-09-10"
tags:
  - centraldark
  - receipts
  - zendrive
  - obsidian
  - screenpipe
  - automacoes
  - casa
  - github
  - google-drive
  - grafo-vivo
related:
  - "[[CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION]]"
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
  - "[[BANDA_INTENCAO_UNICA_COMPASSO]]"
  - "[[META-START-LINK]]"
links:
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
  - "apps/modulos/elite-gateway/test-local/local_send_dump.py"
  - "apps/modulos/elite-gateway/test-local/zendrive_gateway_bridge.py"
---

# 👑🪬 CENTRALDARK — ZENDRIVE / OBSIDIAN / AUTOMAÇÕES

## 🧠 Ideia do Chefe

A Casa deve seguir a cabeça do Chefe:

- 🏛️ GitHub é a fonte oficial do código e dos recibos.
- ☁️ Google Drive é espelho humano e arquivo sincronizado.
- 🧠 Obsidian/Screenpipe guarda memória viva para consulta e planejamento.
- 🚗 Zendrive é a ponte local que usa Chrome autenticado para enviar/capturar mensagens.
- 🔁 Automação ajuda a saber o que fazer, o que já foi feito e o que ainda falta, sem criar governo paralelo.

## 🏠 Zendrive local — prova atual

Resultado enviado pelo Chefe mostra avanço real na Casa:

- 📍 Ambiente local: `E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local`.
- 👤 Perfil local usado: `segredo` apontando para `Profile 15`.
- ✅ Dependências Python chegaram a `IMPORTS_OK`.
- 🚪 A porta `9222` primeiro recusou conexão.
- 🌐 Depois de abrir Chrome com `--remote-debugging-port=9222`, o script registrou `ATTACH mode to existing session on port 9222`.
- 📤 O script registrou `Prompt sent via CDP to existing authenticated session`.
- 🔌 A porta `9222` respondeu `/json/version` com Chrome e `webSocketDebuggerUrl`.

### ⚖️ Leitura simples

- 🌐 Chrome local com CDP 9222 = janela preparada.
- 🚗 Zendrive = conjunto que usa essa janela, perfil, porta, script e captura.
- ✅ Zendrive conseguiu falar com a aba autenticada.
- 🟡 Próxima prova: confirmar nascimento de `logs/last_messages.json` com conteúdo do probe.

## 👁️ Obsidian / Screenpipe

- 🧠 Obsidian está conectado como memória pesquisável.
- 👁️ Screenpipe observa tela quando autorizado pelo Chefe.
- 🔗 Memórias podem alimentar busca, grafo e planejamento.
- ⚖️ Isso não substitui GitHub como fonte oficial.

## 🔁 Automação com Obsidian

Fluxo certo:

1. 👁️ Screenpipe observa e registra memória.
2. 🧠 Obsidian recebe a nota/memória para busca e grafo.
3. 🔁 Automação usa isso para montar resumo e próximo passo.
4. 🏛️ GitHub recebe recibo quando houver decisão oficial.
5. ☁️ Drive recebe espelho quando o destino estiver claro.

## 📚 Fontes / Drive / GitHub

Estado já registrado:

- 📚 Inventário total de Fontes: 9.908 arquivos.
- 📄 Páginas processadas: 50.
- ✅ `more_pages=false`.
- 💾 Total catalogado: 17.393.174.903 bytes.
- 🧹 Duplicatas byte-a-byte removidas: 25.
- 📦 Espaço removido do índice ativo: 303.757.201 bytes.
- ❓ Liberação física de quota: UNKNOWN até recibo da plataforma.

## ⚖️ Veredito

- ✅ CASA_ZENDRIVE=AVANÇOU
- ✅ ZENDRIVE_FALOU_COM_ABA=PROVADO_PELO_LOG_DO_CHEFE
- 🟡 LAST_MESSAGES_JSON=PROVA_FINAL_PENDENTE
- 🧠 OBSIDIAN_SCREENPIPE=BOA_CAMADA_DE_MEMÓRIA
- 🏛️ GITHUB_COMO_FONTE_OFICIAL=SIM
- ☁️ DRIVE_COMO_ESPELHO=SIM
- 🔁 AUTOMAÇÃO_COM_OBSIDIAN=BOA_SE_FOR_MEMÓRIA_E_PLANEJAMENTO
- ❓ UNKNOWN_NAO_E_PASS=ATIVO

## 🧭 Próximo passo

1. Confirmar `logs/last_messages.json` na Casa.
2. Se existir, registrar o conteúdo mínimo do probe.
3. Manter Drive sincronizado como espelho.
4. Manter Obsidian como memória pesquisável, não como juiz.


## 🔎 Reconciliação histórica — aprovação declarada != Zendrive live promovido

Observação reconciliada em 2026-09-30 a partir do histórico GitHub e do runtime VPS atual.

### Histórico relevante

~~~text
d200ba0f00cc619f96a3f28b215b19b478109236
→ mensagem de commit declarou "approved and released for use"
→ a própria mensagem registra execução repetida de zendrive_mock_agent.py
→ MOCK/SIMULAÇÃO != RUNTIME_ZENDRIVE_LIVE
~~~

A declaração acima é preservada como proveniência histórica, mas **não é aprovação técnica do Zendrive live**.

O PR #1566 (🧿 FIX(ZENDRIVE): FAIL CLOSED LOCAL CAPTURE HANDOFF) foi posteriormente mergeado e registrou explicitamente:

~~~text
SOURCE_IMPLEMENTED=PASS
RUNTIME_ZENDRIVE_LIVE=NOT_PASS
~~~

No review do #1566 houve apontamentos P1/P2 sobre correlação do turno enviado com a resposta capturada, lançamento CDP/Chrome, contaminação de receipt pelo self-test e captura parcial de respostas longas. O merge do source não converte esses pontos em prova de runtime.

### Estado vivo observado no Omni Router

~~~text
provider=zendrive-chatgpt-local
configured=true
state=SIMULATION_READY
live_enabled=false
simulation_enabled=true
worker_url_present=false
authority=false
proof=false
requires_hermes_counterproof=true
~~~

### Classificação canônica

~~~text
ZENDRIVE_SOURCE_AND_ROUTE=PASS
ZENDRIVE_SIMULATION=PASS
ZENDRIVE_LIVE_WORKER=NOT_PROMOTED
ZENDRIVE_LIVE_E2E=UNKNOWN_NOT_PASS
HISTORICAL_APPROVED_WORDING=PROVENANCE_ONLY
MERGED_SOURCE != LIVE_RUNTIME_PROOF
~~~

### Invalidação / promoção

O estado ZENDRIVE_LIVE_E2E só pode mudar quando houver nova prova material do mesmo alvo: worker live habilitado, URL/transport vivo, sessão local autenticada efetivamente usada, turno enviado correlacionado à resposta correspondente e receipt fim a fim sem mock.

~~~text
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
REALIDADE = JUDGE
~~~
