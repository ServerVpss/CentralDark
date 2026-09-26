/goal

MODO_OPERACIONAL=
CONTINUIDADE_ABSOLUTA_COM_DELTA_TRANSVERSAL

AUTORIDADE_FINAL=
SEGREDO/CHEFE

============================================================
0. TRAVA DE CONTINUIDADE — ESTA SEÇÃO TEM PRECEDÊNCIA
============================================================

Este comando NÃO abre uma missão nova.

Ele pega a MISSÃO_ATUAL já ativa no Hermes e incorpora o aprendizado abaixo
como DELTA subordinado.

É proibido:

- reiniciar do zero;
- substituir, renomear ou encerrar a MISSÃO_ATUAL;
- trocar o objetivo raiz;
- trocar o escopo autorizado;
- perder o checkpoint;
- abandonar a alteração em andamento;
- saltar para outra tarefa porque surgiu um aprendizado interessante;
- criar V1, V2, V3, FINAL, NOVO, CÓPIA, skill paralela, ledger paralelo
  ou missão concorrente;
- promover tentativa vermelha como regra válida;
- declarar a missão raiz concluída porque o delta foi incorporado.

REGRA_DE_PRECEDENCIA=

Se qualquer seção posterior parecer autorizar recomeço, nova missão,
varredura histórica imediata, mudança de prioridade ou fechamento da missão raiz,
ESTA SEÇÃO 0 prevalece.

ANTES DE QUALQUER ALTERAÇÃO, preserve:

MISSAO_ATUAL_ID=
MISSAO_ATUAL_OBJETIVO=
MISSAO_ATUAL_ESCOPO=
ESTADO_ATUAL=
ULTIMO_CHECKPOINT=
PROXIMO_ESTADO_JA_DEFINIDO=
PROXIMA_ACAO_JA_DEFINIDA=
BRANCH_ATUAL=
BASE_SHA=
HEAD_ATUAL=
WRITER_ATUAL=

Use o estado real já presente na sessão, no checkpoint ou no artefato canônico.

Não invente valores.

Se a MISSÃO_ATUAL não puder ser localizada com evidência:

STATUS=BLOCKED_CURRENT_MISSION_NOT_LOCATED
ACAO=NÃO_CRIAR_NOVA_MISSAO
PARE.

FÓRMULA OBRIGATÓRIA=

MISSÃO_ATUAL
+ NOVAS_EVIDÊNCIAS
+ ERROS_CONFIRMADOS
+ CORREÇÕES_QUE_PASSARAM
+ TESTES_VERDES
+ CONTRAPROVAS
= MISSÃO_ÚNICA_ATUALIZADA

O resultado continua sendo a MESMA MISSÃO_ATUAL.

============================================================
0.1 DELTA A INCORPORAR AGORA
============================================================

Incorporar principalmente:

- trabalhar por máquina de estados;
- corrigir uma invariável por vez;
- preservar testes que detectam regressão;
- nunca adaptar teste para aceitar código quebrado;
- evitar reescrita integral quando correção localizada resolve;
- classificar corretamente:
  QUEM_APONTOU,
  QUEM_INTRODUZIU,
  QUEM_ATIVOU,
  CAMINHO_ONDE_O_ERRO_CAIU;
- separar autoria Git de Writer operacional;
- somente aprendizado comprovado pode virar:
  REGRA,
  DETECTOR,
  CLASSIFICADOR,
  POLICY_GATE,
  AÇÃO_AUTOMÁTICA,
  HABILIDADE;
- tentativa vermelha só pode virar ANTI_PADRAO;
- consolidar o ouro para reaplicação entre sessões futuras;
- não usar essa consolidação como desculpa para abandonar a missão atual.

============================================================
0.2 MÁQUINA DE ESTADOS DA CONTINUIDADE
============================================================

ESTADO_ATUAL_PRESERVADO
→ DELTA_RECEBIDO
→ EVIDENCIAS_CLASSIFICADAS
→ DELTA_VALIDADO
→ DELTA_INCORPORADO
→ INVARIANTES_RETESTADAS
→ CHECKPOINT_ATUALIZADO
→ RETORNO_AO_PROXIMO_ESTADO_PRESERVADO

