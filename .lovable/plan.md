

# Atalho de Manutenção no Dashboard

## O que será feito
Adicionar um card de "Modo Manutenção" na seção de Ações Rápidas do dashboard, com um switch para ativar/desativar diretamente, sem precisar navegar até as configurações do bot.

## Mudanças

### 1. Novo componente `src/components/dashboard/MaintenanceToggle.tsx`
- Card visual com ícone de ferramenta (Wrench) e badge de status (Ativo/Inativo)
- Switch integrado que lê `bot_settings.maintenance_mode` do primeiro bot do usuário
- Ao alternar, faz UPDATE direto na tabela `bot_settings`
- Mostra feedback via toast (sonner)
- Se não houver bot cadastrado, exibe mensagem informativa

### 2. Atualizar `src/pages/Index.tsx`
- Importar e renderizar `MaintenanceToggle` na sidebar do dashboard, abaixo do `QuickActions`
- Passar o `bots[0]?.id` como prop para o componente

## Detalhes Técnicos
- O componente usa `supabase` direto para ler/atualizar `bot_settings` (mesmo padrão do `useBotSettings`)
- Estado local com `useState` + `useEffect` para carregar o status atual
- Nenhuma mudança no banco de dados necessária (campos `maintenance_mode` e `maintenance_message` já existem em `bot_settings`)

