---
name: hermes-profile-checkpoint
description: "Class-level intelligent checkpoint/backup for the Hermes profile 'pivete' (template reproduzível p/ outros profiles editando os 9 paths do script). SHA256 delta + manifest + atomic copy + restore-test, exclude-self destination, custom-skills-only, config-hash-only. CHECKPOINT_ZERO before any fix. Load when the user wants to snapshot, revive, or protect the profile's operational core."
triggers:
  - "checkpoint / backup do perfil"
  - "reviver o hermes do mesmo jeito"
  - "salvar o núcleo a cada 30 min"
  - "snapshot antes de corrigir"
  - "manifesto de backup"
---

# Hermes Profile Checkpoint (class-level)

## Quando usar
Snapshot do núcleo operacional do profile para reconstruir exatamente o estado atual
(se pane, defeito ou perda). Não é cópia cega: é delta por hash + manifesto + restore-test.

## Topologia de 2 volumes (caso Pivete)
- **NUCLEO (cérebro/memória):** `E:\CentralDark\Pivete\NUCLEO\motor\`
  - `01-identidade/04-COMUNICACAO.md` (padrão textual-visual)
  - `03-memoria/memoria/HOJE.md`, `SEMANA.md`, `REGRAS.md`
- **PROFILE (runtime):** `C:\Users\danda\AppData\Local\hermes\profiles\pivete\`
  - `SOUL.md` (🔒 TRAVADO — só Pivete mexe; backup = cópia read-only)
  - `config.yaml` (sensível — só hash no manifest, nunca imprimir conteúdo)
  - `skills/<custom>/SKILL.md`

## Procedimento canônico
1. **CHECKPOINT_ZERO ANTES de corrigir** HOJE/SEMANA ou qualquer arquivo.
   Preserva o estado real (inclui inconsistências) como prova.
2. **Destino FORA da árvore copiável** (evita recursão):
   `E:\CentralDark\Pivete\BACKUPS\hermes-pivete\checkpoint_zero\` (não dentro de `NUCLEO\motor\`).
3. **Skills: só as custom comprovadas**, com proof:
   `vision-fallback-autoresilient`, `pivete-resposta`, `meta-lupa`(=repo-sync, ver abaixo).
   NÃO copiar as 30+ pastas cegamente (inclui candidato de chat externo — REGRA 11).
   Para cada skill: `EXISTE=`, `É_CUSTOM=`, `TEM_SKILL.md=`, `ORIGEM=`, `HASH=`,
   e se for link/junction registrar alvo sem duplicar.
4. **config.yaml:** copiar localmente, mas NO manifest só `sha256` + size + mtime.
   Nunca ler valores, imprimir conteúdo ou enviar ao Git.
5. **Cópia atômica:** escrever em `.tmp` e `os.replace` (sem corrupção se interromper).
6. **Manifesto:** por arquivo `path, sha256, size, mtime, volume(A|B), source, readonly_copy`.
7. **Validar destino:** re-hash do copiado == origem.
8. **Restore-test:** copiar dest→dir isolado e comparar com manifest. Só depois selar.
9. **Não agendar ainda** sem ordem literal. Cron de 30min vem DEPOIS de CHECKPOINT_UM validado.

## Skill provenance (Pitfall real desta sessão)
- `meta-lupa` é **repo-sync** de `ServerVpss/CentralDark/.agents/skills/meta-lupa`, NÃO custom.
  No manifest: `source=repo, readonly_mirror=true`. Alertar em hash-drift; NUNCA auto-sobrescrever.
- Blob SHA canônico (main): `c124497474f381ec86047fb93407b9e04fbdcf58` em `AUTOLUPA_CANONICAL_SHA`.
  Junction antiga do pivete (worktree `meta-lupa-runtime-final-*`) pode divergir — comparar SHA antes de selar checkpoint.
  Checkout alinhado conhecido: `E:\CentralDark\Pivete\CentralDark\.agents\skills\meta-lupa`.
- `lupa-bayesiana` é memória stale: 404 remoto + 0 local. Não referenciar como canônico.
- Candidato de chat externo (SHA `53de5ca0…`, `INSTALADA=NAO`) NUNCA entra no checkpoint ativo.

## Gate (não violar)
- CASA sempre; VPS por último (R4).
- SOUL intocável (REGRA 21); só cópia.
- Git = read-only audit (R0); `viewerPermission` null → escrita não provada.

## Support files
- `scripts/checkpoint_zero.py` — rotina exata que rodou (SHA validate + atomic + restore-test).
- `references/profile-checkpoint.md` — inventário de 9 núcleos + hashes desta sessão.
- `references/git-skill-audit.md` — `gh auth` + `gh api contents` + sha256 + diff; repo externo = candidato.

## Pitfalls
- NÃO colocar backup dentro da árvore que será copiada (recursão infinita).
- NÃO marcar `meta-lupa` como "custom comprovada" no manifest — é mirror de repo.
- NÃO usar `git -C` em paths de profile (MSYS quirk); usar `gh api` para audit.
- NÃO criar cron sem ordem literal do Pivete (REGRA 20: escopo atual).
