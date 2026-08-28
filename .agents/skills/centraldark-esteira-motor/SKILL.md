---
name: centraldark-esteira-motor
description: CentralDark esteira e motor Hermes — separa PM2 motor de deploy Actions, fila self-hosted, setup-node, PAPAGAIO vs POMBO. Use quando CHEFE pedir deploy, restart, runner, fila, Hermes, VPS sync, ou status do motor.
metadata:
  type: operational
  version: "1.2"
  owner: SEGREDO/CHEFE
---

# CentralDark — Esteira vs Motor

## Regra central

```
MOTOR (Hermes PM2)  !=  ESTEIRA (GitHub Actions + runner)
MERGED != DEPLOYED
PM2_ONLINE != MOTOR_SAUDAVEL
AÇÃO != PROVA
DOCUMENTADO != EXECUTADO
UNKNOWN != PASS
AUTOSTART != DEPLOY
ARQUIVO_CONGELADO_NA_VPS != ESTADO_CANONICO
SINTOMA_SUMIU != CAUSA_RESOLVIDA
```

PAPAGAIO_MODE = OFF.  
POMBO_MODE = CHECKSUM_ON.

## Escopo do motor

Pedido **só o motor** = `CentralDark-Hermes` primeiro.

| Nome | Papel | Quando entra |
|------|--------|----------------|
| CentralDark-Hermes | orquestrador | sempre no pedido motor |
| CentralDark-HermesVerificador | sidecar/gate | só se pedido ou causa incluir |
| CentralDark-MCP | API/admin | só se pedido ou causa incluir |

Sidecar parado **não** prova motor quebrado.

Prova funcional do motor (mínimo aplicável):
- PM2 status do processo pedido
- heartbeat/ação recente **ou** log de ciclo sem erro material
- estabilidade (restarts anormais = QUEBRADO ou UNKNOWN)

`online` sozinho não fecha FIXED_POINT.

## O que a esteira é

- Runner self-hosted da org (medir agora; não congelar snapshot de sessão)
- Fila só é serial se existir **1** runner online com o label usado
- Gargalo típico histórico = `actions/setup-node` + fila — **hipótese**, não dogma
- `vps-exec-selfhosted.yml` = deploy **MCP + operational guards**, **não** promove `CentralDark-Hermes`
- Autonomia `*/5` multiplica fila — cancelar zumbis/duplicados, preservar deploy ativo e checks úteis

## Dois mecanismos independentes (não confundir)

Sobreviver a reboot e receber código novo são **problemas diferentes**. Um não
substitui o outro, e provar um não prova o outro.

```
AUTOSTART  = resiliência a reboot   -> systemd/PM2 + restart policy, 0% GitHub
DEPLOY     = push vira produção     -> Actions/SSH, disparado por commit
```

| Falha | Sintoma | Onde olhar |
|-------|---------|------------|
| autostart quebrado | reboot derruba e não volta | `systemctl is-enabled`, `pm2 save`/`startup`, `restart: unless-stopped` |
| deploy quebrado | reboot ok, mas código velho | run do Actions, SHA na VPS vs main |

Prova de autostart é **só** reboot real + serviço de pé sem intervenção.
Prova de deploy é `git log -1` na VPS batendo com o SHA da main.

## Duas autenticações diferentes no mesmo deploy

Erro clássico: achar que uma chave resolve tudo.

```
chave SSH  -> o robô ENTRAR na VPS
token/PAT  -> a VPS puxar do GitHub (git pull) DE DENTRO
```

Uma não cobre a outra. `git pull` por SSH na VPS falha se a VPS não tiver chave
autorizada no GitHub — o caminho robusto é HTTPS com token. E `git pull` HTTPS
sem token trava esperando usuário/senha, coisa que robô não digita.

Nomes de secret **não podem** começar com `GITHUB_` (prefixo reservado).

## Rotas de deploy / restart

| Pedido | Rota |
|--------|------|
| deploy MCP / guards | `vps-exec-selfhosted.yml` ref=`main` |
| restart/promote Hermes | workflow ou host que **reinicie Hermes**; se não existir, REJECT + UNKNOWN de rota |
| restart all | medir tools da sessão; só reportar limite se SSH/host/workflow write estiver ausente |

Não chamar sucesso de deploy Hermes um run que só tocou MCP/Verificador.

## Erros reais desta operação (não inventar outros)

