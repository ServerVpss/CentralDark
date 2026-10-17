# Screenpipe Browser Bridge — continuidade no organismo CentralDark

**Owner**: `.agents/skills/screenpipe-live-observer/SKILL.md` + `SCREENPIPE-BINDING.yml`. **Executor**: processo Screenpipe Desktop existente da Casa. **Consumidores**: ZenDrive/Chrome autorizado, VS Code/Hermes e Cockpit por adapters existentes; nunca um novo coletor nem um segundo Screenpipe.

## Evidências e limites em 16/10/2026

- Usuário executou PowerShell 7.6.6: `3030` LISTEN `0.0.0.0` PID `40352` e `GET http://127.0.0.1:3030/health` retornou 200 naquele instante.
- Imagem: Chrome `Screenpipe Browser Bridge` e aplicativo Screenpipe mostram o fluxo de autorização por confirmação local. A captura antecede a prova independente de WebSocket `101`/heartbeat.
- Usuário relatou `all done` após aprovar. **Relato ≠ reinício provado**, nem prova de que o Hermes consumiu o contexto.
- A Casa SEGREDO apareceu `Online` no Desktop Commander, mas o controle remoto encontrou **limite mensal**; nenhum Task Scheduler ou processo foi alterado remotamente nesta rodada.
- `K:\` é raiz da Forja. `K:\_WORKER` aponta para `F:\_WORKER` e não deve ser usado para salvar tokens. `K:\CentralDark` não é owner ativo. `K:\scripts\casa` é lugar do script versionado; dados privados continuam sob perfil Windows.

## Fix incremental, sem criar segundo gravador

Fonte `scripts/casa/screenpipe-continuity.ps1`: modo `Status` (somente leitura), `Install` (somente após health 200 e app nativo unívoco), `Tick` (idempotente, recupera o *mesmo* `screenpipe-app.exe` apenas se 3030 estiver livre e health falhar), `Uninstall` (remove somente a tarefa criada). A tarefa roda no usuário interativo, verifica a cada 5 minutos e nunca usa SYSTEM, repara extensão, extrai token/cookie ou invoca `screenpipe record`. O script **recusa duplicar scheduler** se detectar watchdog Hermes existente ou tarefa correlata. Somente metadata sanitizada é escrita em `%LOCALAPPDATA%\CentralDark\screenpipe-continuity.status.json`.

- **Não instala sozinho com um commit**. Para uso: fazer checkout/sincronização segura do script no `K:\scripts\casa` depois de confirmar owner e worktree; `pwsh -NoProfile -File K:\scripts\casa\screenpipe-continuity.ps1 -Mode Status`; se ausência comprovada de outro watchdog, `pwsh -NoProfile -File K:\scripts\casa\screenpipe-continuity.ps1 -Mode Install`.
- Não sobrescrever `cadeia-free-watchdog.ps1` do Hermes sem ler sua versão real. Não alterar extensão `chrome-extension://...`, storage, token ou configurações de OAuth. Reconexão de browser que exigir nova autorização permanece ação humana explícita.
- **VS Code/ZENDRIVE**: reutilizar `skills/vs-code-restore` e `.agents/skills/centraldark-vscode-log-bridge`, cujo funil já existe; a nova tarefa não duplica CLI, terminal ou logging.

## Critérios de T1/FIXED POINT

1. Casa `Screenpipe Desktop` instância única; PID da 3030 + `/health=200` em duas medições.
2. `/connections/browser/status` com classificação sanitizada; WebSocket `101` e heartbeat verificados sem exibir token quando disponíveis.
3. Task existente identificada; ou tarefa `CentralDark-Screenpipe-Continuity` instalada sem segundo monitor e readback de `UserId`, action, triggers, LastTaskResult.
4. Simular somente queda controlada permitida pelo usuário, depois recovery sem segundo gravador; comprovar novo PID, URL e `/health=200`.
5. Reiniciar sessão do Windows com consentimento e revalidar app, browser e uso do contexto por Hermes/ZenDrive/VS Code; **configurado não é executado**.
6. Não transmitir cookies/credenciais, não criar segundo HUD/brain/forja e não tornar público `3030` além do que o firewall existente já permite. `0.0.0.0` observado exige checagem adicional da exposição real e regras de firewall.

## Estado

`CODE_READY_FOR_REVIEW`; `LOCAL_PERSISTENCE=UNKNOWN`; `BROWSER_WS_LIVE=UNKNOWN`; `CAPTURE_STATE=UNKNOWN`; `REMOTE_TOOL_QUOTA=BLOCKED`. Não promover PASS integral até prova no PC.
