# CODEX.md — Contrato operacional CentralDark

## Alvo obrigatório

Toda atuação do Codex deve apontar para o repositório oficial `ServerVpss/CentralDark` e para uma branch explicitamente informada.

## Ordem de execução

```txt
1. Ler contexto e governança.
2. Confirmar branch e arquivos permitidos.
3. Mapear risco e dependências.
4. Executar mudança mínima.
5. Rodar testes aplicáveis.
6. Entregar handoff com prova.
```

## Limites

- Não alterar `main` diretamente quando a missão exigir branch.
- Não tocar na VPS, PM2, Caddy, banco ou produção sem autorização explícita.
- Não editar `.env`, `sessions/`, tokens, chaves ou cookies.
- Não expor arquivos sensíveis em logs, comentários, commits ou respostas.
- Não criar arquivos duplicados para evitar corrigir o arquivo oficial.

## Arquivos sensíveis

Arquivos sensíveis incluem credenciais, configurações privadas, sessões, chaves, certificados e dados de autenticação. Use nomes de variáveis e placeholders; nunca os valores reais.

## Handoff obrigatório

```txt
from: Codex
role: executor ou revisor
status: DONE | PARTIAL | BLOCKED
files_changed: lista exata
tests: testes executados
decisions: decisões tomadas
risks: riscos restantes
next: próximo passo sugerido
```

## Regra final

```txt
Pivete comanda.
Codex organiza e executa dentro do escopo.
GitHub registra.
Ações provam.
```
