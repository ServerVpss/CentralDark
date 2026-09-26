# MODO OPERACIONAL — LOOP COM EVIDÊNCIA PRIMEIRO — REFERÊNCIA

Fonte: `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` (status: `CANDIDATO_CANONICO`)

## Autoridade e papéis

```
SEGREDO/CHEFE = autoridade humana final; define intenção, autoriza promoção, encerra o LOOP
SOL           = coordenador; preserva o fio, organiza papéis, confronta hipóteses, exige prova
PIVETE/HERMES = mente treinada e executora; preserva aprendizado e continuidade operacional
SCOUT/REVIEWER= leitor adversarial e somente leitura; procura lacunas e ruído
WRITER        = único executor autorizado a alterar o escopo atual
JUDGE         = validador independente; tenta falsificar a entrega e não aprova o próprio trabalho
```

Nome comercial de modelo não altera autoridade.

## Circuito canônico

```
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

O LOOP só encerra quando resultado, contraprova, estado final e rollback estiverem registrados.

## CAPTURE — medir antes de interpretar

Determinística, read-only, pacote reproduzível. Durante CAPTURE: NINGUÉM ESCREVE, NINGUÉM FECHA PORTA, NINGUÉM REINICIA SERVIÇO, NINGUÉM PROMOVE.

Mede: host, timestamp UTC, branch, HEAD, origem, sistema, listeners, PID, binário, CWD, cgroup, UFW, nftables, iptables, Docker, SSH, Fail2ban, systemd, Docker, Compose, PM2, Caddy, estado Git, referências de bind/porta no código, logs recentes sanitizados, nomes de possíveis credenciais (nunca valores), manifesto de arquivos + SHA-256.

## Baseline experimental não é cânone

Nova captura permanece `BASELINE_EXPERIMENTAL` até provar 4 gates:
1. Tarball revisado contra vazamento de segredo
2. Falha crítica → `status: BLOCKED` com `reason: CAPTURE_DEGRADED`, nunca falso PASS
3. Duas execuções produzem estrutura equivalente e explicam diferenças voláteis
4. Zero mutação em PM2, Docker, UFW, systemd, Git

## SANITIZE + HASH — pacote seguro antes de IA

- `umask 077`
- Sanitização OBRIGATÓRIA antes de gravar em disco e antes de enviar a qualquer agente
- Se sanitização falhar → não persistir, não enviar, interromper, retornar `BLOCKED` com `reason: SANITIZE_FAILED`
- PM2 filtrado por allowlist; proibido despejar ambiente completo
- Tokens, headers, cookies, chaves, connection strings, certificados nunca registrados
- Se segredo suspeito encontrado após sanitização → não persistir, não enviar, interromper, `BLOCKED` com `reason: SECRET_EXPOSURE`

## DECIDE — código primeiro, modelo no residual

```
CÓDIGO MEDE
REGRAS CLASSIFICAM O CONHECIDO
MODELO INTERPRETA UNKNOWN OU ANOMALY
```

Porta, PID, bind, hash, diff, regra de firewall, estado de serviço não consomem modelo.

Estados: `PASS` (prova positiva reproduzível), `FAIL` (violação comprovada), `UNKNOWN` (informação insuficiente), `ANOMALY` (divergência fora do padrão), `ACHADO_PENDENTE` (suspeita sem arquivo/linha/commit/evidência), `BLOCKED` (gate falhou, autorização ausente, execução pulada, exposição de segredo).

`BLOCKED` é único estado de bloqueio. Motivo no campo `reason` (enum: `CAPTURE_DEGRADED`, `SECRET_EXPOSURE`, `SANITIZE_FAILED`, `SKIPPED`, `GATE_FAILED`, `AUTH_MISSING`).

`UNKNOWN`, `ANOMALY`, `BLOCKED`, `ACHADO_PENDENTE` nunca equivalem a PASS.

## APPLY — uma cirurgia, um escritor

Só começa depois de baseline, backup, escopo, rollback definidos.

- Vários leitores em paralelo
- **Um writer por escopo/branch/worktree**
- Troca de writer exige handoff explícito e registrado
- Correção automática só dentro de allowlist conhecida
- Menor movimento eficaz
- Arquivos exatos e resultado esperado declarados antes da escrita
- Segurança, firewall, Docker, PM2, systemd exigem contraprova pós-mudança
- Falhou gate → rollback automático quando seguro + `BLOCKED`
- Nenhuma promoção automática por texto bonito

### Handoff de Writer

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

Handoff ausente/incompleto mantém escopo com writer anterior.

## JUDGE — independência real

Judge e Writer: papéis separados, contexto separado, permissões separadas, credenciais separadas, execução independente no mesmo HEAD alvo. Label/nome de job/prompt diferente não prova independência. Executor nunca aprova próprio trabalho.

## CHEFE — gates no meio e no fim

SEGREDO/CHEFE no início (intenção/limites), no meio (mudança direção/risco/autorização), no fim (aceita/recusa promoção). PIVETE/HERMES executa e preserva, não sela promoção sozinho.

## RECEIPT — fechar sem perder o fio

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

`reason` obrigatório quando `status` for `BLOCKED`. `impact` = efeito real observado. `target` obrigatório (serviço, VPS, worktree, escopo alterado coerente com `head_sha` e `evidence_path`).

**`status: PASS` é resultado técnico, não aprovação.** Só vale como decisão de promoção quando `chief_decision: APPROVED` também presente no mesmo receipt.

## Aprendizado e evolução

```
ERRO OBSERVADO
  → causa comprovada
  → correção mínima
  → teste que falha antes e passa depois
  → contraprova adversarial
  → receipt
  → regra reutilizável
  → boot dos próximos agentes
```

Não registrar como fato: causa interna não medida, secret versionado sem arquivo/linha/commit, exposição pública inferida apenas por bind `0.0.0.0` sem firewall/teste externo, aprovação de Judge que não executou, sucesso baseado só na saída do próprio Writer.

## Comando `!REGISTRA`

Quando SEGREDO/CHEFE emitir: identificar comportamento que mudou, separar fato/evidência/inferência/hipótese, registrar em branch isolada, não alterar área protegida sem autorização literal, criar commit e PR auditável, não merge sem autorização do CHEFE e gates válidos, deixar novo aprendizado alcançável pelo boot universal.

## Regra resumida

```
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