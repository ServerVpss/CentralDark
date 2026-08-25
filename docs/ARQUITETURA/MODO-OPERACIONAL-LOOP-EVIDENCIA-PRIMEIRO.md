---
title: "Modo Operacional — LOOP com evidência primeiro"
status: "CANDIDATO_CANONICO"
date: "2026-07-31"
source_of_truth: "ServerVpss/CentralDark"
observed_target_evidence: "Estado observado do alvo (VPS, runtime, serviços). É insumo operacional, NÃO fonte canônica: nunca promove estado divergente ou não aprovado a cânone."
scope: "Operações críticas, segurança, VPS, GitHub, deploy, automação e evolução do CentralDark/Hermes"
---

# Modo Operacional — LOOP com evidência primeiro

Este documento registra o modo de operação **proposto para avaliação por SEGREDO/CHEFE**, elaborado durante a captura defensiva da VPS em 2026-07-31. Permanece `CANDIDATO_CANONICO`: sem um `OPERATION_RECEIPT` terminal com `chief_decision: APPROVED` preso ao mesmo HEAD, nenhuma seção abaixo prova aprovação — apenas descreve a proposta.

Ele não autoriza mutação por si só. Ele define a ordem, os papéis, os gates e a forma de aprender sem depender do chat.

## 1. Autoridade e papéis

```text
SEGREDO/CHEFE = autoridade humana final; define intenção, autoriza promoção e encerra o LOOP
SOL           = coordenador; preserva o fio, organiza papéis, confronta hipóteses e exige prova
PIVETE/HERMES = mente treinada e executora; preserva aprendizado e continuidade operacional
SCOUT/REVIEWER= leitor adversarial e somente leitura; procura lacunas e ruído
WRITER        = único executor autorizado a alterar o escopo atual
JUDGE         = validador independente; tenta falsificar a entrega e não aprova o próprio trabalho
```

Nome comercial de modelo não altera autoridade. GPT, Grok, Claude, Codex, Gemini ou qualquer modelo futuro recebem apenas um papel operacional.

## 2. Circuito canônico

```text
INTENÇÃO DO CHEFE
  → CAPTURE
  → SANITIZE + HASH
  → DECIDE
  → APPLY
  → JUDGE
  → CHEFE
  → RECEIPT + LEARNING
  → LOOP até fechar a conta
```

O LOOP só encerra quando o resultado, a contraprova, o estado final e o rollback estiverem registrados.

## 3. CAPTURE — medir antes de interpretar

A captura é determinística, read-only e produz um pacote reproduzível.

Deve medir, quando aplicável:

- host, timestamp UTC, branch, HEAD e origem (normalizada: somente `scheme://host/path`; nunca `userinfo`, `query`, `fragment` ou credenciais embutidas na URL);
- sistema, listeners, PID, binário, CWD e cgroup;
- UFW, nftables, iptables e regras Docker;
- SSH e Fail2ban;
- systemd, Docker, Compose, PM2 e Caddy;
- estado Git e referências de bind/porta no código;
- logs recentes sanitizados;
- nomes de possíveis credenciais, nunca os valores;
- manifesto de arquivos e SHA-256 do pacote.

Durante CAPTURE:

```text
NINGUÉM ESCREVE
NINGUÉM FECHA PORTA
NINGUÉM REINICIA SERVIÇO
NINGUÉM PROMOVE
```

A captura pode escrever somente sua própria evidência em diretório restrito. Ela não altera PM2, Docker, UFW, systemd, aplicação ou repositório.

## 4. Baseline experimental não é cânone

Uma captura nova permanece `BASELINE_EXPERIMENTAL` até provar os quatro gates:

1. tarball revisado contra vazamento de segredo;
2. falha crítica gera `status: BLOCKED` com `reason: CAPTURE_DEGRADED`, nunca falso PASS;
3. duas execuções produzem estrutura equivalente e explicam diferenças voláteis;
4. zero mutação em PM2, Docker, UFW, systemd e Git.