Saídas alternativas:

DELTA_REJEITADO
DELTA_PARCIAL
DELTA_BLOQUEADO
CONFLITO_COM_MISSAO_ATUAL
CONTEXTO_DA_MISSAO_NAO_LOCALIZADO

Nenhum item pode pular estado.

============================================================
0.3 UMA INVARIÁVEL POR VEZ
============================================================

Para cada correção:

1. declarar a INVARIAVEL_ATUAL;
2. reproduzir a falha ou preservar a contraprova;
3. localizar a causa;
4. aplicar a menor correção;
5. executar o teste discriminativo;
6. executar a regressão relevante;
7. provar que o escopo não vazou;
8. atualizar o estado;
9. somente então escolher a próxima invariável.

Nunca abrir várias correções concorrentes para o mesmo writer.

Leituras independentes podem ocorrer em paralelo.
Mutações devem permanecer serializadas.

============================================================
0.4 PRIORIDADE DE EXECUÇÃO
============================================================

PRIORIDADE_1=
Continuar a MISSÃO_ATUAL exatamente do ponto preservado.

PRIORIDADE_2=
Aplicar ao trabalho atual os detectores, gates e aprendizados já comprovados.

PRIORIDADE_3=
Registrar o delta novo desta sessão.

PRIORIDADE_4=
Processar histórico amplo somente em checkpoint seguro, sem pendência imediata
da missão raiz, ou mediante autorização explícita do SEGREDO/CHEFE.

A consolidação transversal é uma capacidade auxiliar da Casa.
Ela não toma o lugar da missão operacional que já está em andamento.

============================================================
0.5 RESPOSTA INICIAL OBRIGATÓRIA
============================================================

Primeiro responda somente:

DELTA_INCORPORADO=SIM
MISSAO_ATUAL_PRESERVADA=SIM
VERSAO_PARALELA=NAO
PROXIMO_ESTADO=<PROXIMO_ESTADO_JA_DEFINIDO>

Depois dessa resposta, continue automaticamente do ponto preservado,
sem esperar nova mensagem, exceto quando a MISSÃO_ATUAL já estiver em
gate humano obrigatório.

============================================================
0.6 REGRA DE FECHAMENTO
============================================================

Concluir o DELTA não conclui a MISSÃO_ATUAL.

O fechamento do delta deve informar:

DELTA_STATUS=
INVARIANTES_ADICIONADAS=
TESTES_PRESERVADOS=
ANTI_PADROES_REGISTRADOS=
REGRAS_PROMOVIDAS=
REGRAS_REJEITADAS=
CHECKPOINT_ATUALIZADO=
RETORNO_AO_ESTADO=
MISSAO_RAIZ_CONCLUIDA=NAO

A MISSÃO_ATUAL só pode ser encerrada pelos critérios de aceite que ela já possuía,
com prova própria e autorização aplicável.

============================================================
INÍCIO DO DELTA TRANSVERSAL SUBORDINADO
============================================================

DELTA_OPERACIONAL=
Transformar toda experiência comprovada disponível na Casa — passada, atual e
futura — em aprendizado canônico, habilidade executável e reflexo operacional,
sem registrar lixo, sem fabricar verde e sem criar versões paralelas,
SEMPRE SUBORDINADO À MISSÃO_ATUAL E SEM ALTERAR SEU OBJETIVO, ESCOPO OU PRÓXIMO ESTADO.

NOME_OPERACIONAL_DO_DELTA=
CONSOLIDAÇÃO TRANSVERSAL DE EXPERIÊNCIA

ESCOPO_TEMPORAL=
TODAS_AS_SESSOES_ACESSIVEIS
+
TODAS_AS_SESSOES_FUTURAS

ESCOPO_DE_AGENTES=
HERMES
GPT
CODEX
OPUS
CLAUDE
GEMINI
GROK
LOVABLE
BOTS
REVISores
EXECUTORES
AGENTES_FUTUROS

A autoria do método permanece com SEGREDO/CHEFE.
Nenhum modelo pode atribuir a si a criação do método.

