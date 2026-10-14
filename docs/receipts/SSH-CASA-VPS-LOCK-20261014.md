# 🔒 Cadeado SSH Casa ↔ VPS — registro operacional (2026-10-14)

**Owner:** CentralDark existente. **Âncora ledger:** PR #1562 (NÃO MERGEAR). **Regra:** CURRENT > HISTORY; prova ≠ declaração.

## Rota comprovada
- Origem: Windows Casa SEGREDO, arquivo `C:\Users\Administrador\.ssh\config`.
- Alias existente `segredo-vpss` → `89.117.78.124:22`, usuário Linux `root`.
- Alias alternativo existente `Segredo-VPS` → mesmo destino e usuário.
- Contraprova após proteção: `ssh -o BatchMode=yes -o ConnectTimeout=6 segredo-vpss 'whoami; hostname'` → `root`, `CENTRALDARK-OS`: **PASS**.
- Tailscale Casa `100.123.93.25`, VPS `100.90.199.124`: visibilidade de peers comprovada; SSH via Tailscale **NÃO COMPROVADO**.

## Cadeado aplicado na Casa
- Backup prévio: `C:\Users\Administrador\.ssh\config.pre-lock-20261014.bak`.
- Aviso inserido no início do config: `CENTRALDARK SSH LOCK / NAO TOCAR / DO NOT EDIT`.
- Marcadores declarativos: `PROTECTED_ROUTE=segredo-vpss`, `MUTATION_ALLOWED=false`, `SOL_ACCESS=EXISTING_AUTHORIZED_ROUTE_ONLY`, `NO_NEW_IDENTITY=true`.
- Atributo Windows `ReadOnly` aplicado e relido (`ReadOnly, Archive`). **Isso impede edição acidental, NÃO é ACL imutável nem autorização criptográfica.**
- SSH retestado com êxito depois da alteração. Nenhuma chave, ACL Tailscale ou permissão SSH de servidor foi alterada.

## Autoridade / exceções
- **Não tocar:** não alterar alias, usuário, IP, chave, permissões ou arquivo sem permissão explícita do CHEFE.
- O CHEFE pode autorizar expressamente SEGREDO ou ADMIN a realizar manutenção; autorização deve ser específica para a mudança e acompanhada de backup, teste e contraprova.
- SOL pode usar a rota já autorizada e registrar evidência; **não possui identidade SSH independente comprovada** e não pode remover o cadeado por iniciativa própria.
- `MUTATION_ALLOWED=false` é regra documental; não constitui bloqueio técnico para administradores.
- NÃO incluir segredos, chaves privadas ou tokens neste ledger.

**Status:** SSH público PASS; somente-leitura PASS; permissão independente SOL UNKNOWN; SSH Tailscale UNKNOWN; servidor imutável NÃO APLICADO.

## Contraprova Tailscale + Forja preservativa — 2026-10-14 19:32–19:45 BRT

**INTENÇÃO:** fechar circuito Casa → SSH Tailscale → VPS → Forja com o mesmo alias, chave, writer e owners, mantendo isolamento e circuit breaker real. Esta seção atualiza a observação histórica de Tailscale UNKNOWN acima; não apaga a medição anterior.

### Transporte comprovado em ambas as pontas

- Na VPS, `tailscale status --json`: self `100.90.199.124` online, peer Casa `100.123.93.25` online.
- VPS → Casa: `tailscale ping -c 3 100.123.93.25` com **3 pongs**; pelo relay `DERP(sao)`, sem conexão P2P direta estabelecida. Um relay é transporte funcional e não comprova conexão direta.
- Casa → VPS: `ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -o HostName=100.90.199.124 -o HostKeyAlias=89.117.78.124 -o ConnectTimeout=7 segredo-vpss 'whoami; hostname'` → usuário `root`, host `CENTRALDARK-OS`, **EXIT=0**.
- A host key ED25519 da VPS corresponde à âncora observada `SHA256:KkbBd5sOR1boP8ldlWh45eWN2DY8RPjOHtXX+4FQhIE`; o `known_hosts` pré-existente da Casa contém a identidade pública correspondente. Não foram usadas `StrictHostKeyChecking=no` nem novas chaves.
- Configuração `C:\Users\Administrador\.ssh\config`: **ReadOnly, Archive**, preservada sem alteração. Alias `segredo-vpss` continua apontando para SSH público por padrão; o updater existente injeta o binding Tailscale apenas na chamada SSH, sem quebrar o cadeado.

### Mesmo owner remoto evoluído e testado