Somente depois ela pode ser promovida a coletor canônico versionado.

## 5. SANITIZE + HASH — pacote seguro antes de IA

Nenhum tarball cru entra em prompt.

Regras:

- `umask 077`;
- **a sanitização é obrigatória ANTES de gravar em disco e ANTES de enviar a qualquer agente** — não existe "quando possível";
- **se a sanitização falhar ou não puder ser garantida: não persistir, não enviar, interromper a captura e retornar `status: BLOCKED` com `reason: SANITIZE_FAILED`**;
- PM2 filtrado por allowlist de campos; proibido despejar ambiente completo;
- tokens, headers, cookies, chaves, connection strings e certificados nunca são registrados;
- manifesto por arquivo + SHA-256 do pacote;
- **se um segredo suspeito for encontrado, mesmo após a sanitização: não persistir, não enviar, interromper a captura e retornar `status: BLOCKED` com `reason: SECRET_EXPOSURE`** — a mesma regra fail-closed da sanitização, aplicada de novo aqui porque a detecção de segredo pode ocorrer depois que um artefato já foi criado.

Sanitização reduz risco, mas não é assumida como prova matemática: o pacote passa por verificação antes de ser entregue a outro agente.

## 6. DECIDE — código primeiro, modelo no residual

```text
CÓDIGO MEDE
REGRAS CLASSIFICAM O CONHECIDO
MODELO INTERPRETA UNKNOWN OU ANOMALY
```

Porta, PID, bind, hash, diff, regra de firewall e estado de serviço não devem consumir modelo para serem descobertos.

Estados permitidos:

- `PASS` — prova positiva e reproduzível;
- `FAIL` — violação comprovada;
- `UNKNOWN` — informação insuficiente;
- `ANOMALY` — divergência fora do padrão esperado;
- `ACHADO_PENDENTE` — suspeita ainda sem arquivo, linha, commit e evidência sanitizada;
- `BLOCKED` — gate falhou, autorização ausente, execução pulada ou exposição de segredo.

`BLOCKED` é o único estado de bloqueio. O motivo vai no campo `reason`, nunca no nome do estado:

| Situação | `status` | `reason` |
|---|---|---|
| falha crítica de gate na captura | `BLOCKED` | `CAPTURE_DEGRADED` |
| segredo suspeito no pacote | `BLOCKED` | `SECRET_EXPOSURE` |
| sanitização falhou/não garantida | `BLOCKED` | `SANITIZE_FAILED` |
| etapa não executada (cota, ferramenta ausente, revisão não rodada) | `BLOCKED` | `SKIPPED` |
| gate falhou | `BLOCKED` | `GATE_FAILED` |
| autorização ausente | `BLOCKED` | `AUTH_MISSING` |

Não existe estado `BLOCKED_SECRET_EXPOSURE` nem estado `SKIPPED`: um produtor jamais emite valor que o consumidor não saiba interpretar.

`UNKNOWN`, `ANOMALY`, `BLOCKED` e `ACHADO_PENDENTE` nunca equivalem a PASS.

## 7. APPLY — uma cirurgia, um escritor

APPLY só começa depois de baseline, backup, escopo e rollback definidos.

Regras:

- vários leitores podem investigar em paralelo;
- existe um único writer por escopo/branch/worktree;
- a troca de writer exige handoff explícito e registrado (bloco abaixo); sem ele, o novo writer não atua;
- correção automática somente dentro de allowlist conhecida;
- menor movimento eficaz;
- arquivos exatos e resultado esperado declarados antes da escrita;
- segurança, firewall, Docker, PM2 e systemd exigem contraprova pós-mudança;
- falhou qualquer gate: rollback automático quando seguro e status `BLOCKED`;
- nenhuma promoção automática por texto bonito ou conclusão do executor.

### 7.1 Handoff de Writer

Writer único não basta: a autoridade de escrita precisa ser transferida de forma explícita e auditável. Antes de outro writer atuar no mesmo escopo, registre:

