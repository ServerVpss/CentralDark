# Agent Capability Matrix — Hermes Autonomous Capabilities

## Real Capabilities (não há "skill agi")

| Capability | Kind | Quando usar | Quando NÃO usar | Chaves/limitantes |
|---|---|---|---|---|
| **cronjob** | ciclo/recorrente | monitoração recorrente, watchdog, ciclo auto sem intervenção humana, "autonomia até N horas" | tarefa interativa, missão longa com ferramentas completas | no_agent=true (script sem LLM), no_agent=false (agente por tick), deliver=local (sem entrega ao usuário), condição de parada deve estar no script, não só no schedule |
| **delegate_task** | subagente isolado, bounded | subtarefa concreta que retorna resumo final, sem vigilância contínua | missão longa hours/days, ciclo recorrente, tarefa interativa | max 3 tarefas paralelas neste usuário, leaf não pode delegar/cronjob/clarificar, só retorna o resumo final |
| **spawn hermes process (tmux)** | processo Hermes independente, hours/days | missão longa com ferramentas completas, pode interagir via PTY | tarefa rápida de código, subtarefa que só precisa de resumo | full tool access, PTY via tmux, limpar sessão ao final |
| **claude-code** | CLI agente de código | tarefas de código com Claude Code | tarefa não-código, missão longa com ferramentas fora do escopo do agente | print mode (-p) one-shot, tmux para multi-turn, --max-turns, --allowedTools |
| **codex** | CLI agente de código OpenAI | tarefas de código com Codex | tarefa não-código, missão longa com ferramentas fora do escopo | similar a claude-code, consultar skill codex para detalhes |
| **opencode** | CLI agente/open-source | tarefas de código/review com OpenCode | tarefa não-código, missão longa com ferramentas fora do escopo | similar a claude-code, consultar skill opencode para detalhes |
| **computer-use** | drive área de trabalho background | interação com UI Windows, clicks, type, scroll | monitoração de repo, ciclo recorrente de texto, tarefa de código | screenshot + click por elemento + type + scroll, não para ciclos de monitoração de repo |

## Naming Reality Gap

- **Não existe** skill chamada "agi" na biblioteca deste perfil
- **Não existe** skill única "autonomous" ou "autonomous-agent"
- **As capacidades autônomas são:** cronjob, delegate_task, spawned-hermes, e os agentes CLI (claude-code, codex, opencode)
- Quando o usuário fala "skill agi", trate como intenção de autonomia, não como nome de skill existente
- Não afirmar que "skill agi" está sendo usada — mapear para a capacidade real

## Near-Overlap Alert

`centraldark-omni-router` roteia **motor de IA** (qual modelo/engine), não **intenção do usuário** → capacidade Hermes. Conceito relacionado mas escopo diferente: não confundir "rotear engine" com "rotear intent para capacidade de execução".

## Silent Autonomous Monitoring Pattern

Para "monitora sem me mandar msg até N horas":

1. Script bash+python3:
   - checa ferramenta disponível (ex: gh)
   - coleta dados (PRs abertos, commits, CI)
   - escreve log interno com data/hora UTC + Brasil
   - condição de parada: se hora Brasil >= N, para e registra stop
2. Cronjob:
   - no_agent=true (script sem LLM)
   - deliver=local (sem entrega ao usuário)
   - schedule: every N min ou timestamp
   - script: caminho relativo sob scripts/
3. Registro: log em pasta controlada, sem entrega ao usuário

Pitfalls do padrão:
- Não entregar ao usuário se ele disse "não me manda msg" — usar deliver=local
- Condição de parada por clock deve estar no script, não apenas no cron schedule
- Se ferramenta indisponível (ex: gh), registrar "indisponível" e parar, não falsificar estado
- Log interno deve incluir hora UTC e Brasil para rastreabilidade
