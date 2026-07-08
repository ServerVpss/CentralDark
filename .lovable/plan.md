# Plugar Codex CLI na bridge oficial (`bridge.centralldark.com`)

## O que muda em relação à tentativa anterior

Já existe uma bridge oficial rodando em `https://bridge.centralldark.com/v1` com a chave correta (`cd-webui-…`). Não precisa gerar chave nova, nem rotacionar secret, nem apontar direto pra edge do Supabase. É só configurar o Codex pra falar com essa bridge.

## Passos

1. **Regravar `/etc/centraldark/codex.env` na VPS** com a URL e chave certas:
   ```
   OPENAI_BASE_URL=https://bridge.centralldark.com/v1
   OPENAI_API_KEY=cd-webui-cb96bd32f318a9020553aa12f26d95bca2275f8d687c0bf3
   OPENAI_MODEL=openai/gpt-5
   ```
   Permissão `chmod 600`, dono root.

2. **Teste 1 — curl direto na bridge** pra provar que auth + rota funcionam antes de envolver o Codex:
   ```
   curl -sS -X POST https://bridge.centralldark.com/v1/chat/completions \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"vivo"}]}'
   ```
   Espera-se resposta JSON válida. Se der `chave_invalida`, paro aqui e reporto.

3. **Teste 2 — Codex CLI não-interativo** com sintaxe correta (o `codex exec` do 0.141 lê stdin quando o prompt vem posicional; passar via stdin resolve):
   ```
   source /etc/centraldark/codex.env
   echo "responda apenas: vivo" | codex exec -m "$OPENAI_MODEL"
   ```

4. **Atualizar a doc** `docs/CONSCIENCIA/DARKAI/CODEX-VIA-AI-PROXY.md`:
   - Trocar a URL antiga (`kagejpghnwdfymddwxuf.functions.supabase.co/ai-proxy/v1`) pela bridge oficial (`bridge.centralldark.com/v1`).
   - Registrar que a autenticação usa chave `cd-webui-…` já provisionada.
   - Manter o bloco das 3 telas em `tmux` (só a URL muda).

5. **Não vou** (fora do escopo desta rodada):
   - Subir 3 telas `tmux` automaticamente — deixo o comando pronto na doc pra você disparar quando quiser.
   - Mexer em PM2, edge functions, ou rotacionar chave.
   - Ecoar a chave em log, chat ou commit.

## Prova de fim

- `curl` retornando 200 com corpo JSON da OpenAI-compat.
- `codex exec` respondendo "vivo".
- Doc atualizada refletindo a bridge oficial.

## Detalhes técnicos

- A bridge `bridge.centralldark.com` já expõe formato OpenAI-compat (`/v1/chat/completions`), então nenhum shim novo é necessário — ela é o shim.
- Chave `cd-webui-…` fica **só** em `/etc/centraldark/codex.env` (600, root). Nunca em repo, nunca em log.
- Se o teste 1 falhar com 401, a hipótese é que a bridge valide contra outra secret do lado dela (VPS/Caddy); nesse caso reporto sem tentar rotacionar nada.
