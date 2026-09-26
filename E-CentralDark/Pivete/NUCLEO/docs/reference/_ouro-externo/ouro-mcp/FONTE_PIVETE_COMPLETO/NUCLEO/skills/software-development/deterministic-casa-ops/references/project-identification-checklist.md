# Project Identification Checklist — Evitar Projeto Errado

**Origem:** Sessão 06/08/2026 — Usuário mandou print de erro Turbopack na porta 20128. Agente foi no `recargas-brasil-v2` (Vite na 8080) em vez do OmniRoute (Next.js na 20128).

**Padrão do erro:** Não confirmou **qual projeto** corresponde ao erro/porta antes de agir.

**Checklist obrigatório antes de agir em erro/porta:**

```
☐ QUAL PORTA? (ex: 20128, 8080, 3000, 9119)
☐ QUAL PROJETO USA ESSA PORTA? (ver package.json: dev script)
☐ CONFIRMAR: cd <projeto> && cat package.json | grep '"dev"'
☐ SÓ DEPOIS AGIR
```

**Projetos conhecidos na Casa:**

| Projeto | Path | Dev script | Porta padrão | Tipo |
|---------|------|------------|--------------|------|
| recargas-brasil-v2 | `/c/Users/danda/recargas-brasil-v2/` | `vite` | 8080 | Vite + React |
| OmniRoute | `/e/CentralDark/MOTOR-TESTE/OmniRoute/` | `node scripts/dev/run-next.mjs dev` | 20128 | Next.js + Turbopack |
| Hermes gateway | profile pivete | interno | 9119 | Hermes Agent |
| CentralDark web | `/e/CentralDark/apps/web/` | (verificar) | (verificar) | Next.js |

**Regra dura:**
```
SEMPRE confirmar projeto pelo package.json ANTES de executar qualquer comando.
NÃO assumir por pasta, nome, ou intuição.
```

**Comando de verificação rápida:**
```bash
# Acha qual projeto usa a porta X
netstat -ano | findstr :<PORTA> | awk '{print $5}'
# Depois: tasklist | findstr <PID> → acha o processo
# Depois: cd <caminho_projeto> && cat package.json | grep '"dev"'
```