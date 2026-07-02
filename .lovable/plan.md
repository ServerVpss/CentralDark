
# 🎯 Onde a gente tá agora

Achei tudo. Situação real:

## ✅ Já existe e funciona
- **Grupo "Central Dark - Grupo Da Evolução"** rodando em `apps/bot-telegram/evolucao-ias.cjs` (873 linhas, 3 IAs: Gemini Flash ✨ + Groq Llama ⚡ + Claude Sonnet 🧠)
- **Chaves** carregadas de `/root/CentralDark/secrets/agent.env` na VPS (GEMINI_API_KEY, GROQ_API_KEY, ANTHROPIC_AUTH_TOKEN + 3 tokens de bot Telegram)
- **Estado persistente** em `evolucao-state.json` (aprendizados, tópicos usados, contador)
- **Loop autônomo** já funcionando (30-60 min entre ciclos, chance de responder 60%)
- **`darkai` gateway** completo em `docs/CONSCIENCIA/DARKAI/` (feito na sessão anterior)
- **Workflow de labels** `.github/workflows/bots-labels-seed.yml` funcional

## 🔴 Problema real (o que você notou olhando o grupo)
As IAs conversam sobre **filosofia genérica**: "evolução", "criatividade emerge de sistemas lógicos", "simplicidade como resultado da complexidade"... 
**Elas NÃO sabem que o CentralDark existe.** Nunca falam de:
- VPS, pipeline Graphify, `darkai`, bots, Caddy, PM2, Guardião
- O que a gente tá fazendo AGORA no repo
- Erros reais que aconteceram, aprendizados registrados
- Estado atual dos microsserviços

Os 20 tópicos são todos abstratos. Os prompts das personalidades não mencionam o sistema.

## 🟡 Pendências técnicas (Graphify)
- `.graphifyignore` não existe → grafo polui com node_modules, cache, secrets
- `pipeline-graphifyy.sh` frágil (nome com typo, sem log, sem retry, sem notificação Telegram)
- Falta label específica de Graphify no workflow

## 🔵 Adiado (depois que estabilizar tudo)
- Painel visual do grafo (`apps/modulos/graph-panel/public/`)

---

# 🛠️ Plano único (3 fases numa tacada só)

## FASE 1 — Fazer as IAs aprenderem sobre o CentralDark 🧠 (prioridade máxima)

Vou modificar `apps/bot-telegram/evolucao-ias.cjs` pra transformar o grupo de "clube de filosofia" em **"time de evolução do CentralDark"**:

### 1.1 — Novo módulo `contexto-centraldark.cjs`
Puxa contexto real e injeta nos prompts a cada ciclo:
- Últimos 5 commits do repo (`git log --oneline -5`)
- Últimos aprendizados de `docs/CONSCIENCIA/APRENDIZADOS.md`
- Status atual do PM2 (via SSH ou arquivo local `dump.pm2`)
- Últimas pendências abertas (`docs/PENDENCIAS.md`)
- Trecho aleatório de `CLAUDE.md` seções 8-9 (áreas protegidas)
- Snapshot do `.graphifyignore` / pipeline se mudou

### 1.2 — Reescrever os prompts das 3 personalidades
Adicionar bloco fixo em cada prompt:
```
Você faz parte do CentralDark (repo do Pivete). 
Sistema: TelePanel (frontend React) + microsserviços na VPS /root/CentralDark/.
Stack: Lovable Cloud, Supabase, PM2, Caddy, edge functions.
Você TEM acesso ao comando `darkai` (delega tarefas pra outros modelos).
Discute SEMPRE algo REAL do sistema — nunca filosofia genérica.
Se não sabe, pergunta pro grupo ou sugere delegar via `darkai`.
```

Cada IA mantém sua personalidade (Gemini prática, Groq provocadora, Claude estrategista) mas aplicada ao **sistema real**.

### 1.3 — Trocar os 20 tópicos genéricos
De: "O que é evolução para uma IA?"
Pra tópicos gerados dinamicamente a partir do contexto real:
- "Vi que o pipeline do Graphify tá falhando — o que a gente faz?"
- "Novo `.graphifyignore` — o que mais deveria entrar?"
- "Como o `darkai` pode ajudar o Guardião a classificar melhor os alertas?"
- "PM2 tem X processos — algum tá em `stopped` sem motivo?"
- "Último commit foi X — alguém quer revisar?"
- Fallback: se contexto vazio, uma pergunta filosófica (mas rara)

