# Lane Foreground — navegador vivo do CHEFE

## Owner conceitual existente

`docs/INTEGRACOES/CHROME-DEVTOOLS-MCP.md`

## Papel

```text
CHEFE olha/interage com página
        ↓
Chrome vivo
        ↓
Chrome DevTools MCP
        ↓
Browser Bridge
        ↓
Hermes
```

## Estado atual

```text
CONTRACT=READY
UPSTREAM_KNOWN=YES
LOCAL_RUNTIME=UNPROVEN
```

Portanto este pack não afirma que Chrome MCP já está instalado ou conectado.

## Tool mapping lógico

O bridge deve mapear capacidades reais descobertas no servidor MCP, não nomes inventados.

Categorias esperadas:

```text
PAGE
DOM/SNAPSHOT
CONSOLE
NETWORK
PERFORMANCE
LIGHTHOUSE
SCREENSHOT
NAVIGATION
INPUT
```

No boot do provider:

```text
MCP CONNECT
→ tools/list
→ register capabilities
→ capability receipt
```

Se uma tool não estiver listada:

`CAPABILITY=UNAVAILABLE`

Não simular.

## Página do ChatGPT

Quando a superfície for `chatgpt.com`:

```text
DOM observado = evidence input
texto visível = page content
seleção = user context
console/network = diagnostics
```

Não promover request interno da aplicação a API pública.

## Legenda/transcrição

A legenda só entra se estiver observável na página ou houver uma fonte de transcript realmente acessível.

```text
CAPTION_VISIBLE
→ TRANSCRIPT_CANDIDATE

CAPTION_NOT_OBSERVED
→ TRANSCRIPT=UNKNOWN
```

## Ação

Read-only é default.

Ações de clique/digitação/envio precisam de `BROWSER_COMMAND_V1` autorizado.
