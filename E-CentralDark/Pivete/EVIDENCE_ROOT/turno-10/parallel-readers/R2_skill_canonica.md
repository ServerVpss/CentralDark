# R2 — Leitura da Skill Canônica meta-lupa (Extração Estruturada)

---

## 1. CONTRATO XP (XP-1 a XP-6)

### XP-1: contract_digest (resumo de contrato operacional)
- **Definição**: Antes de executar missão longa, o executor emite um digest de 1 parágrafo reforçando o contrato: fonte da verdade, autoridade final, gates de parada, o que NÃO é permitido nesta rodada e o veredito mínimo aceitável.
- **Regra**: O digest não substitui o mapa; é âncora de escopo. Se contradiz o mapa canônico, o mapa vence e o digest é CORRIGIDO.
- **Implementação**: `scripts/meta_lupa.py::contract_digest()` — SHA-256 do JSON canônico com campos: objective, target, scope, constraints, source_truth, head_sha, authorization, acceptance.

### XP-2: candidate_ref (referência de candidato canônico)
- **Definição**: Toda skill/arquivo citado por nome deve resolver para um caminho Git real com `blob SHA`.
- **Regra**: Se houver duas candidatas conflitantes → `BLOCKED_SKILL_IDENTITY`.
- **Regra da missão**: Cópia baixada solta (ex: `METALUPA-BAYESIANA-CANONICA.md.lnk`) NUNCA é fonte da verdade; só o repo conectado conta.
- **Destino local canônico desta skill**: `.agents/skills/meta-lupa/`.

### XP-3: Comitês independentes
- **Estrutura** para decisão crítica (deploy, consolidação, área protegida):
  - **Executor**: propõe e implementa.
  - **Crítico**: revisa o MESMO SHA/HEAD sem herdar o veredito; pode ser Grok, Gemini ou DarkAI, desde que não seja o executor.
  - **Síntese** (Arquiteto): consolida divergências em veredito único.
- **Princípio**: Modelo ≠ setor. Um cérebro não vira "novo time".

### XP-4: AutoLupa registrada (ponto fixo auditável)
- A AutoLupa (Fase 9) deve produzir bloco curto no fim do relatório:
  ```
  PONTO_FIXO_ATINGIDO: sim|nao
  + lista das 15 verificações respondidas (reaproveitar existente / duplicação / EF na VPS / demo como real / secret / provider vs rota / sobrevive troca modelo / relatório sem chat / autossep / crítico mesmo SHA / branch só escopo / rollback / PR evidências / autoridade Pivete / contradição fechada)
  ```
- Sem o bloco, veredito não sela.

### XP-5: Matriz de existência de recursos

| Recurso | Caminho | Estado |
|---------|---------|--------|
| motor 3T e cálculo | `scripts/meta_lupa.py` | PRESENTE |
| guardrail | `guardrails/validar_meta_lupa.py` | PRESENTE |
| política | `approvals/politica.json` | PRESENTE |
| regressão 3T | `testes/test_meta_lupa_3t.py` | PRESENTE |
| ref math | `references/matematica-e-calibracao.md` | CRIADO |
| ref casos | `references/casos.md` | CRIADO |
| testes | `testes/test_lupa.py` | CRIADO (7/7) |

### XP-6: Versionamento implícito
- Esta skill não usa semver.
- Maturidade = geração MetaLupa (pós-Lupa v1).
- Toda evolução é correção mínima neste arquivo + recursos citados, nunca novo arquivo paralelo.
- Blob atual de referência: `b71af825` (base recuperada).

---

## 2. RUBRICAS 3T (TRÊS TEMPERATURAS OPERACIONAIS)

### FRIA — provar o que aconteceu
- **Uso**: R0/R1 e fatos locais.
- **Método**: Separar SIM/NÃO, antes/depois, mudou/não mudou. Não explicar mecanismo invisível.
- **Saída mínima**: `MODO=FRIA`, fato, resultado, prova e lacuna.

### MÉDIA — localizar por que aconteceu
- **Ativação**: 401, 404, 429, timeout, contradição, evidência fraca, drift, falso verde ou R2.
- **Método**: Formular hipóteses distinguíveis, mudar uma variável por vez, usar o canal correto, buscar prova contrária, capturar delta do runtime.
- **Saída mínima**: `MODO=MEDIA`, hipótese, variável alterada, canal, resultado binário, delta, prova contrária e camada localizada.