1. Hermes PM2 online + deploy pending = motor ≠ esteira.
2. `setup-node` longo ≠ zumbi automático — exigir idade vs timeout + log parado antes de cancelar.
3. VPS atrasada + dirty = preservar `.env`; sem `reset --hard` sem prova.
4. WebhookDeploy stopped = intencional no deploy (porta 9300).
5. AiDiag stopped = residual opcional.
6. Deploy keys Disabled = política org; não causa a fila.
7. Limite de tool é **desta sessão** — remedir antes de bloquear.
8. `chattr +i` trava o deploy inteiro. Bloqueia `git stash`, `checkout` e
   `reset` com `Operation not permitted`. Protege o arquivo de corromper **e**
   de evoluir. Antes de culpar git/rede, rodar `lsattr` nos arquivos do erro.
9. Colher "VPS dirty" de volta para o repo é vetor de **regressão**, não de
   resgate. Arquivo congelado na VPS é passado disfarçado de presente.
   Medido no PR #1316: `Critic/agent.mjs` 287 -> 77 linhas (−73%),
   `decisor.mjs` perdia `aplicarGatePercepcao` e derrubava o teste.
   Antes de aceitar VPS->repo: contar linhas e rodar o teste dos dois lados.
10. Arquivo **maior** não é arquivo **mais novo**. A cópia da VPS tinha 199
    linhas contra 158 da main e mesmo assim era linhagem anterior — sem
    `classificarCicloMestre` nem `selfTest`. Comparar inventário de funções,
    não tamanho.
11. Binário ausente no runner mata todo gate silenciosamente:
    `python: command not found` -> `exit 127` em cascata. O runner tinha
    `python3` mas não `python`. Ler o log do job, não só o status vermelho.
12. `groups` do Dependabot **sem** `applies-to` cobre só `version-updates`.
    Alerta de segurança gera `security-updates`, que passa por fora e volta a
    abrir um PR por dependência. Em lockfile único isso é conflito em cadeia,
    e `@dependabot rebase` não resolve (rebasear um recria nos outros).
13. Caminho do repo na VPS tem que ser medido, não presumido. `cd` para pasta
    errada quebra o deploy com `No such file or directory` — confirmar com
    `pwd` dentro da pasta real antes de escrever no workflow.

Detalhe de SHA/run da sessão: `references/sessao-erros-reais.md`.

## Procedimento obrigatório

### 1. ACORDAR (medir)

```
central_dark___deploy_status
github___get_commit sha=main
github___actions_list in_progress + queued (amostra)
medir runners registrados: online, labels, quantidade
```

Classificar — motor | esteira | ambos | UNKNOWN.

### 2. CALIBRAR (destino)

- motor → Hermes core + prova funcional.
- deploy → nomear o **componente**; escolher rota compatível ou recusar.
- restart → sondar capacidade atual da sessão.

### 3. MULTIBÚSSOLA

1. Cancelar `setup-node` só com prova de stall (idade + log inalterado).
2. Cancelar autonomia duplicada sem valor.
3. Redispatch só em SHA main atual se o run for SHA obsoleto.
4. Não criar segundo runner/cérebro/deploy key.

### 4. META_LUPA

Hermes quebrado? só com prova funcional, não só Actions vermelho.  
Fila serial? só se runner único online.  
Cache miss de Node pode ser frio legítimo.

### 5. Saída + fechamento canônico

```
PROVADO=
QUEBRADO=
EVIDÊNCIA FALTANTE=
DELTA EXECUTADO=
DEPLOY= (status real do run / REJECT se rota errada)
START_HEAD=
FINAL_HEAD=
HEAD_CHANGED_DURING_MISSION=SIM|NAO
EXECUTOR_REAL=
FIXED_POINT=
PENDENCIA=
RISCO_RESIDUAL=
ROLLBACK=
PRÓXIMO_CURSOR=
```

## Tools canônicas

| Ação | Tool |
|------|------|
| Estado unificado | `central_dark___deploy_status` |
| Dispatch MCP/guards | `central_dark___github_dispatch` workflow=`vps-exec-selfhosted.yml` ref=`main` |
| Cancel run | `central_dark___github_cancel_workflow_run` |
| Runs/jobs | `github___actions_list` / `github___actions_get` |
| SHA main | `github___get_commit` |

## Anti-padrões

- Declarar deploy OK porque Hermes está online.
- Declarar motor morto porque Actions está queued.
- Declarar Hermes saudável só com PM2 `online`.
- Tratar sidecar como motor quando o pedido foi só Hermes.
- Cancelar setup-node no primeiro `in_progress` longo.
- `pm2 restart WebhookDeploy` sem checar :9300.
- Reset VPS dirty sem inventário.
- Inventar causa sem medir runner/user do serviço.
- Provar autostart com deploy verde (ou o contrário) — são mecanismos separados.
- Aceitar arquivo vindo da VPS sem contar linhas e rodar o teste dos dois lados.
- Chamar causa de resolvida porque o sintoma sumiu na hora; remedir depois.
- Culpar git/rede por `Operation not permitted` sem checar `lsattr`.
