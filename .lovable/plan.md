
# Plano: Corrigir Registro Automático de Webhook Efí

## Resumo
O botão "Registrar Webhook" no painel não está enviando a URL correta para a função de registro. Vamos corrigir isso para que o webhook seja registrado automaticamente para a chave PIX configurada.

## Problema Identificado
A função `handleRegisterWebhook` no componente `EfiGatewayConfigDialog.tsx` está chamando a edge function com um body vazio, mas a função `efi-register-webhook` espera receber o parâmetro `webhook_url`.

## Tarefas

### 1. Corrigir o componente EfiGatewayConfigDialog
Atualizar a função `handleRegisterWebhook` para enviar a URL do webhook automaticamente:
- Gerar a URL do webhook usando o project ID do Supabase
- URL: `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/efi-webhook`

### 2. Melhorar feedback do registro
- Mostrar a URL do webhook registrado no sucesso
- Exibir detalhes do erro se falhar

---

## Detalhes Tecnicos

### Arquivo: `src/components/payments/EfiGatewayConfigDialog.tsx`

**Modificacao na funcao handleRegisterWebhook (linhas 106-126):**

```typescript
const handleRegisterWebhook = async () => {
  setIsRegistering(true);
  try {
    // URL do webhook do projeto
    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/efi-webhook`;
    
    const { data, error } = await supabase.functions.invoke("efi-register-webhook", {
      body: { webhook_url: webhookUrl },
    });

    if (error) throw error;

    if (data?.success) {
      toast.success(`Webhook registrado: ${data.webhook_url}`);
    } else {
      toast.error(data?.error || "Erro ao registrar webhook");
    }
  } catch (error) {
    console.error("Register webhook error:", error);
    toast.error("Erro ao registrar webhook");
  } finally {
    setIsRegistering(false);
  }
};
```

### Fluxo apos correcao

1. Usuario clica em "Registrar" no painel
2. Sistema envia URL do webhook + credenciais para o proxy PHP
3. Proxy faz chamada mTLS para Efi: `PUT /v2/webhook/{pix_key}`
4. Efi associa o webhook a chave PIX configurada
5. Quando um pagamento for feito naquela chave, Efi envia notificacao para o endpoint

### Resultado esperado
- Clique em "Registrar" vai cadastrar automaticamente o webhook
- Pagamentos PIX serao confirmados automaticamente via webhook
- Usuarios serao liberados no grupo do Telegram sem intervencao manual