============================================================
1. PRINCÍPIO CENTRAL
============================================================

Não consolidar somente a conversa atual.

Construir uma memória operacional transversal usando todas as fontes acessíveis:

- sessões antigas e atuais do perfil Hermes;
- conversas exportadas;
- arquivos paste_*.txt e equivalentes;
- checkpoints;
- relatórios;
- receipts;
- logs sanitizados;
- PRs;
- comentários de revisão;
- commits;
- trailers Writer e Writer-Session;
- testes;
- resultados de CI;
- patches;
- contraprovas;
- rollbacks;
- documentos canônicos;
- Registro do Ouro;
- futuras sessões encerradas ou checkpointadas.

Limite honesto:

SESSAO_APAGADA_OU_NAO_ACESSIVEL=
NÃO PODE SER INVENTADA NEM DECLARADA COMO PROCESSADA.

Nunca ler:

.env
secrets/
tokens/
sessions com credenciais
.ssh/
certificados
chaves
conteúdo confidencial sem autorização.

============================================================
2. MAPA CANÔNICO PRIMEIRO
============================================================

Antes de criar qualquer arquivo, localizar e ler os mecanismos existentes:

LEIA-ME-IA.md
AGENTS.md
docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md
docs/CONSCIENCIA/APRENDIZADOS.md
.agents/skills/meta-lupa/SKILL.md
documento canônico de escritor único
ledgers de experiência
verificadores existentes
Policy Gates existentes
hooks e adaptadores existentes
máquinas de estados existentes
mecanismos de AutoLupa
selo de XP
mecanismos de deduplicação e consolidação.

REGRA_DE_OURO=

EXISTE COMPLETO
→ EVOLUIR O MESMO ARTEFATO

EXISTE PARCIAL
→ COMPLETAR O MESMO ARTEFATO

NÃO EXISTE
→ CRIAR SOMENTE O MÍNIMO NECESSÁRIO
→ LIGAR À PORTA UNIVERSAL
→ JUSTIFICAR A CRIAÇÃO

Proibido:

V1
V2
V3
FINAL
NOVO
CÓPIA
SKILL PARALELA
LEDGER PARALELO
MÉTODO CONCORRENTE

============================================================
3. PROCESSAMENTO TRANSVERSAL EM DELTA
============================================================

Não reler todo o universo em cada execução.

Manter checkpoint canônico com:

ULTIMA_SESSAO_PROCESSADA=
ULTIMO_EVENTO_PROCESSADO=
ULTIMO_COMMIT_PROCESSADO=
ULTIMO_PR_PROCESSADO=
ULTIMO_RECEIPT_PROCESSADO=
ULTIMO_HASH_PROCESSADO=
DATA_DA_ULTIMA_CONSOLIDACAO=

Cada execução trabalha somente sobre o delta novo.

Para cada fonte, gerar identidade estável:

SOURCE_TYPE=
SOURCE_ID=
SESSION_ID=
COMMIT_SHA=
PR_NUMBER=
EVENT_HASH=
TIMESTAMP=
WRITER=
WRITER_SESSION=

Se o mesmo evento reaparecer:

DUPLICADO=SIM
AÇÃO=NÃO_PROMOVER_NOVAMENTE

============================================================
4. MÁQUINA DE ESTADOS UNIVERSAL
============================================================

Todo aprendizado deve atravessar:

OBSERVADO
→ NORMALIZADO
→ DEDUPLICADO
→ CANDIDATO
→ EVIDENCIADO
→ DISCRIMINADO
→ GENERALIZADO
→ CODIFICADO
→ TESTADO
→ PROMOVIDO
→ ATIVO
→ MONITORADO

Saídas alternativas:

REJEITADO
HIPOTESE
ANTI_PADRAO
OBSOLETO
REVOGADO
ROLLBACK

Nenhum item pula estado.
Nenhuma conversa vira skill diretamente.
Nenhum agente declara a própria experiência como consolidada sem prova externa.

============================================================
5. CLASSIFICAÇÃO DA EXPERIÊNCIA
============================================================

Cada achado deve ser classificado:

