# Prova de capacidade (esta sessão)

## O que foi feito com evidência, não com achismo

1. Li o output real do hardening (`STATUS=APPLIED`, `UFW_NOT_CHANGED`, lista UNEXPECTED_TCP).
2. Cruzei com `ss` + PID + EXE + CWD de cada porta.
3. Cruzei com `pm2 jlist` sanitizado e Docker publish.
4. Identifiquei conflito UFW 3000 DENY+ALLOW e 9000 ALLOW.
5. Liguei 8082/8083 aos proxies que no placar têm 5k+ restarts.
6. Mantive WebhookDeploy stopped como correto (não “erro a subir”).
7. Não reinventei Docker CI/CD genérico em cima do teu modelo self-hosted.
8. Não reimprimi secrets do ecosystem (já expostos no Git — rotação é o fix).

## O que o pack entrega

- Diagnóstico amarrado ao teu host Contabo.
- Scripts com `set -e`, backup UFW, delete de regras por padrão, deny explícito.
- Ordem que evita lockout e evita fechar porta antes de bind localhost.
- Checklist de rotação sem valores.

## O que ainda depende de ti na VPS

- Executar os scripts (eu não tenho shell na tua Contabo daqui).
- Confirmar Caddy upstream = 127.0.0.1 antes do UFW deny.
- Rotacionar tokens nos provedores.

Se quiser “me colocar dentro” depois: self-hosted runner já existe; o canal seguro é job path-filtered + evidência, não SSH aberto com chave de IA.