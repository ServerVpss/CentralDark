# Prompt pronto — APLICADOR

```text
#ACORDAR
!CALIBRAR
!MULTIBUSSOLA

MISSÃO=CENTRALDARK-HUMAN-MIND-ROUTER-01
AUTORIDADE_DE_INTENÇÃO=SEGREDO/CHEFE
OBJETIVO=aplicar o pacote HUMAN MIND ROUTER no ServerVpss/CentralDark sem criar sistema paralelo.

LEIA PRIMEIRO:
1. LEIA-ME-IA.md
2. AGENTS.md
3. docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
4. docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
5. docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md
6. scripts/memory-linker/library-router.mjs
7. scripts/memory-linker/library-router.test.mjs
8. este pacote inteiro
9. APPLY-PLAN.yml

ANTES DE ESCREVER:
- medir main HEAD atual;
- medir PRs/writers;
- localizar writer do escopo Biblioteca/memory-linker/HERMES agents;
- se houver writer concorrente, BLOCKED_WRITER_CONFLICT;
- comparar baseline do pacote com estado vivo;
- estado vivo vence snapshot.

INVARIANTES:
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
NO_V1_V2_V3=true
REALITY=JUDGE
UNKNOWN_IS_NOT_PASS=true
HUMAN_ROUTER_WRITE_AUTHORITY=false
PUBLIC_PROFESSIONAL_ONLY=true
PRIVATE_LIFE_TRACKING=false
PERSONA_IMPERSONATION=false

ARQUITETURA:
- não criar cinco runtimes;
- criar um Human-Mind-Router genérico;
- carregar cinco lentes seed de ROUTERS.yml;
- cada lente é adaptação de conhecimento público/profissional, não clone da pessoa;
- Biblioteca atual é owner das fontes;
- library-router atual é owner de identidade/retrieval/evidência;
- JARVIS continua orquestrador;
- Writer único continua sendo o único mutador.

APLIQUE POR FASE:
P1 documentação
P2 extensão do library-router/catalog
P3 runtime genérico
P4 testes
P5 gate existente
P6 apenas preparar binding de scheduler; NÃO ativar/deployar

TESTE:
implementar TEST-MATRIX.yml inteira.
Rodar testes antigos + novos.
Nenhuma regressão aceita.

PROVA FINAL:
- branch
- HEAD
- diff
- arquivos tocados
- testes e contagem
- gate
- estado de Writer
- zero deploy
- pendências UNKNOWN/BLOCKED

NÃO RETORNE PASS se qualquer gate não tiver sido executado no mesmo HEAD.
```