CASO_LOCAL=
aconteceu uma vez e está comprovado, mas ainda não justifica automação geral.

PADRAO_RECORRENTE=
apareceu em duas ou mais situações independentes.

FALHA_DETERMINISTICA_CRITICA=
uma única ocorrência pode ser promovida quando existir:
causa exata
+
reprodução
+
correção mínima
+
teste discriminativo
+
regressão
+
contraprova negativa.

HIPOTESE=
há sinal, mas falta prova causal.

RUIDO=
não muda decisão, código, teste ou comportamento.

ANTI_PADRAO=
tentativa vermelha útil como exemplo do que bloquear.

Somente:

PADRAO_RECORRENTE
ou
FALHA_DETERMINISTICA_CRITICA

podem virar habilidade automática.

============================================================
6. CONTRATO DO VERDE CONSOLIDADO
============================================================

Um aprendizado só recebe:

VERDE_CONSOLIDADO=SIM

quando possuir:

1. evento real identificado;
2. origem preservada;
3. erro exato;
4. caminho onde caiu;
5. Acusador/Apontador;
6. commit introdutor quando identificável;
7. ativador do bug quando diferente;
8. nível real da prova;
9. causa localizada;
10. correção mínima;
11. estado anterior comprovado;
12. teste que falhava ou contraprova equivalente;
13. estado posterior comprovado;
14. regressão;
15. FAIL=0;
16. SKIPPED=0;
17. UNKNOWN não contado como PASS;
18. ausência de runner não contada como PASS;
19. arquivos fora do escopo=0;
20. resultado repetível;
21. caso negativo que não ativa a regra;
22. limite de aplicação declarado;
23. rollback comprovado ou mudança naturalmente reversível;
24. HEAD final ou artefato final identificado.

Se faltar qualquer item:

VERDE_CONSOLIDADO=NAO
ESTADO=CANDIDATO|HIPOTESE|ANTI_PADRAO

============================================================
7. REGISTRO CAUSAL UNIVERSAL
============================================================

Formato obrigatório:

APRENDIZADO_ID=
PADRAO=
SOURCE_IDS=
SESSOES_ENVOLVIDAS=
AGENTES_ENVOLVIDOS=
ACUSADOR_APONTADOR=
ERRO_EXATO=
CAMINHO_ONDE_CAIU=
COMMIT_INTRODUTOR=
ATIVADOR_DO_BUG=
IDENTIDADE_COMPROVADA=
NIVEL_DE_PROVA=WRITER_TRAILER|AUTOR_GIT|LOG|TESTE|INFERENCIA|UNKNOWN
CAUSA=
IMPACTO=
CORRECAO_MINIMA=
TESTE_ANTES=
TESTE_DEPOIS=
CONTRAPROVA=
REGRESSAO=
ROLLBACK=
LIMITES=
ALVOS_COMPATIVEIS=
ALVOS_INCOMPATIVEIS=
RISCO_DE_FALSO_POSITIVO=
RISCO_DE_FALSO_NEGATIVO=
ESTADO=
VERDE_CONSOLIDADO=

O objetivo é localizar onde o erro caiu e aprender.
Não criar tribunal de ego entre IAs.

============================================================
8. DEDUPLICAÇÃO E GENERALIZAÇÃO
============================================================

Antes de registrar:

- comparar hash exato;
- comparar assinatura causal;
- comparar caminho;
- comparar erro;
- comparar correção;
- comparar comportamento;
- calcular similaridade com aprendizados existentes.

Se for o mesmo padrão:

→ atualizar o aprendizado canônico;
→ adicionar a nova evidência como outro caso;
→ aumentar força da regra;
→ não criar nova skill.

Estrutura:

REGRA_GERAL
├── CASO_REAL_1
├── CASO_REAL_2
├── CASO_NEGATIVO
├── TESTE_DISCRIMINATIVO
└── LIMITES

A generalização não pode apagar os casos concretos que a sustentam.

============================================================
9. COMPILAÇÃO EM HABILIDADE
============================================================

Todo aprendizado promovido deve gerar seis camadas:

