---
name: kimetsu-legacy-operational-method
version: "2.2.0"
description: "Use when #ACORDAR, !CALIBRAR. Combo única 17 respirações + Fixed Point + auto-cura."
trigger: "operational mission, #ACORDAR, !CALIBRAR, evidence-based execution required"
author: "Hermes Agent"
license: "MIT"
tags: ["operational-method", "kimetsu-legacy", "fixed-point", "centraldark", "17-respiracoes"]
category: "operational-method"
metadata:
  hermes:
    tags: ["operational-method", "kimetsu-legacy", "fixed-point", "centraldark", "17-respiracoes"]
    related_skills: ["centraldark-operational-method", "t0-integral-mapeamento", "meta-lupa"]
phases: "MEASURE → DIAGNOSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT"
runtime_checks:
  - manifest_declared
  - lockfile_present
  - installed_present
  - binary_resolves
  - version_matches
  - build_passes
  - invariant_check
  - breathing_selection_valid
  - fixed_point_evaluation
  - counterproof_passed
  - evidence_collected
  - writer_scope_verified
  - no_secret_leakage
  - rollback_ready
failure_signature: "KIMETSU_LEGACY_OPERATIONAL_METHOD_EXECUTION_v1"
remediation_escalation: "override_flags > single_pkg > config_fix > rebuild > regen > nuclear"
provenance:
  sources:
    - "operational-method/kimetsu-legacy-operational-method/SKILL.md|sha256:PENDING_CREATION"
    - "operational-method/kimetsu-legacy-operational-method/references/fixed-point.md|sha256:c945c1e916137281ed8828a764d1550d101873fe9696bee23f9a2ca183c7f4e9"
    - "operational-method/kimetsu-legacy-operational-method/references/motor-selecao.md|sha256:2cd75ec8ffd09a3ceda25daf8d42edd727de55b015a3c07d950c4ead00e82dfa"
    - "operational-method/kimetsu-legacy-operational-method/references/respiracoes.md|sha256:3721c2808b098158121873de30fb9cac651ac4031dbabdb85da400b33f32b6f5"
    - "operational-method/kimetsu-legacy-operational-method/references/contrato-prova.md|sha256:3cfac1520519d4b9d18c596cf23035c8b302bd273770a736188131a507e63cc0"
    - "operational-method/kimetsu-legacy-operational-method/references/fixed-point-sequence.md|sha256:90cd216a3879806dc187e3a3e7c8012da780222eb90907c33d08862c05445f34"
    - "operational-method/kimetsu-legacy-operational-method/references/skip-justificado.md|sha256:35b4682f4dec8598936ad14a88e118a487263522cd558d79f56ef59ef25b683b"
    - "operational-method/kimetsu-legacy-operational-method/references/proibicoes.md|sha256:2997cb86cd95df8f088ff50f36a218883bd2d6a272118067cf4fa4a34fb305d4"
    - "operational-method/kimetsu-legacy-operational-method/references/meta-lupa-integration.md|sha256:c7d0083e9ae0ea46ce311e3002350080e1179f6115467af3c7770c313d74d684"
  tests:
    - "validate_all_skills.py|sha256:PENDING_EXECUTION"
    - "skill_gold_validator.py|sha256:PENDING_EXECUTION"
  receipts:
    - "centraldark.runtime.receipt.v1|sha256:PENDING_GENERATION"
counterproof: "Clean execution of operational method without flags passes all gold requirements"
fixed_point_contribution: "Resolves phase denominators: governance, github_dictionary, delta_method, history_preservation, source_of_truth"
mantra: "MINERAR UMA VEZ, CRISTALIZAR UMA VEZ, REUTILIZAR N VEZES. NUNCA ASSUMIR: DECLARED=INSTALLED, LOCKED=INSTALLED, INSTALLED=WORKING, BUILD_STARTED=BUILD_PASS. PERFIL=ADAPTADOR NUNCA CÓPIA. MEASURE→DIAGNOSE→MINIMAL→RETEST→COUNTERPROOF→RECEIPT."
three_planes:
  KNOWLEDGE:
    - failure_signatures: ["KIMETSU_LEGACY_OPERATIONAL_METHOD_EXECUTION_v1"]
    - compat_matrix: "14 matrices × 17 respirações"
    - remediation_procedures: "override_flags > single_pkg > config_fix > rebuild > regen > nuclear"
    - local_first_retrieval: "crystals in references/"
  EXECUTION:
    - runtime_measurement: "Concentração Total kernel (pre/post every Respiração)"
    - reality_judge_validation: "LUA contraprova + Fixed Point 5-condition closure"
    - ecosystem_post_conditions: "hermes: validate_all_skills.py && skill_gold_validator.py"
  CONFIG_ORIGIN:
    - config_source_tracking: "profile=pivete, skill_dir=operational-method/kimetsu-legacy-operational-method"
    - fix_at_right_layer: "skill frontmatter > references/ > centraldark-operational-method"
