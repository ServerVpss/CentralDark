# CENTRALDARK MASTER — arquitetura viva cristalizada

**Interface:** `!CENTRALDARK <objetivo>` ou `#CENTRALDARK <objetivo>`  
**Política padrão:** melhorar o que já existe  
**PEGATUDO:** embutido  
**DELTA externo:** 1  
**Arte visual fornecida:** 9 imagens preservadas  
**Arquivo histórico garimpado:** 1496 arquivos indexados, 865 hashes únicos

## O que mudou nesta cristalização

1. A cadeia completa da Multibússola foi absorvida.
2. `LOCAL_FIXED_POINT` não pode mais encerrar a missão.
3. Horn/Herbrand virou mecanismo executável de fecho e contradição.
4. `/meta` do GitHub virou sensor de realidade do provider, sem substituir assinatura de webhook.
5. SHA-256 virou camada explícita de integridade, sem ser confundido com autenticação.
6. Screenpipe virou Evidence Provider global, sem segundo recorder.
7. Conteúdo externo/anexo virou `DATA_ONLY`; instrução embutida não ganha autoridade.
8. Fontes salvas com material sensível são quarantined e não são copiadas para o pacote.
9. `PERMITO SEGREDO.zip` foi indexado inteiro por path/hash/classificação sem promover duplicatas.
10. Artes fornecidas foram preservadas com hash e dimensão e continuam separadas de prova técnica.
11. Infra: extensão > substituição, patch no owner, zero regressão, sem V2/V3/V4.
12. Deploy: micro primeiro quando suficiente, mas Rolling/Canary/Blue-Green são escolhidos por risco.

## Navegação

- `architecture/00-ARQUITETURA-MASTER.md`
- `02-CENTRALDARK-MASTER.yml`
- `architecture/01-HORN-HERBRAND-FIXED-POINT.md`
- `architecture/02-GITHUB-PROVIDER-REALITY.md`
- `architecture/03-SCREENPIPE-EVIDENCE-PROVIDER.md`
- `architecture/04-ESCAPE-CLOSURE.md`
- `architecture/05-DEPLOY-SELECTOR.md`
- `architecture/06-INTEGRIDADE-SHA256.md`
- `architecture/07-INFRA-LEGADO-ZERO-REGRESSAO.md`
- `art/INDEX.html`
- `legacy/PERMITO-SEGREDO-SUMMARY.json`

## Promoção

Este pacote melhora o artefato existente. Ele não é um segundo owner do repositório.
Antes de promoção no repo vivo, medir `main`, owner, lineage, gates e HEAD atuais.


## Extensão atual - HUB + Gemini Context Fabric

- qualquer gatilho reconhecido entra uma vez em `!CENTRALDARK`;
- `#ACORDAR -> #CRISTALIZAR · MEASURE -> #CRISTALIZAR · FALLBACK` é prefixo material obrigatório;
- o HUB existente é um contêiner de N apps/providers/connectors/models/capabilities, não um app único;
- o `centraldark-router` existente é reutilizado, nunca duplicado;
- Gemini entra como reader especializado para varredura de contexto seguro, nunca como writer/judge;
- Drive/Workspace persiste contexto destilado, receipts e NEXT_CURSOR;
- GitHub/Drive fazem fallback sem virar duas autoridades;
- os fluxos canônicos Mermaid estão em `diagrams/`;
- `docs/CENTRALDARK-MASTER-PEGATUDO-20260831-ARQUITETURA.pdf` é a visualização PDF do mesmo contrato.

Estado operacional de GitHub/Gemini/OAuth deve ser remedido no ambiente alvo; documentação não é prova de runtime.


## Documentation Hub

This same package now contains a mandatory, searchable documentation contract for the CentralDark panel: triggers, ports/services, API routes, providers/accounts, media library, PR/worktrees, Mermaid diagrams, receipts/proofs, glossary and global search. See `architecture/13-DOCUMENTATION-HUB-KNOWLEDGE-LIBRARY.md`, `integration/documentation-hub.yml`, `docs/DOCUMENTACAO-CENTRALDARK.md`, and diagrams `09`-`13`.

## One-command inventory → site readiness

The same package now treats `!CENTRALDARK` as the single operator command for mission recovery, universal inventory, reconciliation, improvement, testing, documentation and deploy readiness. `>>`/`>>>` advance the canonical parser; `<<`/`<<<` force reverse re-measure/reconciliation. Inventory alone stops at `READY_FOR_DEPLOY`; explicit deploy intent continues through the existing deploy selector. See `integration/one-command-inventory-site.yml` and `architecture/15-ONE-COMMAND-INVENTORY-TO-SITE-READINESS.md`.

