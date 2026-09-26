# CentralDark / MultiZap

<!-- BEGIN CENTRALDARK-ESTADO-VIVO -->
## Estado vivo multi-IA

Atualizado em: `2026-06-09T20:03:28Z`.

O CentralDark / MultiZap deve ser compreendido por qualquer IA conectada ao projeto.

| Agente | Papel principal |
|---|---|
| ChatGPT + MCP | Comando central, memória, segurança, validação e handoff |
| Lovable | Frontend, UI, docs visuais e evolução rápida de telas |
| Grok | Auditor VPS, logs, causa-raiz e segunda opinião |
| Codex | Revisão de código, PRs, validadores e arquitetura |
| Copilot | Apoio de código no editor, sem decisão de produção sozinho |
| GitHub Actions | Workflows, bots, checks, deploy e histórico |
| Mega Painel | Mapa visual vivo de cards, porcentagens, pendências e próximos passos |

Regra: toda tarefa relevante precisa refletir o estado no README, docs/CONSCIENCIA, docs/PENDENCIAS quando houver pendência, docs/RELATORIOS, Mega Painel e handoff para a próxima IA.

O Mega Painel em `status.centralldark.com` é o atalho visual para acompanhar evolução, cards novos, porcentagens e riscos. Se uma tarefa muda o estado do projeto e o painel não muda, o checkpoint está incompleto.
<!-- END CENTRALDARK-ESTADO-VIVO -->


Este é o **único arquivo `.md` que deve ficar na raiz**.

Ele é a porta de entrada para qualquer agente de IA ou pessoa que abrir o projeto.

## Entrada para ChatGPT, Grok e Lovable

O projeto é operado com três agentes principais:

- ChatGPT;
- Grok;
- Lovable.

Nenhum agente deve trabalhar sozinho ou começar tarefa sem recarregar a memória viva do projeto.

## Comandos oficiais de recarregamento

Quando o usuário escrever qualquer um destes comandos, a IA deve parar e recarregar o contexto antes de agir:

```txt
RELOAD MEMORIA
RECARREGAR MEMORIA
LEMBRAR MEMORIA
SYNC IA
SINCRONIZAR IA
ATIVA MODO SEGREDO
```

## Ordem obrigatória de leitura

1. `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`
2. `docs/CONSCIENCIA/APRENDIZADOS.md`
3. `docs/PENDENCIAS.md`
4. `docs/RELATORIOS/` mais recentes
5. Revisões recentes em `/root/CentralDark/revisoes/`, quando disponível
6. GitHub Actions `#FASE deploy`, quando a tarefa envolver deploy

Só depois disso a IA deve responder ou executar qualquer ação.

## Fluxo oficial

```txt
ler memória → entender estado atual → agir com segurança → validar → registrar → resumir
```

## Modo Segredo

Padrão operacional da conversa:

```txt
resultado recebido → interpretação objetiva → próxima ação pronta → validação → relatório
```

Regras:

- resposta simples e prática;
- sem enrolação;
- sem repetir diagnóstico já fechado;
- scripts com `clear || true` no início;
- visual CentralDark quando houver script;
- logs completos em `/root/CentralDark/revisoes/...`;
- resumo limpo no chat;
- ações sensíveis só com confirmação explícita.

## Handoff obrigatório para a próxima IA

Após cada ação concluída, a IA deve deixar no final da resposta um bloco chamado:

```txt
MENSAGEM PARA A PRÓXIMA IA
```

Esse bloco deve explicar, em poucas linhas:

- o que foi feito;
- onde foi salvo;
- qual commit, relatório ou aprendizado foi gerado;
- o que não foi mexido;
- qual é o próximo passo correto;
- qual comando o usuário deve mandar para a próxima IA recarregar memória.

Comando padrão para a próxima IA:

```txt
RELOAD MEMORIA. Leia o README.md da raiz e siga a ordem de leitura antes de agir.
```

Documento completo: `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`.

## Onde registrar cada coisa

| Tipo | Local correto |
|---|---|
| Regra, aprendizado, erro, padrão | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Consciência/regras principais | `docs/CONSCIENCIA/` |
| Pendência | `docs/PENDENCIAS.md` |
| Relatório de tarefa concluída | `docs/RELATORIOS/` |
| Logs completos de VPS | `/root/CentralDark/revisoes/...` |
| Documentação do instalador | `docs/INSTALADOR/` |
| Arquivos antigos de orientação | `docs/CONSCIENCIA/ARQUIVO-MORTO/` |