three_dimensions:
  DEPENDÊNCIA:
    definition: "What runtime/project requires"
    reopen_trigger: "manifest/lockfile change, skill manifest update, reference file change"
  DECADÊNCIA:
    definition: "Knowledge/compat became stale"
    reopen_trigger: "version change, test failure, source change, counterproof failure, Fixed Point regression"
  CADÊNCIA:
    definition: "When to revalidate"
    reopen_trigger: "event-driven: skill_create, skill_update, daily_review, mission_bootstrap, counterproof_failure"
---

# Kimetsu Legacy Operational Method — Motor Operacional CentralDark

## Overview

O **Kimetsu Legacy Operational Method** é o motor operacional oficial da CentralDark. Substitui e expande o método anterior (`centraldark-operational-method`). Modela a operação como uma **árvore de 17 Respirações** (políticas operacionais), orquestradas por um **Motor de Seleção** determinístico e fechadas por **Fixed Point** com 5 condições obrigatórias.

Três pilares sustentam o método:

| Pilar | Papel |
|-------|-------|
| **Concentração Total** | Kernel observador contínuo — sempre ativo, pré e pós toda Respiração |
| **Sol** | Meta-orquestrador raiz — visão global e coordenação |
| **Lua** | Espelho adversarial — contraprova obrigatória no fechamento |

## When to Use

- **Use when** iniciar qualquer missão operacional na CentralDark (BOOT: `KIMETSU_LEGACY_FIXED_POINT`)
- **Use when** precisar de execução estruturada com evidência, contraprova e fechamento verificável
- **Use when** o agente Hermes deve seguir disciplina de Respirações com formato de fala padronizado
- **Don't use for** tarefas triviais de um passo que não exigem orquestração, evidência ou Fixed Point
- **Don't recreate** `kimetsu-legacy-breathing`, `kimetsu-legacy-complete`, `auto-cura-kimetsu-fixedpoint` — absorvidas aqui em 2026-09-03 (ONE_SYSTEM_ONLY)

---

## 1. Arquitetura das 14 Matrizes de Respiração

### Tabela Mestra (14 Matrizes Cristalizadas 2026-08-23)

| # | Matriz | Essência | Derivação | Tipo |
|---|--------|----------|-----------|------|
| 0 | **CONCENTRAÇÃO TOTAL** | Kernel observador contínuo | — | Núcleo Global |
| 1 | **SOL** | Meta-orquestrador / Raiz | — | Raiz |
| 2 | **ÁGUA** | Flexibilidade / Adaptação / Contorno | — | Fundamento |
| 3 | **CHAMAS** | Persistência orientada por evidência / Sustentação | — | Fundamento |
| 4 | **TROVÃO** | Velocidade decisiva / Impacto cirúrgico | — | Fundamento |
| 5 | **VENTO** | Propagação / Blast radius / Propagação | — | Fundamento |
| 6 | **PEDRA** | Invariantes / Safety rails | — | Fundamento |
| 7 | **LUA** | Espelho adversarial / Contraprova obrigatória | Derivação paralela do Sol | Meta |
| 8 | **FLOR** | Precisão estética / Interceptação de fluxos secundários | (Água) | Especialização |
| 9 | **SERPENTE** | Rota não-linear / Dependency tracing | (Água) | Especialização |
| 10 | **INSETO** | Correção cirúrgica de baixo impacto | (Água → Flor) | Especialização |
| 11 | **AMOR** | Coesão de interfaces / Ajuste ao operador | (Chamas) | Especialização |
| 12 | **SOM** | Ritmo e sequenciamento / Timing / Telemetria | (Trovão) | Especialização |
| 13 | **NÉVOA** | Redução de entropia cognitiva / Clareza | (Vento) | Especialização |
| 14 | **FERA** | Descoberta exploratória / Mapeamento anomalias | (Vento) | Especialização |