- `OWNER=scripts/remote-bridge/canonical/CENTRALDARK-VPS-UPDATE.ps1` existente.
- `DELTA_MAIN_COMMIT=cca170db7d8e3284fab482cbd108b5222f388491`.
- `OWNER_GIT_BLOB=f7000b53d162625532fc29dc0889046d6a40d076`: comparação com bytes reais da Casa via `git hash-object --no-filters` resultou **idêntica**.
- Origem anterior preservada num backup verificado byte a byte, `SHA256=b2abe88e4aca3b2c6707bcb2444c1e7ae9227eb09ffc070e67ecd81fe062e06e`, fora do repositório em `%TEMP%`.
- Alterações: priorizar `TAILSCALE` via `100.90.199.124`, fallback público existente, confiança estrita da mesma host key, `-ProbeOnly` sem deploy, transporte UTF-8/Base64 para não quebrar quoting do PowerShell.
- **PROVA CASA:** `ParseFile errors=0`; `CENTRALDARK_SSH_PROBE_ONLY=true ROUTE=TAILSCALE DEPLOY=false`; `PROBE_EXIT=0`; fixture Bash enviada por Base64 `ENCODED_SHELL_OK`, host `CENTRALDARK-OS`, `BASE64_EXIT=0`.
- **RUNTIME_DEPLOY_NAO_EXECUTADO**; `--apply`, reinício, merge, reset e alterações no `sshd` **não ocorreram** nesta medição.
- O arquivo do updater na Casa está `M` relativo ao HEAD local antigo, apesar dos bytes coincidirem com o blob já promovido na main. Não descartar essa diferença por reset.

### Circuit breaker de sincronização — separar transporte de promoção Git

- **TRANSPORT_CASA_TAILSCALE_VPS=PASS**.
- **AUTO_SYNC_OWNER_EXISTE:** `scripts/vps/auto-sync-main.sh`, cron da VPS `*/5 * * * *`, lock `flock`, bloqueio de branch/dirty/divergência.
- `AUTO_SYNC_VPS_CURRENT=BLOCKED`: checkout operacional `/root/CentralDark` permanece na `fix/ai-andarilho-casa-bridge@c77e50195fcd`, não na `main`; o cron registra o motivo explicitamente a cada 5 minutos. **Não remover esta proteção**.
- `GIT_CASA_CURRENT=DIRTY_DIVERGED`: `K:\` é a raiz real do Git no Windows, não `K:\CentralDark`; na medição de origem havia 28 entradas tracked e 88 untracked, além de `main` local ahead 13 / behind 102 contra referência remota localmente cacheada. A correção do updater acrescentou uma mudança tracked.
- `MAIN_PULSE=BLOCKED/PARTIAL`: `scripts/vps/main-pulse-reconciler.sh` tem receipt pendente; a última tentativa de microdeploy registrou `MCP_NATIVE_FILESET_NOT_APPROVED=apps/modulos/mcp/src/admin.js`. Havia 142 caminhos entre `last-seen-sha` e `origin/main` **cacheada**; não iniciar microdeploy em lote nem declarar sincronização de runtime pela promoção da fonte.
- PR histórica `#1813` AI Andarilho consta **merged**; não recriar essa PR nem presumir que seus HEADs atuais pertencem à `main`.
- `ONE_WRITER_PER_SCOPE`, `REUSE_BEFORE_CREATE`, `UNKNOWN != PASS`, `NO_FORCE_PUSH`, `NO_AUTO_STAGE_K_ROOT`, `SOURCE_MAIN != VPS_RUNTIME`.

**FIXED_POINT:** rede+SSH/autenticação+roteamento via updater+fonte idêntica Casa/GitHub = **PASS**. **AUTO_PROMOTION_GLOBAL=BLOCKED**, **VPS_CHECKOUT_MAIN=BLOCKED**, **VPS_RUNTIME_CURRENT=UNKNOWN**. Estes bloqueios são materiais, não dívidas genéricas.

**NEXT_CURSOR:** medir e reconciliar, por owner, as entradas staged/unstaged do `K:\` sem inclusão global; atribuir um único writer por escopo; usar PR/CI existentes e checks obrigatórios para promover deltas úteis isolados à `main`; destravar separadamente o fileset `apps/modulos/mcp/src/admin.js` do reconciliador antes de qualquer microdeploy; manter o checkout `fix/ai-andarilho-casa-bridge` e os worktrees vivos sem reset/rebase ou force. Depois testar cron+readback de `main` e runtime de cada owner, com backup/rollback.

