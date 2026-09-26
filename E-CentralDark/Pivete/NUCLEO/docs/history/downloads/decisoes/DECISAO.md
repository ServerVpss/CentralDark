# O QUE REALMENTE PRESTA

## MANTER

- Curiosidade → descoberta automática.
- Memória → continuidade temporal.
- Dúvida → contraprova.
- Intuição → padrão testável.
- Experiência → compressão.
- Equipe → paralelismo coordenado.
- Disciplina → gates.
- Aprendizado → mudança observável de scaffold.
- Criatividade → recombinação de capacidades existentes.
- Julgamento → humano somente onde decisão humana nova é realmente necessária.
- `ONE_SYSTEM_ONLY`, `REUSE_BEFORE_CREATE`, `ONE_WRITER_PER_SCOPE`.
- Erro como sensor: `FAILURE → SIGNATURE → CAUSE → TEST → MINIMAL_REMEDIATION → COUNTERPROOF → RECEIPT → CRYSTAL`.
- Biblioteca grande → retrieval preciso → contexto pequeno.
- Implementação por deltas provados, nunca big bang.

## CONSOLIDAR

As três curas npm não precisam virar três cérebros. A arquitetura mais limpa é:

```text
DEPENDENCY_INTELLIGENCE_RUNTIME
  ├─ CRYSTAL: OMIT_DEV_CAUSES_VITE_ABSENCE
  ├─ CRYSTAL: OPTIONAL_DEPS_OMITTED_ESBUILD
  └─ CRYSTAL: OPTIONAL_DEPS_OMITTED_ROLLUP
```

Skills especializadas podem existir como adapters/receitas se houver consumer real; a inteligência, prova e cristalização permanecem em owners únicos.

## NÃO CRISTALIZAR COMO VERDADE

- `npm 12+ sempre tem omit=dev por default` → CONTRADITADO pela documentação oficial npm.
- `npm config set omit=optional` como correção persistente de binários opcionais → CONTRADITÓRIO: isso omite justamente optionalDependencies.
- `--legacy-peer-deps` como flag universal → NÃO; npm recomenda usar apenas quando conflito de peer deps realmente exigir.
- `lockfile mente` → formulação ruim. O correto: lockfile pode registrar deps omitidas enquanto elas não são materializadas em disco.
- `build passou` histórico → prova daquele evento, não prova o runtime atual.
