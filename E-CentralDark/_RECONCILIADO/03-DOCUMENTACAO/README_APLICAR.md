# Patch CRM → Gateway MultiZap

Substitua estes 3 arquivos no projeto:

- `src/lib/multizap-gateway.server.ts`
- `src/lib/whatsapp/providers/wuzapi-gateway.server.ts`
- `src/lib/tickets.functions.ts`

## O que foi corrigido

- `MULTIZAP_GATEWAY_TOKEN` continua sendo o nome oficial no Lovable/CRM.
- Fallback seguro para `GATEWAY_SERVER_TOKEN` quando existir no ambiente server-only.
- Nunca usa `MULTIZAP_WEBHOOK_SECRET` para CRM → Gateway.
- Logs mostram fingerprint seguro do token (`len` + `fnv8`) e a origem do token.
- Erro 401 CRM → Gateway não aplica cooldown anti-ban e não rebaixa a conexão para `error`.
- Erro 400 de payload/grupo não derruba status da conexão.
- Mensagens amigáveis para 401 e 400 no envio.

## Depois de colar

1. Rodar typecheck/build no Lovable.
2. Publicar/redeploy para o Worker carregar secrets.
3. Testar envio privado e grupo.
4. Conferir log do CRM:

```txt
[multizap-gateway] ... token len=68 fnv8=7d0c2c56, source=MULTIZAP_GATEWAY_TOKEN
```

Esse fingerprint precisa bater com a VPS.
