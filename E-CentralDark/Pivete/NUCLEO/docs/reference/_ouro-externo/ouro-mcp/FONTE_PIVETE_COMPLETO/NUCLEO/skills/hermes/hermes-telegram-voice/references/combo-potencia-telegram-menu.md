# Combo Potência — menu Telegram (06/08/2026)

## Abrir
`/combo-potencia` · `/combo` · fala "combo potencia" / "combo-tencia" / "power combo"

## Peças
| Peça | Onde |
|---|---|
| Engine + testes | `profiles/pivete/combo-potencia-menu/` |
| Catalog | `.../data/catalog.json` (~299 skills, page_size=6) |
| Adapter | `send_combo_menu`, `_handle_combo_menu_callback` |
| Slash | `_handle_combo_potencia_command` |
| Dispatch | `gateway/run.py` canonical combo-potencia/combo |
| Registry | CommandDef `combo-potencia` aliases combo, combo_potencia, combopotencia |
| Vendor offline | `profiles/pivete/combo-potencia-vendor/` (FORA de skills/) |
| Skill pack | `skills/combo-potencia/` entradas `cp-*` / `sp-*` |

## Callbacks
```text
combo:root | combo:b:<braço>:<pág> | combo:c:<cat>:<pág>
combo:s:<key> | combo:u:<key> | combo:d:<key>
combo:back | combo:home | combo:noop
```

## Regras
- Editar a **mesma** mensagem (edit_message_text).
- ECC: categorias primeiro; nunca listar 281 de uma vez.
- ▶️ Usar agora → log `COMBO_SOL_PAYLOAD` (SKILL_SELECIONADA / BRAÇO / INTENÇÃO).
- **NÃO** usar tool `clarify` para este menu.
- Após patch do adapter: **restart gateway pivete** (memória ≠ disco).
- graphify branch default **v8**, arquivo `graphify/skill.md`.
- URLs: botão oficial skillsllm antes de raw inventado.

## Testes
`python -m unittest discover -s profiles/pivete/combo-potencia-menu/tests -v` → 10/10
