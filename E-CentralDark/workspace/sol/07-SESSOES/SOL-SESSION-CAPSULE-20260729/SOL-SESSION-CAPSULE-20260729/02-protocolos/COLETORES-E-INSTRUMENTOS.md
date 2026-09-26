# Coletores e instrumentos

## Contrato atômico

```text
COLLECTOR=
MODE=READ_ONLY
ROOT=
MAX_SCOPE=
MAX_DEPTH=
TIMEOUT_SECONDS=
OUTPUT_PATH=
ALLOWED_READS=
ALLOWED_WRITES=
STOP_CONDITIONS=
RETURN_FORMAT=
```

## Instrumentação mínima

Emitir antes da primeira leitura:

```text
STARTED_AT=
MONOTONIC_START=
```

Encerrar, inclusive em falha:

```text
COMPLETED_AT=
MONOTONIC_ELAPSED=
COMMAND_EXIT=
SCOPE_REAL=
TRUNCATED=
OUTPUT_SHA256=
ERRORS=
VERDICT=VALID|PARTIAL|INVALID
```

## Regras aprendidas

- Não usar `rglob` irrestrito sob diretórios descobertos.
- Um nível ainda precisa de limite e lookahead.
- Não reconstruir caminho a partir de nome reservado.
- Reutilizar o objeto retornado pelo enumerador.
- Descartar enumeradores deterministically.
- Não usar lógica PowerShell complexa inline através de Bash/MSYS.
- Comandos Windows simples podem usar um único PowerShell transportado pelo
  wrapper inevitável.
- Lógica complexa deve ficar em script visível, revisado, analisado pelo parser
  e só então executado.
- Instrumento rejeitado é preservado com hash e marcado `DEPRECATED`.

## Pipeline do instrumento

```text
CONTRATO
→ PREPARAR CÓDIGO
→ REVISAR CÓDIGO
→ PARSER SEM EXECUÇÃO
→ TESTE SINTÉTICO
→ AUTORIZAR EXECUÇÃO REAL
→ HASH + RECIBO
```

