# PATCH — devolver o relevo à forja

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

```text
ALVO      = .agents/skills/visual-design-method/assets/forja-de-cartas.html
DELTA     = +16.114 bytes em 189.268 (relevo + holo + painel + vanilla-tilt embutida)
SHA_ANTES = e8f4016dcf8b2b6f9806d8ef29a5105506ef5eba5225f3aeff9b78bcb301f348
SHA_DEPOIS= 598c93572ff2a54ae1ac435437ca62c86061d49f7fbfc65c5acceb6d463b276c
GATE      = PASS nas 3 invariantes do relevo
```

O arquivo já patchado está em `.agents/skills/visual-design-method/assets/forja-de-cartas.html`
dentro deste pacote. É só copiar por cima — **mas leia a seção 4 antes de commitar.**

---

## 1. As 9 edições

| # | Âncora | O que muda |
|---|---|---|
| 1 | `.carta{}` | sombra viva + tilt por variável |
| 2 | `.carta-interior{}` | `translateZ(16px)` |
| 3 | `.carta-topo{}` | `translateZ(24px)` |
| 4 | `.carta-arte{}` | `translateZ(34px)` |
| 5 | `.carta-regras{}` | `translateZ(26px)` |
| 6 | `.carta-rodape{}` | `translateZ(22px)` |
| 7 | `.foil{}` | `translateZ(46px)` |
| 8 | `.carta.forjando` | achata a escada no export |
| 9 | driver `pointermove` | publica `--px`/`--py` |

Nenhum token de cor foi tocado. Nenhuma fonte. Nenhuma medida de carta.
`REUSE_BEFORE_CREATE` mantido.

---

## 2. O coração — edição 1 e 9

### Antes

```css
.carta{
  transform-style:preserve-3d;
  transition:transform .18s cubic-bezier(.2,.7,.3,1);
  box-shadow:0 34px 70px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(0,0,0,.6);
}
```

```js
carta.style.transform = `rotateY(${(px*13)}deg) rotateX(${(-py*13)}deg) translateZ(0)`;
```

O JS sobrescrevia `transform` direto. Com isso a sombra **não tinha como**
participar: ela não enxerga o que o JS escreveu inline.

### Depois

```css
.carta{
  transform-style:preserve-3d;
  transform:rotateY(calc(var(--px,0) * 13deg)) rotateX(calc(var(--py,0) * -13deg));
  transition:transform .4s cubic-bezier(.2,.7,.3,1), box-shadow .4s ease;
  /* RELEVO INV-2 — a sombra contra-desloca */
  box-shadow:
    calc(var(--px,0) * -30px) calc(var(--py,0) * -20px + 34px) 70px -20px rgba(0,0,0,.9),
    0 0 0 1px rgba(0,0,0,.6);
}
```

```js
carta.style.setProperty('--px', px.toFixed(3));
carta.style.setProperty('--py', py.toFixed(3));
carta.style.transition = 'transform .08s linear, box-shadow .08s linear';
```

O driver publica **duas variáveis**. O CSS decide o resto — tilt e sombra
saem da mesma fonte e ficam sincronizados por construção.

O `+34px` no eixo Y da sombra é o repouso: mesmo parado, o objeto já está
acima da mesa. Transição em dois tempos — `.4s` para voltar ao repouso,
`.08s` enquanto persegue o ponteiro.

---

## 3. A escada de profundidade

```text
.carta-borda      Z = 0     plano de base (bisel dourado)
.carta-interior   Z = 16    pergaminho
.carta-rodape     Z = 22
.carta-topo       Z = 24
.carta-regras     Z = 26
.carta-arte       Z = 34    a arte flutua sobre o pergaminho
.foil             Z = 46    brilho por cima de tudo
```

Progressão propositalmente irregular. Camadas equidistantes parecem
maquete; espaçamento desigual parece objeto.

---

## 4. ⚠️ OBRIGATÓRIO ANTES DE COMMITAR

O `sha256` do asset mudou. Ele está escrito em **três** documentos e todos
precisam ser atualizados **no mesmo commit**:

```text
.agents/skills/visual-design-method/SKILL.md
docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md
apps/modulos/Bolt/source/app/styles/variables.scss
```

Trocar em todos:

```text
e8f4016dcf8b2b6f9806d8ef29a5105506ef5eba5225f3aeff9b78bcb301f348
→
598c93572ff2a54ae1ac435437ca62c86061d49f7fbfc65c5acceb6d463b276c
```

Conferir com:

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs
```

Enquanto os três não forem atualizados, o gate devolve
`PROVENIENCIA: SHA_NAO_CONFERE` e `exit 1` — de propósito.

---

## 5. O loop fechou

Vale registrar porque é a prova de que o gate não é enfeite:

```text
1. gate rodou na forja original      → FAIL  (INV-1 e INV-2)
2. patch aplicado                     → 9/9 edições
3. gate rodou na forja patchada       → PASS nas 3 invariantes
4. gate rodou na proveniência         → FAIL, sha divergente
```

O passo 4 é o importante: **o gate pegou a minha própria alteração** e
exigiu a atualização da documentação. Foi exatamente essa checagem que não
existia — e é por isso que o relevo pôde sumir sem ninguém notar.

---

## 6. Limite honesto

```text
GATE_PASS     != RELEVO_BONITO
CSS_CORRETO   != VERIFICADO_NA_TELA
```

O gate prova **estrutura**: profundidade existe, sombra acompanha, movimento
reduzido é respeitado. Ele **não** provou que ficou bonito, e eu **não abri a
forja patchada num navegador**. Antes de mergear, abrir o arquivo e passar o
mouse. Se a inclinação parecer exagerada, o teto de ±13° está na edição 1 —
mexer só nesse número, não na escada.

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
