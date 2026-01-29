
## Aplicar Animação Pulse-Glow na Sidebar "Seus Bots"

### Objetivo
Adicionar a animação de pulsação `pulse-glow` ao indicador verde "Sistema Online" que aparece no card inferior da sidebar, criando o mesmo efeito visual atraente que foi implementado nos cards de bots.

### Local Atual
No arquivo `src/components/layout/Sidebar.tsx` (linhas 275-278), existe:
```tsx
<div className="relative">
  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500" />
  <div className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-400 animate-ping opacity-40" />
</div>
```

### Alteração Proposta
Substituir a animação `animate-ping` pelo efeito `animate-pulse-glow` que já foi criado no Tailwind, unificando o estilo visual em todo o sistema:

```tsx
<div className="relative">
  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/50 animate-pulse-glow" />
</div>
```

### Benefícios
- Efeito visual consistente em toda a aplicação
- Animação mais suave e elegante (2s) vs ping rápido
- Brilho verde que expande e desaparece, indicando "sistema vivo"
- Código simplificado (remove o elemento duplicado de ping)

### Arquivo a Modificar
| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | Aplicar `animate-pulse-glow` ao indicador do card "Sistema Online" (linhas 275-278) |
