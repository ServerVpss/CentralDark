# 👑🪬 CENTRALDARK — HUB MCP HÍBRIDO ADMIN / REMOTE DESKTOP COMMANDER

Data: 2026-09-15
Repo: ServerVpss/CentralDark
Branch: main

## Intenção

O Chefe pediu que o HUB tenha uma escolha explícita para operar com dois caminhos:

1. MCP público/admin via `https://mcp.centralldark.com/mcp`.
2. Túnel local/admin via Remote Desktop Commander / Casa.
3. Modo híbrido ativando os dois, com escolha de rota viva pelo Chefe.

## Implementação registrada

Arquivos alterados:

- `apps/modulos/hub/src/components/connectors/HybridMcpAdminCard.tsx`
- `apps/modulos/hub/src/components/connectors/ConnectorsTab.tsx`

O card novo mostra três modos:

- `public-admin`
- `tunnel-admin`
- `both-admin`

O modo padrão visual é `both-admin` para representar público + túnel sem criar arquitetura paralela.

## Regra operacional

- MCP público é fonte externa/admin.
- Túnel local/Remote Desktop Commander é ponte de runtime da Casa.
- O HUB deve deixar o Chefe escolher um dos dois ou os dois.
- Login/admin continua exigindo autorização real.
- Token/senha não deve aparecer no card.
- TOOL_LISTADO != TOOL_ATIVO.
- DEVICE_ONLINE != TOOL_ATIVO.
- Realidade é health + tools/list + chamada real.

## Estado do runtime observado

Do log enviado pelo Chefe:

- `MCP-CentralDark` passou a ficar online em PM2.
- `centraldark-omni-router` passou a ficar online em PM2.
- `/health` do MCP respondeu com `toolCount=115`.
- `/v1/models` do router respondeu lista de modelos.
- O erro restante no Claude Code foi autenticação Bearer `401`, não porta morta.

## Veredito

HUB_HYBRID_ADMIN_CARD=CRISTALIZADO
PUBLIC_MCP_ADMIN_OPTION=CRISTALIZADO
RDC_TUNNEL_ADMIN_OPTION=CRISTALIZADO
BOTH_ADMIN_OPTION=CRISTALIZADO
RUNTIME_EXECUTION_BY_CHATGPT=NOT_PROVEN
TOKEN_ISSUE_RESTANTE=401_AUTH_STORE
UNKNOWN_NAO_E_PASS=ATIVO

## Próximo cursor

Conectar a ação visual do card ao fluxo real de login/admin do HUB quando o endpoint de emissão/validação de chave estiver exposto com contrato estável.
