---
name: cot-react-loop
description: "Use when Pivete manda loop CoT+ReAct+auto-crítica."
version: 1.0.0
author: Pivete + Hermes profile pivete
license: MIT
metadata:
  hermes:
    tags: [pivete, cot, react, auto-critica, loop, execucao, tools]
    related_skills: [raciocinio-deliberado, meta-lupa, pivete-execution-standards]
triggers:
  - "usa loop cot"
  - "raciocina passo a passo com tools"
  - "executa com react"
  - "auto-crítica durante execução"
  - "tarefa complexa multi-step"
  - "cot-react-loop"
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# Chain-of-Thought + ReAct Execution Loop (profile pivete)

## Overview

Loop **executável** para tarefas complexas multi-step com tool-use real:
**THINK → ACT → OBSERVE → CRITIC → REFINE → DECIDE**

Não substitui:
- `raciocinio-deliberado` (filtro **ANTES** da ação: Gate 0, relação, menor ação)
- `meta-lupa` (falsificação **DEPOIS**: AutoLupa, Gate Final, ponto fixo ≠ PASS)

É o **motor do meio** — roda **DURANTE** a execução de tarefas ≥3 steps com tools.

Combina:
- Pseudo-formal brief (long-horizon-prompting): definitions, success predicate, **non-counting outcomes**, failure modes
- ReAct + CoT + auto-crítica multi-pass (IBM + self-improvement-loops)
- Outside-the-loop invariant (evaluator fora, two-split acceptance)
- Two-split acceptance (held-in + held-out)

## When to Use

- Tarefa complexa ≥3 steps com tool-use real (terminal, web, file, code, etc)
- Precisa de auto-crítica **entre** steps (não só no fim)
- Quer rastro de reasoning reproduzível por iteração
- Precisa detectar erro silencioso **no step** vs só na MetaLupa final

**Don't use for:**
- Clique único óbvio sem ambiguidade
- Pergunta factual já respondida no disco
- Tarefa já coberta por `raciocinio-deliberado` (decisão) ou `meta-lupa` (validação final)

## Pseudo-Formal Brief (antes do loop)

Antes de entrar no loop, **escreva** (mesmo que mentalmente) o brief:

```text
DEFINITIONS:
- Termos-chave + casos degenerados

SUCCESS_PREDICATE:
- O que DEVE ser verdade ao final (quantificadores explícitos)

NON_COUNTING_OUTCOMES:
- O que NÃO conta: progresso parcial, "quase", answer-shaped, best-effort

FAILURE_MODES:
- Lista enumerada de jeitos sutis de errar (por domínio)
```

> Regra: **nunca** entre no loop sem success predicate + non-counting outcomes claros.

## Loop Executável (máx N iterações, default 5)

```text
ITER N (1..max_iter):

1. THINK  (CoT)
   - Quebra sub-problema atual
   - Planeja tool call específico
   - Registra hipótese testável

2. ACT    (tool real)
   - Executa tool: terminal/web/file/code/etc
   - NÃO simula — tool real, saída real

3. OBSERVE
   - Captura stdout/stderr/arquivo/estado
   - Mede evidência bruta (não interpretação)

4. CRITIC (auto-crítica obrigatória)
   - PASS | FAIL | GAP — com detalhe
   - Two-split mental:
     * Held-in: a fraqueza alvo foi resolvida?
     * Held-out: nada mais regressou? (proposer não vê held-out)
   - Checklist obrigatório:
     [ ] Falso verde? (status verde sem prova)
     [ ] SKIPPED/UNKNOWN/timeout viraram PASS?
     [ ] Expectativa afrouxada?
     [ ] Tool result inválido propagado?
     [ ] Lacuna de evidência?

5. REFINE
   - Se CRITIC ≠ PASS: ajusta plano/contexto
   - Registra o que mudou e por quê

6. DECIDE
   - CONTINUE  (próximo step)
   - STOP      (goal alcançado com evidência)
   - BLOCK     (precisa autorização Pivete R2+)
   - PONTO_FIXO (critic não muda nada em 2 iters seguidos)
```

