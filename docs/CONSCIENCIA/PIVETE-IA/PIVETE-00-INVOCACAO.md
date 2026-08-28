---
title: "PIVETE-00 — invocação legado"
status: "HISTORICAL_COMPATIBILITY_REDIRECT"
updated: 2026-08-14
---

# PIVETE-00 · INVOCACAO — compatibilidade

O gatilho `pivete` permanece por compatibilidade do WebUI. Ele **não carrega mais esta pasta inteira** e não cria uma identidade humana chamada Pivete.

## Semântica atual

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = identidade operacional/coordenadora
PIVETE/HERMES = executor, preservação e continuidade
```

## O que o gatilho faz agora

```text
pivete | pivete reload | #ACORDAR
→ chama /pivete/consciencia
→ endpoint carrega ALLOWLIST CANONICA
→ valida authority=SEGREDO/CHEFE
→ injeta contexto atual
```

A allowlist vive em `apps/modulos/elite-gateway/scripts/pivete_routes.py` e aponta para SOUL/AGENTS/porta de entrada/permissões/deploy/ouro atuais.

```text
LOAD_ALL_PIVETE_IA=false
PIVETE_TRIGGER=COMPATIBILITY_ALIAS
UNKNOWN_IS_NOT_PASS=true
```

O conteúdo anterior deste arquivo permanece no histórico Git como proveniência.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