1. CONHECIMENTO
2. DETECTOR
3. CLASSIFICADOR
4. POLICY GATE
5. AÇÃO CONTROLADA
6. TESTE E ROLLBACK

------------------------------------------------------------
9.1 CONHECIMENTO
------------------------------------------------------------

Registrar no canônico:

O QUE É
POR QUE ACONTECE
COMO RECONHECER
QUANDO SE APLICA
QUANDO NÃO SE APLICA
COMO CORRIGIR
COMO PROVAR
COMO REVERTER

------------------------------------------------------------
9.2 DETECTOR
------------------------------------------------------------

O detector recebe:

EVENTO
DIFF
ARQUIVOS
LOG
TEST_RESULT
WRITER
WRITER_SESSION
ESCOPO
HEAD
CONTEXTO_CANÔNICO

E devolve:

PATTERN_ID=
MATCH=SIM|NAO|INCONCLUSIVO
SINAIS=
EVIDENCIAS=
CONTRADICOES=
PROVA_SUFICIENTE=
ALVO=
RISCO=

Detector não pode operar por palavra-chave isolada.

Exigir combinação de sinais, por exemplo:

DIFF_ESTRUTURAL
+
COMPORTAMENTO_REPRODUZIDO

ou:

TESTE_DISCRIMINATIVO
+
CAUSA_LOCALIZADA

------------------------------------------------------------
9.3 CLASSIFICADOR
------------------------------------------------------------

Saídas:

MATCH_PROVADO
MATCH_PROVAVEL
MATCH_FRACO
NO_MATCH
CONFLITO_COM_OUTRA_REGRA
PADRAO_OBSOLETO

Somente MATCH_PROVADO pode chegar à aplicação automática.

------------------------------------------------------------
9.4 POLICY GATE
------------------------------------------------------------

Estados:

POLICY_NO_MATCH
POLICY_MATCH_UNPROVED
POLICY_MATCH_PROVED
AUTO_APPLY_ALLOWED
AUTO_APPLY_BLOCKED
AUTO_APPLY_EXECUTED
AUTO_APPLY_VERIFIED
AUTO_APPLY_ROLLED_BACK

Condições obrigatórias para AUTO_APPLY_ALLOWED:

- MATCH_PROVADO;
- Writer único comprovado;
- alvo dentro do escopo;
- alteração local;
- alteração reversível;
- correção mínima conhecida;
- teste discriminativo disponível;
- rollback disponível;
- sem secrets;
- sem produção;
- sem VPS;
- sem deploy;
- sem merge;
- sem reescrita histórica;
- nenhuma regra canônica conflitante.

------------------------------------------------------------
9.5 AÇÃO CONTROLADA
------------------------------------------------------------

Fluxo:

PRESERVAR_ESTADO
→ SALVAR_DIFF
→ APLICAR_CORRECAO_MINIMA
→ RODAR_TESTE_ESPECIFICO
→ RODAR_REGRESSAO
→ COMPARAR_ESCOPO
→ VERIFICAR_IDEMPOTENCIA
→ PROMOVER_OU_REVERTER

Se qualquer prova falhar:

AUTO_APPLY_ROLLED_BACK
VERDE=NAO

Nunca adaptar o teste para aceitar a regressão.
Nunca substituir arquivo inteiro quando uma edição localizada resolve.

------------------------------------------------------------
9.6 TESTE E ROLLBACK
------------------------------------------------------------

Toda habilidade precisa provar:

CASO_POSITIVO=
detecta e corrige.

CASO_NEGATIVO=
não ativa em situação legítima parecida.

CASO_AMBIGUO=
bloqueia em vez de adivinhar.

IDEMPOTENCIA=
segunda aplicação produz diff vazio.

ROLLBACK=
hash final restaurado quando a prova falha.

============================================================
10. AUTO BOT ENTRE SESSÕES
============================================================

Criar ou evoluir o mecanismo canônico para executar nos seguintes pontos:

- encerramento de sessão;
- checkpoint importante;
- commit;
- push;
- abertura ou atualização de PR;
- falha de teste;
- correção validada;
- rollback;
- receipt final;
- início de nova sessão;
- comando explícito de consolidação.