### QUENTE — tornar o achado repetível
- **Ativação**: R3/R4, produção, autenticação, dados, merge, alteração da própria skill, recorrência ou CAÇA_AO_ERRO.
- **Método**: Fixar alvo e SHA; combinar tela, log, processo e ação; usar revisão adversarial; executar positivo, negativo, limite e rollback; validar autorização; registrar BEGIN/FINAL e AutoLupa.
- **Saída mínima**: `MODO=QUENTE`, contratos, observadores, testes, rollback, registro, autorização e ponto fixo.

### Escalonamento
```
FRIA → (contradição) → MÉDIA → (criticidade/recorrência/promoção) → QUENTE → (ponto fixo) → encerra
```

---

## 3. LEDGER SCHEMA

**Arquivo**: `references/uso-ledger.jsonl` (append-only, imutável)

### Eventos suportados
1. **BEGIN** — Início de uso da skill
2. **FINAL** — Fim de uso com veredito
3. **CANDIDATE_REF** — Registro de candidate_ref histórico
4. **ATTESTATION** — Atestação de registro (resolve orfãos, migração sancionada)

### Campos obrigatórios (BEGIN)
```json
{
  "schema_version": 1,
  "event": "BEGIN",
  "usage_id": "<sha256 determinístico>",
  "started_at_utc": "ISO8601",
  "repo": "ServerVpss/CentralDark",
  "mission_id": "<id>",
  "workspace_branch": "<branch>",
  "workspace_head": "<SHA>",
  "skill_path": ".agents/skills/meta-lupa/SKILL.md",
  "skill_ref": "origin/main|HEAD|workspace/...",
  "skill_commit_sha": "<SHA>",
  "skill_blob_sha": "<SHA>",
  "mode": "read-only|edit|QUENTE|...",
  "authorization": "PERMITO PIVETE SEM AÇÃO DESTRUTIVA",
  "source": "git",
  "record_hash": "<SHA-256 do conteúdo sem campos voláteis>"
}
```

### Campos obrigatórios (FINAL)
```json
{
  "schema_version": 1,
  "event": "FINAL",
  "usage_id": "<mesmo do BEGIN>",
  "finished_at_utc": "ISO8601",
  "verdict": "APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR|PENDING_INDEPENDENT_JUDGE",
  "autolupa_executed": true|false,
  "point_fixed_evidential": true|false,
  "test_suites": <int>,
  "checks": <int>,
  "test_cases": <int>,
  "pass": <int>,
  "fail": <int>,
  "files_changed": [...],
  "pr": "<num|null>",
  "evidence": [...],
  "new_defect_ids": [...],
  "duplicate_defect_ids": [...],
  "xp_valid": <int>,
  "xp_rejected": <int>,
  "residual_risk": [...],
  "result": "<string>",
  "record_hash": "<SHA-256>"
}
```

### Campos XP no FINAL (opcionais mas recomendados)
- `mission_id`, `head_sha`, `mode_used`, `triggers`, `risk`
- `error_found`, `root_cause`, `counter_evidence`
- `test_created`, `regression_created`, `false_green_blocked`
- `guardrail_added`, `rollback_proven`, `improvements`
- `evidence_hash`, `achievements[]`, `penalties[]`
- `evolution_fingerprint`, `xp_before`, `xp_gained`, `xp_after`
- `level_before`, `level_after`, `tier_before`, `tier_after`
- `level_up`, `next_level_xp`, `no_xp_reason`

### Integridade do ledger (verificada por `ledger_integrity()`)
- `orphan_begin`: BEGIN sem FINAL correspondente
- `orphan_final`: FINAL sem BEGIN correspondente (pode ser resolvido por ATTESTATION com `resolve_orphan=true`)
- `bad_hash`: record_hash inválido (algoritmo corrente, legado ou atestado exato)
- `dangling_refs`: ATTESTATION apontando para target inexistente
- `ok`: todos acima = 0

