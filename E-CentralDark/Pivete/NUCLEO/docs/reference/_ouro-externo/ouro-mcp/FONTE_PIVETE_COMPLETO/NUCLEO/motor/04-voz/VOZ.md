# Voz, som e presença

## Entregue agora

- `assets/audio/inicializacao.wav`: sinal curto de três notas;
- `hermes/interfaces/som.py`: toca o WAV no Windows;
- `hermes/interfaces/voz_windows.py`: fala a resposta com o sintetizador nativo do Windows;
- flag `--voz`.

## Por que somente saída de voz

Microfone contínuo envolve privacidade, ruído, ativação acidental e dependências. Pela Lupa, a menor fase útil é:

```text
texto digitado → resposta do Hermes → voz opcional
```

Isso prova presença sonora sem abrir uma superfície de gravação permanente.

## Regras para a próxima fase

- indicador visível de microfone ativo;
- ativação manual ou palavra local;
- botão de interrupção;
- áudio descartado por padrão;
- transcrição revisável;
- nenhum comando físico executado apenas por reconhecimento de voz;
- confirmação reforçada para ações sensíveis.