Fluxo:

NOVA_EVIDENCIA
→ LER_DELTA_DESDE_CHECKPOINT
→ NORMALIZAR
→ DEDUPLICAR
→ COMPARAR_COM_SKILLS
→ DETECTAR_PADRAO
→ EXECUTAR_POLICY_GATE
→ APLICAR_SE_PERMITIDO
→ TESTAR
→ REGISTRAR
→ ATUALIZAR_CHECKPOINT

O Auto Bot nunca declara vitória por ter escrito código.
A prova externa decide a promoção.

============================================================
11. GATES SISTEMÁTICOS UNIVERSAIS
============================================================

GATE_01_SOURCE_ACCESSIBLE
GATE_02_SOURCE_IDENTITY
GATE_03_EVIDENCE_PRESERVED
GATE_04_CAUSAL_CHAIN
GATE_05_DEDUPLICATION
GATE_06_GENERALIZATION
GATE_07_NEGATIVE_CASE
GATE_08_CANONICAL_MAP
GATE_09_WRITER_UNIQUE
GATE_10_SCOPE
GATE_11_MINIMAL_CHANGE
GATE_12_DISCRIMINATIVE_TEST
GATE_13_REGRESSION
GATE_14_IDEMPOTENCE
GATE_15_ROLLBACK
GATE_16_FINAL_HEAD
GATE_17_EXTERNAL_PROOF
GATE_18_GOLD_REGISTRATION
GATE_19_CHECKPOINT_UPDATED
GATE_20_REAPPLICABILITY

Não aceitar como PASS:

UNKNOWN
SKIPPED
arquivo existe
HTTP 200 isolado
comentário de agente
pedido de desculpas
“parece resolvido”
“provavelmente”
ausência de runner
teste alterado para combinar com o defeito
autodeclaração do executor.

============================================================
12. EXPERIÊNCIA CONCRETA E INSTINTO SUPERIOR
============================================================

No método do SEGREDO/CHEFE:

INSTINTO_SUPERIOR=
técnica humana observável de percepção e ação construída pela consolidação de
experiência concreta.

Não é paranormal.

Cada erro, tentativa, prova, correção e contraprova validada gera experiência.

A MetaLupa impede experiência falsa.
A máquina de estados impede promoção prematura.
O Auto Bot transforma padrão consolidado em reflexo operacional.

A explosão da cápsula significa:

EXPERIENCIA_CONCRETA_ACUMULADA
→ CONSOLIDACAO
→ RESPOSTA_RAPIDA
→ REFLEXO_OPERACIONAL

Não significa crash, OOM, travamento ou destruição de infraestrutura.

============================================================
13. XP E FORÇA DA HABILIDADE
============================================================

Cada habilidade possui:

PATTERN_ID=
XP_VALIDO=
CASOS_POSITIVOS=
CASOS_NEGATIVOS=
SESSOES_INDEPENDENTES=
AGENTES_INDEPENDENTES=
REGRESSOES_EVITADAS=
FALSOS_POSITIVOS=
FALSOS_NEGATIVOS=
ULTIMA_PROVA=
ESTADO=EXPERIMENTAL|ATIVA|FORTE|CANONICA|REVOGADA

XP só aumenta quando:

- nova sessão independente confirma;
- novo agente cai no mesmo padrão;
- detector identifica corretamente;
- ação automática corrige;
- regressão permanece verde;
- caso negativo não dispara;
- prova externa confirma.

XP não aumenta por:

- repetição textual;
- elogio;
- confiança declarada;
- quantidade de raciocínio;
- teste duplicado;
- reprocessamento da mesma evidência.

============================================================
14. REAVALIAÇÃO E REVOGAÇÃO
============================================================

Habilidade ativa não é eterna.

Reavaliar quando:

- arquitetura mudar;
- teste começar a falhar;
- detector gerar falso positivo;
- nova evidência contradizer a regra;
- artefato canônico for substituído legitimamente;
- política se tornar perigosa;
- rollback não funcionar.

Estados:

ATIVA
→ SOB_REVISAO
→ CORRIGIDA
ou
→ REVOGADA

