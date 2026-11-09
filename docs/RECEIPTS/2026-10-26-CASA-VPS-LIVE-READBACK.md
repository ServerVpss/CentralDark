# Casa ↔ VPS — leitura viva de transporte e autenticação
Data da medição: 2026-10-26 08:49 UTC. Origem da medição: Windows Casa SEGREDO, SSH para CENTRALDARK-OS, e probes read-only executados na VPS.

## Evidências observadas
- Casa → VPS: `ssh -o BatchMode=yes -o ConnectTimeout=8 segredo-vpss "hostname"` concluiu com exit 0 e identificou `CENTRALDARK-OS`.
- Tailscale visto da VPS: `tailscale ping 100.123.93.25` respondeu `pong from windows-casa`, rota direta, 98 ms.
- VPS → Casa, bridge existente: `curl http://100.123.93.25:9100/health` retornou HTTP 200.
- VPS → Casa, login SSH direto: tentativa `Administrador@100.123.93.25` retornou `Permission denied (publickey,password,keyboard-interactive)`, exit 255.
- VPS: `centraldark-hermes-core.service` e `hermes-gateway.service` estavam `active/running`; o processo Hermes Desktop também estava ativo na Casa. A tarefa agendada `Hermes_Gateway` da Casa apareceu `Ready`, portanto o estado do app local não prova que o gateway local foi iniciado por essa tarefa.

## Veredito conservador
- TAILSCALE_TRANSPORT_CASA_VPS: PASS no momento da medição.
- CASA_TO_VPS_SSH_AUTH: PASS para o alias existente `segredo-vpss`.
- VPS_TO_CASA_SSH_AUTH: FAIL — a autenticação direta de usuário no Windows não foi aceita.
- VPS_TO_CASA_BRIDGE_HEALTH: PASS (HTTP 200), mas isso não prova, isoladamente, que uma chamada autenticada de ferramenta completa e retorna recibo.
- BIDIRECTIONAL_CLOSED_LOOP: NOT_PROVEN. Não declarar circuito SSH bidirecional fechado enquanto a autenticação reversa ou o fluxo de ferramenta autenticado não tiver prova de ponta a ponta.

## Limites e próximo passo
Nenhuma chave foi criada/copied, nenhuma ACL foi afrouxada, nenhum serviço foi reiniciado e nenhum arquivo runtime foi alterado nesta medição. Próximo passo é reutilizar a identidade/credencial canônica já aprovada para a Casa, validar o contrato do bridge existente e registrar ACK/readback do mesmo `task_id` — sem expor chaves e sem criar outro agente.