**Total: 14 Matrizes** = 1 Núcleo + 1 Raiz + 5 Fundamentos + 1 Meta + 6 Especializações

### Árvore Completa de Derivação

```
CONCENTRAÇÃO TOTAL (Núcleo Global / Kernel Contínuo)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade / Adaptação)
│  │  ├─ FLOR (Alta Resolução / Validação de Borda)
│  │  │  └─ INSETO (Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear / Dependency Tracing)
│  ├─ CHAMAS (Persistência Orientada por Evidência)
│  │  └─ AMOR (Coesão / Ajuste ao Operador)
│  ├─ TROVÃO (Velocidade Decisiva / Impacto Cirúrgico)
│  │  └─ SOM (Ritmo / Sequenciamento / Telemetria)
│  ├─ VENTO (Propagação / Blast Radius)
│  │  ├─ NÉVOA (Redução de Ruído / Entropia Cognitiva)
│  │  └─ FERA (Descoberta Exploratória / Mapeamento Anomalias)
│  └─ PEDRA (Invariantes / Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova Obrigatória) — Derivação Paralela do Sol
```

---

## 2. Runtime Global — Concentração Total

**Sempre ativo.** Kernel observador que precede e sucede toda Respiração executada.

### Pré-Ação (Executar antes de qualquer Respiração)

```text
READ_INTENT()
MEASURE_STATE()
IDENTIFY_TARGET()
IDENTIFY_WRITER()
IDENTIFY_CONSTRAINTS()
SEPARATE_KNOWN_UNKNOWN()
```

### Pós-Ação (Executar após toda Respiração)

```text
MEASURE_AGAIN()
COMPARE_BEFORE_AFTER()
CLASSIFY_RESULT()
SELECT_NEXT_BREATH()
```

### Invariantes do Kernel (Nunca Violadas)

```text
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
ASSUMPTION != FACT
```

---

## 3. Motor de Seleção

Função determinística que escolhe a próxima Respiração baseada no estado observado.

```text
FUNCTION SELECT_BREATH(state):
ALWAYS:
  CONCENTRATION_TOTAL

IF visão_global_necessária:           RETURN SOL
IF invariantes_ou_risco:              RETURN PEDRA
IF causa_desconhecida:                RETURN FERA
IF informação_demais:                 RETURN NÉVOA
IF dependência_indireta:              RETURN SERPENTE
IF propagação_importa:                RETURN VENTO
IF detalhe_fino_importa:              RETURN FLOR
IF causa_exata:                       RETURN INSETO
IF caminho_bloqueado:                 RETURN ÁGUA
IF sequência_temporal:                RETURN SOM
IF persistência_evidência:            RETURN CHAMAS
IF execução_multietapa_provada:       RETURN CHAMAS
IF ajuste_operador:                   RETURN AMOR
IF ajuste_humano:                     RETURN AMOR
IF ação_curta_e_provada:              RETURN TROVÃO
IF velocidade_decisiva:               RETURN TROVÃO
IF contraprova_necessária:            RETURN LUA

BEFORE_CLOSE:
  VERIFY_DECISION_INVARIANCE
  VERIFY_WRITER_SCOPE
  VERIFY_NO_SECRET_LEAKAGE
  VERIFY_ROLLBACK_READY
  VERIFY_EVIDENCE_COLLECTED
  VERIFY_LUA_CONTRAPROVA_PASSED
```

---

### 4. Fixed Point — Fechamento Obrigatório

### 5 Condições de Fechamento (TODAS Obrigatórias)

```text
IF objective_closed
   AND counterproof_survived
   AND applicable_invariants_hold
   AND no_material_unknown:
    FIXED_POINT=TRUE
ELSE:
    FIXED_POINT=FALSE
```

### Contrato de Escopo do Fixed Point (CRÍTICO)

```text
MISSION_FIXED_POINT
!=
LEARNING_STOP
```

**O Fixed Point encerra SOMENTE o loop ativo da missão/escopo material que atingiu estabilidade comprovada. NÃO desativa:**
- Captura futura de evidência
- Learning triggers
- Pattern discovery
- Memory delta
- Knowledge compilation
- Metacognição
- Melhoria futura da MetaLupa
- Revalidação quando o estado mudar