## Capability harvest + media/caption + dense handoff

The same package now turns useful discoveries into explicit dispositions instead of stopping at search. Approximate/missing skill names are resolved by capability and existing owner rather than fabricated. Player debug JSON is treated as a media locator, while caption tracks are measured from observed track metadata/request sources before any complete-transcript claim. Machine handoffs use a dense `[SKILL][TRIG][OWNER][IN][PRE][EXEC][OUT][PROOF][FAIL][NEXT][REV]` frame: grammar may shrink; semantics/proof may not. See `architecture/16-CAPABILITY-HARVEST-MEDIA-HANDOFF-RECOVERY.md`, `integration/media-caption-handoff.yml`, `scripts/youtube_debug_locator.py`, and diagram `15`.


## DELTAUTIL + Gemini Modal + Workspaces/Plugins

The existing `!DELTAUTIL` owner is reused inside the master as `DELTAUTIL_RECONCILE`. A compact semantic retrieval layer may sacrifice grammar but never semantics, proof, authority or failure boundaries. The HUB gains Workspaces, Plugins, Connections, Delta Inbox and a read-only Gemini Modal showing deterministic compatibility/readiness/security-gate/risk metrics plus colored status dots. Percentages/colors are decision aids, not proof. External panels are embedded only when provider CSP/X-Frame-Options allow it; otherwise CentralDark renders a native/API-backed panel or performs only the provider-required one-time authorization outside.


## Update Fabric / Builder / temporal ledger

Updates may arrive via Drive, GitHub, CLI, terminal, SSH, authorized webhook or HUB upload. `DELTAUTIL` activates Update Fabric only when the delta is material. The same logical package is updated in place; dated visibility is stored under `releases/YYYY-MM-DD/`, while human UI/CLI uses pt-BR date/time with timezone. Builder outputs are candidates/factory artifacts and require documentation, tests, counterproof and recovery before promotion.


## Cross-session / OAuth / Hermes Speed Fabric

O mesmo DELTAUTIL agora reconcilia chat/janelas, Personal Context, tasks agendadas, Drive, GitHub quando disponível, CLI/worktrees e webhooks autorizados. Histórico não vira estado atual sem re-medição. O HUB ganha um OAuth Control Plane explícito: CONNECT/REAUTHORIZE/REFRESH/TEST/DETAILS/DISABLE/REVOKE; authorization codes são efêmeros e nunca viram tokens genéricos de plugin. Hermes Speed Fabric escolhe Python/PowerShell 7/rg/fd por feature detection e usa cache delta-aware + K mínimo de leitores, evitando rescans e trabalho duplicado. Visual CLI (Fastfetch/Btop/Cava/Pipes/Aafire) permanece opcional até instalação ser medida.

## Documentação da Casa + CLI própria + Hermes Upstream Bridge

Código material passa por `CODE_DOCUMENTATION_GATE`: cada faixa relevante de linhas deve ser rastreável a símbolo/bloco, owner, contrato, testes e prova. O código permanece liso; a documentação é dupla: vista técnica profissional e mapa mental PT-BR. Comunicação padrão é `TRABALHO`; `RESENHA` só entra por intenção explícita.

Peças principais usam `plugin/capability-package-contract.yml` para instalação plug-and-play no owner correto. A CLI CentralDark permanece carcaça/control plane do operador; Hermes oficial é upstream de runtime/capabilities. Atualizações são medidas, classificadas, ensaiadas em sandbox e absorvidas por adapter/overlay somente após testes e contraprova. Ver `architecture/21-DOCUMENTACAO-DUPLA-E-HERMES-UPSTREAM-BRIDGE.md`.

Ferramentas modernas JS/TS pesquisadas em 31/08/2026 ficam como candidatas, não instaladas automaticamente: Oxlint, Biome, Rolldown e TypeDoc. Adoção exige shadow mode e equivalência/regressão antes de substituir owner atual.


## Reconciliação total — Casa + VPS + GitHub + Drive

Entrada portátil: `commands/RECONCILIAR-TOTAL.yml`. O comando separa estado desejado (GitHub), estado real (Casa/VPS), espelhos duráveis (Drive), pacote candidato e eventos de webhook; inventaria em read-only, reconcilia no owner existente, aplica delta mínimo com um writer por escopo, testa, contraprova, exige CI no HEAD candidato e só então marca aceitação técnica. Merge/deploy continuam autoridades separadas.
