# Calibração de boot em repositórios governados

## Quando usar

Ao entrar em um repositório que injeta `AGENTS.md`, `CLAUDE.md`, `.hermes.md` ou outro arquivo de governança, especialmente quando houver `BOOT_REQUIRED`, skill obrigatória, ledger ou recibo.

## Distinções obrigatórias

```text
CONTEXTO_INJETADO ≠ DOCUMENTO_CONSCIENTEMENTE_VERIFICADO
SKILL_LIDA ≠ BOOT_OPERACIONAL_VALIDO
HTTP_200/PÁGINA_ABERTA ≠ CHAT_E2E_FUNCIONAL
GATE_DE_POLÍTICA ≠ GIT_HOOK_EXECUTÁVEL
```

A injeção automática faz a regra chegar à sessão. Ela não prova que o agente cumpriu o protocolo, executou script, abriu `BEGIN` ou validou o gate.

## Protocolo

1. Identificar qual arquivo de contexto foi injetado e quais leituras ele torna obrigatórias.
2. Ler os documentos mandatórios antes de declarar calibração.
3. Resolver a identidade da skill pelo caminho canônico do repositório. Se o catálogo tiver nomes duplicados, não escolher por adivinhação.
4. Fixar `MISSION_ID`, `HEAD`, referência remota e SHA/árvore da skill.
5. Se houver ledger/recibo obrigatório, abrir `BEGIN` fresco antes da primeira ação abrangida pela regra.
6. Executar o gate determinístico e exigir `PASS`.
7. Só então agir no repositório.
8. Encerrar com `FINAL`, AutoLupa, evidências, risco residual e ponto fixo.

## Estados corretos

```text
CALIBRADO_CONTEUDO=SIM|NAO
BOOT_OPERACIONAL_VALIDO=SIM|NAO
RECIBO_FRESCO=SIM|NAO|NAO_APLICAVEL
GATE=PASS|BLOCKED|NAO_APLICAVEL
```

Nunca resumir esses quatro estados apenas como “calibrado”. Se a regra exigir recibo e ele estiver ausente, o estado é `BOOT_BLOQUEADO`, mesmo que a skill tenha sido lida integralmente.

## Erro já ocorrido: falsa calibração

Sintoma: declarar “calibrado” depois de ler documentos, mas sem completar as leituras mandatórias ou sem abrir o recibo exigido.

Tratamento:

```text
corrigir status para FALSE_GREEN/BOOT_BLOQUEADO
→ parar ações abrangidas
→ preservar a evidência
→ declarar a causa
→ não fabricar recibo retroativo
→ iniciar uma nova execução válida quando houver ordem operacional
```

## Pergunta não autoriza escrita

Perguntas como “você consegue corrigir?” ou “está calibrado?” pedem diagnóstico. Não autorizam escrever no ledger, alterar arquivos ou iniciar uma missão. O `BEGIN` é escrita; só deve ser emitido quando houver ordem operacional aplicável.

## Política versus hook executável

Para saber se existe automação real, verificar separadamente:

- instruções auto-injetadas (`AGENTS.md`, `CLAUDE.md`, `.hermes.md`);
- `core.hooksPath` e hooks ativos em `.git/hooks`;
- scripts/watchers/CI que possam executar por evento.

Se só houver instrução de boot, descrevê-la como **gate de política carregado automaticamente**, não como script executado ao entrar no diretório.

## Critério de aceitação

Uma calibração operacional só está fechada quando cada condição mandatória tem evidência própria. Ausência de evidência não pode ser preenchida por uma frase confiante.