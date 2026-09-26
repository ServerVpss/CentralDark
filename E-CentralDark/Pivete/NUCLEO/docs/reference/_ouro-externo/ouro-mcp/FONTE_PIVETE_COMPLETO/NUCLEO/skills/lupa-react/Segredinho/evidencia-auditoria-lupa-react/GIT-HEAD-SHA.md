# Gate de proveniência — código + manifesto no mesmo `HEAD_SHA`

## Regra vinculante

Uma revisão do `lupa-react` somente pode ser considerada rastreável quando o
**código auditado** e o **manifesto calculado sobre esse código** estiverem:

1. no mesmo repositório canônico;
2. na mesma branch/PR;
3. no mesmo commit identificado por `HEAD_SHA`;
4. cobertos por testes executados nesse mesmo commit;
5. sem alterações posteriores não registradas.

Se qualquer campo abaixo estiver ausente, o veredito é **BLOQUEADO POR FALTA DE
PROVENIÊNCIA**, ainda que os testes locais estejam verdes.

```text
REPOSITÓRIO:
BRANCH:
PR:
HEAD_SHA:
CAMINHO DO CÓDIGO:
CAMINHO DO MANIFESTO:
COMANDO DE TESTE:
RESULTADO DO CI:
REVISOR INDEPENDENTE:
DATA/HORA:
```

## Ordem correta

```text
correção mínima no código existente
→ testes e probes
→ gerar o manifesto final (sem auto-hash)
→ adicionar código + testes + manifesto ao mesmo commit
→ obter HEAD_SHA
→ executar CI nesse HEAD_SHA
→ registrar veredito ligado ao HEAD_SHA
```

O manifesto não deve registrar o próprio hash. Isso cria autorreferência e tende
a produzir valor obsoleto após a edição. Ele deve listar todos os demais arquivos
auditáveis ou ser gerado como artefato externo assinado pelo CI.

Exemplo conceitual de geração, ajustado aos caminhos canônicos do repositório:

```bash
find CAMINHO_CANONICO -type f ! -name MANIFEST.sha256 -print0 \
  | sort -z | xargs -0 sha256sum > CAMINHO_CANONICO/MANIFEST.sha256
git add CAMINHO_CANONICO
git commit -m "fix(lupa-react): corrigir gates e vincular manifesto"
git rev-parse HEAD
```

Depois do commit, o CI deve recalcular o manifesto a partir do checkout limpo e
falhar se houver divergência. Qualquer alteração posterior no código invalida o
resultado anterior e exige novo manifesto, novo `HEAD_SHA` e nova execução.

## Estado desta auditoria

O commit Git verificado anteriormente (`569e2a8...`) registra o aprendizado
`#335`, mas não contém o código completo do `lupa-react`. Portanto, ele não serve
como `HEAD_SHA` do pacote de código auditado.

**Estado atual:** código e manifesto ainda não ligados a um `HEAD_SHA` canônico.
