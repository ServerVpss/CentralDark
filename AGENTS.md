# AGENTS.md — Guia operacional CentralDark

## Repositório oficial

`ServerVpss/CentralDark` é o repositório oficial e a fonte da verdade do projeto.

## Doutrina

```txt
PIVETE COMANDA.
IA ORGANIZA.
GITHUB REGISTRA.
VPS EXECUTA.
SUPABASE GUARDA ESTADO VIVO.
GATEWAY CENTRALDARK ROTEIA.
AÇÕES PROVAM.
NADA NO ESCURO.
```

## Trabalho dos agentes

Antes de alterar qualquer arquivo:

1. Ler `CLAUDE.md`, `CODEX.md` e a governança aplicável.
2. Confirmar branch, escopo e áreas protegidas.
3. Fazer correção mínima e auditável.
4. Rodar os testes proporcionais ao risco.
5. Encerrar com handoff, arquivos alterados, testes e riscos.

## Segurança operacional

- Não ler, copiar, editar ou registrar `.env`, `secrets/`, `tokens/`, `sessions/`, `.ssh/`, chaves, certificados, cookies ou connection strings.
- Usar apenas placeholders como `<REDACTED>` e nomes de variáveis sem valores.
- Não usar force-push, `git reset --hard` ou apagar dados.
- Não tocar em VPS, PM2, Caddy, banco, deploy ou produção sem autorização explícita.
- Não criar versões paralelas `v1`, `v2` ou `v3` para evitar corrigir a implementação oficial.
- GitHub registra; VPS somente executa o que foi aprovado.

## Revisão

- Revisores produzem evidências independentes.
- O Codex confronta os pareceres e publica a síntese técnica final.
- Falha, ausência de revisor ou falta de prova não pode virar verde.
- A autorização humana para merge permanece com o Pivete.
