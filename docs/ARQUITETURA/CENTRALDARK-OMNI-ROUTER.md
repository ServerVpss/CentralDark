# CentralDark Omni Router — uma porta, motores substituíveis

Status: IMPLEMENTATION_CANDIDATE
Owner: CentralDark / routing
Intenção: SEGREDO/CHEFE

## Contrato

```text
ONE_SYSTEM_ONLY=true
ONE_ENTRYPOINT=true
MODEL_IS_REPLACEABLE=true
APP_IDENTITY=CENTRALDARK
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

## Fluxo

```text
CENTRALDARK APP
→ CENTRALDARK OMNI ROUTER
→ engine selecionado
   ├─ Claude Code local CLI
   ├─ OpenAI API oficial
   └─ Hermes endpoint compatível
→ resposta normalizada
→ receipt de engine/modelo/duração
```

## Estado do legado

```text
elite-gateway/zendriver/chatgpt = FROZEN_NOT_DELETED
```

O transporte legado via automação de `chatgpt.com` não participa deste router. O código permanece preservado no repositório para reconciliação/histórico, mas não é rota de produção deste contrato.

## Interface

O router expõe uma superfície OpenAI-compatible local:

```text
GET  /health
GET  /v1/models
POST /v1/chat/completions
```

Seleção de engine por `model`:

```text
auto
openai/<model>
claude-code/<model>
claude:<model>
hermes/<model>
```

## Boundaries

- sem segundo app;
- sem segundo cérebro;
- sem votação entre modelos;
- sem fallback oculto;
- sem segredo em log;
- sem browser automation como API escondida;
- sem mutação/deploy automático;
- runtime local continua `NOT_PROVEN` até execução real no alvo.

## Prova mínima

O script contém `--self-test` para validar roteamento, normalização e redaction sem chamar provedores externos.

```text
python centraldark_omni_router.py --self-test
```

A execução real de Claude/OpenAI/Hermes exige que cada engine esteja configurado no runtime local correspondente.
