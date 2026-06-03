## Tema Esmeralda na Landing

Apelido curto pro design system que já existe no painel e no login. Nada novo — só alinhar a Landing pra usar os mesmos tokens.

## O que muda

**`src/pages/Landing.tsx`** (só visual, texto fica igual):
- Remover `forceDark` — respeita o tema do sistema
- Trocar cores cruas (`bg-black`, `text-emerald-400`, `text-white`) por tokens semânticos (`bg-background`, `text-primary`, `text-foreground`, `border-border/60`)
- Geist como fonte base, Geist Mono só em detalhes (badges, números, tabular-nums)
- Cards com `card-premium` + `shadow-3d` + `rounded-xl` + hover lift
- CTA com `shadow-3d-primary` + `active:translate-y-[1px]`
- Navbar com `glass-subtle`
- Hero com gradient radial sutil e número grande em gradiente verde/dourado (igual aos KPIs do painel)

**Memória:**
- Criar `mem://design/tema-esmeralda` com o apelido apontando pro sistema 3D Tátil que já existe
- Atualizar `mem://index.md` adicionando a referência

## Fora do escopo

- Nenhuma mudança de texto/conteúdo
- Auth, Dashboard e outras páginas ficam como estão
- Nenhuma biblioteca nova
