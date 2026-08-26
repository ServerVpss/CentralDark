# Padrão Canônico de Resolução de Conflitos Dependabot

> Owner: dependabot-conflict-resolver skill. Sem V2/V3.

## Regra (VERMELHO → RESOLVIDO)
```
CONFLITO em package.json / package-lock.json
→ ACEITAR MAIN (base)
→ APLICAR BUMP do PR (typescript ^5.9.3, @tanstack/react-query ^5.102.2, etc)
→ COMMIT + PUSH

CONFLITO em centraldark_master_cycle.py / lupa / docs / .github
→ MANTER MAIN (ours do merge)

SE NÃO DETERMINÍSTICO
→ FAIL_CLOSED (não inventa)
```

## Casos Resolvidos (esta sessão)
- #1193: typescript 5.8.3 → 5.9.3 (manual, padrão aplicado)
- #1198: @tanstack/react-query 5.83.0 → 5.102.2 (script)
- #1197: types/node → 22.20.1 (script)
- #1203: labels canônicas, core conflict mantido main (script)

## 10 Frentes de Difusão
1. scripts/dependabot/resolve-conflicts.sh — execução
2. .github/workflows/dependabot-auto-merge.yml — dispara script
3. .github/dependabot.yml — labels canônicas
4. skill dependabot-conflict-resolver — agente
5. SOUL — menção ao padrão
6. LEIA-ME-IA — boot inclui resolução
7. CENTRALDARK_AI_BOOT.yaml — campo conflict_resolution
8. PR template — aviso de conflito
9. CI gate — drift-guard usa padrão
10. Este doc — caso #1193

## Script Determinístico
```bash
bash scripts/dependabot/resolve-conflicts.sh <PR_NUMBER>
```
Roda no runner self-hosted, resolve, pusha, dispara CI.
