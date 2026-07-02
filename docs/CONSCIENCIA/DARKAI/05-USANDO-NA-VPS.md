# 🖥️ Usando na VPS

> **📖 Pra quem é:** você (ou uma IA na VPS) quer usar `darkai` como comando global.
> **⏱️ Tempo:** 4 minutos.

---

## Instalação em 3 passos

### 1. Copia o script pra `/usr/local/bin`

```bash
sudo cp /root/CentralDark/DARKAI/darkai.sh /usr/local/bin/darkai
sudo chmod +x /usr/local/bin/darkai
```

### 2. Configura as variáveis

Adiciona no `/etc/environment` (fica global pra todos os usuários e serviços):

```bash
DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"
DARKAI_ANON_KEY="eyJhbGci..."
DARKAI_MODEL="google/gemini-3-flash-preview"
```

Ou por usuário, no `~/.bashrc`:

```bash
export DARKAI_URL="..."
export DARKAI_ANON_KEY="..."
export DARKAI_MODEL="google/gemini-3-flash-preview"
```

Recarrega:
```bash
source ~/.bashrc
```

### 3. Testa

```bash
darkai "oi, tô te ouvindo da VPS?"
```

Se responder algo tipo "Sim! Estou aqui, pronto pra ajudar." — funcionou. 🎉

---

## Deixando disponível pra PM2 / serviços

Se você tem processos rodando via PM2 e quer que eles consigam usar `darkai`, tem que garantir que as variáveis estejam no ambiente do PM2:

```bash
# Adiciona as vars no ecosystem.config.js do PM2
# ou passa direto:
DARKAI_URL="..." DARKAI_ANON_KEY="..." pm2 restart all --update-env
pm2 save
```

---

## Deixando disponível pro Claude Code / IAs na VPS

Se você usa Claude Code (ou qualquer IA de código) direto na VPS, elas herdam as variáveis de ambiente do shell que iniciou. Então basta:

1. As variáveis estarem no `~/.bashrc` **antes** de você abrir o Claude
2. A IA consegue rodar `darkai "..."` como qualquer outro comando bash

Pra ensinar essas IAs a **preferir** usar o `darkai`, cola nelas o prompt do arquivo [`06-ENSINANDO-OUTRAS-IAS.md`](06-ENSINANDO-OUTRAS-IAS.md).

---

## Teste rápido de sanidade

```bash
# Deve responder "pong" ou similar
darkai "responda apenas com a palavra: pong"

# Deve retornar JSON válido
darkai --model google/gemini-3-flash-preview "responda apenas em JSON com {\"status\":\"ok\"}"

# Testa pipe
echo "Erro: timeout no banco às 14:23" | darkai "classifique este erro em: leve, médio, grave"
```

---

## Onde os secrets estão salvos?

- **Na Lovable Cloud (invisível pra você):** `LOVABLE_API_KEY` — a chave real que fala com Gemini/GPT
- **No `/etc/environment` ou `~/.bashrc` da VPS:** só a URL da edge + a anon key pública
- **No `/root/CentralDark/secrets/`:** cópia offline (se você quiser fallback direto sem passar pela edge)

A anon key pode até ir pro GitHub sem risco (é pública por design do Supabase). A `LOVABLE_API_KEY` **nunca sai da Cloud**.

---

Próximo: [`06-ENSINANDO-OUTRAS-IAS.md`](06-ENSINANDO-OUTRAS-IAS.md)
