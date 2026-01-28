
# Plano: Unificar Foto e Dados em Uma Única Mensagem

## Problema Identificado

Atualmente, quando o bot encontra uma foto no comando `/foto`, ele envia **duas mensagens separadas**:

1. **Mensagem 1**: Foto com caption simples ("FOTO ENCONTRADA", consulta, solicitante)
2. **Mensagem 2**: Dados completos formatados (nome, CPF, dados pessoais, endereço, etc.)

O usuário quer que, quando os dados couberem no limite do caption (1024 caracteres), tudo seja enviado em **uma única mensagem** junto com a foto.

## Solução Proposta

Modificar a função `handleGroupCommand` para:

1. **Tentar enviar tudo junto** primeiro - verificar se o resultado formatado + footer cabe no limite de 1024 caracteres do caption
2. **Se couber**: enviar apenas a foto com caption contendo todos os dados
3. **Se não couber**: manter o comportamento atual de duas mensagens (foto + texto separado com paginação)

## Alterações Técnicas

### Arquivo: `supabase/functions/telegram-webhook/index.ts`

**Linhas ~2407-2437** - Modificar a lógica de envio quando há foto válida:

```text
Antes:
- Sempre envia foto com caption simples
- Sempre envia segunda mensagem com dados formatados

Depois:
- Calcular tamanho do resultado formatado + footer
- Se <= 1024 caracteres: enviar foto com caption completo (única mensagem)
- Se > 1024 caracteres: manter comportamento atual (foto + texto separado)
```

### Lógica Proposta

```typescript
if (isValidPhotoUrl) {
  // Tentar enviar tudo em uma mensagem só
  const fullCaption = formattedResult + consultaFooter;
  
  if (fullCaption.length <= 1024) {
    // Cabe no caption - enviar tudo junto
    const sentPhoto = await telegramRequest(this.token, "sendPhoto", {
      chat_id: chatId,
      photo: fotoUrl,
      caption: fullCaption,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
      reply_markup: keyboard([btn("🗑️ Apagar", "delete_msg")]),
    });
    // ... apenas uma mensagem enviada
  } else {
    // Não cabe - manter comportamento atual (foto simples + texto separado)
    // ... código existente
  }
}
```

## Benefícios

| Antes | Depois |
|-------|--------|
| Sempre 2 mensagens para `/foto` | 1 mensagem quando dados são curtos |
| Interface poluída | Interface mais limpa |
| Precisa scroll para ver tudo | Tudo visível de uma vez |

## Resultado Esperado

Para consultas como o exemplo do Neymar com poucos dados:
- ✅ Uma única mensagem com foto + todos os dados
- ✅ Footer de metadados incluído
- ✅ Botão "Apagar" disponível

Para consultas com muitos dados (ex: 50 parentes, histórico de endereços):
- ✅ Foto com caption resumido
- ✅ Segunda mensagem com dados completos paginados (comportamento atual)
