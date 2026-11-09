# Receipt — 50 sondas metabólicas da metacognição CentralDark

- Data local: 2026-10-27
- Checkout: `F:\_worktrees\cd-metacog-20261027`
- Fonte: `ServerVpss/CentralDark@main`
- SHA medido: `4a725219fa064274c239ce93c3e8ce7a47cfd48c`
- Estado: `LOCAL_WORKTREE_VALIDATED` (sem commit, merge, deploy ou autopromoção)
- Implementação: `scripts/memory-linker/metacognitive-metabolism.mjs`
- Integração: `scripts/memory-linker/dream-review-run.mjs`
- Contrato: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`
- Teste: `scripts/memory-linker/metacognitive-metabolism.test.mjs`

## Provas executadas

1. Node `--test` nos arquivos `metacognitive-metabolism.test.mjs`, `dream-review-run.test.mjs`, `dream-review.test.mjs`, `pattern-discovery.test.mjs` e `agent-call.test.mjs`: **104/104 PASS, 0 FAIL**.
2. Registradas 50 sondas únicas executadas, com análise de deduplicação, proveniência, memória, orçamento, causalidade, holdout e escopo.
3. Contraprova: um controle que melhora tanto quanto o tratamento agora bloqueia falso ganho causal (corrigido o erro de arredondamento de ponto flutuante descoberto nos autotestes).
4. Regressão declarada e holdout negativo bloqueiam candidatura causal; fonte externa sem confirmação mantém quarentena; ausência de experimento retorna `UNPROVEN`.
5. CLI ponta a ponta: primeira chamada `METABOLIC_PROBES=50 METABOLIC_ACTION=META_LUPA_CAUSAL_REVIEW LIBRARY=UPDATED`.
6. CLI segunda chamada com a mesma entrada: `METABOLIC_ACTION=NO_NEW_INFORMATION LIBRARY=UNCHANGED`.
7. CLI terceira chamada: `METABOLIC_ACTION=NO_NEW_INFORMATION LIBRARY=UNCHANGED WRITE=UNCHANGED` (ponto estável observado).
8. JSON de saída da segunda rodada: `probe_count=50`, `observed_probe_count=50`, `reused_lessons=1`, `automatic_canonical_promotion=false`.
9. `git diff --check` passou em checkout isolado, e `ls-remote origin main` devolveu o mesmo SHA de origem.

## Falhas antigas solucionadas sem enfraquecer o gate

A suíte inicial detectou 2 falhas preexistentes no `dream-review-run.test.mjs`. Confirmei pela execução do runner original do mesmo HEAD que ambas já existiam sem a extensão. Corrigi a rota para **herdar apenas o header efetivamente presente** no entry gate e adaptei os fixtures para produzir o header validável com todos os 10 critérios **UNKNOWN** (nunca PASS inventado). Um teste negativo confirma que, sem header, o roteamento permanece bloqueado. Resultado após a correção: **104/104 PASS**, mantendo a validação canônica.

## Limites verídicos

- As 50 capacidades são **sondas funcionais determinísticas**, não 50 modelos treinados ou 50 agentes independentes.
- Métrica declarada e receipt hash não significam verificação causal externa; a promoção depende da MetaLupa, prova independente e Writer autorizado.
- Não houve alteração de pesos, AGI, consciência subjetiva, merge ou deploy.
- Os testes e experimento CLI usaram dados sintéticos explícitos; o ganho do runtime produtivo permanece fora deste receipt.

## NEXT_CURSOR

Publicar o delta na trilha GitHub autorizada; fazer o CI do mesmo SHA e a prova de workload real independente antes de alegar ganho causal em produção. O runner já executa 50 sondas automaticamente; repetir provas verdes somente se houver alteração material.
