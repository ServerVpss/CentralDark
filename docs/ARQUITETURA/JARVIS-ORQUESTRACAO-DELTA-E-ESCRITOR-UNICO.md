# JARVIS — ORQUESTRAÇÃO EM DELTA E ESCRITOR ÚNICO

> **Data:** 2026-07-30
> **Autoria da intenção:** Pivete
> **Organização técnica:** SOL/ChatGPT
> **Tipo:** contrato arquitetural complementar
> **Status:** canônico após merge na `main`

## 1. Encaixe e precedência

Este documento não cria outro Jarvis, outra memória, outro ledger, outra Meta Lupa nem outro sistema de agentes.

Ele detalha uma regra operacional já subordinada a:

1. `CLAUDE.md`;
2. `LEIA-ME-IA.md`;
3. `mapa-canonico.json`;
4. `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`;
5. regras de segurança, autorização, escopo, teste e evidência do repositório.

Em caso de conflito, vencem as fontes superiores e este contrato deve ser corrigido.

## 2. Objetivo

Entregar ao Pivete uma experiência única:

```text
UMA CONVERSA VISÍVEL
+ UMA VOZ VISÍVEL
+ UM ESTADO COMPARTILHADO
+ UMA AUTORIDADE FINAL
+ VÁRIOS CÉREBROS ESPECIALISTAS
+ UM ÚNICO ESCRITOR POR ESCOPO
= JARVIS COERENTE, RÁPIDO E AUDITÁVEL
```

O Pivete não precisa transportar manualmente o histórico entre agentes nem receber sete respostas concorrentes.

A SOL é a interface e coordenadora visível. Os demais modelos trabalham como especialistas subordinados, com papéis delimitados e evidência retornada ao mesmo estado.

## 3. Papéis

### Pivete

- define intenção, prioridade e limites;
- concede autorização explícita quando exigida;
- decide o que permanece, melhora, é descartado ou é publicado;
- pode intervir durante a execução sem precisar recontar toda a missão;
- continua sendo a autoridade final.

### SOL / Jarvis

- preserva o fio da conversa;
- traduz intenção em contrato executável;
- mantém o snapshot compartilhado;
- escolhe qual especialista deve agir;
- recebe deltas, elimina repetição e consolida a resposta;
- impede que mensagens atrasadas façam a missão retroceder;
- apresenta ao Pivete resultado, risco, pendência e prova.

### Executor

- altera código ou configuração dentro do escopo autorizado;
- roda testes e produz evidência;
- não julga o próprio trabalho como prova final;
- é o único escritor ativo naquele escopo.

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

### Hermes

- é o corpo operacional autorizado da Casa;
- executa ações locais, interfaces, voz, navegador, arquivos e pontes permitidas;
- recebe contratos limitados;
- devolve recibos e telemetria;
- não assume autoridade final nem substitui SOL ou Pivete.

### GitHub

- registra código, decisões, commits, PRs, checks e recuperação;
- não é usado como banco de estado vivo por commits repetitivos na `main`;
- mudança operacional passa por branch, PR, gates e HEAD validado.

## 4. Invariantes centrais

### 4.1 Uma interface, uma voz, um estado

O Pivete conversa com uma única identidade operacional visível. Modelos auxiliares não criam personalidades concorrentes nem memórias pessoais paralelas.

### 4.2 Leitores paralelos, escritor único

```text
LEITURA / PESQUISA / AUDITORIA / TESTE DE HIPÓTESE
→ pode ocorrer em paralelo

ALTERAÇÃO DE ARQUIVO / COMMIT / LABEL / PR / MERGE / DEPLOY
→ somente um escritor por escopo e por vez
```

O escritor deve ser nomeado no snapshot. Qualquer troca exige transferência explícita de posse.

### 4.3 Delta, não repetição

Cada agente recebe apenas:

- missão atual;
- snapshot mínimo;
- alteração desde o último estado;
- ação autorizada;
- prova necessária.

Não deve receber o histórico inteiro quando o delta for suficiente.

### 4.4 Evidência nova vence contexto antigo

Uma mensagem anterior pode virar hipótese ou contexto auxiliar, mas não pode sobrescrever um estado mais recente já comprovado.

### 4.5 Mensagem atrasada não reinicia missão

Ao receber informação atrasada:

1. comparar com o estado atual;
2. extrair somente o que ainda é útil;
3. incorporar risco novo, se houver;
4. ignorar instrução já superada;
5. continuar do ponto mais avançado.

