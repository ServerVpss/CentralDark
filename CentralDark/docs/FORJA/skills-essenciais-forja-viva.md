# 🔥 Skills Essenciais — Forja Viva Resiliente

**Data**: 2026-10-15 | **Status**: Mapeadas e prontas para expansão | **Arquitetura**: Única (sem v1/v2/v3)

---

## 📋 As 11 Skills Essenciais

### 🔴 Essenciais (CRÍTICAS)

| # | Skill | Função | Local | Sincronização | Fallback |
|---|-------|--------|-------|---|---|
| 1 | `centraldark-boot` | Recuperar estado e iniciar fluxo | main | ✅ CAPABILITY_PROVEN | Casa cache |
| 2 | `centraldark-operational-method` | Preservar intenção, owner, recibos | main | ✅ SKILL_LOADED | VPS local |
| 3 | `skill-synchronization` | Sincronizar skills com Hermes | main | ✅ RUNTIME_MIRRORED | ~/.hermes/skills/ |
| 4 | `centraldark-reuse-runtime` | Reutilizar antes de criar | main | ✅ SKILL_LOADED | Casa local |
| 5 | `main-pinned-runtime-fast-path` | Publicação controlada + faxina 🧹 | main | ✅ MAIN_SYNCED | Manual |
| 6 | `centraldark-esteira-motor` | Coordenar Hermes, runners, deploy | main | ✅ SKILL_LOADED | VPS executor |
| 7 | `centraldark-live-editing-fabric` | Evoluir código continuamente | main | ✅ CAPABILITY_PROVEN | Lovable editor |
| 8 | `vs-code-restore` | Restaurar bancada VS Code | Casa | Local | N/A (Casa) |

### 🟠 Importantes (SUPORTE)

| # | Skill | Função | Local | Estado |
|---|-------|--------|-------|--------|
| 9 | `centraldark-autonomous-conflict-costura` | Resolver conflitos Git com critério | main | SKILL_LOADED |
| 10 | `centraldark-unified-surface-parity` | Integrar texto, voz, desktop | main | RUNTIME_MIRRORED |
| 11 | `centraldark-vscode-log-bridge` | Telemetria sanitizada VS Code | Casa | LOCAL_ONLY |

---

## 🔄 Estados de Sincronização

```
MAIN_SYNCED
    ↓ (git fetch + verify SHA)
RUNTIME_MIRRORED (em ~/.hermes/skills/)
    ↓ (load em process)
SKILL_LOADED (disponível no Hermes)
    ↓ (execute + verify output)
CAPABILITY_PROVEN (testada em produção)
```

### Como expandir (sem duplicação)

**Não criar rota nova de sincronização:**
- Use `/api/sync-state` (POST) para mover skill entre estados
- Valide transições: MAIN_SYNCED → RUNTIME_MIRRORED → SKILL_LOADED → CAPABILITY_PROVEN

**Não duplicar a skill em casa/vps/main:**
- Uma versão canônica em `main`
- Cópias verificadas por SHA em Casa e VPS
- Reconciliar por delta quando reconectar

---

## 🛡️ Forja Resiliente — Três Situações Operacionais

### 🟢 Situação 1: Casa + VPS online

```
Casa (Windows)  ←→ Hermes (VPS) ←→ Main (GitHub)
    ↓                  ↓                  ↓
  Local         Executor indep.    Source canônico
  cache         + syncronizer
  
Estado: RUNNING:Sincronização distribuída
Comportamento: Atualizar main → sincronizar VPS → atualizar Casa
```

### 🟡 Situação 2: Casa offline, VPS online

```
[Casa OFFLINE]           Hermes (VPS)  ←→ Main (GitHub)
                            ↓
                      Executor continua
                      trabalhos independentes
                      (skills já carregadas)
                      
Estado: RUNNING:Casa desligada, VPS orquestrando
Comportamento: Hermes executa skills em ~/.hermes/skills/
              Registra deltas pendentes para reconciliação
```

### 🟡 Situação 3: Internet indisponível, Casa ligada

```
Casa (Windows)  [OFFLINE]
    ↓
 Local cache
 Skills em ~/.hermes/skills/
 
Estado: OFFLINE:Casa executa localmente
Comportamento: Carregar skills já sincronizadas
              Executar com dependências em cache
              Registrar mudanças para sincronização posterior
```

---

## 📧 Integração Gmail + Conflitos

### Como funciona

1. **GitHub webhook** detecta conflito em PR
2. **Gmail alert** enviado para gerenciador
3. **Conflito Auto-Resolver** (strategy: `ours`) aplica HEAD priority
4. **Sincronização** prossegue sem bloqueio
5. **Recibo** registrado em `/api/sync-state`

### Rotas de API para isso

```javascript
// Resolver conflito via API
POST /api/sync-state
{
  "action": "resolve_conflict",
  "conflictId": "CONF-001",
  "resolution": "ours"
}

// Atualizar status de locação
POST /api/sync-state
{
  "action": "update_location_status",
  "location": "casa",
  "newStatus": "offline"
}

// Sincronizar skill para novo estado
POST /api/sync-state
{
  "action": "sync_skill",
  "skillName": "centraldark-boot",
  "targetState": "CAPABILITY_PROVEN"
}
```

---

## 📊 Painel de Revisões Diárias

**Local**: Cockpit (novo: DailyReviewPanel)

Mostra:
- **Estado Anterior vs Atual** (comparação clara)
- **Progressão de Skills** (MAIN_SYNCED → CAPABILITY_PROVEN)
- **Conflitos Resolvidos** (total + resolver via Gmail)
- **Deltas Pendentes** (reconciliar quando reconectar)
- **Forja Resiliente** (qual situação operacional está ativa)

---

## 🔧 Expandindo Sem Duplicação

### ✅ Fazer

- Adicionar skills novas às rotas existentes (`/api/sync-state`)
- Estender DailyReviewPanel com novos campos
- Usar transições de estado validadas
- Sincronizar por SHA (não sobrescrever divergências)

### ❌ Não Fazer

- Criar nova rota de sincronização (use `/api/sync-state`)
- Duplicar skill em v1, v2, v3 (manter canônica)
- Criar novo sistema de conflitos (expandir `centraldark-autonomous-conflict-costura`)
- Deixar scripts soltos (tudo via API)

---

## 🎯 Próximos Passos

1. **Deploy DailyReviewPanel** ao vivo (hoje)
2. **Testar Forja Offline** (desligar Casa, VPS continua)
3. **Executar Reconciliação** (volta Casa, sincronizar deltas)
4. **Monitorar Gmail Alerts** (conflitos chegam por email)
5. **Seal Stability** (24h de operação → STABLE)

---

## 🔗 Referências

- **API nova**: `/api/sync-state` (GET/POST)
- **Painel novo**: `DailyReviewPanel.tsx`
- **Cockpit integração**: Linha 132 em `CockpitShell.tsx`
- **Resolução conflitos**: `centraldark-autonomous-conflict-costura` (SKILL_LOADED)

---

**👑🪬 Uma Forja. Vários ambientes. Uma linhagem de evidências. 🔧🛠️👁️🔥⚒️🧹**

**SEAL**: `SEALED:FORJA-VIVA-SKILLS-ESSENCIAIS:2026-10-15:ARCHITECTURE_VERIFIED`
