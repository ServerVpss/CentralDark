# 🪬 BUSCA 01 — GitHub 404 por owner/repo duplicado

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94  
SEARCH_POLICY=SEARCH_MATERIAL_THEN_CRYSTALLIZE_TO_PR_MOTHER  
CURRENT_OVER_HISTORY=true  
UNKNOWN_IS_NOT_PASS=true

## Sintoma recebido

Dois erros materiais:

- github_get_repo → GitHub API 404 em /repos/ServerVpss/ServerVpss/CentralDark
- github_list_pull_requests → GitHub API 404 em /repos/ServerVpss/ServerVpss/CentralDark/pulls

## Busca executada

A busca canônica confirmou que o repositório correto é:

ServerVpss/CentralDark

Não foi encontrado uso legítimo do full_name duplicado ServerVpss/ServerVpss/CentralDark no repositório.

Implementações relevantes encontradas:

- apps/modulos/mcp/src/tools/github/github-read.js
- apps/modulos/mcp/src/tools/github/github.js
- apps/modulos/mcp/src/config.js

## Causa provada

config.js define separadamente:

- GITHUB_OWNER default = ServerVpss
- GITHUB_REPO default = CentralDark

github-read.js aceita separadamente owner e repo e encaminha diretamente para github.js.

github.js constrói endpoints no formato:

/repos/{owner}/{repo}

Portanto, se um chamador fornece:

owner=ServerVpss
repo=ServerVpss/CentralDark

a concatenação produz:

/repos/ServerVpss/ServerVpss/CentralDark

ROOT_CAUSE=REPO_INPUT_NORMALIZATION_MISSING.

REPO_DELETED=false.  
GITHUB_OUTAGE_NOT_PROVEN=true.  
AUTH_FAILURE_NOT_PROVEN=true.  
CALLER_SHAPE_CAN_TRIGGER_404=true.

## Regra corretiva

A rota GitHub deve aceitar de forma determinística:

1. owner=ServerVpss + repo=CentralDark
2. repository_full_name=ServerVpss/CentralDark quando uma surface usar full_name

Mas nunca misturar os dois formatos sem normalização.

Contrato:

GITHUB_REPO_CANONICAL=ServerVpss/CentralDark.  
OWNER_CANONICAL=ServerVpss.  
REPO_CANONICAL=CentralDark.  
FULL_NAME_CANONICAL=ServerVpss/CentralDark.  
DUPLICATED_OWNER_PATH=FORBIDDEN.

Se repo contiver "/", a implementação deve:
- parsear owner/repo uma única vez;
- rejeitar conflito entre owner explícito e owner derivado;
- nunca concatenar owner duas vezes.

## Padrão novo solicitado pelo CHEFE

A partir desta sessão:

BUSCA_MATERIAL  
→ DELTA  
→ CRISTALIZAÇÃO NO PR-MÃE  
→ SÓ ENTÃO PRÓXIMA BUSCA/MUTAÇÃO.

O PR-MÃE permanece ledger/rendezvous; o owner técnico continua recebendo a mutação real.

CRYSTALLIZE_AFTER_EACH_MATERIAL_SEARCH=true.  
PR_MOTHER_IS_MANDATORY_SESSION_LEDGER=true.  
SEARCH_RESULT_WITHOUT_RECEIPT=INCOMPLETE.  
PR_MOTHER_RUNTIME_WRITER=false.

## NEXT_CURSOR

1. localizar testes existentes das GitHub tools;
2. adicionar normalização shared owner/repo/full_name no owner MCP;
3. adicionar contraprova para owner + repo full_name duplicado;
4. rodar testes same-head;
5. registrar resultado no PR-MÃE antes da próxima busca;
6. continuar a trajetória global já aberta sem criar PR paralelo.