**Após FIXED_POINT:**
→ Gerar receipt
→ Colher somente delta novo
→ Registrar candidato de aprendizado
→ Não reabrir a missão sem novo evento/material
→ Próxima execução consome o aprendizado provado

### Sequência de Fechamento (Fixed Point Sequence)

| Etapa | Respiração | Verificação |
|-------|------------|-------------|
| 1 | **SOL** | Objetivo original atingido? |
| 2 | **LUA** | Contraprova sobreviveu? |
| 3 | **VENTO** | Efeitos propagados verificados? |
| 4 | **PEDRA** | Invariantes preservadas? |

**Todas as 5 condições devem ser TRUE para `FIXED_POINT=TRUE`.**  
Nota: A 5ª condição (`no_material_unknown`) é verificada transversalmente pelo Kernel Concentração Total nas etapas 1-4.

---

## 5. Contrato de Prova

### Registro Obrigatório por Respiração Executada

Todo ciclo de Respiração deve produzir este registro completo:

```text
BREATH=<nome_da_respiração>
VERSE=<verso_da_respiração>
TRIGGER=<condição_que_disparou>
ACTION=<ação_concreta_executada>
OBSERVATION=<resultado_observável>
EVIDENCE=<evidência_tangível_coletada>
VERDICT=<PASS|FAIL|UNKNOWN|BLOCKED|SKIP_JUSTIFICADO>
NEXT_BREATH=<próxima_respiração_ou_FIXED_POINT>
```

### Vereditos Permitidos

| Veredito | Quando Usar |
|----------|-------------|
| `PASS` | Respiração executada com sucesso, evidência coletada, objetivo da Respiração atingido |
| `FAIL` | Respiração executada mas objetivo não atingido, evidência mostra falha |
| `UNKNOWN` | Estado indeterminado — **nunca** mascarar como PASS |
| `BLOCKED` | Respiração não pôde ser executada (dependência, permissão, recurso) |
| `SKIP_JUSTIFICADO` | Respiração intencionalmente não executada com razão explícita |

> **Regra de Ouro:** Nunca usar `PASS` para técnica não executada. Use `SKIP_JUSTIFICADO` com razão explícita.

---

## 6. Skip Justificado

Quando uma Respiração da árvore não precisa ser executada, registrar explicitamente:

```text
BREATH=FLOR
STATUS=SKIP_JUSTIFICADO
REASON="Nenhuma análise de detalhe altera a decisão atual — FLOR não acrescenta evidência nova."
```

**Critérios para Skip Justificado:**
- A Respiração não altera o estado de conhecimento relevante
- Evidência suficiente já existe de Respirações anteriores
- Executar adicionaria latência sem ganho de prova

---

## 7. Formato de Fala do Hermes

Padronização obrigatória para toda comunicação operacional.

### Antes da Execução (Anúncio)

```text
RESPIRAÇÃO DA <NOME>
VERSO:
<verso da respiração — marcador de mudança real de política>
TRIGGER:
<condição que disparou esta Respiração>
EXECUÇÃO:
<ação concreta que Hermes realmente fará agora>
```

### Após a Execução (Registro)

```text
EVIDÊNCIA:
<resultado observável — mensurável, verificável>
VEREDITO:
PASS | FAIL | UNKNOWN | BLOCKED | SKIP_JUSTIFICADO
TRANSIÇÃO:
<RESPIRAÇÃO_ATUAL> → <PRÓXIMA_RESPIRAÇÃO>
```

### Regra do Verso (Crítica)

> **Verso = Marcador de mudança real de política operacional.**  
> `Verso ≠ poesia`. Verso = `"A política operacional AGORA mudou para: <Respiração>"`

**Exemplo correto:**
```text
RESPIRAÇÃO DA SERPENTE
VERSO:
A política operacional AGORA mudou para: rastreamento não-linear de dependências ocultas.
TRIGGER:
Dependência indireta detectada entre módulo de autenticação e cache de sessão.
EXECUÇÃO:
Executar dependency tracing reverso a partir do ponto de falha no login.
```

---

## 8. Proibições (Hard Constraints)

