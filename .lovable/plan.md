

# Plano: Corrigir URL do Proxy PHP para Verificação de Status

## Problema Identificado

O código das Edge Functions está usando uma URL que **NÃO EXISTE** no seu servidor:

| Edge Function | URL Atual (ERRADA) | Arquivo Existente |
|---------------|-------------------|-------------------|
| `efi-poll-pending` | `efi-pix-proxy.php` | `efi-check-status.php` |
| `efi-check-status` | `efi-pix-proxy.php` | `efi-check-status.php` |

## Solução

Atualizar as duas Edge Functions para usar o endpoint correto que já existe no seu servidor.

---

## Mudanças Necessárias

### 1. Atualizar `efi-poll-pending/index.ts`

**Linha 104 - Trocar:**
```typescript
// DE:
const proxyUrl = 'https://api.segredounlock.com/efi-pix-proxy.php'

// PARA:
const proxyUrl = 'https://api.segredounlock.com/efi-check-status.php'
```

### 2. Atualizar `efi-check-status/index.ts`

**Linha 75 - Trocar:**
```typescript
// DE:
const proxyUrl = 'https://api.segredounlock.com/efi-pix-proxy.php'

// PARA:
const proxyUrl = 'https://api.segredounlock.com/efi-check-status.php'
```

---

## Verificação Necessária

Antes de fazer a mudança, preciso confirmar: o seu arquivo `efi-check-status.php` aceita o formato de requisição que estamos enviando?

O código envia:
```json
{
  "action": "check_status",
  "client_id": "...",
  "client_secret": "...",
  "txid": "414156cf592569365b25e1487a66250a"
}
```

Se o seu `efi-check-status.php` usar um formato diferente (por exemplo, apenas `txid` sem `action`), precisaremos ajustar o código também.

---

## Arquivos a Serem Editados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/efi-poll-pending/index.ts` | Linha 104: URL do proxy |
| `supabase/functions/efi-check-status/index.ts` | Linha 75: URL do proxy |

---

## Resultado Esperado

Após esta correção:
- O polling automático (cron job a cada minuto) conseguirá verificar o status dos pagamentos
- O botão "Já paguei" no Telegram funcionará corretamente
- Pagamentos serão confirmados automaticamente quando a Efí retornar `CONCLUIDA`

