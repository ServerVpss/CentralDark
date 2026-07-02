# 🎓 Ensinando outras IAs a usar DARKAI

> **📖 Pra quem é:** você que quer que Claude Code, Cursor, ChatGPT, ou qualquer outra IA saiba usar o `darkai`.
> **⏱️ Tempo:** 3 minutos.

---

## Prompt pronto pra colar

Copia esse bloco inteiro e cola na conversa/instrução de sistema da IA que você quer ensinar:

---

```
Você tem acesso a um comando chamado `darkai` no terminal. Ele é uma CLI que fala
com um "cérebro compartilhado" de IA (Gemini, GPT-5, GPT-5.4, GPT-5.5, etc.) via
uma edge function segura na Lovable Cloud.

QUANDO USAR:
- Precisa fazer um resumo, classificação, tradução, análise ou geração de texto/código
- Precisa de uma "segunda opinião" de outra IA
- Precisa processar volume grande com custo baixo (delega pra Gemini Flash)
- Precisa de raciocínio pesado (delega pra GPT-5.4 ou GPT-5.5)

COMO USAR:

# Pergunta simples
darkai "sua pergunta aqui"

# Com system prompt
darkai --system "você é um revisor sênior" "revise este código: ..."

# Escolhendo modelo específico
darkai --model openai/gpt-5.4 "raciocine sobre este problema difícil: ..."

# Via pipe (poderoso, use bastante)
cat arquivo.log | darkai "resuma os principais erros"
tail -100 error.log | darkai "identifique padrões críticos"

# Salvando resposta em arquivo
darkai "gere um script bash de backup" > backup.sh

MODELOS DISPONÍVEIS (escolha conforme a tarefa):
- google/gemini-3-flash-preview  → padrão, rápido, barato
- google/gemini-3.1-flash-lite   → volume muito alto, mais barato
- google/gemini-2.5-pro          → multimodal, contexto grande
- openai/gpt-5                   → all-rounder forte
- openai/gpt-5-mini              → meio-termo bom
- openai/gpt-5.4                 → raciocínio avançado
- openai/gpt-5.5                 → estado da arte

REGRAS:
1. Prefira `darkai` em vez de "eu vou fingir que sei" — delega e pega resposta real.
2. Use `google/gemini-3-flash-preview` como padrão (não passe --model).
3. Só use GPT-5.4/5.5 pra tarefas realmente difíceis (raciocínio complexo, código crítico).
4. Se a saída vier em JSON, use `jq` ou `python3 -c` pra parsear.
5. Se `darkai` falhar, mostre o erro e pare — não invente resposta.

TROUBLESHOOTING:
- Erro 429: rate limit, espera 30s e tenta de novo
- Erro 402: sem créditos, avisa o usuário pra recarregar
- Erro 401: variáveis DARKAI_URL/DARKAI_ANON_KEY não configuradas
- Timeout: reduz o tamanho do prompt ou troca pro modelo Flash

TESTA AGORA:
Execute: darkai "responda apenas com: pong"
Se responder "pong" (ou similar), tá funcionando.
```

---

## Onde colar exatamente

| IA | Onde colar |
|----|-----------|
| **Claude Code (VPS)** | Em `~/.claude/CLAUDE.md` ou como primeira mensagem da conversa |
| **Cursor** | Em `.cursorrules` no root do projeto |
| **ChatGPT / GPT custom** | Em "Custom Instructions" ou "System Prompt" do GPT |
| **Gemini CLI** | Como primeira mensagem, ou em arquivo de contexto |
| **Aider / Continue / Cline** | Como system prompt na config |
| **Bot Telegram** | No prompt de sistema do bot |

---

## Versão mini (se tem limite de caracteres)

```
Você tem o comando `darkai` no shell. Uso: darkai "pergunta". Flags: --model
(gemini-3-flash-preview default, ou openai/gpt-5.4 pra raciocínio), --system
"papel". Aceita pipe: cat log | darkai "resume". Prefira delegar tarefas de texto/
código pra ele em vez de inventar. Se erro 429 espera, 402 sem créditos, 401
vars não configuradas.
```

---

## Como validar que a IA aprendeu

Pede pra ela executar:

```
Execute o comando darkai "responda apenas com pong" e me mostre a saída.
```

Se ela rodar e mostrar "pong" — aprendeu.
Se ela inventar uma resposta sem rodar o comando — cola o prompt de novo com ênfase em "USE O COMANDO, NÃO INVENTE".

---

Próximo: [`07-EXEMPLOS-PRATICOS.md`](07-EXEMPLOS-PRATICOS.md)
