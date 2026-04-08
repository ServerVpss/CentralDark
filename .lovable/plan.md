

# Limpar Textos Desatualizados e Referências -isk nos Comandos

## Problema
Vários mapas de comandos dentro do `telegram-webhook/index.ts` ainda contêm referências `-isk`, comandos numerados antigos (ex: `/cpf2`, `/placa4`), e a Central de Consultas (`showQueryMenu`) lista botões individuais que agora estão agrupados em menus.

## Alterações no arquivo `supabase/functions/telegram-webhook/index.ts`

### 1. Limpar `moduleToCommand` (~linha 5466)
Remover todas as entradas com sufixo `-isk` e manter apenas os 75 módulos reais. Para módulos que agora estão em menus (chassi, renavam, motor, etc), não precisam de comando individual — serão acessados via menu `/placa`, `/foto`, etc.

### 2. Limpar `usageExamples` (~linha 5512)
Remover todas as entradas `-isk` e numeradas que não existem mais.

### 3. Limpar `parseMultipleCommands` commandMap (~linha 7113)
Remover `cpfisk`, `-isk` referências. Adicionar os novos comandos de menu (advogado, cat, crlv, parentes, processos) para que o parser os reconheça.

### 4. Limpar single-command handler commandMap (~linha 7072)
Remover entradas individuais que agora estão em menus (chassi, renavam, motor, mae, etc.) e adicionar os novos comandos de menu.

### 5. Atualizar `showQueryMenu` (~linha 5665)
Remover botões individuais que agora estão em menus agrupados. Em vez de listar "Chassi", "Renavam", "Motor" separadamente, o menu deve mostrar apenas os comandos "mãe": CPF, CNPJ, Placa, Foto, Nome, Parentes, Processos, Advogado, etc.

### 6. Verificar preços
Os planos são carregados do banco dinamicamente (`getPlans()`), então os preços no menu estão atualizados (Diária R$2, Semanal R$15, Quinzenal R$20, Mensal R$30). Nenhuma alteração necessária nos preços.

### Resultado
- Zero referências `-isk` no código
- `/comandos` lista apenas os 75 módulos reais com nomes limpos
- Central de Consultas simplificada com botões agrupados
- Menus de seleção continuam funcionando normalmente

