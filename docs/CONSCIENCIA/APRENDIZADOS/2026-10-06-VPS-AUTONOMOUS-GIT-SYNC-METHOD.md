# Aprendizado: Sync Autônomo Git na VPS — Método Completo Provado

**Data:** 2026-10-06
**Commit de prova:** 6ae79a9ec
**Agente de origem:** Claude Opus 4.6 (Casa SEGREDO → SSH Segredo-VPS → CENTRALDARK-OS)
**Status:** PROVADO EM PRODUÇÃO

## Problema resolvido

A VPS CENTRALDARK-OS ficava dessincronizada com origin/main por falta de mecanismo autônomo.
Isso quebrava o fluxo: agentes na Casa commitavam, mas Hermes na VPS continuava com código antigo.
Resultado: drift de 177 arquivos acumulados antes da correção.

## Método completo — reproduzível por qualquer agente

### 1. Diagnóstico (medir antes de agir)

Da Casa, via SSH:

    ssh Segredo-VPS 'cd /root/CentralDark && git log --oneline -1 && git fetch origin main && git rev-parse HEAD && git rev-parse origin/main'

Compara HEAD local vs origin/main. Se diferem, há drift.

### 2. Sync inicial (stash + pull)

    ssh Segredo-VPS 'cd /root/CentralDark && git stash -u && git pull origin main && git stash pop'

Regras:
- SEMPRE stash antes de pull (protege dirty changes)
- --ff-only primeiro, rebase como fallback
- NUNCA git reset --hard no runtime (/root/CentralDark não é scratch)
- NUNCA force-push

### 3. Script auto-sync

Arquivo: /root/CentralDark/scripts/vps/auto-sync-main.sh

Características obrigatórias:
- flock no lockfile /tmp/centraldark-auto-sync.lock (impede corrida)
- stash -u automático de mudanças locais antes do pull
- pull --ff-only primeiro (seguro), rebase como fallback
- abort se rebase falhar (nunca deixa estado corrompido)
- stash pop depois (restaura mudanças locais)
- log em scripts/vps/auto-sync.log com ISO timestamp + SHAs
- trim do log a 300 linhas (evita crescimento infinito)
- NUNCA: force-push, blind reset, restart all, secret echo

### 4. Cron persistente

Instalar (idempotente):

    (crontab -l 2>/dev/null | grep -v "auto-sync-main"; echo "*/5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh") | crontab -

Verificar:

    crontab -l
    # Resultado esperado: */5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh

### 5. Verificação / prova

Log do último sync:

    tail -5 /root/CentralDark/scripts/vps/auto-sync.log
    # Deve mostrar [OK], [SYNC] ou [WARN] com timestamp

HEAD atual vs remote:

    cd /root/CentralDark && git log --oneline -1 && git fetch origin main && git rev-parse origin/main
    # Devem ser iguais (ou diferir por <=5 min de delay)

### 6. gh CLI (opcional, pra PRs/issues)

Instalar:

    apt update && apt install gh -y

Autenticar (manual, precisa do CHEFE):

    gh auth login
    # Opções: GitHub.com → HTTPS → Token → colar token

Verificar:

    gh auth status

## Topologia provada

    Casa SEGREDO (Windows 11)
      └─ SSH → Segredo-VPS (89.117.78.124, root)
           └─ /root/CentralDark (runtime canônico)
                ├─ remote: https://github.com/ServerVpss/CentralDark.git
                ├─ credential: store --file=/root/.config/centraldark/git-credentials
                ├─ user: SegredoiDev
                └─ cron: */5 auto-sync

## Cadeados

    RUNTIME_IS_NOT_SCRATCH=true
    NO_FORCE_PUSH=true
    NO_BLIND_RESET=true
    NO_RESTART_ALL=true
    NO_SECRET_ECHO=true
    NO_SECRET_COMMIT=true
    STASH_BEFORE_PULL=true
    FF_ONLY_FIRST=true
    FLOCK_REQUIRED=true
    LOG_WITH_TIMESTAMP=true

## Rastro

    commit: 6ae79a9ec (scripts/vps/auto-sync-main.sh)
    push: origin/main at 6ae79a9ec
    cron: */5 * * * * (root crontab)
    receipt: docs/CONSCIENCIA/RECEIPTS/2026-10-06-vps-autonomous-git-sync.md
    test: 2026-10-06T09:19:30+00:00 [OK] already up-to-date

## NEXT_CURSOR

