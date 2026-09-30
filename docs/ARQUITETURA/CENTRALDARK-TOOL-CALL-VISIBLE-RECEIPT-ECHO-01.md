# CENTRALDARK_TOOL_CALL_VISIBLE_RECEIPT_ECHO_01

## Intenção do CHEFE

Se uma ferramenta executa no ChatGPT, a auditoria humana precisa ver o que aconteceu. O card nativo do ChatGPT, como “Resposta do aplicativo recebida” e “Abrir lista de chamadas de ferramenta”, é útil e deve aparecer quando a superfície suportar. Mas a CentralDark não pode depender desse renderer fechado para entregar prova.

Correção fina de 2026-09-29: o desktop pode mostrar eventos inline da ferramenta no chat, como “Verificou status...” ou “Comparou commits...”, e ainda assim deixar a lista detalhada/JSON colapsada ou oculta. Isso não é renderer ausente total. É renderer parcial.

## Regra canônica

```text
TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_NATIVE_RENDERER
NATIVE_TOOL_CALL_RENDERER_VISIBLE=BONUS_USEFUL
NATIVE_INLINE_TOOL_EVENTS_VISIBLE=PARTIAL_AUDIT_SIGNAL
NATIVE_DETAILED_TOOL_LIST_VISIBLE=FULL_NATIVE_AUDIT_SIGNAL
NATIVE_DETAILED_TOOL_LIST_HIDDEN=PARTIAL_RENDERER_ONLY
CENTRALDARK_VISIBLE_RECEIPT_ECHO=MANDATORY
DESKTOP_RENDERER_MISSING_DOES_NOT_HIDE_TOOL_RESULT=true
DESKTOP_INLINE_EVENTS_DO_NOT_EXCUSE_HIDDEN_JSON=true
MOBILE_RENDERER_VISIBLE_DOES_NOT_EXCUSE_DESKTOP_BLINDNESS=true
SAFE_JSON_ECHO_REQUIRED=true
APPLICATION_RESPONSE_SUMMARY_REQUIRED=true
NO_SECRET_VALUES_IN_ECHO=true
UNKNOWN_IS_NOT_PASS=true
```

## Estados possíveis do renderer

```text
NATIVE_RENDERER_NONE
  = nenhum sinal visual de tool call aparece.

NATIVE_RENDERER_INLINE_ONLY
  = o chat mostra eventos resumidos da ferramenta, mas a lista/JSON detalhado fica oculta ou colapsada.

NATIVE_RENDERER_FULL_LIST
  = o chat mostra o card/lista abrível com chamada, input, resposta e metadados.

CENTRALDARK_ECHO_REQUIRED
  = obrigatório quando o CHEFE pedir JSON/resposta do aplicativo ou quando o renderer nativo estiver ausente/parcial.
```

## Política de exibição

Para toda chamada de ferramenta feita por ChatGPT, voz, desktop, mobile, Work, Hermes, MCP ou outro agente conectado à CentralDark, a resposta final deve incluir um bloco textual visível com:

```yaml
tool_call_visible_receipt:
  surface: desktop|web|mobile|voice|work|unknown
  native_renderer_state: none|inline_only|full_list|unknown
  native_inline_events_visible: true|false|unknown
  native_detailed_list_visible: true|false|unknown
  tool_name: string
  input_safe: object|string
  status: success|error|blocked|unknown
  application_response_summary: string
  evidence:
    - string
  counterproof:
    - string
  receipt_id: string|null
  next_cursor: string|null
```

## Fronteira de plataforma

A CentralDark não controla diretamente o renderer interno do app ChatGPT Desktop. Portanto:

- se o card/lista nativo completo aparecer, preservar e usar como camada extra de auditoria;
- se só aparecerem eventos inline, marcar `native_renderer_state=inline_only` e ainda emitir o `CENTRALDARK_VISIBLE_RECEIPT_ECHO` quando houver pedido de auditoria;
- se o card nativo não aparecer, emitir o `CENTRALDARK_VISIBLE_RECEIPT_ECHO` no texto do chat;
- não transformar ausência do card nativo em ausência de execução;
- não transformar eventos inline em prova de lista/JSON detalhado;
- não transformar resultado textual em prova de renderer nativo completo;
- não expor segredo, token, senha, valor de env ou payload sensível no echo;
- sempre mostrar nomes de variáveis e parâmetros seguros, nunca valores secretos.

## Aplicação imediata

Quando o CHEFE pedir “traz pro chat”, “exibe JSON”, “resposta do aplicativo”, “tool call visível”, “lista oculta”, “mostra aberto” ou equivalente, o agente deve responder com o receipt textual sem depender do botão do ChatGPT:

```text
TOOL: <nome>
SURFACE: <desktop|mobile|web|voice|work|unknown>
NATIVE_RENDERER_STATE: <none|inline_only|full_list|unknown>
INPUT_SAFE: <json sem segredo>
STATUS: <success|error|blocked|unknown>
APP_RESPONSE: <resumo fiel da resposta>
PROVA: <o que foi medido>
NÃO_PROVA: <o que ainda não fecha>
NEXT_CURSOR: <próximo passo>
```

## Preferência do CHEFE

O CHEFE prefere auditoria visual aberta. Quando possível, manter tool calls e lista detalhada visíveis. Quando a plataforma colapsar/ocultar a lista, compensar no texto com JSON seguro e resposta do aplicativo. O objetivo não é esconder ruído; é permitir que o CHEFE veja o rastro enquanto trabalha.

```text
CHEFE_PREFERS_VISIBLE_TOOL_TRACE=true
HIDDEN_DETAILED_LIST_IS_NOT_IDEAL=true
INLINE_EVENTS_ARE_USEFUL_BUT_INSUFFICIENT_FOR_FULL_AUDIT=true
SHOW_SAFE_JSON_IN_CHAT_WHEN_LIST_HIDDEN=true
```

## Contraprova

Um estado só vira PASS se existir pelo menos uma destas provas:

- card/lista nativo visível e confirmado na superfície atual;
- eventos inline nativos visíveis e classificados como `inline_only`, sem chamar de lista completa;
- receipt textual emitido no chat com dados seguros;
- receipt persistente em log/arquivo/commit/PR acessível;
- runtime/endpoint/commit/health medido após a ferramenta.

Ausência de uma dessas camadas mantém o estado em `UNKNOWN` ou `BLOCKED`, nunca `PASS`.

## Frase núcleo

```text
SE O DESKTOP SÓ MOSTRA O RESUMO, A CENTRAL MOSTRA O JSON SEGURO.
SE O DESKTOP NÃO MOSTRA O CARD, A CENTRAL MOSTRA O RECIBO.
```
