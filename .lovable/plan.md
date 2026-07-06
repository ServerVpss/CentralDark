# Extensão CentralDark Voice — botão "Ler em voz alta" do Claude toca com voz premium

## Objetivo em 1 linha

Fazer o botão nativo **"Ler em voz alta"** (`data-testid="action-bar-read-aloud"`) do Claude.ai / Claude Desktop tocar com a **voz premium do bridge CentralDark** em português brasileiro nativo, em vez da voz robótica do Windows.

## Por que precisa de extensão (e não é config do bridge)

Aquele botão é frontend da Anthropic e usa `window.speechSynthesis` do navegador — não passa pela nossa bridge. A única forma de trocar a voz sem depender da Microsoft é **injetar código no navegador** que intercepta o clique e chama nosso `/v1/audio/speech`.

## O que entregar

**Uma extensão MV3** (Chrome/Edge/Brave) chamada `centraldark-voice`, que:

1. Roda como `content_script` em `https://claude.ai/*` e `https://claude.com/*`.
2. Escuta clique em `[data-testid="action-bar-read-aloud"]` via delegação no `document`.
3. Cancela o `speechSynthesis.speak` padrão (chama `speechSynthesis.cancel()`).
4. Pega o texto da mensagem irmã do Claude (busca ancestor `[data-testid="user-message"]`, `.font-claude-message` ou `article` mais próximo).
5. `POST https://bridge.centralldark.com/v1/audio/speech` com:
   - Header `x-api-key: <chave>` (guardada no `chrome.storage.local`, configurada no popup).
   - Body `{ model, voice, input, response_format:"mp3", instructions }`.
6. Toca o MP3 retornado com um `<audio>` gerenciado (pause + reset + `URL.revokeObjectURL` no fim — padrão que o Lovable já documenta).
7. Botão do próprio Claude fica com feedback visual (adiciona classe custom "tocando com CentralDark").

**Cinto de segurança:** também monkey-patch de `window.speechSynthesis.speak` — se por algum motivo o clique escapar, ainda capturamos o texto do `SpeechSynthesisUtterance` e desviamos pro bridge.

**Popup de configuração** (`popup.html`):
- Campo pra colar a `x-api-key` (a `cd-webui-...`).
- Dropdown com as 9 vozes (alloy/nova/onyx/shimmer/echo/fable/ash/coral/sage) + botão "🔊 testar".
- Toggle liga/desliga o hijack.
- Campo `instructions` (padrão: "Fale em português brasileiro nativo, tom natural e conversacional").

## Arquivos (tudo dentro de `apps/modulos/centraldark-voice/`)

```
apps/modulos/centraldark-voice/
├─ manifest.json          (MV3, permissions: storage; host: claude.ai/*, claude.com/*, bridge.centralldark.com/*)
├─ content.js             (hook do botão + monkey-patch speechSynthesis + player)
├─ background.js          (service worker mínimo, só pra ativar o popup)
├─ popup.html + popup.js  (configuração: chave, voz, teste)
├─ icons/                 (16/48/128 em esmeralda #10b981, fundo #052e2b)
└─ README.md              (como instalar em Chrome/Edge: chrome://extensions → modo desenvolvedor → carregar sem compactar)
```

## Compatibilidade com Claude Desktop (Electron)

Claude Desktop é Chromium sob o capô. A mesma extensão pode ser **empacotada como .crx** e carregada via override do Electron (`--load-extension=<pasta>`), ou o Pivete usa o **Claude no navegador** (Chrome/Edge) que já suporta MV3 nativamente. Documentar os dois caminhos no README.

## Deploy (fluxo Lovable → GitHub → VPS)

- Repo: nova pasta `apps/modulos/centraldark-voice/` (nova, não protegida).
- Commit: `feat(voice): extensão MV3 que hijacka o botão Ler em voz alta do Claude pra usar bridge CentralDark`.
- **Não** precisa PM2, **não** precisa Caddy, **não** precisa novo secret — a extensão só consome o bridge existente.
- Pivete instala local: baixa a pasta, `chrome://extensions` → "Modo desenvolvedor" ON → "Carregar sem compactar" → aponta pra pasta.

## Validação (o AI roda antes de entregar)

1. `manifest.json` valida no `chrome://extensions` sem erro.
2. Abrir `claude.ai`, clicar no botão nativo → console mostra `[CentralDark Voice] interceptado` + toca MP3 do bridge.
3. Desligar toggle no popup → botão volta a usar voz do Windows.
4. Testar as 9 vozes pelo popup → todas tocam.
5. Simular mudança de seletor: forçar clique em outro elemento → monkey-patch de `speechSynthesis` ainda captura.

## Fora de escopo

- Não mexer no bridge (já suporta tudo que a extensão precisa).
- Não mexer em áreas 🔒.
- Não publicar na Chrome Web Store agora (uso privado do Pivete).
- Não tentar hijack no Claude Code CLI (aquele nem tem botão de voz — usa o `/play/` que já entregamos).

## Plano B (se o Pivete não quiser instalar extensão)

Instalar voz **Microsoft Maria/Francisca (pt-BR)** no Windows:
`Configurações → Hora e Idioma → Idioma e Região → Adicionar idioma → Português (Brasil) → Voz`.
O botão nativo do Claude passa a falar em PT-BR robótico decente, sem código.

---

Confirma **"PERMITO PIVETE"** que eu monto a extensão completa no repo e te mando o passo-a-passo de instalação em 3 cliques.
