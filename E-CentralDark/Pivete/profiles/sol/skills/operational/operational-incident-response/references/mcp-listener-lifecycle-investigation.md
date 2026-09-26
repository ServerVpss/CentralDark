# Investigação de Listener Lifecycle do MCP

Receita condensada da sessão 2026-08-27 para investigar e delimitar o ciclo de vida do listener do CentralDark MCP.

## Contexto operacional

MCPs podem apresentar **false green** de várias formas:
- PM2 `online` com processo sem listener real
- processo vivo mas sem porta ouvindo
- startup parcial por deploy/build não atômico

Antes de decidir restart ou deploy, delimitar o que foi provado vs. o que ainda é hipótese.

## T0/T1 obrigatórios (sequência mínima)

| Medição | O que prova |
|---|---|
| `POST /mcp` com status 200 em T0 | houve request autorizado bem-sucedido (não "nunca ouviu") |
| `PORT_9100_ABSENT` em T1 | porta ausente num instante específico |
| `PROCESS_ALIVE_T1` | processo com PID vivo no instante T1 |

Esses três formam o **par temporal mínimo**. Sem eles, qualquer afirmativa sobre listener é especulação.

## Invalidações que caem com essa evidência

- `never listened` → cai porque existe request MCP real com `status=200` em T0
- `message:mcp_listening` → cai porque o marcador correto deve ser procurado no campo `event`, não `message`
- `PM2 online` → não prova listener saudável; é falso verde possível
- `build não atômico / deploy incompleto / import ausente` → permanecem hipóteses; nenhum deles foi provado como causa sozinho nesta sessão

## Prova de atribuição de ouvinte → processo

Antes de declarar `LISTENER_LOST_WHILE_PROCESS_ALIVE`, provar que o ouvinte pertencia exatamente àquele processo/PID:

```
grep event:mcp_listening
grep event:hub_mission_consumer_started
bind workerId → PID
medir runtime git HEAD
medir dist/index.js mtime + hash
```

Se a atribuição fechar → analisar causa (deploy parcial, crash silencioso, lifecycle quebrado).
Se não fechar → causa permanece `UNKNOWN`; não inventar.

## Causa vs. falso verde

Dois fenômenos distintos que não se confundem:

1. **Bootstrap com import faltando** — processo inicia, imports falham, servidor Express nunca mantém listener, PM2 mostra online como falso verde.
   - Sinais: `ERR_MODULE_NOT_FOUND` nos logs de bootstrap, portas ausentes apesar de PID vivo, build local passando (dist/ não está atualizado na VPS).
   - Implicação: deploy/build não atômico.

2. **Listener perdido com processo vivo** — processo DMZ roda, mas o listener Express desaparece ou não inicia.
   - Sinais: `T0_MCP_REQUEST_200` provado em instante anterior, `PORT_9100_ABSENT` em T1, `PROCESS_ALIVE_T1` com mesmo PID.
   - Implicação: lifecycle quebrado, crash silencioso, ou listener que não alcançou bind.

## próximo cursor quando VPS desconhecida

Se a Casa não alcança a VPS (MCP 502, SSH DNS resolution fail), a investigação da Casa para:

```
bind structured log → workerId/PID
→ recover mcp_listening with event field
→ measure runtime git HEAD + dist mtime/hash
→ RECONCILIAR
```

E esperar pela medição remota — não simular execução, não declarar PASS com UNKNOWN material.

## Referências cruzadas

- `operational-incident-response` — protocolo geral de resposta a incidentes
- `centraldark-vps-operations` — operação remota quando a VPS voltar
- `centraldark-lupa-drift-guard` — quando a investigação tocar drift/versão
