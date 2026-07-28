# AGENTS.md — Guia operacional CentralDark

## Repositório oficial

`ServerVpss/CentralDark` é o repositório oficial e fonte da verdade do projeto.

## 🔒 BOOT OBRIGATÓRIO — LUPA BAYESIANA

```text
META_LUPA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_COMMIT_SHA: runtime-validated-by-meta-lupa-gate
SKILL_SHA_POLICY: derive META_LUPA_CANONICAL_SHA from the checked-out canonical tree
HOOKS_POLICY: configure `git config core.hooksPath .githooks`; hooks fail closed without META_LUPA_RECEIPT_PATH
```

Antes de alterar qualquer arquivo, carregar a skill `meta-lupa` e registrar o uso (BEGIN+FINAL) no ledger da skill. Sem BEGIN → `BOOT_BLOQUEADO`.

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

1. Ler `CLAUDE.md` e os documentos de governança aplicáveis.
2. Mapear o escopo e identificar áreas protegidas.
3. Fazer correção mínima e auditável.
4. Não tocar na VPS, produção ou deploy sem autorização explícita.
5. Encerrar com handoff, arquivos alterados, testes e riscos.

## Arquivos sensíveis

Arquivos sensíveis não devem ser lidos, copiados, editados, registrados ou usados como contexto sem autorização explícita.

Exemplos:

- `.env` e variantes;
- `secrets/`;
- `tokens/`;
- `sessions/`;
- `.ssh/`;
- certificados e chaves privadas;
- cookies e connection strings.

Use somente placeholders como `<REDACTED>`, `<ENV_PROVIDER_KEY>` e `<INTERNAL_BASE_URL>`.

## Segurança operacional

- Não usar `git reset --hard` ou force-push.
- Não apagar nada sem backup.
- Não criar versões duplicadas `v1`, `v2`, `v3`.
- Não registrar Authorization header, token ou valor de chave.
- Não transformar preview em fonte oficial.
- GitHub registra; VPS apenas executa o que foi aprovado.
