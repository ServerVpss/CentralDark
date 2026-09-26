# COMANDO - SESSION_SOURCE.txt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK_OURO_RUNTIME_SKILLS_PACK.zip\CENTRALDARK_OURO_RUNTIME_SKILLS_PACK\05_PROVENANCE\SESSION_SOURCE.txt
**SHA:** 7b740b82fb355ac5adb7ec89aea0014fd8457a98c4bff38ba73ccc39221acf7f
**Timestamp:** 2026-08-24T07:05:53.701225
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- AINDA_FALTA=

### Ouro Bruto (primeiros 5000 chars)
```
Sim. **Tira “AGI” completamente.** É rótulo de marketing; não resolve arquitetura nenhuma. O alvo ambicioso é outro:

> **pegar capacidade humana — intenção, julgamento, curiosidade, memória, comparação, criação, correção — e construir uma máquina que amplifique isso sem transformar o humano em operador de bot.**

Fiz o `#ACORDAR + !CALIBRAR + !MULTIBÚSSOLA + !META_LUPA` antes de fechar a proposta. E o estado vivo já deu uma contraprova perfeita: o PR #1119 avançou de novo para `HEAD=8e8b84fe88cbbfcdbbb3f392a7e5f1ad540ef8f8`, agora com 6 commits; neste HEAD, `lupa-conformance=SUCCESS`, mas quase todo o resto ainda está `QUEUED`. Ou seja, qualquer sistema que trabalhe por snapshot está condenado a ficar velho enquanto trabalha.

O canônico da Casa já tem a semente: recuperar contexto automaticamente, pesquisar capacidades existentes, medir ferramentas, reconciliar estado e reutilizar antes de criar.  O que falta é **subir isso de “procedimento de agente” para “mecanismo geral da CentralDark”.**

Eu fecharia a arquitetura assim:

```text
CENTRALDARK — AMPLIFICAÇÃO HUMANA OPERACIONAL

NÃO EXISTE:
AGI
SUPER-AGENTE
MODELO CENTRAL
CLAUDE-SYSTEM
GPT-SYSTEM
HERMES-SYSTEM
OMNIROUTE-SYSTEM
SEGUNDO CÉREBRO
SEGUNDO CONTROL PLANE

EXISTE:

SEGREDO/CHEFE
      │
      │ intenção, gosto, prioridade,
      │ curiosidade, criação, decisão
      ▼
╔══════════════════════════════════════════════╗
║                 CENTRALDARK                  ║
║                                              ║
║            REALIDADE RECONCILIADA            ║
║                     │                        ║
║        ┌────────────┼────────────┐           ║
║        ▼            ▼            ▼           ║
║    MEMÓRIA      PERCEPÇÃO     CAPACIDADES    ║
║        │            │            │           ║
║        └────────────┼────────────┘           ║
║                     ▼                        ║
║                COMPREENSÃO                   ║
║                     │                        ║
║              HIPÓTESES/PLANOS                ║
║                     │                        ║
║               CONTRAPROVA                    ║
║                     │                        ║
║          ESCOLHA DO MENOR CAMINHO            ║
║                     │                        ║
║               ORQUESTRAÇÃO                   ║
║                     │                        ║
║       EXECUTORES / MODELOS / TOOLS           ║
║                     │                        ║
║                 REALIDADE                    ║
║                     │                        ║
║            PROVA + OBSERVAÇÃO                ║
║                     │                        ║
║              APRENDIZADO REAL                ║
║                     │                        ║
║                   ↺                          ║
╚══════════════════════════════════════════════╝
```

O salto 100x está em **não obrigar ninguém a decompor a missão antes**. O sistema recebe algo tipo:

> “quero velocidade, rigidez, força, proteção e facilidade”

e ele próprio descobre que isso envolve Vite, OmniRoute, CI, build, segurança, UX, runtime, histórico, dependências, PRs e ferramentas. **A decomposição é resultado da inteligência, não pré-requisito da inteligência.**

Então eu substituiria o prompt anterior por este núcleo:

```text
#ACORDAR
!CALIBRAR
!MULTIBUSSOLA
!META_LUPA

CENTRALDARK_GENERAL_OPERATION

INTENT = mensagem vigente do SEGREDO/CHEFE

PRINCÍPIO:
O humano define O QUE QUER.
A CentralDark descobre COMO CHEGAR LÁ.

Não pedir ao humano:
- assunto técnico formal;
- arquivos;
- componentes;
- ferramentas;
- agente;
- modelo;
- owner;
- branch;
- ordem de execução;
- decomposição;
- mapa de dependências;
- estado recuperável.

Descobrir tudo que puder ser medido.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. RECONSTRUIR REALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A partir da intenção:

→ recuperar história relevante;
→ medir estado vivo;
→ descobrir entidades envolvidas;
→ descobrir versões;
→ descobrir implementações;
→ descobrir fontes;
→ descobrir dependências;
→ descobrir consumidores;
→ descobrir provas existentes;
→ descobrir trabalho em andamento;
→ descobrir colisões;
→ descobrir resíduos.

Nunca trabalhar sobre narrativa quando existe estado mensurável.

PASSADO = PROVENIÊNCIA
PRESENTE = MEDIÇÃO
FUTURO = HIPÓTESE TESTÁVEL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. FORMAR UM MODELO DO PROBLEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Construir internamente um grafo:

INTENÇÃO
↕
ENTIDADES
↕
CAPACIDADES
↕
DEPENDÊNCIAS
↕
ESTADO
↕
EVIDÊNCIAS
↕
RISCOS
↕
POSSÍVEIS AÇÕES

Nenhum nome é identidade suficiente.

SAME_WORD != SAME_ENTITY
CORRELATION != CAUSE
HISTORY != CURRENT_STATE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. EXPANDIR ATÉ O CAMPO MATERIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Não limitar a investigação à primeira interpretação.

Perguntar internamente:

"o que mais pode mudar esta conclusão?"

Expandir automaticamente para qualquer domínio material:

código
runtime
CI
segurança
UX
arquitetura
histó
```