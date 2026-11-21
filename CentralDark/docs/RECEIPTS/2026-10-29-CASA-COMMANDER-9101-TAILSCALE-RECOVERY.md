# CentralDark Casa Commander — recuperação local pela Tailscale (2026-10-29)

## Intenção
Preservar o método comprovado para voltar a acessar a Casa pelo serviço existente, sem site público, sem conector GitHub do ChatGPT e sem criar outro executor.

## Owners reutilizados
- Código: `scripts/remote-bridge/canonical/CentralDark-Casa-Agent.mjs`.
- Instalação local existente: `%LOCALAPPDATA%\CentralDark\Casa-Commander\`.
- Launcher existente: `Launch-Casa-Commander.ps1`; ele lê segredo DPAPI local e chama `CentralDark-Remote-Bridge.ps1`.
- Git local: `K:\`, origin `ServerVpss/CentralDark`.

## Rota comprovada
- Tailscale Casa: `100.123.93.25`.
- Tailscale Serve já configurado: `100.123.93.25:9100 -> 127.0.0.1:9101` (tailnet privada).
- `GET http://127.0.0.1:9101/health` retornou `ok=true`, `name=CentralDark Casa Commander`, `remote_vendor=false`.
- Após a chamada de ferramenta, health retornou `engine_connected=true`; isso prova handshake do motor local, **não** prova execução da ferramenta.

## Protocolo existente
A porta 9101 é API HTTP própria com `GET /health` e `POST /tool` autenticado com Bearer local. Ela faz ponte para motor DesktopCommanderMCP via stdio. **Não** é endpoint MCP Streamable HTTP nativo. MCP CentralDark/túnel externo exige adaptação/roteamento existente para essa API.

## Reativação observada
1. O Tailscale Serve já estava ativo; a porta local 9101 não respondia.
2. Primeira execução do launcher falhou ao carregar `Microsoft.PowerShell.Security`: havia módulos PowerShell 7 no `PSModulePath` de PowerShell 5.1, gerando conflito de TypeData.
3. No processo de execução, definir `PSModulePath` apenas para módulos Windows PowerShell 5.1 e executar o **launcher existente**. Não persistir variáveis globais sem validação.
4. Resultado: `/health` respondeu; rota Tailscale permaneceu ativa.

## Contra-prova pendente
- POST autenticado `/tool` `list_directory` expirou em 30 segundos; o motor ficou `engine_connected=true`, mas sem recibo de resultado da ferramenta.
- Segunda tentativa encontrou bloqueio da ferramenta de acesso. Não declarar E2E PASS.
- Confirmar chamada real de leitura com saída e tempo de resposta; depois comprovar acesso pelo túnel a partir de cliente da mesma tailnet.

## Segurança e limites
Não registrar nem exibir token DPAPI/Bearer. Não abrir 9101 à Internet, não criar daemon paralelo, não alterar particionamento, não usar token de GitHub no ChatGPT. Preservar mudanças preexistentes do workspace e o WSL em andamento.

NEXT_CURSOR=CASA_9101_TOOL_E2E_READBACK_THEN_TAILSCALE_CLIENT_PROOF

<!-- CASA_COMMANDER_NATIVE_MCP_COCKPIT_DELTA_20261105 -->
## 2026-11-05 — Integração SOURCE CentralDark MCP + Casa Commander + Cockpit

**Intenção:** Casa Commander é o executor nativo do organismo, DesktopCommanderMCP MIT apenas engine local stdio; MCP CentralDark é control plane, OneShot/Tray permanece owner, Hermes coordena comandos permitidos. Não usar conector Remote Desktop Commander para esta integração.

**Commits aplicados diretamente na main:** `cf1cc4b0` (novas tools do dispatcher existente), `10e48f2f` (último recibo autenticado efêmero da bridge), `0799448d` (teste negativo), `07e0446b` + `2ff5e126` + `85c34655` (Cockpit, fonte Tailscale e tipo do recibo).

**Contratos source:**
- `mcp_admin_call(tool=casa_commander_status)`: GET `http://windows-casa.tail6d7aa4.ts.net:9100/health` (tailnet); não invoca ferramentas.
- `mcp_admin_call(tool=casa_commander_read, input={name,arguments})`: `POST /tool` com lista estrita de ferramentas de leitura já permitidas na Casa. Requer OAuth admin do dispatcher e `CENTRALDARK_CASA_BRIDGE_TOKEN` no processo MCP (nunca enviar ao chat, Git ou cliente); sem token retorna `CASA_PAIRING_REQUIRED`. A Casa continua `CENTRALDARK_CASA_WRITE_ENABLED` false por padrão.
- `Casa-Agent.mjs`: GET `/health` expõe `last_authorized_tool` efêmero com somente `tool,kind,at,verified` após `tools/call` retornar sem `isError`. Nunca armazena argumento, conteúdo de arquivo, segredo ou texto de comando no recibo.
- `cockpit.functions.ts`: em Linux usa a URL tailnet privada, em Windows usa loopback; só devolve `desktop=PASS` quando identidade, engine e recibo de ferramenta recente (10 min) foram observados; sem recibo, `RUNNING` e não verde. `StatusPanel.tsx` exibe o recibo com nome e horário.
- O executável `CentralDarkBridge.exe` e a tarefa `CentralDark-Casa-Commander` não foram reiniciados ou recompilados nesta ação; o OneShot tem source pin fixo próprio e deve ser reconciliado somente depois de testes.
- A matriz de testes da bridge manteve negação sem bearer e bloqueio de escrita; teste novo protege `last_authorized_tool=null` antes de execução.

**Prova/limites:** readback GitHub main de 5 arquivos: guardas estáticos presentes. `node --test`, build TypeScript, execução pela rota 9100, pareamento do Bearer, instalação/reload e chamada de volta pelo ChatGPT **NÃO foram executados nem comprovados aqui**. Não há aprovação Run/Cancel própria ainda; o único comportamento válido de mutação é `CASA_WRITE_DISABLED` ou políticas de admin existentes.

**NEXT_CURSOR:** reconciliar versão instalada da Casa/OneShot com source; executar testes no checkout limpo sem descartar worktree, configurar o token de pareamento já existente no MCP sem exibir segredo, atualizar MCP e Cockpit pelo owner de deploy, provar `casa_commander_status` e `casa_commander_read` via admin, verificar recibo/indicador. Para mutativas, integrar aprovação presencial ao OneShot/Tray e auditoria do dispatcher sem se apoiar no painel proprietário de review.
<!-- /CASA_COMMANDER_NATIVE_MCP_COCKPIT_DELTA_20261105 -->
