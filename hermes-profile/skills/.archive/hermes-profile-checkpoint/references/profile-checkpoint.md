# Profile Checkpoint — Inventário de 9 Núcleos (sessão 28/07)

Snapshot real executado em `E:\CentralDark\Pivete\BACKUPS\hermes-pivete\checkpoint_zero\`.
Validação: `DEST_VALID=True`, `RESTORE_VALID=True` (restore isolado em `restore-test\`).

## Topologia (2 volumes)
- **A — NUCLEO** `E:\CentralDark\Pivete\NUCLEO\motor\`
- **B — PROFILE** `C:\Users\danda\AppData\Local\hermes\profiles\pivete\`

## 9 Núcleos (key, path, size, sha256[:16], source)
| key | path | size | sha[:16] | source |
|---|---|---:|---|---|
| A1_04-COMUNICACAO.md | motor/01-identidade/04-COMUNICACAO.md | 2989 | c22e8bb0edb56a65 | local |
| A2_HOJE.md | motor/03-memoria/memoria/HOJE.md | 4286 | 1e1b9bfe530e16d4 | local |
| A3_SEMANA.md | motor/03-memoria/memoria/SEMANA.md | 1385 | fdad6d183ea83084 | local |
| A4_REGRAS.md | motor/03-memoria/memoria/REGRAS.md | 6853 | 64e14f7124407885 | local |
| B1_SOUL.md | profiles/pivete/SOUL.md | 23189 | 618f86921aecc659 | local (readonly_copy) |
| B2_config.yaml | profiles/pivete/config.yaml | 12906 | cd06ee66c83ce01d | local (hash-only) |
| B3_vision-fallback-autoresilient | profiles/pivete/skills/vision-fallback-autoresilient/SKILL.md | 1884 | 94998ce306d1e5ab | local-custom |
| B4_pivete-resposta | profiles/pivete/skills/pivete-resposta/SKILL.md | 4112 | 737f567318247959 | local-custom |
| B5_meta-lupa | profiles/pivete/skills/meta-lupa/SKILL.md | 18412 | 5e1d36895ab2136b | repo-sync |

## Ressalvas (não-falso-verde)
1. **HOJE.md / SEMANA.md defasados**: header 26/07, conteúdo 28/07. CHECKPOINT_ZERO
   preservou assim de propósito (prova de estado); corrigir data ANTES do CHECKPOINT_UM.
2. **meta-lupa = repo-sync**, não custom. No manifest: `source=repo, readonly_mirror=true`.
   Hash local DIVERGE do remoto (ver `git-skill-audit.md`) — alertar, nunca auto-sobrescrever.
3. **config.yaml sensível**: só `sha256`+size+mtime no manifest. Nunca imprimir conteúdo,
   nunca Git, backup com ACL restrita.
4. **Destino FORA da árvore copiada**: `E:\CentralDark\Pivete\BACKUPS\...` (não `NUCLEO\motor\backups\`)
   para evitar recursão de backup.
5. **Perfil no cron**: agente roda como `default`; escrever em `pivete` exige `cross_profile=True`
   ou contexto `pivete`. `restore-test\` é artefato de teste, não fonte do próximo checkpoint.
6. **Candidato de chat externo** (`53de5ca0…`, `INSTALADA=NAO`) NUNCA entra no checkpoint ativo (REGRA 11).
