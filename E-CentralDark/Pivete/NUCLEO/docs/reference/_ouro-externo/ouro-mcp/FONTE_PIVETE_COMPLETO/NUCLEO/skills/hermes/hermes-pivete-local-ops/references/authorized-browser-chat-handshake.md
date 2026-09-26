# Conversa autorizada em aba pessoal — Windows UIA

## Quando usar

Use quando o Pivete autorizar explicitamente conversar em uma conversa já aberta no navegador pessoal e `browser_*` estiver em sessão isolada. Este fluxo é um canal bidirecional auditável; não é licença para navegar pelo histórico.

```text
browser isolado ≠ navegador pessoal
aba localizada ≠ mensagem enviada
mensagem renderizada ≠ ACK válido
hash de print ≠ ponte comprovada
```

## Contrato de escopo

Fixar antes de agir:

```text
MISSION_ID
AUTHORIZED_WINDOW_OR_TAB
EXPECTED_ORIGIN
EXPECTED_CONVERSATION_MARKER
ALLOWED_MESSAGE_COUNT_OR_PHASES
CREDENTIAL_ACCESS=NAO
OTHER_CHATS_OPENED=NAO
```

Regras:

- atuar somente na conversa explicitamente autorizada;
- não abrir histórico nem enumerar outras conversas;
- não ler cookies, tokens, senhas ou armazenamento do navegador;
- reutilizar primeiro URL, título, marcador e `HWND` já observados;
- um `HWND` é temporal: revalidar antes de cada envio;
- autorização para uma missão não se estende a outra conversa ou fase;
- se alvo, origem, marcador ou escopo divergir, abortar.

## 1. Recuperar o alvo pelo rastro

Prioridade:

```text
registro conhecido de HWND/URL/marcador
→ validar registro conhecido
→ procurar por título exato autorizado
→ somente depois considerar descoberta restrita
```

No Windows, validar no mesmo alvo:

```text
WINDOW_EXISTS=SIM
PROCESS=chrome.exe
URL_EXACT_MATCH=SIM
AUTHORIZED_MARKER_FOUND=SIM
DOCUMENT_FOUND=SIM
```

Não concluir ausência porque `FindWindow` falhou com texto Unicode: console e PowerShell podem corromper acentos. Reuse o `HWND` previamente validado e compare URL/marcador dentro dele. Não enumere títulos de outras conversas para contornar encoding.

## 2. Tratar o compositor sem destruir rascunhos

`ValuePattern.Current.Value` pode retornar:

- vazio;
- placeholder localizado;
- rascunho real do Pivete.

Fluxo:

```text
ler valor em UTF-8/Base64
→ comparar com placeholders previamente observados
→ se houver rascunho real: NÃO sobrescrever
→ aguardar o Pivete enviar/limpar
→ revalidar compositor
```

Nunca classificar como placeholder apenas por comprimento. A comparação deve usar o valor exato observado. Se o console exibir `�`, transportar o valor em Base64 UTF-8 e decodificar fora do PowerShell.

## 3. Enviar mensagem exata

1. Gerar NONCE com CSPRNG (`secrets.token_hex`).
2. Revalidar `HWND + processo + URL + marcador` imediatamente antes do envio.
3. Transportar mensagem Unicode como Base64 UTF-8; não depender da code page do console.
4. Definir o compositor via UIA `ValuePattern.SetValue`.
5. Aguardar a atualização da interface.
6. Rebuscar o botão de envio: React pode invalidar o elemento anterior.
7. Invocar o botão via `InvokePattern`.
8. Confirmar que missão + NONCE aparecem na conversa.

```text
FIRST_MESSAGE_SENT=SIM
FIRST_MESSAGE_RENDERED=SIM
```

Se o script falhar **depois** do `Invoke`, não reenviar. Primeiro inspecionar a conversa: a ação pode ter ocorrido antes da falha do recibo.

## 4. Validar ACK sem falso positivo

A própria solicitação costuma conter o template do ACK. Portanto, buscar `ACK=` globalmente pode encontrar apenas o texto enviado pelo executor.

Validação correta:

```text
localizar linha de resposta com NONCE/hash real
→ subir até o menor bloco ancestral completo
→ extrair campos exatos
→ comparar NONCE
→ confirmar TARGET/READY
```

Gate mínimo:

```text
ACK_MATCHED=SIM
NONCE_MATCHED=SIM
TARGET_CHAT_CONFIRMED=SIM
READY_FOR_NEXT_PHASE=SIM
```

NONCE diferente, ACK ausente, bloco incompleto ou resposta de outro alvo → `VERDICT=ABORT`.

## 5. Fase de atualização/revisão

Após ACK válido:

1. reler o artefato real;
2. calcular SHA-256 no momento do envio;
3. enviar atualização com o mesmo NONCE;
4. não modificar o artefato quando a missão for revisão;
5. aguardar resposta estruturada;
6. localizar a resposta pelo hash real devolvido, não pelo placeholder do template;
7. extrair o menor bloco que contenha todos os campos obrigatórios;
8. comparar hash e NONCE.

```text
SECOND_MESSAGE_SENT=SIM
SECOND_MESSAGE_RENDERED=SIM
ACK_UPDATE_MATCHED=SIM
ARTIFACT_SHA256_RECEIVED_MATCH=SIM
```

## 6. Recibo

Registrar depois do handshake, preferencialmente em `%TEMP%` quando nenhuma escrita em profile/repo estiver autorizada:

```text
MISSION
NONCE
TARGET_CHAT_CONFIRMED
FIRST_MESSAGE_SENT
FIRST_MESSAGE_RENDERED
ACK_MATCHED
SECOND_MESSAGE_SENT
SECOND_MESSAGE_RENDERED
ARTIFACT_SHA256
ACK_UPDATE_MATCHED
SUPERVISOR_VERDICT
OTHER_CHATS_OPENED=NAO
CREDENTIALS_ACCESSED=NAO
FILES_CHANGED_DURING_HANDSHAKE=NAO
VERDICT=PASS|CONDITION|ABORT
```

Calcular SHA-256 do recibo e recalcular o artefato para provar que a revisão não o alterou.

## Prova e limites

Só declarar comunicação comprovada quando houver:

```text
aba exata confirmada
+ mensagem enviada e renderizada
+ resposta em bloco distinto
+ NONCE correspondente
+ segunda fase e recibo, quando exigidos
```

Não confundir:

- screenshot com análise de conteúdo;
- cópia com comunicação;
- renderização com aceitação;
- ACK solicitado com ACK recebido;
- revisão semântica com autorização para aplicar mudanças.

## Relação com outras skills

- `computer-use` governa captura, interação GUI e catálogo de rotas.
- Este arquivo governa o protocolo local do profile Pivete para **conversa autorizada e auditável** em aba pessoal.
- `img-view` governa prova visual, cache de imagens e entrega de screenshots.
