# MODULES/HUB — Central visível do Megazord CentralDark

> Batismo: `MODULES/HUB` é o lugar humano/editável para registrar conexões, sensores de evento, notificações, rotas MCP/IA e ligação com `status.centraldark`.
>
> Regra: este diretório **não é runtime paralelo**. O runtime existente continua em `apps/modulos/hub`; este módulo é o mapa/controle visível que aponta para os owners reais.

## Veredito

A arquitetura correta é um sistema só:

```text
CHEFE / SEGREDO
→ SOL / Orquestrador
→ MODULES/HUB como painel de controle editável
→ owners reais existentes
→ MCP / Hermes / Telegram / GitHub / Gmail / VPS / Casa
→ Reality Judge
→ status.centraldark / Telegram / Gmail / BRAIN
```

O que é proibido:

```text
cada bot virar cérebro próprio
cada sensor virar regra própria
cada conector decidir sozinho
notificação virar PASS sem contraprova
```

## Gatilho canônico — EXPANSÃO DE DOMÍNIO

Quando o CHEFE disser `EXPANSÃO DE DOMÍNIO`, o Hub deve tratar como gatilho determinístico para continuar expandindo o Megazord por setores.

```text
EXPANSAO_DE_DOMINIO =
medir estado atual
→ localizar owner existente
→ deduplicar arquitetura
→ escolher menor setor conectável
→ micro-delta material
→ commit pequeno
→ CI/check/receipt
→ status.centraldark
→ próximo setor
```

Arquivos do gatilho:

- `triggers/domain-expansion.trigger.json`
- `playbooks/EXPANSAO-DE-DOMINIO.md`

Esse gatilho **não autoriza falso-verde**, não ignora CI e não cria owner novo sem procurar equivalente.

## Owners reais já detectados

- Runtime visual do Hub: `apps/modulos/hub`
- Serviços do Hub: `apps/modulos/hub/src/services/`
- Componentes/conectores do Hub: `apps/modulos/hub/src/components/connectors/`
- Dashboard/status do Hub: `apps/modulos/hub/src/components/dashboard/`
- Bot Telegram principal: `apps/bot-telegram/unified-bot.cjs`
- MTProto user bridge: `scripts/telegram-mtproto/server.js`
- Notificações Telegram: `scripts/notify-claude/`, `scripts/guarda/`, `scripts/webhook/lib/`, `apps/modulos/mcp/src/tools/painel/`
- Meta-Lupa XP/posterior: `.agents/skills/meta-lupa/scripts/meta_lupa.py`

## Arquivos de controle

- `hub-connections.registry.json`: mapa dos braços/pernas/conectores.
- `controls/notifications-and-sensors.json`: ligar/desligar sensores, canais de notificação e gatilhos.
- `status-centraldark.routes.json`: quais sinais devem aparecer em `status.centraldark`.
- `triggers/domain-expansion.trigger.json`: contrato determinístico do gatilho de expansão.
- `playbooks/EXPANSAO-DE-DOMINIO.md`: procedimento humano/operacional do domínio.
- `receipts/`: recibos de prova, UNKNOWN e próximo cursor.

## Regra de prova

```text
NOTIFICATION != PASS
COMMIT != DEPLOY
MERGED != RUNNING
HEALTH_200 != FEATURE_READY
ACTION != PROOF
PATCHED != ROOT_CAUSE_FIXED
UNKNOWN != PASS
CI_PENDING_IS_NOT_PASS
```

## Como editar

1. Para ativar/desativar sensor ou notificação, edite `controls/notifications-and-sensors.json`.
2. Para mapear um novo conector, edite `hub-connections.registry.json`.
3. Para expor no painel, edite `status-centraldark.routes.json`.
4. Para mudar a frase/semântica de expansão, edite `triggers/domain-expansion.trigger.json`.
5. Nunca coloque token, senha, sessão ou segredo aqui.
6. Se virar código vivo, o owner precisa estar em `apps/modulos/hub` ou no módulo runtime já existente.

## Padrão de entrega

Toda expansão deve terminar assim:

```text
Feito:
Evidência:
Pendência:
Próximo passo:
Qual BOOT usar:
Fio da missão:
```

## NEXT_CURSOR

```text
1. Ligar leitura dessas configs no runtime `apps/modulos/hub`.
2. Expor cards editáveis no painel status.centraldark.
3. Conectar eventos GitHub/Gmail/Telegram/PM2/MCP ao ledger sem promover falso-verde.
4. Alimentar XP/posterior só com receipt validado + feedback do CHEFE.
5. Quando o CHEFE disser EXPANSÃO DE DOMÍNIO, continuar pelo próximo setor com micro-delta + CI/receipt.
```