```yaml
WRITER_HANDOFF:
  previous_writer: ""
  new_writer: ""
  scope: ""
  branch: ""
  head_sha: ""
  state: "DONE|PARTIAL|BLOCKED"
  authorization: ""
  receipt: ""
```

Handoff ausente ou incompleto mantém o escopo com o writer anterior. Assumir escrita sem handoff registrado é violação de contrato, não iniciativa.

## 8. JUDGE — independência real

Judge e Writer devem possuir:

- papéis separados;
- contexto separado;
- permissões separadas;
- credenciais separadas;
- execução independente no mesmo HEAD alvo.

Label, nome de job ou prompt diferente não prova independência.

O executor nunca aprova o próprio trabalho. Cota esgotada, ferramenta ausente ou revisão não executada permanece bloqueio visível.

## 9. CHEFE — gates no meio e no fim

SEGREDO/CHEFE permanece:

- no início, definindo intenção e limites;
- no meio, decidindo mudanças de direção, risco e autorização;
- no fim, aceitando ou recusando promoção.

PIVETE/HERMES executa e preserva aprendizado, mas não sela promoção sozinho.

## 10. RECEIPT — fechar sem perder o fio

Todo ciclo termina com receipt auditável:

```yaml
OPERATION_RECEIPT:
  mission_id: ""
  host: ""
  timestamp_utc: ""
  repository: "ServerVpss/CentralDark"
  target: ""
  branch: ""
  head_sha: ""
  evidence_path: ""
  evidence_sha256: ""
  writer: ""
  judge: ""
  status: "PASS|FAIL|UNKNOWN|ANOMALY|ACHADO_PENDENTE|BLOCKED"
  reason: "CAPTURE_DEGRADED|SECRET_EXPOSURE|SANITIZE_FAILED|SKIPPED|GATE_FAILED|AUTH_MISSING|"
  impact: ""
  mutations: []
  tests: []
  counterproof: []
  rollback: ""
  chief_decision: "PENDING|APPROVED|REJECTED"
  next_step: ""
```

`reason` é obrigatório sempre que `status` for `BLOCKED` (valores do enum acima) e fica vazio nos demais estados. `impact` descreve o efeito real observado — o que ficou sem prova, sem execução ou sem cobertura. `target` é obrigatório e deve identificar o serviço, VPS, worktree ou escopo alterado de forma coerente com `head_sha` e `evidence_path` — `host` e `repository` sozinhos não bastam.

**`status: PASS` é resultado técnico, não aprovação.** Só vale como decisão de promoção quando `chief_decision: APPROVED` também estiver presente no mesmo receipt; `chief_decision: PENDING` mantém a entrega em avaliação mesmo com `status: PASS`.

Receipt sem HEAD, hash, alvo e estado comprovado é incompleto.

## 11. Aprendizado e evolução

O LOOP devolve evidência ao sistema:

```text
ERRO OBSERVADO
  → causa comprovada
  → correção mínima
  → teste que falha antes e passa depois
  → contraprova adversarial
  → receipt
  → regra reutilizável
  → boot dos próximos agentes
```

Não registrar como fato:

- causa interna não medida;
- secret versionado sem arquivo, linha e commit;
- exposição pública inferida apenas por bind `0.0.0.0` sem regra de firewall e teste externo;
- aprovação de Judge que não executou;
- sucesso baseado somente na saída do próprio Writer.

## 12. Comando operacional `!REGISTRA`

Quando SEGREDO/CHEFE emitir `!REGISTRA`:

1. identificar o comportamento que realmente mudou;
2. separar fato, evidência, inferência e hipótese;
3. registrar em branch isolada, nunca diretamente na `main`;
4. não alterar área protegida sem autorização literal aplicável;
5. criar commit e PR auditável;
6. não fazer merge sem autorização do CHEFE e gates válidos;
7. deixar o novo aprendizado alcançável pelo boot universal.

`!REGISTRA` não significa inventar documento para cada conversa. Significa preservar somente aprendizado operacional reutilizável que muda comportamento futuro.

