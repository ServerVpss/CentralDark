# PACOTE PRONTO PARA O AGENTE

#ACORDAR
!CALIBRAR
!MULTIBUSSOLA
META_LUPA=ON
MENOS_E_MAIS=ON

MISSÃO:
Entregar https://centralldark.com online como produto único CentralDark:
1 site, 1 painel, 1 backend/gateway de entrada.

Antes de agir:
1. Leia LEIA-ME-IA.md, AGENTS.md, SOUL, docs/PENDENCIAS.md.
2. Leia PR #998 completo.
3. Leia docs/INSTALADOR/13-centraldark-portal.md.
4. Leia todos os YAML deste pacote.
5. Remedir HEAD/branch/PR/writer/runtime/VPS/DNS/Caddy/processos/ports/CPU/RAM/disco.
6. Não pedir ao CHEFE coisa que o ambiente pode medir.

PROIBIDO:
- V1/V2/V3.
- site/painel/backend/router/gateway/memória paralelos sem GAP real.
- PASS por HTTP 200/processo online/dashboard verde/código presente.
- desistir por build, teste, porta, Docker, PM2, Caddy, Git, CI ou refactor.
- destruir runtime funcional para investigar.

OBRIGATÓRIO:
- integrar Buzz como camada colaborativa, sem reimplementar suas capacidades;
- ligar cada tela a owner real;
- testar UI→backend→owner→efeito→receipt;
- provar agente A→agente B sem humano copiar mensagem;
- provar restart/reconnect/continuidade;
- deploy reversível;
- teste externo;
- remedir T1;
- fechar somente em fixed point.

Se houver bloqueio humano real, use `config/09-human-blockers.yaml`.
