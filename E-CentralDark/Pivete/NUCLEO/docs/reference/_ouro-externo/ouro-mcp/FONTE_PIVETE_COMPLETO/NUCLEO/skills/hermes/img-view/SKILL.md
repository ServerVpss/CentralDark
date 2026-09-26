---
name: img-view
description: Como o Hermes (profile pivete, Windows) enxerga imagem e contornos. Responda sempre que o Pivete mandar imagem por path local, print do app, ou link de preview (prnt.sc/lightshot). NÃO fingir ter lido; declarar lacuna e dar a solução real.
category: hermes
---

# img-view — ver imagem no Hermes (Windows/local)

## FATO (comprovado hoje)
O pipeline de visão do app NÃO injeta imagem de:
- path local `C:\...` ou `E:\...` → erro 404 "Couldn't find that"
- data-URI base64 → também 404
- página de preview (prnt.sc, lightshot) → "source is not a recognized image"

Funciona com:
1. **Anexo nativo da plataforma** — foto anexada no app Desktop ou no Telegram. A plataforma injeta os pixels; receber apenas o texto de um path não equivale a receber a imagem.
2. **URL direta de imagem** (`.png`/`.jpg` cru, ex: `https://img.lightshot.app/XXXX.png`) → `vision_analyze` lê.

No Telegram, preferir o botão de FOTO; enviar como arquivo/documento pode não entrar no pipeline visual da mesma forma.

## Quando o Pivete manda path local ou print
1. Declarar: "não consigo ler esse path local / esse preview" (lacuna, não inventar).
2. Oferecer soluções reais:
   - Mandar no Telegram como foto.
   - Se tiver URL direta da imagem (não da página), usar `vision_analyze(image_url=URL_DIRETA)`.
   - Se for print do app: o Pivete pode subir em servidor próprio ou me dar URL.
3. NUNCA usar o texto do print como se eu tivesse visto — só se ele transcrever.

## Registrar imediatamente caches realmente usados

Sempre que um anexo, cache ou diretório temporário for usado com sucesso:

```text
TOOL_OUTPUT revela path real
→ provar que arquivo/diretório existe
→ registrar raiz + finalidade + data da observação
→ registrar destino estável, se houver
→ reutilizar o registro antes de fazer nova busca
```

Regras:

- registrar somente path observado e provado; nunca deduzir diretório como fato;
- o registro canônico desta skill fica em `references/cache-locations.md`;
- atualizar `LAST_OBSERVED_AT` quando a rota for usada novamente;
- não registrar conteúdo do arquivo, token, cookie ou credencial;
- path de cache é pista de recuperação, não garantia de retenção permanente;
- antes de reenviar, copiar para destino estável e verificar hash;
- se o path mudou, preservar o antigo como histórico e marcar `OBSOLETO` somente após prova.

## Reenviar print ou snapshot que apareceu e sumiu

Distinguir duas coisas:

```text
imagem exibida no contexto visual
≠
arquivo persistido e entregável
```

`browser_vision` pode exibir o snapshot na conversa interna sem retornar `screenshot_path`. Nesse caso, não declarar que o arquivo foi salvo.

Fluxo comprovado no Windows:

```text
1. localizar o path do anexo original já presente na mensagem direta;
2. provar que o arquivo existe;
3. copiar o binário para C:\Users\danda\Pictures\<nome-estável>.png;
4. calcular SHA-256 da origem e do destino;
5. exigir hashes idênticos;
6. entregar com MEDIA:C:/Users/danda/Pictures/<nome-estável>.png.
```

Exemplo mecânico:

```bash
SRC='C:/Users/danda/AppData/Roaming/Hermes/composer-images/<arquivo>.png'
DST='C:/Users/danda/Pictures/<nome-estável>.png'
test -f "$SRC"
mkdir -p 'C:/Users/danda/Pictures'
cp "$SRC" "$DST"
sha256sum "$SRC" "$DST"
```

Regras:

- usar `terminal`/cópia binária; `write_file` é para texto e não deve copiar PNG/JPG;
- não gerar outra imagem para fingir recuperação do print original;
- não tratar imagem visível sem path como arquivo persistido;
- se não houver anexo original nem `screenshot_path`, declarar a lacuna e recapturar com ferramenta que realmente produza arquivo;
- preferir caminho estável em `C:\Users\danda\Pictures\` para reenvio;
- depois da cópia, entregar o arquivo com `MEDIA:` e não apenas escrever o caminho.

## Extração de token/key de navegador (caso excepcional)
Só com autorização explícita do Pivete: ler Local Storage/IndexedDB do Chrome no disco.
AVISO: Chrome criptografa em disco (DPAPI) — geralmente NÃO acha token plano. Quem tem o plaintext é o Pivete na tela (Reveal).
NÃO fazer RAM dump de processo do navegador (desproporcional).

## Pitfall
- `vision_analyze` com provider correto = `gemini/gemini-2.5-pro` (anthropic deu 403 OAuth, morto).
- Imagem anexa no Telegram só entra se for botão de IMAGEM, não "anexar arquivo".
