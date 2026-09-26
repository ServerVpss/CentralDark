# HANDOFF PARA HERMES — ENCAIXAR, NÃO DUPLICAR

## Missão

Reconcilie este pacote com o estado vivo da CentralDark e aplique **somente o delta útil** no owner existente.

## Proibido

- criar CentralDark Browser V2/V3/V4;
- criar segundo Harvester;
- criar segunda SOL;
- criar segundo Knowledge Compiler;
- criar novo event bus sem gap provado;
- criar PR novo para matéria da mesma intenção quando o PR vigente cobrir o escopo;
- mutar `main` diretamente;
- deploy;
- apagar dados;
- ingerir segredos;
- transformar snapshot histórico em estado atual.

## Ordem

1. Ler `LEIA-ME-IA.md`.
2. Carregar owners obrigatórios.
3. Medir branch, HEAD, PR, Writer e runtime.
4. Reconciliar este pacote com:
   - `session-intelligence-harvester`;
   - `knowledge-compiler`;
   - `meta-lupa`;
   - owner de orquestração;
   - proof ownership;
   - execução reversível/remediação.
5. Classificar cada arquivo do pacote:
   - REUSE_AS_IS
   - ABSORB_IN_EXISTING_OWNER
   - TEST_ONLY
   - DOC_ONLY
   - NO_CHANGE
   - REJECT_DUPLICATE
6. Se o PR #1119 ainda for o Writer-Scope da matéria:
   - trabalhar em cima dele;
   - não abrir outro PR.
7. Executar testes.
8. Produzir receipt.
9. Reality Judge independente.
10. Só promover o que sobreviver.

## Resultado esperado

```text
INTENÇÃO
→ ingressos N
→ adapters sob demanda
→ envelope de proveniência
→ Harvester
→ dedupe/delta
→ causalidade/contraprova
→ SOL
→ decisão
→ ONE_WRITER_PER_SCOPE
→ HERMES
→ efeito
→ observabilidade
→ Reality Judge
→ Knowledge Compiler
→ cristal | NO_CHANGE
```