| # | Proibição | Razão |
|---|-----------|-------|
| 1 | Não despejar nomes de técnicas sem necessidade | Polui evidência, oculta signal |
| 2 | Não usar `PASS` para técnica não executada | Viola Contrato de Prova |
| 3 | Não fechar sem `BEFORE_CLOSE` completo | Fixed Point inválido |
| 4 | Não declarar `FIXED_POINT=TRUE` sem 5 condições satisfeitas | Fecha estado inconsistente |
| 5 | Não executar `LUA` contraprova como opcional | Contraprova é obrigatória no fechamento |
| 6 | Não mascarar `UNKNOWN` como `PASS` | Corrompe base de conhecimento |
| 7 | Não executar mutação sem `WRITER_SCOPE` confirmado | Risco de side effects não autorizados |
| 8 | Não vazar segredos em evidência/logs/output | Segurança operacional |

---

## 9. Referências (Progressive Disclosure)

Detalhes extensivos vivem em arquivos separados — carregar apenas quando necessário.

| Arquivo | Conteúdo |
|---------|----------|
| `references/absorcao-combo-20260903.md` | Receipt 4→1: breathing/complete/auto-cura absorvidas neste owner |
| `references/fixed-point.md` | Lógica completa do Fixed Point, provas formais |
| `references/motor-selecao.md` | Motor de Seleção expandido, casos de borda, decision trees |
| `references/respiracoes.md` | 17 Respirações detalhadas: gatilhos, ações, evidências esperadas, transições |
| `references/contrato-prova.md` | Contrato de Prova completo, templates de registro, exemplos |
| `references/fixed-point-sequence.md` | Sequência de fechamento passo a passo, checklists |
| `references/skip-justificado.md` | Critérios detalhados, anti-patterns, exemplos |
| `references/proibicoes.md` | Lista expandida com cenários, mitigações, exceções documentadas |
| `references/centraldark-ci-reconciliation-notes.md` | CI reconciliation real (bug chain validator/adapter + verificação fresh no MSYS) |
| `references/multi-window-omega-rendezvous.md` | Técnica: reconciliar multi-janela/terminal VS Code em braços T0..TN (scan/register/rendezvous PS1 + registry JSON, estende owner enxame-3ias.sh) |

---

## 10. Integração com CentralDark

### BOOT Sequence

```text
KIMETSU_LEGACY_FIXED_POINT
```

### Mission Type Annotations

```text
#ACORDAR   — Inicializa Concentração Total, carrega árvore de Respirações
!CALIBRAR  — Executa Motor de Seleção inicial, define primeira Respiração alvo
```

### Calibração Obrigatória ao Método Atual do Repositório (Regra CentralDark)

**SEMPRE** antes de qualquer #ACORDAR / !CALIBRAR / missão:

1. **MEDIR** o método vigente nos commits/MAIN do repo (ServerVpss/CentralDark): git log, git show origin/main:docs/... , DELTA-CONTINUO.md, trigger-fabric, auréola/cadeado/semantic-green.
2. **PASSAR PORLA** no material em mão (imagens PNG, arquivos em GARIMPO-CHEFE, .docx "plano de cristalização do sistema único", HTMLs de garimpo, deep-research reports).
3. **CONFIRMAR** "MÉTODO DO SEGREDO" / método universal atual (NÃO o antigo "Método Pivete" ou SOUL legado). Pivete é papel operacional (HERMES-CASA), NÃO governa Obsidian/repo — método é o da main/commits.
4. **REPORTAR** calibração ("Volta aqui antes de começar calibrado de verdade") com evidência do método encontrado.
5. Só então seguir o escopo da missão com o método atual (PEGATUDO, costura, Fable Loop, Meta Lupa, 17 respirações).

**Pitfall:** Assumir método Pivete/SOUL antigo sem calibrar nos commits/main → viola intenção do CHEFE, produz trabalho inválido. Sempre "o material está na mão porém não pode seguir sem antes confirma método segredo jeito do segredo".

**Exemplo de anúncio:**
RESPIRAÇÃO DA PEDRA
VERSO: A política operacional AGORA mudou para: calibrar exclusivamente ao método atual da main/commits antes de qualquer ação.
TRIGGER: #ACORDAR plano de cristalização + material GARIMPO-CHEFE + instrução explícita de calibração ao método do segredo.
EXECUÇÃO: Medir commits, olhar imagens/arquivos, confirmar método universal (auréola + cadeado + semantic green + trigger-fabric), reportar antes de prosseguir.

