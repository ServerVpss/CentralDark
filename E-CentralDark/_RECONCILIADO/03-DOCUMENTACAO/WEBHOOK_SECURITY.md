# Segurança de Webhooks (WuzAPI / Stripe / etc)

- Todos os endpoints de recebimento de webhook (`/api/webhooks/*`) devem validar o Request.
- Para o WuzAPI, verificar cabeçalhos, tokens estáticos ou HMAC gerado com secret compartilhado.
- Sem validação, a requisição deve ser rejeitada com `401 Unauthorized` ou `403 Forbidden`.
- Os webhooks não devem processar dados cegamente sem higienização e validação.
- Não imprimir o `payload` inteiro no log quando contiver dados sensíveis ou secrets, apenas o necessário para debugar (por exemplo: `received webhook for instance ID 1`).
