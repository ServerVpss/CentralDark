
# Plano: Fazer o Webhook Efí Funcionar (além do Polling)

## Diagnóstico Atual

### O que ESTÁ funcionando:
- ✅ Edge Function `efi-webhook` está **ONLINE e processando pagamentos** (logs confirmam)
- ✅ Polling via `efi-poll-pending` funciona corretamente
- ✅ Transações são confirmadas e usuários notificados

### O que NÃO está funcionando:
- ❌ Edge Function `efi-register-webhook` **não está deployada** (404)
- ❌ Webhook da Efí não está registrado apontando para seu servidor

### Por que só o polling funciona:
O polling faz verificação ativa a cada minuto. O webhook dependeria de:
1. Registro do webhook na Efí → apontar para `api.segredounlock.com/webhook-efi-relay.php`
2. PHP relay encaminhar notificações para `efi-webhook` do Supabase
3. Efí enviar notificações instantâneas após cada pagamento

---

## Solução

### Etapa 1: Corrigir e Deployar `efi-register-webhook`

A função está com import `esm.sh` que causa timeout. Precisa mudar para `jsr:@supabase/supabase-js@2`.

```typescript
// Linha 1: Mudar de
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Para
import { createClient } from "jsr:@supabase/supabase-js@2";
```

### Etapa 2: Corrigir PHP `webhook-efi-relay.php`

O arquivo atual está correto, mas precisa estar **no servidor** `api.segredounlock.com` com:

```php
// URL da Edge Function (já correto)
$edgeFunctionUrl = 'https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/efi-webhook';
```

Arquivo a colocar em `api.segredounlock.com`:

```php
<?php
/**
 * webhook-efi-relay.php
 * Recebe notificações da EFI e encaminha para Edge Function do Supabase
 */
header('Content-Type: application/json');

// IMPORTANTE: A EFI exige resposta rápida 2xx
// Responder imediatamente e processar em background

$edgeFunctionUrl = 'https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/efi-webhook';

// Ler body cru
$input = file_get_contents('php://input');

// Log para debug
error_log("EFI Webhook recebido: " . $input);

// Encaminhar para Edge Function
$ch = curl_init($edgeFunctionUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log resultado
error_log("Relay para Supabase: HTTP $httpCode - $response");

if ($error) {
    error_log("Curl error: $error");
}

// Retornar 200 para a EFI não retentar
http_response_code(200);
echo json_encode([
    'received' => true,
    'forwarded' => $httpCode >= 200 && $httpCode < 300
]);
```

### Etapa 3: Registrar Webhook na Efí

Após deploy, registrar o webhook chamando:

```bash
POST /functions/v1/efi-register-webhook
{
  "webhook_url": "https://api.segredounlock.com/webhook-efi-relay.php"
}
```

Isso vai usar o `efi-webhook-register.php` no seu servidor para fazer o registro mTLS na Efí.

### Etapa 4: Verificar Registro

Usar `efi-get-webhook.php` para confirmar que está registrado:

```bash
POST https://api.segredounlock.com/efi-get-webhook.php
{
  "client_id": "...",
  "client_secret": "...",
  "pix_key": "dc976027-6f59-4808-af31-787f7f9bccb4"
}
```

---

## Arquivos PHP Necessários em `api.segredounlock.com`

| Arquivo | Função |
|---------|--------|
| `cert.p12` | Certificado mTLS da Efí |
| `efi-generate-pix.php` | Gerar cobrança PIX |
| `efi-check-status.php` | Verificar status de cobrança |
| `efi-webhook-register.php` | Registrar webhook na Efí |
| `efi-get-webhook.php` | Consultar webhook registrado |
| `webhook-efi-relay.php` | Receber notificação e encaminhar para Supabase |

---

## Fluxo Completo após Implementação

```text
1. Usuário paga PIX no banco
       ↓
2. Efí detecta pagamento
       ↓
3. Efí envia POST para api.segredounlock.com/webhook-efi-relay.php
       ↓
4. PHP relay encaminha para Supabase /functions/v1/efi-webhook
       ↓
5. Edge Function:
   - Busca transação pelo txid
   - Marca como paga
   - Cria assinatura
   - Deleta mensagem do QR
   - Envia confirmação no Telegram
   - Anuncia no grupo (se habilitado)
       ↓
6. Usuário recebe "PAGAMENTO CONFIRMADO!" instantaneamente
```

---

## Resumo das Alterações

### No Supabase:
1. Corrigir import em `efi-register-webhook/index.ts` (esm.sh → jsr:)
2. Redeploy da função

### No seu servidor `api.segredounlock.com`:
1. Garantir que `webhook-efi-relay.php` está no servidor
2. Registrar webhook apontando para esse PHP
3. Testar com pagamento real

### Teste Final:
1. Gerar PIX pelo bot
2. Pagar
3. Verificar se confirmação chega ANTES do polling (menos de 30 segundos)

