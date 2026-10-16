# Receipt: ZENDRIVE CLI 0.1.1 -> Builder -> Galeria

Data da medicao: 2026-10-16T21:18:33Z
Alvo: ServerVpss/CentralDark@main
HEAD local medido: 80c906a1316b356efadb9cf30a99adfd001821f7
HEAD remoto main medido: 57e06f2d51e67c31d3c8b8ae78c215fcb810d0cf
Referencias: a743b66c3f, 35165b57d4, PR #1820

## Placar C01-C12

| ID | Claim | Estado | Evidencia |
|---|---|---|---|
| C01 | Owner | PASS | DesignCenter/CockpitShell; skills/vs-code-restore; log bridge; log-funnel; Hermes Core permanecem separados |
| C02 | Main | UNKNOWN | main remota medida em 57e06f2d5; checkout local em 80c906a; local sujo com 36 entradas e divergência |
| C03 | Galeria | PASS_SOURCE | Galeria autenticada existe em DesignCenter e referencia ZENDRIVE CLI/PR #1820 |
| C04 | Auth | PASS_SOURCE / RUNTIME_UNKNOWN | CockpitShell passa autenticado=true da sala autenticada; domínio admin não resolveu nesta sessão |
| C05 | Extensão | PASS_SOURCE | centraldark.zendriveCli existe; fonte atual declara pacote 0.1.2; SKILL.md ainda documenta 0.1.1 |
| C06 | Terminal | PASS_SOURCE | comando reutiliza terminal existente/foco; não criar executor paralelo é regra do owner |
| C07 | Logs | UNKNOWN_CURRENT | fonte Casa -> Tailscale -> VPS -> MCP está documentada, mas VPS não foi alcançada por SSH nesta sessão |
| C08 | Idempotência | PASS_SOURCE | receita e bridge documentam offsets/duplicate=0; readback atual do runtime não realizado |
| C09 | TypeScript | FAIL_BASELINE | tsc --noEmit falha em erros preexistentes fora do delta ZENDRIVE; extensão isolada compila |
| C10 | Build | PASS | apps/instinto-superior npm run build concluiu, client/SSR/Nitro gerados |
| C11 | Runtime | UNKNOWN | health/deploy/publicação do Builder não puderam ser readback nesta sessão |
| C12 | Contraprova | PARTIAL | extensão compile PASS; galeria/source PASS; auth/runtime/SSH/deploy pendentes |

## Comandos e resultados

- `apps/instinto-superior`: `npm run build` PASS.
- `skills/vs-code-restore`: `npm run compile` PASS.
- `apps/instinto-superior`: `npm run lint` FAIL com 19.431 erros de Prettier/CRLF no escopo amplo; não corrigido para não sobrescrever trabalho existente.
- `apps/instinto-superior`: `tsc --noEmit` FAIL com erros existentes em componentes/libs não específicos do ZENDRIVE.
- `admin.centraldark.com`: DNS não resolveu nesta máquina; autenticação e navegação real não provadas.
- SSH alias `centraldark-vps`: hostname não resolveu; runtime VPS/MCP não provado.
- PR #1820: estado MERGED, mas merge não prova deploy.
- GitHub main: HEAD remoto 57e06f2d5; checks recentes incluem workflow Trigger Fabric queued/cancelled/skipped, sem PASS de publicação da galeria nesta medição.

## Correcoes

Nenhuma correção de código aplicada nesta rodada. O source já contém os deltas de a743b66 e 35165b5. A discrepância observada entre a ficha/skill 0.1.1 e o manifesto fonte 0.1.2 foi preservada como UNKNOWN de versão/runtime; não é seguro declarar qual pacote está instalado na Casa sem readback.

## Fixed point

FIXED_POINT=false.

Blockers exatos:

1. DNS/rota de `admin.centraldark.com` indisponível nesta sessão; impede prova visual autenticada da galeria.
2. Host SSH do VPS não resolvido; impede prova atual Casa -> Tailscale -> VPS -> MCP e leitura de `/root/CentralDark`.
3. Local `K:\` está divergente/sujo; não executar pull/reset/clean nem publicar a partir dele.
4. Manifesto fonte `skills/vs-code-restore/package.json` = 0.1.2, enquanto a ficha/receita alvo é 0.1.1; instalação/runtime não pode ser inferida do source.
5. `MERGED != DEPLOYED`: publicação do Builder permanece UNKNOWN.

NEXT_CURSOR=REMEASURE_AUTH_DNS_AND_VPS_ROUTE_THEN_READBACK_MAIN_RUNTIME; PRESERVE_DIRTY_K; DO_NOT_DEPLOY
