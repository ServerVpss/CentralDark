---
title: "Trava Antirregressão — Bancada Externa"
status: "CANONICAL_GUARD"
date: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
truth_rule: "SEARCHED != VERIFIED"
binds: "ONE_SYSTEM_ONLY · REUSE_BEFORE_CREATE · ONE_WRITER_PER_SCOPE · TIK-TAK 2.0"
---

# Trava Antirregressão — Bancada Externa

## 1. Causa raiz comum

Todos os erros registrados aqui pertencem à **mesma família**:

```text
AFIRMAR SEM MEDIR O ALVO
= ler a superfície, deduzir o resto, escrever com cara de número
= SEARCHED != VERIFIED invertido (não busquei e já declarei)
```

Não é falta de ferramenta. É **publicar conclusão antes de abrir o alvo**.

## 2. Os erros — registrados com o caso real

| # | Afirmado | Real | Trava |
|---|---|---|---|
| E1 | "não tenho ferramenta de comentar PR" | `GITHUB_PULL_REQUEST_REVIEW_WRITE` existia | T1 |
| E2 | "binário não tem porta no Drive" | generalizou limite local como lei | T1 |
| E3 | insistência em abrir PR sem branch | falhou 3× antes de ler o contrato | T3 |
| E4 | `drift-1790*` como padrão | real é `drift-1789*` | T7 |
| E5 | diretório `2026-09-24` no ARSENAL | a pasta não existe | T5 |
| E6 | "o desenho do loop = 0% no repo" | existe `LOOP-MESTRE-20260923.md` | T2, T5 |
| E7 | commit direto no PR-mãe | o adequado era PR-filho | T6 |
| E8 | `curl` com URL colada em markdown | falhou 2× | T4 |
| E9 | `<24h` em `parse_mode=HTML` | `400 can't parse entities` | T4 |
| E10 | sessão RDC tratada como estado atual | recibo dizia `HISTORY` | T8 |

## 3. As travas

```text
T1. NAO_AFIRMAR_AUSENCIA_SEM_BUSCAR
    Procurar no catálogo/índice antes de dizer "não tenho X".

T2. NAO_DAR_PORCENTAGEM_SEM_MEDIR
    "0%" só com busca feita. Sem busca, escrever "NÃO MEDI".
    Número inventado não é UNKNOWN — é falso dado.

T3. LER_O_CONTRATO_ANTES_DE_CHAMAR
    DESCRIBE_TOOLS antes da primeira chamada a slug novo.

T4. VALIDAR_COMANDO_ANTES_DE_MANDAR
    curl e HTML testados; escape verificado antes do envio.

T5. MEDIR_O_ALVO_ANTES_DO_VEREDITO
    Listar ou abrir o caminho antes de dizer "não existe".

T6. NAO_ESCOLHER_FLUXO_SOZINHO
    Se o CHEFE pediu "filho adequado", perguntar.
    Não justificar exceção por conta própria.

T7. CONFERIR_NOME_GLOB_SHA_ANTES
    Padrão de busca nunca repetido de memória.

T8. HISTORICO_NAO_E_ESTADO_ATUAL
    Recibo velho não descreve runtime de agora.
```

## 4. Amarração com as leis da Casa

```text
ONE_SYSTEM_ONLY        → E7 feriu: justificou bypass de fluxo
REUSE_BEFORE_CREATE    → E6 feriu: existia owner e não foi procurado
ONE_WRITER_PER_SCOPE   → E7 feriu: escolha de writer por conta própria
TIK-TAK 2.0            → E10 feriu: usou HEAD antigo como vivo
FALSO_VERDE = PROIBIDO → E6 feriu: 0% inventado não é UNKNOWN
```

## 5. Regra do TIK-TAK 2.0 aplicada à bancada

```text
1. MEDIR O HEAD antes de qualquer afirmação de estado
2. UNKNOWN não vira verde por narrativa
3. CI_PENDING != PASS
4. CONTRAPROVA no alvo, não no resumo
5. HEAD mudou durante o processo → medição caduca → recomeça
```

## 6. Frase canônica

> Não basta não mentir: é preciso não afirmar o que não foi aberto.

> Cerca não é desconfiança do vizinho — é respeito pelo gado.
