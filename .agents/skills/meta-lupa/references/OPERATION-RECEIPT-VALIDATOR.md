# Validador e promotor do OPERATION_RECEIPT

O motor canônico continua em `.agents/skills/meta-lupa/scripts/meta_lupa.py`.
Não existe engine paralelo.

## Validar forma

```bash
python .agents/skills/meta-lupa/scripts/meta_lupa.py validate-operation-receipt \
  --input receipt.json
```

A validação estrutural pode retornar `STATUS=ALLOWED` e, ao mesmo tempo,
`approved_for_promotion=false`. Isso significa apenas que o JSON está bem
formado; não autoriza promoção.

## Gate obrigatório de promoção

```bash
python .agents/skills/meta-lupa/scripts/meta_lupa.py promote-operation-receipt \
  --input receipt.json \
  --repo-root . \
  --expected-head "$HEAD" \
  --expected-branch "$BRANCH" \
  --expected-target "$TARGET" \
  --expected-target-type GIT_PATH \
  --evidence-root "$EVIDENCE_ROOT" \
  --expected-authorization-reference "$AUTHORIZATION_REFERENCE"
```

O comando retorna exit code `13` se qualquer prova faltar ou divergir.
Promove apenas quando, no mesmo receipt fresco:

- HEAD e branch coincidem com o checkout vivo;
- alvo e tipo do alvo coincidem com o contexto esperado;
- `GIT_PATH` existe na árvore exata; `SERVICE`, `VPS`, `WORKTREE` e `SCOPE`
  usam identidade operacional explícita, sem exigir arquivo Git fictício;
- evidência está dentro da raiz autorizada e seu hash é recalculado dos bytes;
- diretórios usam manifesto JSON canônico com caminho, tamanho, tipo e SHA-256;
- Writer e Judge são identidades reais e diferentes;
- `chief_decision=APPROVED` está preso à referência de autorização fornecida
  pelo Promotor a partir de canal confiável;
- impacto, testes, contraprova e rollback não estão vazios;
- timestamp possui timezone, não está no futuro e tem no máximo 15 minutos;
- nenhum campo sensível ou padrão de segredo aparece no receipt.

A suíte roda automaticamente em `.github/workflows/lupa-conformance.yml` para
todo PR e em execução manual. O gate não depende mais de chamada informal.
