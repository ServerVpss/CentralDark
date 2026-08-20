---
title: "PROTOCOLO DE INICIALIZAÇÃO DE SESSÃO"
date: 2026-06-30
tags: ["protocolo", "sessao", "ia", "onboarding"]
updated: 2026-06-30T00:00:00-03:00
---

# Protocolo de Inicialização de Sessão

> O que toda IA deve executar antes de começar a trabalhar com o Pivete. Cópia original (fonte oficial) em `docs/CONSCIENCIA/PROTOCOLO-INICIALIZACAO.md` — atualizar os dois juntos.

Este protocolo é o **boot sequence** de cada sessão. Existe para que qualquer IA — Claude, Grok, ChatGPT, Copilot — entre em contexto rapidamente sem precisar perguntar nada ao Pivete.

---

## O que é (explicação simples)

Quando o Pivete abre uma conversa nova com uma IA, a IA começa "do zero" — sem memória do que foi feito antes, sem saber o estado da VPS, sem conhecer as pendências.

O Protocolo de Inicialização resolve isso: é um conjunto de leituras e verificações que a IA executa em paralelo logo que a sessão começa, e entrega um **Relatório de Alinhamento** em 4 seções antes de perguntar o que fazer.

**Analogia:** é como um piloto que percorre o checklist antes de decolar — mesmo que voe todo dia, ele confere os instrumentos antes de sair do chão.

---

## Quando executar

O protocolo é ativado automaticamente por qualquer uma dessas frases:

| Frase | Equivalente |
|---|---|
| `inicie nossa sessão` | boot completo |
| `carregue os módulos` | boot completo |
| `varredura de alinhamento` | boot completo |
| `inicialize o sistema` | boot completo |
| `bom dia` + início de conversa | boot completo |
| `yes` no início de uma sessão nova | boot completo |

---

## Passo a passo (execução paralela)

A IA executa **todos estes passos ao mesmo tempo** (não em sequência):

```
1. Ler MEMORY.md + arquivos de memória relevantes
2. Confirmar CLAUDE.md (já no contexto — validar seções ativas)
3. Ler docs/CONSCIENCIA/09-ESTADO-ATUAL.md
4. Ler docs/CONSCIENCIA/07-PENDENCIAS-E-HORARIO.md
5. Ler docs/PENDENCIAS.md (fonte única de pendências)
6. Rodar `pm2 list` — comparar com estado esperado
7. Checar curl http://localhost:8082/health (Elite Proxy)
8. Checar curl http://localhost:9100/health (MCP)
9. Rodar git status -sb — alertar se working tree sujo
```

---

## Estrutura do Relatório de Alinhamento

A IA entrega o resultado neste formato fixo:

```
## Relatório de Alinhamento — Sessão YYYY-MM-DD

### 1. Ferramentas e Habilidades Ativas
   MCP version + tool count, Elite Proxy status, skills e agentes disponíveis

### 2. Leitura e Contexto
   Tabela: fonte | status ✅/⚠️

### 3. Sincronia de Memórias — Divergências
   PM2 real vs esperado, git status sujo, processos fantasma, etc.

### 4. Pendências Identificadas
   Tabela: # | prioridade | título | situação

Encerra com: "O que você quer atacar primeiro, Pivete?"
```

---

## Serviços esperados (referência rápida)

| PM2 | id | Porta | Estado desejado |
|---|---|---|---|
| CentralDark-EliteAnthropicProxy | 37 | 8082 | online |
| CentralDark-MCP | 33 | 9100 | online |
| CentralDark-HubBot | 27 | — | online |
| elite-http-gateway | 17 | 8080 | online |
| CentralDark-WebhookDeploy | 5 | — | online |
| CentralDark-GuardiaoAnalista | 29 | — | online |
| CentralDark-GuardiaoConsciencia | 28 | — | online |
| CentralDark-Respiracao | 31 | — | online |
| CentralDark-BotServer | 4 | — | ⚠️ ghost (script ausente) |
| whatsapp-server | 1 | — | stopped (desejado) |
| elite-anthropic-proxy | 38 | — | stopped (duplicado legado) |

---

## Notificações Telegram

A partir de 30/06/2026, o Claude Code envia notificação automática ao Pivete no Telegram ao finalizar cada resposta.

- **Script:** `scripts/notify-claude/notify-telegram.sh`
- **Hook:** `Stop` no `.claude/settings.json`
- **Cofre:** `secrets/telegram-alerts.env` (SRVER1_BOT_TOKEN + ADMIN_CHAT_ID)

Essa mesma rota é usada pelo GitHub (mesmos tokens). Qualquer evento anômalo no repo também passa por ela.

---

## Divergências conhecidas (30/06/2026)

| Divergência | Status |
|---|---|
| BotServer (id 4): script `apps/bot-server/start.sh` não existe | ⚠️ investigar |
| MultiZap-Gateway (id 3) + CloneDeck-CRM (id 6): pid N/A | ⚠️ processos legado ghost |
| EliteAnthropicProxy: 327 restarts (acumulado de dev cycle) | ℹ️ estável agora |
| Working tree: `apps/modulos/WebUI/var/` com dados de sistema | ⚠️ gitignore necessário |

---

## Conexões Rápidas

- [[00-POSTURA-PIVETE]] — quem é o Pivete
- [[MAPA-DOS-BOTS]] — quem faz o quê na automação
