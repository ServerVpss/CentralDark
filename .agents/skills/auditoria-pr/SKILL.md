---
name: auditoria-pr
description: Auditar pull request, diff, branch ou commit antes de merge, exigindo ref declarado em toda afirmação, dois canais independentes antes de declarar ausência, e teste de discriminação sobre a base antes de aceitar qualquer suíte como prova. Usar em revisão de PR, veredito de merge, checagem de "os testes passaram", investigação de arquivo que "não existe", comparação entre branch e main, auditoria de CI verde, ou quando um relatório de outra IA precisa ser conferido. Extensão operacional da meta-lupa para o caso PR; não substitui o motor bayesiano.
---

# AUDITORIA DE PR

Procedimento estreito para auditar mudança versionada sem produzir lacuna falsa.

**Subordinação.** A `meta-lupa` é o motor: Bayes, entropia, VOI, AutoLupa, ledger,
autorização. Esta skill é só o checklist executável do caso PR. Em qualquer
conflito, a `meta-lupa` vence e esta skill é CORRIGIDA. Não cria ledger próprio,
não cria XP próprio, não cria veredito próprio.

**Resolução de conflito de PR** segue o PADRÃO ÚNICO da Casa (`.agents/skills/git-conflict-resolve-house-standard/SKILL.md` + `scripts/dependabot/resolve-conflicts.sh`). Não criar segundo padrão, não V2/V3.

**Origem.** Nasceu de uma auditoria real do PR #410 (CentralDark) em que 3 de 4
lacunas reportadas como críticas eram **falsas** — todas pela mesma causa: o
auditor rodou o instrumento num escopo e afirmou sobre outro. Cada passo abaixo
existe porque um erro concreto aconteceu.

---

## Passo 0 — Fixar os refs ANTES de qualquer afirmação

Nada é auditado antes desta tabela estar preenchida com SHAs reais.

```text
BASE_REF ......... origin/main @ <sha>        ← Fonte da Verdade
HEAD_REF ......... origin/<branch> @ <sha>    ← o que o PR propõe
CHECKOUT_LOCAL ... <branch> @ <sha>  (atrás/à frente de BASE em N commits?)
WORKTREES ........ git worktree list          ← cada um é um escopo diferente
AMBIENTE_RUNTIME . VPS/servidor: branch + último commit + a pasta existe?
```

Comandos:

```bash
git rev-parse origin/main <branch>
git rev-list --count <checkout_local>..origin/main   # a defasagem em número
git worktree list
```

Regra: **cada linha da tabela é um escopo distinto.** Misturar evidência de dois
escopos no mesmo veredito é o defeito que esta skill previne. Toda afirmação no
relatório carrega o ref de onde saiu.

> Caso real: 4 escopos coexistiam. `origin/main` completo, checkout local 51
> commits atrás, worktree na branch do PR, e a VPS em outra branch **sem a pasta
> da skill**. O relatório afirmou "CI 9/9 verde" (evidência de `origin`) e "os
> testes não existem" (instrumento rodado noutro escopo) no mesmo parágrafo.

---

## Passo 1 — Proibido declarar ausência com um canal só

`find` vazio, `ls` curto, `grep` sem match, `404` e "nenhuma ocorrência"
descrevem **o que a ferramenta devolveu**. Não o que existe.

A frase permitida é `NÃO ENCONTRADO EM <ref> POR <instrumento>`.
A frase proibida é `NÃO EXISTE`.

Para dizer que algo não existe, dois canais de proveniência distinta precisam
concordar. Ordem de confiança em repositório Git:

| Canal | Comando | Por que confia |
|---|---|---|
| 1 | `git ls-tree -r --name-only <ref>` | é o que um checkout limpo entrega naquele ref |
| 2 | `git ls-files` | índice, independente do CWD |
| 3 | `git cat-file -s <ref>:<path>` | tamanho do blob: prova de conteúdo |
| 4 | API do host (`github_read` etc.) | canal de rede, proveniência independente do disco |
| ⚠ | `find` / `ls` | dependem do CWD; em worktree o `.git` é arquivo apontando para outro disco, então comando git falha ali sem falhar `ls` |

Antes de concluir ausência, checar: o instrumento tem allowlist, filtro de path
sensível, escopo padrão, paginação ou índice defasado?

> Caso real: `find . -name "*test_lupa*"` foi reportado como vazio. Rodado no
> mesmo worktree alegado, devolve `./.agents/skills/meta-lupa/testes/test_lupa.py`.
> O `ls` publicado mostrava 2 entradas onde havia 6.

---

## Passo 2 — Caminho de tabela de recursos é relativo à raiz do módulo

Tabela de recursos dentro de uma skill, plugin ou pacote lista caminhos
relativos **à raiz daquele módulo**, não à raiz do repo.

