# RELEVO 3D TÁTIL — invariantes do tema `forge`

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

```text
OWNER      = .agents/skills/visual-design-method/SKILL.md
GATE       = scripts/check-relevo-3d.mjs
CLASSE     = OPERATIONAL_RULE_BOUND_TO_GATE
PROSE_ONLY = false
```

---

## 1. A regressão que motivou isto

A forja perdia o relevo e **nada falhava**. O CSS continuava declarando:

```css
.suporte{ perspective:1400px; }
.carta{ transform-style:preserve-3d; }
```

E o JS continuava inclinando o cartão com o ponteiro:

```js
carta.style.transform = `rotateY(${px*13}deg) rotateX(${-py*13}deg) translateZ(0)`;
```

Tudo presente. Tudo aparentemente certo. Mas:

```text
translateZ NÃO-ZERO em filhos = 0
```

`preserve-3d` cria um espaço 3D para os **filhos**. Se nenhum filho se eleva,
todos permanecem coplanares. O cartão **gira** como uma folha de papel —
e folha de papel não tem relevo.

```text
preserve-3d SEM translateZ = decoração
preserve-3d COM translateZ = estrutura
```

O `translateZ(0)` na própria carta não conta: ele é sobre o próprio elemento,
promove camada de composição, e não eleva filho nenhum.

---

## 2. As três invariantes

### INV-1 · PROFUNDIDADE REAL

> Todo asset que declara `transform-style:preserve-3d` precisa de pelo menos
> um descendente com `translateZ()` de valor não-zero.

Escada canônica, do plano de base ao topo:

```text
.carta-borda       translateZ(0)      moldura — a mesa
.carta-interior    translateZ(45px)   pergaminho
.carta-rodape      translateZ(65px)
.carta-topo        translateZ(70px)
.carta-regras      translateZ(75px)
.carta-arte        translateZ(110px)  a arte flutua
.foil              translateZ(150px)  holo por cima de tudo
```

Com `perspective:800px` e ângulo máximo de `20deg`.

A escada importa mais que os números: o olho lê **ordem de profundidade**,
não milímetros. Camadas equidistantes parecem falsas; a progressão acima é
propositalmente irregular.

### O ângulo destrava mais que o Z

Calibragem medida ao vivo, paralaxe entre arte e moldura:

| perspectiva · ângulo · Z da arte | paralaxe |
|---|---|
| `1400px · 13° · 34px` | 2,0 px |
| `900px · 18° · 95px` | 4,2 px |
| **`800px · 20° · 110px`** | **5,2 px** |
| `700px · 22° · 125px` | 6,6 px |
| `650px · 24° · 140px` | 7,7 px |

Empilhar Z sem abrir o ângulo quase não muda nada: subir a perspectiva de
1400 para 600 mantendo 13° ganhou 1,3 px apenas. **É o ângulo que manda.**
Acima de 22° a carta começa a parecer mole.

### INV-2 · SOMBRA VIVA

> Se o cartão inclina seguindo o ponteiro, a `box-shadow` tem que acompanhar.

Sombra estática sob objeto que gira é a pista mais forte de que a cena é
falsa — o cérebro sabe que a luz não se move junto com o objeto.

A sombra **contra-desloca**: o objeto inclina para um lado, a sombra foge
para o oposto.

```css
box-shadow:
  calc(var(--px,0) * -26px)
  calc(var(--py,0) * -18px + 30px)
  clamp(34px,6vw,58px) -18px rgba(0,0,0,.92);
```

O `+30px` no eixo Y é o repouso: mesmo sem ponteiro, o objeto já está acima
da mesa.

### INV-3 · MOVIMENTO REDUZIDO

> Movimento 3D exige guarda `prefers-reduced-motion`.

Relevo é enfeite. Quem pediu para reduzir movimento não paga por ele.
A forja já respeitava esta — foi a única das três que passou.

---

## 3-A. INV extra · O HOLO REAGE A QUEM OLHA

Não é gateada — uma carta pode legitimamente ser fosca. Mas quando existe
holo, esta regra separa figurinha de desenho animado.

### O defeito

```css
.carta.foil-on .foil{ animation:girar 9s linear infinite; }
```

O arco-íris girava **por timer**. Parado, sem tocar em nada, ele mudava
sozinho a cada 9 segundos. Isso não é reação — é um GIF por cima da carta.

### A correção

```css
.carta.foil-on .foil{
  --ang:calc(var(--px,0) * 220deg + var(--py,0) * 120deg);
  opacity:calc(.30 + var(--brilho,0) * .34);
}
```

```js
carta.style.setProperty('--brilho', Math.min(1, Math.hypot(px, py) * 2).toFixed(3));
```

O ângulo do holo vem do ponteiro. A intensidade cresce com a distância do
centro: parado ele fica discreto, jogado para o canto ele acende.

```text
FIGURINHA REAGE A QUEM OLHA
TIMER NÃO É REAÇÃO
```