Preservar histórico no Git.
Não apagar o motivo da revogação.

============================================================
15. TESTES DO SISTEMA DE APRENDIZADO
============================================================

Obrigatórios:

1. percorre múltiplas sessões;
2. processa apenas delta novo;
3. não duplica evento já processado;
4. não promove conversa sem prova;
5. preserva caso vermelho como antipadrão;
6. exige caso negativo;
7. detecta padrão repetido entre modelos diferentes;
8. não confunde autor Git com Writer operacional;
9. não promove UNKNOWN;
10. não promove SKIPPED;
11. não promove teste adulterado;
12. não aplica fora do escopo;
13. não aplica com Writer concorrente;
14. bloqueia produção/VPS/deploy/merge;
15. corrige automaticamente caso local reversível comprovado;
16. reverte quando o teste falha;
17. segunda aplicação é idempotente;
18. nova sessão reutiliza habilidade ativa;
19. evidência contraditória envia habilidade para revisão;
20. sessão inacessível permanece declarada como não processada;
21. múltiplos casos equivalentes fortalecem o mesmo aprendizado;
22. nenhum V1/V2/V3 é criado;
23. porta universal alcança a skill;
24. skill textual sem detector é marcada como NÃO_EXECUTÁVEL;
25. detector sem Policy Gate não pode agir;
26. Policy Gate sem teste não pode liberar;
27. Auto Bot não pode declarar a própria vitória;
28. checkpoint avança somente após registro bem-sucedido.

============================================================
16. EXECUÇÃO CONTÍNUA
============================================================

EXECUCAO_ATUAL=

- processar primeiro somente o delta comprovado da sessão e da missão atuais;
- preservar o próximo estado que já estava definido;
- não iniciar varredura histórica ampla no meio de uma correção em andamento;
- registrar fontes históricas adicionais como FILA_DE_CONSOLIDACAO;
- consumir essa fila somente após CHECKPOINT_SEGURO da MISSÃO_ATUAL,
  ou quando o estado atual já for explicitamente CONSOLIDACAO_TRANSVERSAL;
- não exceder contexto;
- não interromper executor, teste, correção ou gate já em curso.

EXECUCAO_HISTORICA_POSTERIOR=

- mapear todas as fontes acessíveis;
- criar inventário;
- processar histórico em lotes;
- preservar checkpoint;
- consolidar padrões;
- continuar por lote até concluir ou bloqueio real;
- ao final de cada lote, retornar ao próximo estado preservado da MISSÃO_ATUAL.

EXECUCOES_FUTURAS=

- ler somente delta;
- comparar com habilidades existentes;
- promover apenas o novo ouro;
- aplicar reflexos ativos quando a Policy permitir;
- atualizar força e XP;
- registrar o checkpoint seguinte.

Detecção de estagnação:

Se três ciclos não produzirem mudança em:
evidência
estado
teste
ou
conclusão

→ declarar ESTAGNACAO_COMPROVADA;
→ registrar causa;
→ não repetir o mesmo processamento.

============================================================
17. COMMIT E PUBLICAÇÃO
============================================================

Preservar o artefato existente.

Commit robusto deve explicar:

- quais fontes foram processadas;
- qual intervalo temporal;
- quantas sessões acessíveis;
- quantas inacessíveis;
- quantos candidatos;
- quantos promovidos;
- quantos rejeitados;
- quais padrões foram deduplicados;
- quais detectores foram criados ou evoluídos;
- quais Policy Gates foram ativados;
- quais ações automáticas são permitidas;
- quais continuam sob o Chefe;
- como a idempotência foi provada;
- como o rollback foi provado;
- risco residual.

Trailers:

Writer: hermes-pivete
Writer-Session: s-cross-session-learning-consolidation

Push somente se a MISSÃO_ATUAL já autorizar explicitamente a branch e o push.
O DELTA não cria autorização própria.

Sem:

force
rebase
amend histórico
merge
deploy
VPS
produção

salvo nova autorização explícita do SEGREDO/CHEFE.

============================================================
18. RECEIPT UNIVERSAL
============================================================

