

# Remover placa-simples e renumerar placa-sesp

## Resumo
Remover o comando `/placa3` (placa-simples) por ser redundante com `/placa`, e renumerar `/placa4` (placa-sesp) para `/placa3`.

## Alterações

**Arquivo**: `supabase/functions/telegram-webhook/index.ts` — ~10 locais

1. **Aliases de comando (linhas ~215, ~218)**: Remover `placa3: "placa-simples"` e `placasimples: "placa-simples"`. Mudar `placa4: "placa-sesp"` para `placa3: "placa-sesp"`.

2. **Labels amigáveis (linha ~246)**: Remover `"placa-simples": "🚗 Placa 3"`. Mudar `"placa-sesp": "🚗 Placa 4"` para `"placa-sesp": "🚗 Placa 3"`.

3. **vehicleModules array (linha ~474)**: Remover `placa3` e `placasimples`. Renumerar `placa4` para `placa3`.

4. **moduleToCommand (linhas ~3962-3963)**: Remover `"placa-simples": "/placa3"`. Mudar `"placa-sesp": "/placa4"` para `"placa-sesp": "/placa3"`.

5. **Exemplos de uso (linha ~3986)**: Remover `"placa-simples": "ABC1234"`.

6. **Mapa de grupo (linhas ~5540-5541)**: Remover `placasimples: "placa-simples"`.

7. **Mapa de aliases secundário (linhas ~5727-5728)**: Remover `placa3: "placa-simples"` e `placasimples: "placa-simples"`. Mudar `placa4: "placa-sesp"` para `placa3: "placa-sesp"`.

8. **Menu /comandos**: Onde gera os botões de Placa, atualizar para mostrar apenas Placa, Placa 2 (SERPRO), Placa 3 (SESP).

Manter `placasesp` como alias para compatibilidade.

