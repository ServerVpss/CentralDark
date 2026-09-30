# Receipt — REMEASURE_BEFORE_CREATE

Data: 2026-09-24
Owner canonico: .agents/skills/centraldark-operational-method/SKILL.md

## Fato confirmado

- MEASURE_BEFORE_CREATION ja existia e continua sendo o padrao owner.
- REMEASURE_BEFORE_CREATE foi cristalizado como alias/especializacao temporal, sem aumentar o numero de padroes independentes.
- O gatilho e estado vivo/mutavel, medicao envelhecida ou possibilidade de drift.
- Historico/receipt e proveniencia; nao substitui CURRENT quando o fato pode ter mudado.
- Falha de sensor nao vira falha do mundo; rota autorizada alternativa deve ser tentada antes de BLOCKED.
- Sensores conflitantes nao sao decididos por maioria; exigem teste discriminante ou UNKNOWN.

## Bot

apps/bot-telegram/contexto-centraldark.cjs agora le as flags operacionais diretamente de LEIA-ME-IA.md e as injeta no contexto das IAs. O bot nao virou novo owner de governanca.

## Duvidas / UNKNOWN preservados

- Esta mudanca de source nao prova que todos os processos de bot ja recarregaram o arquivo em runtime. SOURCE_CHANGED != BOT_RUNTIME_RELOADED.
- A VPS operacional /root/CentralDark estava em ec52fad8... e suja durante a criacao; a escrita foi feita em worktree limpa baseada em origin/main=6fce1850....
- Windows SEGREDO estava offline no sensor Remote Desktop; nenhum claim de WebAuthn/passkey foi promovido.
- Omni Router :8099 continua divida separada ate re-medicao do runtime; esta regra nao pinta a porta de verde.

## Prova esperada

1. JSON/registry valido.
2. Gate validar-interligados-pr-padroes.mjs PASS.
3. node --check apps/bot-telegram/contexto-centraldark.cjs PASS.
4. montarContexto() contem REMEASURE_BEFORE_CREATE=true.
5. Diff restrito ao owner, porta universal, registry, bridge do bot e este receipt.