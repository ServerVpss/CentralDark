# Exército /swarmS — 20 agentes em paralelo

## O que vai ser feito

Dar vida ao comando `swarmS` já instalado, criando 20 pastas de agente, cada uma com um `run.sh` que chama o DarkAI com um prompt específico do setor. Assim, quando você rodar `swarmS "sua tarefa"`, 20 IAs disparam ao mesmo tempo, cada uma olhando pela ótica dela.

## Os 20 setores do Exército

Divididos em 4 pelotões:

**Infra e Deploy (5)**
1. `docker` — Compose, containers, healthchecks, portas
2. `caddy` — Reverse proxy, TLS, headers de segurança
3. `pm2` — Processos vivos na VPS, restart policy, logs
4. `deploy` — GitHub Actions, webhook, sync 4-Point
5. `backup` — Volumes, snapshots, restore

**Código e Qualidade (5)**
6. `frontend` — React, Vite, Tailwind, componentes
7. `backend` — Edge functions, APIs, integrações
8. `css-design` — Padrão esmeralda, tokens, temas
9. `testes` — Vitest, Playwright, cobertura
10. `code-review` — Big-O, SOLID, code smell

**Segurança e Dados (5)**
11. `seguranca` — OWASP, secrets expostos, XSS, RLS
12. `banco` — Supabase, migrations, políticas
13. `auth` — OAuth, JWT, roles, permissões
14. `secrets` — Cofre, rotação, .env
15. `auditoria` — Logs, quem fez o quê

**Conhecimento e Ops (5)**
16. `docs` — README, CONSCIENCIA, PENDENCIAS
17. `pendencias` — Ler, priorizar, sugerir próxima
18. `mapeamento` — Mapa vivo, grafo, dependências
19. `telegram` — Bots, webhooks, notificações
20. `monitoramento` — Health, uptime, alerta

## Como cada agente vai funcionar

Cada pasta terá 3 arquivos:

- `run.sh` — recebe a tarefa via `$1`, chama o DarkAI passando o prompt do setor + a tarefa, salva resposta em `execution.log`
- `prompt.md` — o prompt-mãe daquele setor (personalidade + escopo + formato de resposta)
- `README.md` — o que aquele agente faz, quando invocar

Modelo do `run.sh` (idêntico em todas as pastas, só muda o `SETOR`):

```bash
#!/bin/bash
SETOR="docker"
TAREFA="$*"
PROMPT=$(cat prompt.md)
curl -s -X POST https://darkai.centralldark.com/chat \
  -H "Content-Type: application/json" \
  -d "{\"setor\":\"$SETOR\",\"prompt\":$(jq -Rs . <<< "$PROMPT"),\"tarefa\":$(jq -Rs . <<< "$TAREFA")}" \
  | jq -r '.resposta' > execution.log
echo "[$SETOR] concluido em $(date -Iseconds)" >> execution.log
```

## Melhorias que vão junto no `swarmS`

- Cabeçalho colorido no início mostrando qtd de agentes ativos
- Contador em tempo real (5/20 concluídos, 12 rodando, 3 na fila)
- Ao final, um `swarmS-resumo` opcional que consolida os 20 `execution.log` num placar único 🟢🟡🔴
- Timeout individual de 90s por agente (evita agente travado segurar o enxame)
- Flag `--dry-run` pra listar quem seria disparado sem executar

## Cascata (multiplicação)

Cada `prompt.md` vai incluir a instrução: "se achar 3+ pontos suspeitos no seu setor, chame outros agentes do enxame via `swarmS "sub-tarefa"` pra multiplicar o trabalho". Assim, um `swarmS "mapear tudo"` pode virar 20 → 40 → 60 agentes reais em cascata, como você pediu.

## Estrutura final na VPS

```text
/root/CentralDark/apps/modulos/hub/
├── agentes_ativos.txt         (20 nomes)
├── swarmS-resumo               (script novo, consolida logs)
├── docker/
│   ├── run.sh
│   ├── prompt.md
│   └── README.md
├── caddy/
│   ├── run.sh
│   ├── prompt.md
│   └── README.md
... (mais 18 pastas iguais)
```

E `/usr/local/bin/swarmS` recebe upgrade com timeout + contador + `--dry-run`.

## Detalhes técnicos

- Nenhuma pasta protegida da Seção 9 do CLAUDE.md será tocada — as 20 pastas são criadas dentro de `apps/modulos/hub/` (pasta do HUB, já protegida mas sem conteúdo de agente ainda).
- `run.sh` usa `curl` + `jq` (já disponíveis na VPS).
- Endpoint `https://darkai.centralldark.com/chat` é o que já existe e responde. Se o endpoint real for outro, ajusto os 20 `run.sh` de uma vez via loop.
- Cada agente escreve APENAS na própria pasta (sem risco de conflito).
- Salvo esse plano na sessão. Só executo depois da sua aprovação — nada roda na VPS antes.
- Notificação Telegram (padrão Card Hermes) dispara ao final, listando quantos rodaram e link pros logs.

## Como você vai usar depois

```text
# Enxame simples
swarmS "auditar toda WebUI"

# Ver quem tá vivo
tail -f /root/CentralDark/apps/modulos/hub/*/execution.log

# Placar consolidado ao final
swarmS-resumo
```

## Tempo estimado

- Criação das 20 pastas + arquivos: ~2 min
- Upgrade do `swarmS` + `swarmS-resumo`: ~1 min
- Teste com missão simples ("mapear WebUI"): ~1 min
- **Total: ~5 min pra ter o Exército em pé.**
