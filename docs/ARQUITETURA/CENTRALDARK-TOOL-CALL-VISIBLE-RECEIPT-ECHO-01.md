# CENTRALDARK_TOOL_CALL_VISIBLE_RECEIPT_ECHO_01

## Intenção do CHEFE

Se uma ferramenta executa no ChatGPT, a auditoria humana precisa ver o que aconteceu. O card nativo do ChatGPT, como “Resposta do aplicativo recebida” e “Abrir lista de chamadas de ferramenta”, é útil e deve aparecer quando a superfície suportar. Mas a CentralDark não pode depender desse renderer fechado para entregar prova.

## Regra canônica

```text
TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_NATIVE_RENDERER
NATIVE_TOOL_CALL_RENDERER_VISIBLE=BONUS_USEFUL
CENTRALDARK_VISIBLE_RECEIPT_ECHO=MANDATORY
DESKTOP_RENDERER_MISSING_DOES_NOT_HIDE_TOOL_RESULT=true
MOBILE_RENDERER_VISIBLE_DOES_NOT_EXCUSE_DESKTOP_BLINDNESS=true
SAFE_JSON_ECHO_REQUIRED=true
APPLICATION_RESPONSE_SUMMARY_REQUIRED=true
NO_SECRET_VALUES_IN_ECHO=true
UNKNOWN_IS_NOT_PASS=true
```

## Política de exibição

Para toda chamada de ferramenta feita por ChatGPT, voz, desktop, mobile, Work, Hermes, MCP ou outro agente conectado à CentralDark, a resposta final deve incluir um bloco textual visível com:

```yaml
tool_call_visible_receipt:
  surface: desktop|web|mobile|voice|work|unknown
  native_renderer_visible: true|false|unknown
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

- se o card nativo aparecer, preservar e usar como camada extra de auditoria;
- se o card nativo não aparecer, emitir o `CENTRALDARK_VISIBLE_RECEIPT_ECHO` no texto do chat;
- não transformar ausência do card nativo em ausência de execução;
- não transformar resultado textual em prova de renderer nativo;
- não expor segredo, token, senha, valor de env ou payload sensível no echo;
- sempre mostrar nomes de variáveis e parâmetros seguros, nunca valores secretos.

## Aplicação imediata

Quando o CHEFE pedir “traz pro chat”, “exibe JSON”, “resposta do aplicativo”, “tool call visível” ou equivalente, o agente deve responder com o receipt textual sem depender do botão do ChatGPT:

```text
TOOL: <nome>
INPUT_SAFE: <json sem segredo>
STATUS: <success|error|blocked|unknown>
APP_RESPONSE: <resumo fiel da resposta>
PROVA: <o que foi medido>
NÃO_PROVA: <o que ainda não fecha>
NEXT_CURSOR: <próximo passo>
```

## Contraprova

Um estado só vira PASS se existir pelo menos uma destas provas:

- card nativo visível e confirmado na superfície atual;
- receipt textual emitido no chat com dados seguros;
- receipt persistente em log/arquivo/commit/PR acessível;
- runtime/endpoint/commit/health medido após a ferramenta.

Ausência de uma dessas camadas mantém o estado em `UNKNOWN` ou `BLOCKED`, nunca `PASS`.

## Frase núcleo

```text
SE O DESKTOP NÃO MOSTRA O CARD, A CENTRAL MOSTRA O RECIBO.
```
