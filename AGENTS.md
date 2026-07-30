# AGENTS.md — Guia operacional CentralDark

## Repositório oficial

`ServerVpss/CentralDark` é o repositório oficial e fonte da verdade do projeto.

## 🔒 BOOT OBRIGATÓRIO — LUPA BAYESIANA

```text
META_LUPA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_COMMIT_SHA: e205f9f0987647764dfd3742edd28c4c4c12092e
```

Antes de alterar qualquer arquivo, carregar a skill `meta-lupa` e registrar o uso (BEGIN+FINAL) no ledger da skill. Sem BEGIN → `BOOT_BLOQUEADO`.

## Boot universal de qualquer IA

Este arquivo vale para qualquer IA, agente, plugin, hub ou modelo presente ou futuro.
O nome comercial do modelo não concede papel, autoridade ou permissão especial.

Antes de responder ou agir:

1. Ler `LEIA-ME-IA.md` integralmente.
2. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
3. Identificar o papel atual: coordenador, executor, debugger, revisor, judge, Hermes ou somente leitura.
4. Confirmar a fonte da verdade e o estado atual por ferramenta.
5. Emitir uma vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.

Regras automáticas:

- leitores podem investigar em paralelo;
- existe somente um escritor por escopo;
- mensagem atrasada não reinicia missão;
- estado novo comprovado vence contexto antigo;
- agentes enviam deltas curtos, não repetem o histórico inteiro;
- nenhum executor aprova a si mesmo;
- troca de escritor exige handoff explícito;
- Pivete permanece autoridade final.

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