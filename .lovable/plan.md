## Problema

No tema claro o dashboard fica ilegível: os números grandes (R$ 56,00, 46, 162) usam um gradiente branco→cinza que some no fundo branco, o nome "Segredo" no header também fica fantasma, e várias áreas (sidebar, scrollbar, glass) foram pensadas só pro dark.

## O que vou ajustar (só CSS — `src/index.css`)

1. **Gradiente de texto (`.text-gradient-gold` / `.text-gradient-money`)**
   - Dark: mantém o gradiente branco→cinza claro (fica bonito).
   - Light: vira gradiente escuro (preto suave → cinza médio) pra os números grandes ficarem nítidos.

2. **Tokens do tema claro mais contrastados**
   - `--foreground` mais escuro (`0 0% 7%`).
   - `--muted-foreground` de 40% pra `0 0% 35%` (texto secundário mais lido).
   - `--border` levemente mais escura (`0 0% 88%`) pra cards se destacarem.
   - `--card` com leve off-white pra separar do background.
   - `--primary` no claro um pouco mais escuro (`152 65% 32%`) pra contrastar com fundo branco e funcionar em botões/badges.

3. **Sidebar no claro**
   - `--sidebar-foreground` mais escuro (`0 0% 25%`).
   - Item ativo com fundo `--sidebar-accent` mais visível.

4. **Glass / scrollbar / selection adaptados ao tema**
   - Scrollbar `::-webkit-scrollbar-*` passa a usar `hsl(var(--muted))` em vez de cor fixa escura.
   - `.glass-subtle` usa `hsl(var(--card) / 0.6)` em vez de preto fixo.
   - `::selection` usa `--foreground` em vez de branco fixo.

5. **Cards stat tints (`.stat-gradient-*`)**
   - No claro, aumentar opacidade do tint (de 0.06 pra 0.10) e da borda (de 0.18 pra 0.25) pra não sumir.

## Fora do escopo

- Não vou mudar componente nenhum (Dashboard, Sidebar, cards) — só os tokens e utilitários do design system. Como tudo usa semantic tokens, a melhora propaga sozinha.
- Tema escuro fica igual.