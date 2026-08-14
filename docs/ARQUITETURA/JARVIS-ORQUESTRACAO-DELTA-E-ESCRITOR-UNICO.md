# JARVIS — ORQUESTRAÇÃO EM DELTA E ESCRITOR ÚNICO

> **Data:** 2026-07-30
> **Atualização:** 2026-08-08
> **Autoria da intenção:** SEGREDO/CHEFE
> **Organização técnica:** SOL
> **Tipo:** contrato arquitetural complementar
> **Status:** canônico após merge na `main`

## 1. Encaixe e precedência

Este documento não cria outro Jarvis, outra memória, outro ledger, outra Meta Lupa nem outro sistema de agentes.

Ele detalha uma regra operacional já subordinada a:

1. `LEIA-ME-IA.md`;
2. `AGENTS.md`;
3. `mapa-canonico.json`;
4. `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`;
5. regras de segurança, autorização, escopo, teste e evidência do repositório.

Em caso de conflito, vencem as fontes superiores e este contrato deve ser corrigido.

A pilha de identidade vigente é:

```text
SEGREDO/CHEFE > SOL/COORDENADOR > PIVETE/HERMES + ESPECIALISTAS
```

`SEGREDO/CHEFE` é a autoridade humana final. `PIVETE/HERMES` é o Hermes treinado e executor/guardião da continuidade. SOL é papel de coordenação e pode ser ocupado por qualquer modelo suficientemente capaz; nenhum nome comercial de modelo ganha autoridade própria.

## 2. Objetivo

Entregar ao SEGREDO/CHEFE uma experiência única:

```text
UMA CONVERSA VISÍVEL
+ UMA VOZ VISÍVEL
+ UM ESTADO COMPARTILHADO
+ UMA AUTORIDADE FINAL
+ VÁRIOS CÉREBROS ESPECIALISTAS
+ UM ÚNICO ESCRITOR POR ESCOPO E POR VEZ
= JARVIS COERENTE, RÁPIDO, PORTÁTIL E AUDITÁVEL
```

O humano não precisa transportar manualmente o histórico entre agentes nem receber respostas concorrentes para operar a missão.

A SOL é a interface/coordenadora. Os demais modelos trabalham como especialistas subordinados, com papéis delimitados e evidência devolvida ao mesmo estado.

## 3. Papéis

### SEGREDO/CHEFE

- define intenção, prioridade e limites;
- concede autorização explícita quando exigida;
- decide o que permanece, melhora, é descartado ou é publicado;
- pode intervir durante a execução sem recontar a missão;
- é a autoridade humana final.

### SOL / Jarvis

- preserva o fio da conversa;
- traduz intenção em contrato executável;
- mantém o snapshot compartilhado;
- escolhe qual especialista deve agir;
- recebe deltas, elimina repetição e consolida a resposta;
- impede que mensagens atrasadas façam a missão retroceder;
- transfere Writer quando o executor muda, preservando estado;
- apresenta resultado, risco, pendência e prova.

### Executor

- altera código ou configuração dentro do escopo autorizado;
- roda testes e produz evidência;
- não julga o próprio trabalho como prova final;
- é o único escritor ativo naquele escopo naquele instante.

### Debugger

- procura causa raiz;
- formula hipóteses falsificáveis;
- cria ou exige teste discriminativo;
- não altera o mesmo escopo enquanto o executor estiver escrevendo, salvo transferência explícita de posse.

### Revisor paralelo

- observa apenas o delta e o estado atual;
- detecta desvio de escopo, falso verde, duplicação, risco e regressão;
- envia correções curtas sem reiniciar a missão;
- não repete investigação já comprovada.

### Judge adversarial

- não confia no relato do executor;
- reabre diff, HEAD, checks, logs, testes e artefatos;
- tenta provar que o resultado está errado;
- aprova somente quando a contraprova falha e as evidências batem.

### PIVETE/Hermes

- é a mente operacional treinada e o corpo autorizado da Casa/VPS conforme o contexto;
- executa ações locais, interfaces, voz, navegador, arquivos e pontes permitidas;
- recebe contratos limitados;
- devolve receipts e telemetria;
- não assume autoridade humana final nem torna um modelo específico obrigatório.

