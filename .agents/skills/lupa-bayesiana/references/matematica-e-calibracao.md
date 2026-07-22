# Matemática e Calibração — MetaLupa Bayesiana

Companheiro de `SKILL.md`. Fórmulas auditáveis + tradução concreta.

## 1. Odds e Posterior (várias evidências)

**Problema:** como combinar várias evidências numa única crença?

- `odds = p / (1 - p)` — converte probabilidade em chance
- `odds_posterior = odds_prior × LR1 × LR2 × ... × LRn`
- `p_posterior = odds_posterior / (1 + odds_posterior)`

**Exemplo:** prior 0,3 (odds 0,43). LR1=5, LR2=2 → odds 0,43×5×2 = 4,29 → p ≈ 0,81.

**Caminho:** antes 30% → evidências favoráveis → depois 81%.

**Fórmula:** `p_post = (p0/(1-p0) × ∏LR) / (1 + p0/(1-p0) × ∏LR)`

## 2. Likelihood Ratio (LR)

`LR = P(E|H) / P(E|¬H)`

Base defensável obrigatória (SKILL Princípio 2). Sem base → classificar ordinal:
`favorece H | neutro | favorece ¬H` e calcular faixa de sensibilidade.

## 3. Entropia binária (incerteza)

`H(p) = -p·log2(p) - (1-p)·log2(1-p)`

Mede quanto falta saber. H(0,5)=1 bit (máxima incerteza). H→0 quando p→0 ou 1.

## 4. Valor da Informação (VOI)

`VOI = perda_antes - perda_depois - custo_total`

Incluir em custo: tempo, dinheiro, risco operacional, reversibilidade, exposição de dados, custo cognitivo.

Priorizar teste que mais reduz `H(p)` por menor VOI.

## 5. Limiar de decisão (apenas apoio)

`p* = C_fp / (C_fp + C_fn)`

Não autoriza ação crítica por si só (SKILL Fase 7).

## 6. Sensibilidade à dependência

Agrupar evidências do mesmo cluster (mesma fonte/execução/narrativa).
- Conservador: 1 LR por cluster.
- Otimista: independência.
Se veredito muda → `SENSÍVEL À DEPENDÊNCIA`.

## 7. Calibração

Evitar 0 e 1 (dogma). Usar base rate quando houver. `0,5` só como neutro declarado.
Registrar quem escolheu o prior e com qual evidência.
