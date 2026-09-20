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

## Temas globais oficiais (decisão do SEGREDO/CHEFE, 2026-08-24)

```text
CENTRALDARK_VISUAL_MODEL =
  ONE_DESIGN_SYSTEM
  + THREE_GLOBAL_OFFICIAL_THEMES

THEMES=[emerald, operational, forge]
THEME_SCOPE=APPLICATION_GLOBAL
EVERY_CENTRALDARK_PAGE_INHERITS_ACTIVE_THEME=true
THEME_SWITCH != REDESIGN
```

Não são três estilos para escolher "qual serve melhor para este artefato" —
são três peles sempre disponíveis no seletor global. Estrutura, layout,
componentes, navegação e conteúdo não mudam entre elas; só os valores de
token trocam. `emerald` continua o tema padrão atual.

| Tema | Registro | Fonte real |
| --- | --- | --- |
| `emerald` (default) | Institucional — verde esmeralda escuro, Geist | Este doc + `src/index.css` |
| `operational` | HUD/controle — navy + ciano + vermelho de alerta | Cartão operacional (5 etapas) |
| `forge` | Premium/lendário — shell preto/marrom, bordas bronze-dourado, tipografia mono dourada, interior pergaminho/foil claro | `.agents/skills/visual-design-method/assets/forja-de-cartas.html` (`sha256:e8f4016dcf8b2b6f9806d8ef29a5105506ef5eba5225f3aeff9b78bcb301f348`) |

### Owners/consumidores vivos por superfície

Reusar estes — não criar segundo sistema de design nem árvore de tokens paralela:

| Superfície | Owner | Estado medido em 2026-08-24 |
| --- | --- | --- |
| App principal / TelePainel / portal | `src/shared/theme/ThemeProvider.tsx`, `ThemeToggle.tsx`, `src/index.css` | Só `light/dark/system`; falta dimensão de paleta |
| Bolt / Hermes Desktop | `apps/modulos/Bolt/source/app/lib/stores/theme.ts`, `app/styles/variables.scss` | `emerald` é o default de perfil novo; `dark/light/operational/forge` continuam selecionáveis; build/render ainda precisam provar cobertura física |
| Hub | `apps/modulos/hub/src/App.tsx` | Força tema claro; ainda sem mecanismo de tema |
| Open WebUI | `apps/modulos/WebUI/custom-css/esmeralda.css` | Só Esmeralda, força light |

`GLOBAL_COVERAGE` só é verdadeiro quando as 4 superfícies acima consumirem o
mesmo `ThemeId` e o mesmo conjunto de tokens semânticos. Enquanto isso não
estiver provado (build + render real de cada superfície nos 3 temas), tratar
como `PARTIAL_COVERAGE`, nunca como concluído.


## Cartazes canônicos e memória visual

Os quatro cartazes aprovados pelo SEGREDO/CHEFE são testemunhas visuais do
mesmo design system e estão catalogados em
[`docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/`](../../BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/README.md).
O `manifest.json` dessa pasta fixa hashes, proveniência e relações semânticas.
Eles não criam paleta, runtime ou autoridade paralela: este documento continua
o owner de design; a skill `visual-design-method` governa o método; índices e
grafos são projeções reconstruíveis.

## Quando criar visual novo

1. Confirmar com o usuário antes
2. Adicionar tokens novos em `src/index.css` (light + dark) — e, quando for
   token de paleta, também em `operational`/`forge`
3. Adicionar utilitário em `src/index.css` se for reutilizável
4. Atualizar este doc
5. Atualizar memory `mem://design/sistema-3d-tatil` se mudou regra

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
