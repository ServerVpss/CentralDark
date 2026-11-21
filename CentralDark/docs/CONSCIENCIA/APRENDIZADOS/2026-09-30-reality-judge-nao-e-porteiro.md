# Aprendizado — Reality Judge valida efeito, não autoriza execução

- **Categoria:** governança-execução
- **Data:** 2026-09-30
- **Contexto:** A regra `REALITY=JUDGE` estava correta como defesa contra falso verde, mas podia ser interpretada por agentes como porteiro global antes de cada ação. Isso travava fluxos determinísticos e podia deslocar autoridade do CHEFE para um ritual repetitivo de revalidação.
- **Aprendizado:** `REALITY=JUDGE` deve ser aplicado depois do efeito ou antes de declarar PASS material. Não é permissão de execução, não substitui a autoridade do CHEFE e não bloqueia rota determinística existente. Sinais de realidade também podem estar parciais, atrasados ou obsoletos; quando o CHEFE dá julgamento explícito e há próximo teste determinístico seguro, execute, meça o cone afetado e continue.
- **Regra cristalizada:** `DETERMINISTIC_ROUTE_FIRST=true`; `REALITY_JUDGE_AFTER_EFFECT=true`; `REALITY_JUDGE_BEFORE_MATERIAL_PASS_CLAIM=true`; `REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION=true`; `REALITY_SIGNAL_CAN_BE_PARTIAL_OR_STALE=true`; `MACHINE_RESOLVABLE_BLOCKER_AUTO_CONTINUE=true`; `UNCHANGED_FINGERPRINT_REUSES_PROOF=true`.
