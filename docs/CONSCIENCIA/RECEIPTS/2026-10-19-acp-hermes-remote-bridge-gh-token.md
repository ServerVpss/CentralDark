# 🪬 CENTRALDARK — Recibo de continuidade: Hermes ACP, bridge opcional e GH_TOKEN

DATA=2026-10-19
OWNER=ServerVpss/CentralDark
SCOPE=MEMORIA_OPERACIONAL_SANITIZADA
SOURCE=conversa do CHEFE + readback GitHub nesta sessão + verificações anteriores explicitamente distinguidas
STATUS=REGISTRO_DOCUMENTAL_NA_BRANCH
CURRENT_OVER_HISTORY=true
UNKNOWN_NE_PASS=true
REUSE_BEFORE_CREATE=true
NO_PARALLEL_ARCHITECTURE=true
NO_SECRETS_IN_GIT=true

## Índice canônico — recuperar pelo número

| Alvo | Owner existente | Evidência / estado |
| --- | --- | --- |
| ACP Casa/VPS, Tailscale e Desktop Commander opcional | [PR #1867](https://github.com/ServerVpss/CentralDark/pull/1867) | Código-fonte da branch; regressões P1 abertas |
| Zendrive como motor selecionável do Hermes original | [PR #1861](https://github.com/ServerVpss/CentralDark/pull/1861) | Contrato e código em PR; inferência real/handshake ainda não provados |
| Credenciais GitHub e cofre | [Issue #190](https://github.com/ServerVpss/CentralDark/issues/190) | Incidente existente; autenticação GH_TOKEN corrente NÃO marcada como corrigida |
| Contrato executor Hermes | [PR #1829](https://github.com/ServerVpss/CentralDark/pull/1829) | Microação → readback → contraprova → receipt |
| Missão principal Hermes | Kanban `t_8d152ddf` | Estado final precisa readback do Kanban |
| Subtarefa GH_TOKEN | Kanban `t_2fc279d4` | Foto enviada pelo CHEFE mostrava TODO; desvinculação da dependência foi relatada em conversa, não comprovada por readback desta rodada |

## Regra que não deve se perder

```text
CHEFE_INTENT → CENTRALDARK → LIVE_STATE → ALIGNMENT
→ MINIMAL_DELTA → EVIDENCE → COUNTERPROOF → RECEIPT → NEXT_CURSOR

CASA_VPS_PRIVATE_TRANSPORT_PRIORITY=TAILSCALE
CANONICAL_MCP_CONTROL_PLANE=CENTRALDARK_MCP
HERMES_EXECUTOR=ORIGINAL
ACP_CASA=INICIADO_PELO_CHEFE_NO_VSCODE
ACP_VPS=PROCESSO_HERMES_ACP_OBSERVADO_ANTERIORMENTE
ACP_HANDSHAKE_CASA_VPS=UNKNOWN
DESKTOP_COMMANDER_REQUIRED=false
DESKTOP_COMMANDER_DEFAULT_ROUTE=false
DESKTOP_COMMANDER_LEGACY_OPTIONAL=true
SCREENPIPE_SIDECAR_INDEPENDENT_FROM_DESKTOP_COMMANDER=true
NO_PARALLEL_BRIDGE=true
```

O contrato canônico anterior está em `docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md` (decisão de 08/10/2026). A configuração existente `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json` define `legacy_remote_enabled_by_default=false`.

### PR #1867 — alteração e contraprova necessária

HEAD de origem observado: `b93d7860af5dbf4e22945baa04283ab98549c55a`.

A alteração em `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` introduziu `-EnableLegacyRemote` e condicionou a inicialização do Desktop Commander. **Isto não é prova de instalação/deploy.**

Revisão Codex detectou duas regressões **P1** ainda sem correção confirmada:
1. [P1 Screenpipe](https://github.com/ServerVpss/CentralDark/pull/1867#discussion_r4314213062): `return` antecipado desliga também a inicialização do sidecar Screenpipe; manter sidecar independente do Desktop Commander.
2. [P1 rastreabilidade](https://github.com/ServerVpss/CentralDark/pull/1867#discussion_r4314213074): falta `#OBSERVACOES#` no script e atualização substancial do documento canônico, conforme AGENTS.md.

**Aceitação:** Desktop Commander desabilitado por padrão, sem bloquear Tailscale/MCP/Hermes ACP; sidecar Screenpipe permanece funcional; opt-in legado preservado; PowerShell parse/teste negativo/positivo; revisão no mesmo HEAD; não promover sem contraprova.

### GH_TOKEN — receita existente, sem valores

A Issue #190 já cobre cofre, GitHub PAT e aliases de runtime. No histórico da sessão foi citada a receita `/root/secrets/GITHUB_TOKEN` → `secrets/github-read-askpass.sh`, mas a existência/validade CURRENT desses itens não foi comprovada nesta rodada.

Foi observado anteriormente `gh auth status` com `GH_TOKEN` inválido. A tentativa posterior de inspecionar o segredo por shell foi bloqueada pela política do executor. **Não afirmar que o token foi corrigido, rotacionado ou persistido.**

Critério de aceitação: usar o cofre já autorizado, sem expor/copiar o valor em chat, Git, log ou receipt; confirmar `gh auth status` no contexto efetivo do Hermes; registrar somente status, owner e timestamp. Não gerar token novo nem criar outro cofre sem necessidade comprovada.

### Incidente Elite Gateway — não misturar causas

A conversa anterior registrou alerta HTTP 000 em `:8080`, ausência de listener também em `:8099`, com MCP `:9100` e Hermes `:9900` respondendo. Foi identificado boot da VPS em 19/10/2026 09:57 UTC. **Hipótese:** falta de inicialização persistente após boot; causalidade de alteração de secrets permanece UNKNOWN. A queda do gateway e o `GH_TOKEN` inválido são incidentes distintos até prova de vínculo.

## Leis de continuidade

- `DOCUMENTED != EXECUTED`
- `SOURCE_CHANGED != INSTALLED != DEPLOYED`
- `ACP_PROCESS_ACTIVE != ACP_HANDSHAKE_PROVEN`
- `GH_AUTH_INVALID != GATEWAY_CAUSE_PROVEN`
- `DELEGATION_IS_NOT_PROOF`
- `FAIL_LOCAL != BLOCK_GLOBAL`
- `REPEATED_RESEARCH_FORBIDDEN`: recuperar este receipt e os owners acima antes de nova pesquisa genérica.
- Atualizar a ferida existente, sem issue, executor, banco, fila ou bridge paralelos.

## NEXT_CURSOR

`PR1867_FIX_P1_SCREENPIPE_AND_DOCS → PR1867_TEST_WINDOWS_SAME_HEAD → ACP_CASA_VPS_CORRELATED_HANDSHAKE → KANBAN_t_2fc279d4_GH_AUTH_READBACK → KANBAN_t_8d152ddf_CONTINUE → ELITE_8080_BOOT_OWNER_CAUSAL_CHECK`

**Não declarar FIXED_POINT antes das contraprovas.** Este receipt é memória versionada na branch da PR #1867; não afirma que entrou na `main`.


<!-- CENTRALDARK_CASA_ROTAS_REGRESSIVAS_20261020 -->
## 🔎 Atualização de 20/10/2026 — rotas alternativas para atualizar a Casa sem Desktop Commander

**Intenção reiterada pelo CHEFE:** localizar as rotas existentes entre conversas, GitHub, VPS e MCP e atualizar **somente o delta** do cartão `Continuidade do Hermes + Auto Sync + Biblioteca` do PR [#1879](https://github.com/ServerVpss/CentralDark/pull/1879) no Windows `K:\`, sem sobrescrever alterações locais. Este registro **não** representa aplicação na Casa.

| Rota recuperada | Evidência e tempo | Capacidade comprovada / limite |
| --- | --- | --- |
| Tailscale (VPS ↔ Casa SEGREDO) | `tailscale_bridge_status`, medição em 20/10: `backend_state=Running`, `home.online=true`, `rdp_3389=OPEN`, `ssh_22=CLOSED_OR_FILTERED` | **PASS de rede**, não é prova de autenticação Windows, shell nem escrita em `K:\`. |
| WinRM / PowerShell Remoting `5985` | `docs/LEMBRANCAS/network-ports-git-routes-20261019.md`, inventário histórico datado | **CANDIDATO** a leitura e patch seletivo. Sem autenticação/remoting atual comprovado. |
| SMB `445` | Mesmo inventário Windows de 19/10 | **CANDIDATO** a leitura/escrita autenticada; compartilhamento e ACL atuais não medidos. |
| Hermes ACP (VS Code Casa/VPS) | Este receipt, bridge existente e PR #1867 | **CONTRATO / EVIDÊNCIA HISTÓRICA**. Handshake Casa↔VPS e execução no workspace Windows ainda não provados. Desktop Commander legado é opcional. |
| GitHub Actions Windows self-hosted | `.github/workflows/centraldark-desktop-windows-installer.yml` e `.github/workflows/node24-lockfile-candidate.yml` usam `[self-hosted,Windows,X64]` | **WORKFLOW DEFINIDO**, não prova runner online na Casa, acesso a `K:\` ou autorização para patch. `inventario-casa.yml` roda em Linux, não é execução na Casa. |
| CAS Cloud / CodeAgentSwarm | `docs/ARQUITETURA/CENTRALDARK-CAS-CLOUD-VPS.md` | Casa→agentes na VPS documentado; **não** prova VPS→escrita na Casa. |
| Screenpipe `3030` | PR #1877 documenta `health` Casa via Tailscale em 20/10; `screenpipe_status` não estava disponível no catálogo desta sessão | Sensor/observação, **não** ferramenta de escrita. |
| GitHub PR #1879 | Branch do código e comentário operacional [#6289332229](https://github.com/ServerVpss/CentralDark/pull/1879#issuecomment-6289332229) | **CÓDIGO PRESERVADO**; branch não equivale a atualização local nem deploy. |
| CentralDark MCP `execute_command` | Chamada diagnóstica em 20/10 retornou `CONFIRMACAO_ADMIN_NECESSARIA` **sem executar**; reconciliador informou ferramentas destrutivas esperadas 12 / atuais 20 | **BLOCKED por guard**; nenhuma confirmação deve ser sintetizada ou bypassada. Não tratar isso como WinRM acessível. |
| Desktop Commander remoto | Cota mensal esgotada, reportada anteriormente | **NÃO REUTILIZAR** nessa missão. |

**Prioridade para executar quando a capability existir:** provar sessão **WinRM autenticada e restrita** no peer SEGREDO; caso não esteja disponível, verificar **runner Windows efetivamente vinculado à Casa** ou **ACP Hermes com handshake e filesystem**. Em qualquer rota: `READ K:\ + STATUS GIT / HASH DOS DOIS OWNERS → DIFF MINIMO → PATCH SEM SUBSTITUIR ALTERACOES DE OUTRO WRITER → BUILD → PROVA LOCAL / RECIBO`.

**Owners a preservar:** `apps/instinto-superior/src/components/central/AutoSyncButton.tsx` e `CockpitShell.tsx`. Não usar `git reset --hard`, checkout forçado, sync cego ou novo agente/túnel/daemon. **Estado:** `CASA_NETWORK=PASS`, `WIN_AUTH_SHELL=UNKNOWN`, `CASA_FILES_PATCHED=NO`, `BUILD_CASA=NOT_RUN`, `VISUAL_READBACK=UNKNOWN`. `NEXT_CURSOR=PROVE_AUTHENTICATED_CASA_ROUTE → PRESERVE_LOCAL_DIFF → APPLY_MINIMAL_DELTA → BUILD → PROOF`.

**Observação:** resultados históricos e flags de código não são medições atuais. Esta seção complementa os recibos anteriores sem reescrever sua proveniência.
<!-- /CENTRALDARK_CASA_ROTAS_REGRESSIVAS_20261020 -->