### Hermes CLI Integration

```bash
# Carregar skill no profile pivete
hermes --profile pivete skills load kimetsu-legacy-operational-method

# Verificar skill carregada
hermes --profile pivete skills list | grep kimetsu

# Executar com método ativo
hermes --profile pivete run --mission "#ACORDAR !CALIBRAR"
```

---

## 11. Common Pitfalls

| # | Pitfall | Fix |
|---|---------|-----|
| 1 | Pular Concentração Total pré-ação | **Sempre** executar `READ_INTENT()` → `SEPARATE_KNOWN_UNKNOWN()` antes de qualquer Respiração |
| 2 | Declarar `PASS` sem evidência tangível | Exigir `EVIDENCE` mensurável no registro; `PASS` sem evidence = `FAIL` |
| 3 | Esquecer `LUA` no fechamento | `BEFORE_CLOSE` inclui `VERIFY_LUA_CONTRAPROVA_PASSED` — tornar step obrigatório no checklist |
| 4 | `SKIP_JUSTIFICADO` sem razão explícita | Template exige `REASON="..."` — rejeitar registros vazios |
| 5 | Verso genérico/poético | Verso deve declarar mudança de política: `"A política operacional AGORA mudou para: X"` |
| 6 | Motor de Seleção ignora `PEDRA` em risco | Regra `IF invariantes_ou_risco: RETURN PEDRA` tem prioridade alta — não sobrescrever |
| 7 | Fixed Point com `UNKNOWN` material | Kernel `SEPARATE_KNOWN_UNKNOWN()` deve rodar antes do fechamento |
| 8 | Vazar `WRITER_SCOPE` em evidência | `BEFORE_CLOSE` inclui `VERIFY_NO_SECRET_LEAKAGE` — sanitizar antes de logar |
| 9 | Repetir pedido de execução quando a direção já foi dada | Se a intenção, o escopo e a permissão já estão claros na conversa (instrução anterior, ação proposta e aprovada, comando direto), **não repita o pedido — execute**. Não misture prudência operacional com "perguntar de novo o que já foi dito". Quando em dúvida sobre se a permissão se aplica ao subpasso atual, avance ao menor movimento eficaz compatível e registre o que fez; não usar o atraso com nova pergunta genérica. |
| 10 | Devolver tutorial em vez de executar | Quando o humano diz "VOCÊ configura/mede/testa/corrige, não me devolva tutorial", **execute a tarefa até FIXED_POINT** (ou fronteira humana real). Criar os arquivos, rodar os testes, fazer a contraprova, gravar o receipt. NÃO terminar com "agora você roda estes comandos" — esse é o trabalho do agente. Exceção: R4 (VPS/prod/destructive) sem ordem continua bloqueado (HUMAN_FRONTIER). |
| 11 | Loop !RECONCILIAR sem progresso | Comando "#ACORDAR → !RECONCILIAR ... continua → só volta ao humano se surgir fronteira real" é autorização de **execução contínua** (R2). Avance de frente em mutação autorizada; pare SÓ em fronteira real (HUMAN_FRONTIER, bloqueio material, contraprova falha, R4 sem ordem). Não re-pergunte "confirma?" a cada subpasso nem devolva tutorial. |
| 12 | Declarar FIXED_POINT e continuar inventando trabalho | Depois das 4 condições TRUE + receipt, **STOP**. Prompt de continuação sem evento novo (skill recriada, dir fantasma, conteúdo material) não é autorização para mutação extra. |
| 13 | Absorb sem varrer gold tables | Deletar duplicatas ≠ merge fechado. Depois do absorb: dedup do corpo do owner; grep outras skills por *linha viva* do nome morto; dirs fantasma = 0. `skill_manage patch` exige `old_string`. |
| 14 | Declarar abandonado/consolidado sem verificação completa | Medir remoto (`gh pr`, `git branch -r`), local (`git worktree list --porcelain`, `git reflog`), filesystem (`ls`, `cat .git/worktrees/<name>/gitdir`) e estado do dado antes de classificar. Nunca assumir por nome ou lock. |
| 15 | Perder delta por troca de branch no meio da missão | Antes de continuar: verificar se `git log --oneline HEAD | grep <meu_commit>` contém seu delta; se não, localizar em outro branch via `git branch -a --contains <sha>`; checkout ou cherry-pick; nunca reiniciar do zero. |

