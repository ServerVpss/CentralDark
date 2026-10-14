# 🔊 CentralDark Voice — extensão do botão "Ler em voz alta"

Substitui a voz robótica do botão nativo **"Ler em voz alta"** do Claude
(Claude.ai / Claude Desktop) pela voz **premium em português brasileiro
nativo** do bridge CentralDark.

## Como funciona

1. Você aperta o botão de headphone/alto-falante do Claude como sempre.
2. A extensão intercepta o clique, pega o texto da mensagem.
3. Manda primeiro para `api.centralldark.com/v1/audio/speech`. Se a rota ficar indisponível, o código tenta o bridge legado; não faz fallback após cancelamento nem erro de autorização (401/403).
4. Reproduz cada trecho de até 3.800 caracteres na ordem, sem descartar o restante da resposta; cancelar interrompe a fila e o áudio vigente.

Há cancelamento de áudio: se a pessoa parar, desativar ou iniciar outra leitura, respostas atrasadas não podem começar a tocar. O gancho de `speechSynthesis` é de compatibilidade e melhor esforço: scripts isolados de extensão podem não interceptar a página; o botão mapeado é a rota suportada.

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

## Evolução contínua — voz JARVIS em português brasileiro

A partir de v1.1, uma instalação nova recebe instruções de fala com cadência baiana leve, humor de Zé malandro, firmeza nos comandos e respeito ao texto original. Para instalações que já salvaram instruções personalizadas, a preferência antiga é preservada; edite o campo **Instruções de estilo** no popup e salve se quiser adotar o estilo novo.

**Escopo desta extensão:** leitura em voz alta (TTS) no Claude. Não alegar que ela reconhece microfone, identifica quem falou ou implementa detecção de fim de turno. Isso pertence ao owner de voz de entrada, a medir separadamente.

**Validação:** recarregar extensão, testar o botão de leitura, cancelar requisição ainda em curso, confirmar que resposta atrasada não toca, conferir erro de autenticação sem fallback e distinguir a API oficial do bridge legado. O commit no GitHub não prova extensão instalada na Casa.

## Leitura de respostas longas — v1.2

A extensão evolui **o mesmo `content.js`**, sem serviço ou executor novos. Textos maiores que 3.800 caracteres são separados preferencialmente em pontuação e espaços; se não houver separador, o código preserva pares UTF-16 (emoji) no corte. Cada parte é solicitada apenas depois que a anterior termina de tocar. Ao interromper ou desativar, a chamada pendente é abortada e trechos posteriores não são solicitados.

Falhas HTTP de cliente (4xx, inclusive 429) **não** disparam encaminhamento da chave para o bridge legado; erros de rede/servidor podem ativar a rota de compatibilidade. Valores de credenciais não aparecem nas mensagens de erro do `content.js`.

**Prova disponível em 2026-10-14:** `node --check` e teste de execução mock com botões, Web Audio e `fetch` simulados, cobrindo reprodução curta, cancelamento, áudio atrasado, três partes em ordem, interrupção da fila e HTTP 429/503. **Prova ainda pendente:** navegador real, extensão recarregada e saída audível na Casa. O `popup.js` ainda usa instruções anteriores; não afirmar atualização do perfil visual até confirmar sua escrita.