### GitHub

- registra código, decisões, commits, PRs, checks e recuperação;
- não é usado como banco de estado vivo por commits repetitivos na `main`;
- mudança operacional passa por branch, PR, gates e HEAD validado.

## 4. Invariantes centrais

### 4.1 Uma interface, uma voz, um estado

SEGREDO/CHEFE conversa com uma identidade operacional coerente. Modelos auxiliares não criam autoridades concorrentes nem memórias pessoais paralelas.

### 4.2 Leitores paralelos, escritor único

```text
LEITURA / PESQUISA / AUDITORIA / TESTE DE HIPÓTESE
→ pode ocorrer em paralelo

ALTERAÇÃO DE ARQUIVO / COMMIT / LABEL / PR / MERGE / DEPLOY
→ somente um escritor por escopo e por vez
```

O Writer deve ser nomeado no snapshot. A exclusão mútua protege o **escopo**, não o nome do modelo.

### 4.3 Writer portátil — papel estável, instância substituível

```text
MODEL_IS_REPLACEABLE=true
WRITER_ROLE_IS_NOT_MODEL=true
ONE_WRITER_PER_SCOPE=true
CHIEF_ORDER_CAN_TRIGGER_HANDOFF=true
WRITER_UNAVAILABLE_DOES_NOT_BLOCK_MISSION=true
DETERMINISTIC_FIRST=true
AI_FALLBACK_BY_CAPABILITY=true
UNKNOWN_NEVER_PASS=true
```

Separação obrigatória:

```text
WRITER_ROLE     = função estável que possui a lane
WRITER_SCOPE    = arquivos/serviço/branch protegidos por exclusão mútua
WRITER_INSTANCE = agente/modelo/sessão que executa agora
MODEL/PROVIDER  = capacidade/telemetria, nunca autoridade
```

`Writer: GPT-*`, `Writer: Claude-*` ou equivalente pode existir como receipt histórico de qual instância trabalhou, mas não pode ser interpretado como `MODEL_LOCK` permanente.

Se o Writer atual está vivo e possui delta não entregue, outro executor permanece `READ_ONLY/JUDGE`. Se terminou, ficou offline, perdeu sessão, atingiu quota/rate-limit/timeout ou ficou indisponível, a missão não espera esse modelo voltar quando existe outra instância capaz: captura estado → preserva delta → handoff → continua.

Uma ordem atual de SEGREDO/CHEFE pode iniciar a transferência imediatamente. A autoridade humana não elimina a exclusão mútua: captura/preserva primeiro, transfere depois, e só então o novo Writer escreve.

### 4.4 Fallback por capacidade, não por identidade

Quando IA é necessária:

```text
DETERMINÍSTICO PRIMEIRO
→ definir capacidade necessária
→ selecionar modelo/provider saudável e suficiente
→ para tarefa crítica, preferir capacidade forte (GPT-5.5 quando disponível e adequado)
→ se indisponível, cair para a próxima rota configurada e capaz
→ preservar mission_id + scope + HEAD + evidência
→ 429|402|TIMEOUT|OFFLINE|UNKNOWN != PASS
```

GPT-5.5, Claude, Gemini, Codex, Grok ou qualquer outro modelo é uma implementação substituível do papel. Se nenhuma rota satisfaz o contrato, declarar `BLOCKED/UNKNOWN`; nunca inventar sucesso.

### 4.5 Delta, não repetição

Cada agente recebe apenas:

- missão atual;
- snapshot mínimo;
- alteração desde o último estado;
- ação autorizada;
- prova necessária.

Não deve receber o histórico inteiro quando o delta for suficiente.

### 4.6 Evidência nova vence contexto antigo

Uma mensagem anterior pode virar hipótese ou contexto auxiliar, mas não pode sobrescrever um estado mais recente já comprovado.

### 4.7 Mensagem atrasada não reinicia missão

Ao receber informação atrasada:

1. comparar com o estado atual;
2. extrair somente o que ainda é útil;
3. incorporar risco novo, se houver;
4. ignorar instrução já superada;
5. continuar do ponto mais avançado.

### 4.8 Nenhum agente aprova a si mesmo

