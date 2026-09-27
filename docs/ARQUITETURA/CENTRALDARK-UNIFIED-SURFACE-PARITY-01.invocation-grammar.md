# CENTRALDARK_INVOCATION_GRAMMAR_01

**Owner:** CENTRALDARK_UNIFIED_SURFACE_PARITY_01  
**Binding:** `!CENTRALDARK` / `CentralDark` / `#ACORDAR` / `!CALIBRAR`  
**Status:** CONTRACT_FIRST_ENGINE_LATER  
**Escopo:** gramática comum para Texto, Voz, Work e Desktop, sem runtime paralelo.

## 1. Lei curta

```text
MESMA_INTENCAO → MESMO_FUNIL → MESMO_OWNER → MESMA_PROVA
```

O wake word não é autorização para varrer tudo. Ele é a chave para entrar no funil sob demanda e carregar somente o menor conjunto pertinente de owners, cristais, ferramentas e rotas.

```yaml
SOB_DEMANDA: true
SAME_INTENT_PIPELINE: true
REUSE_EXISTING_OWNER_FIRST: true
NO_PARALLEL_VOICE_RUNTIME: true
NO_ALWAYS_LOAD_EVERYTHING: true
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED: true
```

## 2. Wake words válidos

```yaml
wake_word:
  canonical: "!CENTRALDARK"
  accepted:
    - CentralDark
    - centraldark
    - "#ACORDAR"
    - "!CALIBRAR"
    - "!AUTO_GRILL"
    - "!GRILL_ME"
```

Texto e Voz passam pela mesma normalização. A transcrição de voz pode preservar `RAW_TRANSCRIPT`, mas a decisão usa o mesmo `NORMALIZED_INTENT` que o texto.

## 3. Dispatch por verbo

```yaml
verb_dispatch:
  visualize:
    aliases: [visualize, veja, mostra, leia, observe, mede]
    decision: OBSERVE_OR_RENDER
    mutation_allowed: false
    proof_required: evidence_source_or_PLATFORM_UNAVAILABLE
  faca:
    aliases: [faça, faz, executa, corrige, pluga, costura, sobe]
    decision: EXECUTE_IF_AUTHORIZED_SCOPE
    mutation_allowed: true
    proof_required: commit_or_tool_call_or_receipt
  continue:
    aliases: [continue, continua, prossiga, retome]
    decision: RESUME_NEXT_CURSOR
    mutation_allowed: only_if_previous_cursor_authorized
    proof_required: current_head_and_cursor_readback
  cristalize:
    aliases: [cristaliza, registra, sela, receipt, rastro]
    decision: WRITE_TO_EXISTING_OWNER
    mutation_allowed: true
    proof_required: owner_path_and_readback
  contraprova:
    aliases: [contraprova, valida, testa, verifica]
    decision: RUN_OR_DESIGN_COUNTERPROOF
    mutation_allowed: false_unless_fix_is_explicitly_requested
    proof_required: test_result_or_UNKNOWN
```

## 4. Exemplos canônicos

| Entrada do CHEFE | Normalização | Resultado esperado |
|---|---|---|
| `CentralDark visualize o estado do PR-mãe` | `wake_word + visualize + target=PR_MAE` | observa/faz leitura; não muta sem verbo de execução |
| `CentralDark faça essa correção` | `wake_word + faca + target=delta_atual` | procura owner, aplica delta, testa, registra rastro |
| `CentralDark continue` | `wake_word + continue + cursor=latest` | retoma do `NEXT_CURSOR`; não reinicia missão |
| `CentralDark cristaliza isso` | `wake_word + cristalize + material=this` | grava no owner existente; receipt/readback |
| Voz: “Central Dark mede e depois pluga” | `wake_word + mede + pluga` | mede primeiro; só pluga se escopo/autorização ficarem claros |

## 5. Paridade de superfície

```yaml
surface_parity:
  text: SAME_INTENT_PIPELINE
  voice: SAME_INTENT_PIPELINE
  work: SAME_INTENT_PIPELINE
  desktop: SAME_INTENT_PIPELINE
  raw_voice_transcript_preserved: true
  normalized_intent_shared: true
  same_canonical_SESSION_ID: true
  same_ordered_TRACE: true
  same_tool_call_visibility_when_supported: true
  same_usage_tokens_visibility_when_supported: true
  same_receipt_law: true
```

