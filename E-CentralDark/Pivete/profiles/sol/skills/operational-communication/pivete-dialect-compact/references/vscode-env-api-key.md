# Chave de API em configurações — usar variável Windows, não literal

## Padrão

Quando CHEFE coloca uma chave/token direto no `settings.json` (ou config de ferramenta), seguir:

1. Verificar se já existe variável Windows com o nome ou parte do nome:
   ```
   env | grep -i -E "<nome_da_chave|keyword_do_servico>"
   ```
   No Windows: `powershell -Command "Test-Path env:<VAR>"` ou `echo %VAR%`.

2. Se não existir:
   - Criar variável de usuário com `setx <VAR> "<valor>"`.
   - Usar referência `${env:<VAR>}` no `settings.json` no lugar do literal.

3. Se já existir:
   - Usar `${env:<VAR>}` direto.
   - Não inventar novo nome.

## Por que

- settings.json salvo no perfil/dotfiles pode ser lido por outras ferramentas ou ser commitado acidentalmente.
- Variável Windows + referência `${env:}` evita chave solta no arquivo de configuração.

## Exemplo

Variável criada:
```
CLAUDE_CODE_KEY = claude_code_key_contacobra3467_fgxk
```

Referenciado no `settings.json`:
```json
"github.copilot.chat.ClaudeCode": "$env:CLAUDE_CODE_KEY"
```

## Regra duradora

Chave/token que aparece no chat:
- NÃO deixar literal no settings.json.
- Verificar var Windows.
- Se não tiver, criar e referenciar com `${env:}`.
- Se já tiver, usar a existente.

Fonte desta regra: sessão 2026-08-31 — CHEFE mandou key e configurações VS Code, pediu usar variável Windows e não `.env`/literal.
