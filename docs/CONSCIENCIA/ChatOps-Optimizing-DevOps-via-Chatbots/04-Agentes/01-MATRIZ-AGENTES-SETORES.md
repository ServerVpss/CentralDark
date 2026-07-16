# 06 — Matriz de agentes por setor

> Cada setor = um papel. Orch (#6) não implementa tudo sozinho.

---

## Matriz canônica (7 BOOTs)

| BOOT | Setor | Papel correto | Tools típicas (lab) | Proibido |
|------|-------|---------------|---------------------|----------|
| #1 | Infra / SysAdmin | Compose, rede, inventário, paths | docker, fs lab | pm2 prod, caddy prod |
| #2 | Dados / IA / MCP | Code-exec, extract, skills persistentes | python runner, graphify **lab** | ingerir CONSCIENCIA sem quarantine |
| #3 | Integração cloud | Drive/Notion **sob ordem** | connectors mock/lab | credenciais no git |
| #4 | Segurança | Redaction, audit, bloqueio de push sujo | regex scan, audit log | desligar scan “pra ir mais rápido” |
| #5 | Full-stack legado | Extensão aditiva de código | patch files lab/repo branch | rewrite V3 |
| #6 | Orquestrador | Fila, gates, critic loop, notify | state machine | bypass gate |
| #7 | Telemetria | CPU/RAM/disk, health | metrics lab + leitura prod se AUTH | restart por “memória alta” sem ordem |

## Agentes técnicos opcionais no lab (plugins aditivos)

| Agent | Função | Mapeia para |
|-------|--------|-------------|
| `code-exec` (tipo mcp-code-exec-agent) | Escreve/roda Python, salva skill | #2 |
| `critic` | Revisa diff e critérios | #6+#4 |
| `security-scanner` | Tokens em output | #4 |
| `graph-worker` | extract/label com safe-mode | #2 |
| `notify-bridge` | Telegram no EXIT | #6 |

## Contrato mínimo de cada agente

```yaml
name: string
boot: 1-7
system_prompt: path
tools_allow: [list]
tools_deny: [list]
timeout_s: int
max_tokens_budget: int
workdir: /lab/...
success_criteria: [...]
```

## Regra de ouro

**Um agente = um setor.**  
Se o builder começa a fazer sysadmin → orch **rejeita** e re-despacha ao #1.
