# MISSAO: Exame pratico — manutencao do Elite Gateway

Voce agora e o admin do Elite Gateway (ChatGPT via Zendriver). Suas licoes estao na categoria elite-gateway do seu cerebro; as aulas em docs/CONSCIENCIA/ARSENAL/EVOLUCAO/2026-07-03/aula-elite-gateway.md e aulas-avancadas-gateway.md. A ferramenta e python3 scripts/gateway_admin.py (rode a partir de /root/CentralDark/apps/modulos/elite-gateway).

## Criterio de sucesso
Um relatorio de saude honesto no Telegram + o slot da conta_02 criado (perfil e token proprios), deixando SO o login humano pro Pivete.

## Passo a passo (max 15 etapas)
1. Diagnostico: `cd /root/CentralDark/apps/modulos/elite-gateway && python3 scripts/gateway_admin.py doctor`
2. Ping do gateway: `curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8080/` (200 = vivo)
3. Ultimos eventos: `pm2 logs CentralDark-EliteHTTP --lines 20 --nostream` — resumir se ha cloudflare_block/input_not_found.
4. Zentinel vivo? `pm2 describe CentralDark-Zentinel | grep -E 'status|restarts'`
5. Apontar duplicatas: `python3 scripts/gateway_admin.py fix-duplicates`
6. Criar a conta_02 REAL (parte mecanica que e sua): `python3 scripts/gateway_admin.py add conta_02`
   - A ferramenta ja faz backup do accounts.json e imprime o token UMA vez.
   - GUARDE o token pro relatorio final (entregar ao Pivete).
7. Conferir que o slot entrou: `python3 scripts/gateway_admin.py list`
8. Relatorio final (terminou:true, notificar_progresso) com:
   - saude do gateway (status HTTP + ocupado)
   - estado das contas (o bug de id duplicado, com suas palavras)
   - zentinel online/offline
   - conta_02 criada: id, profile_dir, e o TOKEN
   - PROXIMO PASSO pro Pivete: `python3 scripts/gateway_admin.py login conta_02` (login humano via noVNC), depois `pm2 restart CentralDark-EliteHTTP && pm2 save` e `test conta_02`.

## PROIBIDO nesta missao
- NAO rodar `login` (abre navegador/noVNC — e passo do Pivete).
- NAO reiniciar o gateway (conta_02 so ativa depois do login; restart agora nao ajuda).
- NAO renomear/remover tokens existentes (quebra integracoes em uso).
- NAO editar accounts.json na mao — so via gateway_admin.py (ele faz backup).
- NAO commitar accounts.json nem contas/profiles/ (sao credenciais, ja no .gitignore).
- NAO imprimir tokens de contas ja existentes; so o token novo da conta_02.

## Regras gerais
- Depois de escrever/rodar algo, valide o resultado antes de seguir (nao repita comando as cegas).
- Aprendeu algo novo com um erro? Grave com a ferramenta aprender (categoria elite-gateway).
- Areas protegidas continuam so leitura.
