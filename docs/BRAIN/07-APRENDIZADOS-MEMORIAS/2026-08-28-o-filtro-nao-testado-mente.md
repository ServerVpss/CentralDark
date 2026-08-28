---
title: "O filtro não testado mente — seis erros de medição numa sessão"
date: 2026-08-28
tags: ["aprendizado", "metalupa", "medicao", "falso-verde", "autocritica"]
status: "MEMORIA_RECUPERAVEL"
authority: "REFERENCIA; owner canonico permanece fora do BRAIN"
originator: "SEGREDO/CHEFE"
---

# 🔍 O filtro não testado mente

[[07 - Aprendizados & Memórias/README]]

Numa única sessão de operação eu afirmei seis coisas erradas. **Nenhuma foi
erro de raciocínio.** Todas foram erro de *instrumento* — o filtro, o parser, a
contagem. E em todas eu estava confiante.

## Os seis

| # | O que afirmei | O que era | Instrumento que mentiu |
|---|---|---|---|
| 1 | "5 arquivos com `chattr +i`" | 9 | contagem de cabeça, repetida a sessão toda |
| 2 | "o fix não está na main" | estava | MSYS mangleando `git show ref:path` |
| 3 | "`builder` e `elite` estão trocados" | não estavam | `awk` vazando variável entre arquivos |
| 4 | "Dependabot resolvido, 13→0" | voltaram 15 | contei o sintoma, não a causa |
| 5 | "7 alertas abertos" | 141 | `jq` contando por página |
| 6 | "22.054 arquivos imutáveis" (outro braço) | 9 | `grep -c 'i'` pegando a letra em qualquer posição |

O #6 não foi meu, mas eu tinha **exatamente o mesmo bug** na primeira versão do
meu script — e só não virou alarme porque a revisão de código me pegou antes.

## O padrão

```text
FILTRO_NAO_TESTADO_CONTRA_CASO_CONHECIDO = FONTE_DE_FALSO_VERDE
```

Um filtro errado não avisa que está errado. Ele devolve um número com a mesma
cara de um número certo. `0` parece prova de ausência. `22054` parece prova de
catástrofe. Os dois vieram de `grep` mal escrito.

E o pior: **medir errado é mais perigoso que não medir**, porque medição
carrega autoridade. Quando eu disse "não está na main", ninguém questionou —
era um comando de git, parecia fato.

## A cura, que é barata

Antes de confiar num filtro novo, rodar contra um caso de resposta conhecida.

Foi assim que provei a semântica de `--ours`/`--theirs`: criei um repositório
descartável com `LADO_DO_PR` e `LADO_DA_MAIN` escritos dentro dos arquivos, e
li qual saía. Dois minutos. Desmentiu o comentário de um script que estava em
produção havia semanas e tinha um buraco de governança aberto.

```text
REPO_DESCARTAVEL_DE_2_MINUTOS > CONFIANCA_NO_PROPRIO_REGEX
```

## O caso irmão: a lei que eu mesmo não implementei

No mesmo dia escrevi um script de deploy com `MERGED != DEPLOYED` no cabeçalho
e implementei o apply com `git checkout origin/main -- .` — a única operação de
git que **nunca move o HEAD**. A prova que o script prometia era estruturalmente
impossível, e ele imprimia `DEPLOY_PROVADO` mesmo assim.

```text
LEI_ESCRITA_NO_CABECALHO != LEI_IMPLEMENTADA_NO_CORPO
```

Não adianta conhecer a disciplina. Documentar a disciplina não a executa.

## Por que isso importa mais que os erros

Cinco dos seis erros teriam virado **decisão errada em produção** se ninguém
tivesse remedido: apagar 22 mil arquivos, repontar rotas que não estavam
trocadas, declarar segurança em dia com 141 alertas abertos, fechar a sessão
com um deploy que nunca provou nada.

O que salvou não foi inteligência. Foi remedir antes de agir, e aceitar ser
desmentido pelo próprio instrumento.

```text
CONFIANCA != CALIBRACAO
```