Executor produz. Debugger testa. Revisor procura falha. Judge tenta derrubar. Gates determinísticos dão a palavra técnica final. SEGREDO/CHEFE decide a publicação quando aplicável.

### 4.9 Estado vivo não faz `push` automático na `main`

Snapshots periódicos, telemetria e relatórios de execução devem preferir:

- artifacts do workflow;
- job summary;
- issue deduplicada;
- armazenamento operacional apropriado.

É proibido mascarar falha com `git push || true` ou transformar estado transitório em falso verde versionado.

## 5. Snapshot compartilhado mínimo

```yaml
JARVIS_STATE:
  mission_id: "identificador estável"
  mission: "objetivo atual"
  authority: "SEGREDO/CHEFE"
  coordinator: "SOL"
  phase: "fase atual"
  scope:
    allowed: []
    denied: []
  writer:
    WRITER_ROLE: "SOL|HERMES|EXECUTOR|OUTRO_PAPEL_AUTORIZADO"
    WRITER_SCOPE: "escopo exato"
    WRITER_INSTANCE: "agente/modelo/sessão atual ou UNKNOWN"
    model: "telemetria opcional"
    provider: "telemetria opcional"
    workspace: "branch/worktree/ambiente"
    ownership_since: "timestamp"
  readers:
    - agent: "debugger"
      role: "causa raiz"
    - agent: "reviewer"
      role: "revisão de delta"
    - agent: "judge"
      role: "revisão adversarial"
  head:
    repository: "owner/repo"
    branch: "branch atual"
    sha: "SHA completo"
  authorized_action: "ação exata autorizada"
  last_proof:
    type: "teste/check/log/diff"
    reference: "ID/SHA/URL"
  pending: []
  prohibited: []
  next_gate: "próxima verificação objetiva"
  status: "RUNNING|BLOCKED|READY_FOR_REVIEW|DONE"
```

Campos desconhecidos ficam vazios ou `UNKNOWN`. Não preencher por inferência.

## 6. Protocolo de mensagens em delta

```yaml
DELTA_MESSAGE:
  mission_id: "mesma missão"
  from: "SEGREDO|SOL|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES"
  observed_state_sha: "hash ou referência do snapshot lido"
  delta_type: "FACT|RISK|CORRECTION|AUTHORIZATION|RESULT|BLOCKER|HANDOFF"
  use_if_still_relevant: true
  do_not_rewind: true
  content: "somente a informação nova"
  evidence: []
  requested_action: "ação mínima, se houver"
```

Respostas de confirmação devem ser curtas:

```text
ACK: estado mantido; nenhuma mudança necessária.
ACK: aproveitei somente o risco X; missão continua da fase Y.
ACK: instrução superada pela evidência Z; sem retrocesso.
ACK: posse de escrita transferida de A para B.
```

## 7. Ciclo operacional

```text
SEGREDO/CHEFE DEFINE
→ SOL CONGELA MISSÃO E SNAPSHOT
→ LEITORES INVESTIGAM EM PARALELO
→ UM EXECUTOR ESCREVE
→ TESTES RODAM
→ REVISOR ENVIA DELTAS
→ EXECUTOR CORRIGE SEM RECOMEÇAR
→ JUDGE TENTA DERRUBAR
→ GATES DETERMINÍSTICOS VALIDAM
→ SOL CONSOLIDA
→ SEGREDO/CHEFE APROVA QUANDO EXIGIDO
→ MERGE/DEPLOY REGISTRADO
```

Se o executor cai no meio do ciclo:

```text
CAPTURE_HEAD
→ CAPTURE_DIRTY_STATE
→ PRESERVE_UNCOMMITTED_DELTA
→ CLASSIFY_UNAVAILABLE_REASON
→ SELECT_CAPABLE_FALLBACK
→ WRITER_HANDOFF
→ CONTINUE_FROM_NEXT_GATE
```

Não reiniciar a missão só porque mudou o modelo.

## 8. Transferência de posse de escrita

Antes de outra instância escrever no mesmo escopo:

