# CentralDark — Cross-Session Reconciliation + OAuth Control + Hermes Speed Fabric

## Missão
Transformar chat/janelas/tasks/Drive/GitHub/CLI em fontes reconciliáveis sem tornar memória de sessão autoridade. O mesmo DELTAUTIL recebe, deduplica, classifica e promove apenas delta material ao owner existente.

## OAuth
`authorization_code` é entrada efêmera para troca no credential plane. Não é access token, refresh token nem token genérico de plugin. Cada app/plugin mantém configuração OAuth própria (client/callback/scopes). HUB mostra botões CONNECT/REAUTHORIZE/REFRESH/TEST/DETAILS/DISABLE/REVOKE, mas segredo bruto nunca vira documentação ou receipt.

## Cross-session
`CURRENT_CHAT | OTHER_CHAT_WINDOWS | PERSONAL_CONTEXT | SCHEDULED_TASKS | DRIVE | GITHUB | LOCAL_CLI | WORKTREE | WEBHOOK`
→ secret scrub → dedupe → history/current/unknown → owner match → rendezvous → reconcile → materiality gate → documentation → receipt.

Histórico útil não é descartado; também não vira estado presente sem re-medição. Projetos esquecidos recebem disposição: CURRENT_ACTIONABLE, HISTORICAL_ONLY, SUPERSEDED, DUPLICATE, BLOCKED, UNKNOWN ou ARCHIVE_CANDIDATE.

## Hermes Speed Fabric
Python assume AST/hash/index/JSON/YAML/grafo/batch. PowerShell 7 assume Windows/processos/serviços/portas/filesystem. `rg`/`fd` entram somente se detectados. Cache usa path+mtime+size+hash+HEAD e acelera descoberta, nunca substitui realidade. Fanout usa K mínimo capaz de produzir o próximo delta discriminante; proibido N agentes relendo o mesmo arquivo.

## Visual
Fastfetch/Btop/Cava/Pipes/Aafire são capacidades opcionais do TUI, estado UNKNOWN até medir instalação. Visual nunca substitui telemetria, prova ou status textual.

## Tarefas
O painel documental pode ingerir tarefas agendadas como fonte de continuidade. Task agendada não prova execução. Snapshot vivo desta cristalização: `CentralDark Status` ativo diariamente.
