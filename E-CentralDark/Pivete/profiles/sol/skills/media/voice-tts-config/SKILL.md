---
name: voice-tts-config
description: Sempre passe voice no TTS ou sai inglês.
---

# voice-tts-config

## Quando usar

Use quando for gerar áudio com `text_to_speech` e o idioma da saída precisa bater com o idioma do texto (ex.: PT-BR → áudio em português).

## O que este skill governa

- Seleção de voz por idioma no provider `edge` (Edge TTS)
- Pitfall: **sem especificar `voice`, o Edge TTS pode cair no inglês padrão mesmo com texto em PT-BR**
- Vozes disponíveis por idioma
- Pitch/speed como parâmetros opcionais

## Pitfall obrigatório

**NUNCA** chame `text_to_speech` com apenas `text` e `provider` — sempre inclua `voice` explícito quando o idioma do texto for conhecido e for relevante que a saída fale naquele idioma.

```json
{
  "text": "Olá Pivete! Tudo bem?",
  "provider": "edge",
  "voice": "pt-BR-FranciscaNeural"
}
```

Sem o `voice`, o provider pode cair no inglês padrão e entregar áudio em inglês com texto em português.

## Vozes chaves por idioma

### pt-BR (Brasil)
| Código | Gênero | Estilo |
|--------|--------|--------|
| `pt-BR-FranciscaNeural` | Feminino | Suave, padrão |
| `pt-BR-AntonioNeural` | Masculino | Sério, profissional |
| `pt-BR-ThalitaNeural` | Feminino | Jovem, natural |

### Outros (ver referências)
Ver `references/edge-tts-voices.md` para tabela completa por idioma.

## Configuração persistente (CADEADO Casa — 2026-09-03)

**Arquivo canônico Desktop/CLI:** `$HERMES_HOME/config.yaml`  
Nesta Casa: `E:\CentralDark\Pivete\config.yaml` (NÃO só `~/.hermes` nem só `profiles/pivete`).

```yaml
tts:
  provider: edge
  edge:
    voice: pt-BR-FranciscaNeural
voice:
  auto_tts: true
```

**Comandos de trava (usar estes, nunca editar YAML na mão):**
```bash
hermes config set tts.provider edge
hermes config set tts.edge.voice pt-BR-FranciscaNeural
hermes config get tts.provider
hermes config get tts.edge.voice
```

**Drift comprovado 2026-09-03 (pré-update snapshot):**
- `tts.provider` virou `gemini` → áudio inglês
- `tts.edge.voice` virou `FRANCISCA` (inválido) → falha/fallback EN
- Perfil `profiles/pivete/config.yaml` já tinha edge+pt-BR, mas o Desktop ativo lê a **raiz** `Pivete/config.yaml`

**Regra:** após `hermes update` / restore de snapshot, re-medir `hermes config get tts` e re-travar se provider ≠ edge ou voice ≠ `pt-BR-*`.

**Padrão Fable Loop — Frente única:** quando o caminho já virou chão, comprimo em reflexo. Quando a realidade muda, reabro o raciocínio. Mensagem crua nunca vira autorização. Não transformar silêncio em permissão.

Na chamada `text_to_speech`, ainda preferir `provider=edge` explícito. Se a tool expuser `voice`, passar `pt-BR-FranciscaNeural` ou `pt-BR-AntonioNeural`.

## Parâmetros opcionais

```json
{
  "text": "texto aqui",
  "provider": "edge",
  "voice": "pt-BR-FranciscaNeural",
  "speed": 1.0,
  "pitch": "+0Hz"
}
```

- `speed`: 0.25–4.0
- `pitch`: delta de pitch (ex.: "+0Hz", "+10Hz")

## Links de referência

- Doc oficial Edge TTS: https://edge-tts.readthedocs.io/en/latest/
- Repositório Edge TTS: https://github.com/EdgeTTS/EdgeTTS
- Tabela completa de vozes por idioma: ver `references/edge-tts-voices.md`

## Comandos CLI (para teste manual)

