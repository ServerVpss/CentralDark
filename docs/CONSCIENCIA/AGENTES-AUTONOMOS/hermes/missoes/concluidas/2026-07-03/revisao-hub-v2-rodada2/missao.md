# MISSAO: Revisao final do HUB v2 — rodada 2 (QA)

Alvo: /root/CentralDark/apps/modulos/hub/
Contexto: voce concluiu o hub v2 (typecheck zero, commit 00f4403a3). Agora e a rodada de REVISAO: provar que o trabalho aguenta build real e endpoints reais, e listar o que ainda pode melhorar. Use as tecnicas que aprendeu (elas estao nas suas licoes).

## Criterio de sucesso
1. Typecheck continua ZERO: `cd /root/CentralDark/apps/modulos/hub && npx tsc --noEmit -p tsconfig.app.json && echo TSC_OK`
2. BUILD real passa: `cd /root/CentralDark/apps/modulos/hub && npx vite build --outDir dist-preview && echo BUILD_OK`
   ⚠️ REGRA ABSOLUTA: NUNCA buildar para `dist/` — e o site VIVO (hub.centralldark.com serve dist/). So `--outDir dist-preview`.
3. Endpoints que os componentes usam respondem? Testar com curl robusto (--max-time 5, so status):
   - https://mcp.centralldark.com/health
   - https://mcp.centralldark.com/tools
   Anotar o status HTTP de cada um no relatorio (200 = 🟢, resto = 🔴 com o codigo).
4. Relatorio final honesto com: resultado do build, status dos endpoints, e 3 MELHORIAS que voce faria no hub (so listar, NAO implementar).

## Se o build FALHAR
- Ler o erro, corrigir o MINIMO no arquivo apontado, validar de novo (maximo 2 tentativas por arquivo).
- Depois de corrigir: commit cirurgico (git add apps/modulos/hub — NUNCA -A, NUNCA painel-data.json/.env) + push com a receita que voce ja sabe.
- Se nao corrigir em 2 tentativas: anotar no relatorio e seguir.

## Limpeza obrigatoria no final
- `rm -rf /root/CentralDark/apps/modulos/hub/dist-preview` (nao deixar lixo, nao commitar dist-preview)

## Regras
- Maximo 30 etapas.
- Cada leitura de arquivo no maximo 2x — na terceira vez a acao e ESCREVER.
- Comando que da certo sem imprimir nada: terminar com `&& echo OK` pra ter confirmacao.
- Aprendeu algo novo com um erro? Gravar com a ferramenta `aprender` antes de seguir.
- Areas protegidas continuam proibidas.
