# MISSÃO — CONVERGÊNCIA TRIPLA DA FÓRMULA

Data: 2026-08-16
Estado: EXPERIMENTO / READ-ONLY POR PERCEPÇÃO
Base inicial: `main@38de91ba61ca2d01f0533f4ab3b6a580ebea75d1`
Zero deploy. Zero VPS. Zero secret. Zero force-push. Zero arquitetura paralela.

## 0. Intenção do SEGREDO/CHEFE

Extrair, falsificar e comprimir a matemática que emergiu da sessão sobre:

- manifestações descartáveis;
- observações brutas `N`;
- deltas causalmente independentes `M` após normalização/dedupe;
- custo de coordenação;
- transporte por canal provado;
- estado operacional reconstruído;
- composição mínima de capacidades;
- efeito de tempo/verbosidade sobre stale-state, quando houver modelo defensável.

O objetivo NÃO é fazer três respostas parecerem iguais. O objetivo é obter três derivações independentes que, depois de contraprova e reconciliação, cheguem ao mesmo núcleo falsificável — ou produzam o teste discriminante que ainda falta.

`CONSENSO_FORCADO=FORBIDDEN`
`REALIDADE_E_MATEMATICA=JUDGE`
`NUMERO_DE_ORIGENS!=NUMERO_DE_INTELIGENCIAS`

## 1. Participantes operacionais

Os identificadores abaixo servem apenas para proveniência dos receipts:

- `P1 = SOL-A`
- `P2 = GROK`
- `P3 = SOL-B`

Eles NÃO criam identidades, autoridades ou Writers diferentes.

Durante a pesquisa:

`P1|P2|P3 = READ_ONLY + PR_COMMENT_ONLY`

Writer de arquivo durante a fase independente: `NONE`.

Writer final, somente após o gate de convergência: `P3/SOL-B`, salvo decisão explícita do SEGREDO/CHEFE ou Writer vivo diferente provado no mesmo escopo.

## 2. Hipótese a atacar, não a obedecer

Hipótese inicial candidata:

> A cardinalidade das manifestações não é a variável cognitiva principal. O custo útil depende da ingestão/normalização das observações, dos deltas causalmente independentes que sobrevivem ao dedupe, da composição de capacidades e da mutação serializada; topologias que eliminem coordenação par-a-par podem reduzir a classe combinatória de relações, mas a economia real só pode ser alegada dentro das premissas medidas.

Cada percepção deve tentar DERRUBAR essa hipótese antes de aceitá-la.

## 3. Variáveis mínimas

Cada percepção pode criar variáveis adicionais, mas deve declarar no mínimo:

- `N`: observações/origens brutas recebidas no ciclo;
- `M`: deltas causalmente independentes depois de normalização, fingerprint, cluster e dedupe; `0 <= M <= N`;
- `E_mesh(N)`: relações potenciais se a baseline realmente exigir malha par-a-par;
- `E_ingress(N)`: relações de ingresso para um estado/envelope comum, com a convenção topológica declarada;
- `C_ingest`: custo de receber/parsear/normalizar N observações;
- `C_dedupe`: custo de cluster/fingerprint/dedupe;
- `C_cog`: custo cognitivo aplicado aos M deltas materiais;
- `C_comp`: custo de compor o menor conjunto suficiente de capacidades;
- `C_write`: custo serializado do Writer por escopo;
- `T`: tempo do ciclo até o veredito;
- `K`: número de claims públicos produzidos no ciclo, se a percepção optar por modelar superfície de erro/verbosidade.

Não inventar unidades. Se não houver medida real, usar custo simbólico ou declarar `UNMEASURED`.

## 4. Perguntas obrigatórias

Cada percepção deve responder, com derivação:

