# Windows UI Automation — aba Chrome autenticada e explicitamente autorizada

## Escopo

Receita para retomar uma conversa já aberta no Chrome pessoal quando a automação de navegador disponível cria sessão isolada. UIA localiza e opera; **não concede autoridade**. Use somente com marcador inequívoco fornecido pelo Pivete.

## Contrato

```text
RASTRO_DA_MISSAO
→ TÍTULO EXATO
→ FindWindow EXATO, sem enumeração
→ HWND ÚNICO
→ PROCESSO=chrome.exe
→ DOCUMENTO DA ABA ATIVA
→ MARCADOR AUTORIZADO
→ ORIGEM=chatgpt.com/c/...
→ COMPOSITOR IDENTIFICADO
→ RASCUNHO VAZIO OU AUTORIZAÇÃO PARA SUBSTITUIR
→ NONCE
→ ENVIO
→ ACK COM MESMO NONCE
```

`HWND`, título, URL, `targetId` e `tabId` identificam alvo; nenhum substitui autorização.

## Recuperar o alvo do rastro

Prioridade:

1. anexo/print original preservado;
2. título visível da conversa;
3. marcador textual da missão;
4. URL completa somente se legível ou recuperada pela UIA.

Se a barra estiver truncada com `…`, não completar UUID por inferência.

## Encontrar somente a janela exata

Use `win32gui.FindWindow(None, exact_title)`. Não use `EnumWindows` para imprimir todas as janelas quando outras conversas estão fora do escopo.

```python
import win32gui
hwnd = win32gui.FindWindow(None, "<TITULO_AUTORIZADO> - Google Chrome")
assert hwnd
```

## Verificar processo

```python
import psutil
import win32process
_, pid = win32process.GetWindowThreadProcessId(hwnd)
assert psutil.Process(pid).name().lower() == "chrome.exe"
```

Registrar só handle, PID, processo e resultado do gate. Não ler perfil, cookies ou credenciais.

## UIA nativa do Windows

`IUIAutomation` é COM baseado em vtable; `win32com.client.Dispatch(...)` pode não expor a interface. Use a API .NET nativa:

```powershell
Add-Type -AssemblyName UIAutomationClient
$root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$hwnd)
```

Quando PowerShell é chamado por Bash/MSYS, Unicode literal pode sofrer conversão de code page. Prefira fragmento ASCII inequívoco ou `-EncodedCommand` UTF-16LE. Caractere corrompido nunca conta como evidência positiva.

## Restringir ao Document autorizado

Localize `ControlType.Document` sob o `HWND`; procure o marcador somente dentro desse documento e retorne apenas `FOUND=SIM|NAO`. Não despeje a árvore inteira.

```powershell
$cond = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
  [System.Windows.Automation.ControlType]::Document
)
$doc = $root.FindFirst(
  [System.Windows.Automation.TreeScope]::Descendants,
  $cond
)
```

## Verificar origem sem DevTools

A barra costuma ser `ControlType.Edit` fora do `Document`. Sob o `HWND` autorizado, leia `ValuePattern` e aceite somente origem contratada, como `chatgpt.com/c/<id>`.

Origem não basta: exigir processo + janela + documento + marcador + URL.

## Compositor e rascunho

No ChatGPT, o compositor foi localizado por:

```text
AutomationId=prompt-textarea
ControlType=Edit
```

Antes de `SetValue`, leia `ValuePattern.Current.Value`:

```text
RASCUNHO_VAZIO
→ continuar dentro da missão

RASCUNHO_NÃO_VAZIO
→ não sobrescrever
→ pedir autorização específica ou abortar
```

“Continue a missão” não autoriza apagar texto pré-existente no compositor.

## Handshake

Somente após todos os gates:

```text
GERAR NONCE
→ preencher mensagem exata
→ enviar
→ confirmar na mesma conversa
→ aguardar ACK
→ exigir mesmo NONCE
→ então enviar a segunda mensagem
```

Página carregada, foco, texto digitado ou mensagem visível não equivalem a ACK.

## Probe observado em 2026-07-29

Leitura apenas, sem envio:

```text
TARGET_TITLE=Apagar rastros e evidências - Google Chrome
TARGET_WINDOW_MATCHES=1
TARGET_PROCESS=chrome.exe
DOCUMENT_COUNT=1
AUTHORIZED_MARKER_FOUND=SIM
AUTHORIZED_URL_FOUND=SIM
COMPOSER_AUTOMATION_ID=prompt-textarea
COMPOSER_DRAFT=Sequência
ACTION=PARAR_ANTES_DE_SOBRESCREVER
OTHER_CHATS_OPENED=NAO
CREDENTIALS_ACCESSED=NAO
```

Isto comprova identificação controlada da aba. Não comprova envio, ACK, isolamento físico imposto pelo Chrome ou segurança geral do mecanismo.

## Fail-closed

Abortar em:

- título ausente/múltiplo;
- processo diferente;
- documento ambíguo;
- marcador ausente;
- origem divergente;
- compositor ausente;
- rascunho não vazio sem autorização;
- ACK ausente/NONCE divergente;
- necessidade de enumerar outras conversas.