## 13. Regra resumida

```text
CAPTURA PRIMEIRO.
SEGREDO NUNCA.
CÓDIGO MEDE.
IA INTERPRETA.
UM WRITER ALTERA.
JUDGE TENTA QUEBRAR.
CHEFE DECIDE.
RECEIPT PROVA.
LOOP ATÉ FECHAR A CONTA.
```

## 14. CASCO VIVO — resiliência adaptativa com fronteira e prova

`CASCO VIVO` não é um novo componente. É a composição operacional das regras já distribuídas entre Trigger Fabric, permissões, MetaLupa, proof ownership, execução reversível, remedição e handoff.

```text
CASCO_VIVO_IS_DERIVED_VIEW=true
CASCO_VIVO_IS_NEW_OWNER=false
CASCO_VIVO_IS_NEW_ENGINE=false
CASCO_VIVO_IS_NEW_WORKFLOW=false
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

Arquitetura integrada:

```text
👑 SEGREDO/CHEFE
→ #ACORDAR
→ !CALIBRAR
→ DESTINATION_LOCK
→ BOUNDARY_LOCK
→ !MULTIBÚSSOLA
→ !META_LUPA
→ TRUST_FIREWALL
→ ONE_WRITER_PER_SCOPE
→ !EXECUÇÃO_REVERSÍVEL
→ HERMES / EXECUTAR
→ PERTURBAÇÃO? CLASSIFY → LOCALIZE → CONTAIN → ADAPT_MINIMALLY
→ !REMEDIÇÃO T0→T1
→ REALITY_JUDGE
   ├─ PROVOU  → FIXED_POINT_CHECK
   ├─ UNKNOWN → DISCRIMINATING_TEST
   └─ FALHOU  → EXISTING_OWNER → MINIMUM_DELTA → RETEST
→ RECEIPT + NEXT_CURSOR
→ próximo #ACORDAR
```

`BOUNDARY_LOCK` e `TRUST_FIREWALL` são estados/composições derivadas, não comandos ou serviços novos.

### 14.1 Dois cascos

```text
CASCO_INTERNO =
CHEFE_AUTHORITY
+ INTENT
+ DESTINATION_LOCK
+ BOUNDARY
+ ONE_WRITER_PER_SCOPE
+ PROOF_STANDARD
+ REALITY_IS_JUDGE
+ UNKNOWN_IS_NOT_PASS
+ PROOF_TARGET_MUST_MATCH_CLAIM
+ ROLLBACK_REQUIRED_WHEN_APPLICABLE

CASCO_EXTERNO =
MODEL
+ TOOL
+ ROUTE
+ ORDER
+ FREQUENCY
+ WORKER
+ RETRY_STRATEGY
+ OBSERVATION_CHANNEL
+ SAFE_DEGRADATION_MODE

CASCO_EXTERNO = FLEXIVEL
CASCO_INTERNO = INVARIANTE
```

Logo:

```text
PATH_CHANGED != INTENT_CHANGED
MODEL_CHANGED != AUTHORITY_CHANGED
PRESSURE_CHANGED != PROOF_STANDARD_CHANGED
```

### 14.2 Trust Firewall

O Trust Firewall reutiliza os gates existentes de autoridade, proof ownership, MetaLupa, `OUTPUT_GUARD` e handoff canônico.

```text
INPUT
→ SOURCE?
→ AUTHORITY?
→ SCOPE?
→ CURRENT?
→ EVIDENCE?
→ WRITER?
→ TARGET?
→ EXECUTE_OR_FAIL_CLOSED
```

Separações obrigatórias:

```text
CONTRIBUTOR != AUTHORITY
WRITER != AUTHORITY
JUDGE != AUTHORITY
MODEL != AUTHORITY
MAJORITY != AUTHORITY
PR != AUTHORITY
MEMORY != AUTHORITY
EXTERNAL_MATERIAL != AUTHORITY
```

### 14.3 Casco de perturbação

```text
PERTURBATION
→ CLASSIFY
   ├─ LOAD
   ├─ LATENCY
   ├─ DEPENDENCY
   ├─ TOOL_FAILURE
   ├─ STALE_STATE
   ├─ MODEL_DISAGREEMENT
   ├─ WRITER_COLLISION
   ├─ AUTHORITY_CONFLICT
   ├─ BOUNDARY_PRESSURE
   └─ PROOF_CONFLICT
