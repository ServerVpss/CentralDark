# CONTRATO - rigor-demo.txt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-demo.txt
**SHA:** 4298e81342419025
**Timestamp:** 2026-08-26T19:10:23.595861
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- AUTO_APPLY_BLOQUEIO=MATCH_PROVADO\=NAO | ALTERACAO_LOCAL\=NAO | REVERSIVEL\=NAO | WRITER_UNICO\=NAO | ESCOPO_AUTORIZADO\=NAO | MUDANCA_MINIMA\=NAO | TESTE_DISCRIMINATIVO_EXISTE\=NAO | TESTE_ANTES_FALH

### Ouro Bruto (primeiros 5000 chars)
```
QA_CONTEXT_DELTA=

EVENTO=TEST_FAILED
MANIFEST_HASH=57c6274bb168a416f7744a8796d60ccd704a7fcfec79f50c26fd8beb391a9518

STATUS=OK
HEURISTICAS_ATIVADAS=
- FAILURE
- STATE-ANALYSIS

DOCUMENTOS_CONSULTADOS=
- SKILL.md

CAUSA_A_INVESTIGAR=trailer no rodapé não foi reconhecido
TESTE_DISCRIMINATIVO=Preservar o teste que encontrou a falha; corrigir a fonte, nunca a assertion para fabricar verde.
REGRESSAO_PRESERVADA=SIM
MISSAO_PRESENTE=SIM
MISSAO_ATUAL_PRESERVADA=SIM
MISSION_ID=RECUPERAR_E_FINALIZAR_PR664
MISSION_STATE=INVARIAVEL_ATUAL_CORRIGIDA
PROXIMO_ESTADO=TESTE_DISCRIMINATIVO_VERDE

AUTO_APPLY=NAO
POLICY_STATE=AUTO_APPLY_BLOCKED
AUTO_APPLY_BLOQUEIO=MATCH_PROVADO\=NAO | ALTERACAO_LOCAL\=NAO | REVERSIVEL\=NAO | WRITER_UNICO\=NAO | ESCOPO_AUTORIZADO\=NAO | MUDANCA_MINIMA\=NAO | TESTE_DISCRIMINATIVO_EXISTE\=NAO | TESTE_ANTES_FALHOU\=NAO | TESTE_DEPOIS_PASSOU\=NAO | REGRESSAO_PASSOU\=NAO | CASO_NEGATIVO_PASSOU\=NAO | IDEMPOTENCIA_PASSOU\=NAO | ROLLBACK_EXISTE\=NAO | HEAD_FIXADO\=NAO | SEM_CONFLITO_CANONICO\=NAO | ARQUIVOS_FORA_ESCOPO_ZERO\=NAO | FAIL_ZERO\=NAO | SKIPPED_ZERO\=NAO | UNKNOWN_ZERO\=NAO | SECRETS\=DESCONHECIDO | MERGE\=DESCONHECIDO | DEPLOY\=DESCONHECID ...[truncado]

APRENDIZADO_PROMOVIDO=NAO
APRENDIZADO_STATUS=NAO_SOLICITADO
APRENDIZADO_REUTILIZADO=NAO

CONTEXTO_INTEIRO_CARREGADO=NAO
APENAS_DELTA_RELEVANTE=SIM
MATCH_COUNT=2
DOCUMENTOS_CARREGADOS=1

--- TRECHOS SELETIVOS ---
### failure (SKILL.md) score=20.1 mode=KEYWORD_WINDOWS
## Contrato curto
→ próxima sessão reutiliza
```

Esta skill é **módulo subordinado**. Ela não abre missão nova, não troca objetivo,
não abandona worktree, não muda Writer e não fecha a missão raiz.

## Eventos

- `TEST_FAILED`
- `NODE_CHECK_FAILED`
- `SEMANTIC_FAILURE_WITH_SYNTAX_PASS`
- `REGRESSION_FAILED`
- `TIMEOUT`
- `STATE_TRANSITION_ERROR`

## Regras inegociáveis

- Não carregar o acervo inteiro.
- Não adaptar teste para aceitar código quebrado.
- Não promover `proven=true` sem contrato de prova.
- Não tratar erro de leitura, API, Judge ausente ou resultado vazio como PASS.
- Não ler `.env`, `secrets/`, `tokens/`, `sessions/` ou `.ssh/`.
- Não criar V1/V2/V3/NOVO/FINAL paralelo.
- Não executar Enxame sem pedido explícito.
- Não fazer merge, deploy, VPS, produção ou reescrita histórica.

## Runtime


## Aprendizado promovível

`proven=true` sozinho não vale. Exigir:

```text
SOURCE
...[truncado]


```