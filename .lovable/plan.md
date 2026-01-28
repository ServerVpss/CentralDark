
# Plano: Alinhar Notificações e Perfil ao Canto Direito

## Problema Identificado
O header tem `px-4 lg:px-6` que adiciona 24px de padding em ambos os lados. Para os elementos ficarem mais no "cantinho" direito, precisamos remover ou reduzir o padding da direita.

## Solução Proposta

### Alteração no Header.tsx

**Linha 37** - Trocar o padding simétrico por padding assimétrico:

```text
Antes:  px-4 lg:px-6
Depois: pl-4 lg:pl-6 pr-2 lg:pr-3
```

Isso mantém o padding esquerdo normal (para a barra de pesquisa) mas reduz o padding direito para ~12px, fazendo os elementos ficarem mais próximos da borda.

## Detalhes Técnicos

| Propriedade | Antes | Depois |
|-------------|-------|--------|
| Padding esquerdo | 16px / 24px | 16px / 24px (mantido) |
| Padding direito | 16px / 24px | 8px / 12px (reduzido) |

Isso fará a notificação e o perfil ficarem bem mais próximos do canto direito da tela, sem afetar a barra de pesquisa.
