# Telemetria Pré-Respiração (READ-ONLY)

## Objetivo
Medir o estado real da máquina antes de qualquer ação corretiva ou "respiração de memória", sem alterar nada.

## Baseline T0
Use o último snapshot do CPU‑Z disponível como referência inicial (ex.: i5-10400F @ ~3,99 GHz, Package ≈ 73 °C, Package Power ≈ 67,5 W).

## Coleta contínua
- Duração: 10 minutos
- Intervalo: 5 segundos
- Métricas por intervalo:
  - timestamp
  - CPU_total_percent
  - RAM_used_GB, RAM_available_GB
  - Commit_used_GB
  - Process_count
  - CPU_clock_MHz, Temp_package_C, Temp_core_max_C, Package_power_W (quando observável; senão UNKNOWN)
  - Para cada família de processos (msedgewebview2, chrome, Code, node, python, hermes, powershell):
      * process_count
      * working_set_total_MB
      * working_set_max_MB
      * cpu_total_seconds
      * PID do maior consumidor
      * Parent PID (quando disponível)
  - Top 15 processos por Working Set a cada iteração (salvo em processes.csv)

## Saída
- telemetry.csv – métricas gerais e por família
- processes.csv – top 15 WS por iteração
- summary.json – médias, picos, tendências, suspeitos (famílias com WS > 500 MB)
- README.txt – descrição read‑only

## Regras
- Nenhum processo morto, nenhuma configuração alterada, nenhuma RAM liberada.
- Se algum contador não estiver disponível, registre UNKNOWN.
- Não execute ações corretivas até que a telemetria esteja concluída e o usuário decida.

## Armazenamento
Salve tudo em `E:\CentralDark\Pivete\logs\telemetria\`.