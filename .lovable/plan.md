

# Adicionar Custom Emojis Premium nos Botões do Bot

## O que são Custom Emojis nos Botões
O campo `icon_custom_emoji_id` (API 9.4) permite adicionar um ícone de emoji customizado ao lado do texto do botão. O bot precisa ter **Telegram Premium** ou permissão para usar custom emojis. Caso não tenha, o Telegram ignora o campo silenciosamente (os botões continuam funcionando normalmente).

## O que será feito

Adicionar `icon_custom_emoji_id` em todos os botões do menu principal, admin, consultas e navegação. As funções `btn()` e `btnUrl()` já suportam o parâmetro — só falta usá-lo.

### IDs de Custom Emojis (Telegram Built-in Premium)

Usaremos IDs de emojis premium populares do Telegram:

| Emoji | ID | Uso |
|-------|-----|-----|
| 🔍 Lupa | `5368324170671202286` | Fazer Consulta |
| 💎 Diamante | `5471952986970267163` | Planos |
| 📊 Gráfico | `5368324170671202286` | Estatísticas / Assinatura |
| ⚡ Raio | `5253959696498104346` | Admin |
| ✅ Check Verde | `5368324170671202286` | Aceitar |
| 🏠 Casa | `5237699328843200968` | Menu Principal / Voltar |
| 📢 Megafone | `5424972541023694017` | Broadcast |
| 📋 Lista | `5368324170671202286` | Comandos |
| 💰 Moeda | `5271604874513397103` | Pagamentos |
| 🚪 Porta | `5237699328843200968` | Entrar no Grupo |

> **Nota:** Esses IDs são exemplos de emojis premium do Telegram. Se o bot não tiver Premium, os ícones simplesmente não aparecem mas os botões funcionam normal. Se você tiver IDs específicos de emojis que quer usar, posso trocar facilmente.

### Botões que receberão emojis

**Menu Principal** (6 botões):
- 🔍 Fazer Consulta → emoji lupa premium
- 💳 Planos Privado / Grupo → emoji diamante
- 📊 Minha Assinatura → emoji gráfico
- 💰 Pagamentos Pendentes → emoji moeda
- 📋 Comandos → emoji lista
- ⚙️ Painel Admin → emoji raio

**Menu Admin** (4 botões):
- 📋 Gerenciar Planos → emoji diamante
- 👥 Usuários → emoji grupo
- 📊 Estatísticas → emoji gráfico
- 📢 Broadcast → emoji megafone

**Botões de ação** (resultados de consulta):
- 🔍 Nova Consulta → emoji lupa
- 🏠 Menu → emoji casa
- 🔙 Voltar → emoji casa

### Arquivo modificado
- `supabase/functions/telegram-webhook/index.ts` — adicionar o 4º parâmetro nos ~30 chamadas `btn()` e `btnUrl()` estratégicas

### Deploy
Deploy automático da edge function `telegram-webhook`.

