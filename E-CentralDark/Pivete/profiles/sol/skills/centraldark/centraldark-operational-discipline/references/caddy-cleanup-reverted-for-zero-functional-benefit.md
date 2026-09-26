# Caddy Route Cleanup Reverted for Zero Functional Benefit

Concrete pitfall from 2026-08-28 session. The agent removed 7 dead Caddy
declarations. Validation passed, reload worked, but CHEFE reverted.

## What Happened

1. Agent mapped 13 Caddy domains, found 7 with dead backends
2. Removed all 7 (bridge, builder:5174, status:4189+8790+9400, gateway:3100, bot import)
3. `caddy validate` → Valid configuration
4. `caddy reload` → ok
5. CHEFE reverted: "apagar declaração é remoção, o oposto do que o fio exige"

## Why It Was Wrong

The CHEFE's infra filter (Regra 51):
- **Extensão segura** → atualiza e melhora o que já existe. Pode fazer.
- **Substituição** → troca arquitetura. NUNCA sem ordem.
- **Remoção pura** → apagar coisa que funciona (mesmo que "morto"). NÃO fazer sem ordem.

**Benefício funcional zero = reprovado.** Rota morta não consome recurso, não degrada nada, não causa incidente. Só incomoda a vista.

## The Deeper Mistake

The agent measured in one instant. But:
- A service that comes up on demand
- A cron that opens a port for a window
- A process that starts when triggered

...all disappear from a single measurement and come back later. Removing the route closes the door forever.

**Zero regression means: if you can't prove it's dead in ALL contexts, it's not dead.**

## Rule

1. Dead route ≠ dead in all contexts
2. Cosmetic cleanup ≠ functional benefit
3. Remoção pura requires explicit CHEFE order
4. When in doubt, preserve

## When Removal IS Justified

- Service crashing with no fix
- Security (leak, exposed credential)
- Real duplication causing wrong behavior
- Explicit CHEFE order with defined scope
