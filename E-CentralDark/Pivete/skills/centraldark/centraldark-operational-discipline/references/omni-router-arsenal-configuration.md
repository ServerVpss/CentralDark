# Omni Router Arsenal Configuration — Session 2026-09-05

## Contexto
Usuário pediu "arsenal inteiro no omni router, tudo que tiver de setar, configurável pra usar no /model". Medição honesta revelou gap grande entre especificação (paste) e realidade.

## Estado Real Medido (2026-09-05)

### Omni Router (porta 8099) — UP
```json
{
  "engines": {
    "nous":        {"configured": true},   // auth.json OK
    "claude-code": {"configured": true},   // binário `claude` no PATH
    "hermes":      {"configured": false},  // precisa HERMES_BASE_URL + HERMES_AUTH_TOKEN
    "google":      {"configured": false},  // precisa GOOGLE_API_KEY
    "xai":         {"configured": false},  // precisa XAI_API_KEY
    "abacus":      {"configured": false},  // TEM KEY mas router não lê
    "openai":      {"configured": false}   // precisa OPENAI_API_KEY
  }
}
```

### Credenciais REAIS Detectadas no Ambiente
| Engine | Credencial | Variável | Status |
|---|---|---|---|
| **Nous** | auth.json (padrão) | — | ✅ OK |
| **Claude Code** | binário `claude` | — | ✅ OK |
| **Abacus** | `s2_f2e92a09046845d7be007f20b0a271d4` | `ABACUS_ROUTELLM_KEY` | 🔧 Tem key, router não configurado |
| **OpenAI** | modelo `zai-org/glm-5.2` setado | `OPENAI_MODEL` | 🔧 Precisa `OPENAI_API_KEY` |
| **Hermes** | paths cua-driver, git-bash | `HERMES_CUA_DRIVER_CMD`, `HERMES_GIT_BASH_PATH` | 🔧 Precisa `HERMES_BASE_URL` + `HERMES_AUTH_TOKEN` |
| **Google / xAI** | — | — | ❌ Sem credencial visível |

### Serviços Faltando (do paste `PERSISTENT_RULESET`)
| Serviço | Porta | Status |
|---|---|---|
| **Hermes** | 8080 | ❌ DOWN |
| **MCP Hub** | 8787/9100 | ❌ DOWN |
| **Screenpipe** | — | ❓ não medido |
| **Bot Server / MultiZap / Zendrive / Obsidian / GraphRAG** | — | ❓ não medido |

## Ação Necessária (Plano Executado Nesta Sessão)

1. **Descobrir Hermes instalado** e subir na 8080
2. **Subir MCP Hub** (scripts/compose existentes)
3. **Criar `.env` do omni router** com TODAS credenciais reais
4. **Reiniciar router** pegando `.env` novo → health mostra all engines configured
5. **Testar cada engine** via `/v1/chat/completions` com prefixo `provider/model`
6. **Montar PM2/ecosystem** para subir tudo junto no boot (regra persistente)

## Lição Operacional (Regra Nova)

> **MEDIDA HONESTA ANTES DE PROMETER ARSENAL**
> 
> Quando o usuário pede "tudo configurado", a primeira ação é **medir o que realmente roda e quais credenciais reais existem** — não assumir que o ambiente já tem tudo. O gap entre especificação (paste) e realidade foi ~80% (15-20% pronto).
> 
> Padrão:
> 1. `curl /health` do router → lista engines configured
> 2. `printenv | grep -iE 'API_KEY|TOKEN|BASE_URL'` → credenciais reais
> 3. `ss -tln` / `netstat` → portas ouvindo
> 4. Reportar gap honesto: "Casa está X% do especificado"
> 5. Só então executar o plano de completar o arsenal

## Comando Persistente (do paste)

```bash
# Trigger curto que carrega regra persistente do motor
!CENTRALDARK #ACORDAR

# Para rebuild completo + reality view
!CENTRALDARK #ACORDAR LOCAL_REBUILD REALITY_VIEW
```

## Arquivos a Criar/Atualizar

- `.env` do omni router (em `apps/modulos/elite-gateway/scripts/` ou cwd do processo)
- `ecosystem.config.cjs` / PM2 para subir: router + Hermes + MCP Hub + Screenpipe
- Health check composto que valida todo o arsenal

## Referência Cruzada

- `centraldark-master-funnel-autonomo` — para autonomia total
- `centraldark-megazord-binding` — para MEGAZORD binding
- `centraldark-vps-operations` — para VPS deployment
- `references/parallel-perception-serialize-mutation.md` — percepção paralela (medir tudo) + mutação serial (configurar router)