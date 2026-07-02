# ⚡ QUICKSTART — darkai em 5 minutos

> Zero enrolação. Copia, cola, roda.

---

## 1️⃣ O que é (30 segundos)

`darkai` = um comando no terminal que fala com Gemini / GPT-5 / etc **usando uma chave só** que fica segura na Lovable Cloud. Você não precisa de conta OpenAI, não precisa de chave própria, funciona igual no seu PC e na VPS.

```bash
darkai "qual a capital da Mongólia?"
# → Ulan Bator
```

---

## 2️⃣ Instalar (2 minutos)

### Na VPS (`/root/CentralDark/`)
```bash
sudo cp docs/CONSCIENCIA/DARKAI/darkai.sh /usr/local/bin/darkai
sudo chmod +x /usr/local/bin/darkai
darkai "diz oi"
```

### No seu PC (Mac / Linux)
```bash
cd docs/CONSCIENCIA/DARKAI
bash instalar-local.sh
# depois edita ~/.zshrc (ou ~/.bashrc) e cola sua DARKAI_ANON_KEY
source ~/.zshrc
darkai "diz oi"
```

### No Windows (PowerShell)
```powershell
cd docs\CONSCIENCIA\DARKAI
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\instalar-windows.ps1
```

### Variáveis necessárias (só uma vez)
```bash
export DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"
export DARKAI_ANON_KEY="<anon key do Supabase — pública, ok expor>"
export DARKAI_MODEL="google/gemini-3-flash-preview"   # opcional (padrão)
```

---

## 3️⃣ Comandos essenciais

```bash
# ajuda completa
darkai --help

# lista todos os modelos disponíveis
darkai --list-models

# pergunta simples (usa Gemini 3 Flash, o padrão)
darkai "resume a Segunda Guerra em 3 linhas"

# define papel/contexto da IA
darkai --system "você é um SRE ranzinza" "o servidor caiu, o que faço?"

# troca de modelo (raciocínio pesado)
darkai --model openai/gpt-5.4 "analisa esse contrato: <cola texto>"

# barato + rápido pra volume
darkai --model google/gemini-3.1-flash-lite "classifica: BOM ou RUIM: '$FRASE'"

# via pipe (mais poderoso!)
tail -100 /var/log/nginx/error.log | darkai "resume os erros mais graves"
cat contrato.pdf | darkai "extrai as datas importantes"
pm2 logs --lines 200 --nostream | darkai --system "SRE objetivo" "o que quebrou?"

# salva resposta em arquivo
darkai "gera um script bash de backup diário" > backup.sh
chmod +x backup.sh
```

---

## 4️⃣ Exemplo real (copia e testa)

```bash
# analisa o último commit e sugere melhorias
git log -1 -p | darkai --model openai/gpt-5.4 \
  --system "você é revisor de código sênior, seja direto" \
  "revise este diff e liste os 3 riscos principais"
```

Saída esperada: 3 bullets com riscos concretos. Se voltar isso, **tá funcionando**. ✅

---

## 5️⃣ Modelos que você mais vai usar

| Quando | Modelo | Por quê |
|--------|--------|---------|
| Default de tudo | `google/gemini-3-flash-preview` | Rápido, barato, multimodal |
| Volume enorme / classificação | `google/gemini-3.1-flash-lite` | Ainda mais barato |
| Raciocínio pesado / código crítico | `openai/gpt-5.4` | Advanced reasoning |
| Estado da arte | `openai/gpt-5.5` | Melhor de todos (caro) |
| Contexto gigante / multimodal | `google/gemini-2.5-pro` | 1M+ tokens |

Lista completa: `darkai --list-models`

---

## 6️⃣ Ensinar outra IA a usar

Cola o arquivo [`PROMPT-UNIVERSAL.md`](PROMPT-UNIVERSAL.md) inteiro nela (Claude/Cursor/ChatGPT/Gemini). Fim.

---

## 7️⃣ Deu erro?

| Erro | O que é | Solução |
|------|---------|---------|
| `command not found: darkai` | Não copiou o script | Volta pro passo 2 |
| `DARKAI_URL não configurada` | Faltou export | Passo 2 (variáveis) |
| `error: sem_creditos` (402) | Créditos Lovable zerados | Settings → Plans & credits |
| `error: rate_limited` (429) | Muitas chamadas | Espera 30s |
| Resposta vazia | Edge function offline | Ver [`10-TROUBLESHOOTING.md`](10-TROUBLESHOOTING.md) |

---

## 📚 Depois disso

- Curso completo: [`00-COMECE-AQUI.md`](00-COMECE-AQUI.md)
- Exemplos prontos: [`exemplos/`](exemplos/)
- Como orquestrar várias IAs: [`09-ARQUITETURA-E-ORQUESTRACAO.md`](09-ARQUITETURA-E-ORQUESTRACAO.md)