```text
tabela diz .... testes/test_lupa.py
NÃO é ......... <repo>/testes/test_lupa.py          ← falso negativo garantido
É ............. <repo>/.agents/skills/<skill>/testes/test_lupa.py
```

Resolver a raiz do módulo primeiro. Só então concatenar.

---

## Passo 3 — Teste de discriminação: rodar a MESMA checagem na base

Suíte verde no HEAD não é evidência da mudança. Prova nada se já era verde antes.

```bash
git archive <BASE_REF> <caminho-do-modulo> | tar -x -C /tmp/base
git archive <HEAD_REF> <caminho-do-modulo> | tar -x -C /tmp/head
cd /tmp/base/<modulo> && <comando de teste>   # anotar contagem e identidade
cd /tmp/head/<modulo> && <comando de teste>   # comparar
```

Classificar:

```text
DISCRIMINA ........... falha na base, passa no head → é prova da mudança
NÃO DISCRIMINA ....... resultado idêntico nos dois → não mede nada, não citar como prova
REGREDIU ............. passava na base, falha no head → BLOQUEAR
```

Contagem igual não basta: comparar também **quais** casos, porque a suíte pode
ter perdido um e ganhado outro.

> Caso real: `test_lupa.py` deu `TOTAL=52 PASS=52 FAIL=0` no HEAD **e** na base,
> sendo que a base não tinha nem a função corrigida. Era a evidência gravada no
> ledger. Poder de discriminação: zero.

---

## Passo 4 — Separar prova de CI de alegação manual

Suíte citada no corpo do PR **só é prova automatizada se algum workflow a
executa**. Conferir, não presumir:

```bash
grep -rn "<nome-do-teste>" .github/workflows/
```

Classificar cada evidência citada:

```text
PROVA_CI ............ existe step que roda; o check verde cobre isso
ALEGACAO_MANUAL ..... alguém rodou e colou a saída; vale, mas rotulado como tal
NAO_EXECUTAVEL ...... nem existe comando que produza aquela saída
```

E conferir a cobertura dos checks verdes: `N/N passing` só cobre o que os
workflows realmente rodam. Verde não é atestado global.

> Caso real: 9/9 checks verdes, e nenhum deles tocava o motor. `test_lupa.py`
> não estava em workflow nenhum. Evidência manual apresentada como prova de CI.

---

## Passo 5 — Auditar o registro, não só o código

Se o PR grava em ledger, registro de uso, XP ou selo de conclusão, auditar o
**registro** com o mesmo rigor do diff. Contradição interna dentro de um mesmo
registro é defeito, mesmo com CI verde. Ver skill `selo-xp`.

Regra mínima aqui: campo que declara o **resultado de um instrumento** exige que
o instrumento tenha rodado.

---

## Passo 6 — Auditar a auditoria anterior

Se existe relatório prévio (de outra IA, de outra sessão, ou seu), ele é
**hipótese**, não evidência. Reconferir cada afirmação nos refs do Passo 0 antes
de herdar. Autoridade de quem escreveu é evidência fraca (Princípio 3).

Quando o relatório prévio estava errado, retratar explicitamente, item por item,
com o comando que derruba cada um. Não reescrever silenciosamente.

Nunca atribuir ao humano uma correção que ele não fez. Se a correção foi sua,
escrever `CORREÇÃO_INTERNA:` e não "você tem razão".

---

## Saída obrigatória

```text
VEREDITO: APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR
BASE_REF / HEAD_REF / OUTROS_ESCOPOS:
O QUE O DIFF FAZ (em linhas):
AFIRMAÇÕES DE AUSÊNCIA (cada uma com ref + 2 canais):
TESTE DE DISCRIMINAÇÃO (base vs head, com números):
EVIDÊNCIAS CLASSIFICADAS (PROVA_CI | ALEGACAO_MANUAL | NAO_EXECUTAVEL):
CONTRADIÇÕES NO REGISTRO:
RETRATAÇÃO DE AUDITORIA ANTERIOR:
FALSIFICADOR (o que derrubaria minha tese, e o resultado de ter rodado):
BLOQUEIOS:
AUTORIZAÇÃO:
RISCO RESIDUAL:
PRÓXIMO TESTE:
```

Faltando o teste de discriminação ou o ref de alguma afirmação de ausência, o
veredito **não sela** — sai `CORRIGIR`.

---

## Proibições

1. Não mergear, force-push, reset ou fechar PR sem ordem humana explícita.
2. Não editar ledger, histórico ou registro append-only para "arrumar" achado.
3. Não pedir para inflar campo de conquista, XP ou selo que não corresponda a
   fato provado — isso é evidência inventada, o pior defeito da tabela.
4. Não publicar saída de comando que não foi executada exatamente como mostrada.
5. Não reivindicar ponto fixo com bloqueio aberto.
6. Não criar módulo, pasta ou documento paralelo quando o encaixe canônico
   existe (Princípio 11).
