# 05 — Proposta de Estrutura Nova

> Gerado em: 2026-06-24 00:19:13 UTC

## Estrutura Atual (problemas)

```
/root/CentralDark/
├── revisoes/          ← 849 MB / 324 pastas — TODO LIXO
├── CentralDark/       ← Pasta com mesmo nome que root — SUSPEITO
├── quarantine/        ← Código morto — ARQUIVAR
├── apps/              ← 13 GB — node_modules inflam muito
├── logs/              ← Acumulando sem rotação
└── actions-runner/    ← 574 MB — necessário mas pesado
```

## Estrutura Proposta (após limpeza)

```
/root/CentralDark/
├── apps/              ← Código das aplicações (limpo de node_modules desnecessários)
├── docs/              ← Documentação + agentes
│   └── agente/        ← Pasta oficial de agentes (elite-mapper, infra-recovery...)
├── infra/             ← Caddy, Docker, configurações de infra
├── scripts/           ← Automações, crons, healthchecks
├── secrets/           ← Credenciais (nunca tocar)
├── security/          ← Políticas de segurança
├── skills/            ← Skills da IA
└── supabase/          ← Configurações do banco

# REMOVIDOS:
# ✗ revisoes/         → DELETAR (849 MB recuperados)
# ✗ quarantine/       → ARQUIVAR em storage externo
# ✗ CentralDark/      → INVESTIGAR (provavelmente apagar)
# ✗ logs/*.log antigos → DELETAR
```

## Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Espaço em disco | ~22 GB | ~18 GB |
| Pastas de revisão | 324 | 0 |
| Clareza da estrutura | Baixa | Alta |

## Ações Recomendadas (em ordem)

1. `rm -rf /root/CentralDark/revisoes/*` — **849 MB imediatos**
2. Investigar `/root/CentralDark/CentralDark/` — pode ser clone duplicado
3. Arquivar `/root/CentralDark/quarantine/` para storage externo
4. Configurar rotação de logs em `/root/CentralDark/logs/`
5. Revisar `apps/*/node_modules/` — instalar só o necessário