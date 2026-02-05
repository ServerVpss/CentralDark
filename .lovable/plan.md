
# Plano: Corrigir Erro "Erro ao gerar PIX" no Bot Telegram

## Diagnóstico

O problema é que várias Edge Functions críticas para o fluxo de pagamento **não estão deployadas**:

| Edge Function | Status | Crítico para PIX? |
|--------------|--------|-------------------|
| `telegram-webhook` | ✅ Online | Sim |
| `efi-poll-pending` | ✅ Online | Sim (polling) |
| `api-query` | ✅ Online | Não |
| `efi-generate-pix` | ❌ **404 Not Found** | **SIM - Geração PIX** |
| `efi-check-status` | ❌ **404 Not Found** | Sim (verificação) |
| `efi-webhook` | ❌ **404 Not Found** | Sim (callback) |
| `pix-payment` | ❌ **404 Not Found** | Sim (web app) |
| `telegram-format-result` | ❌ **404 Not Found** | Não |
| `telegram-payment-handler` | ❌ **404 Not Found** | Sim (alternativo) |

### Fluxo de falha atual

Quando o usuário escolhe um plano no bot:
1. Bot chama `${SUPABASE_URL}/functions/v1/efi-generate-pix`
2. Função retorna **404 Not Found** 
3. Bot exibe "❌ Erro ao gerar PIX. Tente novamente em instantes."

### Causa raiz
As Edge Functions existem no código-fonte mas **não foram deployadas** na plataforma.

---

## Solução

### Etapa 1: Deploy das Edge Functions de Pagamento

Deployar as seguintes funções que estão faltando:

- `efi-generate-pix` (geração do QR Code PIX)
- `efi-check-status` (verificação de status)
- `efi-webhook` (callback da Efí)
- `pix-payment` (pagamento via web app)
- `telegram-payment-handler` (handler delegado)
- `telegram-format-result` (formatação de resultados)

### Etapa 2: Verificar Configuração no config.toml

Confirmar que todas as funções têm `verify_jwt = false` no arquivo de configuração.

### Etapa 3: Teste Funcional

Após deploy, testar chamando a função `efi-generate-pix` diretamente.

---

## Resultado Esperado

Após o deploy:
1. Usuário escolhe plano no bot
2. `efi-generate-pix` é chamada com sucesso
3. QR Code PIX é gerado e enviado ao usuário
4. Pagamento pode ser confirmado via polling ou webhook

---

## Observação sobre Insert Duplicado

O código do `telegram-webhook` (linha 2852) e `efi-generate-pix` (linha 141) ambos fazem insert em `pending_payments`, causando possível **duplicação**. No entanto, como `txid` tem constraint UNIQUE, o segundo insert falhará silenciosamente.

Isso não é crítico, mas pode ser otimizado futuramente removendo o insert redundante em um dos dois locais.
