# AGENTS — ponte de compatibilidade

Este caminho existe apenas para consumidores históricos que ainda procuram `docs/AGENTS.md`.

## Fonte canônica

Antes de qualquer ação, carregar nesta ordem:

1. `/LEIA-ME-IA.md`
2. `/AGENTS.md`
3. `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`

Este arquivo **não** define uma segunda identidade, segundo fluxo de deploy ou segundo contrato de agentes.

## Doutrina obrigatória

```text
CENTRALDARK = organismo canônico
REUSE_BEFORE_CREATE = obrigatório
EXTEND_EXISTING = preferido
V2_V3_NOVO_FINAL_COPY_BACKUP = proibido quando a capacidade já existe
MESMA_FUNÇÃO = evoluir owner canônico
UNKNOWN/SKIPPED/PENDING = não são PASS
SEGREDO/CHEFE = autoridade humana final
MODELO/AGENTE = capacidade substituível
```

Antes de propor reconstrução total, sistema paralelo ou novo entrypoint:

```text
localizar owner atual
→ abrir implementação
→ mapear consumidores/testes
→ provar gap material
→ aplicar menor extensão segura
```

Sem gap comprovado, a resposta correta é reutilizar, corrigir ou não mudar.

## Segurança

- nunca expor secrets, `.env`, tokens ou chaves;
- sem force-push;
- sem push direto de `main` local suja;
- sem deploy/restart/reset destrutivo fora da autorização aplicável;
- runtime só é exigido como prova quando o claim pertence ao runtime.

Histórico MultiZap permanece no Git e em documentação histórica; ele não dirige a identidade operacional atual da CentralDark.
