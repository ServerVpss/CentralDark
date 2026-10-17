# 🪬 CentralDark — Receita canônica: Desktop Commander → MCP Audit → Tool Call Lens → Instinto Superior

> Data de registro: 2026-10-17. Tipo: **receita + matriz de owners + handoff + critérios de prova**.
> Escopo: PR **#1842** (ZENDRIVE/MCP), PR **#1838** (visual Instinto Superior).
> Objetivo do CHEFE: ver dentro da casca CentralDark o histórico e estado de **todas as chamadas capturáveis** dos executores, reaproveitando a infraestrutura existente, sem criar outro núcleo. Cada PID/saída/resultado deve ter origem e fronteira explícitas.
> Regra: **CURRENT > HISTORY; REUSE_BEFORE_CREATE; ONE_SYSTEM_ONLY; MERGED != DEPLOYED; UNKNOWN != PASS.**
> Autorização deste registro: documentar e commitar em PRs existentes; NÃO fazer merge, reiniciar serviços da VPS, instalar extensão ou publicar sem readback/decisão posterior.

## 1. A descoberta (ordem dos fatos)

1. O CHEFE exibiu no VS Code/Codex blocos reais de chamada de ferramenta: `start_process` retornou **PID 16424**, `shell: powershell.exe`, saída inicial `NODE_MODULES=True`, `LOCAL_GALLERY=True`, `LOCAL_AUTH=True`, `PACKAGE=True`, `VPS_PROBE`.
2. Uma chamada posterior `read_process_output({"pid":16424,"timeout_ms":3000})` devolveu `VPS_ONLINE`, `57e06f2d5`, `DEPS_YES`, `active` e `Process completed with exit code 0 (runtime: 3.83s)`. Essas linhas são **resultado daquela sessão**, não health universal nem confirmação de estado atual da VPS.
3. O evento exibiu metadados do broker externo (`transport=broadcast_v1`, `dispatch_device_status=online`, `dispatch_last_seen_age_ms`); estes campos descrevem o roteamento **Remote Desktop Commander**, não o protocolo do MCP CentralDark.
4. O CHEFE apresentou também processos PowerShell/VS Code e pediu correlação por PID; a extensão `skills/vs-code-restore` (ZENDRIVE 0.1.4 em PR #1842) incorporou leitura de cadeia pai/filho e janelas existentes, mas o PID de screenshot é **volátil**.
5. Garimpo via GitHub e consulta de diretório de `project` na VPS revelou um checkout CentralDark com `apps/`, `infra/`, `skills/`. O conteúdo inspecionado inclui serviços systemd declarativos do Desktop Commander. **Os arquivos efetivamente instalados em `/etc`, `/run` ou no HOME não foram enumerados por estas leituras; não confundir configuração do Git com serviço vivo.**
6. No mesmo código MCP já existiam `auditToolExecution`, `subscribeAuditEvents`, `pushAdminLog`, `/admin/logs/stream`, `/admin/api/logs` e o contrato Tool Call Lens em `apps/modulos/mcp/docs/ARQUITETURA.md`. Reaproveitar é menor delta.
7. Implementação no código em PR #1842: projeção de metadados da auditoria no SSE/Admin protegido e um painel na aba de Auditoria com **Ao vivo / Pausar visão / Rever últimos / PASS-FAIL**.
8. Implementação visual em PR #1838: `ToolCallLensMcp` dentro de `ObservabilidadeCentralDark.tsx`, **Ao vivo (consulta 5 s) / Pausar / Rever-Atualizar / Recolher / PASS-FAIL**, usando o `GET /admin/api/logs` já existente.
9. Esta receita liga as duas metades e registra também a diferença essencial: **chamadas Remote Desktop Commander invocadas diretamente pelo ChatGPT não atravessam automaticamente o audit logger do MCP CentralDark**.

## 2. Mapa das cascas/owners sem concorrência

| Camada | Owner real | Responsabilidade | Onde | Estado que a evidência suporta |
|---|---|---|---|---|
| ChatGPT/Codex/Hermes | Cliente originador | Descobrir tool, disparar a request e mostrar retorno | Cliente externo | Capturas fornecidas pelo CHEFE |
| Remote Desktop Commander (terceiro) | Pacote `@wonderwhy-er/desktop-commander` | Device agent local/remote, sessões, processo e leitura incremental | Device autorizado | Implementação/documentação pública do pacote; não é código do MCP CentralDark |
| Perfil principal VPS | `infra/systemd/centraldark-desktop-commander.service` | `principal` com HOME `/root` | Repo `/root/CentralDark` | SOURCE_PRESENT |
| Conta 2 VPS | `infra/systemd/centraldark-desktop-commander-conta2.service` | `conta2` com HOME `/root/.desktop-commander-profiles/conta2` | Mesmo repo | SOURCE_PRESENT |
| Perfis escaláveis | `infra/systemd/centraldark-desktop-commander-profile@.service` | Uma unidade por perfil | systemd, quando instalada | SOURCE_PRESENT |
| Runner | `infra/systemd/centraldark-desktop-commander-profile.sh` | `npx -y @wonderwhy-er/desktop-commander@0.2.48 remote`, lock por perfil | Source; destino previsto `/usr/local/sbin` | SOURCE_PRESENT; versão de runtime não medida |
| Watchdog | `infra/systemd/centraldark-desktop-commander-watchdog.sh` | Cgroup, MainPID, processos, AUTH_PENDING, restart controlado | Source; logs previstos em `/var/log` | SOURCE_PRESENT; estado atual exige `systemctl`/journal |
| Extensão nativa | `skills/vs-code-restore` | ZENDRIVE PID↔VS Code, SSH/Remote-SSH e catálogo | VS Code da Casa após instalar VSIX | SOURCE_ONLY_UNTIL_INSTALLED |
| Execução MCP CentralDark | `apps/modulos/mcp/src/mcp-server.js` | Processar `tools/call`, chamar owner/handler, auditar | MCP principal | SOURCE_PRESENT |
| Auditoria e sanitização | `apps/modulos/mcp/src/audit-logger.js` | Envelope `centraldark.mcp.tool-call.v1`, assinantes, trilha JSONL | MCP principal | SOURCE_PRESENT |
| Buffer e SSE Admin | `apps/modulos/mcp/src/admin.js` | `pushAdminLog`, `/admin/logs/stream`, `/admin/api/logs`, Tool Call Lens | MCP Admin | DELTA_IN_PR_1842 |
| CORS de leitura Admin | `apps/modulos/mcp/src/index.js` | Leitura autenticada de logs/metricas a partir do origin aprovado | MCP API | DELTA_IN_PR_1842 |
| HUD visual | `apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx` | Projeção de chamadas sem segundo coletor | Cockpit → Admin → Observabilidade | DELTA_IN_PR_1838 |
| Notificações gerais | `apps/instinto-superior/src/components/central/CentralNotificacoes.tsx` / `useNotificationsLog.ts` | Ledger `notifications_log` e Realtime do produto | Admin CentralDark | OWNER_EXISTENTE; não substituir pelo Tool Call Lens |
| Histórico Hermes/VPS | `apps/modulos/mcp/src/agent-observability.js`, `log-funnel.js` | Ingere logs permitidos dos agentes e persiste eventos | MCP e log canônico | OWNER_EXISTENTE; correlacionar, não copiar tudo |

### Endereços distintos

- **Checkout**: `/root/CentralDark`. O uso de `/root` como HOME é configurado nos services; não é o caminho de checkout inteiro.
- **Binário instalado esperado**: `/usr/local/sbin/centraldark-desktop-commander-profile.sh`.
- **Unidades instaladas esperadas**: `/etc/systemd/system/centraldark-desktop-commander*.service`.
- **Locks**: `/run/centraldark-desktop-commander-<perfil>.lock`.
- **Perfis**: HOME principal `/root`, HOME conta2 `/root/.desktop-commander-profiles/conta2`.
- **Repo UI**: `apps/instinto-superior`, não um novo cockpit.
- **Escavação VPS realizada nesta sessão**: listagem controlada sob root lógico `project` e inspeção de arquivos do GitHub, NÃO varredura física irrestrita em todo `/`.

## 3. Dois trajetos; nunca confundir

### A) Invocação externa do Desktop Commander — o que aparece nos prints

```text
CHEFE → cliente ChatGPT/Codex → serviço Remote MCP do terceiro
  → device agent na Casa/VPS
  → start_process(command) → CHILD_PID + saída inicial + estado
  → read_process_output(CHILD_PID) → novas linhas + exit code
  → cliente mostra os blocos; correlação usa device/session/child PID
```

Não prometer que `CHILD_PID` vem do audit local: este canal é externo ao MCP CentralDark.

### B) Tool do próprio MCP CentralDark — captada automaticamente

```text
MCP CentralDark tools/call
  → mcp-server.js / handler existente
  → auditToolExecution() → audit-logger.js
  → subscribeAuditEvents() em admin.js
  → pushAdminLog("mcp_tool_call", whitelist dos metadados)
  → LOG_BUFFER (até 2000 linhas; reinício apaga o buffer)
  ├─ SSE GET /admin/logs/stream (admin autenticado)
  └─ GET /admin/api/logs?q=mcp_tool_call&limit=100 (admin autenticado)
       ├─ painel original /admin → Auditoria → Tool Call Lens
       └─ Cockpit autenticado → Admin CentralDark → Observabilidade → Tool Call Lens
```

No `admin.js`, somente os campos `source`, `toolName`, `call_id`, `correlation_id`, `mission_id`, `mcp_host_pid`, `exitCode`, `durationMs`, `status`, `ended_at` transitam no buffer novo; nunca passar `input`, `result`, stdout, stderr, cookies ou tokens no Lens. `mcp_host_pid` **não** é o PID do processo-filho PowerShell; é o PID do servidor MCP que auditou a chamada.

### Persistência e controle visual

- O Admin /admin abre uma conexão SSE; o botão **Pausar visão** congela a renderização, não pausa processos; **Rever últimos** apenas reapresenta o buffer em memória.
- O Cockpit consulta GET de logs a cada 5s enquanto está **Ao vivo**; **Pausar** desativa o polling; **Rever/Atualizar** força outra leitura dos mesmos registros; não retransmite comando.
- Filtros PASS/FAIL atuam sobre eventos de `mcp_tool_call`. Um FAIL de `tools/call` não implica que o processo remoto ou a infraestrutura inteira esteja offline.
- LOG_BUFFER retém até 2000 eventos desde o último restart do MCP e SSE reenvia o último lote; auditoria persistente é do `audit-logger.js` (arquivos com proteção própria). Não afirmar replay de todos os dias/sessões a partir do buffer atual.

## 4. Receita determinística de verificação — SOMENTE LEITURA

### Fase A — versionamento de cada escopo

```bash
git -C /root/CentralDark status --short --branch
git -C /root/CentralDark rev-parse HEAD
```

Comparar com HEAD dos PRs **#1842** e **#1838** no GitHub. O source na PR não implica que o checkout VPS tenha recebido esses commits.

### Fase B — mapa do Remote Device na VPS

```bash
systemctl show centraldark-desktop-commander.service -p LoadState -p ActiveState -p MainPID -p ControlGroup
systemctl show centraldark-desktop-commander-conta2.service -p LoadState -p ActiveState -p MainPID -p ControlGroup
systemctl is-active centraldark-desktop-commander-watchdog.timer
systemctl is-active centraldark-desktop-commander-conta2-watchdog.timer
journalctl -u centraldark-desktop-commander.service -n 30 --no-pager
journalctl -u centraldark-desktop-commander-conta2.service -n 30 --no-pager
```

Inspecionar os **estados**, não exportar credenciais; confirmar separadamente `SERVICE_ACTIVE`, `DEVICE_READY`, `AUTH_PENDING`, `TWO_DEVICE_READY_PROFILES`. O watchdog também distingue PID principal dentro do cgroup de cópias concorrentes fora dele.

### Fase C — contrato do MCP após atualização autorizada

```bash
cd /root/CentralDark
node --check apps/modulos/mcp/src/admin.js
node --check apps/modulos/mcp/src/index.js
node --test apps/modulos/mcp/tests/tool-call-observability.test.mjs
```

Verificar ambos os resultados `exit code 0` e exibir quais testes rodaram. `Node` local/CI na branch pode executar esses testes sem publicar; o código de runtime antigo da VPS não ganha a mudança só porque o teste local passou.

### Fase D — autenticação e canal, no próprio navegador autorizado

1. Com sessão de Admin MCP existente, abrir `https://api.centralldark.com/admin`; localizar **Auditoria → Tool Call Lens** depois do código atualizado.
2. Consultar `GET /admin/api/logs?q=mcp_tool_call&limit=100` no mesmo contexto autorizado: sem sessão deve falhar como autenticação exigida; com sessão válida a resposta deve ter `logs` (que pode ser vazio).
3. Observar **uma chamada inofensiva e autorizada à tool do próprio MCP CentralDark**, pela conexão já existente; ela deve produzir `mcp_tool_call` com `source=MCP_AUDIT`/CID correspondente. Não usar ações administrativas ou destrutivas para testar telemetria.
4. Testar **Ao vivo → Pausar → Rever → Retomar**, filtro PASS/FAIL e ausência de args/segredos no DOM.
5. Abrir `https://admin.centralldark.com` → Instinto Superior → Admin CentralDark → Observabilidade: mesma chamada deve surgir na projeção. Com falha 401/CORS, exibir erro e diagnosticar sessão/origin/SameSite, não inventar sucesso.
6. Conferir que `Ctrl+Shift+P` na extensão ZENDRIVE instalada da Casa mostra o localizador por PID e que observa um PID **ainda vivo**. Isso é teste separado do serviço da VPS.

### Fase E — build e superfície do Instinto Superior

```bash
cd apps/instinto-superior
npm run verify:hud
npm run build
```

Conferir resultado do TypeScript/build e exibição no viewport do Cockpit; testar mobile/desktop, quatro peles, autenticação Admin, pausa e replay visual. Não reiniciar o servidor local da Casa antes de comparar diff/processo existente.

## 5. Gates discriminantes de aceitação

| Critério | Como provar | Leitura na abertura deste receipt |
|---|---|---|
| D01 owners VPS em source | services, runner, watchdog no Git | SOURCE_PRESENT |
| D02 dois perfis isolados | configuração HOME distinta | SOURCE_PRESENT |
| D03 serviços atuais ativos | systemctl/cgroup readback agora | NÃO MEDIDO AQUI |
| D04 profiles realmente autenticados | logs `Device ready` por conta | NÃO MEDIDO AQUI |
| D05 retorno externo `start_process/read_process_output` | captura PID 16424/exit 0 | HISTÓRICO OBSERVADO |
| D06 tool auditada atravessa subscriber MCP | teste + chamada e recepção | SOURCE_COMMITTED / RUNTIME PENDENTE |
| D07 stream Admin atualiza sem reexecução | DevTools/network SSE após deploy | SOURCE_COMMITTED / RUNTIME PENDENTE |
| D08 endpoint GET logs autentica | 401 sem cookie, 200 com cookie | PENDENTE |
| D09 CORS permitido por origin | GET credenciado origin admin | SOURCE_COMMITTED / PENDENTE |
| D10 Cockpit usa mesmo owner | `ObservabilidadeCentralDark.tsx` PR #1838 | SOURCE_COMMITTED |
| D11 nenhuma tela/rota paralela | inspeção dos arquivos alterados | SOURCE_DESIGN |
| D12 regressão das 4 peles + build | CI same SHA + render | PENDENTE |
| D13 Desktop Commander externo aparece no Lens | adapter de cliente + recibo | **NÃO IMPLEMENTADO** |
| D14 replay histórico persistente completo | owner de auditoria persistente com busca | **NÃO IMPLEMENTADO no widget** |
| D15 merge/main/VPS atualizados | SHA + workflow + processo | NÃO DECLARADO |

**Próximo Cursor:** CI em #1842 e #1838 nos HEADs exatos → readback autenticado local (código MCP antes do visual) → evidência de um `call_id` real → opcionalmente planejar adaptador de cliente do Remote Desktop Commander. Não iniciar outro executor/gateway.

## 6. Manutenção, concorrência e rollback

- **Um writer por owner**: código `apps/modulos/mcp` pertence ao PR #1842; UI `apps/instinto-superior` pertence ao PR #1838. Evitar edições concorrentes no mesmo arquivo. O handoff é esta receita.
- O endpoint do Lens é **READ**; não criar comando `start_process` na rota de observabilidade; não usar GET para mutação.
- O CORS de `src/index.js` afeta apenas GET de `/admin/api/logs` e `/admin/api/metricas` de `https://admin.centralldark.com` (e configuração explícita de origens). `isAdmin(req)` continua protegendo o recurso. Não confundir autorização do browser com a do MCP.
- Se a origem cross-site não apresentar cookie autorizado, diagnosticar política de cookies/headers/forma de acesso antes de propor novo proxy. O CORS sozinho **não cria login**.
- Para desfazer somente esta funcionalidade: reverter o delta de `subscribeAuditEvents`/Tool Call Lens em `admin.js`, a exceção de CORS de leitura em `index.js`, e `ToolCallLensMcp` da UI — **sem** alterar o Remote Device de terceiro, as unidades systemd ou o audit logger original.
- Não fazer `git reset`, `clean`, `force push`, `systemctl restart` nem microdeploy como parte da captura de evidências.

## 7. Fontes e documentos irmãos

- Documentação pública do Desktop Commander: https://www.npmjs.com/package/@wonderwhy-er/desktop-commander (Remote MCP, sessão e ferramentas de processo).
- Especificação pública MCP `tools/call`, resultados, anotações: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- Arquitetura canônica da VPS/bridge: `infra/systemd/README.md` e `docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md`.
- Contrato de auditoria: `apps/modulos/mcp/docs/ARQUITETURA.md` §8.
- Teste existente e ampliação: `apps/modulos/mcp/tests/tool-call-observability.test.mjs`.
- PR de backend: https://github.com/ServerVpss/CentralDark/pull/1842
- PR de frontend: https://github.com/ServerVpss/CentralDark/pull/1838

**Contrato congelado:** `DESKTOP_COMMANDER_EXTERNAL != MCP_NATIVE_AUDIT`. O Cockpit é projeção da CentralDark. O histórico é memória. O recibo e o readback são o juiz.


## 8. 🧬 GAVETA DO INSTINTO — Forja em quatro fases (17/10/2026)

**O CHEFE pediu que a receita ficasse numa gaveta do próprio Instinto Superior,
não em outro executor.** Em PR **#1838**, o owner
`apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx`
já implementava `GavetaForja`: busca alfabética, seleção de receita,
owner, copiar receita e seis gavetas de memória. Reutilizamos a mesma
`automation_owners` no catálogo `forja-gaveta.snapshot.json`
(com um novo registro, `TOOL_CALL_LENS`, décima receita) e mantivemos
as 999 skills originais e os seis setores. Não criar uma página/serviço
paralelo.

**Onde abrir:** Instinto Superior → Infraestrutura / HUD → GavetaForja →
Automações → buscar **Tool Call Lens**. Ao selecionar, mostra quatro
cartões com owner, gate, estado e critério. O botão existente
**Copiar receita · não executar** continua o handoff ao Hermes/terminal.

**Receita real no owner ZENDRIVE** (PR #1842):

```powershell
pwsh -NoProfile -File 'K:\skills\vs-code-restore\tools\forja-tool-call-lens-4-fases.ps1'
```

Executa, em sequência, apenas na Casa, quando o CHEFE/operador invocar:
1. **CONSTRUIR:** bloqueia se arquivos/versões da receita dos PRs
   #1838/#1842 não estiverem presentes no K; verifica Node/MCP
   (`node --check`, `node --test`), compila ZENDRIVE, empacota VSIX,
   verifica HUD e faz build do Cockpit.
2. **INSTALAR:** instala VSIX **local** no VS Code existente via
   `code --install-extension`, confirma `@0.1.4` por readback.
   `-NoInstall` permite rodar somente a primeira etapa sem instalar.
3. **CONECTAR:** valida SSH pelo alias existente `segredo-vpss`
   (`BatchMode`, host key strict) e GET local `127.0.0.1:3000`.
   **Não** altera SSH/Tailscale, VPS, ACL nem faz microdeploy.
4. **PROVAR:** o script exige `call_id` real do mesmo fluxo em
   MCP Admin e Cockpit. Sem sessão de browser autenticada/adapter de
   origem externa, fecha o gate com `E2E_TOOL_CALL_NOT_MEASURED`;
   **não inventa verde**. O operador usa o painel existente para
   conferir o call_id; a automação local foi até o limite de acesso.

**Recibo determinístico:** arquivo JSON isolado em
`%TEMP%\CentralDark-Forja-Lens\toolcall-lens-AAAAMMDD-HHMMSS.json`,
com timestamps UTC, nomes de fases, estado PASS/BLOCKED, motivo e
`published=false`. Não sobrescreve o HUD ou o histórico. O script
retorna **exit 3** se não fechar todas as fases; nenhuma ação
de GitHub merge/VPS deploy incluída.

**Contratos antirregressão:** o teste do HUD verifica `TOOL_CALL_LENS`,
os quatro IDs das etapas, owner de auditoria, botão e o total de dez
receitas; o teste MCP verifica que a assinatura do audit subscriber
conserva apenas metadados de ferramentas. Checks do GitHub precisam
ser do HEAD corrente do PR; jobs skipped/pending não viram PASS.
Documentação GitHub: https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks.
Empacotamento VSIX oficial: https://code.visualstudio.com/api/working-with-extensions/publishing-extension.

**Snapshot x runtime:** catálogo `forja-gaveta.snapshot.json` mantém
`source.sha` da árvore original; o novo registro é rotulado
`SOURCE_PR_1842_E_1838`, pois ainda não foi medido no runtime
publicado. Cabem na mesma gaveta sem forçar contagem histórica
atualizada dos arquivos de skills.

**NEXT:** rodar CI exato dos dois HEADs; atualizar source nas worktrees
da Casa com owner/um writer; disparar a receita na Casa; observar
`call_id` no mesmo HUD; fechar critério E2E; só então avaliar
microdeploy/promoção autorizada. 


## 9. REGISTRA — FIX POINT de documentação / recibo da escavação (17/10/2026)

**Missão do CHEFE:** registrar todo o fio público e privado da exploração do Desktop Commander, com recibo reproduzível e owners, sem criar segundo executor, sem perder a organização do Cockpit.

### Linha de observação e atribuição

| Sinal / achado | Fonte exata | Classificação |
|---|---|---|
| Ferramentas `start_process`, `read_process_output`, `interact_with_process` e `list_sessions` | Projeto público `wonderwhy-er/DesktopCommanderMCP`, `src/server.ts`; documentação de skills pública | PROTOCOLO_DOCUMENTADO |
| `start_process` cria sessão/retorna PID, podendo entregar saída inicial | Descrição pública da tool e captura fornecida pelo CHEFE | DOCUMENTADO + CAPTURA_EXTERNA |
| `read_process_output` recebe PID, `offset`, `length` e timeout; permite leitura incremental/últimas linhas | `src/server.ts` oficial e exemplos públicos da skill | PROTOCOLO_DOCUMENTADO |
| Screenshot: PID 16424, `NODE_MODULES=True`, `LOCAL_GALLERY=True`, `LOCAL_AUTH=True`, `PACKAGE=True`, `VPS_ONLINE`, `DEPS_YES`, `active`, exit 0 | Saída de ferramenta compartilhada na conversa pelo CHEFE | EVIDENCIA_DA_SESSAO_EXTERNA; não importada automaticamente no MCP |
| Diretório Git da VPS: `/root/CentralDark` | `vps_list_dir_safe(root=project)`, leitura atual de `infra/systemd` e GitHub | SOURCE_INSPECTED |
| Principal: `centraldark-desktop-commander.service`, `User=root`, `WorkingDirectory=/root/CentralDark` | `infra/systemd/centraldark-desktop-commander.service` | OWNER_SOURCE |
| Conta 2: `centraldark-desktop-commander-conta2.service`, HOME separado | `infra/systemd/centraldark-desktop-commander-conta2.service` | OWNER_SOURCE |
| Script `centraldark-desktop-commander-profile.sh` roda pacote `@wonderwhy-er/desktop-commander@0.2.48` em modo `remote`; `flock` por perfil | `infra/systemd/centraldark-desktop-commander-profile.sh` | OWNER_SOURCE |
| Watchdog monitora `MainPID`, cgroup, log e autorização; diferencia `AUTH_PENDING`, `UNHEALTHY`, `READY` | `infra/systemd/centraldark-desktop-commander-watchdog.sh` | OWNER_SOURCE |
| `auditToolExecution` emite envelope `centraldark.mcp.tool-call.v1` com `call_id`, `correlation_id`, tempo e resultado | `apps/modulos/mcp/src/audit-logger.js` | OWNER_SOURCE |
| `subscribeAuditEvents` alimenta `pushAdminLog` com whitelist de metadados | PR #1842, `apps/modulos/mcp/src/admin.js` | SOURCE_COMMITTED |
| Admin SSE `/admin/logs/stream`: controles **Ao vivo**, **Pausar visão**, **Rever últimos**, **PASS/FAIL** | PR #1842, mesmo arquivo `admin.js` | SOURCE_COMMITTED |
| Cockpit → Admin → Observabilidade → Tool Call Lens | PR #1838, `apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx` | SOURCE_COMMITTED |
| GavetaForja, receita `TOOL_CALL_LENS` em quatro gates | PR #1838, `InfraestruturaSistema.tsx`, `forja-gaveta.snapshot.json` | SOURCE_COMMITTED |
| Script local e teste de regressão | PR #1842, `skills/vs-code-restore/tools/forja-tool-call-lens-4-fases.ps1`, `apps/modulos/mcp/tests/tool-call-observability.test.mjs` | SOURCE_COMMITTED |
| VPS checkout observado `main`, HEAD `6b1105bce` e arquivos untracked | `vps_git_status` retornado durante a escavação | SNAPSHOT_DA_LEITURA; não inferir runtime dos PRs |

### Exatamente o que projetar no Cockpit

```text
[HERMES / CODEX / CHATGPT]
     └── tools/call ao MCP CentralDark
           └── auditToolExecution (owner do fato)
                ├── call_id / correlation_id / mission_id
                ├── toolName / status / durationMs
                └── exitCode / mcp_host_pid
                     └── subscribeAuditEvents
                          └── Admin LOG_BUFFER (SSE autenticado)
                               ├── Admin /admin → Tool Call Lens
                               └── Instinto Superior → Observabilidade

[DESKTOP COMMANDER REMOTO externo]
     └── start_process → PID de sessão
          └── read_process_output → linhas/estado/exit
               └── ADAPTADOR DE CAPTURA DO CLIENTE AINDA PENDENTE
                    └── somente após vínculo por recibo,
                         disponibilizar no mesmo Lens
```

**Contrato de limites:** `mcp_host_pid` não é PID de PowerShell remoto. Uma chamada `start_process` mostrada na UI do ChatGPT não atravessa necessariamente o MCP CentralDark. O botão **Pausar visão** não interrompe processo; **Rever** não reexecuta comandos. A janela Admin SSE tem buffer rotativo em memória, não arquivo infinito de stdout; para replay permanente usar trilha de auditoria protegida com owner e autorização existentes.

**Não duplicar:** reutilizar `audit-logger.js`, `admin.js`, `/admin/logs/stream`, `ObservabilidadeCentralDark.tsx`, `GavetaForja`, shell/skill da ZENDRIVE, serviços systemd de perfis e watchdog. Evitar segundo gateway, segunda fonte da verdade, novo executor ou scraper de UI tratado como recibo.

### Próximo cursor verificável

1. Medir os checks exatos do HEAD atual dos PRs #1842 e #1838.
2. Rodar `node --check`, teste MCP e `npm run verify:hud && npm run build` na worktree/Forja autorizada, sem sobrescrever alterações concorrentes.
3. Rodar a receita de quatro gates no `K:\` e registrar JSON da execução.
4. Correlacionar um `call_id` real no Admin e no Cockpit autenticados.
5. Para capturar o Desktop Commander remoto **fora** do MCP CentralDark, primeiro definir adapter do lado do cliente autorizado que preserve `device`, `session`, `pid`, `call_id`, `offset`, `exitCode` e timestamp sem expor payload sensível. Nenhum adapter externo novo foi inferido.
6. Preservar PRs separados por escopo; só promover após aceite do CHEFE.

**RESULTADO DESTA RODADA:** `RECEITA_REGISTRADA_NO_PR`. Isso é um FIX POINT **documental**; gates de runtime são discriminados no §5, sem substituir seus readbacks.
