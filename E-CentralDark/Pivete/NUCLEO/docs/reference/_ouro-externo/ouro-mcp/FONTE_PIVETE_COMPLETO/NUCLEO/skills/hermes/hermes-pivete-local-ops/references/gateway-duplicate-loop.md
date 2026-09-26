# Gateway Duplicate-Loop — Diagnóstico e Fix (caso 02/08/2026)

## Sintoma reportado
Web UI `http://localhost:8648/#/hermes/chat` exibia badge "Pensando" travado ("1m24s / Pausing... waiting for the run to stop and sync"). `wmic` mostrava 6-10 PIDs de `hermes.exe gateway run --replace` vivos; matar um renascia outro.

## Sequência de diagnóstico (read-only)
```bash
# Dono da rota 8648
netstat -ano | grep -E ":8648" | grep LISTEN
# -> TCP 0.0.0.0:8648 LISTENING <PID>  (node.exe .../hermes-web-ui/dist/server/index.js)

# Gateways duplicados
wmic process where "name='python.exe'" get ProcessId,CommandLine | grep -iE "gateway run --replace" | grep -oE "([0-9]+)\s*$" | sort -u

# Bridges
wmic process where "name='python.exe'" get ProcessId,CommandLine | grep -iE "hermes_bridge" | grep -oE "([0-9]+)\s*$" | sort -u
# -> 18765 (sem profile) e 18905 (--worker-profile pivete) costumam ter 2 cada = duplicados

# Descartar PM2
pm2 list            # veio VAZIO
wmic process where "ProcessId=<PID_GW>" get ParentProcessId   # pai = outro gateway (cadeia de fork), nao pm2
```

## Causa raiz
Hermes tem restart interno: `gateway run --replace` que morre e substituido. Multiplos launches concorrentes (tentativas de restart anteriores) -> cada um mantem filho -> loop. PM2 foi investigado e DESCARTADO (lista vazia, Daemon nao era pai).

## Fix correto (nao matar por PID)
```bash
hermes gateway stop        # sinaliza supervisor interno; para todos os filhos
sleep 4
hermes gateway status
hermes gateway run --replace   # sobe UM unico
```
AVISO: `hermes gateway stop` e destrutivo (sessao CLI cai ~15-30s). Precisa consentimento. Rodar em background se a janela nao puder travar.

## Pitfalls confirmados
- `hermes gateway run --replace --hermes-home C:\...` -> erro "unrecognized arguments: --hermes-home". Flag inexistente; perfil vem do config.yaml.
- `timeout /t 3` quebra em git-bash (GNU timeout). Usar `sleep 3`.
- `taskkill //F //PID <n>` funciona em bash (barra dupla), mas insuficiente contra respawn de gateway.
- Web UI 8648 = node, nao gateway. Manter node + bridge pivete (18905); matar so gateways orfaos.

## "Pensando" / boneco na UI = config display
`config.yaml` perfil pivete (~linha 98):
```yaml
display:
  show_reasoning: true    # badge "Pensando" toda resposta
  pet:
    slug: "batmeme"       # mascote exibido
```
Para sumir: `show_reasoning: false` (badge) ou remover `pet` (boneco). Exige restart manual do gateway.
