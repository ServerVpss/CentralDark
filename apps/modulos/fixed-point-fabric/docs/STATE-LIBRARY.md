# State Library — estado vivo e recuperação em cadeia

A State Library reduz polling sem criar outro cérebro. GitHub envia eventos para um endpoint privado;
o receptor valida HMAC, rejeita replay por `X-GitHub-Delivery`, extrai apenas campos operacionais e
anexa o receipt à mesma cadeia do Fixed Point Fabric.

## Eventos úteis

| Evento | Projeção material |
|---|---|
| `pull_request` | action, draft, state, HEAD, base, merged |
| `issues` | action, state, state_reason, assignees |
| `workflow_run` | status, conclusion, HEAD, nome |
| `check_suite` | status, conclusion, HEAD |

Comentários e texto bruto não são persistidos por padrão. Isso reduz ruído, exposição de segredo e
reprocessamento. O webhook acorda a medição; ele não decide fixed point sozinho.

## Cadeado de consolidação

O selo SHA-256 detecta alteração, remoção e adulteração do próprio manifesto. Para bloquear merge,
adicione `verify-seal` à porta de entrada e proteja o workflow com ruleset/CODEOWNERS. Nenhum software
dentro do mesmo repositório pode ser literalmente impossível de remover por um administrador; a
garantia honesta é **detecção criptográfica + aprovação externa + gate fail-closed**.

