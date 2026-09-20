# 👑🪬 Grupo Evolução por cron + dual remote profiles

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Grupo Evolução runtime model

VPS crontab contém:
- 0 6 * * * docs/CONSCIENCIA/ARSENAL/scripts/hermes.sh
- */5 * * * * node docs/CONSCIENCIA/ARSENAL/scripts/atualizar-conselho-vivo.mjs
- */30 * * * * node apps/modulos/mapeamento/agents/cartografo.mjs

README de apps/modulos/grupo-evolucao declara:
Cartógrafo detecta drift
→ orquestrador.mjs recebe missão
→ 5 agentes especializados debatem em cascata
→ notificação Card Hermes Telegram.

Portanto:
PM2_EMPTY != GRUPO_EVOLUCAO_DOWN.
GROUP_EVOLUTION_EXECUTION_MODEL=EVENT_OR_CRON_TRIGGERED.

## Telegram notifier

apps/modulos/grupo-evolucao/core/notificador.mjs:
- lê credenciais via process.env;
- usa gateway Telegram;
- envia Card Hermes;
- não exigiu exposição de segredo durante o probe.

TELEGRAM_SEND_CURRENT=UNKNOWN até log/receipt vivo confirmar entrega.

## Desktop Commander VPS

systemd:
centraldark-dc-remote@conta1.service = active/running
centraldark-dc-remote@conta2.service = active/running

watchdog timers para perfis também ativos.

Isso cria hipótese forte de que as duas cadeias observadas na Casa possam corresponder a perfis distintos.

TWO_CASA_CHAINS != DUPLICATE_UNTIL_PROFILE_MAPPING.
SAFE_TO_KILL_ANY_CHAIN=false.

## Correção de interpretação

LEGACY_ARSENAL_8083_8090_DOWN=true.
CURRENT_COUNCIL_CAPABILITY_MAY_RUN_VIA_GRUPO_EVOLUCAO_CRON=true.

## NEXT_CURSOR

- medir logs/receipts recentes de conselho vivo/Cartógrafo/Telegram sem disparar nova mensagem;
- mapear Desktop chain↔conta1/conta2 quando possível;
- integrar recipe determinístico no boot/engine, preservando UNKNOWNs.
