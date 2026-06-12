---
name: Sistema 3D Tátil (Esmeralda) — Tema Oficial
description: Tema visual definitivo de todo o sistema CentralDark/TelePanel. Apelido "Esmeralda". Obrigatório em toda nova tela, componente e módulo.
type: design
---

# Tema Oficial: Esmeralda (Sistema 3D Tátil)

**STATUS: OBRIGATÓRIO E IMUTÁVEL.** Todo agente (IA ou humano) que editar este projeto a partir de agora DEVE seguir este tema em 100% do sistema. Não trocar paleta, não trocar fontes, não trocar estilo de sombras, não introduzir variações.

## Identidade
- **Apelido oficial**: Esmeralda
- **Nome técnico**: Sistema 3D Tátil
- **Inspiração**: App nativo (iOS/Android) + Linear/Vercel/CLI tools
- **Paleta**: emerald (verde esmeralda) como primary/accent
- **Modo padrão**: light (dark totalmente suportado)
- **Fontes**: `Geist` (sans) + `Geist Mono` (mono). Proibido serif, Inter ou Poppins puros.
- **Bordas**: `rounded-xl` em cards, `rounded-lg` em botões/inputs
- **Tátil**: clicáveis usam `active:translate-y-[1px]`

## Utilitários globais (src/index.css)
Sempre usar estes — nunca recriar sombras inline:
- `shadow-3d` — padrão 3D destacado
- `shadow-3d-soft` — cards/nav suave
- `shadow-3d-primary` — CTA verde
- `shadow-3d-destructive` — ações destrutivas
- `shadow-3d-pressed` — estado pressionado
- `shadow-side-right` — sidebar/painéis laterais

## Componentes de assinatura
- `.card-premium` — base de cards
- `.nav-item` (+ `.active`) — itens de menu
- `.btn-money` — CTA primário verde
- `.icon-glow` — ícones com halo emerald
- `.stat-gradient-green/gold/cyan/purple` — tints sutis para stats

## Tokens semânticos (NUNCA hardcodar)
Usar `hsl(var(--primary))`, `bg-card`, `text-foreground`, `border-border`, etc.
**Proibido**: `text-white`, `bg-black`, `bg-[#...]`, gradientes roxo/índigo de IA genérica.

## Regra de ouro
Tela nova = reutilizar utilitários e componentes acima. Consistência absoluta em todo o ecossistema CentralDark.
