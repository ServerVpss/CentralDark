# Gates bloqueados e swarm atômico

## Recibo para gate que não iniciou

```text
GATE=
COMMAND_LITERAL=
STARTED=SIM|NAO
STDOUT_CAPTURED=SIM|NAO
STDERR_CAPTURED=SIM|NAO
EXIT_CODE_OBSERVADO=<n>|NONE
RESULT=PASS|FAIL|BLOCKED
BLOCKER_OBSERVED=
BASE_SHA=
CANDIDATE_SHA_OR_DIFF_HASH=
```

Regras:

- `STARTED=NAO` força `RESULT=BLOCKED`.
- Exit code lido do código-fonte é `NONE`, não um valor observado.
- Avaliação manual pode sugerir hipótese, nunca substituir execução.
- Para atribuir o bloqueio ao estado-base, reproduzir no checkout limpo do `BASE_SHA`.

## Protocolo de lockfile

1. Registrar `node --version`, `npm --version` e hashes dos manifestos.
2. Executar `npm ci` no `BASE_SHA` limpo.
3. Criar worktree descartável para atualizar somente o lockfile.
4. Comparar o diff: novas versões diretas, transitivas, removidas, mudanças de integridade e plataforma.
5. Executar `npm ci` novamente a partir do lock candidato.
6. Rodar test, lint e build.
7. Manter o lock em commit separado para revisão e rollback independentes.
8. Integrar ao candidato original e repetir os gates.

Antiatalho: `npm install --no-package-lock` não produz prova reproduzível.

## Recibo para revisão paralela

```text
BASE_SHA=
CANDIDATE_DIFF_HASH=
FILES_IN_SCOPE=<n>
REVIEWERS=<n>
ALL_READ_ONLY=SIM|NAO
SAME_BASE_AND_DIFF=SIM|NAO
WRITES_DETECTED=SIM|NAO
COVERAGE=<revisados>/<escopo>
CONTRADICTIONS_REPRODUCED=SIM|NAO
UNIQUE_INTEGRATOR=SIM|NAO
DIFF_CHANGED_DURING_REVIEW=SIM|NAO
VERDICT=VALID|STALE|INCOMPLETE
```

Invalidar todos os pareceres quando `DIFF_CHANGED_DURING_REVIEW=SIM`. Capacidade de escrita disponível não prova escrita; verificar o rastro real. Porém, um revisor contratado como read-only que alterou qualquer arquivo perde validade e a amostra precisa ser refeita.

Revisores devem investigar mecanismos diferentes: cobertura integral, segurança/lógica, e refutação experimental. Três resumos equivalentes não formam evidência independente.
