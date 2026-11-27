# Erro orientado a evolução (módulo Lupa)

```
ERRO + rastro + causa + correção + teste + promoção = evolução
```

Checklist obrigatório quando um erro real for capturado durante a própria missão:

- [ ] rastro: comando/tool-id/SHA/log/path+hash
- [ ] causa: hipótese mínima que explica o rastro
- [ ] correção: menor mudança que falsifica a causa
- [ ] teste: falha antes, passa depois, permanece
- [ ] promoção: teste entra na baseline ou na suíte de conformidade

Sem qualquer um dos cinco, o erro fica registrado mas não conta como evolução.