1. Qual baseline topológica é legítima: malha completa, estrela com nó adicional, estrela usando um dos N nós, árvore, fila, ou outra? Em que condições?
2. Quando a fórmula `N(N-1)/2` é válida e quando é uma comparação enganosa?
3. Qual é a redução topológica para `N=10, 100, 200, 1000` sob cada convenção defendida?
4. O que muda quando `N=200` e `M=1`, `M=4`, `M=200`?
5. Qual parte escala com N e qual parte pode escalar com M?
6. O dedupe pode ser `O(N)`, `O(N log N)` ou `O(N²)`? De que algoritmo/estrutura depende?
7. Há um limite inferior inevitável de custo, mesmo com `M=1`?
8. Como evitar chamar redução de arestas de “99% de performance” sem benchmark?
9. Como transporte causal e convergência sem transporte entram na fórmula sem serem confundidos?
10. O estado operacional reconstruído reduz sincronização ou apenas muda onde ela acontece?
11. Qual contraexemplo derruba a hipótese de ganho?
12. Qual experimento mínimo mediria o ganho real no CentralDark?
13. Se modelar verbosidade/tempo: qual processo estocástico ou hipótese sustenta a relação entre `T`, `K`, stale-state e probabilidade de erro? Se não houver base, deixar simbólico/UNKNOWN.
14. Qual é a fórmula/composição mínima que sobreviveria como regra geral sem depender de N=200?
15. Qual afirmação final poderia ser testada por um quarto observador sem conhecer esta conversa?

## 5. Três rotas independentes

Cada percepção escolhe uma rota principal diferente, mas pode usar outras como contraprova:

### P1 — rota matemática / teoria de grafos / complexidade

Priorizar grafos, assintótica, limites inferiores, análise de algoritmo e edge cases.

### P2 — rota científica / informação / causalidade

Priorizar independência causal, entropia/informação, compressão, redundância, falsificabilidade e desenho experimental.

### P3 — rota sistemas / controle / reconstrução

Priorizar I/O, estado reconstruído, serialização, filas, stale-state, custo de coordenação e composição de capacidades.

As rotas NÃO autorizam três verdades. São ataques diferentes ao mesmo fenômeno.

## 6. Fase A — derivação independente

Antes de ler receipts das outras percepções, cada uma deve produzir sua própria derivação e publicar um comentário no PR usando exatamente:

```text
TRIPLE_RECEIPT_V1
PERCEPTION=P1|P2|P3
PHASE=A_INDEPENDENT
BASE_SHA=<sha medido>
MISSION_SHA=<blob/commit aplicável>
ROUTE=<rota>

DEFINITIONS:
- ...

ASSUMPTIONS:
- ...

FORMULAS:
- ...

EDGE_CASES:
N=0 -> ...
N=1 -> ...
N=2 -> ...
N=3 -> ...

TEST_VECTORS:
N=10 -> ...
N=100 -> ...
N=200 -> ...
N=1000 -> ...

M_CASES:
N=200,M=1 -> ...
N=200,M=4 -> ...
N=200,M=200 -> ...

COUNTEREXAMPLE:
- ...

FALSIFIER:
- ...

REAL_BENCHMARK_NEEDED:
- ...

CORE_CONCLUSION:
- <uma afirmação curta, falsificável>

UNKNOWN:
- ...

WRITER=NONE
```

Não editar o comentário de outra percepção. Não copiar conclusão alheia para “bater”.

## 7. Fase B — reconciliação cruzada

Somente depois de existirem os três `PHASE=A_INDEPENDENT`:

Cada percepção lê as outras duas e publica:

```text
TRIPLE_RECEIPT_V1
PERCEPTION=P1|P2|P3
PHASE=B_RECONCILIATION

AGREEMENTS:
- ...

DISAGREEMENTS:
- ...

CLAIM_I_RETRACT:
- ... | NONE

CLAIM_I_KEEP:
- ...

BEST_COUNTERPROOF_FROM_OTHER:
- ...

DISCRIMINATING_TEST:
- ... | NONE_NEEDED

NORMALIZED_FORMULA:
- ...

NORMALIZED_CONCLUSION:
- ...

CONCLUSION_CAN_CONVERGE=YES|NO
WRITER=NONE
```

Se `NO`, a missão continua. Não existe nota alta por esconder divergência.