→ LOCALIZE
→ CONTAIN
→ ADAPT_MINIMALLY
→ REMEASURE
→ COUNTERPROOF
→ REALITY_JUDGE
```

A perturbação nunca amplia autoridade automaticamente.

### 14.4 Reutilização dos gatilhos existentes

A Trigger Fabric já possui os consumidores necessários:

```text
STATE_CHANGED
→ REMEASURE_LIVE_STATE

WRITER_CONFLICT
→ ENTER_READ_ONLY → RENDEZVOUS

BOUNDARY_TOUCHED
→ STOP_PROPAGATION → PRESERVE_EVIDENCE → CONTAIN_AFFECTED_SCOPE

MATERIAL_UNKNOWN_AFFECTS_MUTATION
→ BLOCK_AFFECTED_MUTATION_ONLY → FIND_EVIDENCE

PROOF_TARGET_MISMATCH
→ INVALIDATE_VERDICT → MEASURE_CORRECT_TARGET

ROLLBACK_UNPROVEN_FOR_MATERIAL_MUTATION
→ BLOCK_AFFECTED_MUTATION → PROVE_RECOVERY_PATH

EVIDENCE_CONFLICT
→ DISCRIMINATING_TEST

MODEL_UNAVAILABLE
→ MEASURE_ALTERNATIVE_ENGINE_CAPABILITY

DEPENDENCY_FAILURE
→ CLASSIFY_CRITICALITY → FAIL_CLOSED_OR_CONTAIN
```

Portanto:

```text
CASCO_VIVO = COMPOSICAO_DE_CAPACIDADES_EXISTENTES
CASCO_VIVO != NOVO_DISPATCHER
```

### 14.5 Chave clandestina eliminada, recuperação preservada

```text
AUTHORIZED_PATHS = EXPLICIT
RECOVERY_PATH = EXPLICIT
ROLLBACK_PATH = EXPLICIT

NO_HIDDEN_BYPASS=true
NO_SHADOW_AUTHORITY=true
NO_SECRET_SECOND_PATH=true
NO_UNOWNED_WRITER=true

AUTHORIZED_BREAK_GLASS_IF_CANONICAL=true
```

O que some é o bypass oculto; rollback e recuperação legítima continuam explícitos e auditáveis.

### 14.6 Fixed point do Casco Vivo

```text
DESTINATION_REACHED
AND INVARIANTS_PRESERVED
AND BOUNDARY_PRESERVED
AND WRITER_CLEAN
AND CLAIM_PROVEN
AND COUNTERPROOF_SURVIVED
AND ROLLBACK_VALID_WHEN_APPLICABLE
AND NO_MATERIAL_UNKNOWN
AND NO_NEW_INFORMATION
→ FIXED_POINT
```

Se qualquer termo cair:

```text
NOT_FIXED_POINT
→ LOCALIZE_RESIDUAL
→ EXISTING_OWNER
→ MINIMUM_DELTA
→ REMEASURE
```

Fronteira de prova:

```text
DOCUMENTED_ARCHITECTURE != RUNTIME_ACTIVE
CONTRACT_EXISTS != CONSUMER_EXECUTED
TRIGGER_DECLARED != TRIGGER_FIRED
MERGED != GLOBAL_RUNTIME_PROOF
```

A frase operacional fica:

> **A CentralDark não precisa ser imóvel para permanecer de pé. O casco externo pode deformar o caminho inteiro; intenção, fronteira, autoridade, Writer e padrão de prova permanecem presos ao casco interno.**

```text
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```