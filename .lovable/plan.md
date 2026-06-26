
# Plano — Validar Notion no MCP CentralDark (3 fases)

Objetivo: confirmar que `notion_buscar` e `notion_ler_pagina` voltaram a funcionar depois do restart do MCP-CentralDark, sem ficar tropeçando em token OAuth expirado nem em caminho errado de código.

## Fase 1 — Achar onde o MCP real roda na VPS

Os caminhos `/root/CentralDark/apps/mcp/` e `/root/CentralDark/apps/modulos/mcp/src/tools/` apareceram vazios (sem `integrations.ts`), então o código que tá rodando hoje no PM2 id 25 mora em outro lugar. Vou descobrir o caminho absoluto antes de qualquer outra coisa.

Passos (via MCP tools de leitura na VPS — não destrutivo):
1. `pm2 show MCP-CentralDark` → ler `script path`, `exec cwd`, `exec interpreter`.
2. `vps_list_dir_safe` no diretório que aparecer + `search_files` por `notion_buscar` e `NOTION_API_KEY` dentro de `/root/CentralDark/` pra confirmar o módulo certo.
3. Conferir se o restart de hoje carregou `/root/CentralDark/secrets/mcp.env` (procurar o log de boot do MCP com `puxar_aprendizados` ou leitura direta de `/root/CentralDark/logs/mcp/out.log` filtrando "boot", "cofre", "env loaded").

Saída esperada: caminho exato do MCP + confirmação de que `NOTION_API_KEY` foi lida no boot.

## Fase 2 — Confirmar que o Notion carregou (sem precisar de OAuth)

Em vez de bater no `https://mcp.centralldark.com/mcp` (que exige token OAuth do GitHub válido e tava dando 401), valido por dentro:

1. `mcp_status` e `mcp_admin_status` (essas tools não exigem o OAuth do usuário, usam o token interno do dispatcher) → ver se o conector `notion` aparece como `ok`.
2. `mcp_admin_call` chamando `notion_buscar` com `query: "CentralDark"` e `limit: 1` por dentro do próprio MCP — se responder, o token tá vivo.
3. Se falhar, ler `/root/CentralDark/logs/mcp/err.log` (últimas 50 linhas) procurando "notion", "401", "unauthorized" pra saber se é token do Notion errado ou secret não carregada.

## Fase 3 — Renovar OAuth e fechar o teste end-to-end

Só faz sentido se Fase 2 mostrar tudo verde por dentro.

1. Você reabre `https://mcp.centralldark.com` no navegador e refaz o login com GitHub (o token OAuth que tava no curl expirou — é por isso que deu "Access token inválido").
2. Eu repito a chamada externa equivalente ao curl que você tentou, agora via `mcp_admin_call` → `notion_buscar` e depois `notion_ler_pagina` numa página conhecida (ex.: hub `CentralDark • Consolidação`).
3. Se passar, marco pendência fechada e registro aprendizado: "MCP restart de 26/06 reativou Notion — token OAuth do GitHub precisa renovar a cada X dias".

## Detalhes técnicos (resumo)

- O erro `{"code":-32000,"message":"Access token inválido ou expirado"}` é da camada **OAuth GitHub do MCP**, não do Notion. Restart do MCP invalida sessões OAuth ativas → todo cliente precisa reautenticar.
- O heartbeat do `guardiao` batendo 401 a cada minuto é o mesmo sintoma: ele usa token OAuth velho. Possível ação futura (fora desse plano): trocar `guardiao.heartbeat` pra usar token de serviço fixo em vez de OAuth de usuário.
- Tudo nessa investigação é **read-only** + 1 chamada `notion_buscar` (sem efeito colateral). Nenhum deploy, nenhuma escrita em arquivo.

## O que eu **não** vou fazer

- Não vou mexer no `secrets/mcp.env` (já tá configurado).
- Não vou reiniciar nada no PM2 — o restart de hoje já foi suficiente.
- Não vou editar código do MCP nessa rodada; se aparecer bug de código, viro pendência e te aviso antes.

## Resultado entregue ao fim

Um resumo curto: ✅ ou ❌ pra `notion_buscar`, ✅ ou ❌ pra `notion_ler_pagina`, e o caminho real do MCP anotado no cérebro pra não perder de novo.
