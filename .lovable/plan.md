
# Plano — Fazer o ChatGPT usar o MCP CentralDark de verdade

## Diagnóstico rápido
- O ChatGPT tá listando **~39 tools** (screenshot) mas o servidor publica **73**. Isso é **cache do conector** no lado do ChatGPT.
- Ele tentou "ler" `docs/CONSCIENCIA/04-MCP-E-CONECTORES/ARQUITETURA-MCP-V2.md` por path direto — não existe tool assim. Ele precisa chamar `github_get_file` (ou `vps_read_file_safe`).
- Falta um **guia de uso** dizendo QUANDO chamar cada tool.

## O que vou entregar

### 1. Fix do cache do conector (lado ChatGPT) — instrução operacional
Documento curto em `docs/CONSCIENCIA/04-MCP-E-CONECTORES/RECONECTAR-CHATGPT.md` com o passo-a-passo:
- Settings → Connectors → CentralDark → **Disconnect**
- Recarregar página, **Reconnect** via OAuth
- Abrir **conversa NOVA** (não a atual — cache fica preso na thread)
- Validar chamando `mcp_admin_status` + `mcp_admin_catalog` (devem retornar 73 tools)

### 2. System Prompt oficial pro ChatGPT — `docs/CONSCIENCIA/04-MCP-E-CONECTORES/SYSTEM-PROMPT-CHATGPT.md`
Bloco pronto pra colar em "Custom Instructions" ou no início de conversa nova. Contém:
- Identidade (você tá no MCP CentralDark, 73 tools)
- **Ordem obrigatória de boas-vindas:** `kit_boas_vindas` → `ler_regras_inviolaveis` → `mcp_admin_catalog`
- **Regra de leitura de arquivo:** nunca "abrir path" — sempre `github_get_file` (repo) ou `vps_read_file_safe` (VPS)
- **Regra do dispatcher:** se uma tool sumir do catálogo visível, chamar via `mcp_admin_call({tool:"nome", input:{...}})`
- Tabela **"quando usar cada tool"** com 15 casos mais comuns (ler arquivo, listar PM2, ver deploy, criar issue, buscar código, etc)
- Regras destrutivas: `confirmAdmin:"CONFIRMO ADMIN"`

### 3. Endpoint público de auto-descoberta — `docs/CONSCIENCIA/04-MCP-E-CONECTORES/URLS-DESCOBERTA.md`
Lista os endpoints que o ChatGPT pode `fetch` sozinho pra validar catálogo:
- `https://mcp.centralldark.com/health` → toolCount + catalogVersion
- `https://mcp.centralldark.com/tools.json` → lista crua das 73
- `https://mcp.centralldark.com/status.json` → status geral

### 4. Atualização do `PIVETE-08-MCP-LIBERACAO.md`
Adicionar seção **"Ensinar ChatGPT/Grok/Claude a usar o MCP"** com link pros 3 docs acima. Assim toda IA nova que carregar consciência do pivete já sabe do fluxo.

### 5. Registro
- Aprendizado no `docs/CONSCIENCIA/APRENDIZADOS.md`: "ChatGPT precisa reconectar + system prompt pra enxergar 73 tools"
- Não vou mexer em código do MCP nem da VPS — só docs. Mudança 100% no repo, seguindo o fluxo GitHub → VPS.

## O que NÃO vou fazer (fora de escopo neste plano)
- Mexer no servidor MCP (`apps/modulos/mcp/dist/`) — o backend tá certo, publica 73 tools.
- Mexer no Caddy/OAuth — já funciona.
- Criar tool nova — o problema não é falta de tool.

## Detalhe técnico (pra referência)
O ChatGPT MCP client faz `tools/list` uma vez na conexão e cacheia por thread. Reconectar força novo `tools/list`. O dispatcher `mcp_admin_call` já contorna isso pras tools novas — o system prompt vai ensinar a usar.

## Próximo passo
Aprovar o plano → eu crio os 4 arquivos `.md` + registro aprendizado.