## Critério de Parada (qualquer um)

- Goal alcançado: **success predicate satisfeito + evidência medida**
- `max_iter` atingido (default 5)
- `BLOCKED` — ação R2+ sem autorização
- `PONTO_FIXO` — critic não muda nada em 2 iterações seguidas
- `UNVERIFIABLE` — não consegue medir evidência

## Output Obrigatório por Iteração (JSONL append)

```json
{
  "iter": 1,
  "think": "sub-problema: X; hipótese: Y; tool planejado: terminal(cmd)",
  "act": {"tool": "terminal", "args": {"command": "..."}},
  "observe": {"stdout": "...", "stderr": "", "exit_code": 0, "evidence": "hash=abc"},
  "critic": {"verdict": "PASS|FAIL|GAP", "detail": "...", "held_in": true, "held_out": true},
  "refine": "ajuste: ... | NENHUM",
  "decide": "CONTINUE|STOP|BLOCK|PONTO_FIXO",
  "timestamp": "2026-08-04T15:30:00Z"
}
```

## Critic Checklist Obrigatório (não pule)

| Check | O que procura |
|---|---|
| **FALSO_VERDE** | Status "sucesso" sem evidência medida |
| **SKIPPED_TO_PASS** | Testes SKIPPED/UNKNOWN/timeout contados como PASS |
| **EXPECTATION_RELAXED** | Critério de sucesso afrouxado mid-loop |
| **TOOL_RESULT_INVALID** | stdout vazio, exit_code ≠ 0, hash mismatch propagado |
| **EVIDENCE_GAP** | Afirmação sem tool-result/arquivo/hash correspondente |
| **REGRESSION** | Step anterior quebrava algo que funcionava |
| **OUT_OF_SCOPE** | Tool/action fora do success predicate |

## Integração Casa (ordem obrigatória)

```text
1. raciocinio-deliberado  (ANTES: Gate 0, filtro relação, menor ação)
      ↓
2. cot-react-loop         (DURANTE: loop executável com tools)
      ↓
3. meta-lupa              (DEPOIS: AutoLupa, Gate Final, ponto fixo)
```

## Outside-the-Loop Invariant (não negocie)

- **Evaluator/Critic FORA** da superfície mutável do loop
- Budget/permission/sandbox no **runtime**, não no prompt
- Scoring implementation **hidden** from proposer
- Sandbox no nível OS/container
- Exploit detectado = **candidato falhou**, não high score

## Two-Split Acceptance (mental, a cada CRITIC)

| Split | Pergunta |
|---|---|
| **Held-in** | A fraqueza alvo desta iteração foi resolvida? |
| **Held-out** | Nada mais regressou? (o proposer NÃO vê held-out) |

Regra estrita: **neither regresses ∧ at least one strictly improves**  
Se trade-off → **REJEITA** a iteração (REFINE ou STOP).

## Integration (skills relacionadas)

- `raciocinio-deliberado` — filtro pré-ação (Gate 0)
- `meta-lupa` — falsificação pós-execução (AutoLupa, Gate Final)
- `pivete-execution-standards` — protocolo execução, R0-R4, Windows

## Gotchas (experience-derived)

1. **Entrar no loop sem success predicate** → loop infinito ou STOP falso
2. **CRITIC = PASS sem checklist** → falso verde silencioso
3. **Two-split só mental sem held-out real** → trade-off passa batido
4. **ACT simula tool** → observe captura fantasia, não evidência
5. **DECIDE = CONTINUE sem CRITIC PASS** → erro propaga
6. **Max_iter alto sem PONTO_FIXO** → loop zumbi gasta tokens

## Verification Checklist (ao final da missão)

- [ ] Brief escrito com success predicate + non-counting outcomes
- [ ] Cada iteração tem THINK/ACT/OBSERVE/CRITIC/REFINE/DECIDE
- [ ] CRITIC usou checklist completo a cada iteração
- [ ] Two-split aplicado (held-in + held-out mental)
- [ ] Rastro JSONL completo salvo
- [ ] DECIDE final = STOP com evidência OU BLOCK com autorização pendente
- [ ] Entregue para `meta-lupa` se crítico