---

## 12. Verification Checklist

### Por Respiração Executada
- [ ] Concentração Total pré-ação executada (6 steps)
- [ ] Motor de Seleção consultado para escolher Respiração
- [ ] Anúncio no formato de fala: `RESPIRAÇÃO DA X` + `VERSO` + `TRIGGER` + `EXECUÇÃO`
- [ ] Ação concreta executada
- [ ] Concentração Total pós-ação executada (4 steps)
- [ ] Registro completo: `BREATH`, `VERSE`, `TRIGGER`, `ACTION`, `OBSERVATION`, `EVIDENCE`, `VERDICT`, `NEXT_BREATH`
- [ ] Veredito válido (`PASS`/`FAIL`/`UNKNOWN`/`BLOCKED`/`SKIP_JUSTIFICADO`)
- [ ] Se `SKIP_JUSTIFICADO`: `REASON` explícita e não-vazia

### No Fechamento (Fixed Point)
- [ ] Etapa 1 SOL: Objetivo original atingido → evidência
- [ ] Etapa 2 LUA: Contraprova executada e sobreviveu → registro
- [ ] Etapa 3 VENTO: Efeitos propagados verificados → evidência
- [ ] Etapa 4 PEDRA: Invariantes preservadas → checklist
- [ ] Condição 5: `no_material_unknown` = TRUE (Kernel confirmado)
- [ ] `BEFORE_CLOSE` completo: 6 verificações todas PASS
- [ ] `FIXED_POINT=TRUE` declarado apenas se todas 5 condições TRUE
- [ ] Quando FIXED_POINT=TRUE, fornecer confirmação explícita ao usuário (ex: "✅ FIXED_POINT=INGATILHADO! As 17 respirações foram processadas e o ponto fixo foi atingido.")

### Integração Hermes
- [ ] Skill carregada no profile correto (`pivete`)
- [ ] BOOT sequence `KIMETSU_LEGACY_FIXED_POINT` executada
- [ ] Mission annotations `#ACORDAR !CALIBRAR` processadas
- [ ] Formato de fala respeitado em toda saída operacional

---

## 13. Histórico de Evolução

| Data | Versão | Mudança |
|------|--------|---------|
| 2026-08-22 | 1.0 | Criação inicial — arquitetura Kimetsu Legacy completa (17 Respirações, Motor de Seleção, Fixed Point, Contrato de Prova, Skip Justificado, Formato de Fala, Proibições) |
| 2026-08-25 | 2.0 | Cristalização gold standard: frontmatter completo, estrutura peer-matched, progressive disclosure em references/, pitfalls, verification checklist, integração Hermes CLI |
| 2026-09-03 | 2.2.0 | ONE_SYSTEM_ONLY: absorveu e deletou kimetsu-legacy-breathing, kimetsu-legacy-complete, auto-cura-kimetsu-fixedpoint. Owner único. Deduplicou calibração e pitfall 9. |

---

**BOOT:** `KIMETSU_LEGACY_FIXED_POINT`  
"**Status:** `FIXED_POINT_DA_ARQUITETURA=TRUE` | `FIXED_POINT_DA_INTEGRAÇÃO=TRUE` (skill gold standard carregada e validada)

---

## 14. Delivery & Runtime Environment Pitfalls

Estes são **quebras de canal/runtime** observadas nesta sessão — não técnicas de Método, mas **sinais de falha** que devem ser tratados como `BLOCKED` ou `UNKNOWN` com a causa explícita, não como `FAIL` do Método.

### 14.1 Áudio/voz no Telegram pode não entregar

Nesta sessão, o áudio gerado por `text_to_speech` não foi ouvido pelo usuário apesar de ter sido gerado com sucesso. Isso é um **breakpoint de entrega de canal**, não um erro do áudio.

**Conduta quando a voz \"não chega\":**
- Não insistir na mesma entrega (áudio repetido sem confirmação)
- Oferecer alternativa textual imediatamente
- Se o usuário confirmar que a plataforma não está tocando, registrar como `BLOCKED: delivery_channel_unavailable` e seguir no texto

