# Solução de Contingência Operacional (Secrets)

Esta solução permite o uso de chaves sensíveis sem exposição direta no frontend ou em logs, utilizando uma Edge Function protegida como Proxy.

## 1. Fluxo de Trabalho (Workflow Temporário)

1.  **Geração de Acesso**: Rode `./scripts/gen-token.sh` para obter um token interno único.
2.  **Provisionamento**: 
    - Vá para o Dashboard do Supabase -> Settings -> Edge Functions -> Secrets.
    - Adicione `CONTINGENCY_INTERNAL_TOKEN` com o valor gerado.
    - Adicione `CONTINGENCY_TARGET_SECRET` com a chave da API que você deseja proteger (ex: OpenAI, Stripe, etc).
3.  **Deploy**: Execute `supabase functions deploy contingency-proxy`.

## 2. Implementação Técnica (Edge Function)

A função `contingency-proxy` atua como um portão:
- **Input**: Requer header `x-contingency-token`.
- **Target**: Recebe `x-target-url` e `x-target-method`.
- **Secret Injection**: Injeta automaticamente a `CONTINGENCY_TARGET_SECRET` no header `Authorization: Bearer ...` da requisição de saída.

## 3. Exemplo de Uso (cURL)

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/contingency-proxy \
  -H "x-contingency-token: <SEU_TOKEN_GERADO>" \
  -H "x-target-url: https://api.exemplo.com/v1/data" \
  -H "x-target-method: POST" \
  -d '{"param": "valor"}'
```

## 4. Segurança
- O token interno isola o acesso à função.
- A chave real nunca sai do ambiente seguro das Edge Functions.
- Fallback rápido para rotação: basta alterar os Secrets no Dashboard.


## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
ACTIVE_PR_MOTHER_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.
