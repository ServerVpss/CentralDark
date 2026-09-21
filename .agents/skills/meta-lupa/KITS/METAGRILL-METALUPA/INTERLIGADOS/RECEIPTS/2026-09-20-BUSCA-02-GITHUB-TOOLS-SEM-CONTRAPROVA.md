# 🪬 BUSCA 02 — GitHub tools sem contraprova de owner/repo

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94  
PREVIOUS_RECEIPT=2026-09-20-BUSCA-01-GITHUB-404-OWNER-DUPLICADO.md

## Resultado da busca

Foi procurado no owner MCP:

- teste de github_get_repo;
- teste de github_list_pull_requests;
- teste direto de getRepo/listPullRequests;
- helper de normalizeRepo/parseRepo/full_name.

Resultado:

GITHUB_GET_REPO_TEST=NOT_FOUND.  
GITHUB_LIST_PULL_REQUESTS_TEST=NOT_FOUND.  
REPO_NORMALIZATION_HELPER=NOT_FOUND.  
EXISTING_GITHUB_TEST=github-labels.test.mjs.

## Ferida

A API interna aceita owner e repo separados, mas não existe teste que force o caso:

owner=ServerVpss  
repo=ServerVpss/CentralDark

Logo o endpoint duplicado escapou sem contraprova.

ROOT_CAUSE_CHAIN:

CALLER_ACCEPTS_AMBIGUOUS_REPO_SHAPE  
→ NO_SHARED_NORMALIZER  
→ NO_TEST_FOR_FULL_NAME  
→ /repos/owner/owner/repo  
→ 404.

## Correção mínima desejada

REUSE_BEFORE_CREATE: criar um helper único no próprio github.js ou módulo de boundary já existente, não uma nova camada.

O helper deve:

- aceitar owner + repo simples;
- aceitar repo como full_name owner/repo;
- validar conflito;
- remover barras excedentes;
- rejeitar formato com mais de um separador lógico;
- produzir sempre { owner, repo, fullName };
- ser usado por todas as funções GitHub que montam /repos/{owner}/{repo}.

Contraprovas obrigatórias:

- ServerVpss + CentralDark → ServerVpss/CentralDark.
- ServerVpss + ServerVpss/CentralDark → ServerVpss/CentralDark.
- owner omitido + ServerVpss/CentralDark → ServerVpss/CentralDark.
- owner conflitante + Other/CentralDark → FAIL_CLOSED.
- repo vazio/malformado → FAIL_CLOSED.

## Regra durável

BOUNDARY_NORMALIZATION_MUST_BE_TESTED=true.  
AMBIGUOUS_EXTERNAL_IDENTIFIER_MUST_BE_CANONICALIZED_ONCE=true.  
NO_TEST_FOR_BOUNDARY=UNKNOWN_NOT_PASS.

## NEXT_CURSOR

Patch no mesmo owner MCP + teste discriminante + build/test + receipt #1562 antes da próxima busca material.
