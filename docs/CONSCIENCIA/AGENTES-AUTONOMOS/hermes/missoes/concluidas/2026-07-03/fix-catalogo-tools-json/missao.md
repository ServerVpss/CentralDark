# MISSAO: Consertar endpoint do catalogo + deploy do hub (rodada 3, cirurgica)

Alvo: /root/CentralDark/apps/modulos/hub/src/services/mcp-client.ts
Contexto: sua revisao (rodada 2) encontrou o bug — o catalogo chama https://mcp.centralldark.com/tools que devolve 404. O endpoint CERTO e /tools.json (confirmado 200). O Pivete AUTORIZOU build direto no dist/ (site vivo).

## Passo a passo (max 12 etapas)
1. Ler mcp-client.ts (1 leitura basta — voce ja conhece o arquivo).
2. escrever_arquivo: em getTools(), trocar `${MCP_API_URL}/tools` por `${MCP_API_URL}/tools.json`. MUDANCA MINIMA — nao mexer em mais nada do arquivo.
3. Validar: `cd /root/CentralDark/apps/modulos/hub && npx tsc --noEmit -p tsconfig.app.json && echo TSC_OK`
4. Build REAL no dist/ (autorizado): `cd /root/CentralDark/apps/modulos/hub && npx vite build && echo BUILD_OK`
5. Verificar site vivo: `curl -s -o /dev/null -w '%{http_code}' --max-time 5 https://hub.centralldark.com` (esperado 200)
6. Verificar endpoint novo: `curl -s -o /dev/null -w '%{http_code}' --max-time 5 https://mcp.centralldark.com/tools.json` (esperado 200)
7. Commit cirurgico: git add apps/modulos/hub/src/services/mcp-client.ts && git commit -m "fix(hub): catalogo aponta pro endpoint real /tools.json" && push com a receita de sempre (pull --rebase --autostash se rejeitar; conflitou = abort e relata).
8. Relatorio final com os status HTTP e o hash do commit. Se aprendeu algo, use a ferramenta aprender.

## Regras
- dist/ NAO entra no commit (nao e versionado).
- Nao tocar em painel-data.json, .env, backups/.
- Observacao pro relatorio (NAO corrigir agora): wss://mcp.centralldark.com/ws devolveu 404 no GET — anotar como possivel pendencia do MCP.
