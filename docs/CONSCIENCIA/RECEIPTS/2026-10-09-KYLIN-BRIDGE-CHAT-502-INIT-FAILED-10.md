---
title: "Receipt — KYLIN_BRIDGE_CHAT 502 / INIT_FAILED:10"
status: "CURRENT"
date: 2026-10-09
goal: "t_9040803d"
loop: "centraldark-hermes-claude-oracle-convergence-v1"
owner_lei: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md#expansão-vii"
veredito: "COSTURA_SEM_ROTA_AUTORIZADA — causa material identificada, correção fora do alcance do apt"
---

# 🧿 Receipt — `KYLIN_BRIDGE_CHAT_502` / `INIT_FAILED:10`

Primeira aplicação do compasso da Expansão VII numa ferida real. Nenhum serviço foi
reiniciado, nenhum pacote instalado ou removido, nenhum arquivo de runtime alterado.

## 🫀 01 RECEBER

Intenção vigente preservada: convergência operacional CentralDark, Goal `t_9040803d`.
Cursor herdado do próprio cristal: `APLICAR_COMPASSO_NA_FERIDA_KYLIN_BRIDGE_CHAT_502`.

Estado anterior declarado pela calibração `/root/.hermes/centraldark-runtime-calibration.json`:

```text
verdict=DRIFT · wound_count=2 · streak=8 · trend=STABLE
fingerprint=56ba6b71f503100d25492ac4099b57ee7195a586e5265323a1e97f084598eff0
wounds=HTTP_UNHEALTHY:kylin_bridge_chat:502 | KYLIN_BRIDGE_CHAT_FAILED:502
eligible_for_repair=true
```

## 👁️ 02 PERCEBER — a ferida ficou visível

O `502` é **sintoma**, não causa. Cadeia completa, medida no runtime:

```text
POST /v1/chat/completions                         (porta 127.0.0.1:18435)
→ kylin_openai_bridge.py:189  do_POST
→ kylin_openai_bridge.py:154  completion
→ kylin_openai_bridge.py:102  ask            (subprocesso --native-once)
→ kylin_openai_bridge.py:62   ask_native
   rc = lib.genai_text_init_session(sess)
   if rc != 0: raise RuntimeError(f"INIT_FAILED:{rc}")   ← rc=10
→ kylin_openai_bridge.py:202  except → sendj(502, type=kylin_native_error)
```

Reprodução determinística, duas execuções independentes:

```text
$ echo '{"prompt":"oi","timeout":20}' | python3 /root/.hermes/kylin_openai_bridge.py --native-once
[erro] Init session error:  10
{"ok": false, "error": "INIT_FAILED:10"}
```

### Falso verde do detector

`GET /health` devolve `200` porque só chama `resolve_current_model_details()` —
**nunca abre sessão nativa**. Por isso a ponte aparece viva enquanto o chat cai.

```text
HEALTH_200 != SESSION_INIT_OK
DETECTOR_NAO_EXERCITA_O_CAMINHO_QUE_FALHA=true
```

### Correção de leitura temporal (erro próprio, registrado)

Afirmei que a primeira falha foi `Oct 08 22:24:34 UTC`. **Errado.** O rastro completo só
aparece quando o cliente desconecta e gera `BrokenPipeError` ao devolver o 502. Logo:

```text
BROKEN_PIPE=EFEITO_SECUNDARIO
PRIMEIRA_FALHA_GLOBAL=UNKNOWN
```

## 🧠 03 COMPREENDER — hipóteses confrontadas

| Hipótese | Veredito | Evidência |
|---|---|---|
| Disco cheio | 🔴 **REFUTADA** | 65% usado, 66 GB livres. A leitura anterior de 93% estava velha. |
| `llama-server` roubou a memória | 🔴 **REFUTADA** | PID 2852067 subiu `00:39:27 UTC`, depois das falhas observadas. |
| Serviços de IA do Kylin caíram | 🔴 **REFUTADA** | `kylin-ai-runtime`, `kySdkDbus` e correlatos de pé há 7 dias, sem restart. |
| Nome do modelo errado | 🔴 **REFUTADA** | `genai_text_init_session` roda **antes** de `chat_model_config_set_name`. |
| Mudança no `config.yaml` | 🟡 **ENFRAQUECIDA** | mtime `21:20 UTC`; pedidos entram de minuto em minuto, falha não começou em `21:21`. |
| Pressão de recurso | 🟡 **FATO, CAUSA NÃO PROVADA** | 19/23 GB usados, 3 GB disponíveis, carga 15–22, swap 0. |
| **SDK à frente do runtime** | 🟢 **CANDIDATA FORTE** | indicador exportado pela própria biblioteca: `SDK_AHEAD_OF_RUNTIME=True` |