```yaml
WRITER_HANDOFF:
  mission_id: "id"
  WRITER_ROLE: "papel que continua responsável"
  WRITER_SCOPE: "escopo transferido"
  from_instance: "instância atual"
  to_instance: "nova instância"
  head_sha: "SHA congelado"
  dirty_state: false
  uncommitted_changes: []
  completed_actions: []
  pending_actions: []
  next_gate: "teste/check seguinte"
  unavailable_reason: "NONE|OFFLINE|RATE_LIMIT|BILLING|TIMEOUT|SESSION_ENDED|OTHER"
  authorization_reference: "ordem de SEGREDO/CHEFE ou regra aplicável"
```

Sem handoff válido, o segundo agente permanece somente leitura.

Handoff é **sequencial**, não paralelismo de escrita. Depois da transferência, a instância anterior não volta a escrever sem novo handoff.

## 9. Resolução de conflito

Ordem de precedência:

1. segurança e regras superiores do repositório;
2. estado atual comprovado por ferramenta;
3. última autorização explícita de SEGREDO/CHEFE;
4. snapshot compartilhado mais recente;
5. delta com evidência;
6. contexto histórico;
7. hipótese sem prova.

Dois agentes discordando não escolhem por confiança, marca do modelo ou eloquência. Devem definir o teste que separa as hipóteses.

## 10. Antipadrões proibidos

- vários agentes escrevendo no mesmo arquivo ou branch simultaneamente;
- tratar modelo específico como dono eterno de uma lane;
- deixar missão bloqueada apenas porque a instância anterior está offline quando há fallback capaz e estado transferível;
- trocar de modelo sem capturar HEAD/estado/handoff;
- cada agente criar sua própria memória da missão;
- repetir o plano inteiro a cada mensagem;
- reiniciar etapa por causa de mensagem atrasada;
- aceitar relatório do executor como revisão independente;
- criar V2/V3/V4 em vez de evoluir o encaixe canônico;
- transformar warning permanente em ruído ignorado;
- usar commit vazio para esconder falta de gatilho correto;
- fazer push direto na `main` como atalho;
- omitir erro de ferramenta para manter painel verde;
- transformar indisponibilidade de IA em PASS;
- expor segredo, caminho sensível ou credencial em logs;
- deixar agente visível competir com a voz da SOL.

## 11. Critérios de aceitação

A implementação desta arquitetura só pode ser chamada de funcional quando provar:

1. uma missão compartilhada por pelo menos dois leitores e um escritor;
2. zero conflito simultâneo de escrita;
3. handoff A → B preserva HEAD, estado e próximo gate;
4. troca de modelo não reinicia missão nem perde delta;
5. modelo indisponível usa fallback capaz ou termina `BLOCKED/UNKNOWN`, nunca falso PASS;
6. mensagem atrasada não reinicia etapa concluída;
7. delta útil é incorporado sem repetir o histórico;
8. revisor encontra uma falha real antes do commit ou merge;
9. executor corrige mantendo o mesmo fio e escopo;
10. Judge revalida HEAD, diff, testes e checks independentemente;
11. estado final contém evidência rastreável;
12. nenhum `push` direto na `main` ocorre;
13. SEGREDO/CHEFE permanece autoridade final com uma única interface operacional coerente.

## 12. Fórmula final

```text
SEGREDO/CHEFE NO VOLANTE
+ SOL COMO INTERFACE E COORDENADORA
+ PIVETE/HERMES COMO MENTE/CORPO OPERACIONAL
+ ESPECIALISTAS COMO CÉREBROS SUBORDINADOS E SUBSTITUÍVEIS
+ FALLBACK POR CAPACIDADE
+ LEITURA PARALELA
+ ESCRITOR ÚNICO POR ESCOPO E POR VEZ
+ WRITER HANDOFF SEQUENCIAL
+ COMUNICAÇÃO EM DELTA
+ JUDGE ADVERSARIAL
+ GATES DETERMINÍSTICOS
= EFICIÊNCIA SEM PERDER CONTROLE, VERDADE OU CONTINUIDADE
```

Este contrato registra a arquitetura vigente. Ele não concede autorização automática para ação destrutiva nem permite dois Writers simultâneos; ele impede que a disponibilidade ou marca de um modelo vire uma trava artificial da missão.
