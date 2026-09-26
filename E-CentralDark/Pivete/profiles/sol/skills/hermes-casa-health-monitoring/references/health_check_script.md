# health_check.sh — Script e Registro de Versão

## Script atual
Localização: `scripts/health_check.sh` (repo CentralDark)

Shell: bash (Git-Bash/MSYS no Windows).  
Depends: `tasklist` (Windows), `wmic` (Windows), `bc` (GNU bc), `awk`, `grep`, `tr`, `sort`, `head`.
Executa com `bash health_check.sh` na pasta `scripts/`.

## O que ele faz
- CPU load percent
- RAM usada/total
- Lista processos com memória sobrando entre: ChatGPT.exe, codex.exe, Hermes.exe, python.exe, pwsh.exe, Code.exe
- Conta processos "Not Responding"
- Thresholds:
  - CPU > 70%
  - RAM > 70% do total
  - Qualquer processo > 300MB = suspeito
  - Qualquer "Not Responding" = suspeito
- Saída: 🟢 saudável / 🔴 intervenção necessária + relatório detalhado

## Registro de versões

### v atual (commitável ao repo)
- Somatório de WorkingSet em KB com retorno inteiro (sem float errors)
- KB→MB com divisão inteira da soma
- `bc` fallback para CPU load quando wmic vazio
- Percentuais via bc (não aritmética bash limitada a int)
- LF line endings
- Teste estrutural cobre: shebang, funções, thresholds, divisão inteira, bc presente, ram_percent, quebra de linha final, sem CRLF, sem pattern legacy `sum+=`

### O que cai se summarizar o script com `print $5` sem `printf "%d"`
tasklist devolve valores como "221.712". Bash `(( kb > 0 ))` não aguenta float → arithmetic syntax error em runtime. Solução: usar `printf "%d"` no awk para arredondar antes do comparativo.

### Dependências críticas
- `bc` é obrigatório para percentuais e fallback de CPU. Sem ele o script não calcula thresholds corretamente.
- Windows: `wmic` pode estar desabilitado/ausente em algumas versões. O script já faz fallback para 0 nesse caso.

## Teste
`bash health_check.test.sh` 
- 17 checks estruturais
- Verifica arquitetura, não execução (stubs WMIC/TASKLIST injetados)
- Saída de exit code = 0 se passar tudo

## Uso em runtime real
Rodar de fato para validar: `bash health_check.sh`
Timeout típico: ~20s (wmic pode demorar). Use timeout maior ou background=true se necessário.
