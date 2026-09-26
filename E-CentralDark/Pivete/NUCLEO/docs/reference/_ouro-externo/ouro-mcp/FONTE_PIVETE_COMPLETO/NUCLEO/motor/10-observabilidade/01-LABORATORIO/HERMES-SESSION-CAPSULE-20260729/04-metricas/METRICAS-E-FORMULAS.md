# MÉTRICAS E FÓRMULAS

## Métricas da Sessão

| Métrica | Valor |
|---------|-------|
| Coletor executado | 1 (PROFILE_SHOW_NATIVE_DIAGNOSTIC) |
| Instrumentos preparados | 3 (05b, 05c, 05d) |
| Instrumentos válidos | 1 |
| Instrumentos rejeitados | 2 |
| Tempo de execução (diagnóstico) | ~3s |
| Entradas mapeadas | 100+ |
| Skills observadas | 106 |

---

## Fórmulas Aprendidas

### Transporte Seguro (Windows)

```
BASH_MSYS_TO_SINGLE_POWERSHELL:
  - powershell.exe -NoProfile -NonInteractive -Command "..."
  - sem heredoc
  - sem segundo shell
  - comando único
```

### Coletor Seguro

```
PROFILE_SHOW_NATIVE_DIAGNOSTIC:
  - leitura única
  - sem recursão
  - sem seguir reparse
  - relatório sanitizado
  - SHA-256 externo
```

### Script PowerShell Seguro

```
Para lógica complexa:
  1. write_file .ps1 visível
  2. revisão de código
  3. parser-only
  4. autorização
  5. execução isolada
```

---

## Limites Aplicados

- **Linhas por script**: 180 máximo
- **Profundidade de enumeração**: 2 (raiz + 1 nível)
- **Quantidade por nível**: 100 raiz, 500 por diretório
- **Timeout por instrumento**: 20s