### usage_id determinístico
```
SHA-256({schema_version, repo, mission_id, skill_commit_sha, workspace_head})
```

### evolution_fingerprint (deduplicação de XP)
```
SHA-256({mission_id, root_cause, test, evidence, head_sha})
```
Se já existir em um FINAL → `XP_GAINED=0`, `NO_XP_REASON=EVENTO_JA_REGISTRADO`.

---

## 4. GATES

### Gate de Mapa Único (antes de criar/mover/renomear/duplicar)
1. Localizar Fonte da Verdade e mapa canônico
2. Buscar por função, consumidores, rotas, nomes equivalentes, legado ativo
3. Tentar encaixar no componente existente de mesma responsabilidade
4. Preferir extensão pequena e compatível a novo módulo
5. Só criar caminho novo se encaixe existente for tecnicamente impossível ou produzir acoplamento pior
6. Usar nome humano, estável, coerente com a árvore; registrar responsabilidade, dependências, caminho canônico
7. Atualizar mapa único na mesma mudança; nunca deixar estrutura nascer antes do mapa

**Classificação**: `ENCAIXE_EXISTENTE | EXTENSAO_CANONICA | NOVO_CAMINHO_JUSTIFICADO | BLOQUEADO_POR_DUPLICIDADE`

### Gate de Consolidação e Trava (promover a CONSOLIDADA)
Requer, para mesmo alvo e SHA:
```
CAMINHO_CANONICO:
RESPONSABILIDADE:
TESTES:
REVISAO/FALSIFICACAO:
AUTORIZACAO_DO_PIVETE:
COMMIT_OU_MERGE_SHA:
MECANISMO_DE_TRAVA:
ROLLBACK/RECUPERACAO:
```
Depois: bloquear edição automática, exigir reconhecimento pelo mapa e gate determinístico, não tratar CODEOWNERS/comentário/emoji como trava suficiente, permitir mudança só por autorização aplicável com nova revisão/testes/registro, preservar histórico.

### Gate Operacional Obrigatório (qualquer operação que altere/promova/declare estado)
```text
META_LUPA_LOADED=SIM
META_LUPA_CANONICAL_SHA=<tree SHA de .agents/skills/meta-lupa>
META_LUPA_RECEIPT_VALID=SIM
META_LUPA_USAGE_ID=<usage_id determinístico>
META_LUPA_GATE=PASS
```

**Execução**:
```bash
python .agents/skills/meta-lupa/scripts/meta_lupa.py issue-gate-receipt \
  --repo-root . --repo ServerVpss/CentralDark --mission-id <id> \
  --workspace-head <HEAD> --output <TEMP>/meta-lupa-gate.json
python .agents/skills/meta-lupa/scripts/meta_lupa.py gate \
  --repo-root . --input <TEMP>/meta-lupa-gate.json --operation <operacao>
```

**Rejeição**: falta carregamento, SHA/skill divergente, HEAD divergente, usage_id incorreto, hash do recibo inválido, idade > 15 min.
**Falha → `STATUS=BLOCKED`**; declaração verde sem recibo → `REASON=BLOCKED_FALSE_GREEN`.

### Gate de Falsificação (antes do veredito)
1. Que observação faria a hipótese perder força?
2. Qual evidência foi procurada contra a conclusão preferida?
3. O teste distingue as hipóteses ou apenas confirma a narrativa?
4. Qual resultado produziria `BLOQUEADO`?
5. A conclusão sobrevive aos priors mínimo e máximo plausíveis?

Se não houver resposta concreta para (1) → hipótese protegida contra refutação → não pronta para decisão técnica.

---

## 5. AUTOLUPA

### Fase 9 do fluxo obrigatório
Revisar a própria análise como se tivesse sido produzida por outro agente:

1. Procurar evidência ignorada contra o veredito
2. Verificar se o mapa canônico foi realmente lido ou apenas presumido
3. Procurar duplicação de pasta, rota, serviço, documento, regra ou método
4. Verificar se evidências correlacionadas foram contadas mais de uma vez
5. Tentar produzir caso de regressão, rollback falho, falso verde ou SHA divergente
6. Conferir se confiança foi usada indevidamente como autorização
7. Comparar a saída com a intenção humana (contexto e provas, não literalista)
8. Atualizar o ledger e repetir somente quando surgir contradição ou evidência material nova

