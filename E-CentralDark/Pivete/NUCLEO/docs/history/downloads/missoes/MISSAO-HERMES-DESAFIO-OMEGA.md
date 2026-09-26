# MISSÃO — ARMAR E RESOLVER O DESAFIO OMEGA

## Ordem

Use o clone canônico e a `lupa-bayesiana`.

```text
RESOLVE. VÁ ATÉ O FIM.
PERMITO PIVETE SEM AÇÃO DESTRUTIVA. 🔒🚀
```

## Fase A — Congelar o desafio

1. Atualize `origin/main` com `fetch` e `pull --ff-only`.
2. Crie a branch:
   `test/desafio-omega-autolupa-2026-07-22`
3. Copie integralmente a pasta:
   `desafios/omega_autolupa/`
4. Não altere `omega_solver.py`.
5. Rode os testes e confirme que falham por `NotImplementedError`.
6. Commit:
   `test(omega): arma benchmark adversarial de autocorrecao`
7. Push normal e PR draft:
   `[BENCHMARK] Desafio Omega — autocorreção com prova`
8. Registre:
   - BASE_SHA
   - CHALLENGE_COMMIT
   - SHA-256 de CONTRACT.md
   - SHA-256 dos testes
   - resultado vermelho inicial.

## Fase B — Solução Free Tier

Somente depois do baseline congelado:

1. Use o modelo Free Tier ativo.
2. Implemente apenas `omega_solver.py`.
3. Não altere testes, contrato ou gerador.
4. Use AutoLupa após cada falha.
5. Continue até todos os 25 testes passarem.
6. Execute três vezes seguidas.
7. Rode varredura de secrets.
8. Confirme diff limitado ao solver.
9. Commit e push na mesma branch.
10. Não faça merge.

## Evidência final

```text
MODEL:
BASE_SHA:
CHALLENGE_COMMIT:
SOLUTION_COMMIT:
FILES_CHANGED_BY_SOLUTION:
TESTS_RUN_1:
TESTS_RUN_2:
TESTS_RUN_3:
PROPERTY_SEEDS:
CONCURRENCY_THREADS:
SECRET_LEAKS:
FIXED_POINT:
LEDGER_VALID:
TAMPER_DETECTED:
TIME_TOTAL:
RETRIES:
AUTOLUPA_CORRECTIONS:
PR:
VERDICT:
```

## Proibições

```text
SEM MERGE
SEM DEPLOY
SEM RESTART
SEM FORCE-PUSH
SEM VPS
SEM SUPABASE DE PRODUÇÃO
SEM ALTERAR TESTES
SEM ALTERAR CONTRATO
SEM REDE EXTERNA
```
