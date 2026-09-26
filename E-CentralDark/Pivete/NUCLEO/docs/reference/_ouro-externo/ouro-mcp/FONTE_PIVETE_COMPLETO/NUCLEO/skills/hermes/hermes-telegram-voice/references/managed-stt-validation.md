# Validação isolada de STT gerenciado

## Quando usar

Use para validar transcrição de áudio recebido sem alterar `config.yaml`, reiniciar o gateway ou permitir fallback local.

## Contrato de segurança

- reutilizar um áudio já existente em `<HERMES_HOME>/cache/audio/`;
- resolver diretamente o gateway gerenciado `openai-audio`;
- chamar somente o backend OpenAI compatível com `gpt-4o-mini-transcribe` e idioma `pt`;
- não chamar `transcribe_audio()` nem o fluxo normal do gateway durante o teste, pois uma falha pode acionar `transcribe_audio_local_fallback()`;
- calcular e comparar antes/depois: hash do `config.yaml`, hash/tamanho do áudio e estado do cache do modelo local;
- não imprimir token, segredo ou objeto de autenticação;
- sucesso exige transcrição não vazia no idioma original e todos os estados locais inalterados.

## Prova observada em 2026-08-02

Um `.ogg` anterior do Telegram foi enviado diretamente ao gateway Nous `openai-audio`:

| Modelo | Resultado |
|---|---|
| `whisper-1` | Rejeitado: devolveu tradução em inglês |
| `gpt-4o-mini-transcribe` + `pt` | Aprovado: português preservado em 4,703 s |

Após o teste aprovado:

```text
CONFIG_UNCHANGED=SIM
AUDIO_UNCHANGED=SIM
LARGE_V3_CACHE_UNCHANGED=SIM
DOWNLOAD_LOCAL=NAO
RESTART=NAO
```

## Separação TTS/STT

```text
saída/TTS → Edge → pt-BR-FranciscaNeural
entrada/STT → Nous openai-audio → gpt-4o-mini-transcribe → pt
```

O modelo de STT nunca substitui a voz Francisca.

## Limite ainda aberto

Teste isolado não prova que o fluxo persistente está protegido. Enquanto o gateway chamar `transcribe_audio_local_fallback()` e `stt.local.model` apontar para um modelo grande, falha do provider remoto ainda pode iniciar carregamento/download local. Não promover configuração persistente sem um gate que desative esse fallback no modo gerenciado e sem teste ponta a ponta.