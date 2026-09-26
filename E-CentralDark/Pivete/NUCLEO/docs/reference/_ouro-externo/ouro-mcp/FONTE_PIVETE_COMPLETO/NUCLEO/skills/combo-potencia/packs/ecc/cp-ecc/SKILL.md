---
name: cp-ecc
description: ECC pack offline (combo-potencia). Router para 281 skills sem poluir índice.
---

# cp-ecc — Everything Claude Code (pacote offline)

ORIGEM_OFICIAL: https://github.com/affaan-m/ECC
VENDOR_LOCAL: C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\ECC
SKILLS_DIR: C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\ECC\skills
TOTAL_SKILLS_NO_PACOTE: 281

## ANTI-BRIGA / ANTI-DELTA
- Skills da Casa com mesmo papel (claude-code, codex, opencode, hermes-agent, meta-lupa, etc.) **continuam canônicas**.
- Este pacote NÃO sobrescreve nomes locais.
- Para usar uma skill ECC pontual: ler o SKILL.md em `SKILLS_DIR/<nome>/SKILL.md` e aplicar só o delta necessário.
- Prefixo mental: `ecc/<nome>`.

## AMIGOS CLAUDE JÁ NA CASA (não brigar)
- autonomous-ai-agents/claude-code
- autonomous-ai-agents/codex
- autonomous-ai-agents/opencode
- autonomous-ai-agents/hermes-agent
- claude-code-security-gate
- (outros claude-* se existirem)

## BOOM
Quando o Pivete disser "boom combo" / "usa combo-potencia":
1. carregar skill `combo-potencia`
2. escolher ferramenta do combo (ecc | superpowers | graphify | skillspector | cc-switch | hermes)
3. se nome colidir com Casa → Casa vence, salvo ordem explícita de override
4. aplicar só o delta da missão (não reescrever stack inteira)

## COMO PEGAR UMA SKILL ECC
```text
path = VENDOR/ECC/skills/<nome>/SKILL.md
ler → extrair procedimento → executar
não copiar 281 skills para o índice global
```

## AMOSTRA DE NOMES NO PACOTE
- accessibility
- agent-architecture-audit
- agent-eval
- agent-harness-construction
- agent-introspection-debugging
- agent-payment-x402
- agent-self-evaluation
- agent-sort
- agentic-engineering
- agentic-os
- ai-first-engineering
- ai-regression-testing
- android-clean-architecture
- angular-developer
- api-connector-builder
- api-design
- architecture-decision-records
- article-writing
- automation-audit-ops
- autonomous-agent-harness
- autonomous-loops
- backend-patterns
- benchmark
- benchmark-methodology
- benchmark-optimization-loop
- blender-motion-state-inspection
- blueprint
- brand-discovery
- brand-voice
- browser-qa
- bun-runtime
- canary-watch
- carrier-relationship-management
- cisco-ios-patterns
- ck
- claude-devfleet
- click-path-audit
- clickhouse-io
- code-tour
- codebase-onboarding
...
