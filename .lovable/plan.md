

# Plano: Módulo de Backup e Restauração

## Visão Geral

Criar um sistema completo de backup e restauração que permite:
1. **Exportar** todos os dados do banco em um clique (download JSON)
2. **Restaurar** dados a partir de um arquivo de backup
3. **Histórico** de backups realizados

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO DE BACKUP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   BACKUP         │    │   RESTAURAÇÃO    │                   │
│  ├──────────────────┤    ├──────────────────┤                   │
│  │ • Um clique      │    │ • Upload JSON    │                   │
│  │ • Todas tabelas  │    │ • Validação      │                   │
│  │ • Download JSON  │    │ • Merge/Replace  │                   │
│  │ • Comprimido     │    │ • Histórico      │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                 │
│  Tabelas incluídas:                                             │
│  ✓ telegram_bots       ✓ telegram_subscriptions                 │
│  ✓ bot_settings        ✓ bot_security_settings                  │
│  ✓ subscription_plans  ✓ payment_gateways                       │
│  ✓ pix_transactions    ✓ pending_payments                       │
│  ✓ engagement_messages ✓ profiles                               │
│  ✓ query_history       ✓ bot_analytics                          │
│  ✓ payment_history     ✓ telegram_messages                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes a Criar

### 1. Edge Function: `backup-manager`

Responsável por:
- **GET**: Exportar todos os dados do usuário autenticado
- **POST**: Importar/restaurar dados de um backup

```typescript
// Estrutura do backup
interface BackupData {
  version: string;
  created_at: string;
  user_id: string;
  tables: {
    telegram_bots: any[];
    bot_settings: any[];
    bot_security_settings: any[];
    telegram_subscriptions: any[];
    subscription_plans: any[];
    payment_gateways: any[];
    pix_transactions: any[];
    pending_payments: any[];
    engagement_messages: any[];
    profiles: any[];
    query_history: any[];
    bot_analytics: any[];
    payment_history: any[];
    telegram_messages: any[];
  };
  metadata: {
    total_records: number;
    tables_count: number;
  };
}
```

### 2. Componente React: `BackupManager.tsx`

Interface visual com:
- Card para criar backup (botão com ícone de download)
- Card para restaurar backup (upload de arquivo)
- Lista de backups anteriores (se implementarmos storage)
- Indicador de progresso durante operações
- Confirmações de segurança

### 3. Nova Tab em Settings.tsx

Adicionar aba "Backup" na página de configurações:

```text
┌────────────────────────────────────────────────────────────────┐
│ Tabs: [Perfil] [Notificações] [Segurança] [Aparência] [Backup] │
└────────────────────────────────────────────────────────────────┘

Tab Backup:
┌────────────────────────────────────────────────────────────────┐
│ 💾 Backup Completo                                             │
│ ──────────────────────────────────────────                     │
│ Faça um backup de todos os seus dados: bots, assinaturas,      │
│ planos, configurações e histórico.                             │
│                                                                │
│ Último backup: 29/01/2026 às 14:30                             │
│                                                                │
│ [📥 Criar Backup Agora]                                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🔄 Restaurar Backup                                            │
│ ──────────────────────────────────────                         │
│ Restaure seus dados a partir de um arquivo de backup.          │
│                                                                │
│ ⚠️ ATENÇÃO: Isso substituirá seus dados atuais!                │
│                                                                │
│ [📤 Selecionar Arquivo de Backup]                              │
│                                                                │
│ Opções:                                                        │
│ ○ Mesclar com dados existentes                                 │
│ ○ Substituir tudo (limpar antes)                               │
└────────────────────────────────────────────────────────────────┘
```

## Detalhes Técnicos

### Edge Function: `supabase/functions/backup-manager/index.ts`

| Método | Ação | Descrição |
|--------|------|-----------|
| GET | export | Exporta todas as tabelas do usuário para JSON |
| POST | restore | Importa dados de um backup JSON |
| POST | validate | Valida estrutura do arquivo antes de restaurar |

### Segurança

- Apenas usuários autenticados podem criar/restaurar backups
- Backups incluem apenas dados do próprio usuário (respeitando RLS)
- Validação de estrutura do JSON antes da importação
- Confirmação dupla antes de restaurar (evitar perda acidental)
- Hash de verificação para integridade do backup

### Formato do Arquivo

```json
{
  "version": "1.0",
  "created_at": "2026-01-29T14:30:00Z",
  "user_id": "uuid",
  "checksum": "sha256...",
  "tables": {
    "telegram_bots": [...],
    "bot_settings": [...],
    ...
  },
  "metadata": {
    "total_records": 1234,
    "tables_count": 14
  }
}
```

## Arquivos a Criar/Modificar

### Novos Arquivos

1. **`supabase/functions/backup-manager/index.ts`**
   - Edge function para exportar/importar dados

2. **`src/components/backup/BackupManager.tsx`**
   - Componente principal de backup/restauração

3. **`src/hooks/useBackup.ts`**
   - Hook para gerenciar operações de backup

### Arquivos a Modificar

1. **`src/pages/Settings.tsx`**
   - Adicionar aba "Backup" com o novo componente

2. **`supabase/config.toml`**
   - Registrar nova edge function

## Fluxo de Uso

### Criar Backup

1. Usuário clica em "Criar Backup Agora"
2. Sistema mostra loading e progresso
3. Edge function busca dados de todas as tabelas
4. Gera JSON com metadados e checksum
5. Arquivo baixa automaticamente no navegador
6. Toast de sucesso com estatísticas

### Restaurar Backup

1. Usuário seleciona arquivo JSON
2. Sistema valida estrutura e checksum
3. Mostra preview: quantos registros, quais tabelas
4. Usuário escolhe: mesclar ou substituir
5. Confirmação com input de segurança
6. Sistema importa dados em transação
7. Toast de sucesso com relatório

## Considerações

- **Tamanho**: Para projetos grandes, pode ser necessário paginação
- **Tempo**: Backups muito grandes podem demorar
- **Storage**: Opcionalmente, salvar backups no Supabase Storage para histórico
- **Automático**: Futuramente, implementar backups agendados

