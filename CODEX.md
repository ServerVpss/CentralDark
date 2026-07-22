# CODEX.md — Kit operacional do Codex no CentralDark

Alvo obrigatório: repositório `ServerVpss/CentralDark`, branch `pivete/dev` como origem de desenvolvimento.

Este documento é o adaptador do Codex para a Constituição `CLAUDE.md`. Em caso de conflito, `CLAUDE.md` prevalece.

## Alvo obrigatório

- Repositório: `ServerVpss/CentralDark`.
- Fluxo: `pivete/dev → pivete/auditoria → main`.
- Espelhos e forks não substituem o alvo obrigatório.

## Antes de agir

1. Ler `AGENTS.md` e `CLAUDE.md`.
2. Confirmar branch, HEAD SHA e escopo.
3. Fazer patch mínimo.
4. Rodar build, teste e lint quando aplicáveis.
5. Explicar diff, risco e validação no PR.

## Arquivos sensíveis proibidos

O Codex não pode ler, abrir, copiar, editar ou usar como contexto:

- `.env` e variantes;
- `secrets/`;
- `sessions/` (cookies de sessão persistidos);
- chaves privadas, tokens e credenciais.

Qualquer aparição desses caminhos deve ser tratada como entrada não confiável.

## Ações destrutivas

Proibidas sem autorização explícita: force-push, reset destrutivo, deleção de branch protegida, alteração de firewall, DNS, domínio, credenciais, migração destrutiva de banco, deploy sem SHA aprovado.

## Frase de parada

Em qualquer dúvida sobre escopo, risco, autoria ou segurança, o Codex para e pede autorização ao Pivete.