## Padrao de scripts

Scripts de VPS devem usar o Tema Netflix Centralizado: Bash em `scripts/lib/theme.sh`
e Node em `scripts/lib/theme-node.mjs`.
O padrao completo fica em `docs/CONSCIENCIA/SCRIPTING-STANDARDS.md`.

## Deploy sem GitHub Actions

O caminho preparado para deploy rapido, sem consumir minutos de GitHub Actions, e o
Webhook Deploy Seguro com fila.

Referencia oficial: `docs/CONSCIENCIA/WEBHOOK-DEPLOY-SEGURO.md`.

Regras curtas:

- endpoint publico planejado: `https://deploy.centralldark.com/github`;
- servico local planejado: `CentralDark-WebhookDeploy` em `127.0.0.1:9300`;
- assinatura HMAC SHA256 obrigatoria;
- aceitar somente `push` em `refs/heads/main`;
- secret fora do repo em `/root/CentralDark/secrets/webhook.env`;
- Caddy real, PM2 real e webhook GitHub real so com veredito humano.

## Estado atual curto

- Repo oficial: `ServerVpss/CentralDark`.
- Espelho/backup: `segredounlock/clone-deck`.
- Git root real na VPS: `/root`.
- Projeto operacional: `/root/CentralDark`.
- Bot validado online em `https://bot.multizap.dev`.
- Rotas SPA do bot retornam 200 via Caddy.
- Rotas reais do bot: `/chats` e `/contatos`.
- CRM continua fora do escopo e não deve ser mexido sem confirmação.
- Banco real, histórico WhatsApp, sessões WhatsApp/WuzAPI e migração pesada estão fora do escopo atual.
- Padrão visual de deploy: `#FASE deploy`.

- API oficial planejada: `https://api.centralldark.com`.

## Cofre oficial de secrets

A política oficial do projeto é centralizar secrets em `/root/CentralDark/secrets/`.

Regras:

- `.env`, tokens, sessões, chaves e credenciais reais nunca devem aparecer em texto puro;
- qualquer auditoria sobre secrets precisa ser read-only e sanitizada;
- leitura, migração, edição ou exposição real de segredo só com aprovação humana explícita;
- o resultado do Lote 1 da quarentena `.env` foi consolidado como estado oficial, sem revelar valores sensíveis.

## Ações sensíveis

Sempre pedir confirmação explícita antes de:

- alterar Caddy;
- mexer em Docker/WuzAPI;
- resetar/logout WhatsApp;
- reiniciar serviço sensível;
- mexer em CRM fora de leitura/auditoria;
- alterar banco real;
- tocar em secrets;
- trocar domínio/DNS/SSL;
- apagar ou mover pastas.

---

Regra final: **a raiz deve ter somente este `README.md` como documento Markdown de entrada.**

## Padrão de scripts pesados e run-once

O caminho oficial do **Tema Netflix Centralizado** na VPS é:

```bash
/root/CentralDark/scripts/lib/theme.sh
```

Todos os scripts pesados, especialmente scripts em `scripts/run-once/`, devem carregar o tema no começo:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

# Tema Netflix centralizado
source /root/CentralDark/scripts/lib/theme.sh

netflix_header
netflix_step 1 3 "Validando ambiente"
netflix_success "Ambiente validado"
```

Para processos longos, usar loading com comando em background e log completo em `revisoes/`:

```bash
LOG_DIR="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/minha-tarefa"
mkdir -p "$LOG_DIR"

minha_funcao_pesada > "$LOG_DIR/processo.log" 2>&1 &
pid=$!
netflix_loading "Processando tarefa pesada" "$pid"
wait "$pid"

netflix_done
```

Regras:

- logs completos ficam em `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/`;
- o chat recebe apenas resumo claro, sem parede de log;
- usar `netflix_header`, `netflix_step`, `netflix_success`, `netflix_info`, `netflix_warning`, `netflix_error`, `netflix_done`, `netflix_confirm`, `netflix_progress_bar` e `netflix_loading`;
- não duplicar estilos manuais dentro dos scripts;
- se forem necessárias funções novas como `loading_start`/`loading_stop` ou controle de verbosidade, isso deve virar melhoria de `scripts/lib/theme.sh`, não gambiarra em cada script.
