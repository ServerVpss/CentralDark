

# Redesign Completo do Painel — Layout Profissional e Organizado

## Visão Geral
Reorganizar todo o painel TelePanel com uma estrutura mais profissional, limpa e empresarial. Manter a mesma stack (React + Tailwind + shadcn/ui) e funcionalidades, mas com layout, hierarquia visual e organização drasticamente melhores.

## O que muda

### 1. Sidebar — Reorganização por Seções
Agrupar os itens do menu em categorias claras com labels de seção:

```text
 PRINCIPAL
   Dashboard
   
 OPERAÇÕES
   Meu Bot
   Consultas (testar)
   Logs de Consultas
   
 GESTÃO
   Usuários
   Planos
   Transações PIX
   
 SISTEMA
   Segurança
   Configurações
```

- Separadores visuais entre grupos
- Labels de seção em uppercase discreto (10px, muted)
- Manter o collapse/expand funcional

### 2. Header — Mais Limpo
- Remover o espaçador invisível da esquerda
- Breadcrumb contextual (ex: "Dashboard > Visão Geral")
- Mover busca para a direita, menor
- Manter notificações e perfil

### 3. Dashboard (Index) — Layout Empresarial
Reorganizar em seções temáticas com títulos claros:

```text
┌─────────────────────────────────────────────┐
│ Bom dia, [Nome] — Resumo do dia             │
├──────┬──────┬──────┬──────┬─────────────────┤
│ Bots │ Assi │ Cons │ Rece │  Status API     │
│      │nante │ultas │ita  │  (compacto)     │
├──────┴──────┴──────┴──────┴─────────────────┤
│                                             │
│  BOTS  (cards dos bots)                     │
│                                             │
├─────────────────────┬───────────────────────┤
│  Atividade Recente  │ Ações Rápidas         │
│                     │ Status do Sistema     │
│                     │ Manutenção            │
└─────────────────────┴───────────────────────┘
```

**Mudanças específicas:**
- Saudação personalizada com hora do dia (Bom dia/Boa tarde/Boa noite)
- Stats cards na mesma linha que API Status (5 colunas em desktop)
- Cards de stats mais compactos (menos padding, fonte menor)
- Seções com títulos claros e bordas sutis
- Reduzir o tamanho dos decorativos (blurs, gradients) — mais sutil

### 4. Componentes — Refinamento Visual
- **StatsCard**: Reduzir padding de `p-6` para `p-4`, valor de `text-3xl` para `text-2xl`
- **BotStatusCard**: Menos gradients decorativos, mais dados úteis
- **QuickActions**: Grid 2x2 mais compacto
- **ActivityFeed**: Altura fixa de 300px, sem decorações excessivas
- **SystemStatus**: Gráfico circular menor (96px ao invés de 112px)

### 5. Consistência de Cards
Padronizar todos os cards:
- `rounded-xl` (ao invés de misturar `rounded-2xl`)
- Borda `border-border/40` uniforme
- Header padrão: ícone 32px + título + subtítulo
- Padding interno `p-4` padrão

### 6. Tipografia e Espaçamento
- Títulos de página: `text-xl font-semibold` (reduzir de `text-2xl font-bold`)
- Subtítulos de seção: `text-sm font-medium text-muted-foreground`
- Espaçamento entre seções: `gap-5` (reduzir de `gap-6`)
- Menos uso de gradients decorativos — substituir por bordas e sombras sutis

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/layout/Sidebar.tsx` | Reorganizar menu em grupos com labels |
| `src/components/layout/Header.tsx` | Simplificar, adicionar breadcrumb |
| `src/pages/Index.tsx` | Novo layout com saudação e seções |
| `src/components/dashboard/StatsCard.tsx` | Mais compacto |
| `src/components/dashboard/BotStatusCard.tsx` | Simplificar decorações |
| `src/components/dashboard/BotsSection.tsx` | Ajustar grid |
| `src/components/dashboard/QuickActions.tsx` | Mais compacto |
| `src/components/dashboard/SystemStatus.tsx` | Gráfico menor |
| `src/components/dashboard/ActivityFeed.tsx` | Altura menor, mais limpo |
| `src/components/dashboard/ApiStatusCard.tsx` | Integrar melhor no layout |
| `src/components/dashboard/MaintenanceToggle.tsx` | Padronizar estilo |

## O que NÃO muda
- Funcionalidades existentes (dados, realtime, hooks)
- Páginas secundárias (Bots, Settings, Security, etc.) — foco no dashboard e layout
- Sistema de autenticação
- Edge functions e backend

