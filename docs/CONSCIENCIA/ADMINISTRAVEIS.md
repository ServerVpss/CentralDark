---
title: "Administráveis — registro canônico do painel"
status: "CANÔNICO"
date: 2026-08-17
authority: "SEGREDO/CHEFE"
scope: "Regra de projeção de capacidades administráveis no painel MCP CentralDark"
registry: "docs/CONSCIENCIA/ADMINISTRAVEIS.json"
---

# Administráveis — tudo que pode ser governado pelo CHEFE aparece no painel

Esta regra fecha a lacuna entre **capacidade criada** e **capacidade visível/controlável pelo SEGREDO/CHEFE**.

```text
CAPACIDADE_NOVA
→ OWNER_ESTAVEL?
→ TEM_GATILHO|ESTADO|CONFIG|VISIBILIDADE|ACAO_HUMANA_CONTROLAVEL?
→ PODE_SER_REPRESENTADA_SEM_SECRET?
→ SIM
   → PROVEN_ADMINISTRABLE=true
   → DECLARAR marcador ADMINISTRABLE_COMMAND=<gatilho>
   → REGISTRAR_EM docs/CONSCIENCIA/ADMINISTRAVEIS.json
   → PAINEL_ADMIN_RENDERIZA_AUTOMATICAMENTE
```

## Critério

Um item é `ADMINISTRABLE` quando existe pelo menos uma superfície humana legítima de controle ou inspeção, por exemplo:

- comando/gatilho;
- estado habilitado/desabilitado ou visível/oculto;
- configuração segura;
- owner editável/auditável;
- ação explícita do CHEFE;
- diagnóstico/observabilidade que permita decisão humana.

Não registrar como administrável apenas porque um arquivo existe.

```text
FILE_EXISTS != ADMINISTRABLE
DOCUMENTED != ACTIVE
ADMIN_PANEL_CARD != AUTHORITY
ADMIN_PANEL_PREFERENCE != CANONICAL_MUTATION
SECRET != PANEL_DATA
```

## Regra futura obrigatória + gate

Quando uma capacidade **for julgada e provada administrável**, a mesma mudança deve declarar o marcador canônico e registrar a ficha antes de fechar.

Formato do marcador: `ADMINISTRABLE_COMMAND=<gatilho>` em uma linha própria do canônico aplicável. O exemplo fica inline justamente para não ser confundido pelo gate com uma declaração real.

O gate já existente `codex-validate` executa `tests/admin-guard.test.mjs`; esse agregador preserva o guard histórico e inclui `tests/admin-administrables.test.mjs`. O teste exige correspondência bijetiva entre marcadores canônicos e `ADMINISTRAVEIS.json`, owner real e gatilho presente no owner.

```text
PROVEN_ADMINISTRABLE
→ DECLARE_MARKER
→ REGISTER_BEFORE_CLOSE
→ PANEL_AUTO_RENDER

MARKER_WITHOUT_REGISTRY_ENTRY
= FAIL

REGISTRY_WITHOUT_CANONICAL_MARKER
= FAIL

REGISTRY_WITHOUT_REAL_OWNER
= FAIL

NEW_ADMINISTRABLE_WITHOUT_MARKER_OR_REGISTRY
= INCOMPLETE_INTEGRATION
```

A decisão semântica de que algo **é** administrável continua sendo feita por evidência/intenção; depois dessa decisão, a integração deixa de depender de memória do agente e passa a ser verificável pelo gate.

A tela não hardcoda um card por capacidade. Ela lê o registro canônico e renderiza os itens. Assim, uma nova capacidade registrada entra na mesma Central de Comandos sem criar novo painel, novo dashboard ou novo orquestrador.

## Nome de exibição, parser e voz

Comando técnico e nome humano não precisam ser a mesma string. O parser permanece estável; display e voz podem usar forma natural sem criar alias operacional novo.

```text
PARSER_TOKEN=!MULTIBUSSOLA
DISPLAY_NAME=Multi Bússola
VOICE_LABEL=Multi Bússola
PRONUNCIATION_PT_BR=MÚL-ti BÚS-so-la

META_SPOKEN_ALIAS=Meta Bússola
META_SPOKEN_ALIAS_MEANS=META_MULTIBUSSOLA
META_SPOKEN_ALIAS_IS_NEW_COMMAND=false
META_SPOKEN_ALIAS_IS_NEW_ENGINE=false
```

`Meta Bússola` é somente uma forma humana/falada de referir-se à aplicação `META_MULTIBUSSOLA` já definida no owner `docs/CONSCIENCIA/MULTIBUSSOLA.md`. Não criar `!METABUSSOLA`, outra skill, outro motor ou outra capacidade paralela para isso.

```text
PARSER_TOKEN != DISPLAY_NAME
DISPLAY_NAME != NEW_COMMAND
VOICE_LABEL != NEW_AUTHORITY
META_SPOKEN_ALIAS != SECOND_META_SYSTEM
```

## Controles do painel

Os controles visuais têm semântica explícita:

```text
📋 COPIAR GATILHO
→ copia a sintaxe; não finge que executou o comando.

✏️ EDITAR OFICIAL
→ abre o owner canônico no GitHub para mudança formal/auditável.

🧽 OCULTAR FICHA
→ preferência local do navegador; não desliga a capacidade.

↩️ RESTAURAR VISUAL
→ remove preferência visual local; não altera o owner.

🧭 SETAS/BÚSSOLA
→ explicam a direção escolhida; são controles de aprendizagem/inspeção, não voto nem prova.
```

Mudança de comportamento real continua pertencendo ao owner canônico e ao fluxo normal de Git/PR/Writer. O painel não transforma UI em autoridade.

## Itens iniciais e marcadores

```text
ADMINISTRABLE_COMMAND=#ACORDAR
ADMINISTRABLE_COMMAND=!CALIBRAR
ADMINISTRABLE_COMMAND=!MULTIBUSSOLA
ADMINISTRABLE_COMMAND=!EXECUÇÃO_REVERSÍVEL
ADMINISTRABLE_COMMAND=!REMEDIÇÃO
```

`!MULTIBUSSOLA` inclui a matriz visual:

```text
                    ↑
              CAUSA / ORIGEM
                    │
              ↖     │     ↗
                 \  │  /
                  \ │ /
← FONTE ─────────── ✣ ─────────── CONSUMIDOR →
                  / │ \
                 /  │  \
              ↙     │     ↘
                    │
                    ↓
              EFEITO / ESTADO
```

Mais `↔ ROUND-TRIP/CONTRAMÃO` e as bússolas científica, causal, temporal, espacial, referencial, propagação, multirregional, adversarial, impacto, multicamada, multimaterial e metacognitiva.

## Menos É Mais

```text
ONE_ADMIN_PANEL_ONLY=true
ONE_ADMIN_REGISTRY=true
REUSE_EXISTING_NOC=true
NO_CARD_HARDCODE_PER_FEATURE=true
NO_SECOND_DASHBOARD=true
NO_NEW_WORKFLOW_FOR_ADMIN_REGISTRY=true
```

O owner visual atual é o painel MCP existente (`apps/modulos/mcp/src/admin.js`) estendido pelo injector já existente `apps/modulos/mcp/src/admin-patterns-ui.js`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
