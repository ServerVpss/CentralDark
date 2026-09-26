# VPS HOUSEKEEPING — Lixo vs Ouro (CentralDark)

## Contexto medido (2026-08-25)
CHEFE mandou: "permito segredo deploys na vps em paralelo; comparar o que tem de lixo na vps e tambem o que tem de ouro; manter so o util, zero regressao, step by step; me manda shot em tempo real."

## Acesso — como medir
- Caminho real pra VPS = runner `self-hosted` Linux que executa os workflows (mas é GitHub Actions, não shell livre) OU **SSH local do VS Code** (ver abaixo).
- gh CLI autenticado como `segredounlock` → lê/escreve repo, mas NÃO é acesso VPS.
- `curl 127.0.0.1:9100/health` no clone Windows = falha (aqui não é a VPS).

## ACESSO SSH LOCAL É REAL (descoberta 2026-08-26)
O agente HERMES-CASA consome o SSH do CHEFE via git-bash, sem config extra:
```bash
ssh -o BatchMode=yes -o ConnectTimeout=15 Segredo-VPS 'hostname; whoami; pm2 -v'
# Prova: vmi3256920 / root / 7.0.1  -> CONEXÃO_VPS_REAL=PROVADO
```
Alias `Segredo-VPS` vem de `C:\Users\<user>\.ssh\config`:
```
Host Segredo-VPS
    HostName 89.117.78.124
    User root
    IdentityFile C:\Users\<user>\.ssh\segredo_vps_ed25519
```
**Usar esta rota quando o runner self-hosted ficar PENDING/queued** (fila congestionada/offline). Rota B roda o scan direto no host, não depende do workflow.

## Estrutura de deploy canônico na VPS (fato, não suposição)
`vps-exec-selfhosted.yml` ("VPS Deploy canônico (self-hosted)"):
- runs-on: [self-hosted, Linux]
- concurrency: centraldark-vps-production
- Gatilhos: push em main (só paths MCP/mapeamento/Log-Verificador/guards/webhook) + workflow_dispatch
- Job1 `deploy-mcp`: PM2_APP=`CentralDark-MCP`, health `127.0.0.1:9100/health`, service==mcp-centraldark, PID trocado, estabilidade 5x
- Job2 `deploy-operational-guards`: roda `scripts/vps/deploy-operational-guards.sh`, PM2_APP=`CentralDark-HermesVerificador` (mapa + Verificador)

**MOTOR ≠ ESTEIRA**: esse workflow NÃO promove/reinicia `CentralDark-Hermes` core. Deploy/restart do core precisa de caminho próprio.

## RECONCILIAÇÃO GIT DA VPS ANTES DE TOCAR RUNTIME (PITFALL 2026-08-26)
Repo na VPS é runtime vivo, não espelho limpo. NÃO dar `reset --hard`/`checkout -f` sem checar:
```bash
cd /root/CentralDark
ps -eo args | grep -E '[g]it (push|commit|checkout)'   # processo git ativo? trava reset
ls -la .git/index.lock 2>/dev/null || echo NO_LOCK        # lock travado?
git branch --show-current                                # vazio = DETACHED HEAD
git rev-parse HEAD                                        # HEAD == branch esperada?
lsattr apps/modulos/HERMES-CORE/core/decisor.mjs 2>/dev/null  # 'i' = immutable -> reset falha c/ "Operation not permitted"
```
Achados reais 2026-08-26: VPS em DETACHED HEAD (`6b93c5d1`), `decisor.mjs` com `chattr +i`, `git push origin main` ativo do GitKraken. **Não forcei alinhamento** — scan rodou apontando o script direto (branch `feat/vps-housekeeping` tinha o script no HEAD `947bbf64f`), respeitando runtime vivo. Reconciliar Git da VPS = missão R4 separada, só com ordem do CHEFE.

## Varredura lixo vs ouro — comandos base (report-only primeiro)
```bash
# processos PM2
pm2 ls
pm2 jlist   # JSON
# disco
df -h
du -sh /root/CentralDark/* 2>/dev/null
# processos
ps aux | grep -E "node|pm2|CentralDark" | grep -v grep
# worktrees zumbis
cd /root/CentralDark && git worktree list --porcelain
# portas em uso
ss -ltnp | grep -E ":(9100|9300|8099|8787|8788|3000)"
```
Ou usar o script canônico: `node scripts/vps/vps-housekeeping-scan.mjs --repo-dir /root/CentralDark --report <path>.jsonl` (classifica lixo/ouro/neutro em JSONL, não remove nada).

## Classificação
| Classe | Exemplo | Ação |
|--------|---------|------|
| LIXO | processo pm2 `stopped`/crashloop (restarts altos + stopped), arquivo temporário grande (`/tmp/*.tgz` >100MB), stale backup/`*.release.*`/`*.dist-backup.*` >7d, orphan worktree `*-build.*` | listar; remover SÓ após confirmação |
| OURO | serviço ativo com health OK + consumidor real (Hermes, MCP, Verificador, GrafoVivo, Memoria, PiveteSync) | NÃO tocar |
| ALERTA (ouro instável) | restarts altos (ArsenalProxy 5576, EliteHTTP 5308, MCP 845) — online mas reinicia muito | investigar causa, não matar sem ordem |
| DUPLICADO | arquivo igual a canônico (sha) | verificar gap antes de remover |

## VERIFICAÇÃO DE EXPOSIÇÃO (fronteira DEPLOY≠PUBLICAÇÃO, lição 46)
```bash
ss -ltnp | grep -E '0.0.0.0:(3000|8080|80|443|9100)'
ufw status
curl -fsS --max-time 4 https://api.ipify.org
curl -fsS --max-time 4 http://<IP_PUBLICO>:<porta>/   # responde de fora? = EXPOSTO
```
Achado 2026-08-26: OpenWebUI (`CentralDark-WebUI`, open-webui docker) em `0.0.0.0:3000` ignorando UFW (Docker injeta regra antes do UFW). Responde em `http://89.117.78.124:3000`. **Registrar como EXPOSTO, não mexer sem ordem do CHEFE (R4).**

## Anti-teatro obrigatório
- Sem acesso à VPS → declarar `STATE_GAP`. Não gerar print/screenshot falso.
- "Shot em tempo real" sem shell/runner = impossível de provar → dizer não, não inventar.

## Rollback
- Antes de qualquer wipe: snapshot/backup quando disponível.
- `UNKNOWN`, `SKIPPED`, timeout, log ausente ≠ PASS.
- ZERO REGRESSÃO: nunca quebrar sidecar/serviço ativo.
