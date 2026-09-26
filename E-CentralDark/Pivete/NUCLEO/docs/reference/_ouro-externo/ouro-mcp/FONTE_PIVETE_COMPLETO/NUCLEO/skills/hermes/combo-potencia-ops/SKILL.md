---
name: combo-potencia-ops
description: "Use for Combo Potência Telegram menu and offline pack."
---

# Combo Potência — ops (Casa / GuardiaoCasa)

Class-level procedure for the offline skill pack + Telegram menu shipped 2026-08-06.

## Triggers
- "combo potencia", "combo-tencia", "combo potoencia", power/boom combo
- `/combo-potencia`, `/combo`
- install/audit ECC, superpowers, graphify, SkillSpector, cc-switch from skillsllm
- "menu telegram skills", paginação, Usar agora → SOL

## Layout
```text
profiles/pivete/skills/combo-potencia/        # entradas cp-*/sp-* + SKILL.md (user-owned pack)
profiles/pivete/combo-potencia-vendor/        # repos oficiais OFFLINE — FORA de skills/
profiles/pivete/combo-potencia-menu/          # engine + catalog.json + tests
profiles/pivete/skill-bundles/combo-potencia.yaml
adapter: hermes-agent/.../telegram/adapter.py  send_combo_menu + combo:* callbacks
slash: gateway/slash_commands.py _handle_combo_potencia_command
dispatch: gateway/run.py
```

Also under umbrella skills:
- `hermes-telegram-voice/references/combo-potencia-telegram-menu.md`
- `hermes-casa-pivete/references/combo-potencia-pack.md`

## Open menu
1. Prefer Telegram slash `/combo-potencia` or `/combo`.
2. Engine edits the **same** message (no catalog spam).
3. Flow: arms → category/list (max 6/page) → skill → ▶️ Usar agora.
4. Footer: Anterior | N/M | Próximo · Voltar · Painel.
5. `combo:u:<key>` logs `COMBO_SOL_PAYLOAD` with:
   `SKILL_SELECIONADA` · `BRAÇO` · `INTENÇÃO=usar nesta tarefa atual`

## Official URL gate (before any raw.githubusercontent guess)
```text
CAMINHO_OFICIAL_FORNECIDO > URL_INFERIDA
```
1. Use skillsllm **View on GitHub** (or official button/link).
2. Capture real html_url.
3. Read **default_branch** (graphify = **v8**, not main).
4. Locate real path in tree (ECC has no root SKILL.md; graphify uses `graphify/skill.md`).
5. Only then raw/clone. Register official failure before any guess.

Class: AFFORDANCE_IGNORED · TOOL_TUNNEL_VISION · UNVERIFIED_URL_GUESS  
Tests: `skills/meta/anti-zona-burra-gate/tests/test_official_link_is_used_before_guessing_url.py`

## Anti-briga / anti-delta
- Casa wins on name collision unless explicit override.
- Prefixes: `cp-*`, `sp-*`.
- Do not overwrite local `claude-code`, `codex`, `opencode`, `hermes-agent`, unprefixed brainstorming/systematic-debugging/etc.
- ECC: router `cp-ecc` only in index; 281 skills stay in vendor.
- Never put vendor back under `skills/` (scan floods catalog — proven).

## Activate after code patch
1. Disk tests: `python -m unittest discover -s profiles/pivete/combo-potencia-menu/tests -v` → 10/10.
2. **Restart gateway profile pivete** (live process does not reload adapter).
3. Live smoke: `/combo-potencia` → ECC category page → skill → Voltar → Painel.

## Do NOT
- Use agent `clarify` for this menu (ugly numbered buttons + blocks tool turn).
- Dump 281 ECC into chat.
- Invent raw URLs before official button/tree.
- Treat MultiZap `apps/bot-telegram` as GuardiaoCasa surface for this menu.

## User-owned pack skills
`combo-potencia` and `anti-zona-burra-gate` SKILL.md are user-owned.  
To let curator edit them: `hermes curator adopt combo-potencia` / `anti-zona-burra-gate`.

## Related
- `anti-zona-burra-gate` (gate #8 caminho oficial)
- `hermes-telegram-voice`, `hermes-casa-pivete`
- `pivete-resposta` (catalog ref may stay stale until adopt)
