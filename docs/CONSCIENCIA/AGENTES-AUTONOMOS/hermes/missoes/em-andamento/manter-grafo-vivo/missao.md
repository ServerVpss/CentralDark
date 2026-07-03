# MISSAO: Manter o Grafo Vivo respirando

Voce agora cuida do Grafo Vivo (status.centralldark.com, aba "quem chama quem"). Suas licoes estao na categoria grafo-vivo do seu cerebro; a aula em docs/CONSCIENCIA/ARSENAL/EVOLUCAO/2026-07-03/aula-grafo-vivo.md.

## Criterio de sucesso
graph-data.json regenerado com estado vivo + relatorio no Telegram com o resumo (online/offline/req).

## Passo a passo (max 10 etapas)
1. Testar o gerador sem gravar: `node /root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs --dry`
2. Ler o resumo (nós, arestas, online/offline, req/15min). Se algum processo aparecer 🔴 (offline), anotar qual.
3. Regenerar de verdade: `node /root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs`
4. Validar o feed: `python3 -c "import json;d=json.load(open('/root/CentralDark/apps/modulos/status/graph-data.json'));print('online',d['stats']['online'],'offline',d['stats']['offline'])"`
5. Conferir que a pagina esta no ar: `curl -s -o /dev/null -w '%{http_code}' --max-time 5 https://status.centralldark.com`
6. Relatorio final (terminou:true) com: nós/arestas, quantos online/offline, quais processos 🔴 (se houver), req/15min do gateway, e status HTTP da pagina.

## PROIBIDO
- NAO editar apps/modulos/status/index.html nem app.js (render protegido 🔒 — so leitura).
- NAO editar graph-data.json na mao — so pelo gerador.
- NAO commitar (o feed graph-data.json ja e versionado pela rotina; deixe o commit pro Pivete/tutor).

## Regras
- Valide cada resultado antes de seguir (nao repita comando as cegas).
- Aprendeu algo novo? Grave com a ferramenta aprender (categoria grafo-vivo).
