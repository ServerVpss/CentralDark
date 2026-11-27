---
title: "10 TROUBLESHOOTING"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🔧 Troubleshooting

> **📖 Pra quem é:** deu ruim, quer saber o que fazer.
> **⏱️ Tempo:** 5 minutos.

---

## Erros HTTP mais comuns

### 401 Unauthorized

**Sintoma:**
```
{"error":"Unauthorized"}
```

**Causa:** `DARKAI_ANON_KEY` errada ou não configurada.

**Solução:**
```bash
echo $DARKAI_ANON_KEY   # tá vazio? não configurado
# reconfigura no ~/.bashrc / ~/.zshrc
```

Se a variável tá certa mas ainda dá 401, a chave pode ter sido rotacionada. Pega a nova em Lovable → Settings → API Keys.

---

### 402 Payment Required (sem créditos)

**Sintoma:**
```
{"error":"sem_creditos","message":"Créditos Lovable esgotados"}
```

**Solução:** vai em Lovable → Settings → Plans & credits e recarrega.

---

### 429 Rate Limited

**Sintoma:**
```
{"error":"rate_limit"}
```

**Causa:** você (ou algum script) tá chamando demais em pouco tempo.

**Solução:**
- Espera 30-60s e tenta de novo
- Adiciona `sleep 1` entre chamadas em loops
- Considera cache local pra respostas repetidas

---

### 400 Bad Request

**Sintoma:** validação Zod falhou.

**Causa:** JSON malformado ou faltando campo `prompt`.

**Solução:** confere o payload:
```bash
darkai --debug "teste"   # mostra o request enviado
```

Ou testa direto com curl:
```bash
curl -X POST "$DARKAI_URL" \
  -H "Authorization: Bearer $DARKAI_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"oi"}'
```

---

### 500 Internal Server Error

**Sintoma:** edge function crashou.

**Solução:** olha os logs da edge:
- Lovable → Backend → Edge Functions → `ai-proxy` → Logs
- Ou usa tool: `edge_function_logs({function_name: "ai-proxy"})`

Erro comum: `LOVABLE_API_KEY` não configurada na Cloud. Solução: `ai_gateway--create`.

---

### Timeout

**Sintoma:** demora mais que 60s e cancela.

**Causa:** prompt gigante ou modelo lento.

**Solução:**
- Reduz o tamanho do prompt (max ~100k tokens)
- Troca pra modelo mais rápido: `--model google/gemini-3-flash-preview`
- Aumenta timeout do curl: dentro do `darkai.sh`, `--max-time 120`

---

## Erros do script `darkai` local

### `command not found: darkai`

**Solução:**
```bash
which darkai   # tá vazio? não tá no PATH
# adiciona no ~/.bashrc:
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc
```

### `darkai: DARKAI_URL não configurada`

**Solução:** configura as 3 variáveis:
```bash
export DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"
export DARKAI_ANON_KEY="..."
export DARKAI_MODEL="google/gemini-3-flash-preview"
```

### `jq: command not found`

O script tenta parsear JSON com `jq`, mas cai em fallback pra Python se não achar.

**Solução opcional:**
```bash
# Mac
brew install jq

# Ubuntu/Debian
sudo apt install jq
```

---

## Erros lógicos

### Resposta sempre vem em inglês

**Solução:** adiciona system prompt:
```bash
darkai --system "responda sempre em português brasileiro" "sua pergunta"
```

Ou muda o padrão editando o `darkai.sh`.

### Resposta cortada no meio

**Causa:** modelo atingiu limite de tokens.

**Solução:** pede resposta mais curta, ou usa modelo com contexto maior (`gemini-2.5-pro`).

### Modelo ignora instrução

**Solução:** usa modelo mais forte pra tarefa:
```bash
darkai --model openai/gpt-5.4 --system "..." "..."
```

---

## Debug avançado

### Ver o que tá sendo enviado

Adiciona `--debug` no `darkai.sh` (se tiver essa flag) ou usa `curl -v`:

```bash
curl -v -X POST "$DARKAI_URL" \
  -H "Authorization: Bearer $DARKAI_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"teste"}'
```

### Ver logs da edge function

```bash
# Via MCP:
mcp_custom_FNKF0--execute_command "supabase functions logs ai-proxy --project-ref kagejpghnwdfymddwxuf"
```

### Testar a edge function isolada

```bash
# Testa a edge sem passar pelo script darkai:
curl -X POST "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy" \
  -H "Authorization: Bearer $DARKAI_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"responda: pong","model":"google/gemini-3-flash-preview"}'
```

Se isso funciona mas o `darkai` não, o problema tá no script local.

---

## Contato de socorro

- Cola o erro no próprio Lovable e pede ajuda pra mim
- Ou usa `darkai --model openai/gpt-5.4 "tô com esse erro no darkai: <cola aqui>"` (irônico mas funciona)

---

## Fim do tutorial

Se você leu até aqui, sabe **tudo** que precisa. Volta pra [`00-COMECE-AQUI.md`](00-COMECE-AQUI.md) e testa cada exemplo.

**Uma chave. Infinitas possibilidades.** 🔑

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
