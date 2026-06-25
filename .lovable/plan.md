## Objetivo

Redesenhar `src/apps/web/pages/Auth.tsx` pra herdar o mesmo visual do Mega Painel (`status.centralldark.com`) — fundo claro com névoa verde, blocos arredondados com "halo" esmeralda no canto, tipografia grande e bold, chip "CENTRALDARK INTELLIGENCE", cartão "Sistema respirando" com bolinha verde pulsando.

## O que muda

**Só `src/apps/web/pages/Auth.tsx`.** Nenhuma lógica de autenticação é tocada — formulário, validação, signIn/signUp, tabs e tudo mais continuam exatamente iguais.

## Como vai ficar

```text
┌────────────────────────────────────────────┐
│  ░░ fundo branco-esverdeado, grid sutil ░░ │
│                                            │
│   CENTRALDARK INTELLIGENCE  (chip verde)   │
│                                            │
│   🚀  Bem-vindo de volta                   │
│        (título grande, bold, preto)        │
│                                            │
│   Acesse o painel pra gerenciar seus bots. │
│                                            │
│   ┌─────────────────────┐ ┌──────────────┐ │
│   │  [ Entrar | Cadastr]│ │ ● Sistema    │ │
│   │  email ____________ │ │   respirando │ │
│   │  senha ____________ │ │  v0.4.0 · 95 │ │
│   │  [   Entrar    ]    │ │  tools       │ │
│   └─────────────────────┘ └──────────────┘ │
│                                            │
│   Termos · Privacidade                     │
└────────────────────────────────────────────┘
```

No mobile, os dois cards empilham (formulário em cima, "Sistema respirando" embaixo).

## Detalhes visuais (espelhando o painel)

- Fundo: branco com leve tint verde + radial-gradient esmeralda no topo + grid de pontinhos sutil
- Chip "CENTRALDARK INTELLIGENCE": verde escuro, letterspacing largo, fonte pequena bold
- Título "Bem-vindo de volta": tipografia display grande (text-4xl/5xl), peso 700, cor `foreground`
- Cards: `rounded-2xl`, borda fininha, `shadow-3d`, com um "halo" radial verde no canto inferior direito (igual aos blocos "94%" do painel)
- Bolinha pulsante verde no card lateral (`animate-pulse`)
- Botão "Entrar": verde esmeralda sólido com `shadow-3d-primary`
- Inputs mantêm o estilo atual (ícone à esquerda)

Tudo via tokens semânticos (`--primary` já é emerald no projeto), zero cor hardcoded.

## Fora de escopo

- Não mexer no Mega Painel da VPS
- Não mexer em `index.css` / tokens globais (já são esmeralda)
- Não mexer em `AuthProvider`, rotas, ou qualquer lógica
