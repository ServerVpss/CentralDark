# Fixing "python: command not found" in GitHub Actions Workflows

## Problema
Em runners self-hosted Linux do CentralDark, alguns workflows falham com:
```
/opt/actions-runner-centraldark/_work/_temp/*.sh: line 2: python: command not found
```
Isso ocorre quando os steps chamam `python scripts/trigger-fabric/verify_repo_contract.py .` mas o runner só tem `python3` disponível no PATH, não `python`.

## Causa Raiz
- O script `verify_repo_contract.py` já usa shebang `#!/usr/bin/env python3`
- A chamada correta deveria ser `python3`, não `python`
- Alguns runners self-hosted Linux têm apenas `python3` instalado, não o alias `python`

## Solução Correta
Altere todas as ocorrências de:
```bash
python scripts/trigger-fabric/verify_repo_contract.py .
```
para:
```bash
python3 scripts/trigger-fabric/verify_repo_contract.py .
```

## Por que isso funciona
- O script já está configurado para ser executado com python3 via shebang
- Usar `python3` diretamente é mais explícito e confiável que depender do alias `python`
- Evita problemas com variações de PATH entre diferentes runners e contextos

## Exemplos de Correção em Workflows CentralDark
### Antes:
```yaml
- name: Verificar Trigger Fabric canônica antes de qualquer promoção
  shell: bash
  run: |
    set -euo pipefail
    python scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/trigger-fabric-contract.txt"
```

### Depois:
```yaml
- name: Verificar Trigger Fabric canônica antes de qualquer promoção
  shell: bash
  run: |
    set -euo pipefail
    python3 scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/trigger-fabric-contract.txt"
```

## Boas Práticas
1. **Seja explícito**: Use `python3` quando o script for projetado para Python 3
2. **Verifique o shebang**: Confira a primeira linha do script Python para ver qual versão ele espera
3. **Consistência**: Aplique a mesma correção em todos os workflows que chamam o mesmo script
4. **Documente**: Se houver razões específicas para escolher python vs python3, documente-as

## Verificação
Após alterar o workflow, verifique que:
- O workflow passa na etapa que antes falhava com "command not found"
- O script `verify_repo_contract.py` executa completamente e produz seus outputs esperados
- Não há regressão em outras etapas do workflow

## Quando NÃO Aplicar
- Não altere para `python3` se o script específicamente requer Python 2 (raro em projetos modernos)
- Não altere se o workflow estiver rodando em um ambiente onde apenas `python` está disponível (menos comum em Linux modernos)
- Nunca adicione workarounds complexos quando a solução direta está disponível

> ℹ️ Este padrão foi validado na CentralDark através das PRs #1235 (que corrigiu múltiplos workflows) e confirmado como a solução correta para o ambiente de runners self-hosted Linux usado neste repositório.