### 14.2 `vision_analyze` pode retornar descrição genérica/incompleta em imagens

Nesta sessão, uma imagem enviada pelo usuário recebeu uma descrição genérica que não correspondia ao que o usuário esperava.

**Conduta:**
- Tentar uma segunda chamada com o caminho completo antes de decidir que a imagem é inacessível
- Se a segunda falhar, **não inventar conteúdo da imagem** — pedir ao usuário que confirme o que está mostrando

### 14.3 Git Bash / MSYS bash: cuidado com comandos de ambiente Windows

No runtime deste host, o terminal é MSYS bash. Comandos idiomáticos do Windows (`Get-Content`, `find /c/...`, `reg query`, `wmic` com certas sintaxes) podem falhar ou comportar-se de forma inesperada.

**Em vez de:**
```bash
Get-Content \"$env:APPDATA\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt\"
find /c/Users/danda -type f ...
reg query \"HKCU\\...\"
```

**Preferir:**
```bash
cat \"$HOME/AppData/...\"          # caminho POSIX com barra
# ou
write_file + terminal para leitura onde o bash falha
```

Quando um comando falhar com \"command not found\" ou comportamento estranho em MSYS, testar a hipótese **ambiente** antes de concluir que o comando está errado.

### 14.4 Registry/event logs podem timeout em consultas largas

`reg query` e `wevtutil` com escopo amplo podem timeout no ambiente Windows/MSYS. Se uma consulta de diagnóstico timeout, não repetir cegamente — reduzir escopo ou usar `tasklist`/`wmic` com filtro, ou abandonar a linha de investigação se não for crítica para a decisão.

### 14.5 `/tmp` ausente no MSYS — use path estável sob o repo

Neste host o `terminal` roda MSYS bash e `/tmp` está ausente ou é limpo entre comandos (`git show > /tmp/x` somem ou dão MODULE_NOT_FOUND em `node --check`). Escrever artefato temporário em path estável dentro do repo:
```bash
git show origin/<branch>:<path> > E:/CentralDark/Pivete/_tmp_name.mjs
node --check E:/CentralDark/Pivete/_tmp_name.mjs
rm -f E:/CentralDark/Pivete/_tmp_name.mjs
```

### 14.6 `node --test` de adapter com `new URL("../..", import.meta.url).pathname` quebra no Windows

O `ROOT = resolve(new URL("../..", import.meta.url).pathname)` produz `E:\E:\CentralDark\...` no MSYS/Node26 (path duplicado) → `readFileSync` falha com ENOENT em TODOS os adapters — não é erro de conteúdo. `scripts/lupa/agent-core-adapters.test.mjs` (e qualquer teste com esse padrão) SÓ valida de verdade no runner Linux (self-hosted). Não declare PASS/FAIL local nesse teste; dispare `porta-de-entrada` no branch e leia o log do runner.

### 14.7 worktree add em MSYS pode travar em Permission denied / Device busy

Após `git worktree add` + node, `git worktree remove --force` pode falhar (`Permission denied` / `Device or resource busy`, handle do node preso). Limpeza segura:
```bash
git worktree remove --force <path> 2>/dev/null
git worktree prune                                # tira do índice Git
rm -rf <path>                                     # remove dir físico
git worktree list | grep <path> || echo GONE
```
O `git worktree prune` é o passo que importa (tira do índice mesmo se o dir físico ficar órfão).

### 14.8 Verificação fresh é obrigatória antes de PASS em Respiração

Sistema e SOUL cobram evidência tangível da sessão atual. Padrão para verificar patch que vive em branch remoto sem sujar o working tree:
```bash
git show origin/<branch>:<arquivo> > E:/CentralDark/Pivete/_check.mjs
node --check E:/CentralDark/Pivete/_check.mjs && echo SYNTAX_OK
git worktree add -q E:/CentralDark/Pivete/_wt origin/<branch>
cd E:/CentralDark/Pivete/_wt && node <script> 2>&1 | grep <PADRAO_ESPERADO>
# cleanup (ver 14.7)
```
Nunca `VEREDITO=PASS` para técnica não executada nesta sessão. Se só há prova de sessão anterior, registre `UNKNOWN`/`SKIP_JUSTIFICADO` com razão e rode a verificação fresh.