- Monitorar log nos próximos dias
- gh auth login quando CHEFE quiser usar gh CLI
- Considerar systemd timer se cron não for suficiente
- Se pm2 voltar ao PATH, registrar como processo monitorado


## Delta MVP 2026-10-09 — um único sync manual; sem novo deploy

**Preserva-se a prova histórica de 06/10 acima; a receita CURRENT é o script
`scripts/vps/auto-sync-main.sh` na main, não o antigo stash/rebase registrado
historicamente.** Em 08/10 o checkout em branch não-main/tracked dirty bloqueou
o cron 63 vezes; após realinhamento controlado, `CHECKOUT_SYNC_PASS` foi observado
tanto manualmente quanto pelo cron. Isto **não** foi prova de runtime reiniciado.

**Comando único (PowerShell Casa, Git OpenSSH existente):**

```powershell
& 'C:\Program Files\Git\usr\bin\ssh.exe' Segredo-VPS 'bash /root/CentralDark/scripts/vps/auto-sync-main.sh && bash /root/CentralDark/scripts/vps/auto-sync-main.sh --manual'
```

Primeira chamada: atualiza o script existente na VPS com `fetch + ff-only`.
Segunda: readback legível; na primeira aplicação, funciona mesmo se o script
antigo ignorar `--manual`. O cron `*/5` permanece inalterado e não reinicia
serviços. `--restart-service centraldark-native-mcp-http.service` é opção
**apenas se** a unidade estiver materialmente ligada ao checkout /root/CentralDark
e arquivos do MCP mudarem; se a unidade consumir
`/root/CentralDark_MCP_RUNTIME` (owner registrado), o script recusa reinício,
registra `SERVICE_SOURCE_OUTSIDE_CHECKOUT` e mantém RUNTIME_UNKNOWN. Não
copiar runtime externo nem iniciar pipeline oculto: a distinção fica na placa.

**Deu bom:** um writer/lock `flock`, avanço `ff-only`, preservação de untracked,
sem force/reset/rebase, sem restart geral, readback do HEAD. **Deu ruim:**
branch fora da main, tracked dirty e confundir `CHECKOUT_SYNC_PASS` com
`MCP_RUNTIME_PASS`; o script marca blocker exato, sem apagar o verde histórico.
**Próximo cursor:** executar comando pela rota SSH já provada, comparar
`HEAD == origin/main` na VPS e medir separadamente service source, health e
consumo da skill pelo Hermes. Sem SSH vivo/readback, `VPS_CURRENT=UNKNOWN`.


## Readback CHEFE 2026-10-09 — checkout e HUD fisico PASS, MCP 9100 recusado

Evidencia fornecida pelo CHEFE, executada via Git OpenSSH na Casa (nao e
inferida de GitHub Actions). Estado antes: `SYNC_RC=2`, VPS_HEAD
`8ef0f065db197e4f2d3a68d2a1747f1e4d0f3588`, origin/main
`98eb21d292465e74b030b6a48f38441fd470b0c9`, branch main,
`TRACKED_DIRTY=1`, HUD espelho diferente. **Causa discriminada:**
` M scripts/register-github-webhook.sh`; nao e lixo a apagar.

Uma execucao unica do mesmo owner `/root/CentralDark` com lock compartilhado
`/tmp/centraldark-auto-sync.lock`, `fetch`, `ff-only`, protecao de dirty que
nao sobrepoe arquivos alterados na main e comparacao de bytes do HUD resultou:

```text
CHECKOUT_SYNC=PASS
HUD_MAIN_VPS=PASS
VPS_HEAD=e073059e0f76a53290886b56cbf668bf53d4b7f5
MAIN_HEAD=e073059e0f76a53290886b56cbf668bf53d4b7f5
TRACKED_DIRTY=1  # scripts/register-github-webhook.sh preservado
HUD_BACKUP=/root/.centraldark/.HUD.previous.2zfhofFJ
RUNTIME_SERVICE=NOT_RESTARTED
MCP_RUNTIME=UNKNOWN
```

**Contraprova runtime posterior, mesma Casa/VPS:**
`systemctl is-active centraldark-native-mcp-http.service = active`;
`systemctl is-active hermes-gateway.service = active`;
`curl -sS http://127.0.0.1:9100/health` recusou conexao com
`curl exit 7` e `HTTP=000`. **Nao declarar MCP HEALTH PASS** nem chamar
isso de sistema todo offline. `systemd active != PORT LISTEN != HTTP HEALTH`.
Causa de 9100 (bind/porta, crash de worker, unit ExecStart, EnvironmentFile)
ainda UNKNOWN. Diagnosticar por leitura somente `systemctl show` com campos
nao sensiveis, `ss -ltnp` e logs sanitizados; depois corrigir apenas o owner
causal, com readback de health. Nao aplicar restart geral.

