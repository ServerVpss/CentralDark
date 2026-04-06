

# Incluir CPF-SUS e CPF-SPC na numeração de CPF

## Situação Atual
Os módulos de CPF estão mapeados assim:
- `/cpf` → cpf (básico)
- `/cpf2` → cpffull (completo)
- `/cpf3` → cpf-isk
- `/spc` → cpf-spc (separado)
- `/sus` → cpfsus (separado)

O `cpfsus` e `cpf-spc` são módulos de CPF mas ficaram fora da numeração sequencial.

## Proposta
Renumerar para manter todos os módulos de CPF juntos:
- `/cpf` → cpf (básico) — sem mudança
- `/cpf2` → cpffull
- `/cpf3` → cpf-isk
- `/cpf4` → cpf-spc (SPC)
- `/cpf5` → cpfsus (SUS)

Os comandos antigos `/spc` e `/sus` continuam funcionando como aliases.

## Alterações
**Arquivo**: `supabase/functions/telegram-webhook/index.ts`
- Adicionar `cpf4: "cpf-spc"` e `cpf5: "cpfsus"` em todos os mapas de aliases/comandos (~5 locais)
- Atualizar labels: `"cpf-spc": "👤 CPF 4 (SPC)"`, `cpfsus: "👤 CPF 5 (SUS)"`
- Atualizar `moduleToCommand`: `"cpf-spc": "/cpf4"`, `cpfsus: "/cpf5"`
- Menu de consultas: atualizar os botões de SPC e SUS para mostrar "CPF 4" e "CPF 5"

