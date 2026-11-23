# 👑🪬 RELATÓRIO · SIMULAÇÃO ZENDRIVE COMO PROVIDER / MEGAZORD

Data: 2026-09-17
PR equivalente: `#1549 — CRYSTAL: PERSISTENT OPERATIONAL REGIME + TLC23 SOURCE GATE`
Status: `SOURCE_SIMULATION_CRYSTALLIZED`
Tipo: `ARCHITECTURE_SIMULATION_ONLY`

## Intenção do CHEFE

Simular a arquitetura em que Zendrive/ChatGPT/SOL/Voz funcionam como superfície consultiva de provider/modelo para a CentralDark, enquanto Hermes continua executor/provador.

```text
ZENDRIVE=CHATGPT=PREMIUM=SOL=VOZ=ZORD=MEGAZORD
```

Tradução operacional segura:

```text
CHEFE decide intenção
SOL coordena e reconcilia
Zendrive observa/interage com perfil local autorizado
CentralDark API normaliza como provider alias
Hermes executa, testa e contraprova
Realidade julga
```

## Gate PDF antes da mutação

```text
PDF_GATE_BEFORE_COMMIT_REQUIRED=true
TLC23_READ_BEFORE_MUTATION=true
NO_AFTER_THE_FACT_PDF_PROOF=true
```

Aplicação Horn usada nesta simulação:

```text
SE delta_toca_regime_operacional=true
E gate_pdf_lido_antes=true
E owner_existente=true
E sem_copia_cookie_ou_token=true
ENTÃO source_simulation_allowed=true

SE tentar_copiar_sessao_premium_para_vps=true
ENTÃO fail_closed=true
```

## Owner existente reutilizado

```text
Zendrive local:
apps/modulos/elite-gateway/test-local/run_zendrive_segredo.ps1
apps/modulos/elite-gateway/test-local/zendrive_gateway_bridge.py

Review bridge:
scripts/coderabbit-bridge.mjs

Router/provider:
apps/modulos/elite-gateway/scripts/centraldark_omni_router.py

MCP/runtime:
apps/modulos/mcp/
apps/modulos/HERMES-CORE/
```

## O que passa

```text
PASS: usar Zendrive como worker local na Casa com Chrome/perfil já autenticado.
PASS: expor para Hermes um alias de provider: zendrive-chatgpt-local.
PASS: a VPS chamar a Casa via fila/MCP/Tailscale/Remote quando houver canal vivo.
PASS: transformar resposta em receipt centraldark.zendrive-provider-call.v1.
PASS: Hermes tratar a resposta como conselho/modelo consultivo e reproduzir teste.
PASS: API oficial usar chave em cofre quando provider for OpenAI/API real.
```

## O que não passa

```text
FAIL_CLOSED: copiar cookie/sessão ChatGPT Premium para VPS.
FAIL_CLOSED: fingir que assinatura ChatGPT Plus/Pro vira crédito de API automaticamente.
FAIL_CLOSED: usar histórico premium oculto como memória viva sem export/receipt/autorização.
FAIL_CLOSED: Zendrive aprovar merge ou virar juiz.
FAIL_CLOSED: resposta do modelo virar prova sem execução Hermes.
```

## Simulação de chamada `oi`

### Entrada

```json
{
  "model": "zendrive-chatgpt-local",
  "messages": [
    {"role": "user", "content": "oi"}
  ],
  "context_mode": "centraldark_receipts_only",
  "execution_mode": "simulation",
  "no_cookie_copy": true,
  "no_secret_print": true
}
```

### Roteamento esperado

```text
POST /v1/chat/completions
→ CentralDark provider registry
→ provider_alias=zendrive-chatgpt-local
→ enqueue local worker request
→ Zendrive/Casa responde usando perfil local já autorizado
→ bridge gera receipt v1
→ Hermes recebe conteúdo como advisory/model-output
→ Hermes decide teste/contraprova
→ RESULT_ONLY
```

### Saída esperada

```json
{
  "schema": "centraldark.zendrive-provider-call.v1",
  "state": "SIMULATED_PASS",
  "model_alias": "zendrive-chatgpt-local",
  "response_text": "oi",
  "authority": false,
  "proof": false,
  "requires_hermes_counterproof": true,
  "secret_copied": false,
  "cookie_copied": false
}
```

## Como ficaria para Hermes

```text
Hermes não conversa com ChatGPT Premium diretamente.
Hermes chama CentralDark API.
CentralDark escolhe provider alias.
Zendrive local responde quando o provider alias exigir perfil humano local.
Hermes testa a consequência no runtime.
```

## Estado honesto

```text
SOURCE_EXISTE_ZENDRIVE=true
SOURCE_EXISTE_REVIEW_BRIDGE=true
SOURCE_EXISTE_OMNI_ROUTER=true
RUNTIME_ZENDRIVE_PROVIDER_DEPLOYED=UNKNOWN
RUNTIME_API_ALIAS_CREATED=false
RUNTIME_CALL_OI_EXECUTED=false
PONTO_FIXO_ARQUITETURAL=SIMULATED_ONLY
```

## HUD simulado

```text
SOURCE_OWNER_REUSE=90%
SECURITY_GATE=95%
RUNTIME_BRIDGE_DESIGN=85%
API_PROVIDER_ALIAS_DESIGN=80%
HERMES_COUNTERPROOF_FLOW=85%
LOCAL_PROFILE_WORKER=80%
PREMIUM_TO_API_DIRECT=0%
DEPLOY_REAL=UNKNOWN
```

## Próximo cursor seguro

```text
1. Criar provider alias sem segredo: zendrive-chatgpt-local.
2. Criar health read-only: GET /providers/zendrive-chatgpt-local/health.
3. Criar chamada fake/local sem conta: POST /providers/zendrive-chatgpt-local/simulate.
4. Só depois conectar worker real da Casa.
5. Só depois testar `oi` com receipt.
6. Só depois habilitar Hermes a usar como modelo consultivo.
```

## Ponto fixo desta simulação

```text
PONTO_FIXO=true
FINALIDADE=arquitetura_final_simulada
EXECUCAO_REAL=false
BLOQUEIO_REAL=aguarda_alias_runtime_e_worker_health
UNKNOWN!=PASS
```
