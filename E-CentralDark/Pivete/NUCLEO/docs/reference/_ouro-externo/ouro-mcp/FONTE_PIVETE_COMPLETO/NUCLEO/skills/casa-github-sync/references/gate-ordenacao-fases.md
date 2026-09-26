# Gate de Ordenação de Fases — Casa↔GitHub Sync

Quando Casa↔GitHub Sync vira R2 e por quê. Adaptado do SOUL §7 (Casa-ops)

## R0 — leitura, busca, inspeção, comparação
- comandos só de leitura
- executa sem pedir, mostra evidência
- exemplos: `git status`, `git log`, `git rev-parse`, `find`, `ls`, `cat`

## R1 — reversível e isolado localmente
- executa, mantém rollback e reporta curto
- exemplos: `git diff`, `git checkout` (sem mudança), `tar -czf` local

## R2 — altera estado/configuração interna
- prepara backup + diff
- executa com autorização aplicável e atual
- **exemplos neste skill**:
  - FASE 3 (decidir manifest) — pede OK consolidado
  - FASE 4 (`git add` + `git commit`) — exige OK por fase
  - FASE 4 (`git push`) — PUSH SÓ COM ORDEM LITERAL (REGRA #20)
  - qualquer unificação de paths duplicados (motor/ vs hermes-mente/)

## R3 — destrutivo ou dados críticos
- propõe, prova rollback e espera ordem literal
- **exemplos neste skill**:
  - excluir um dos `HOJE.md` (drift grande)
  - renomear `hermes-mente/` → histórico
  - mover/limpar BACKUPS antigos
  - criar symlink (proibido neste skill)

## R4 — VPS, produção, externo, dinheiro
- somente com ordem explícita, atual e específica
- **não aplicável** a Casa↔GitHub Sync (skill de Casa local)
- se a sync implicar deploy/VPS, **encerrar este fluxo** e abrir `centraldark-pr`

## Tabela de transição automática

| Fase | R? | Por quê |
|------|-----|---------|
| 0 — Desconfiar | R0 | só leitura (find, diff, ls) |
| 1 — Provar | R0 | só git status/log |
| 2 — Drift | R1 | classificar exige comparar estados |
| 3 — Decidir | R2 | decisão sobre o que vai entrar |
| 4 — Executar (commit) | R2 | muda estado (commit local) |
| 4 — Executar (push) | R2 com trava | PUSH SÓ COM ORDEM (REGRA #20) |
| 5 — Provar | R1 | só leitura do estado novo |
| 6 — Regressão | R0 | só leitura |

## Quando PARAR

REGRA #21 do SOUL: incentivo ≠ autorização. Se o Pivete disser "faz aí" sem estar
claramente em R2 ("commita", "sobe"), **NÃO** executar push. Pausar e perguntar.

REGRA #22 (Modo Casa): direção clara + risco baixo → executa. Mas push tem
custo de publicação mesmo local, então **não** cai no fluxo automático.

## Anti-zona-burra (gate #8 do anti-zona-burra-gate)

Antes de propor plano, verificar que o caminho **oficial** > URL ou caminho inventado.
Em 07/08, o path "esperado" (`E:\CentralDark`) não era repo. Cherchez: `git rev-parse --is-inside-work-tree`.
Caminho oficial comprovado > invenção.

## Quando drift = parada

HOJE: motor/03-memoria/memoria/HOJE.md (1490B) e hermes-mente/memoria/HOJE.md (0B).
Se **ambos** tiverem conteúdo divergente **e nenhum estiver 0B**, o sync trava até
decisão consolidada do Pivete (qual é canônico, se consolida, se descarta o órfão).
Manifesto obrigatório com hash dos dois antes de qualquer unificação.
