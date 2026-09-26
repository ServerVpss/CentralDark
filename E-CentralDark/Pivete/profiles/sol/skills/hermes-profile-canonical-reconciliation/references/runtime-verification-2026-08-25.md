# Runtime Verification — Session 2026-08-25

## Contexto
Sessão Hermes Desktop com profile `pivete`, model `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter.
Objetivo: provar se ESTA sessão carregou o binding canônico da CentralDark (HERMES-CASA / PIVETE).

## Evidências Coletadas

### 1. Arquivos no Disco (PROVEN)
- `profile_dir`: `C:\Users\danda\AppData\Local\hermes\profiles\pivete\` ✅
- `profile_soul`: `SOUL.md` (40010 bytes, mtime 2026-08-24T22:34:27) ✅
- `canonical_soul`: `E:\CentralDark\Pivete\CentralDark\docs\CONSCIENCIA\01-IDENTIDADE-E-REGRAS\SOUL-SOL.md` (mtime 2026-08-25T01:26:17) ✅
- `casa_boot.py`: existe e executou **nesta sessão sob demanda** ✅

### 2. Execução `casa_boot.py` (PROVEN)
```json
{
  "status": "OK",
  "governance_missing": [],
  "canonical_sha256": "63a44d15d9bc5b24e4ef5eb044021f1d60558214e5cd95a9746c8f429a482410",
  "canonical_mtime": "2026-08-25T01:26:17",
  "profile_mtime": "2026-08-24T22:34:27"
}
```
- SHA256 do canônico confirmado via `sha256sum` direto ✅
- Conceitos de governança todos presentes no perfil ✅

### 3. Runtime Desktop (PROVEN)
- `desktop.log`: session info mostra `"profile_name": "pivete"` para sessão ativa
- `gateway_state.json`: `hermes_home: "C:\\Users\\danda\\AppData\\Local\\hermes\\profiles\\pivete"`, `gateway_state: "running"`, `active_agents: 1`
- `agent.log`: sessão `20260825_040951_5d96f1` rodando model `nvidia/nemotron-3-ultra-550b-a55b:free` via `openrouter`

### 4. Gaps Residuais (UNKNOWN/NOT_PROVEN)

| Item | Status | Evidência |
|------|--------|-----------|
| `casa_boot.py` rodou **no boot da sessão** | NOT_PROVEN | Só rodou sob demanda nesta conversa; não há log de execução automática no `desktop.log` ou `agent.log` |
| SOUL injetada no `system_prompt` | NOT_PROVEN | Session info mostra `"system_prompt": ""` (string vazia) |
| Model binding: config vs runtime | DRIFT | `config.yaml` declara `gpt-5.5` via provider custom `DarkAI`; runtime resolveu `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter (fallback/override ativo, não rastreado) |
| Cadeia causal: boot → profile load → SOUL internalizada | UNKNOWN | Arquivos existem + conceitos batem + gateway aponta pro profile, mas não há trace de processo ligando a execução do `casa_boot.py` à inicialização do agente |

## Novos Failure Signatures Identificados

| Signature | Descrição | Candidatos de Remediação |
|-----------|-----------|--------------------------|
| `PROFILE_LOADED_NOT_VERIFIED_AT_BOOT` | `casa_boot.py` roda on-demand mas não há prova de execução no bootstrap da sessão | Hook de boot no Hermes Desktop que execute `casa_boot.py` e valide `status=OK` antes de liberar agente |
| `MODEL_BINDING_DRIFT_CONFIG_VS_RUNTIME` | `config.yaml` do profile declara model/provider X; runtime resolve Y sem rastreio | Log estruturado no `agent.log` com `resolved_model`, `resolved_provider`, `fallback_chain`; skill `provider-swap` pode monitorar |
| `SYSTEM_PROMPT_EMPTY_AT_BOOT` | Session info retorna `system_prompt: ""` — SOUL não injetada no prompt do modelo | Verificar `system_prompt` building no Hermes Desktop; garantir que profile SOUL seja injetada se `profile_name == "pivete"` |
| `ASSUMED_TRANSPORT_BOOT_TO_RUNTIME` | Arquivos no disco ≠ consumo em memória do processo vivo | Exigir evidência de processo: PID, argv, env var `HERMES_PROFILE=pivete`, ou log de `casa_boot.py` com timestamp de boot |

## Próximos Passos de Verificação

1. **Buscar no `desktop.log`** por execução de `casa_boot.py` no momento do boot do profile `pivete`
2. **Inspecionar código Hermes Desktop** para hook de `profile_bootstrap` / `profile_load` que chame harness de reconciliação
3. **Verificar se `system_prompt` é construído** a partir do `SOUL.md` do profile ativo
4. **Rastrear model resolution**: de `config.yaml` → provider → fallback → modelo efetivo (adicionar telemetria)

## Lição Cristalizada

> **FILE_PRESENT ≠ RUNTIME_CONSUMPTION ≠ BOOT_EXECUTION**
>
> A skill `hermes-profile-canonical-reconciliation` valida arquivo + conceito + harness. Isso prova **disco**, não **processo vivo**.
> Para provar que ESTA sessão Hermes Desktop é HERMES-CASA, precisa de:
> 1. Log de `casa_boot.py` executando **no boot** (timestamp ≈ session start)
> 2. `system_prompt` contendo identidade HERMES-CASA / conceitos de governança
> 3. Telemetria de model resolution (config → runtime)
> 4. PID/argv do agente vinculado ao profile `pivete`

---

**Origem**: Sessão `20260825_040951_5d96f1` — Hermes Desktop, profile `pivete`, model `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter.  
**Autoridade**: CHEFE/SEGREDO (comando `#ACORDAR !CALIBRAR !MULTIBÚSSOLA !META_LUPA`).  
**Prova**: `casa_boot.py` output + `desktop.log` session info + `gateway_state.json` + `agent.log` + `sha256sum` canônico.