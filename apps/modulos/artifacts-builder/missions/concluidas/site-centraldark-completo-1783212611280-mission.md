# Site CentralDark - Sistema Completo

## Tipo
react-spa

## Descrição
Site completo do ecossistema CentralDark com dashboard de agentes, status dos módulos PM2, grafo vivo, arsenal council, e painel de controle. Interface escura com tema neon verde, responsiva, com navegação entre páginas.

## Requisitos
- Dashboard principal com cards de todos os módulos PM2 (24 processos) com status online/offline e uptime
- Seção "Arsenal Council" mostrando os modelos (Gemini, GPT-5.5, Sonnet, Opus) com status
- Grafo vivo dos agentes (força-g) com nós coloridos por categoria
- Painel de missões do Hermes com pendências e concluídas
- Status da VPS (CPU, RAM, disco)
- Notificações em tempo real via WebSocket
- Navegação SPA com rotas: /, /arsenal, /grafo, /missoes, /status
- Tema escuro (#0a0f0d) com verde neon (#34d399) como cor primária
- Cards com glow hover, animações fade-in, grid responsivo
- Footer com status "Online 24/7" e contagem de artefatos

## Rotas
/
/arsenal
/grafo
/missoes
/status

## Tema
dark
