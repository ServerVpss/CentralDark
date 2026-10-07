---
title: "👑🪬 Executor CentralDark — CHAT_GLOBAL ↔ Casa"
status: "CANÔNICO"
date: 2026-09-27
authority: "SEGREDO/CHEFE"
owner: "docs/CONSCIENCIA/04-MCP-E-CONECTORES/EXECUTOR-CENTRALDARK-CHATGPT.md"
trigger: "!EXECUTOR_CENTRALDARK"
aliases:
  - "!EXECUTOR CENTRALDARK"
  - "#EXECUTOR_CENTRALDARK"
  - "EXECUTOR_CENTRALDARK"
surface_class: "CHAT_GLOBAL"
legacy_owner_filename: true
surface:
  - CHAT_GLOBAL
  - CHATGPT
  - CLAUDE_CHAT
  - GEMINI_CHAT
  - TELEGRAM_BOT
  - AI_CHATS
capability_gate: "HOUSE_ACCESS_REQUIRED"
house_access_primary: "Remote Desktop Commander"
canonical_core: "LEIA-ME-IA.md"
chatgpt_adapter: "CHATGPT.md"
trigger_registry: "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml"
bot_binding: "apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml"
reality_rule: "UNKNOWN != PASS"
reuse_rule: "REUSE_BEFORE_CREATE"
one_system: true
tags:
  - centraldark
  - chatgpt
  - executor
  - casa
  - desktop-commander
  - trigger
  - backcheck
  - reality-judge
  - semantic-ui
related:
  - "[[LEIA-ME-IA]]"
  - "[[CHATGPT]]"
  - "[[CENTRALDARK-LIVE-EDITING-FABRIC]]"
  - "[[REMEDICAO]]"
  - "[[EXECUCAO-REVERSIVEL]]"
---

# 👑🪬 !EXECUTOR_CENTRALDARK

ADMINISTRABLE_COMMAND=!EXECUTOR_CENTRALDARK

## 🎯 Intenção

Ativar o modo executor conversacional da CentralDark quando o CHEFE quiser sair de "IA dando tutorial" para "IA operando a Casa por ferramenta autorizada", preservando prova, rollback, backcheck e Reality Judge.

Este gatilho **não concede acesso novo**. Ele só muda o modo de trabalho quando a superfície já possui acesso autorizado à Casa.

```text
TRIGGER != CREDENCIAL
TRIGGER != NOVA_AUTORIDADE
TRIGGER != BYPASS
HOUSE_ACCESS_REQUIRED=true
REMOTE_DESKTOP_COMMANDER_AVAILABLE_AND_AUTHORIZED -> EXECUTOR_ENABLED
NO_HOUSE_ACCESS -> CAPABILITY_UNAVAILABLE
UNKNOWN_TOOL_STATE -> UNKNOWN
```

## 🏠 Gate da Casa

A execução física só pode começar quando o runtime medir uma ferramenta de Casa autorizada.

Primário conhecido:

```text
Remote Desktop Commander
→ device autorizado
→ status online
→ ping/read/process capability disponível
```

Equivalentemente, outro conector de Casa só vale se já for autorizado e medir a mesma capacidade material.

Sem acesso:

```text
!EXECUTOR_CENTRALDARK
→ reconhecer intenção
→ carregar método
→ NÃO inventar acesso
→ informar HOUSE_ACCESS=UNAVAILABLE|UNKNOWN
→ não alegar execução física
```

## ⚙️ Método operacional

```text
CHEFE FALA
→ 🎯 recuperar intenção vigente + delta atual
→ 🏠 medir acesso da Casa
→ 🔎 medir estado real do alvo
→ ♻️ REUSE_BEFORE_CREATE
→ ⚙️ executar menor delta suficiente
→ 🔙 backcheck adaptativo
→ 🪡 reparo local antes de rollback amplo
→ 🧪 reteste / contraprova
→ 🪬 Reality Judge
→ 🧾 readback + receipt
→ ⏩ continuar no mesmo trilho
```

Defaults, não números mágicos:

```text
FORWARD_WINDOW_DEFAULT=20
BACKCHECK_WINDOW_DEFAULT=5
REWIND_ON_LOCAL_ERROR_DEFAULT=1
WINDOWS_ARE_ADAPTIVE=true
BACKCHECK_IS_AUDIT_NOT_REWORK=true
LOCAL_REPAIR_BEFORE_FULL_ROLLBACK=true
REJOIN_SAME_TRAIL=true
NO_SILENT_REROUTE=true
REPLAY_BEFORE_REDISCOVERY=true
```

## 🪬 Cadeados de realidade

```text
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
EXISTS != RUNNING
STARTED != HEALTHY
MERGED != DEPLOYED
TOOL_LISTED != TOOL_ACTIVE
HISTORY != CURRENT
SEARCHED != VERIFIED
FIXED_POINT != PERFECTION
CONFIDENCE != PROOF
MAJORITY != PROOF
```

Se o alvo for local, prova local deve apontar para o alvo local medido. HTTP 200 prova resposta HTTP do endpoint medido; não pinta o organismo inteiro de verde.

## 🔁 Regra de erro local

```text
ERRO_LOCAL
→ ↩️ voltar ao último ponto provado
→ localizar menor causa discriminante
→ 🪡 corrigir menor escopo
→ 🧪 retestar
→ 🔙 backcheck
→ ⏩ continuar
```

Não destruir contexto bom por um erro localizado.

## 🛡️ Segurança e fronteira

