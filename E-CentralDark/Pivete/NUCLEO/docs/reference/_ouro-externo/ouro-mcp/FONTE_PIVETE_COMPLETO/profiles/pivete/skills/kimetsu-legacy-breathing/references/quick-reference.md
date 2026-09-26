# Quick Reference — Respirações Kimetsu Legacy

## Formato Padrão de Execução

```
VERSO → CONDIÇÃO → EXECUÇÃO → PROVA → VEREDITO → TRANSIÇÃO
```

## Tabela Rápida

| Respiração | Gatilho | Ação Principal | Prova Mínima |
|------------|---------|----------------|--------------|
| **SOL** | Decisão de roteamento | OBSERVE → CLASSIFY → ROUTE | STATE_CLASSIFIED, BREATH_SELECTED, SELECTION_REASON |
| **ÁGUA** | Bloqueio/mudança | DETECT → PRESERVE → FIND_ALTERNATE → MINIMAL_ADAPT → RETEST | BLOQUEIO, PRESERVADO, ADAPTAÇÃO, RESULTADO |
| **CHAMAS** | Caminho claro, multi-etapas | EXECUTE → TEST → CORRECT_DELTA → REMEASURE → CONTINUE | Cada etapa testada |
| **TROVÃO** | Janela curta | IDENTIFY_WINDOW → STRIKE_ONCE → VERIFY → WITHDRAW | Ação única verificada |
| **VENTO** | Reconhecimento | SCAN → MAP → CORRELATE → REPORT → HOLD | Mapa/relatório |
| **PEDRA** | Hardening/infra | HARDEN → VALIDATE → LOCK → AUDIT | Config imutável auditada |
| **Flor** | Anomalia sutil | Detectar padrão comportamental | Anomalia confirmada |
| **Inseto** | Paralelização | Múltiplos agentes → Correlacionar | Resultado consolidado |
| **Serpente** | Evasão/bypass | Caminho não-linear → Ofuscar → Verificar | Bypass confirmado |
| **Amor** | Remediação | Curar estado → Verificar integridade | Estado restaurado |
| **Som** | Side-channels | Analisar frequência → Detectar ressonância | Ressonância mapeada |
| **Névoa** | Stealth | Ocultar → Verificar indetectabilidade | Sem rastros |
| **Fera** | Time-critical | Heurística → Decidir → Agir | Decisão sob incerteza |
| **LUA** | Autocrítica | ASSUME → REFUTE → FIND_FLAW → CORRECT → REVERIFY | ASSUMPTION, REFUTATION, CORRECTION, NEW_VERDICT |

## Concentração Total (Kernel) — Checklist

**Antes de agir:**
- [ ] READ_INTENT()
- [ ] MEASURE_STATE()
- [ ] IDENTIFY_TARGET()
- [ ] IDENTIFY_WRITER()
- [ ] IDENTIFY_CONSTRAINTS()
- [ ] SEPARATE_KNOWN_UNKNOWN()

**Depois de agir:**
- [ ] MEASURE_AGAIN()
- [ ] COMPARE_BEFORE_AFTER()
- [ ] CLASSIFY_RESULT()
- [ ] SELECT_NEXT_BREATH()

**Invariantes (sempre):**
- [ ] UNKNOWN != PASS
- [ ] ACTION != PROOF
- [ ] HISTORY != CURRENT_STATE
- [ ] ASSUMPTION != FACT

## Fixed Point

```
FIXED_POINT = SUCESSO COM EVIDÊNCIA  OU  BLOQUEIO_COMPROVADO
```

Não para por dúvida. Só para por:
- ✅ Objetivo fechado com evidência
- 🔴 Bloqueio real, material, documentado