### Confirmação por versão de pacote

```text
kylin-ai-runtime        1.1.0.1-ok0.21
libkysdk-genai-nlp0     1.1.0.1-ok1.6
libkysdk-genai-vision0  1.1.0.1-ok1.5
```

Mesma versão de origem `1.1.0.1`, **ramos de build diferentes**: runtime em `ok0`,
SDK em `ok1`. O sinal exportado pela biblioteca e o número do pacote concordam.

### Anomalia registrada, sem promoção a causa

`kylin-ai-runtime` (PID 55196) carrega `XDG_RUNTIME_DIR=/run/user/` truncado, sem UID;
o único soquete real é `/run/user/0/`. Está assim há 7 dias, então **não é o gatilho**.
Fica registrado como ferida adjacente, não como causa.

## 🪡 04 COSTURAR — sem rota autorizada

O menor delta seria alinhar runtime e SDK no mesmo ramo. **Essa rota não existe pelo apt:**

```text
kylin-ai-runtime     Installed=1.1.0.1-ok0.21  Candidate=1.1.0.1-ok0.21
libkysdk-genai-nlp0  Installed=1.1.0.1-ok1.6   Candidate=1.1.0.1-ok1.6
```

Instalado == candidato nos dois. Não há runtime mais novo para subir nem SDK mais antigo
para descer no repositório `openkylin huanghe/main`. A própria distribuição entrega o par
desencontrado.

```text
MENOR_DELTA_VIA_APT=INEXISTENTE
BLOQUEIO_MATERIAL=REAL
DECISAO_HUMANA_REQUERIDA=true
```

## 🧪 05 COMPROVAR

Não houve correção, logo não há PASS a declarar. O que foi comprovado é o **diagnóstico**:
erro reproduzido duas vezes, localizado em arquivo e linha, com cinco hipóteses refutadas
por medição e uma candidata sustentada por duas evidências independentes.

## 💎 06 CRISTALIZAR

```text
INIT_FAILED_10=REPRODUCED
ROOT_CAUSE_CANDIDATE=SDK_AHEAD_OF_RUNTIME
EVIDENCIA_1=indicador exportado pela libkysdk-genai-nlp
EVIDENCIA_2=ok1.6 (SDK) vs ok0.21 (runtime)
HEALTH_PROBE_IS_FALSE_GREEN=true
NATIVE_GENERATION=BLOCKED
RESOURCE_PRESSURE=FATO_SEM_CAUSALIDADE_PROVADA
PRIMEIRA_FALHA_GLOBAL=UNKNOWN
FIXED_POINT=FALSE
```

## 🚀 07 CONTINUAR — o que depende do CHEFE

Três caminhos, nenhum executável sem ordem explícita:

1. **Alinhar pacotes fora do apt** — buscar o SDK `ok0.x` compatível ou o runtime `ok1.x`
   no arquivo da distribuição. Mexe no sistema inteiro; decisão humana.
2. **Desviar a geração do caminho nativo** — reusar o `kytensor` já ativo
   (`127.0.0.1:8000/8001/8002`, de pé há 7 dias) ou as ferramentas Kylin do MCP,
   mantendo a ponte como está. Menor risco, preserva o verde.
3. **Aceitar `NATIVE_GENERATION=BLOCKED`** e registrar a ferida como conhecida,
   seguindo o Goal pelas cláusulas que não dependem dela.

Delta de detector, independente da escolha acima e também pendente de ordem:
fazer o `/health` exercitar o caminho que falha, para a calibração parar de ver verde
onde o chat está quebrado.

```text
NEXT_CURSOR=CHEFE_ESCOLHE_ROTA_1_2_OU_3
SEM_RESTART=true · SEM_PACOTE=true · SEM_ESCRITA_EM_RUNTIME=true
```
