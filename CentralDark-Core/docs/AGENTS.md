# AGENTS — ponte de compatibilidade

Este caminho existe apenas para consumidores históricos que ainda procuram `docs/AGENTS.md`.

## Fonte canônica

Antes de qualquer ação, carregar nesta ordem:

1. `CentralDark-Core/CENTRALDARK_AI_BOOT.yaml` na raiz GitHub.
2. `CentralDark-Core/LEIA-ME-IA.md` na raiz GitHub.
3. Resolver `AGENTS.md` e os demais owners pelo mapa vigente do BOOT.
4. Consultar `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` somente no contexto pertinente.

Os caminhos relativos de documentação deste arquivo continuam relativos ao Core. A ordem BOOT → LEIA e o método de execução pertencem aos owners atuais, sem entrada concorrente.

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


## Regra operacional — caminhos absolutos persistentes

Esta seção documenta o procedimento de compatibilidade; o owner canônico permanece em /AGENTS.md e no instalador existente. Em toda instalação, atualização ou mudança de rota, identificar a raiz persistente real do host, resolver caminhos absolutos e conferir o processo que consome a configuração. Nunca tratar cópia de arquivos como deploy.

Hostinger, observação de 20/11/2026: projeto copiado em `/data/CentralDark/` (apps, docs, scripts); MCP ainda executava `/data/cache/scratch/CentralDark/apps/modulos/mcp/src/index.js` pelo watchdog `/data/scripts/centraldark-mcp-watchdog.sh`. Scratch é temporário; não usar como destino durável.

Para a futura instalação na Contabo pelo `install.sh` e fork CentralDark/Hermes: detectar e parametrizar a raiz persistente do destino (reutilizar variável existente antes de criar outra), derivar caminhos absolutos de apps/scripts/docs/MCP/watchdog, verificar permissões e caminhos com realpath, validar comando/cwd do processo e configuração consumida, testar e registrar readback. Não assumir que Contabo tem a mesma estrutura /data da Hostinger. Não criar segundo motor, túnel, MCP ou instalador. Preservar cofre e segredos fora do Git. Nenhuma migração de runtime, restart, merge ou deploy sem autorização e gates. `COPIED != RUNNING`; `DOCUMENTED != EXECUTED`; `UNKNOWN != PASS`.
