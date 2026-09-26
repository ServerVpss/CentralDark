# BASELINES E DESEMPENHO

## Baseline: Coletor Profile

| Métrica | Baseline |
|---------|----------|
| Tempo | ~3s |
| Entradas | 100+ |
| Saída | TSV sanitizado |
| Hash | SHA-256 |
| Status | VALID |

---

## Baseline: Script PowerShell

| Métrica | Baseline |
|---------|----------|
| Tamanho | < 10KB |
| Linhas | ≤ 180 |
| Execução | Isolada |
| Relatório | TSV |
| Validação | SHA-256 externo |

---

## Desempenho Observado

| Operação | Tempo |
|----------|-------|
| Diagnóstico perfil | ~3s |
| Preparar script 05b | 337 linhas |
| Preparar script 05c | 190 linhas |
| Preparar script 05d | 180 linhas |
| Leitura UIA (tela) | ~2s |

---

## Meta para Scripts Futuros

- Máximo 180 linhas
- Máximo 10KB
- Sem heredoc
- Com Dispose determinístico
- Com finalização protegida