**CI separada:** run `37963376354` do deploy self-hosted falhou no gate
(`GLOBAL_LEARNING_LINEAGE=FAIL / LINEAGE_MANIFEST_DRIFT`); o mesmo SHA da
main pode ter checkout sincronizado apesar desse gate bloqueado. Run
`37963376374` da Lupa falhou no hash de identidade local; nenhum desses
fracassos muda a prova de checkout/HUD na VPS. Dados sao snapshots e podem
ser alterados por novos runs.

**Preservacao:** nenhum `git clean`, reset, stash-pop ou overwrite sobre o
webhook modificado. Backup do HUD antigo mantido. Com o presente commit
em `main`, o `e073059e...` passa a ser **baseline historica** da VPS ate
novo sync/readback. A mesma placa de `docs/HUD/HUD.html` mostra o diagnostico;
nenhum HUD, scheduler, deploy ou memoria paralela foi criado.

**NEXT_CURSOR:** `RE-SYNC_SAME_OWNER_AFTER_COMMIT -> HEAD/HUD_READBACK ->
READONLY_MCP_9100_BIND_UNIT -> ISOLATED_MCP_REPAIR_IF_PROVEN -> HEALTH_CHECK`.


## NeuroLink acionavel — delta 2026-10-10 (CHEFE)

UID L000–L170 agora clicavel no MESMO HUD (sem mudar replay documental); painel apresenta tarefa e tenta `POST /api/kanban/tasks` apenas da mesma origem 9119 autenticada. A sonda VPS provou 9119 ativo mas API 401 sem cookie. No Obsidian/file:// a chamada fica `BLOCKED_GATEWAY_ORIGIN` com copia manual; nao ha bypass de OAuth, cookie nem promessa de execucao. O unico script especializado `scripts/vps/neurolink-gateway-dispatch.sh --inspect|--dispatch UID` reutiliza Hermes Kanban CLI existente, manifesto NeuroLink e idempotencia, sem novo servico. Cada UID e candidato ate haver owner+receita provados. `TASK_CREATED != EXECUTED`. VPS checkout dirty preservado; materializar e testar fisico antes de PASS.


### Binding MAIN-PINNED preservativo — 10/10

Na VPS, HEAD 5344bd e origin/main 300bb936 durante preflight, com 7 tracked dirty e 4 untracked preservados. O mesmo script `scripts/vps/neurolink-gateway-dispatch.sh` le manifesto pelo OBJETO GIT `origin/main:docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json` no SHA fixado a cada chamada: nao altera checkout, nem tenta reexecutar tarefas antigas. `--inspect UID` READ_ONLY; `--dispatch UID` cria/retoma tarefa Kanban idempotente so em invocacao explicita; task criada nao prova worker. Browser Obsidian file:// nao possui sessao autenticada :9119; mantem fallback fail-closed.


### Ponte HTML autenticada existente (10/10)

O HUD Obsidian `file://` nao pode enviar credenciais cross-origin. Foi criada a **ponte minima de submissao**, sem novo daemon, em `--publish-bridge` do MESMO `scripts/vps/neurolink-gateway-dispatch.sh`. Materializa apenas `neurolink-dispatch.html` no `web_dist` do Hermes **ja servido pela rota SPA autenticada :9119**; o HUD principal nao e duplicado nessa origem privilegiada. Clique Lxxx → abrir `http://100.90.199.124:9119/neurolink-dispatch.html?uid=Lxxx` → login nativo existente → clique explicito → POST same-origin /api/kanban/tasks → task ID/receipt pendente. HTTP 401 sem cookie e resposta comprovada. Testar portal autenticado + task ID antes de declarar ENQUEUED. Nenhum servidor reiniciado nem OAuth desativado.


### Correção de rota nativa comprovada na VPS (10/10)

