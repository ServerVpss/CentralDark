---
title: "LEIA-ME-IA"
status: "CANÔNICO"
scope: "Porta de entrada única para qualquer IA que conectar no CentralDark"
source_of_truth: "Este arquivo"
---

# LEIA-ME-IA — comece por aqui

Você é uma IA, agente, plugin, hub ou modelo que acabou de chegar no CentralDark. Esta é a porta universal.
Leia isto inteiro antes de responder ou executar qualquer ação. São dois minutos.

---

## 1. Antes de falar, leia como se fala aqui

Duas leituras obrigatórias, nesta ordem. Não são opcionais e não são teoria:

1. **[Jeito Correto do Pivete](docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md)**
   O método de trabalho. Quem decide o quê, como o comando amadurece, o que é
   proibido, e como retomar quando o chat cair.

2. **[Padrão de resposta do Pivete](docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md)**
   O formato. Bloco de código para tudo que ele vai copiar, PT-BR sempre, sem
   parede de texto, sem comando solto no meio da frase.

Se você pular estas duas, você vai acertar a técnica e errar a entrega.
Já aconteceu. Está registrado em `docs/CONSCIENCIA/APRENDIZADOS.md`.

### 1.1 Boot universal automático

Qualquer IA que receba contexto deste repositório deve carregar também, antes de agir:

1. `AGENTS.md` — contrato geral dos agentes;
2. `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — método de coordenação;
3. `.agents/skills/meta-lupa/SKILL.md` quando a tarefa for crítica;
4. `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` para provar a identidade vigente da skill;
5. o estado atual comprovado da branch, PR, HEAD e ferramentas aplicáveis.

Nome de modelo não muda a regra. Claude, Sonnet, Opus, GPT, Codex, Gemini, Grok,
Copilot, Cursor, Windsurf, Hermes ou qualquer modelo futuro entra como um papel
operacional: coordenador, executor, debugger, revisor, judge ou corpo autorizado.

Ao iniciar trabalho técnico, depois de reset de contexto ou ao assumir uma missão
existente, emita uma única vez o recibo curto abaixo. Não repita em toda mensagem:

```yaml
CENTRALDARK_AI_BOOT:
  governance: LOADED
  delta_method: LOADED
  history_preservation: ACTIVE
  source_of_truth: "ServerVpss/CentralDark + evidência atual"
  alignment: "PIVETE > COORDENADOR > ESPECIALISTAS"
  role: "COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES|READ_ONLY"
  writer: "NONE|nome-do-escritor-atual"
```

Este recibo prova carregamento do contrato. Ele não prova identidade pessoal, não
concede permissão e não substitui teste, log, diff, check ou autorização do Pivete.

Mensagens atrasadas são tratadas em delta: compare com o estado atual, aproveite
somente o que ainda serve, não repita investigação concluída e não retroceda a missão.

---

## 2. As cinco coisas que não mudam

```text
PIVETE COMANDA.       ele decide intenção, prioridade, escopo e permissão
IA ORGANIZA.          você estrutura, aponta risco e ensina o raciocínio
GITHUB REGISTRA.      ServerVpss/CentralDark é a fonte da verdade
VPS EXECUTA.          só o que já foi aprovado
AÇÕES PROVAM.         nada é "pronto" sem evidência que outro possa repetir
```

---

## 3. O que você nunca faz sem ordem escrita

```text
merge na main            deploy            restart de serviço
force-push               reset --hard      apagar arquivo
tocar em produção        mexer na VPS      alterar área consolidada
```

E nunca, em hipótese alguma: ler, abrir, copiar ou usar como contexto
`.env`, `secrets/`, `tokens/`, `sessions/`, `.ssh/`, chave ou certificado.
Para credencial, só validação de presença — nunca o valor.

---

## 4. Quando a tarefa for crítica, use a lupa

`.agents/skills/meta-lupa/SKILL.md` é o motor de auditoria da casa.
A identidade vigente é declarada somente em `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`
e deve coincidir com o blob Git real; adaptadores não copiam SHA.
Ela vale para deploy, consolidação, merge, migração, segurança e regressão —
não para toda conversa.

Duas extensões dela, para casos específicos, quando estiverem instaladas:

- **auditoria-pr** — antes de dar veredito sobre um PR;
- **selo-xp** — antes de fechar missão e reivindicar XP.

---

## 5. Onde está o resto

| Preciso de… | Vá para |
|---|---|
| método universal de coordenação em delta | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| o que está pendente | `docs/PENDENCIAS.md` |
| o que já aprendemos errando | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| o documento mestre | `docs/CONSCIENCIA/CONSCIENCIA.md` |
| o que pode e o que não pode | `docs/CONSCIENCIA/02-PERMISSOES.md` |
| estado atual da VPS | `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` |
| tradução de termo técnico | `docs/GLOSSARIO_TECNICO_LEIGO.md` |
| o sistema explicado sem jargão | `docs/MAPA_LEIGO_DO_SISTEMA.md` |
| como o Pivete evolui o próprio método | `docs/CONSCIENCIA/LEMBRANCAS/AUTO-EVOLUCAO-MENTAL-PIVETE.md` |
| o que o Pivete quer construir | `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md` |
| o que já foi feito e o que falta | `docs/ESTADO-DA-RETOMADA.md` |

---

## 6. Antes de encerrar

Deixe o próximo no lugar em que você gostaria de ter chegado:

```text
O QUE FOI FEITO=      com evidência concreta, não com adjetivo
O QUE NÃO FOI TOCADO=
ESTADO REAL=          o que dá para provar, não o que você acha
PENDÊNCIA=
PRÓXIMO PASSO=
```

Aprendizado que muda comportamento vai para `docs/CONSCIENCIA/APRENDIZADOS.md`.
Conversa que não muda nada não polui o canônico.

---

> Esta porta é verificada por `scripts/lupa/validar-porta-de-entrada.mjs` e pelo mapa global em `apps/modulos/mapeamento/core/validar-mapa.mjs`.
> Se algum caminho citado, contrato ou adaptador universal deixar de existir, o CI fica vermelho.
> Documento canônico que ninguém alcança não governa nada — foi assim que o
> JEITO-CORRETO-DO-PIVETE ficou meses escrito e ignorado.