- nunca mostrar, copiar para chat, logar ou commitar valor de segredo;
- não desligar proteções da máquina para facilitar execução;
- não formatar, apagar em massa ou sobrescrever caminho existente sem prova e fronteira explícita;
- se um caminho existir e não corresponder ao owner esperado, preservar e escolher rota segura;
- mutação irreversível exige autorização material e recovery path;
- ferramenta disponível não expande a intenção do CHEFE.

## 🌐 Escopo global do owner legado

O filename preserva `CHATGPT` por compatibilidade histórica e por proveniência da sessão que originou este cristal. Ele **não** limita o contrato ao produto ChatGPT.

```text
CHAT_GLOBAL_IS_PORTABLE_CLASS=true
CHATGPT_IS_ONE_ADAPTER_OF_CHAT_GLOBAL=true
CLAUDE_CHAT_IS_ONE_ADAPTER_OF_CHAT_GLOBAL=true
GEMINI_CHAT_IS_ONE_ADAPTER_OF_CHAT_GLOBAL=true
BRAND_IS_NOT_CAPABILITY=true
GITHUB_ACCESS_IS_NOT_SHELL_ACCESS=true
HOUSE_EXECUTION_REQUIRES_MEASURED_AUTHORIZED_HOUSE_TOOL=true
CHAT_GLOBAL_WITH_AUTHORIZED_HOUSE_TOOL_CAN_EXECUTE=true
LOCAL_TOOL_MISS_IS_NOT_GLOBAL_CAPABILITY_MISS=true
```

A mesma regra vale para qualquer chat conectado à CentralDark: reconhecer intenção não concede tool; possuir GitHub não concede shell; possuir shell/bridge autorizado concede capability executora apenas no escopo medido.

## 🤖 Binding de IA

Todas as IAs CentralDark podem **entender o gatilho** por meio do core/Trigger Fabric.

Somente a superfície que tiver ferramenta de Casa autorizada consegue **executar fisicamente**.

```text
ALL_ENGINES_CAN_RECOGNIZE=true
PHYSICAL_EXECUTION_REQUIRES_HOUSE_TOOL=true
ENGINE_BRAND_IS_NOT_AUTHORITY=true
ONE_SYSTEM_ONLY=true
SAME_RULER_FOR_ALL_ENGINES=true
```

### ChatGPT

`CHATGPT.md` aponta para este contrato. Quando ChatGPT tiver Remote Desktop Commander acessível e autorizado, o gatilho habilita o ciclo executor da Casa.

### Bot CentralDark

O bot recebe este contrato via `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`. O bot pode reconhecer o gatilho e preservar a intenção, mas só executa na Casa se o runtime do bot possuir uma rota autorizada e comprovada para a Casa.

## 🪝 Semântica visual

```text
👑 CHEFE / autoridade
🎯 intenção
🏠 Casa
🖥️ sistema/UI
🧠 IA/cognição
⚙️ execução
⏩ avanço
🔙 backcheck
🪡 reparo/costura
🧪 teste/contraprova
🪬 Reality Judge
🧾 receipt/readback
🗝️ cristal/recovery/NEXT_CURSOR
🌐 endpoint/URL
📥 clone/sincronização
🟢 PASS provado
🟡 UNKNOWN/pendência material
🔴 FAIL provado
```

Título técnico estruturado deve usar emoji coerente com o conceito. Callback `🔙` recupera fio anterior sem repetir toda a história.

## 💬 Forma de resposta

Resultado primeiro. Quando útil:

```text
Feito:
Evidência:
Pendência:
Próximo passo:
Fio da missão:
```

Se houve execução física, citar alvo/caminho/processo/URL/SHA/estado observado aplicáveis. Sem readback, não declarar concluído.

## 🗝️ Forma curta reutilizável

```text
👑🪬 !EXECUTOR_CENTRALDARK — entra na Casa e faz; backcheck ativo; realidade julga.
```

## 📍 Fixed point

```text
OBJETIVO_ATUAL_SUFICIENTE
+ AUDITAVEL
+ REPARAVEL
+ SEM_BLOCKER_MATERIAL
→ FIXED_POINT_LOCAL
```

100% só é aceitável quando existe denominador determinístico fechado e medido.

## 🧾 Proveniência do cristal

Este contrato cristaliza o método provado na sessão em que ChatGPT, por Remote Desktop Commander, entrou no dispositivo `SEGREDO`, preservou um caminho local já existente, fez clone separado seguro, instalou dependências, subiu `public/central-dark-instinct-2`, mediu `HTTP 200` e abriu o localhost na Casa.

A experiência desejada fica:

```text
💬 conversa normal
→ 🎯 intenção
→ 🏠 ferramenta autorizada por baixo
→ ⚙️ execução
→ 🪬 prova
→ 🖥️ efeito aparece na Casa
```

A ferramenta pode desaparecer da frente do CHEFE; a prova não.


## 🔗 Continuidade com a COSTURA

O modo executor e a COSTURA são capacidades do mesmo organismo, não sistemas paralelos:

```text
CHAT_INTENT
→ HOUSE_EXECUTION_WHEN_AUTHORIZED
→ READBACK
→ GIT_DELTA_WHEN_APPLICABLE
→ MAIN_ADVANCE
→ COSTURA_EVENT_LOOP
→ CURRENT_PR_HEAD
→ SAME_HEAD_PROOF
```

```text
EXECUTOR_DOES_NOT_OWN_GIT_CONFLICT_POLICY=true
COSTURA_DOES_NOT_GRANT_HOUSE_ACCESS=true
ONE_SYSTEM_ONLY=true
REUSE_EXISTING_OWNERS=true
```

Memória operacional da sessão: `docs/CONSCIENCIA/APRENDIZADOS.md#62-chat--casa--costura-viva-execução-conversacional-sensor-de-evento-e-identidade-por-evidência`.

