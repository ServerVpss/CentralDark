# Catálogo Combo Potência — como responder AGORA (06/08/2026)

**Supersedes the “use clarify” advice** in the older catalog note for live Telegram.

## Gatilho
combo potencia · combo menu · /combo-potencia · /combo · /combo_potencia

## Resposta correta
1. **Telegram vivo:** manda `/combo_potencia` ou `/combo` — menu nativo abre (6 braços, edit mesma msg).
2. **CLI só:** resume 6 braços + aponta o slash; não finja que o inline abriu no CLI.
3. **Erro `Path is not defined`:** adapter/gateway antigo — skill `combo-potencia-ops` + `references/live-gateway-activate.md`. Não voltar para clarify.

## Proibido
- `clarify` como menu principal do combo
- Dump de 281 ECC no chat
- Tratar foto de computing/rostinho como recibo PASS

## Implementação
```text
slash → send_combo_menu → combo:* callbacks
engine: profiles/pivete/combo-potencia-menu/
pack:   profiles/pivete/skills/combo-potencia/ + combo-potencia-vendor/
```

## Classe
Skill: `combo-potencia-ops`