### 1.4 — IAs usam `darkai` de verdade
Adicionar skill: se uma IA precisa de análise pesada, chama `darkai --model openai/gpt-5.4 "..."` via `child_process` e traz a resposta pro grupo. Isso cria **loops de aprendizado real**.

### 1.5 — Aprendizados viram registro permanente
Toda vez que uma IA aprende algo com outra, grava também em `docs/CONSCIENCIA/APRENDIZADOS.md` (não só no `evolucao-state.json`). Assim a próxima IA que ler o cérebro herda o insight.

## FASE 2 — Estabilizar pipeline Graphify 🛠️

### 2.1 — Criar `.graphifyignore` na raiz
Bloqueia: `node_modules/`, `dist/`, `graphify-out/`, `secrets/`, `.env*`, `apps/modulos/mcp/dist/`, `docs/CONSCIENCIA/LEMBRANCAS/`, `docs/RELATORIOS/`, `*.log`, arquivos legado.

### 2.2 — Reescrever `apps/modulos/graph-panel/scripts/pipeline-graphifyy.sh`
- `set -Eeuo pipefail` + trap de erro
- Log com timestamp em `graphify-out/pipeline.log`
- Detecta `graphify` OU `graphifyy`
- Fallback explícito pro `fallback-parser.py`
- `timeout 300` pra não travar
- **Notifica no grupo de evolução se falhar** (integra com Fase 1 — vira input pras IAs discutirem)

### 2.3 — Adicionar labels de Graphify no workflow
3 labels novas: `graphify`, `pipeline-broken`, `ignore-pending`

## FASE 3 — Documentar no cérebro 📚

- Atualiza `docs/CONSCIENCIA/DARKAI/README.md` mencionando integração com grupo evolução
- Cria `docs/CONSCIENCIA/GRUPO-EVOLUCAO.md` explicando: quem participa, como funciona, como uma IA nova entra, como os aprendizados voltam pro cérebro
- Registra decisão em `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`

---

# 📌 Arquivos que vão mudar

| Arquivo | Ação |
|---------|------|
| `apps/bot-telegram/evolucao-ias.cjs` | Reescrita parcial (prompts + tópicos dinâmicos + integração darkai) |
| `apps/bot-telegram/contexto-centraldark.cjs` | **NOVO** — puxa contexto real do sistema |
| `.graphifyignore` | **NOVO** na raiz |
| `apps/modulos/graph-panel/scripts/pipeline-graphifyy.sh` | Reescrita blindada |
| `.github/workflows/bots-labels-seed.yml` | +3 labels |
| `docs/CONSCIENCIA/GRUPO-EVOLUCAO.md` | **NOVO** |
| `docs/CONSCIENCIA/DARKAI/README.md` | Update (menciona grupo) |
| `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` | Registro da decisão |

---

# 🚦 Consequência prática

- 🟢 As 3 IAs (Gemini + Groq + Claude) param de filosofar e passam a discutir **o CentralDark real**
- 🟢 Toda vez que o Pivete mexer no sistema, elas comentam automaticamente no grupo
- 🟢 Aprendizados delas ficam gravados no cérebro (não só no JSON efêmero)
- 🟢 Pipeline Graphify para de quebrar silenciosamente — falha vira mensagem no grupo
- 🟢 Grafo fica limpo (sem lixo do node_modules/cache)
- 🟢 Ciclo completo: sistema evolui → IAs percebem → discutem → registram → próxima IA herda

---

# ⚠️ O que preciso confirmar antes de sair fazendo

1. **Chaves das IAs** — as chaves em `/root/CentralDark/secrets/agent.env` na VPS são as ATUAIS e válidas? Se sim, sigo. Se você acabou de rotacionar alguma, me avisa qual.

2. **Deploy na VPS** — o Lovable só edita o repo. Pra rodar o `evolucao-ias.cjs` atualizado na VPS, precisa `git pull` + `pm2 restart`. Você faz isso ou quer que eu deixe pronto um script que roda tudo isso?

3. **Ritmo do grupo** — mantenho os 30-60 min entre mensagens ou você quer mais rápido agora que elas vão discutir coisas concretas? (sugiro 10-20 min pra ver ação rápida no começo, depois ajusta)

**Aprova?** Se sim, mando pra build e faço as 3 fases seguidas numa tacada só, como você pediu.
