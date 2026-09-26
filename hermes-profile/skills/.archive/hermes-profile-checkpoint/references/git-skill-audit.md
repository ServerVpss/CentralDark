# Git Skill Audit — `gh api` (não `git -C`)

Técnica da sessão 28/07 para comparar skills locais do profile com o repo
`ServerVpss/CentralDark` **sem sobrescrever nada** (R0, read-only).

## Por que `gh api` e não `git -C`
Em path de profile (`C:\Users\danda\...\profiles\pivete`) o `git -C` falha com
"cannot change to ... No such file or directory" sob MSYS/bash do Hermes — é quirk de
conversão de path, **não** falha do Git nem ausência de credencial. Workaround: usar
`gh api` via HTTPS+token (não `git -C`). Salvo como workaround, nunca como "git não funciona".

## Sequência real (tudo R0)
```bash
# 1. Auth (scope repo confirma leitura)
gh auth status
# → github.com, Logged in segredounlock, Token scopes: ... 'repo' ...

# 2. Repo alcançável? lista skills raiz
gh api repos/ServerVpss/CentralDark/contents/.agents/skills --jq '.[].name'
# → algorithmic-art, audit-rls, brainstorming, canvas-design, frontend-design, meta-lupa

# 3. Arquivos da skill alvo
gh api repos/ServerVpss/CentralDark/contents/.agents/skills/meta-lupa --jq '.[].name'
# → AUTOLUPA_CANONICAL_SHA, SKILL.md, agents, approvals, guardrails, references, scripts, testes

# 4. SHA canônico do remoto
gh api repos/ServerVpss/CentralDark/contents/.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA \
  --jq '.content' | base64 -d
# → f165f949d6ef677b5f99a4814e36a95ffa394607  .agents/skills/meta-lupa/SKILL.md

# 5. Hash do SKILL.md remoto (base64 do content)
gh api repos/ServerVpss/CentralDark/contents/.agents/skills/meta-lupa/SKILL.md \
  --jq '.content' | base64 -d | sha256sum
# → 6888a06d...  (remoto, 19929b / 325 lin)

# 6. Hash local + diff (Python, fora do bash)
python - <<'PY'
import hashlib
p=r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\meta-lupa\SKILL.md"
h=hashlib.sha256(open(p,'rb').read()).hexdigest()
print("LOCAL_META_LUPA_SHA=",h)   # 5e1d3689... (18412b / 297 lin)
PY
# diff local vs /tmp/remote_ml.md (baixado no passo 5) mostra estrutura diferente
```

## Regras de ouro (REGRA 11 / REGRA 20)
- **Repo externo = CANDIDATO.** Nunca sobrescrever skill local com remoto sem ordem literal do Pivete.
- `viewerPermission=null` ⇒ **escrita NÃO provada** ⇒ tratar repo como READ-ONLY.
- `meta-lupa` local (`5e1d3689`) DIVERGE do remoto (`f165f949`): alertar no checkpoint, nunca auto-merge.
- `lupa-bayesiana` é **memória stale**: `search_files` local = 0, `gh api` remoto = 404. Não citar como canônico.
- Candidato de chat externo (`53de5ca0…`, `INSTALADA=NAO`) NUNCA entra no checkpoint ativo.
- CHECKPOINT_ZERO antes de qualquer merge/correção (preservar estado real).
- `config.yaml` / `.env` / `auth.json`: só hash no manifest, nunca conteúdo, nunca Git.