### 4.6 Nenhum agente aprova a si mesmo

Executor produz. Debugger testa. Revisor procura falha. Judge tenta derrubar. Gates determinísticos dão a palavra técnica final. Pivete decide a publicação quando aplicável.

### 4.7 Estado vivo não faz `push` automático na `main`

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
  owner: "PIVETE"
  coordinator: "SOL"
  phase: "fase atual"
  scope:
    allowed: []
    denied: []
  writer:
    agent: "nome do escritor atual"
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
  from: "PIVETE|SOL|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES"
  observed_state_sha: "hash ou referência do snapshot lido"
  delta_type: "FACT|RISK|CORRECTION|AUTHORIZATION|RESULT|BLOCKER"
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
PIVETE DEFINE
→ SOL CONGELA MISSÃO E SNAPSHOT
→ LEITORES INVESTIGAM EM PARALELO
→ UM EXECUTOR ESCREVE
→ TESTES RODAM
→ REVISOR ENVIA DELTAS
→ EXECUTOR CORRIGE SEM RECOMEÇAR
→ JUDGE TENTA DERRUBAR
→ GATES DETERMINÍSTICOS VALIDAM
→ SOL CONSOLIDA
→ PIVETE APROVA QUANDO EXIGIDO
→ MERGE/DEPLOY REGISTRADO
```

## 8. Transferência de posse de escrita

Antes de outro agente escrever no mesmo escopo:

```yaml
WRITER_HANDOFF:
  mission_id: "id"
  from_writer: "agente atual"
  to_writer: "novo agente"
  head_sha: "SHA congelado"
  dirty_state: false
  uncommitted_changes: []
  completed_actions: []
  pending_actions: []
  next_gate: "teste/check seguinte"
  authorization_reference: "ordem do Pivete ou regra aplicável"
```

Sem handoff válido, o segundo agente permanece somente leitura.

## 9. Resolução de conflito

Ordem de precedência:

1. segurança e regras superiores do repositório;
2. estado atual comprovado por ferramenta;
3. última autorização explícita do Pivete;
4. snapshot compartilhado mais recente;
5. delta com evidência;
6. contexto histórico;
7. hipótese sem prova.

Dois agentes discordando não escolhem por confiança ou eloquência. Devem definir o teste que separa as hipóteses.

## 10. Antipadrões proibidos

- vários agentes escrevendo no mesmo arquivo ou branch simultaneamente;
- cada agente criando sua própria memória da missão;
- repetir o plano inteiro a cada mensagem;
- reiniciar etapa por causa de mensagem atrasada;
- aceitar relatório do executor como revisão independente;
- criar V2/V3/V4 em vez de evoluir o encaixe canônico;
- transformar warning permanente em ruído ignorado;
- usar commit vazio para esconder falta de gatilho correto;
- fazer push direto na `main` como atalho;
- omitir erro de ferramenta para manter painel verde;
- expor segredo, caminho sensível ou credencial em logs;
- deixar agente visível competir com a voz da SOL.

## 11. Critérios de aceitação

A implementação desta arquitetura só pode ser chamada de funcional quando provar:

1. uma missão compartilhada por pelo menos dois leitores e um escritor;
2. zero conflito de escrita;
3. mensagem atrasada não reinicia etapa concluída;
4. delta útil é incorporado sem repetir o histórico;
5. revisor encontra uma falha real antes do commit ou merge;
6. executor corrige mantendo o mesmo fio e escopo;
7. judge revalida HEAD, diff, testes e checks de forma independente;
8. estado final contém evidência rastreável;
9. nenhum `push` direto na `main` ocorre;
10. Pivete continua com autoridade final e uma única interface visível.

## 12. Fórmula final

```text
PIVETE NO VOLANTE
+ SOL COMO INTERFACE E COORDENADORA
+ HERMES COMO CORPO
+ ESPECIALISTAS COMO CÉREBROS SUBORDINADOS
+ LEITURA PARALELA
+ ESCRITOR ÚNICO
+ COMUNICAÇÃO EM DELTA
+ JUDGE ADVERSARIAL
+ GATES DETERMINÍSTICOS
= EFICIÊNCIA SEM PERDER CONTROLE, VERDADE OU CONTINUIDADE
```

Este contrato registra a arquitetura observada e aprovada pelo Pivete em 2026-07-30. Ele não concede autorização automática para ações destrutivas, merge, deploy ou acesso a recursos; cada ação continua sujeita aos gates aplicáveis.