---
name: Mostrar aliases categorizados na 1ª execução
description: Toda vez que iniciar/testar qualquer modelo (Fable, Sonete, Opus, Haicu etc), a PRIMEIRA resposta deve trazer o bloco padrão com os aliases categorizados por família
type: preference
---
Sempre que iniciar/ativar/testar qualquer modelo do proxy (ap7/EliteAnthropic), a **primeira execução** DEVE mostrar o bloco padrão com **aliases categorizados por família**:

```
🟢 FABLE ATIVADO — Elite Anthropic Proxy
✅ /health confirma alias carregado
✅ Último teste (HH:MM UTC): alias → modelo real respondeu 200
✅ Variantes (-1m etc) também 200

📚 Aliases ativos (40 no total):
├─ FABLE (Sonnet 4.6 1M): fable, fable-1m, sonete, sonete-1m, sonnet-4.6, ...
├─ OPUZ (Opus 4.8): opuz, opus, opus-4.8, ...
├─ HAICU (Haiku 4.6): haicu, haiku, haiku-4.6, ...
└─ Legado/Extras: ...

Proxy: CentralDark-EliteAnthropicProxy (PM2 id 52) online
Versão: X.Y.Z
```

**Por que:** o admin quer ver de cara o que está disponível pra não precisar perguntar. **Como aplicar:** puxar lista real do `/v1/models` ou `/health` do proxy e agrupar por família antes de responder.
