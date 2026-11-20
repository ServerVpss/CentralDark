# Relatório — Auto-Registro Obrigatório da Lupa Bayesiana (Fonte da Verdade)

**Data:** 2026-07-22
**Autoridade:** Pivete (PERMITO PIVETE SEM AÇÃO DESTRUTIVA)
**Executor:** Hermes (profile pivete)
**Skill canônica:** `.agents/skills/lupa-bayesiana/SKILL.md`
**Branch de missão:** `feat/lupa-auto-registro-fonte-verdade-2026-07-22-1600` (de `origin/main` `e205f9f0`)

## Objetivo
Implementar mecanismo automático, idempotente, auditável e recuperável para
registrar CADA uso real da `lupa-bayesiana` no repo fonte da verdade, sem V2.

## Mecanismo anterior
A skill tinha `scripts/lupa_bayesiana.py` (só cálculo) + `references/*.md` +
`testes/test_lupa.py`. Nenhum registro de uso persistido.

## Lacuna encontrada (lupa Fase 1)
Nenhum recibo de uso era gravado. "Usei a lupa" era afirmação, não prova
persistida na fonte da verdade.

## Arquivos reutilizados (sem duplicar)
- `scripts/lupa_bayesiana.py` — AMPLIADO com subcomandos `begin-use`,
  `finish-use`, `verify-ledger`, `promote-learning` (mesmo arquivo, não V2).
- `references/uso-ledger.jsonl` — LEDGER append-only dentro da skill.
- `testes/test_lupa.py` — ESTENDIDO para 32 casos (7 matemáticos + 25 auto-registro).

## Schema (uso-ledger.jsonl)
Eventos BEGIN e FINAL por `usage_id = SHA256(schema_version+repo+mission_id+
skill_commit_sha+workspace_head)`. Campos ausentes = null/[]/0.

## Anti-recursão
`LUPA_REGISTRATION_MODE=1` desliga abertura de recibo aninhado. Testado.

## Idempotência
BEGIN duplicado não regrava. FINAL com mesmo `record_hash` retorna sucesso.
FINAL divergente → BLOQUEAR (return 2). Testado.

## Sanitização
Padrões de token/key/IP/Bearer/.env substituídos por `[REDACTED]` antes do
append. Testado (10/11/12 do contrato).

## Recuperação
`verify-ledger` detecta BEGIN sem FINAL (órfão). Missão interrompida pode ser
finalizada com `result=BLOQUEADO` sem apagar BEGIN. Testado.

## Trailers de commit
Todo commit de missão que usou a lupa inclui trailers `Lupa-Used`,
`Lupa-Usage-ID`, `Lupa-Skill-Path`, `Lupa-Skill-Commit`, `AutoLupa`,
`Point-Fixed-Evidential`. Parser testado.

## Boot obrigatório
Marcadores `LUPA_BAYESIANA_BOOT_REQUIRED` / `LUPA_USE_RECEIPT_REQUIRED`
inseridos em `CLAUDE.md`, `AGENTS.md`, `README.md` (somente existentes).

## Testes
```
python testes/test_lupa.py
TOTAL=32 PASS=32 FAIL=0
```
Cobrem os 25 casos obrigatórios do contrato + 7 matemáticos preservados.

## AutoLupa sobre o próprio mecanismo (achados + correções)
1. **Append quebrado (BUG real):** `_append_atomic` usava `os.replace(tmp,path)`
   que SOBRESCREVIA o ledger a cada escrita — só o último recibo existia.
   Corrigido: reler conteúdo existente + acrescentar antes do replace.
   Prova: antes 4 FAIL (final_unique/replay/conflict em branco); depois 32/32.
2. **test_absence_blocks_boot** renomeava a pasta viva no Windows (WinError 32).
   Corrigido: testar path ausente diretamente, sem mover a skill.
3. **Corrida de escrita (caso 11):** adicionado lock de arquivo cross-platform
   (msvcrt no Windows, fcntl no Linux).

## Gates de parada
- Sem merge, deploy, restart, force-push, VPS, secrets. ✅
- Área protegida §9.2 não tocada. ✅

## Riscos residuais
- Ledger é plaintext local; recomendar `.gitignore` de `*.lock` e `uso-ledger.jsonl`
  se não quiser histórico de uso versionado (decisão do Pivete).
- `promote-learning` abre gate mas não auto-escreve APRENDIZADOS (exige validação
  humana/crítica — por design, evita XP inflado).

## Próxima ação mínima
Pivete revisar PR draft (label `permito-pivete`). Sem merge até ok.

## PONTO_FIXO_ATINGIDO: sim
