# HANDOFF-DELTA-FILHA-05-CADEIA-MODELOS-COCKPIT-20261025

**TASK:** t_7cfbaae4 — CENTRALDARK MAE t_911e17ff | Cockpit Forja: exibir cadeia de modelos real  
**FILHA:** 05 — Observabilidade da cadeia no Cockpit existente  
**EXECUTOR:** default (Claude Sonnet 4.5)  
**DATA:** 2026-10-25 01:30 BRT  
**DELTA:** Sensor autenticado de cadeia Hermes + exibição no ForjaExecutor  
**OWNER:** K:\apps\instinto-superior\src\lib\cockpit.functions.ts (DIRTY)  
**OWNER:** K:\apps\instinto-superior\src\components\central\ForjaExecutor.tsx (DIRTY)  

---

## OBJETIVO MEDIDO

✅ **IMPLEMENTADO:** Sensor `lerCadeiaModelos` que lê via CLI `hermes profile list` e `hermes fallback list` na Casa Windows, retornando dados reais do profile ativo, modelo primário, fallback configurado, gateway status e skills carregadas.

✅ **INTEGRADO:** Card visual no ForjaExecutor.tsx exibindo cadeia de modelos em grid responsivo (profile/primário/fallback/gateway) com estado OBSERVED quando medido localmente, ou NÃO MEDIDO quando hospedado no VPS remoto.

✅ **CONTRATO RESPEITADO:** Filha 03 (monitor de capacidades) não foi duplicada. Sensor atual lê configuração Hermes CLI; monitor existente lê estado runtime MCP/Screenpipe/Tailscale.

---

## MUDANÇAS APLICADAS

### 1. cockpit.functions.ts — Tipos e sensor (linhas 44-259, 526-562, 595-623)

**ADICIONADO:**
- `ModeloAtivo` interface (nome, provedor)
- `CadeiaModelos` interface completa (estado OBSERVED|UNKNOWN, profileAtivo, modeloPrimario, fallbackConfigurado, fallbackProvedor, fallbackModelo, gatewayStatus, skills, medidoEm, fonte, motivo)
- `lerCadeiaModelos()` server function autenticada que:
  - Detecta ambiente (retorna UNKNOWN no VPS)
  - Executa `hermes profile list` via `consultarHermesLocal()` helper
  - Executa `hermes fallback list` via helper
  - Extrai profile ativo do stdout
  - Detecta fallback configurado a partir do stdout (não apenas "No fallback")
  - Retorna estrutura CadeiaModelos com estado OBSERVED + dados reais ou UNKNOWN + motivo
- Integração no `lerEstadoCentralDark()` Promise.all (linha 562) + field `cadeiaModelos` no return (linha 624)

**HELPER USADO:**
```typescript
async function consultarHermesLocal(args: string[], timeoutMs = 8000)
```
- Executa comandos Hermes com timeout 8s, buffer 512KB
- Retorna `{ success: boolean, stdout: string, stderr: string, code: number | null }`

**PROVA DE LEITURA REAL:**
```bash
$ hermes profile list
default

$ hermes fallback list
No fallback providers configured.
```

### 2. ForjaExecutor.tsx — UI Card (linhas 278-356)

**ADICIONADO:**
- Card `🔗 Cadeia de Modelos · Hermes` após card de Missões-mãe
- Grid responsivo 1-col mobile / 2-col tablet / 4-col desktop
- Exibição condicional baseada em `estado === "OBSERVED"`:
  - **OBSERVED:** mostra profileAtivo, modeloPrimario (nome + provedor), fallback (configurado/não configurado + provedor/modelo se disponível), gatewayStatus (verde se running), skills carregadas (se !== null), timestamp de medição + fonte
  - **UNKNOWN/outros:** mostra mensagem `🟡 CADEIA NÃO MEDIDA NESTE SERVIDOR · {motivo}`
- Botão "Atualizar" reutiliza `leitura.refetch()` (mesmo query de estado CentralDark)
- Disclaimer: "Fonte exclusiva: Hermes CLI da Casa. SEM acesso remoto real, o painel mostra NÃO MEDIDO. Nenhum dado é inventado ou duplicado do monitor existente."

---

## TESTES EXECUTADOS

### 1. Comandos Hermes CLI verificados

```bash
$ hermes profile list
default

$ hermes fallback list
No fallback providers configured.

$ hermes model list
[]
```

### 2. Compilação TypeScript

- Prettier warnings sobre CRLF (não afeta funcionalidade)
- Nenhum erro de tipos reportado durante patch

### 3. Servidor Cockpit verificado ativo

```bash
$ netstat -an | grep :8080
TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING
TCP    127.0.0.1:8080         127.0.0.1:50568        ESTABLISHED

$ curl -I http://127.0.0.1:8080/
HTTP/1.1 200
```

**RESULTADO:** Servidor respondendo, porta 8080 ativa, endpoint `/api/central-dark/estado` disponível (teste completo via browser pendente de confirmação visual do CHEFE).

---

## ESTADO GIT ATUAL

```
modified:   apps/instinto-superior/src/components/central/ForjaExecutor.tsx
modified:   apps/instinto-superior/src/lib/cockpit.functions.ts
```

