
## Animação de Pulsação para Indicador Online dos Bots

### Objetivo
Adicionar uma animação de pulsação atraente ao indicador verde "online" dos bots, criando um efeito visual que chama a atenção quando o bot está ativo.

### Componentes Afetados
1. **BotStatusCard** (Dashboard) - O card exibido na página inicial
2. **Bots.tsx** - A lista de bots na página de gerenciamento
3. **BotHealthMonitor** - O monitor de saúde dos bots

### Implementação

#### 1. Nova Animação no Tailwind
Adicionar uma animação personalizada `pulse-glow` no `tailwind.config.ts` que cria um efeito de pulsação com brilho verde:

```text
keyframes: {
  "pulse-glow": {
    "0%, 100%": {
      opacity: "1",
      boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)"
    },
    "50%": {
      opacity: "0.8",
      boxShadow: "0 0 0 8px rgba(34, 197, 94, 0)"
    }
  }
}
animation: {
  "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
}
```

#### 2. Atualizar BotStatusCard.tsx
Modificar o indicador de status (linha 41-48) para incluir a nova animação quando o status for "online":

- Adicionar a classe `animate-pulse-glow` ao círculo verde
- Manter o gradiente existente de `emerald-400` para `green-500`

#### 3. Atualizar Bots.tsx
Na lista de bots (linha 327-329), melhorar o indicador existente com a animação `pulse-glow` para um efeito mais visível.

### Resultado Visual
O indicador verde irá:
- Pulsar suavemente em um ciclo de 2 segundos
- Emitir um "glow" (brilho) verde que expande e desaparece
- Criar uma sensação de "bot vivo/ativo" no dashboard

### Arquivos a Modificar
| Arquivo | Alteração |
|---------|-----------|
| `tailwind.config.ts` | Adicionar keyframes e animation `pulse-glow` |
| `src/components/dashboard/BotStatusCard.tsx` | Aplicar `animate-pulse-glow` ao indicador online |
| `src/pages/Bots.tsx` | Aplicar `animate-pulse-glow` ao indicador online |