```bash
# Testar Francisca (feminino suave)
edge-tts --voice pt-BR-FranciscaNeural --text "Olá Pivete! Tudo bem?" --write-media teste_francisca.mp3

# Testar Antonio (masculino sério)
edge-tts --voice pt-BR-AntonioNeural --text "Olá Pivete! Tudo bem?" --write-media teste_antonio.mp3

# Testar Thalita (feminino jovem)
edge-tts --voice pt-BR-ThalitaNeural --text "Olá Pivete! Tudo bem?" --write-media teste_thalita.mp3
```

## Verificação

Após gerar áudio com voz PT-BR:
1. Confirmar que o texto fonte está em PT-BR
2. Confirmar que o `voice` passado é um código `pt-BR-*`
3. Ouvir o áudio (se possível) para validar que a saída é em português

**WARNING**: OGG/OPUS não inclui metadata de idioma por padrão. A confirmação de idioma é por inferência (texto PT-BR + voz pt-BR) ou por transcrição/manual.

## Veredito

Sempre especificar `voice` explícito. Nunca confiar que o provider "vai adivinhar" o idioma a partir do texto. O Edge TTS padrão pode cair no inglês.


## Kokoro TTS (standalone)

### Instalação rápida (via script)

1. Salve o script abaixo como `/c/c/install_kokoro.sh`
2. Torne-o executável: `chmod +x /c/c/install_kokoro.sh`
3. Execute: `/c/c/install_kokoro.sh`

```bash
#!/bin/bash
# Instalação Kokoro TTS standalone - só voz, sem tudo o resto
# Pronto em ~5 minutos, ~400MB

set -e

INSTALL_DIR="/c/c"
cd "$INSTALL_DIR"

echo "=== Baixando Kokoro-FastAPI ==="
if [ ! -d "Kokoro-FastAPI" ]; then
    git clone https://github.com/remsky/Kokoro-FastAPI.git
fi

cd Kokoro-FastAPI

echo "=== Subindo container do Kokoro (CPU) ==="
cd docker/cpu
docker compose up -d --build

echo ""
echo "=== Kokoro TTS standalone no ar ==="
echo "API TTS: http://localhost:8880"
echo "Documentação: https://docs.openwebui.com/features/chat-conversations/audio/text-to-speech/Kokoro-FastAPI-integration/"
echo ""
echo "Pronto! Agora você tem só o TTS (voz)."
echo "Teste com curl ou use o endpoint OpenAI-compatible."
```

### Teste pós-instalação

Após o container estar em execução, teste com:

```bash
curl -X POST "http://localhost:8880/v1/audio/speech" \
     -H "Content-Type: application/json" \
     -d '{"model":"kokoro","input":"Olá, este é um teste do Kokoro TTS em português.","voice":"af_br","response_format":"mp3"}' \
     -o kokoro_teste.mp3
```

### Observações

- O container usa a imagem CPU; caso tenha GPU, ajuste o compose para a variante GPU.
- A API é compatível com o padrão OpenAI para áudio (endpoint `/v1/audio/speech`).
- Vozes disponíveis: ver a documentação do Kokoro (ex.: `af_bf`, `af_sarah`, `am_michael`, etc.). Para português brasileiro, experimente `af_br` ou outras listadas no repositório.
- Caso o Docker não esteja instalado, consulte a skill `docker-setup` (ou instale via Docker Desktop do site oficial).

### Recomendação para testes iniciais

Para validar rapidamente se a síntese de voz em português funciona em sua máquina sem instalar um sistema pesado, comece com o Kokoro standalone (Opção 1). Isso permite:
- Testar a qualidade da voz (Kokoro tem boa suportação para português via vozes como `af_bf` ou outras)
- Verificar se o endpoint de TTS responde corretamente
- Validar a integração com fluxos de STT → router → TTS posteriormente

Se o teste funcionar e você precisar de mais funcionalidades (agentes, workflows, etc.), então prossiga com a instalação completa do ODS (Opção 2).