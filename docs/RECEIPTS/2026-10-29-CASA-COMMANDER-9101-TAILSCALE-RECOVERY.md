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
