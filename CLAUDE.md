# CLAUDE.md — adaptador operacional CentralDark

> Este arquivo é uma porta de execução, não uma segunda fonte de verdade.
> Estado histórico permanece no Git; regras e caminhos vigentes são resolvidos pelas fontes canônicas abaixo.

## Boot obrigatório

```text
META_LUPA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_IDENTITY_FILE: .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
```

Antes de responder ou agir:

1. Leia `LEIA-ME-IA.md`.
2. Leia `AGENTS.md`.
3. Leia `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
4. Carregue `.agents/skills/meta-lupa/SKILL.md` em tarefa crítica.
5. Resolva a identidade vigente por `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`; nunca copie um SHA para este adaptador.
6. Confirme branch, HEAD, escopo, escritor e evidência atual.
7. Emita uma vez o recibo `CENTRALDARK_AI_BOOT`.

Sem carregamento e prova válidos: `BOOT_BLOQUEADO`.

## Fontes canônicas

| Responsabilidade | Fonte |
|---|---|
| porta universal | `LEIA-ME-IA.md` |
| contrato de coordenação | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| mapa e áreas protegidas | `apps/modulos/mapeamento/config/mapa-canonico.json` |
| auditoria crítica | `.agents/skills/meta-lupa/SKILL.md` |
| identidade da auditoria | `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` |
| conhecimento durável | `docs/CONSCIENCIA/` |
| DarkAI | `docs/CONSCIENCIA/DARKAI/README.md` |
| decisões | `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` |
| pendências | `docs/PENDENCIAS.md` |

Divergência entre adaptador e fonte canônica é falha. Não criar uma quarta fonte.

## Identidade operacional — sem ambiguidade

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, preservação e continuidade
"pivete" na fala regional = vocativo; não concede identidade nem autoridade técnica
```

Referência histórica que usa `Pivete` como dono/comandante deve ser lida como alias legado de `SEGREDO/CHEFE`; ela não transforma `PIVETE/HERMES` no humano.

## Fluxo operacional

```text
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

- Repositório oficial: `ServerVpss/CentralDark`.
- Runtime da VPS: `/root/CentralDark/`; não é oficina de edição manual.
- Gateway oficial: `https://api.centralldark.com/`.
- Estado vivo não vira commit automático repetitivo na `main`.
- Leitores e revisores podem operar em paralelo; existe um escritor por escopo.
- Nenhum executor aprova o próprio trabalho.
- Mensagem atrasada entra como delta, não reinicia a missão.

## Bots Telegram — separação obrigatória

| Bot | Papel | Estado |
|---|---|---|
| `@srver1bot` | controle geral CentralDark | HUB e runtime central |
| `@SEGREDOPUXADASBOT` | módulo TelePainel | projeto e webhook dedicados |

Nunca criar fallback cruzado, compartilhar owner de token ou misturar banco entre os dois mundos.

## Segurança e áreas protegidas

A lista executável única é `apps/modulos/mapeamento/config/mapa-canonico.json`.
A visualização humana nunca substitui o mapa nem o gate determinístico.

Sem autorização explícita de SEGREDO/CHEFE, não:

```text
mergear main
fazer deploy
reiniciar serviço
alterar produção ou VPS
apagar, mover ou renomear estrutura
alterar área consolidada
ler ou publicar credencial
compartilhar banco vivo
```

Antes de gravar arquivo crítico, preserve o conteúdo útil, use mudança mínima, teste positivo e negativo, registre rollback e prove o mesmo HEAD.

## Planos ainda condicionados

- reconstrução do código-fonte do MCP;
- reconstrução ou migração do HUB;
- mudança de raiz do bot Telegram;
- renomeação de `docs/`;
- alteração de endpoint oficial;
- migração de runtime ou banco vivo.

Planejamento não equivale a autorização operacional.

## Handoff obrigatório

```yaml
CENTRALDARK_HANDOFF:
  role: "COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES"
  status: "DONE|PARTIAL|BLOCKED"
  head_sha: "SHA completo"
  files_changed: []
  tests: []
  evidence: []
  residual_risk: []
  next_gate: "próxima prova objetiva"
```

## Regra final

```text
GitHub = fonte da verdade.
VPS = executor.
Supabase = estado vivo.
Gateway = roteamento oficial.
Mapa canônico = estrutura e travas.
Ações = prova.
```