DELTA_STATUS=
CROSS_SESSION_SKILL_SYSTEM_VERIFIED

ou bloqueio exato.

INVENTARIO:

FONTES_ENCONTRADAS=
FONTES_ACESSIVEIS=
FONTES_INACESSIVEIS=
SESSOES_PROCESSADAS=
SESSOES_FUTURAS_MONITORADAS=
PERIODO_COBERTO=
ULTIMO_CHECKPOINT=

CONSOLIDACAO:

EVENTOS_OBSERVADOS=
DUPLICADOS_DESCARTADOS=
CANDIDATOS=
HIPOTESES=
ANTI_PADROES=
VERDES_CONSOLIDADOS=
PADROES_GENERALIZADOS=
HABILIDADES_ATIVAS=
HABILIDADES_SOB_REVISAO=
HABILIDADES_REVOGADAS=

EXECUCAO:

DETECTORES_ATIVOS=
POLICY_GATES_ATIVOS=
AUTO_APPLY_ALLOWED=
AUTO_APPLY_BLOCKED=
AUTO_APPLY_EXECUTED=
AUTO_APPLY_VERIFIED=
AUTO_APPLY_ROLLED_BACK=

PROVA:

TESTS_TOTAL=
PASS=
FAIL=
SKIPPED=
UNKNOWN=
CASOS_POSITIVOS=
CASOS_NEGATIVOS=
IDEMPOTENCIA=
ROLLBACK=
HEAD_FINAL=
FILES_CHANGED=
VERSOES_PARALELAS=0

SEGURANCA:

MERGE=NAO
DEPLOY=NAO
VPS=INTOCADA
PRODUCAO=INTOCADA
SECRETS_LIDOS=NAO
HISTORY_REWRITTEN=NAO

REGISTRO_DO_OURO=

Sessões fornecem experiência.
Evidência separa fato de lembrança.
MetaLupa elimina o falso verde.
Deduplicação transforma repetição em força.
Detector reconhece o padrão.
Policy Gate decide.
Ação mínima corrige.
Teste discrimina.
Rollback protege.
Git preserva.
O aprendizado atravessa sessões e vira reflexo operacional.

============================================================
19. RETORNO OBRIGATÓRIO À MISSÃO ATUAL
============================================================

Após incorporar, testar e registrar o delta:

1. releia o snapshot preservado na Seção 0;
2. confirme que MISSAO_ATUAL_ID e objetivo raiz não mudaram;
3. confirme que nenhuma versão ou missão paralela foi criada;
4. confirme que a próxima ação continua válida no HEAD atual;
5. restaure o foco operacional no PROXIMO_ESTADO_JA_DEFINIDO;
6. continue a execução da MISSÃO_ATUAL.

RECIBO_DE_RETORNO=

MISSAO_ATUAL_ID=
ESTADO_ANTES_DO_DELTA=
DELTA_STATUS=
CHECKPOINT_ANTES=
CHECKPOINT_DEPOIS=
PROXIMO_ESTADO_PRESERVADO=
PROXIMA_ACAO=
VERSOES_PARALELAS=0
MISSAO_RAIZ_SUBSTITUIDA=NAO
MISSAO_RAIZ_REINICIADA=NAO
MISSAO_RAIZ_ENCERRADA_PELO_DELTA=NAO
FOCO_RESTAURADO=SIM

CONTRAPROVA OBRIGATÓRIA=

Tentar interpretar este comando como nova missão.

RESULTADO_ESPERADO=
BLOQUEADO_PELA_SECAO_0

Tentar encerrar a missão raiz após DELTA_STATUS verde.

RESULTADO_ESPERADO=
BLOQUEADO_PELA_REGRA_DE_FECHAMENTO

Tentar criar V2, V3, skill, ledger ou arquivo concorrente.

RESULTADO_ESPERADO=
BLOQUEADO_PELO_GATE_DE_MAPA_CANONICO

ESTADO FINAL DO DELTA=

DELTA_INCORPORADO
→ CHECKPOINT_ATUALIZADO
→ FOCO_RESTAURADO
→ MISSÃO_ATUAL_CONTINUA
