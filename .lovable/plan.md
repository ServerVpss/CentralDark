Plano de ataque para achar o erro da UI CentralDark AI sem alterar nada agora:

1. Confirmar a camada quebrada
   - Testar a página pública da UI e separar: login funciona, frontend carrega, falha só aparece depois no chat/áudio.
   - Verificar se o erro vem do Open WebUI, do proxy Python/FastAPI ou do gateway de modelos.

2. Auditar logs certos
   - Puxar logs recentes do serviço da UI/Open WebUI.
   - Puxar logs do proxy de modelos e do Elite/Anthropic.
   - Procurar exatamente por:
     - `'JSONResponse' object has no attribute 'body_iterator'`
     - `Missing API key`
     - `No token`
     - `Unauthorized`
     - `audio`, `tts`, `speech`, `voice`

3. Diagnóstico provável do erro `body_iterator`
   - Esse erro costuma acontecer quando algum middleware tenta tratar uma resposta normal `JSONResponse` como se fosse resposta em streaming.
   - Correção esperada: só acessar `body_iterator` em `StreamingResponse`, ou trocar a lógica para ler o corpo de `JSONResponse` corretamente.
   - Área suspeita: proxy/chat streaming, filtro de resposta, middleware de log, rota de áudio/TTS ou adaptação OpenAI-compatible.

4. Diagnóstico provável de modelos “sem token/key”
   - Gateway Lovable e Gemini aparecem vivos nos sinais já coletados.
   - Então a falha deve estar na configuração interna da UI/Open WebUI: provider sem chave cadastrada, variável não carregada no container/processo, ou modelo apontando para provider errado.
   - Validar `/v1/models` e um `/v1/chat/completions` real no gateway usado pela UI.

5. Diagnóstico provável do áudio
   - Separar se é autoplay do navegador ou falha real de geração/URL.
   - Checar se a rota TTS retorna arquivo de áudio válido, MIME correto, CORS correto e URL acessível.
   - Se o chat já falha antes, áudio pode ser consequência, não causa raiz.

6. Resultado que vou devolver depois da investigação
   - Causa raiz mais provável.
   - Trecho/serviço exato onde Fable deve mexer.
   - Prompt cirúrgico para mandar ao Fable, sem pedir git/deploy/restart amplo.
   - Ordem segura: primeiro chat/modelos, depois streaming `body_iterator`, por último áudio.