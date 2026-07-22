# AGENTS.md — Guia operacional CentralDark

## Repositório oficial

`ServerVpss/CentralDark` é o repositório oficial e fonte da verdade do projeto.

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

---

## 🔒 LUPA_BAYESIANA_BOOT_REQUIRED

Antes de qualquer análise, plano, comando ou alteração, toda IA/agente/CLI/bot DEVE localizar e ler integralmente `.agents/skills/lupa-bayesiana/SKILL.md`, registrar `SKILL_PATH`, `SKILL_REF` e `SKILL_COMMIT_SHA` no BOOT, aplicar a Lupa durante a missão e executar AutoLupa no encerramento. Se a skill não estiver no checkout, buscar em `origin/pivete/dev`. Ausência da skill = BLOQUEIO DE BOOT. Proibido V2, skill paralela ou cópia solta como fonte primária. Definição autoritativa completa: `CLAUDE.md` (seção `LUPA_BAYESIANA_BOOT_REQUIRED`).
