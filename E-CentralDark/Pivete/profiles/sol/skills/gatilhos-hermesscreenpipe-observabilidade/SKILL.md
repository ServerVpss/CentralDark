---
name: gatilhos-hermesscreenpipe-observabilidade
description: "screenpipe-hermes gatilhos: monitor/passado/futuro/logs"
version: "1.0.0"
category: observability
---

# Gatilhos Hermes-Screenpipe Observabilidade

## O que é

Sistema de gatilhos baseado em YAML que mapeia frases do CHEFE para auto-carga da skill `screenpipe-hermes-integration`.

**Arquivo:** `gatilhos-screenpipe-hermes-integration.yaml` na raiz do Pivete.

## Gatilhos registrados

| Gatilho | Skill carregada |
|---------|----------------|
| "ver passado" | screenpipe-hermes-integration |
| "ver futuro" | screenpipe-hermes-integration |
| "screenpipe" | screenpipe-hermes-integration |
| "monitor" | screenpipe-hermes-integration |
| "o que aconteceu" | screenpipe-hermes-integration |
| "logs" | screenpipe-hermes-integration |
| "status" | screenpipe-hermes-integration |
| "tá rodando" | screenpipe-hermes-integration |
| "anel de monitoramento" | screenpipe-hermes-integration |
| "tem alguma coisa rodando" | screenpipe-hermes-integration |
| "o que tá vivo" | screenpipe-hermes-integration |
| "antes eu vi isso" | screenpipe-hermes-integration |
| "questão operacional" | screenpipe-hermes-integration |
| "status operational" | screenpipe-hermes-integration |
| "health check" | screenpipe-hermes-integration |
| "ver o monitor" | screenpipe-hermes-integration |
| "monitor do sistema" | screenpipe-hermes-integration |

## Como usar

1. Arquivo YAML na raiz do Pivete: `gatilhos-screenpipe-hermes-integration.yaml`
2. Quando o CHEFE usar alguma das frases acima, carregar `screenpipe-hermes-integration` via `skill_view(name='screenpipe-hermes-integration')`
3. A skill tem acesso ao `live-monitor.log`, estado das portas, Screenpipe frames/events/window attribution

## Regras

- **Nunca inventar observabilidade** — usar o que já tá rodando
- **Primeira parada para qualquer observabilidade** — não criar outra forma sem verificar se esta skill já cobre
- Distinção: processo rodando ≠ Hermes consumindo; health verde ≠ invocação aconteceu; Screenpipe conectado ≠ Hermes recebendo contexto

## Integração com Hermes

O arquivo YAML é um contrato de gatilhos. A integração com o Hermes CLI (commands.py, skills_hub.py) é feita manualmente se quiser que o Hermes carregue automaticamente. Padrão Three-File Pattern do hermes-cli-extension:
- `hermes_cli/commands.py` — registry
- `cli.py` — dispatch
- `hermes_cli/cli_commands_mixin.py` — handler

## Veja também

- `references/find-timeout-workaround.md` — workaround para find recursivo em OneDrive timeout
- `screenpipe-hermes-integration` skill (carregar via skill_view)
