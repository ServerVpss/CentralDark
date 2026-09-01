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

## Integração com as autoridades existentes

A State Library não cria um segundo mapa de consolidação. O dono executável continua sendo
`apps/modulos/mapeamento/config/mapa-canonico.json`, julgado por
`apps/modulos/mapeamento/core/validar-mapa.mjs`.

O selo portátil usa schema 2 e cobre tanto os conteúdos existentes quanto a lista de
arquivos sob cada diretório selado. Alteração, remoção **ou adição** produz FAIL. Ele é
adequado para pacotes e snapshots; a autorização de mudança em áreas protegidas continua
sendo decidida pelo gate canônico, CODEOWNERS e ruleset.

`GitHubStateLibrary.workflow_runs(head_sha=..., limit=...)` consulta a cadeia recebida de
execuções antigas ou atuais. Cada evento preserva ID, número do run, workflow, status,
conclusão, HEAD e URL; ingestão, dedupe e atualização do estado vivo ocorrem na mesma
transação SQLite `BEGIN IMMEDIATE`.

## Proveniência e citações recuperáveis

A identidade canônica da evidência não é o token efêmero usado pela superfície de resposta.
Referências como `turnXfileY`, IDs de mensagem ou handles de uma sessão pertencem ao runtime que fez
a recuperação; não devem virar identidade persistente da fonte.

A cadeia mínima é:

```text
CLAIM
→ SOURCE_IDENTITY
→ REAL_RETRIEVAL
→ RUNTIME_REFERENCE
→ CITATION
```

`SOURCE_IDENTITY` deve reutilizar o menor identificador estável já disponível (por exemplo ID/caminho
canônico, versão e hash quando material). Em nova sessão, a fonte é resolvida novamente e a referência
corrente é gerada pelo retrieval atual. Referência inventada, obsoleta ou sem recuperação observada não
é prova.

```text
REFERENCE_TOKEN != SOURCE_IDENTITY
RETRIEVAL_OBSERVED_REQUIRED=true
FABRICATED_REFERENCE=FAIL
UNKNOWN != PASS
```

Quando um provedor externo devolver `RequestId`, ele é preservado como identidade da requisição
externa e ligado ao trace/span interno correspondente; não substitui a cadeia causal interna.
