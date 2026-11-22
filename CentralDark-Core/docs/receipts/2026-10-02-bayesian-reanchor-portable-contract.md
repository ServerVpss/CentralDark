# Receipt — Bayesian reanchor portable contract

- Data: 2026-10-02
- Owner: `CENTRALDARK_AI_BOOT.yaml#portable_operation_contract.bayesian_reanchor_measurement`
- Math owner: `.agents/skills/meta-lupa/references/matematica-e-calibracao.md#8-medição-bayesiana-de-reancoragem-do-contrato-portátil`
- Learning: #140
- Scope: contrato portátil + matemática/calibração; sem claim de causalidade sem controle medido.

## Estado promovido

```text
BAYESIAN_REANCHOR_MEASUREMENT=CANONICAL_REQUIRED
REANCHOR_REINJECTION_IS_INTERVENTION_NOT_PROOF=true
NUMERIC_POSTERIOR_REQUIRES_DECLARED_BASIS=true
INVENTED_LR=FORBIDDEN
UNKNOWN_IS_SUCCESS=false
CAUSAL_UPLIFT_REQUIRES_CONTROL_OR_MATCHED_BASELINE=true
NO_CONTROL=DESCRIPTIVE_RECOVERY_RATE_ONLY
BETA_POSTERIOR_ACCUMULATES_REANCHOR_RELIABILITY=true
BRIER_SCORE_CALIBRATES_ALIGNMENT_PREDICTIONS=true
ONE_LR_PER_DEPENDENCE_CLUSTER_CONSERVATIVE=true
LATEX_FORMULAS_LIVE_IN_PORTABLE_CONTRACT=true
```

## Fórmulas canônicas

```text
O(H)=P(H)/(1-P(H))
LR_i=P(E_i|H)/P(E_i|¬H)
O(H|E_1..E_n)=O(H)×ΠLR_i
P(H|E)=O/(1+O)
Δ_reanchor=P(A=1|T=1)-P(A=1|T=0)
RR_reanchor=P(A=1|T=1)/P(A=1|T=0)
θ|D~Beta(α0+s,β0+f)
E[θ|D]=(α0+s)/(α0+β0+s+f)
IG=H(p_prior)-H(p_posterior)
BS=(1/N)Σ(p_i-y_i)^2
p*=C_FP/(C_FP+C_FN)
VOI=L_before-L_after-C_test
```

## Contraprova

- Reinjeção sem outcome não é amostra de sucesso.
- Taxa pós-reinjeção sem controle não prova efeito causal.
- Prior/LR sem base declarada => NOT_CALCULABLE.
- Evidência correlacionada não é multiplicada como independente.
- Posterior alto não concede autoridade operacional.
- Mudança do fingerprint do contrato inicia nova coorte de calibração.

NEXT_CURSOR: acumular eventos de reancoragem com fingerprint, indicadores, outcome, prior/LR provenance, posterior/calibração quando calculáveis e comparar somente coortes compatíveis.
