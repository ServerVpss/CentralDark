# Preferências de Voz e TTS do Usuário

Quando o usuário expressar preferência por saída de áudio em português do Brasil ou corrigir que o áudio está em inglês:
- Configure o provedor TTS para `edge` com voz `pt-BR-FranciscaNeural`
- Use o comando: `hermes config set tts.provider edge` seguido de `hermes config set tts.edge.voice pt-BR-FranciscaNeural`
- Observe que componentes de interface podem precisar de atualização/reload para refletir as mudanças de configuração
- Nunca assumir que a configuração foi aplicada apenas porque foi definida no backend - verifique a saída real de áudio
- Essa preferência deve ser respeitada em todas as interações futuras de áudio, a menos que explicitamente alterada pelo usuário

## Fonte da preferência
Correção crítica da sessão 2026-09-03: usuário sinalizou que o áudio estava em inglês apesar da configuração, indicando necessidade de garantir que a voz realmente seja aplicada no frontend (Sol Tauri) além do backend.