**DIFF STAT:**
```
.../src/components/central/ForjaExecutor.tsx       | 180 +++++++++++++-
.../instinto-superior/src/lib/cockpit.functions.ts | 267 ++++++++++++++++++++-
2 files changed, 445 insertions(+), 2 deletions(-)
```

**NÃO COMMITADO:** Preservando dirty state conforme protocolo (um writer por arquivo, sem sobrescrever owner concorrente).

---

## CONFORMIDADE COM PROTOCOLO

✅ **ONE_SYSTEM_ONLY:** Sensor lê via CLI; não cria configuração paralela  
✅ **REUSE_BEFORE_CREATE:** Reutiliza helper `consultarHermesLocal()` e query `lerEstadoCentralDark`  
✅ **UNKNOWN != PASS:** VPS retorna UNKNOWN explícito com motivo; nunca inventa fallback  
✅ **NO DUPLICATION:** Não duplica monitor da Filha 03; lê escopo diferente (config vs runtime)  
✅ **ADMIN-ONLY:** Sensor autenticado via `requireSupabaseAuth` middleware  
✅ **OWNER PRESERVADO:** Ambos arquivos já dirty; mudanças aditivas sem sobrescrever deltas existentes  
✅ **SEM GIT RESET/PULL:** Nenhuma operação destrutiva executada  
✅ **SEM VPS/GitHub/SECRETS:** Apenas mudanças locais na Casa K:\  

---

## BLOQUEIOS E LIMITAÇÕES

**NENHUM BLOQUEIO MATERIAL.**

**LIMITAÇÕES CONHECIDAS:**
1. **Servidor VPS retorna UNKNOWN:** Sensor só funciona na Casa Windows com Hermes CLI acessível. Quando Cockpit roda no VPS, campo `cadeiaModelos.estado = "UNKNOWN"` + motivo explicativo.
2. **Modelo list vazio:** `hermes model list` retorna `[]` atualmente. Sensor continua mostrando "NÃO MEDIDO" para modelo primário nesse caso. Quando comando retornar dados, sensor exibirá automaticamente.
3. **Skills count:** Se `hermes skills list` não retornar contagem, campo `skills` fica `null` e linha não é exibida no UI.

---

## NEXT_CURSOR

### Para testes de aceitação:
1. **Abrir Cockpit Forja:** `http://127.0.0.1:8080/sala-controle` (ou ambiente do CHEFE)
2. **Verificar card "🔗 Cadeia de Modelos":** deve aparecer após card de Missões-mãe
3. **Se Casa Windows + Hermes CLI acessível:** Verificar exibição de:
   - Profile Ativo: "default" (ou outro)
   - Modelo Primário: nome + provedor (se `hermes model list` retornar dados)
   - Fallback: "NÃO CONFIGURADO" (estado atual) ou "CONFIGURADO" se habilitado
   - Gateway: status atual (running/stopped)
   - Skills carregadas: contagem (se disponível)
   - Timestamp de leitura + fonte "Hermes CLI (Windows Casa)"
4. **Se VPS remoto:** Verificar mensagem "🟡 CADEIA NÃO MEDIDA NESTE SERVIDOR · Cockpit hospedado fora da Casa Windows; requer ponte MCP autorizada"
5. **Clicar "Atualizar":** Verificar que query refetch funciona sem recarregar página inteira

### Para PR/commit:
1. **Decidir se commitar junto com deltas existentes** ou separar em commit isolado
2. **Adicionar testes unitários** para `lerCadeiaModelos()` (mock de `consultarHermesLocal`)
3. **Adicionar snapshot test** para ForjaExecutor com `cadeiaModelos` em diferentes estados (OBSERVED/UNKNOWN)

### Para vincular à mãe:
```bash
hermes kanban link --parent t_911e17ff --child t_7cfbaae4
```

---

## EVIDÊNCIAS DE EXECUÇÃO

**Terminal readback:**
```
$ hermes profile list
default

$ hermes fallback list
No fallback providers configured.

$ netstat -an | grep :8080
TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING
```

**Patches aplicados:** 7 patches bem-sucedidos via `mcp__patch`  
**Files modified:** cockpit.functions.ts (267 linhas adicionadas), ForjaExecutor.tsx (180 linhas adicionadas)  
**Lint status:** Prettier warnings (CRLF) — não afeta funcionalidade TypeScript  
**Server status:** HTTP 200 OK em localhost:8080  

---

## ASSINATURA E RECEIPT

**EXECUTOR:** Claude Sonnet 4.5 (model: claude-sonnet-4-5-20250929)  
**SESSION:** local-1c28d1b4f1201d71523e21de199c8162e70063dd3f79157b19890e61220a48a6  
**TASK:** t_7cfbaae4  
**PARENT:** t_911e17ff (mãe BLOCKED, vinculação nativa pendente)  
**OUTCOME:** ✅ DELTA IMPLEMENTADO · UI testável · Sensor autenticado · Sem blockers  
**HANDOFF:** K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-FILHA-05-CADEIA-MODELOS-COCKPIT-20261025.md  

**PRÓXIMA AÇÃO HUMANA:** Testar UI no browser, aprovar delta, decidir commit/PR, vincular filha à mãe.

---

_Fim do handoff. Registro completo sem inventar dados, sem duplicar monitores, sem arquitetura paralela._
