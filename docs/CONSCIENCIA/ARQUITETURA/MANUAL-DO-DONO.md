---
title: "MANUAL DO DONO"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# MANUAL DO DONO — temas e relevo

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

Escrito pra **tu**, não pra programador. Se em algum ponto precisar de termo
técnico, ele vem explicado do lado.

**Regra de ouro:** antes de mexer, copie o arquivo. Se der errado, cola a cópia
de volta e acabou. Nunca vai existir um erro que tu não consegue desfazer.

---

## 1. Trocar uma cor

Todas as cores moram em **um lugar só**: `src/index.css`. Nenhuma cor fica
escondida no meio do código.

Elas parecem com isso:

```css
--primary: 152 65% 32%;
```

Três números, nesta ordem:

| Número | O que é | Faixa |
|---|---|---|
| `152` | **qual cor** — 0 vermelho · 120 verde · 210 azul · 45 dourado | 0 a 360 |
| `65%` | **quão viva** — 0% cinza, 100% berrante | 0% a 100% |
| `32%` | **quão clara** — 0% preto, 100% branco | 0% a 100% |

Pra deixar o verde mais vivo, sobe o do meio. Mais escuro, baixa o último.
Mexe **um número por vez** e olha o resultado. Mexer os três junto tu não sabe
qual causou o quê.

⚠️ Cada cor aparece **duas vezes** no arquivo: uma no bloco claro e outra no
escuro. Trocar só uma deixa o site bonito de dia e quebrado de noite.

---

## 2. Deixar o relevo mais forte ou mais fraco

Relevo é o efeito de a carta ou o painel parecer levantado quando o mouse passa.

Fica em `relevo-3-temas.css`, no começo:

```css
--relevo-angulo: 20deg;   /* o quanto inclina */
--relevo-z-frente: 110px; /* o quanto o desenho flutua */
```

**O ângulo é o que manda.** Descobri isso medindo: aumentar só a flutuação
quase não muda nada; abrir o ângulo muda tudo.

| Quero | Faço |
|---|---|
| Mais forte | sobe o ângulo — `20deg` → `24deg` |
| Mais suave | baixa o ângulo — `20deg` → `12deg` |
| Mais fundo | sobe a flutuação — `110px` → `140px` |

**Limites que eu medi:** acima de `24deg` a carta parece mole, de borracha.
Abaixo de `6deg` ninguém percebe que tem efeito. Em painel de trabalho use
`9deg`; em carta de colecionador, `20deg`.

Na forja tem um **painel com três barrinhas** no canto — arrasta e vê ao vivo,
sem abrir arquivo nenhum. Quando gostar, aperta `copiar` e os números saem
prontos.

---

## 3. Desligar o relevo

Uma linha, no `relevo-3-temas.css`:

```css
--relevo-angulo: 0deg;
```

Tudo fica chato e parado. Volta pra `20deg` quando quiser.

---

## 4. O que NÃO mexer

| Não mexa em | Porque |
|---|---|
| `sha256:` nos documentos | é a impressão digital do arquivo. Se mudar sem motivo, o sistema trava avisando que algo não bate |
| `translateZ(...)` | é a altura de cada camada. Zerar mata o relevo inteiro |
| `prefers-reduced-motion` | é a proteção de quem sente tontura com movimento. Tirar isso perde visitante |
| nomes começando com `--` | são apelidos usados em vários lugares. Renomear um quebra tudo que o chamava |

Se mexer sem querer: cola a cópia de volta.

---

## 5. Saber se quebrou

Abre o terminal na pasta do projeto e roda:

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs
```

Três respostas possíveis:

```text
PASS           está tudo certo
FAIL           alguma coisa quebrou — a mensagem diz o quê
NAO_APLICAVEL  o arquivo não tem relevo (não é erro, é fora do assunto)
```

Ele **não** diz se ficou bonito. Isso é contigo — abre e olha. Ele só garante
que a estrutura está de pé.

---

## 6. Erros que fazem o visitante ir embora

Coisas que quebram site de verdade, e como o teu já está protegido:

| Erro comum | Como está aqui |
|---|---|
| Site pesado, demora a abrir | 🟢 zero biblioteca externa. Tudo dentro do arquivo, abre até sem internet |
| Quebra no celular | 🟢 as medidas se ajustam sozinhas ao tamanho da tela |
| Texto que não dá pra ler | 🟢 no tema claro o acento escurece de propósito. Ciano claro sobre branco é ilegível |
| Efeito que embrulha o estômago | 🟢 quem marcou "reduzir movimento" recebe a versão parada |
| Botão que não parece botão | 🟢 tem borda, muda de cor no hover e afunda 1px no clique |
| Só funciona no escuro | 🟢 os três temas têm claro **e** escuro. Foram seis combinações testadas |

⚫ **Ainda não conferido:** velocidade real com internet ruim, e leitor de tela
para quem não enxerga. Isso precisa de medição própria, não dá pra afirmar.

---

## 7. Onde fica cada coisa

```text
src/index.css                     as cores do site
relevo-3-temas.css                o relevo e as 3 peles
forja-de-cartas.html              a forja, com o painel de ajuste
TOKENS-FORGE.json                 todos os valores, em lista
RELEVO-3D-TATIL.md                a explicação técnica (pra quem programa)
check-relevo-3d.mjs               o verificador
MANUAL-DO-DONO.md                 este arquivo
```

---

## 8. Quando chamar alguém

Resolve sozinho: trocar cor · ajustar relevo · desligar efeito · rodar o teste.

Chama alguém: se `FAIL` aparecer e a mensagem não fizer sentido · se quiser um
**quarto tema** · se o site ficar lento de verdade · se precisar de acessibilidade
para leitor de tela.

E leva junto o que o teste imprimiu. Com aquele texto, qualquer um entende o
problema em dois minutos — sem ele, leva uma hora.

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