Sonda inicial `/api/kanban/tasks` resultou 401 sem cookie, **mas esse prefixo era legado/documental** e não prova que a rota exista no Hermes atual. Leitura do OWNER REAL `/root/.hermes/hermes-agent/plugins/kanban/dashboard/plugin_api.py` confirmou `@router.post('/tasks')` montado em `/api/plugins/kanban/` (módulo/plugin existente), schema `CreateTaskBody` com `title,body,assignee,priority,goal_mode,goal_max_turns,idempotency_key,workspace_kind` e resposta `task.id`. HUD e ponte corrigidos para `POST /api/plugins/kanban/tasks`, `assignee=default`, `goal_mode=true`, `workspace_kind=scratch`, `idempotency_key=centraldark:neurolink:UID` compartilhada com CLI. **Rota+schema comprovados por fonte runtime; POST autenticado, task criada e worker ainda nao comprovados.** Despacho so apos clique autenticado.


## RECEIPT T1 — NeuroLink UID / Hermes gateway nativo (2026-10-10)

**Intencao:** clique em L000..L170 solicitar receita comprovada ao MESMO Hermes, sem segundo HUD, gateway, agente ou cron. **Owners:** `docs/HUD/HUD.html`; `scripts/vps/neurolink-gateway-dispatch.sh`; plugin nativo do Hermes em `/root/.hermes/hermes-agent/plugins/kanban/dashboard/plugin_api.py`.

**Readback e commits:** `300bb936` adicionou seletor UID + script; `68ecac3e` fez PIN do manifesto via objeto Git, preservando checkout sujo; `f08ba968` corrigiu erro real `UID: readonly variable` no Bash; `2506f523` incorporou ponte minima no WebUI nativo sem publicar HUD inteiro na origem autenticada; `5c066d94` corrigiu chamada para **ROTA REAL** `POST /api/plugins/kanban/tasks` e schema `CreateTaskBody` (assignee=default, goal_mode, idempotency_key, workspace_kind=scratch). Prova de fonte: classe `CreateTaskBody` e `@router.post("/tasks")` inspecionados diretamente na VPS; Gateway Uvicorn 9119 em LISTEN.

**Prova independente VPS:** `bash -n` script de `origin/main` passou; `--inspect L000` e `--inspect L170` validaram UID+PREV/NEXT no SHA do manifesto MAIN-PINNED. `--publish-bridge` criou `/root/.hermes/hermes-agent/hermes_cli/web_dist/neurolink-dispatch.html` (sha256 depois da correcao de rota `3a856ca66660885c11d19406079c077804f3133cf641ae7197c1319dfbac1ff9`). GET nao autenticado resultou **302 /login?next=...uid=L170**, comprovando preservacao da barreira de login, nao POST.

**Prova browser Casa:** Microsoft Edge real, HUD unico do Obsidian, `#cdr-number` clicado em L000, painel exibiu UID e titulo; botao `Encaminhar ao Hermes` abriu popup do gateway pelo Tailscale `100.90.199.124:9119` com destino `/login?next=%2Fneurolink-dispatch.html%3Fuid%3DL000`. `T1=PASS`, erros JS observados=0, tarefa criada=**NAO** (usuario nao estava autenticado). O script temporario de teste foi removido; sem arquivo de teste residual.

**Readback fisico do mesmo HUD:** Git blob `86c257e066d8d0821396ffcc756837f712f7487e` idêntico em `main`, `/root/.centraldark/HUD.html` VPS e `HUD.html` Obsidian Casa, apos backup. CLI VPS `/root/.centraldark/neurolink-gateway-dispatch.sh` = blob `87cd6ba5419bdb69eecda674b801989f2c4c7314`, igual ao source pinado. Nenhum restart foi necessario. Checkout `/root/CentralDark` permaneceu em `5344bd870...` com tracked/untracked de outros owners preservados; `origin/main` foi atualizado independentemente.

**Fronteira honesta:** `HUD_CLICK_T1=PASS`; `GATEWAY_LOGIN_GATE=PASS`; `CLI_INSPECT_2_2=PASS`; `GATEWAY_AUTHENTICATED_POST=UNKNOWN`; `TASK_CREATED=UNKNOWN/NOT_ATTEMPTED`; `WORKER_EXECUTION=UNKNOWN`; `HISTORIC_RECIPE_PROVEN_FOR_EVERY_UID=NO`; `GLOBAL_FIXED_POINT=BLOCKED`. O clique nao executa shell historico. O Hermes deve autenticar, enfileirar goal idempotente e emitir receipt real antes de elevar status.

**NEXT_CURSOR:** prova de login/sessao existente no Hermes → clique no botao do bridge → retorno `task.id` → worker/receipt + readback → criterios de aceite. Nenhuma criacao de segundo modelo/gateway/HUD. ONE_WRITER_PER_SCOPE=true.
