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
## 8. Medição Bayesiana de reancoragem do contrato portátil

**Hipótese operacional**

\[
H = \text{executor alinhado ao fio canônico CURRENT}
\]

A reinjeção do contrato é uma **intervenção** \(T\), não uma prova por si só:

\[
T=1 \Rightarrow \text{contrato portátil reinjetado}
\]

\[
T=0 \Rightarrow \text{sem reinjeção ou baseline pareada}
\]

O resultado \(A=1\) só ocorre quando todos os indicadores materiais aplicáveis passam: docs-first, CURRENT recuperado, SELF-GRILL, setor/owner, REUSE_BEFORE_CREATE, PAPAGAIO OFF, ausência de reprova redundante e NEXT_CURSOR preservado. UNKNOWN material não conta como sucesso.

### 8.1 Prior, odds, LR e posterior

\[
O(H)=\frac{P(H)}{1-P(H)}
\]

\[
LR_i=\frac{P(E_i\mid H)}{P(E_i\mid \neg H)}
\]

\[
O(H\mid E_1,\ldots,E_n)=O(H)\prod_{i=1}^{n}LR_i
\]

\[
P(H\mid E)=\frac{O(H\mid E)}{1+O(H\mid E)}
\]

Não inventar prior, LR ou posterior. Sem base histórica/experimental ou fonte declarada, usar NÃO CALCULÁVEL ou classificação ordinal.

### 8.2 Efeito empírico da reinjeção

Para medir se reinjetar o contrato melhora o alinhamento:

\[
\Delta_{reanchor}
=
P(A=1\mid T=1)-P(A=1\mid T=0)
\]

e, quando a taxa de controle for diferente de zero:

\[
RR_{reanchor}
=
\frac{P(A=1\mid T=1)}{P(A=1\mid T=0)}
\]

Sem controle ou baseline pareada, não chamar isso de efeito causal; registrar apenas taxa descritiva de recuperação após reinjeção.

### 8.3 Posterior Beta da confiabilidade da reancoragem

Se \(\theta=P(A=1\mid T=1)\):

\[
\theta\sim \operatorname{Beta}(\alpha_0,\beta_0)
\]

Após \(s\) sucessos e \(f\) falhas:

\[
\theta\mid D
\sim
\operatorname{Beta}(\alpha_0+s,\beta_0+f)
\]

Média posterior:

\[
\mathbb{E}[\theta\mid D]
=
\frac{\alpha_0+s}{\alpha_0+\beta_0+s+f}
\]

Não assumir \(\operatorname{Beta}(1,1)\) silenciosamente. Se usado como prior neutro experimental, declarar explicitamente.

Com tratamento e controle medidos separadamente, uma pergunta útil é:

\[
P(\theta_1>\theta_0\mid D)
\]

Isto mede a probabilidade posterior de a reancoragem ter taxa de alinhamento superior ao controle, sem confundir essa probabilidade com autoridade operacional.

### 8.4 Entropia e ganho de informação

\[
\mathcal{H}(p)
=
-p\log_2 p-(1-p)\log_2(1-p)
\]

\[
IG
=
\mathcal{H}(p_{prior})
-
\mathcal{H}(p_{posterior})
\]

Se repetir o mesmo contrato não reduz incerteza, não muda regra/teste e não acrescenta amostra útil, a repetição não gera ouro novo.

### 8.5 Calibração

Para previsões probabilísticas de alinhamento:

\[
BS
=
\frac{1}{N}
\sum_{i=1}^{N}(p_i-y_i)^2
\]

onde \(y_i\in\{0,1\}\). Quanto menor o Brier Score, melhor a calibração média.

### 8.6 Dependência entre evidências

Não multiplicar sinais correlacionados como se fossem independentes. Modo conservador: um LR por cluster de dependência. Se o veredito muda entre a hipótese de independência e o modo conservador, marcar SENSÍVEL À DEPENDÊNCIA.

### 8.7 Limiar e valor da informação

O limiar de decisão continua sendo apoio, não autoridade:

\[
p^*
=
\frac{C_{FP}}{C_{FP}+C_{FN}}
\]

\[
VOI
=
L_{before}
-
L_{after}
-
C_{test}
\]

A reancoragem só merece repetição instrumental quando acrescenta calibração, reduz entropia, encontra drift ou altera o próximo movimento.

