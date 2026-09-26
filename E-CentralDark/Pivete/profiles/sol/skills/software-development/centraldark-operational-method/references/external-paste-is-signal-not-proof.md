# OUTPUT DE OUTRO AGENTE / PASTE = SINAL, NÃO PROVA

## Padrão recorrente (PR #1165, 2026-08-25)
O CHEFE cola numa tacada só: relatório de calibração de outro Hermes/oráculo, JSON de review do Codex, dump de `git diff`/`+numstat`, e trechos de SKILL.md com `:LINHA`. Tudo vestido de "PROVADO"/"QUEBRADO"/"FIXED_POINT".

## Regra cristalizada
- Paste de outro agente/sessão/chat = **SINAL CONTEXTUAL**, nunca evidência do estado vivo.
- `PROVADO`/`QUEBRADO`/`FIXED_POINT` escrito por outro = afirmação dele, não medição sua.
- Se o alvo é R2/R3/R4 (merge, deploy, VPS, exclusão), **trave e remeça o estado vivo você mesmo** (READ_ONLY) antes de agir:
  - `gh pr view ... --json headRefOid,mergeable,statusCheckRollup` (autenticado — `gh` logado como `segredounlock` funciona; `curl` anônimo na API GitHub dá 404)
  - `git ls-remote origin refs/heads/main` + `git fetch` + `git diff --numstat main...<HEAD> -- AGENTS.md`
  - `rg`/`git grep` no checkout real, não no trecho colado
- **Prova de timestamp/material próprio > relato alheio.** O outro pode ter medido um HEAD anterior, um escape de escopo, ou inventado. Coincidência temporal entre pastes ≠ causa (ver lição CONCEITO ≠ PROCESSO / FÍSICO→TEMPORAL→CAUSAL→PROVA).
- **Anti-teatro estendido:** não reproduza "shot em tempo real"/print da VPS se não tem acesso ao host. Declare `STATE_GAP` e peça host/IP ou conector. Imagem inventada é violação de contrato, não "ajeita depois".
- **Quando o paste estiver certo:** use como rota de investigação, não como veredito. Confirme no seu próprio canal e só então avance.

## DNA compartilhado
Mesmo princípio da regra de comunicação "OUTPUT COLADO NÃO É EVIDÊNCIA" e da Lição 43 (VPS anti-fake-proof). Diferencial desta nota: o *volume* de paste pode mascarar ausência de medição própria. Papagaio OFF significa medir o delta real, não reenviar o relatório alheio como se fosse seu.

## Verificação rápida
Antes de agir sobre paste alheio em alvo R2+:
1. Eu medi o estado vivo eu mesmo? (gh/git/rg no meu canal)
2. O HEAD/SHA que eu medi é o mesmo do paste? (snapshots velhos enganam)
3. Há algum bloqueio material real? (acesso, Writer, autorização)
Se não mediu → remeça. Se mediu e confere → avance com a própria evidência.