## Exemplo Mínimo (mental)

```text
BRIEF:
  Def: "fixture" = arquivo teste R0 em workspace
  Success: SHA256 do fixture calculado e gravado em card Kanban
  Non-counting: "rodei o comando", "deu exit 0", "parece ok"
  Failure: hash errado, card errado, tool falhou

ITER 1:
  THINK: preciso sha256sum do fixture + kanban comment
  ACT: terminal(sha256sum fixture) + kanban comment
  OBSERVE: hash=f889..., card=t_ae83ea45 updated
  CRITIC: PASS (held-in: hash certo; held-out: card não corrompido)
  REFINE: NENHUM
  DECIDE: STOP (goal evidenciado)

RESULT: JSONL salvo, meta-lupa valida depois
```

## Scripts / References (estrutura)

```
cot-react-loop/
├── SKILL.md              # este arquivo
├── scripts/
│   └── cot_react_loop.py # executor (invoca tools via terminal/web/file/code)
└── references/
    ├── brief-template.md        # template pseudo-formal
    ├── failure-mode-catalog.md  # failure modes por domínio
    └── claim-provenance.md      # rastro: muratcankoylan + IBM CoT + papers
```

---

## Skill Metadata

**Created**: 2026-08-04
**Author**: Pivete + Hermes profile pivete
**Version**: 1.0.0
**License**: MIT
**Status**: READY_TO_USE

## Goal por cláusulas — TIK-TAK (18/10/2026)

**Objetivo:** não encerrar a missão só porque UMA etapa ficou verde. O executor existente em `scripts/cot_react_loop.py` tem o modo opt-in `goal_clauses`; a autoridade continua com o CHEFE, o executor continua Hermes, e o critério final continua com o avaliador independente do Goal canônico (`scripts/lupa/horn-reuse-fixed-point.mjs`).

**Contrato de entrada em Python:** `CotReactExecutor(max_iter=N).run_loop(brief, steps)`, onde `brief["goal_clauses"]` é uma lista de `{"id": "G01", "expected_stdout_contains": "marcador_observavel"}`. Uma etapa de verificação precisa usar `{"verification_only": true, "verifies": "G01"}` e conter o marcador no `stdout` com execução bem-sucedida. Um `exit_code=0` de tarefa normal não sela uma cláusula. `invalidates: ["G01"]` revoga a prova dependente quando o alvo muda.

**Estados observáveis:** se houver cláusulas faltantes, `decide=CONTINUE` com `pending_clauses`; ao acabar o orçamento, `BLOCKED_INCOMPLETE` com `NEXT_CURSOR`. Quando todas as verificações locais passarem, `FIXED_POINT_CANDIDATE`, **não** `FIXED_POINT` global; ainda exige contraprova independente e receipt. Limitar passos/tempo/custos e não repetir ação sem informação nova.

**Limite CURRENT (PR #1862, draft):** há sete testes Python positivos na VPS sobre uma cópia isolada do HEAD do PR, mas NÃO há instalação nem ativação comprovada no Hermes da Casa. A entrada da CLI `--brief`/`--steps` ainda não carrega os arquivos; não divulgar como funcional. O rastreamento antigo de argumentos/saída exige sanitização antes de uso autônomo com dados reais. O teste do Edge com `oi` e Enter humano não prova automação remota do ChatGPT; a interface web não é um provedor de API. Não enviar mensagens a esta conversa em auto-loop.

**Validação:** `python -m py_compile .agents/skills/hermes/cot-react-loop/scripts/cot_react_loop.py` e `python -m unittest discover -s .agents/skills/hermes/cot-react-loop/scripts -p test_cot_react_loop_goal.py -v` no MESMO SHA; depois testar Hermes autorizado e avaliador independente, sem confundir `SOURCE_COMMITTED` com `RUNTIME_PROVEN`.