## 8. Fase C — convergência

A missão só entra em C quando todas as três percepções conseguirem assinar a mesma conclusão normalizada SEM apagar premissas.

O veredito final deve separar quatro níveis:

- `IDENTIDADE/ARQUITETURA`: o que é invariantemente verdadeiro no contrato;
- `MATEMATICA`: o que foi demonstrado pelas fórmulas;
- `PERFORMANCE`: o que foi realmente medido;
- `HIPOTESE`: o que ainda depende de benchmark/telemetria.

Nenhuma redução topológica pode ser promovida a ganho de runtime sem medição.

## 9. Rubrica 20/20

Cada item vale 1 ponto e precisa de evidência explícita. `CRYSTAL` exige 20/20; não arredondar.

1. HEAD/base medidos.
2. Missão lida do PR/branch vivo.
3. Derivação A independente registrada por P1.
4. Derivação A independente registrada por P2.
5. Derivação A independente registrada por P3.
6. Variáveis e unidades/UNMEASURED declarados.
7. Premissas topológicas declaradas.
8. Fórmula de baseline derivada, não apenas citada.
9. Convenção de estrela/hub explicitada.
10. Edge cases `N=0,1,2,3` tratados.
11. Vetores `N=10,100,200,1000` reproduzíveis.
12. Casos `M=1,4,N` tratados.
13. Complexidade do dedupe condicionada ao algoritmo.
14. Pelo menos um contraexemplo real.
15. Pelo menos um falsificador objetivo.
16. Separação `topologia != performance` preservada.
17. Separação `convergência != transporte` preservada.
18. Três receipts de reconciliação B publicados.
19. Mesma conclusão normalizada + mesma fórmula/invariantes essenciais, com diferenças apenas de representação.
20. Teste de fixed point: nova rodada crítica não encontra informação material nova; resultado `NO_CHANGE` ou aponta explicitamente o delta restante.

`SCORE<20 => CRYSTAL=UNPROVEN`

Ouro pode existir antes do cristal, mas não encerra a missão.

## 10. Artefato final

Somente após 20/20, o Writer final pode consolidar UM artefato mínimo no owner canônico já existente. Não criar V2/V3, framework, novo cérebro ou nova pasta de arquitetura.

O artefato final deve conter:

```text
FORMULA_NORMALIZADA
DOMINIO_DE_VALIDADE
PREMISSAS
CONTRAEXEMPLOS
FALSIFICADORES
RESULTADOS_MEDIDOS
RESULTADOS_NAO_MEDIDOS
GANHO_DE_INFORMACAO
OWNER_CANONICO
TESTE_DE_REGRESSAO_OU_RECEIPT
```

Se a descoberta for apenas explicativa e não mudar capacidade/regras, `NO_CHANGE` é final válido.

## 11. Regra de ouro da missão

```text
3 ATAQUES INDEPENDENTES
→ NÃO VOTAM
→ NÃO IMITAM
→ FALSIFICAM
→ RECONCILIAM
→ REALIDADE/MATEMATICA DESEMPATAM
→ 1 CONCLUSÃO NORMALIZADA
→ FIXED POINT
→ OURO
→ CRISTAL SOMENTE 20/20
```

## 12. Limites

- ZERO deploy.
- ZERO VPS.
- ZERO DNS.
- ZERO secrets.
- ZERO force-push.
- ZERO merge automático enquanto DRAFT/experimento não estiver 20/20 e o SEGREDO/CHEFE não mudar a intenção aplicável.
- Nenhuma percepção promove a própria opinião a prova.
- Nenhum participante usa quantidade de respostas como consenso científico.
- Se um canal de transporte não for provado para o claim, classificar `UNKNOWN`.
- Se o estado vivo mudar durante a missão, reancorar antes de concluir.

## 13. Fio da missão

> Não medir quantos apareceram. Medir quanto sinal independente sobreviveu, quanto custou reconciliar, qual capacidade foi composta e qual claim sobreviveu à contraprova.
