# Evidência de auditoria — Técnica da Lupa + `lupa-react`

**Status:** pacote de evidência para revisão.  
**Não é fonte canônica, não é uma V2 da Lupa e não deve ser implantado.**

Este pacote registra a auditoria independente realizada em 19/07/2026 sobre os
artefatos recebidos em `Segredinho.zip` e sobre a Técnica da Lupa originalmente
anexada. Os arquivos-fonte são preservados em `fonte/` somente como snapshots de
evidência.

## Gate obrigatório de Git

> **O código e o manifesto de integridade precisam ser versionados juntos na
> mesma fonte Git e no mesmo `HEAD_SHA`. Sem essa ligação, testes e hashes não
> autorizam aprovação nem produção.**

O procedimento completo e o modelo de registro ficam em
[`GIT-HEAD-SHA.md`](GIT-HEAD-SHA.md). Este ZIP não inventa repositório, branch,
PR ou commit que não foram comprovados.

## Conteúdo

- `AUDITORIA-LUPA-REACT.md` — veredito e achados no formato da própria Lupa;
- `GIT-HEAD-SHA.md` — gate de proveniência exigido para a próxima revisão;
- `RESULTADOS-EXECUCAO.txt` — testes e probes reproduzidos;
- `FONTES-PRIMARIAS.md` — fontes externas consultadas;
- `FONTE-AUDITADA.json` — hashes e identidade dos artefatos recebidos;
- `probes_adversariais.py` — reprodução automatizada dos falsos verdes;
- `verificar_manifesto.py` — verificação dos hashes deste pacote;
- `MANIFEST.sha256` — hashes de todos os arquivos, exceto dele próprio;
- `fonte/` — snapshots imutáveis usados na auditoria.

## Verificação local

```bash
python3 verificar_manifesto.py
python3 probes_adversariais.py
```

Resultado esperado neste snapshot:

- manifesto íntegro;
- os achados adversariais são reproduzidos;
- isso confirma a auditoria, **não** a segurança do código para produção.

## Regra de preservação

Nenhum arquivo-fonte original foi corrigido dentro deste pacote. Correções devem
ser aplicadas no repositório canônico já existente, em patch mínimo, seguidas de
novo manifesto, testes e commit único. Criar outro pacote corrigido fora do Git
repetiria o problema de fonte paralela que a própria Lupa bloqueia.