Se Voz não expuser tool calls, sessão, tracing ou usage/tokens, o executor marca a capacidade específica como `PLATFORM_UNAVAILABLE`. Não cria trilha lateral, não simula chamada e não declara PASS.

## 6. Relação com owners existentes

```yaml
owners:
  primary_contract: docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml
  skill: .agents/skills/centraldark-unified-surface-parity/SKILL.md
  static_validator: scripts/trigger-fabric/validate_unified_surface_parity_contract.py
  general_gate: scripts/trigger-fabric/verify_repo_contract.py
  fiscal_trace: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md
```

Este arquivo não é V2. Ele é subcontrato do owner `CENTRALDARK_UNIFIED_SURFACE_PARITY_01` para impedir que a semântica de “CentralDark + verbo” fique dependente de memória de chat.

## 6.1 Família canônica de gatilhos — expansão condicional

```text
👑🪬 !CENTRALDARK
→ 🔗 !># INTERLIGADOS
→ ⭕ !AURÉOLA CANÔNICA
→ 🧿 #ACORDAR
→ 🎛️ !CALIBRAR
→ 🧭 !MULTIBÚSSOLA
→ 🔎 !META_LUPA
→ 🔄 !RECONCILIAR
→ ⚖️ !CONTRAPROVA
→ 🧾 !REGISTRA
→ ⚖️ REALIDADE
```

Esta é a **rota comum** (subconjunto), não a família inteira. A família completa tem dono único e não é copiada aqui, para não envelhecer:

```text
CANONICAL_TRIGGER_FAMILY_OWNER=docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json#trigger_chain
ROUTE_ABOVE_IS_SUBSET_OF_OWNER=true
FAMILY_NOT_DUPLICATED_HERE=true
```

Os elos fora da rota comum (💎 !DELTAÚTIL, 💠 !FIXED_POINT, 🔏 !RASTRO, 🚀 !BOOT, 🔁 !VERTEX_INVERSO, 🐚 !CARACOL e demais) continuam canônicos e entram quando pertinentes; 🔏 !RASTRO é obrigatório em toda escrita declarada ao CHEFE.

Este ciclo é **ordem semântica canônica**, não ritual obrigatório. `CentralDark + verbo + payload` entra por este tecido, mas só materializa os estágios pertinentes à intenção, ao risco, ao owner e à prova exigida.

```text
CANONICAL_CYCLE_IS_CONDITIONAL=true
TRIGGER_FAMILY_IS_NOT_ALWAYS_FULL_EXECUTION=true
NO_SECOND_PARSER=true
VOICE_REUSES_EXISTING_CLASSIFIER=true
INTENT_ROUTER_REUSED=true
REALITY_IS_FINAL_JUDGE=true
```

## 7. Não fazer

```text
NAO_CRIAR_CENTRALDARK_UNIFIED_SURFACE_PARITY_02
NAO_CRIAR_RUNTIME_DE_VOZ_PARALELO
NAO_CARREGAR_TUDO_POR_PADRAO
NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE
NAO_CONFUNDIR_RELATO_COM_PASS
NAO_CHAMAR_PLATAFORMA_INDISPONIVEL_DE_ERRO_DO_OWNER
```

## 8. PASS / UNKNOWN / BLOCKED

```yaml
PASS:
  - gramática estática materializada
  - validador estático exige este subcontrato
UNKNOWN:
  - binding real da superfície Voice nesta conta/sessão
  - se a lateral de Voz expõe tokens/tool calls como Texto
BLOCKED:
  - nenhum bloqueio de documentação nesta etapa
NEXT_CURSOR:
  - Worker/Cloud Code deve reutilizar o voice-semantic-classifier + intent router existentes e expor somente o binding de plataforma ainda ausente; não criar parser/owner novo
```

Verso operacional:

> Ôchí, se a palavra abre a porteira, o verbo escolhe o curral; e a prova conta o gado.
