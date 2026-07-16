# 07 — Lab sandbox Docker (único lugar “livre”)

> Desenho. **Não sobe** até AUTH: “sobe o lab”.

---

## Objetivo

Ambiente onde o BOOT #6 e o enxame podem:

- criar/refinar agentes  
- rodar loops  
- usar internet/websearch  
- persistir skills  

**sem** escrever em apps protegidos do CentralDark.

## Path sugerido (fora do core de apps)

```
/root/chatops-lab/          # ou path que o operador definir
  compose.yml
  .env.example              # sem valores secretos
  orch/
  agents/
  skills/                   # memória de habilidades
  out/                      # evidências
  state/                    # state machine
  webhook/                  # receiver autenticado
```

## Serviços mínimos

| Service | Função |
|---------|--------|
| `orch` | BOOT #6 state machine |
| `runner` | code-exec / jobs |
| `critic` | critic+refino |
| `webhook` | host → lab ticks |
| `llm-gw` | proxy opcional p/ LLM |

## Host (fora do container)

| Peça | Função |
|------|--------|
| cron ou webhook timer | Mantém loop 24h |
| volume bind | Persiste skills/out/state |
| notify hook | Telegram no EXIT (AUTH) |

## O que o lab NÃO monta

- `/root/CentralDark/secrets`  
- sockets docker do host com poder irrestrito (se evitável)  
- rede bridge aberta sem auth no webhook  

## Critério “lab online”

```
GET /health → 200
orch state readable
último tick < 2x intervalo cron
```

## Relação com CentralDark

```
Lab ──(só AUTH + strangler + flag)──► Produção
```

Nunca o contrário (prod controlado pelo lab sem gate).
