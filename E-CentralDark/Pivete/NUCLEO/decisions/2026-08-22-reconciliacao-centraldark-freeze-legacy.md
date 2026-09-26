---
title: "Reconciliação CentralDark — Freeze Legado Elite-Gateway + Tri-Root"
date: 2026-08-22
tags: ["reconciliation", "legacy-freeze", "tri-root", "hermes-casa", "soul"]
status: CRYSTALLIZED
---

# Decisão: Freeze do Runtime Legado (elite-gateway/zendriver/chatgpt.com)

## Contexto
Durante a missão de reconciliação tri-root (C:\CentralDark, E:\CentralDark, C:\Users\danda), foi detectado stack legado em `C:\CentralDark\apps\modulos\elite-gateway\scripts\` usando:
- zendriver (browser automation)
- chatgpt.com (automação de navegação)
- Perfil persistente `/root/.config/zendriver_chatgpt_profile`

## Evidência
- **Zero processos ativos** localmente (ps aux, pm2 list)
- **Zero consumidores** no repo atual (grep não encontra imports/referências)
- **Zero config references** (config.yaml, SOUL.md, manifests não mencionam)
- **Código preservado** no local original (LEGACY_DELETE=DENIED)

## Decisão
```
NO_NEW_USE_ZENDRIVER_CHATGPT_GATEWAY=TRUE
NO_NEW_BROWSER_AUTOMATION_CHATGPT=TRUE
NO_NEW_ELITE_GATEWAY_SESSION=TRUE
STATUS=LEGACY_DISABLED
LEGACY_DELETE=DENIED
```

## Justificativa
O Hermes atual (profile pivete, SOUL HERMES-CASA) opera **independentemente** desse stack. O legado era rota de transporte para IAs externas via browser automation — substituído pela arquitetura nativa Hermes Agent + darkai/arsenal.

## Reversibilidade
Se futuro consumidor legítimo surgir:
1. Remover freeze (autorização CHEFE)
2. Restaurar do local original
3. Testar isoladamente
4. Integrar com gates

---

# Duplicatas Reconciliadas

| Item | Canonical | Quarentenado | Justificativa |
|------|-----------|--------------|---------------|
| `.claude/` (E:/CentralDark) | C:/CentralDark/.claude | E:/_QUARANTINE/.../dot-claude | Não no git, sem consumidores |
| `_MAPA_CASA/` (E:/CentralDark) | C:/CentralDark/_MAPA_CASA | (já não existia) | Índice mestre em C: |

## Divergência Documentada (Não Movida)
**SOUL.md** — Duas versões ativas:
- **Canônico:** `E:\CentralDark\Pivete\SOUL.md` (HERMES-CASA, 09/08)
- **Runtime:** `C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md` (HERMES legacy, 05/08)

**Não movido** porque Hermes runtime lê do UserProfile. Divergência registrada para futura migração unificada.

**config.yaml** — Mesma situação (runtime usa UserProfile com model gpt-5.5/openai-codex vs E: com z-ai/glm-5.2/nous).

---

# Princípios Aplicados
- REUSE_BEFORE_CREATE: Usou quarentena existente, NUCLEO existente
- ONE_SYSTEM_ONLY: Um SOUL canônico, divergência documentada
- NO_RANDOM_MOVE: Só moveu o que passou contraprova
- UNKNOWN != PASS: Não assumiu que legado estava ativo — mediu
- LEGACY != DELETE: Código preservado, apenas congelado

---

# Próximos Passos (Pendências)
1. **Migração SOUL unificada** — quando CHEFE autorizar Hermes Desktop + SOL_SOUL
2. **Verificação VPS** — confirmar se elite-gateway roda na VPS (fora do escopo desta missão)
3. **MCP Status** — descobrir capability real (localhost:9100 não responde)