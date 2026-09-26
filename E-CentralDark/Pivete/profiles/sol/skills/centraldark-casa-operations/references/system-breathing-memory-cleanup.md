# System Breathing — Memory Flush & Zombie Reaper

Arquitetura de job automatizado para despressurizar RAM de host Windows saturado por stacks V8/Electron (Chrome, VS Code, Node.js isolado, PM2).

## Quando usar

Saturação de RAM documentada por imagem/monitor (ex: 88% de uso, leak passivo de V8 após long uptime) e o CHEFE autoriza criação do job de respiração via Agendador de Tarefas do Windows.

## Eixos

1. **Standby List Flush** — limpar memória cache "Standby" que o SO retém desnecessariamente. Opções:
   - PowerShell + API nativa do Windows (EmptyStandbyList via `SetSystemFileCacheSize` ou chamadas diretas a `SetSystemFileCacheSizeEx`).
   - Sysinternals RAMMap como fallback externo.

2. **Zombie Reaper** — varredura determinística para encerrar subprocessos órfãos (`chrome.exe`, `node.exe`, `Code.exe`) sem processo-pai ativo respondendo. Log de matança cirúrgica: PID, nome, motivo, timestamp.

3. **Node.js GC (opcional)** — para processos PM2 locais, aplicar graceful reload escalonado ou forçar GC se as instâncias rodam com flag `--expose-gc`.

## Periodicidade

Definida pelo CHEFE na criação do job (ex: a cada 6 horas, sob demanda, ou janela específica).

## Entrega no site/hermes

Se houver endpoint `/config`, `/jobs`, `/breathing` ou formulário no painel Hermes Agent (http://127.0.0.1:8787/), criar o job ali conforme disponível. Se o endpoint não estiver acessível, avisar conciso e pedir rota/caminho exato — não desviar para registrar no kanban.db sem ordem do CHEFE.

## Evidência exigida

- Imagem/monitor que fundamente o diagnóstico de saturação (upload real, não relato verbal sozinho).
- Se a imagem não estiver disponível no disco, pedir entrega/ path uma vez — não fabricar prova a partir do relato verbal.

## Registro

Após criação, registrar:
- Caminho do script `.ps1` entregue.
- Periodicidade configurada.
- Eixos ativados (flush / reap / gc) e parâmetros.
- Evidência de que o job foi registrado (print, confirmation do scheduler, ou retorno do endpoint).

Ver também: `centraldark-operational-discipline` (regra "FOCO NO COMANDO — não desviar para kanban/integração quando a missão é clara").
