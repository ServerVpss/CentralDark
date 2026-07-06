# 🔊 CentralDark Voice — extensão do botão "Ler em voz alta"

Substitui a voz robótica do botão nativo **"Ler em voz alta"** do Claude
(Claude.ai / Claude Desktop) pela voz **premium em português brasileiro
nativo** do bridge CentralDark.

## Como funciona

1. Você aperta o botão de headphone/alto-falante do Claude como sempre.
2. A extensão intercepta o clique, pega o texto da mensagem.
3. Manda pro `bridge.centralldark.com/v1/audio/speech`.
4. Toca o MP3 retornado direto no navegador.

Tem também um **cinto de segurança**: se a Anthropic mudar o botão,
sobrescrevemos `window.speechSynthesis.speak` global — qualquer coisa que
tentar falar via Web Speech API vai parar no bridge.

## Instalar em 4 cliques (Chrome / Edge / Brave)

1. Baixa/copia a pasta `apps/modulos/centraldark-voice/` (ou o `.zip` da
   página do preview).
2. Abre `chrome://extensions` (ou `edge://extensions`).
3. Liga o **Modo desenvolvedor** (canto superior direito).
4. Clica em **Carregar sem compactar** e aponta pra pasta.

Depois clica no ícone da extensão → cola a chave `cd-webui-...` → escolhe
a voz → aperta **💾 Salvar**. Pronto.

## Claude Desktop (Windows/Mac)

O Claude Desktop é Chromium (Electron). Duas opções:

- **Mais fácil:** use o Claude no navegador (Chrome/Edge) com a extensão
  instalada. Mesma conta, tudo sincronizado.
- **Avançado:** carregar a extensão dentro do Electron via
  `--load-extension=<caminho>` no atalho do Claude Desktop.

## Vozes disponíveis

| ID       | Perfil                  |
|----------|-------------------------|
| alloy    | neutra padrão           |
| nova     | feminina clara          |
| onyx     | masculina grave         |
| shimmer  | feminina suave          |
| echo     | masculina neutra        |
| fable    | masculina jovem         |
| ash      | masculina firme         |
| coral    | feminina animada        |
| sage     | feminina calma / madura |

## Desligar temporariamente

Abre o popup e desliga o toggle "Interceptar botão". Volta ao comportamento
padrão do Claude (voz do sistema operacional).

## Debug

Abre o DevTools do Claude (F12) → aba Console → filtra por `CentralDark
Voice`. Logs mostram cada interceptação, config carregada e erros.
