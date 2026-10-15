---
title: "🎨 Padrão de Emojis — CentralDark"
status: "ATIVO_RECONCILIADO"
date: 2026-08-27
updated: 2026-09-10
owner: "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
truth_scope: "VISUAL_TOKENS_AND_EMOJI_SEMANTICS"
canonical: true
tags:
  - centraldark
  - consciencia
  - emojis
  - visual
  - gatilhos
  - grafo-vivo
related:
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
  - "[[PADRAO-GRAFO-VIVO-MARKDOWN]]"
  - "[[ADM-GATILHOS-OPERACIONAIS]]"
links:
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
---

# 🎨 Padrão de Emojis — CentralDark

Emoji na Casa é pista visual com significado. Não é decoração, não é prova e não deve contradizer o registry de gatilhos.

## 🧿 Gatilhos canônicos

A fonte executiva dos gatilhos é `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json`.

```text
👑🪬 !CENTRALDARK
🔗 !># INTERLIGADOS
⭕ !AURÉOLA CANÔNICA
🧿 #ACORDAR
🎛️ !CALIBRAR
🧭 !MULTIBÚSSOLA
🔎 !META_LUPA
🔄 !RECONCILIAR
⚖️ !CONTRAPROVA
🔁 !VERTEX_INVERSO
🐚 !CARACOL
💠 !FIXED_POINT
🧾 !REGISTRA
🔏 !RASTRO
🚀 !BOOT
💎 !DELTAÚTIL
🪬 !MODO CIRURGIA DE RAIZ
```

## 🧠 Regra de uso

```text
EMOJI=CONTEXTO
EMOJI != PROOF
EMOJI_NAO_SUBSTITUI_SIGNIFICADO=true
CANONICAL_TRIGGER_DISPLAY_MUST_MATCH_REGISTRY=true
```

## 🫀 Mapa semântico mínimo

- 👑 autoridade humana / Chefe
- 🧠 ideia, mente, memória, plano
- 🫀 estado vivo da Casa
- 🔗 conexão, interligação, grafo
- 🏛️ GitHub / fonte oficial
- ☁️ Drive / espelho humano
- 🏠 Casa local
- 🖥️ VPS / servidor
- 🔌 MCP / conector
- 🚪 porta / entrada técnica
- 🧾 receipt / rastro
- ⚖️ realidade / juiz
- ❓ unknown
- ⚠️ atenção / pendência
- 🔴 falha
- 🟡 parcial
- 🟢 provado/ok quando medido

## ⚖️ Leis

```text
BIBLICAL_NARRATIVE != PROOF
EGYPTIAN_IMAGERY != ARCHITECTURAL_AUTHORITY
RESENHA_CONTEXTUAL != STATUS
LINK != PROOF
UNKNOWN != PASS
```

Quando houver conflito entre este arquivo e o registry, o registry vence para gatilhos. Este arquivo explica o uso visual humano.

## 🔧 Forja Viva — aliases visuais das capacidades existentes (2026-10-15)

**FIXED_POINT:** o CHEFE aceitou a conformidade do estágio corrente. Melhorias posteriores não reabrem um cadeado selado sem um DELTA verificável. Este é o owner canônico de **significado visual**, não de execução. O registry de gatilhos `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json` permanece a autoridade para comandos operacionais; emojis **não** concedem permissões, não são shell e não podem acionar processos automaticamente.

**Sequência visual da Forja viva (exibição contextual):** 🔧 🛠️ 👨🏻‍🔧 👀 👁️ 🪡 🎄 🌞 🌟 ✨ ☄️ 🔥 🪛 ⚒️. A ordem é apresentação, não ordem de executar.

| Símbolo | Sentido dentro do cockpit | Contrato/recurso existente |
|---|---|---|
| 🔧 🪛 | inspeção, diagnóstico e reparo causal | `skills/vs-code-restore` + `.agents/skills/centraldark-vscode-log-bridge` |
| 🛠️ 👨🏻‍🔧 | bancada e manutenção sob autorização | `.agents/skills/centraldark-operational-method` |
| 👀 👁️ | medir e contraprová-lo no sensor autorizado | `ObservabilidadeCentralDark`, `CENTRALDARK Trace` e funil MCP |
| 🪡 🎄 | costurar a linhagem, reaproveitar aprendizados e owners | `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json` |
| 🌞 🌟 ✨ | boot, recuperação de contexto e **Outra melhoria antecipada** | `#acordar`, `!calibrar`, `!CENTRALDARK` na skill operacional |
| ☄️ 🔥 ⚒️ | build verificado, pacote incremental POMBO64 e Forja | `apps/instinto-superior/package.json`, contrato `CENTRALDARK-CRYSTALLIZED-PLUG-PLAY.yml` |

**UX — sem atalhos mágicos:** na aba HUD/Forja já existente do Instinto Superior, tocar no símbolo escolhe uma **receita tipada estática** e mostra `o que faz / por que melhora / owner / comando ou caminho / prova necessária / estado`. Só copiar comando após clique explícito; execução, instalação, limpeza, merge e deploy permanecem delegados ao executor autorizado e sujeitos a readback. Um símbolo pode representar diversas opções apenas quando forem ações do mesmo owner; nenhuma associação arbitrária `emoji -> shell`.

**Logs e chat:** apresentar no chat **🍒🎰🎲 Outra melhoria antecipada** a cada ganho real; log de execução só com evento proveniente do runtime verificado, e trace da extensão apenas **metadados sanitizados**. Texto visível no chat não prova digitação no terminal ou ingestão. Zoom usa os controles nativos do VS Code/cockpit, não outro painel.

**Plug & play:** usar o comando versionado **`npm run build:plugplay`** do app Instinto (se presente no HEAD compilado) para testar, construir e inventariar artefato; não rodar por tocar num emoji. A linhagem POMBO64 exige identidade/revisão/hash verificáveis e não permite renomear programa a cada ZIP. `SOURCE_COMMITTED != BUILT != ZIP_PROVEN != INSTALLED != UI_PROVEN`.

**Regra de continuidade:** extender owners/skills/receitas existentes; alterações locais sujas da Forja nunca são excluídas por um alias visual. Ausência de listener/porta exige `UNKNOWN`, não vermelho por escolha de aplicativo fechado.
