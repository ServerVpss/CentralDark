# Combo Potência pack + menu (Casa, 06/08/2026)

## Nome fácil
Qualquer fala com "combo" + "potencia/tencia/potoencia", `power combo`, `boom combo`, `/combo`, `/combo-potencia` → mesmo pacote.

## Layout em disco
```text
profiles/pivete/skills/combo-potencia/     # entradas cp-*/sp-* + SKILL.md
profiles/pivete/combo-potencia-vendor/     # ECC, superpowers, graphify@v8, SkillSpector, cc-switch
profiles/pivete/combo-potencia-menu/       # engine Telegram + catalog.json + tests
profiles/pivete/skill-bundles/combo-potencia.yaml
```

## HARD rules
1. Vendor **nunca** dentro de `skills/` — o scan indexa todos os SKILL.md e polui o catálogo (provado: 281 ECC).
2. Prefixo `cp-` / `sp-` — Casa vence colisão com claude-code, codex, opencode, hermes-agent, brainstorming, etc.
3. graphify: branch default **v8**, path `graphify/skill.md` (não assumir main + SKILL.md raiz).
4. ECC: sem SKILL.md na raiz; router `cp-ecc` aponta ao vendor.
5. URL: botão oficial skillsllm "View on GitHub" antes de raw inventado (gate anti-zona-burra #8).
6. Menu Telegram = adapter Hermes (`send_combo_menu`), não MultiZap bot-telegram e não `clarify`.
7. Após patch adapter/slash: **restart gateway pivete** antes de afirmar menu vivo.
8. ▶️ Usar agora deve entregar `SKILL_SELECIONADA` + `BRAÇO` + `INTENÇÃO=usar nesta tarefa atual` (log COMBO_SOL_PAYLOAD).

## Menu callbacks
`combo:root` · `combo:b:<arm>:<page>` · `combo:c:<cat>:<page>` · `combo:s|u|d:<key>` · `combo:back|home|noop`

## Testes
`python -m unittest discover -s profiles/pivete/combo-potencia-menu/tests -v` → 10/10

## User-owned skill
`combo-potencia` é user-owned. Para curator editar o SKILL.md dela: `hermes curator adopt combo-potencia`.
