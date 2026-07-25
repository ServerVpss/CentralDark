## Auditoria honesta — Sistema 3D Tátil "Esmeralda" no cockpit `/admin/cockpit`

Fui atrás no código antes de responder. Verdade nua: **o cockpit hoje NÃO usa o design system Esmeralda oficial**. Ele tem um sub-sistema próprio (`sala-controle.css` com tokens `--sc-*` hardcodados) que só imita a cor esmeralda. Segue o mapa peça por peça.

### Onde está aplicado (parcial / só na "vibe")

| Conceito Esmeralda | Situação no cockpit | Evidência |
|---|---|---|
| Cor de assinatura emerald | ✅ Aplicado, mas **hardcoded** (`#10b981` / `#34d399`) em vez de `hsl(var(--primary))` | `sala-controle.css` linhas 11-12 (`--sc-em`, `--sc-em-hi`) |
| Inspiração Linear / CLI / iOS | ✅ Aplicado (grid denso, mono, dots de status, header operacional) | `SalaControle.tsx` header VOL/PPM/CODE/UPTIME/SHA |
| Modo escuro polido | ✅ Aplicado (radial gradient escuro) | `sala-controle.css` linha 21 |
| Glow em elementos ativos | ✅ Aplicado, mas com `box-shadow` inline `#10b98166` em vez de `.icon-glow` | linha 157 (`.sc-no:hover`) |

### Onde **não** está aplicado (divergência real)

| Conceito Esmeralda | Deveria ser | Está | Arquivo |
|---|---|---|---|
| Tokens semânticos (`--primary`, `--background`, `--card`) | HSL via `hsl(var(--...))` | Hex cru `#0b0f14`, `#10b981`, `#e5e7eb` | `sala-controle.css` 6-17 |
| Tipografia Geist + Geist Mono | `font-family: Geist` | `Inter` + `JetBrains Mono` | `sala-controle.css` 23, 28 |
| `shadow-3d`, `shadow-3d-soft`, `shadow-3d-primary` | Utilitário global | Zero ocorrências no cockpit | `rg` retornou vazio |
| `card-premium`, `nav-item`, `btn-money`, `icon-glow`, `stat-gradient-*` | Componentes de assinatura | Zero ocorrências (usa `.sc-no`, `.sc-nav-item`, `.sc-head-*` próprios) | idem |
| `rounded-xl` / `rounded-lg` do tema | Raio global `--radius` | `border-radius: 4px` fixo | linha 97 |
| `active:translate-y-[1px]` (tátil) | Feedback de clique padrão | Ausente nos botões `.sc-*` | — |
| `glass-subtle` / `bg-grid` | Utilitário global | Não usados; header próprio | — |
| Regra "não hardcodar cor" | Proibido `#hex` cru | Cockpit inteiro é hex cru | `sala-controle.css` |

Componentes agregados (`GrokMissoes`, `PainelOps`, `HermesMascote`, `JarvisOrb`, `MatrixRain`, `PainelNivel7`) seguem o mesmo padrão `--sc-*`, então também estão fora do Esmeralda oficial.

### Diagnóstico

O cockpit foi construído como "peça isolada estilo terminal" e nunca foi migrado para os utilitários oficiais. Isso viola a regra do `mem://` e do `docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md` que dizem: *"todo o ecossistema CentralDark usa o mesmo design"*.

Ou seja: hoje o cockpit **parece** Esmeralda (verde escuro, denso, mono) mas **não é** Esmeralda estruturalmente. Se você mudar `--primary` no `index.css`, o resto do sistema muda — o cockpit **não muda**.

### Próximo passo (se você quiser aprovar)

Duas opções, você escolhe:

**A. Reconciliação total (recomendado, correção mínima honesta)**
1. Trocar tokens `--sc-*` por `hsl(var(--primary))`, `hsl(var(--card))`, `hsl(var(--border))` etc. no `sala-controle.css`.
2. Trocar `Inter`/`JetBrains Mono` por `Geist`/`Geist Mono`.
3. Substituir `box-shadow` inline pelos utilitários `shadow-3d*`.
4. Trocar `border-radius: 4px` por `var(--radius)`.
5. Adicionar `active:translate-y-[1px]` nos botões `.sc-*`.
6. Sem mudar layout nem lógica — só reconectar ao design system.

**B. Formalizar o cockpit como exceção**
Documentar em `docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md` que o `/admin/cockpit` é uma "sala terminal" com tokens próprios, e liberar a divergência oficialmente.

Me diz qual caminho (A ou B) e eu implemento. Nada é mudado até você aprovar.
