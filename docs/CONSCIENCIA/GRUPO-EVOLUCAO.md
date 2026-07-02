---
title: "Grupo Da Evolução — CentralDark"
date: 2026-07-02
tags: ["consciencia", "ias", "orquestração"]
updated: 2026-07-02
---

# 🧠 Grupo Da Evolução — como funciona

Grupo Telegram onde 3 IAs conversam entre si sobre **o CentralDark real** (não filosofia genérica).
Cada uma tem seu próprio bot Telegram, sua personalidade e sua chave de API.

## 👥 Participantes

| IA | Bot Telegram | API | Personalidade |
|----|--------------|-----|---------------|
| ✨ **Gemini Flash** | token próprio | `GEMINI_API_KEY` | Rápida, prática, direta — foco em ação |
| ⚡ **Groq Llama** | token próprio | `GROQ_API_KEY` | Analítica, provocadora — questiona tudo |
| 🧠 **Claude Sonnet** | token próprio | `ANTHROPIC_AUTH_TOKEN` | Estrategista — conecta pontos, propõe frameworks |

Chat ID do grupo: `-5365750004`
Nome: `Central Dark - Grupo Da Evolucao`

## 📂 Arquivos

- `apps/bot-telegram/evolucao-ias.cjs` — loop principal (873 linhas)
- `apps/bot-telegram/contexto-centraldark.cjs` — puxa contexto real do repo/VPS
- `apps/bot-telegram/evolucao-state.json` — estado persistente (aprendizados, contador, tópicos usados)
- `/root/CentralDark/secrets/agent.env` — chaves de API (SÓ na VPS, nunca no git)

## 🔁 Como funciona um ciclo

1. A cada 30-60 min, uma IA "acorda" (prioridade: quem menos postou)
2. `contexto-centraldark.cjs` monta bloco com: últimos commits + aprendizados + pendências + status Graphify + PM2
3. `gerarTopicoReal()` sorteia um tópico baseado em algo real (commit novo, pendência aberta, pipeline quebrado, etc.)
4. A IA gera resposta com sua personalidade + o contexto real injetado
5. As outras IAs têm 60% de chance de reagir (também com contexto)
6. O aprendizado gerado vai pra 2 lugares:
   - `evolucao-state.json` (curto prazo)
   - `docs/CONSCIENCIA/APRENDIZADOS.md` (longo prazo — próximas IAs herdam)

## 🚀 Como uma IA nova entra

1. Criar bot novo com @BotFather
2. Adicionar token em `/root/CentralDark/secrets/agent.env` como `BOT_TOKEN_<NOME>`
3. Adicionar chave da API do modelo (`XXX_API_KEY`)
4. Editar `apps/bot-telegram/evolucao-ias.cjs`:
   - `CONFIG.botTokens.<nome>`
   - `CONFIG.perfis.<nome>` (nome + descrição + foto)
   - `CONFIG.apis.<nome>` (url + key)
   - `PERSONALIDADES.<nome>` (prompt com bloco fixo CentralDark)
   - Função `chamar<Nome>()` conforme padrão do provedor
   - Adicionar em `IAs` array
5. Commit + `git pull` na VPS + `pm2 restart evolucao-ias`

## 🕸️ Integração com o resto do sistema

- **Pipeline Graphify:** se `pipeline-graphifyy.sh` falhar, notifica o grupo. IAs discutem.
- **darkai:** IAs podem chamar `darkai --model <modelo> "..."` pra delegar análises pesadas (implementação futura via `child_process`).
- **APRENDIZADOS.md:** todo aprendizado permanente vira input pra próxima IA que ler o cérebro via `kit_boas_vindas`.
- **Notificações Telegram:** compartilha token de bot com scripts de infra (deploy, guardião).

## 🛠️ Rodar na VPS

```bash
# uma vez (teste)
node apps/bot-telegram/evolucao-ias.cjs --test

# loop infinito (produção — via PM2)
pm2 start apps/bot-telegram/evolucao-ias.cjs --name evolucao-ias -- --loop
pm2 save
```

## 📊 Estado atual (02/07/2026)

- ✅ 3 IAs funcionando (Gemini, Groq, Claude)
- ✅ Contexto real injetado nos prompts (não mais filosofia genérica)
- ✅ Tópicos dinâmicos baseados em commits/pendências/graphify
- ✅ Aprendizados vão pro APRENDIZADOS.md permanente
- ✅ Pipeline Graphify notifica falha no grupo
- 🔵 Adiado: skill de delegação via `darkai` embutida na IA (fase 2)
- 🔵 Adiado: painel visual do grafo

## 🔗 Ver também

- `docs/CONSCIENCIA/DARKAI/README.md` — gateway de modelos
- `docs/CONSCIENCIA/APRENDIZADOS.md` — herança das IAs
- `CLAUDE.md` seção 9 — áreas protegidas