---

## 3. Especular seguindo o ponteiro

Complementa INV-1 e INV-2. Não é invariante gateada porque um cartão pode
legitimamente ser fosco — mas quando existe, é o que faz a superfície parecer
material em vez de imagem.

```css
.brilho{
  background:radial-gradient(
    38% 30% at calc(50% + var(--px,0) * 52%) calc(50% + var(--py,0) * 52%),
    rgba(255,246,214,.42) 0%, rgba(255,232,170,.16) 38%, transparent 72%);
  mix-blend-mode:soft-light;
  transform:translateZ(46px);
}
```

`soft-light` em vez de `overlay`: sobre pergaminho claro, `overlay` estoura
o branco e apaga a tinta. Sobre o breu, `soft-light` mantém o ouro legível.

---

## 4. Driver — uma variável, não um `style.transform`

Escrever `transform` direto pelo JS sobrescreve o que o CSS declarou e
torna impossível compor tilt + sombra + especular na mesma expressão.
O driver publica **variáveis**; o CSS decide o que fazer com elas.

```js
sup.addEventListener('pointermove', (ev) => {
  const r = carta.getBoundingClientRect();
  carta.style.setProperty('--px', ((ev.clientX - r.left) / r.width  - .5).toFixed(3));
  carta.style.setProperty('--py', ((ev.clientY - r.top)  / r.height - .5).toFixed(3));
});
```

Faixa útil: `--px`/`--py` ficam em `[-0.5, +0.5]`. Rotação de ±14° é o teto
antes da carta parecer mole.

Transição em dois tempos — repouso lento, perseguição rápida:

```css
.carta{ transition:transform .4s cubic-bezier(.2,.7,.3,1); }
.suporte:hover .carta{ transition:transform .08s linear; }
```

---

## 5. O gate

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs --selftest
```

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs
```

Saída JSON. Sem amarelo — o `public_status_contract` proíbe amarelo como
aprovação pública.

```text
PASS           exit 0
FAIL           exit 1
NAO_APLICAVEL  exit 2      ← nunca 0
```

Testes embutidos, como o contrato exige:

| Teste | Caso | Espera |
|---|---|---|
| `POSITIVE_TEST` | escada de `translateZ` + sombra viva + guarda | `PASS` |
| `NEGATIVE_TEST` | `preserve-3d` sem `translateZ`, sombra estática | `FAIL` **por INV-1** |
| `VACUITY_TEST` | asset sem 3D nenhum | `NAO_APLICAVEL` |

O negativo não basta falhar — ele tem que falhar **pelo motivo certo**.
O gate confere isso (`pega_a_regressao_certa`), senão um erro qualquer
passaria por contraprova.

### ⚠️ O falso-verde que este gate já produziu

A primeira versão colapsava "não se aplica" em "passou":

```js
aplicavel: false  →  ok: true      // ERRADO
```

Consequência real, observada em 2026-08-24: um arquivo **sem uma linha de 3D**
recebeu `PASS` nas três invariantes e por alguns segundos passou por "a forja
com relevo". Uma ferramenta anti-falso-verde produzindo falso-verde por vacuidade.

```text
UNKNOWN → PASS      transição proibida pelo contrato da Casa
NA != PASS
```

O `VACUITY_TEST` existe para que isso não volte.

### Medição — antes e depois

```text
asset original    sha256 e8f4016d…
  INV-1 PROFUNDIDADE       FAIL   0 camadas elevadas
  INV-2 SOMBRA_VIVA        FAIL   6 box-shadows, todas estáticas
  INV-3 MOVIMENTO_REDUZIDO PASS

asset com relevo  sha256 0076e539…
  INV-1 PROFUNDIDADE       PASS   6 camadas · profundidade máx 150px
  INV-2 SOMBRA_VIVA        PASS
  INV-3 MOVIMENTO_REDUZIDO PASS
```

O gate reproduziu o diagnóstico sozinho, sem receber dica de onde olhar —
e depois **barrou a própria correção** até a documentação acompanhar o novo sha.

---

## 6. Proveniência gateada

O `sha256` da forja está escrito em **três** documentos e não era conferido
por gate nenhum. Se o asset mudasse, os três ficavam silenciosamente errados.

`check-relevo-3d.mjs` agora confere. Se o asset mudar sem a documentação
acompanhar: `SHA_NAO_CONFERE`.

```text
ALTERAR O ASSET
→ RODAR O GATE
→ ATUALIZAR O SHA NOS TRÊS DOCUMENTOS
→ RODAR DE NOVO
```

---

## 7. Limite honesto

```text
GATE_PASSA != RELEVO_BONITO
```

Este gate prova **estrutura**, não beleza. Ele garante que a profundidade
existe, que a sombra acompanha e que quem pediu menos movimento é respeitado.
Não julga se a escada de Z ficou agradável — isso continua sendo decisão do
SEGREDO/CHEFE olhando a tela.

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
