# combo-potencia install — session 2026-08-06

## Signal
Pivete: install full skillsllm Power Combo offline, easy name, ready for boom;
also check Claude CLI friends so there is no name/delta fight.

## Official paths (button first — no raw guess)
| Pack | GitHub | default_branch | Index strategy |
|---|---|---|---|
| ECC | affaan-m/ECC | main | router `cp-ecc` only; 281 skills stay in vendor |
| superpowers | obra/superpowers | main | all as `sp-*` (7 collided with Casa names) |
| hermes-agent | NousResearch/hermes-agent | main | pointer `cp-hermes-agent` → local skill |
| cc-switch | farion1231/cc-switch | main | `cp-cc-switch` (app; 0 SKILL.md in repo) |
| graphify | Graphify-Labs/graphify | **v8** | `cp-graphify` → `graphify/skill.md` |
| SkillSpector | NVIDIA/SkillSpector | main | `cp-skillspector` (scanner) |

## Layout that works
```
skills/combo-potencia/           # ~20 entry SKILL.md only
  SKILL.md                       # map name = combo-potencia
  packs/cp-* and sp-*
skill-bundles/combo-potencia.yaml
combo-potencia-vendor/           # OUTSIDE skills/ — full clones
```

## Failure caught mid-session
Putting `_vendor` under `skills/combo-potencia/` flooded `hermes skills list`
with hundreds of ECC names. Fix: move vendor out of the skills scan path.

## Casa preserved
claude-code, codex, opencode, hermes-agent SKILL.md untouched.

## Boom
`/combo-potencia` loads 7 entry skills; vendor remains on-demand.

## Related user-owned skills (need adopt to curator-patch)
- `anti-zona-burra-gate` — holds gate #8 CAMINHO_OFICIAL + tests
- `combo-potencia` — boom map
Recommend: `hermes curator adopt anti-zona-burra-gate` and
`hermes curator adopt combo-potencia` if future autonomous patches should land there.
