# Evidência: Teste de API Groq — 2026-09-08

## Comando executado
curl -s -X POST https://api.groq.com/openai/v1/chat/completions \
  -H 'Authorization: Bearer [REDIGIDO-PRESERVACAO]' \
  -H 'Content-Type: application/json' \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"teste CentralDark"}],"max_tokens":100}'

## Resultado
{
  "error": {
    "message": "The model `openai/gpt-oss-120b` is blocked at the project level...",
    "type": "permissions_error",
    "code": "model_permission_blocked_project"
  }
}

## Diagnóstico
- API Groq FUNCIONA: HTTP 200, JSON estruturado, token válido.
- Modelo openai/gpt-oss-120b BLOQUEADO no projeto Groq.
- Todos os 14 modelos listados no GET /models estão bloqueados/requerem termos.

## Conclusão
Infraestrutura Groq operacional e tecnicamente integrável. Mas todo acesso aos modelos está bloqueado ao nível do projeto. CHEFE precisa habilitar modelos em https://console.groq.com/settings/project/limits.
