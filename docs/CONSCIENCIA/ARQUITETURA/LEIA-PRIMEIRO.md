# PARA HERMES — pacote de absorção

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

```text
ORIGEM        = sessão Claude Code · 2026-08-24
MEDIDO EM     = ServerVpss/CentralDark @ 01135a7eca5ed6375860e35578a6db23deed34f9
CLASSE        = DERIVED — não sobrescreve owner canônico
MUTAÇÃO NO REMOTO = NENHUMA
```

> O CHEFE apontou que artefato fora do repo não é aprendizado. Pelo próprio
> `CONTRACT.yml`, `prose_only_rule: NOT_LEARNED`. Então tudo aqui vem em forma
> que o Hermes lê, roda e reusa — tokens em JSON, técnica em markdown, e um
> gate que executa.

---

## 1. Mapa de destino

A estrutura de pastas daqui espelha o repo. Copiar preservando o caminho.

| Arquivo daqui | O que é |
|---|---|
| `.agents/skills/visual-design-method/TOKENS-FORGE.json` | 22 tokens + a receita completa do relevo |
| `.agents/skills/visual-design-method/RELEVO-3D-TATIL.md` | as 3 invariantes, explicadas |
| `.agents/skills/visual-design-method/scripts/check-relevo-3d.mjs` | o gate determinístico |
| `.agents/skills/visual-design-method/assets/forja-de-cartas.html` | a forja com relevo + painel de ajuste |
| `PATCH-RELEVO.md` | o que mudou no asset e por quê |

```text
no_new_workflow_when_owner_exists = true
```

Nada aqui cria owner novo, skill nova ou árvore de tokens paralela. Tudo entra
**debaixo** da skill `visual-design-method`, que já existe e já é dona do assunto.

---

## 2. Validar antes de commitar

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs --selftest
```

Esperado: `PASS`, exit `0`. Três testes:

| Teste | O que prova |
|---|---|
| `POSITIVE_TEST` | reconhece um asset com relevo correto |
| `NEGATIVE_TEST` | rejeita `preserve-3d` sem `translateZ` — **pelo motivo certo** |
| `VACUITY_TEST` | um asset sem 3D nenhum dá `NAO_APLICAVEL`, **nunca PASS** |

```bash
node .agents/skills/visual-design-method/scripts/check-relevo-3d.mjs
```

Rodar da raiz do repo.

---

## 3. Estado medido do asset

```text
sha256 = 598c93572ff2a54ae1ac435437ca62c86061d49f7fbfc65c5acceb6d463b276c
bytes  = 205.382   (era 189.268)

INV-1  PROFUNDIDADE        PASS   6 camadas · profundidade máx 150px
INV-2  SOMBRA_VIVA         PASS   sombra acompanha o ponteiro
INV-3  MOVIMENTO_REDUZIDO  PASS
PROVENIENCIA               FAIL   ← esperado, ver §4
```

---

## 4. ⚠️ OBRIGATÓRIO no mesmo commit

O `sha256` mudou. Está escrito em **três** documentos e todos precisam acompanhar:

```text
.agents/skills/visual-design-method/SKILL.md
docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md
apps/modulos/Bolt/source/app/styles/variables.scss
```

```text
e8f4016dcf8b2b6f9806d8ef29a5105506ef5eba5225f3aeff9b78bcb301f348
→
598c93572ff2a54ae1ac435437ca62c86061d49f7fbfc65c5acceb6d463b276c
```

Enquanto os três não forem atualizados, o gate devolve `SHA_NAO_CONFERE`
e `exit 1`. De propósito.

---

## 5. O que a forja ganhou

**Relevo.** As camadas da carta agora ficam em alturas diferentes. Quando a
carta inclina, o desenho escorrega mais que a moldura — é o efeito figurinha.
Antes tudo era coplanar: `preserve-3d` estava declarado, mas nenhum filho
tinha `translateZ`, então nada levantava.

**Sombra viva.** A sombra contra-desloca: carta inclina pra um lado, sombra
foge pro outro. Medido: `±15px` no eixo X, `24px` a `44px` no Y.

**Holo que reage.** O foil parou de girar por timer de 9 segundos. Agora o
ângulo dele vem do ponteiro, e a intensidade cresce conforme se afasta do
centro. Figurinha reage a quem olha; timer não é reação, é animação.

**Painel de ajuste.** Três barras para o CHEFE calibrar ao vivo — quanto vira,
fundo do desenho, força do arco-íris. Botão `copiar` entrega os números.
Some sozinho no export do PNG.

---

## 6. Achados que ainda NÃO viraram gate

Continuam valendo `NOT_LEARNED` até serem amarrados:

| Achado | Onde está documentado | Gate proposto |
|---|---|---|
| `Merge-Policy` com string quase-certa (`SQUASH_IF_CLEAN` ≠ `AUTO_SQUASH_IF_CLEAN`) | `../ARQUITETURA-ANTI-FLASH-2026-08-25/06-PAPAGAIO-ENCONTRADO.md` | `scripts/trigger-fabric/verify_repo_contract.py` |
| etiqueta `permito-segredo` sem coroa é inerte | idem | idem |
| `sha256` da forja declarado em 3 docs e gateado em zero | este pacote | ✅ resolvido pelo `check-relevo-3d.mjs` |

O PR **#1149 já está aberto** tocando `verify_repo_contract.py` — é ali que os
dois primeiros entram, sem PR novo.

---

## 7. Falso-verde encontrado no próprio gate

Registro honesto, porque é aprendizado real:

A primeira versão do `check-relevo-3d.mjs` colapsava `aplicavel:false` em
`ok:true`. Resultado: **qualquer arquivo sem 3D nenhum recebia PASS nas três
invariantes.** Foi observado ao vivo — um documento sem uma linha de 3D passou
por "a forja com relevo" por alguns segundos.

```text
UNKNOWN → PASS      transição proibida pelo contrato da Casa
```

Corrigido com um terceiro estado:

```text
PASS           exit 0
FAIL           exit 1
NAO_APLICAVEL  exit 2      nunca 0
```

E o `VACUITY_TEST` existe para que essa regressão não volte.

---

## 8. Limite honesto

```text
GATE_PASSA        != RELEVO_BONITO
PACOTE_NO_DISCO   != ABSORVIDO_PELO_REPO
DOCUMENTED        != EXECUTED
```

O gate prova **estrutura**: a profundidade existe, a sombra acompanha, quem
pediu menos movimento é respeitado. Não julga se ficou bonito.

O CHEFE relatou que **ainda não é a carta original** que ele lembra — a sessão
que a forjou está em outra conta e não foi encontrada nesta máquina (busca
exaustiva registrada na conversa). Os valores atuais são calibragem, não
restauração. O painel existe justamente para o CHEFE ajustar com a mão e
devolver os números.

Enquanto este pacote estiver parado nesta pasta, é `RAW` — não `CRYSTAL`.

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
