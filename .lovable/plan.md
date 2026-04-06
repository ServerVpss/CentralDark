

# Adicionar Botão "Lista de Comandos" + Cores nos Botões do Telegram

## Problema
1. O botão "📋 Comandos" (lista de comandos) não aparece no Menu Principal — só aparece nos resultados de consulta
2. Os botões do Telegram estão todos com a cor padrão (cinza)

## Novidade do Telegram
A API do Telegram (Bot API 9.4, fevereiro 2026) adicionou o campo `style` nos botões `InlineKeyboardButton`. Valores possíveis:
- `"primary"` — azul
- `"success"` — verde  
- `"danger"` — vermelho

## Passo 1 — Adicionar botão "Comandos" no Menu Principal

No `telegram-webhook/index.ts`, adicionar o botão `📋 Comandos` no menu principal, logo antes do "Painel Admin":

```
buttons.push([btn("📋 Comandos", "show_commands")]);
```

## Passo 2 — Adicionar suporte a `style` nos botões

Atualizar a função `btn()` para aceitar um parâmetro `style` opcional:

```ts
function btn(text: string, data: string, style?: string): InlineButton {
  const b: any = { text, callback_data: data };
  if (style) b.style = style;
  return b;
}
```

## Passo 3 — Aplicar cores estratégicas nos botões do menu

| Botão | Estilo |
|-------|--------|
| 🔍 Fazer Consulta | `success` (verde) |
| 💳 Planos Privado / Assinar | `primary` (azul) |
| 👥 Planos Grupo | `primary` (azul) |
| 📋 Comandos | sem estilo (padrão) |
| ⚙️ Painel Admin | sem estilo (padrão) |
| 🚪 Entrar no Grupo | sem estilo (URL button) |

Nos resultados de consulta e confirmações de pagamento, aplicar `success` nos botões de ação principal.

## Passo 4 — Deploy

Deploy da edge function `telegram-webhook`.

## Arquivo modificado
- `supabase/functions/telegram-webhook/index.ts`

