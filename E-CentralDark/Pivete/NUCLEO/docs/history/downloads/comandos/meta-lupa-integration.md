# MetaLupa Integration Inside Kimetsu Legacy

**Origin:** Session 2026-08-24 — Contract Section 3: "KIMETSU ENVOLVE A EXECUÇÃO"

---

## Principle

MetaLupa is NOT a separate skill running in parallel. It runs **inside** each Kimetsu Respiração, proportional to the risk level of that Respiração.

---

## Risk → MetaLupa Temperature Mapping

| Respiração Context | Risk Level | MetaLupa Temperature | When Applied |
|--------------------|------------|---------------------|--------------|
| Trivial read-only, local fact | R0/R1 | **FRIA** | Prove what happened (SIM/NÃO, antes/depois) |
| Contradiction, drift, duplication, error, uncertain cause | R2 | **MÉDIA** | Locate why happened (hypothesis, variable change, counterproof) |
| Architecture, runtime, security, promotion, scaffold change, Fixed Point | R3/R4 | **QUENTE** | Make finding repeatable (contracts, adversarial review, rollback, authorization) |

---

## Execution Flow Per Respiração

```
RESPIRAÇÃO N
  ↓
INPUT → ESTADO
  ↓
META_LUPA (temperature proportional to risk)
  ↓
AÇÃO
  ↓
OBSERVAÇÃO
  ↓
EVIDÊNCIA
  ↓
CONTRAPROVA
  ↓
DELTA
  ↓
PRÓXIMA RESPIRAÇÃO
```

---

## Fixed Point Gate (Section 4 of Contract)

Before declaring Fixed Point:

```
RESULTADO
  → META_LUPA
  → PROVA CONTRÁRIA
  → REALITY JUDGE
  → AUTOLUPA DO PRÓPRIO VEREDITO
  → RESÍDUO?
      SE RESÍDUO MATERIAL: continuar Respirações
      SE NOVA INFORMAÇÃO: atualizar crença/plano
      SE ZERO RESÍDUO MATERIAL NO DENOMINADOR EXPLÍCITO: FIXED_POINT
```

**Hard Rules:**
- `WRITER != JUDGE`
- `SELF_PROOF != PASS`
- AutoLupa mandatory on own verdict before Fixed Point

---

## MetaLupa Temperatures Applied to Kimetsu Respirações

### FRIA (Default for most Respirações)
- CONCENTRAÇÃO TOTAL (kernel observador) — always active
- TROVÃO (velocidade decisiva, ação curta e provada)
- ÁGUA (caminho bloqueado, flexibilidade)
- VENTO (propagação, blast radius) — when just measuring spread

### MÉDIA (When investigation needed)
- SERPENTE (dependência indireta, dependency tracing)
- FERA (causa desconhecida, descoberta exploratória)
- NÉVOA (informação demais, redução de entropia)
- FLOR (detalhe fino importa, validação de borda)
- INSETO (causa exata, correção cirúrgica)
- AMOR (ajuste ao operador/humano)

### QUENTE (Critical decisions)
- SOL (visão global, arquitetura, meta-orquestração)
- PEDRA (invariantes, safety rails, segurança)
- CHAMAS (persistência evidência, execução multietapa provada)
- LUA (contraprova obrigatória no fechamento)
- **Fixed Point closure** (SOL → LUA → VENTO → PEDRA sequence)

---

## Prohibition: MetaLupa as Bureaucracy

> **Não transformar MetaLupa em burocracia.**

- Trivial tasks: MetaLupa FRIA = lightweight
- Only escalate when material contradiction/drift/duplication/error/uncertain cause
- Fixed Point always requires MetaLupa QUENTE + AutoLupa

---

## Integration with Contract Section 12: "O QUE DEVE MELHORAR NA META-LUPA"

The Kimetsu-MetaLupa integration must provide:

- [ ] Awareness of current Respiração
- [ ] Structured I/O for Fixed Point
- [ ] Receipt interoperable with Hermes
- [ ] Handoff to next Respiração
- [ ] Regression of own conclusion
- [ ] Material reusable learning
- [ ] Continuity between sessions

**Only add if missing in current MetaLupa owner.** Compare first: `FOUND_EXISTING → DO_NOT_DUPLICATE`.

---

## References

- `meta-lupa/SKILL.md` (canonical repo) — three temperatures, AutoLupa, gate
- `centraldark-operational-method/references/architectural-contract-one-system-only.md` — Section 3 & 4
- `fixed-point-sequence.md` — SOL → LUA → VENTO → PEDRA
- `motor-selecao.md` — Respiração selection logic