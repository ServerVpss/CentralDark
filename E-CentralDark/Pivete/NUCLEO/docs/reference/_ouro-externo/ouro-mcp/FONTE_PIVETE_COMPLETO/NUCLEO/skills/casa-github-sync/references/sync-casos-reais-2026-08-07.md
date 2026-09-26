# Sync — casos reais documentados (populada a cada execução)

> Esta página documenta **execuções reais** da skill `casa-github-sync`. Cada caso
> carrega a evidência, a decisão tomada, e o que ficou como regra reutilizável.

## Caso 07/08/2026 — Drift `hermes-mente/memoria/` vs `motor/03-memoria/memoria/`

**Descoberta:** durante `#ACORDA` + busca do repo canônico, sessão achou **drift de
memória** no disco:

| Caminho | `HOJE.md` | `SEMANA.md` | `REGRAS.md` | Card-Mestre |
|---|---|---|---|---|
| `motor/03-memoria/memoria/` (canônico) | 1.490 B (vivo) | 5.897 B (vivo) | 21.333 B (vivo) | 3.203 B (vivo) |
| `hermes-mente/memoria/` (irmão) | **0 B** | **0 B** | **56 B** (só header) | — |

**Conclusão (com prova):** o `MEMORIA.md` da raiz `motor/03-memoria/` é o doc canônico
do design. Ele declara textualmente:

> "kit `hermes-mente` (3 temperaturas), fundidos de
> `E:\CentralDark\Pivete\NUCLEO\hermes-mente\01-MEMORIA-VIVA.md`. Os arquivos
> foram pra `03-memoria/memoria/`."

Ou seja: a fusão **já foi feita** em 19/07. O `hermes-mente/memoria/` é **casca
vazia** (resíduo histórico), não duplicação ativa. **Não é drift novo — é resíduo
de fusão antiga.**

**Como classificar:** `♻️ UNIFICAR` (não `🔴 CORRIGIR`). Tratar como lixo
arquivístico, não divergência que precisa merge.

**Ação proposta (aguarda OK do Pivete):**
1. Backup do `hermes-mente/memoria/` em `BACKUPS/hermes-mente-memoria-casca-20260807.tar.gz`
   + SHA-256.
2. Mover o diretório pra `hermes-mente/_deprecated/memoria/` (mantém estrutura, marca).
3. Não tocar no `hermes-mente/` RAIZ (que tem `00-NUCLEO-MORDOMO.md`,
   `01-MEMORIA-VIVA.md`, `02-ANTECIPACAO.md`, etc.) — esses podem conter ouro
   autêntico de 19/07 que AINDA não migrou pro `motor/02-cerebro/`. Audit
   separado antes de mexer.

**Aprendizado vira pitfall:** ver SKILL.md §Pitfalls, item "Drift real
hermes-mente/ vs motor/03-memoria/".

**Estado do sync:** PLANO PAUSADO aguardando decisão do Pivete (A: reorganiza
hermes-mente raiz, B: só duplicação de MEMORIA, C: audit sem mexer, D: A+B).
