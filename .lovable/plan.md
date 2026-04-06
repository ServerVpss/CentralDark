

# Adicionar "Consulta solicitada por" em todas as respostas

## Problema
O footer com informações de quem solicitou a consulta (`📋 Consulta solicitada por:`) só existe no método `handleGroupCommand` (grupos). O método `processQuery` (chat privado e também usado em grupos) **não inclui** esse footer, por isso os resultados aparecem sem essa informação.

## Alterações

**Arquivo**: `supabase/functions/telegram-webhook/index.ts`

### 1. Adicionar footer no `processQuery`
Criar o mesmo bloco de footer que existe em `handleGroupCommand` (linha ~5317-5326) dentro do `processQuery`, logo após o resultado ser formatado (~linha 3824), usando o parâmetro `telegramUserName` já disponível e o `telegramUserId`.

O footer será adicionado a todos os caminhos de envio:
- Resultados com foto (sendPhoto caption)
- Resultados sem foto (sendLongMessagePaginated)
- Resultados multi-pessoa (formatMultiPersonPage)

### 2. Corrigir formato do footer no grupo
No `handleGroupCommand` (linha 5326), o footer atual mostra `@${userIdDisplay}` (ID numérico) em vez do nome real. Corrigir para usar `userName` (first_name) e `@${userInfo?.username}` quando disponível:

```
📋 Consulta solicitada por:
├ 👤 Nome do Usuário
├ 📝 @username (ou ID: 123456)
└ 🕐 06/04/2026, 12:39:00
```

### 3. Deploy
Deploy da Edge Function `telegram-webhook` atualizada.

