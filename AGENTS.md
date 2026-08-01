# AGENTS.md — Guia operacional CentralDark

## Repositório oficial

`ServerVpss/CentralDark` é o repositório oficial e fonte da verdade do projeto.

## 🔒 BOOT OBRIGATÓRIO — LUPA BAYESIANA

```text
META_LUPA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_IDENTITY_FILE: .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
```

A identidade vigente da skill é resolvida pelo arquivo canônico acima e validada contra o blob Git real. É proibido copiar um SHA fixo para este adaptador.

Antes de alterar qualquer arquivo, carregar a skill `meta-lupa` e registrar o uso (BEGIN+FINAL) no ledger da skill. Sem BEGIN → `BOOT_BLOQUEADO`.

## Boot universal de qualquer IA

Este arquivo vale para qualquer IA, agente, plugin, hub ou modelo presente ou futuro.
O nome comercial do modelo não concede papel, autoridade ou permissão especial.

Antes de responder ou agir:

1. Ler `LEIA-ME-IA.md` integralmente.
2. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
3. Ler `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` quando houver operação crítica, segurança, VPS, GitHub, deploy, automação ou evolução.
4. Identificar o papel atual: coordenador, executor, debugger, revisor, judge, Hermes ou somente leitura.
5. Confirmar a fonte da verdade e o estado atual por ferramenta.
6. Emitir uma vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.

Regras automáticas:

- leitores podem investigar em paralelo;
- existe somente um escritor por escopo;
- mensagem atrasada não reinicia missão;
- estado novo comprovado vence contexto antigo;
- agentes enviam deltas curtos, não repetem o histórico inteiro;
- nenhum executor aprova a si mesmo;
- troca de escritor exige handoff explícito;
- SEGREDO/CHEFE permanece autoridade humana final;
- SOL coordena, PIVETE/HERMES preserva e executa, Judge valida de forma independente.

## Doutrina

```txt
SEGREDO/CHEFE COMANDA.
SOL ORGANIZA.
PIVETE/HERMES PRESERVA E EXECUTA.
GITHUB REGISTRA.
VPS EXECUTA.
SUPABASE GUARDA ESTADO VIVO.
GATEWAY CENTRALDARK ROTEIA.
AÇÕES PROVAM.
NADA NO ESCURO.
```

## Modo operacional para missões críticas

```text
CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP
```

Regras mínimas:

- durante CAPTURE ninguém altera, fecha porta, reinicia serviço ou promove;
- código mede e classifica o conhecido; modelo interpreta apenas UNKNOWN ou ANOMALY;
- `UNKNOWN`, `SKIPPED`, `ANOMALY` e `ACHADO_PENDENTE` nunca equivalem a PASS;
- APPLY exige baseline, backup, rollback e um único writer por escopo;
- Judge e Writer precisam de contexto, permissões e credenciais separados;
- falha de gate produz `BLOCKED`, nunca falso verde;
- o LOOP termina somente com contraprova, receipt e decisão de SEGREDO/CHEFE.

Contrato completo: `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md`.

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

## Code Review Rules

### Autoridade e escopo

- Revisar o HEAD exato informado no PR; comentário ou receipt de SHA antigo não aprova SHA novo.
- O revisor opera em modo somente leitura: não faz push, merge, deploy, resolve thread ou promove sozinho.
- Sinalizar qualquer bypass de SEGREDO/CHEFE, de writer único por escopo ou de Judge independente.
- Não ampliar o escopo do PR para resolver achados de outra trilha; registrar dependência separada.

### Evidência e falso verde

- `UNKNOWN`, `SKIPPED`, timeout, ausência de log ou ausência de revisão nunca equivalem a PASS.
- Exigir causa, impacto, teste, contraprova, rollback e receipt presos ao mesmo HEAD.
- Sinalizar fallback silencioso, resultado simulado, lista estática tratada como disponibilidade real ou aprovação sem prova.

### Segurança e credenciais

- Não reproduzir valores de secrets em comentários, logs ou artifacts.
- Separar credenciais, jobs e permissões de Writer, Judge e Promotor.
- Código de PR não confiável não pode executar com credencial privilegiada.
- Alteração em workflow deve usar menor privilégio e checkout preso ao SHA esperado.

### Arquitetura canônica

- Sinalizar novo entrypoint, orquestrador concorrente ou duplicação por nome `V2`, `V3`, `NOVO`, `FINAL`, `COPY` ou `BACKUP`.
- Preferir adaptação mínima do componente canônico existente.
- Confrontar mudanças de governança com `LEIA-ME-IA.md`, este `AGENTS.md` e o mapa canônico.
- Priorizar findings P0/P1 consequenciais; evitar ruído cosmético como bloqueador.
