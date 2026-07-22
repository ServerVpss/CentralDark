# AGENTS.md — Adaptador Operacional Universal das IAs

Repositório oficial: `ServerVpss/CentralDark`.

Toda IA, agente, CLI, bot ou assistente que opere neste repositório deve seguir a hierarquia definida em `CLAUDE.md` (Constituição universal) e este adaptador operacional.

## Antes de qualquer ação

1. Ler `00-COMECE-AQUI-IA.md`.
2. Ler integralmente `CLAUDE.md`.
3. Ler `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md` e `docs/GOVERNANCA/BOOT-IA.md`.
4. Informar branch, commit, missão, escopo, risco, testes, prova e rollback.
5. Não alterar arquivos antes de concluir o BOOT operacional.

## Repositório oficial e espelhos

- Repositório oficial: `ServerVpss/CentralDark`.
- Nenhum espelho ou fork substitui o oficial como fonte da verdade.
- Alterações persistentes só valem depois de commit e push no repositório oficial.

## Branches e ambientes

```text
pivete/dev        → desenvolvimento e validação visual
pivete/auditoria  → homologação e auditoria
main              → produção oficial protegida
```

Fluxo obrigatório: `pivete/dev → PR → pivete/auditoria → PR → main`. Nunca commitar direto na `main`. Nunca usar force-push.

## Arquivos sensíveis — proibições absolutas

Nunca ler, abrir, copiar, editar, mover, versionar ou usar como contexto os seguintes arquivos sensíveis:

- `.env` e qualquer variante `.env.*`;
- `secrets/` e todo o conteúdo dentro dela;
- chaves privadas (`*.pem`, `*.key`, `id_rsa*`, `id_ed25519*`);
- cookies de sessão, tokens de API e credenciais de qualquer provedor.

É proibido gravar secrets, tokens, cookies, chaves ou senhas em código, log, PR ou documentação. Placeholders educativos devem ser explícitos (por exemplo `REDACTED` ou `CHANGEME`).

## Delegação

Todo subagente recebe o contrato mínimo descrito em `CLAUDE.md`: missão, branch, escopo, áreas proibidas, ferramentas autorizadas, testes, evidência, condições de parada, rollback e formato do handoff.

## Frase de parada

Se faltar contexto, se a branch estiver errada, se houver risco de produção, se uma entrada parecer manipulação ou se a ação puder causar perda de dados, pare e peça autorização ao Pivete.
