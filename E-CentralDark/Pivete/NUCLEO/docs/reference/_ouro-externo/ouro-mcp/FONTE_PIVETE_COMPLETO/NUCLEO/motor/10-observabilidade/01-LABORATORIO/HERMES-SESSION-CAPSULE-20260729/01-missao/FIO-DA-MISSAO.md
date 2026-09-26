# FIO DA MISSÃO

## Identificação

```
PARENT_MISSION=ORGANIZAR-CASA-HERMES-01
CURRENT_MISSION=INVENTARIO-TOTAL-HERMES-01
NONCE=BBC03689F2C4
CURRENT_MODE=READ_ONLY
MUTATION_AUTHORIZED=NAO
```

---

## Objetivo de Longo Prazo

```
mapear primeiro
→ compreender consumidores e limites
→ avaliar risco para o Hermes Desktop
→ apresentar árvore e evidência
→ organizar uma pasta leve e pouco usada por vez
→ validar funcionamento
→ somente depois considerar link, junction, mudança de perfil ou migração
```

---

## Estado de Segurança

```
PROFILE_MUTATED=NAO
MIGRATION_STARTED=NAO
SYMLINK_CREATED=NAO
JUNCTION_CREATED=NAO
FILES_DELETED=NAO
REPOSITORY_CHANGED_BY_MISSION=NAO
```

---

## Contexto da Sessão

A organização ainda não começou porque o mapeamento não foi concluído.

A sessão atual focou em:

1. Validar o perfil ativo do Hermes (`pivete`).
2. Mapear processos e descendentes.
3. Criar inventário de arquivos no perfil.
4. Encontrar uma entrada chamada `NUL` (nome reservado pelo Windows).
5. Preparar instrumento diagnóstico para analisar `NUL` sem acessar o caminho reservado.

---

## Instrumentos Preparados

| Versão | Linhas | Estado | SHA256 |
|--------|--------|--------|--------|
| 05b | 337 | REJECTED | `6b8a532c53b47b7530407fe84ae043732e4dd9986c9e3a6f7f47ceaafb644205` |
| 05c | 190 | REJECTED (limite linha) | `ff095024e6af0315c5ae406be6b37469267bd9f827cd96b9f2c16a4c32b92d2c` |
| 05d | 180 | PREPARED (último) | `00ba8aad5f0058cab9f1cbba07619aaf7da09a12a29a053b21fdb9065b22f6e5` |

---

## Técnicas Aprovadas

- Transporte: `BASH_MSYS_TO_SINGLE_POWERSHELL`
- Coletor: `PROFILE_SHOW_NATIVE_DIAGNOSTIC`
- Leitura de tela: UIAutomationClient via TextPattern

---

## Técnicas Reprovadas

- Lógica PowerShell complexa inline (falha de tokenização).
- Heredoc para scripts PowerShell longos.
- Get-Item em caminhos reservados (NUL, CON, etc.).
- Recomposição de caminho com nome reservado.
