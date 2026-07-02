---
title: "DESIGN SISTEMA"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# Design System — Sistema 3D Tátil "Esmeralda"

> **Regra fixa do projeto:** todo o ecossistema CentralDark usa o mesmo design.
> Não criar paleta nova, fonte nova ou sombra nova sem combinar antes.

---

## Identidade

- **Apelido oficial:** Esmeralda
- **Inspiração:** Linear · Vercel · CLI tools · iOS nativo
- **Modo padrão:** light (claro). Dark também polido.
- **Cor de assinatura:** emerald (verde escuro elegante, não neon)
- **Tipografia:** Geist (sans) + Geist Mono (mono) — Google Fonts

## Tokens (em `src/index.css`)

Todos os valores são HSL em variáveis CSS. Light + dark.

```
--background, --foreground          fundo/texto principais
--card, --card-foreground           superfícies
--primary, --primary-foreground     emerald, ações principais
--primary-glow                      emerald brilhante (hover, glow)
--secondary, --muted, --accent      neutros e secundárias
--destructive, --success, --warning estados
--border, --input, --ring           contornos
--radius                            raio padrão (0.5rem)
--gradient-gold                     "verde" emerald gradient
--gradient-card                     gradiente leve para cards
--glass-bg, --glass-border          glassmorphism leve
--chart-1..5                        séries de gráfico
```

## Utilitários globais (3D Tátil)

Já existentes em `src/index.css`:

| Classe | Uso |
| --- | --- |
| `shadow-3d` | sombra base — botões e cards principais |
| `shadow-3d-soft` | sombra suave — superfícies secundárias |
| `shadow-3d-primary` | sombra com tinta emerald — CTA |
| `shadow-3d-destructive` | sombra vermelha — ações destrutivas |
| `shadow-3d-pressed` | sombra "afundada" — estado pressionado |
| `shadow-side-right` | sombra lateral direita — submenus |
| `rounded-xl` / `rounded-lg` | raio padrão |
| `active:translate-y-[1px]` | clique tátil — sempre adicionar em botões |
| `icon-glow` | brilho atrás de ícones em logos |
| `glass-subtle` | header translúcido |
| `bg-grid` | grid de fundo (login/landings) |

## Padrão de Card

```tsx
<Card className="rounded-xl border-border/40 shadow-3d-soft">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm">Título</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

## Padrão de Botão

```tsx
<Button
  size="sm"
  className="h-8 rounded-lg shadow-3d-primary active:translate-y-[1px] hover:bg-primary-glow"
>
  Ação
</Button>
```

## NÃO fazer

- ❌ Hardcode de cor (`text-white`, `bg-black`, `bg-[#xxx]`) — quebra dark mode
- ❌ Misturar fontes diferentes de Geist/Geist Mono
- ❌ Trocar emerald por roxo/azul/etc sem aprovação
- ❌ Sombras inventadas — use `shadow-3d*` ou `shadow-sm` do Tailwind
- ❌ Border-radius diferente do `--radius` global

## Onde está aplicado

| Tela | Status |
| --- | --- |
| `LandingCentralDark` (home) | ✅ referência visual |
| TelePainel — todas as páginas | ✅ |
| Mega Painel (`/mega-painel`) | ✅ |
| Auth / Portal | ✅ |
| Landings de módulos (WhatsApp, CRM, Financeiro) | ✅ |

## Quando criar visual novo

1. Confirmar com o usuário antes
2. Adicionar tokens novos em `src/index.css` (light + dark)
3. Adicionar utilitário em `src/index.css` se for reutilizável
4. Atualizar este doc
5. Atualizar memory `mem://design/sistema-3d-tatil` se mudou regra

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
