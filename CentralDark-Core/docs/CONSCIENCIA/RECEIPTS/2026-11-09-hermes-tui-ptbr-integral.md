---
title: "CENTRALDARK HERMES TUI PT-BR INTEGRAL"
status: "PARTIAL_PASS_PENDING_RUNTIME_E2E"
date: 2026-11-09
updated: 2026-11-09T15:08:00Z
language: pt-BR
category: "RECEIPT"
sensitivity: INTERNAL
owner: "/data/locales/pt.yaml + /opt/hermes/locales/pt.tui.yaml"
consumer: "Hermes core i18n, classic CLI e TUI oficial"
writer: "HERMES"
source_rule: "DOCUMENTED != EXECUTED; ACTION != PROOF; UNKNOWN != PASS"
---

# CENTRALDARK HERMES TUI PT-BR INTEGRAL

## Intenção

Usar o sistema oficial de internacionalização do Hermes, preservando a skin
`central-dark`, os comandos, os identificadores técnicos, os owners existentes
e o comportamento do terminal.

## Estado ativo

```text
HERMES_HOME=/data
ACTIVE_LANGUAGE=pt
ACTIVE_SKIN=central-dark
CONFIG_PATH=/data/config.yaml
SKIN_PATH=/data/skins/central-dark.yaml
```

SHA observados:

```text
CONFIG_SHA=7fdb635f1e1a7a6cba9509af1a4286161b926e63806c98c94ad19ade506b5468
SKIN_SHA=617137d351d3619d8f99bb2d7d5ca7ac6321c8417b3a90543e3b2f9145faec43
LOCAL_OVERLAY_SHA=a6bb104d44e8738648529a750c9991905b1bfa4d947a5672ed1dd6768eeaf59c
```

## Cobertura estrutural

```text
CORE_EN_KEYS=3515
CORE_OFFICIAL_PT_KEYS=3515
CORE_COVERAGE=3515/3515
TUI_EXPECTED_KEYS=1390
TUI_OFFICIAL_PT_KEYS=1390
TUI_COVERAGE=1390/1390
LOCAL_OVERLAY_KEYS=45
LOCAL_OVERLAY_UNKNOWN_KEYS=0
```

A cobertura estrutural oficial está completa. Isso não substitui o readback de
cada superfície em execução.

## Delta local aplicado

Owner alterado:

```text
/data/locales/pt.yaml
```

O overlay contém somente chaves canônicas e traduz rótulos que ainda estavam
em inglês ou misturados, incluindo:

- organização e solicitação;
- falha de entrega;
- provedor de token;
- ganchos;
- latência e velocidade;
- gravação e transcrição;
- estados DESLIGADO;
- raciocínio desligado;
- prompt de cron;
- ramo de worktree;
- ciclo restante;
- direção de assinatura.

Identificadores técnicos preservados:

```text
MCP
Skills
TTS
STT
CLI commands
model names
provider names
API paths
environment variables
JSON keys
```

## Readback efetivo

```text
cli.commands.reasoning.headline_off = DESLIGADO
cli.commands.cron.prompt = Solicitação: {prompt}
cli.loop.remaining = ↻ Ciclo: {label}.
cli.subscription.direction_downgrade = redução
gateway.model.err_once_local = PT-BR
```

## Testes executados

```text
YAML_VALID=PASS
OVERLAY_KEYS_CANONICAL=PASS
CORE_OFFICIAL_COVERAGE=3515/3515
TUI_OFFICIAL_COVERAGE=1390/1390
EFFECTIVE_OVERLAY=PASS
ACTIVE_LANGUAGE_READBACK=PASS
ACTIVE_SKIN_PRESERVED=PASS
```

## Testes indisponíveis

TUI oficial possui os testes e o script `i18n:keys:check`, mas a instalação
runtime em `/opt/hermes/ui-tui` não possui `tsx`:

```text
sh: 1: tsx: not found
exit code: 127
```

Nenhuma dependência foi instalada no `/opt/hermes` para mascarar esse bloqueio.

Os testes Python oficiais `tests/agent/test_i18n*.py` não estão presentes na
imagem instalada. A cobertura estrutural foi executada por verificador
independente usando o loader YAML do Hermes.

## Inglês residual conhecido

Há textos controlados diretamente por código, sem chave de locale, em:

```text
/opt/hermes/hermes_cli/banner.py:632
/opt/hermes/hermes_cli/banner.py:661-663
/opt/hermes/hermes_cli/banner.py:712
/opt/hermes/hermes_cli/banner.py:728
/opt/hermes/hermes_cli/gateway_chat_view.py:600
```

Exemplos:

```text
Available Tools
Available Skills
No skills installed
MCP Servers
/help for commands
Welcome to Hermes Agent
```

Esses textos permanecem `BLOCKED` pela regra do owner: a engine instalada é
somente leitura e não existe hook de locale para esses rótulos do banner. Não
foram alterados `/opt/hermes`, a engine ou o renderer.

Descrições builtin do comando `/skin` também continuam em inglês porque o
renderer imprime metadados diretamente de `skin_engine.list_skins()`.

## Segurança e regressão

```text
SECOND_TRANSLATION_ENGINE=false
SECOND_SKIN=false
ENGINE_MODIFIED=false
SKIN_PRESERVED=true
TECHNICAL_IDENTIFIERS_PRESERVED=true
SECRETS_EXPOSED=false
UNREVIEWED_DEPENDENCY_ADDED=false
DIRTY_WORKTREE_RESET=false
```

A skin `central-dark` não foi substituída e o gateway não foi reiniciado.

## Baseline e limitação

Não foi capturado SHA do overlay imediatamente antes da primeira edição desta
missão. O SHA final está registrado acima e um backup pós-edição verificável
existe em:

```text
/data/cache/scratch/hermes-ptbr-overlay-backup-20261109T150201Z/
```

Por isso `ORIGINAL_SHA=UNKNOWN`, não `PASS`.

## Veredito

```text
CORE_CATALOG=PASS
TUI_CATALOG=PASS
OVERLAY_RUNTIME_SAMPLE=PASS
CLASSIC_CLI_TEST_SUITE=NOT_AVAILABLE
TUI_TEST_SUITE=BLOCKED_MISSING_TSX
HARDCODED_BANNER_TRANSLATION=BLOCKED_NO_NATIVE_HOOK
FULL_RUNTIME_E2E=UNKNOWN
```

## NEXT_CURSOR

```text
INSTALL_OR_ACCESS_HERMES_TEST_FIXTURES_WITHOUT_TOUCHING_RUNTIME_IMAGE
THEN_RUN_CLASSIC_AND_TUI_E2E
THEN_CAPTURE_BEFORE_AFTER_ON_ACTIVE_PROFILE
THEN_REVIEW_HARDCODED_BANNER_OWNER
```