### Ponto fixo
Encerrar quando uma nova passagem **não alterar materialmente**:
- hipóteses
- bloqueios
- risco residual
- próximo teste
- veredito

Registrar: `PONTO_FIXO_ATINGIDO: sim | não`
Se não atingir → manter `CORRIGIR` ou `BLOQUEAR`; nunca forçar fechamento por contagem de rodadas.

### XP por ponto fixo
`ponto_fixo_atingido = 25 XP` (requer `args.point_fixed == "sim"`)

---

## 6. PONTO FIXO

### Definição
Estado de convergência da AutoLupa onde iterações adicionais não produzem mudança material nos elementos decisórios.

### Critério de parada (não artificial)
- Sem limite de iterações
- Sem prometer certeza absoluta
- Para quando: hipóteses, bloqueios, risco residual, próximo teste, veredito — todos estáveis

### Registro obrigatório
No bloco final do relatório (XP-4):
```
PONTO_FIXO_ATINGIDO: sim|nao
+ 15 verificações respondidas
```

### Nível XP
`xp_next(level) = ceil(100 * 1.15^(LEVEL - 1))`
Tiers: 1-9 `OPACA`, 10-29 `MONOCULO`, 30-49 `PRISMATICA`, 50+ `OMNIVISOR`

---

## 7. CONTRATO CANDIDATO (candidate_ref)

### Princípio (XP-2)
> Toda skill/arquivo citado por nome deve resolver para um caminho Git real com `blob SHA`. Se houver duas candidatas conflitantes → `BLOCKED_SKILL_IDENTITY`.

### Regras
- Cópia baixada solta (ex: `.lnk`, arquivo fora do repo) **NUNCA** é fonte da verdade
- Só o repo conectado (Git) conta
- Destino local canônico desta skill: `.agents/skills/meta-lupa/`
- `skill_blob_sha` no BEGIN/FINAL é a identidade imutável do conteúdo

### Validação no script
- `usage_id` inclui `skill_commit_sha` e `workspace_head`
- `skill_blob_sha` registrado no ledger
- Verificação de identidade via `candidate_ref` no `evaluate()`

---

## 8. COMITÊ EVIDENCIAL (XP-3)

### Composição (para decisão crítica)
| Papel | Responsabilidade | Restrição |
|-------|------------------|-----------|
| **Executor** | Propõe e implementa | — |
| **Crítico** | Revisa o MESMO SHA/HEAD sem herdar o veredito | Deve ser modelo/agente DIFERENTE do executor (Grok, Gemini, DarkAI) |
| **Síntese / Arquiteto** | Consolida divergências em veredito único | — |

### Princípios
- **Modelo ≠ setor**: Um cérebro não vira "novo time"
- O Crítico **não herda** o veredito do Executor — análise independente
- A Síntese resolve conflitos, não vota
- Aplicável a: deploy, consolidação, área protegida, decisões arquiteturais críticas

---

## 9. ESTRUTURA DE ARQUIVOS DA SKILL

```
/e/CentralDark/Pivete/CentralDark/.agents/skills/meta-lupa/
├── SKILL.md                           # Skill principal (esta extração)
├── AUTOLUPA_CANONICAL_SHA             # Hash canônico do SKILL.md (aa39552c...)
├── scripts/
│   └── meta_lupa.py                   # Motor determinístico: Bayes, ledger, gates, XP, AutoLupa
├── guardrails/
│   └── validar_meta_lupa.py           # Guardrail CLI: valida input JSON → PASS/BLOCK
├── references/
│   ├── uso-ledger.jsonl               # Ledger append-only (BEGIN/FINAL/ATTESTATION)
│   ├── matematica-e-calibracao.md     # Referência matemática (criado)
│   └── casos.md                       # Padrões aplicados (criado)
├── approvals/
│   └── politica.json                  # Política de aprovação (presente)
├── testes/
│   ├── test_lupa.py                   # Testes do motor (7/7 → expandido para 50+)
│   ├── test_meta_lupa_3t.py           # Regressão 3T
│   ├── test_attest_unit.py            # Testes unitários de atestação
│   ├── test_attest_cli.py             # Testes CLI de atestação
│   └── test_autolupa_conformance.py   # Conformidade AutoLupa/hash
└── agents/nivel-7/                    # Baseline VERMELHA Desafio Nível 7
    ├── README.md
    ├── LOCK.json                      # Hashes imutáveis de contratos/testes
    ├── runner.py                      # Runner isolado (sem __pycache__)
    ├── contracts/
    │   ├── conversor.schema.json      # Schema frozen: agent=conversor
    │   ├── observador.schema.json     # Schema frozen: agent=observador
    │   └── orquestrador.schema.json   # Schema frozen: agent=orquestrador
    ├── tests/                         # 5 testes imutáveis (LOCK.json)
    └── evidence/
```

