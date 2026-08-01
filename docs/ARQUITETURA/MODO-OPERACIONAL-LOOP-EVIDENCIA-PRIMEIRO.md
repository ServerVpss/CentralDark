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
