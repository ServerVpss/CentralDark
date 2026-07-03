## Instalar `darkai` na VPS de forma persistente

Objetivo: deixar o comando `darkai` disponível pra qualquer usuário na VPS, com as variáveis já carregadas no ambiente, testado e funcionando.

### Passos

**1. Instalar o binário**
- `cp /root/CentralDark/docs/CONSCIENCIA/DARKAI/darkai.sh /usr/local/bin/darkai`
- `chmod +x /usr/local/bin/darkai`

**2. Configurar as variáveis pra todo mundo**
- Criar `/etc/profile.d/darkai.sh` com:
  - `export DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"`
  - `export DARKAI_ANON_KEY="<anon key pública do projeto Lovable Cloud>"`
  - `export DARKAI_MODEL="google/gemini-3-flash-preview"`
- `chmod 644 /etc/profile.d/darkai.sh`
- Assim qualquer shell novo (root ou não) já sobe com o darkai pronto.

**3. Testar de verdade**
- Rodar `bash -c 'source /etc/profile.d/darkai.sh && darkai "responda apenas: ok"'`
- Se voltar "ok" → selado.
- Se der erro (ex.: `jq` faltando, formato do ai-proxy diferente), corrijo na hora antes de terminar.

**4. Entregar o texto pronto pra Claude**
Um bloquinho curtinho que você cola no chat dela:
> "O `darkai` já tá instalado na VPS (`/usr/local/bin/darkai`) com as vars carregadas via `/etc/profile.d/darkai.sh`. Antes de qualquer leitura pesada do repo, delega pro Gemini com `darkai --model google/gemini-2.5-flash 'sua pergunta'`. Não usa Sonnet pra varrer árvore. Continua do passo 3 do teu roteiro."

### O que não vou fazer
- Não commito nada no git.
- Não toco em área protegida do CLAUDE.md.
- Não mexo em `~/.claude-proxy/` do teu PC.
- Não subo nem paro nada no PM2.