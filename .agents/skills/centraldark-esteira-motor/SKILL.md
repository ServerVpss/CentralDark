---
name: centraldark-esteira-motor
description: CentralDark esteira e motor Hermes — separa PM2 motor de deploy Actions, fila self-hosted, setup-node, PAPAGAIO vs POMBO. Use quando CHEFE pedir deploy, restart, runner, fila, Hermes, VPS sync, ou status do motor.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# CentralDark — Esteira vs Motor

## Regra central

```
MOTOR (Hermes PM2)  !=  ESTEIRA (GitHub Actions + runner)
MERGED != DEPLOYED
AÇÃO != PROVA
DOCUMENTADO != EXECUTADO
UNKNOWN != PASS
```

PAPAGAIO_MODE = OFF (`acho`, `deve`, `parece` não governa estado).  
POMBO_MODE = CHECKSUM_ON (SHA, horário, evidência, residual, destino).

## O que o motor é

Processos PM2 na VPS (fonte `central_dark___deploy_status`)

| Nome | Papel |
|------|--------|
| CentralDark-Hermes | motor principal |
| CentralDark-HermesVerificador | gate do motor |
| CentralDark-MCP | API/admin |

Se CHEFE disser **só o motor** — medir esses três. Não exigir site, painel, sync full da main, nem deploy verde.

## O que a esteira é

- 1 self-hosted runner (`vmi3256920-centraldark`, labels `self-hosted, Linux`)
- Fila serial (centenas de runs queued comuns)
- Gargalo típico — `actions/setup-node` lento ou preso em jobs antigos
- Deploy canônico — workflow `vps-exec-selfhosted.yml` (só MCP + operational guards)
- Autonomia `*/5` multiplica fila — cancelar zumbis/duplicados, não apagar deploy ativo

## Erros reais desta operação (não inventar outros)

1. **Hermes online mas deploy pending** — motor OK; esteira engarrafada.
2. **setup-node in_progress longo** — cancelar job zumbi; main já tem composite `setup-node24-selfhosted` (#1164). Branches de PR antigas ainda usam setup-node direto.
3. **VPS ~1000+ commits atrás + dirty tree** — preservar `.env` e runtime; deploy canônico preserva dirty; não `reset --hard` sem prova.
4. **WebhookDeploy stopped** — intencional no deploy (porta 9300). Não religar sem prova de ownership da porta.
5. **AiDiag stopped** — residual; opcional `pm2 restart` **no host** (sem tool de shell PM2 write nesta sessão).
6. **Deploy keys Disabled by ServerVpss** — política org; não é causa da fila. GitHub App melhora governança, **não** desbloqueia runner.
7. **Sem `pm2 restart all` via connector** — só leitura PM2 + dispatch Actions. Restart no host SSH ou via workflow que já faça restart do app alvo.

## Procedimento obrigatório

### 1. ACORDAR (medir)

```
central_dark___deploy_status
github___get_commit sha=main
github___actions_list status=in_progress e queued (amostra)
```

Classificar cada sintoma — motor | esteira | ambos | UNKNOWN.

### 2. CALIBRAR (destino)

- Pedido = motor → só PM2 Hermes (+ Verificador/MCP se pedido).
- Pedido = deploy → SHA main + run `vps-exec-selfhosted` + runner livre.
- Pedido = restart all → informar limite de tool; orientar host ou workflow existente.

### 3. MULTIBÚSSOLA (caminhos materiais)

Prioridade mínima

1. Cancelar job **in_progress** preso em setup-node (zumbi).
2. Cancelar autonomia/cron duplicado **sem** valor (preservar deploy ativo e PR checks úteis).
3. Redispatch deploy só em SHA main atual se run antigo for SHA obsoleto.
4. Não criar arquitetura paralela (segundo runner, segundo cérebro, deploy key).

### 4. META_LUPA (falsificar)

Perguntar — o deploy poderia falhar por outro motivo? cache npm resolve sozinho? (não, se o gargalo é aquisição Node no runner). Hermes quebrado? (só se PM2 status≠online).

### 5. Saída obrigatória

```
PROVADO:
QUEBRADO:
EVIDÊNCIA FALTANTE:
DELTA EXECUTADO:
DEPLOY: (status real do run, não desejo)
FIXED_POINT: (motor separado de sistema)
PRÓXIMO_CURSOR:
```

## Tools canônicas

| Ação | Tool |
|------|------|
| Estado unificado | `central_dark___deploy_status` |
| Dispatch deploy | `central_dark___github_dispatch` workflow=`vps-exec-selfhosted.yml` ref=`main` |
| Cancel run | `central_dark___github_cancel_workflow_run` |
| Runs/jobs | `github___actions_list` / `github___actions_get` |
| SHA main | `github___get_commit` |

## Anti-padrões

- Declarar deploy OK porque Hermes está online.
- Declarar motor morto porque Actions está vermelho/queued.
- `pm2 restart WebhookDeploy` sem checar :9300.
- Reset VPS dirty sem inventário de ouro.
- Inventar causas (rede, disco, Node PATH) sem medir no user do serviço do runner.
- Criar skill/workflow paralelo para o que o composite #1164 e o deploy canônico já cobrem.

## Referência

Ver `references/sessao-erros-reais.md` para o mapa condensado da sessão de prova.
