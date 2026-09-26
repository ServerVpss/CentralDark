# Caso 2026-08-27: CI quebrado por submodule `skills/pretty-mermaid`

## Resumo
Múltiplos PRs abertos (1211, 1221, 1223, 1227, 1228) falhando CI com o mesmo erro de submodule. O diagnóstico confirmou que `.gitmodules` registra um submodule cujo path local não é um repositório git válido.

## Sinais no CI
- `gh pr checks` mostra todos os PRs com falha no mesmo gate (juiz determinístico / porta-de-entrada)
- `gh run view <run_id> --log-failed` revela no log do runner self-hosted:
  ```
  fatal: No url found for submodule path 'skills/pretty-mermaid' in .gitmodules
  ```
  ou
  ```
  fatal: destination path 'E:/CentralDark/Pivete/CentralDark/skills/pretty-mermaid' already exists and is not an empty directory.
  fatal: clone of '...' into submodule path '...' failed
  ```

## Estado local diagnosticado
1. `cat .gitmodules` → confirma referência ao path `skills/pretty-mermaid`
2. `git submodule status` → mostra o path em estado detached (`-e234ab...`)
3. `ls skills/pretty-mermaid/` → pasta existe com `node_modules` mas sem `.git` (não é repo git)
4. `ls skills/mermaid-skill/` → skill funcional está aqui (SKILL.md, examples, reference)

## Reparo
Seguir `references/submodule-quebrado.md` para os comandos de remoção da seção quebrada do `.gitmodules`.

## Nota
O problema é de configuração do repositório, não dos PRs individuais. Corrigir o `.gitmodules` resolve o CI para todos os PRs afetados.