---

## 10. PREMIAÇÕES E PENALIDADES XP

### Awards (XP_AWARDS)
| Evento | XP |
|--------|-----|
| erro_reproduzido | 5 |
| causa_raiz_provada | 10 |
| prova_contraria_encontrada | 10 |
| falso_verde_bloqueado | 20 |
| teste_negativo_criado | 15 |
| regressao_criada | 20 |
| guardrail_novo | 20 |
| rollback_provado | 20 |
| risco_critico_evitado | 30 |
| duplicacao_real_removida | 15 |
| ponto_fixo_atingido | 25 |

### Penalties (XP_PENALTIES)
| Evento | XP |
|--------|-----|
| falso_verde_declarado | -25 |
| evidencia_inventada | -50 |
| ledger_orfao | -15 |
| sucesso_sem_teste | -10 |
| alteracao_sem_autorizacao | -30 |

**Total nunca fica abaixo de zero.**

---

## 11. VALIDAÇÃO DE EXECUÇÃO (RECEIPT)

Campos obrigatórios para recibo científico (`RECEIPT_REQUIRED_FIELDS`):
```
process_started, pid_observed, pid, process_exited, exit_code,
log_sha256, log_fresh, stream_complete, final_result_receipt,
fixture_sha, fixture_sha_match, prompt_sha, prompt_sha_match,
tests_executed, tests_cwd_correct, tests_before, tests_after,
tests_after_pass, model_requested, model_actual, model_actual_proof,
model_match, seeded_failures_total, tests_total, failures_found,
failure_recall_percent, output_chars, input_tokens, output_tokens,
total_tokens, timeout_seconds, budget_sha, test_manifest_sha, arm, seed
```

**Validações críticas**:
- `exit_code == 0`
- `model_actual` provado pelo stream real (não request)
- Tokens só de `modelUsage` real; `OUTPUT_CHARS` ≠ `TOKEN_USAGE`
- Denominador fixo: `SEEDED_FAILURES_TOTAL=4`, `TESTS_TOTAL=5`
- `failure_recall_percent = failures_found / 4 * 100`

---

## 12. GUARDRAILS DE EVIDÊNCIA EXPERIMENTAL (Opus 5, 2026-07-28)

O ganho replicado de Opus 5 + Meta Lupa só promovido quando **cada execução** apresenta recibo verificável:
- Processo iniciado, PID observado, processo encerrado `exit_code=0`
- Log novo com SHA, stream completo, recibo final
- Hashes de fixture e prompt
- Testes antes/depois no diretório correto
- `MODEL_ACTUAL` comprovado pelo stream real
- **Modelo solicitado nunca substitui prova do modelo efetivamente usado**; fallback silencioso é rejeitado

Contagens de caracteres ≠ tokens. `OUTPUT_CHARS` não é `TOKEN_USAGE`; tokens só por `modelUsage` real, senão `UNKNOWN`.

Fable permanece `EXPERIMENTAL_FAIL_CLOSED`, fora do roteamento padrão, até controle comparativo válido com mesma fixture, prompt, modelo, timeout, orçamento, manifesto, ≥2 seeds válidas por braço.

---

*Extraído da skill canônica `meta-lupa` em `/e/CentralDark/Pivete/CentralDark/.agents/skills/meta-lupa/` — SKILL.md, scripts/meta_lupa.py, guardrails/validar_meta_lupa.py, references/uso-ledger.jsonl, agents/nivel-7/*