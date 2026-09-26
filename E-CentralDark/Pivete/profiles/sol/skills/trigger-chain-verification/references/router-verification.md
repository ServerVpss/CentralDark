# Verificação do Router CentralDark

Este documento descreve como verificar se o router (serviço de LLM) da Casa CentralDark está pronto para receber requisições.

## 1. Portas de escuta
- **8099** → endpoint principal de chat/completions (ex: `http://127.0.0.1:8099/v1/chat/completions`)
- **8199** → endpoint de health‑check/stub (resposta vazia ou código 200 vazio)

## 2. Verificar processo
```bash
# lista processos escutando nas portas
netstat -ano | findstr :8099
netstat -ano | findstr :8199
# identificar PID e nome do processo
tasklist /FI "PID eq <PID>"
```
Esperado: `python.exe` (ou outro processo do router) escutando em 8099.

## 3. Teste de requisição (exemplo com curl)
```bash
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"nous/tencent/hy3:free","messages":[{"role":"user","content":"Oi"}]}' \
     --max-time 10
```
Resposta esperada (exemplo):
```json
{
  "id":"...",
  "object":"chat.completion",
  "model":"nous/tencent/hy3:free",
  "choices":[{"message":{"role":"assistant","content":"Oi! Como posso ajudar você hoje?"}}],
  "centraldark":{
    "engine":"nous",
    "resolved_model":"tencent/hy3:free",
    "duration_ms":3118,
    "fallback_used":false
  }
}
```
- `fallback_used:false` indica que o modelo solicitado foi usado diretamente.
- Código de status HTTP 200.

## 4. Health‑check opcional (porta 8199)
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8199
```
Esperado: `200` (ou qualquer 2xx) – indica que o processo está vivo.

## 5. Interpretação
- Se as portas estão LISTENING e o teste de POST retorna 200 com conteúdo válido → router **PRONTO**.
- Se a porta 8099 não está LISTENING → router não iniciado.
- Se a porta 8099 está LISTENING mas o POST retorna erro (timeout, 5xx, ou resposta vazia) → investigar logs do processo.
- A porta 8199 pode retornar vazio ou 200; ausência de resposta não indica falha crítica do router principal.

## 6. Observações de segurança
- Não enviar senhas, tokens ou dados sensíveis neste teste.
- Use apenas dados de teste genéricos (ex: "Oi").

---
*Este é um artefato de apoio para a skill `trigger-chain-verification`.*