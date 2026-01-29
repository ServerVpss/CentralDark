
# Plano: Separar Sistemas de Engajamento

## Problema Atual

Os dois componentes de engajamento estão **misturados e duplicados**:

| Componente | Funcionalidades Atuais |
|------------|------------------------|
| `EngagementMessagesManager` | Toggle ativo, intervalo, testar, **E** templates de mensagens |
| `FakeEngagementSettings` | Toggle ativo, intervalo, testar, **E** lista de nomes |

Isso causa:
- Duplicação de controles (toggle, intervalo, testar em ambos)
- Confusão sobre qual salvar
- Conflito de estados

## Solução Proposta

Separar em dois sistemas **completamente independentes**:

```text
┌─────────────────────────────────────────────┐
│  ENGAJAMENTO AUTOMÁTICO (FakeEngagement)    │
├─────────────────────────────────────────────┤
│  ✓ Toggle Ativar/Desativar                  │
│  ✓ Slider de Intervalo (5-120 min)          │
│  ✓ Lista de Nomes para Sortear              │
│  ✓ Botão Salvar + Testar Agora              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  MENSAGENS DE ENGAJAMENTO (Templates)       │
├─────────────────────────────────────────────┤
│  ✓ Lista de templates de mensagens          │
│  ✓ Adicionar/Editar/Remover templates       │
│  ✓ Toggle ativo/inativo por mensagem        │
│  ✓ Variáveis: {nome}, {plano}, {valor}      │
│  ✗ SEM toggle de engajamento                │
│  ✗ SEM slider de intervalo                  │
│  ✗ SEM botão testar (isso fica no outro)    │
└─────────────────────────────────────────────┘
```

## Alterações Técnicas

### 1. EngagementMessagesManager.tsx

**Remover** (linhas 55-254):
- Estado de `enabled`, `interval`, `savingSettings`, `testing`
- Funções `handleSaveSettings`, `handleTest`
- Toda a seção "Controles de Ativação e Tempo" (toggle, slider, botões)
- Props `settings` e `onSettingsUpdate`

**Manter**:
- Apenas o gerenciamento de templates de mensagens
- CRUD de mensagens (adicionar, editar, deletar, toggle ativo)
- Tooltip de variáveis

### 2. FakeEngagementSettings.tsx

**Manter como está** - este componente já está correto:
- Toggle de ativação
- Slider de intervalo
- Lista de nomes
- Botões Salvar e Testar

### 3. BotSettings.tsx

**Inverter a ordem** para melhor UX:
1. Primeiro: FakeEngagementSettings (controles principais)
2. Depois: EngagementMessagesManager (templates)

## Resultado Final

```text
Tab "Engajamento":

┌──────────────────────────────────────────────────────┐
│ ⚡ Engajamento Automático                            │
│ Simula novas assinaturas para gerar engajamento      │
│                                                      │
│ [Toggle] Ativar Engajamento                          │
│ [Slider] Intervalo: 30 minutos                       │
│ [Textarea] Nomes para Sortear                        │
│ [Salvar] [Testar Agora]                              │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 💬 Mensagens de Engajamento                          │
│ Personalize as mensagens enviadas automaticamente    │
│                                                      │
│ [Lista de templates com toggle individual]           │
│ [Botão Adicionar Nova Mensagem]                      │
└──────────────────────────────────────────────────────┘
```

## Arquivos a Modificar

1. **src/components/bots/EngagementMessagesManager.tsx**
   - Remover toda lógica de configurações de engajamento
   - Manter apenas CRUD de templates

2. **src/pages/BotSettings.tsx**  
   - Inverter ordem dos componentes
   - Remover props desnecessárias do EngagementMessagesManager
