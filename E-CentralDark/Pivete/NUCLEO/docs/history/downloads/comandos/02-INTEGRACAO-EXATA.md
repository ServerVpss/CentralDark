# Integração exata no CentralDark

## Owner principal

`docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md`

Não criar `BIBLIOTECA-V2`, novo banco, nova memória ou novo cérebro.

## Runtime existente

`scripts/memory-linker/library-router.mjs`

Hoje ele já concentra validação do catálogo, identidade estável, reconciliação de fonte, sessão de evidência e bloqueio de referência efêmera persistida.

Formatos observados atualmente:

```text
pdf, epub, jwpub, gdoc, gdrive-md, gdrive-folder, txt
```

Extensão proposta no mesmo owner:

```text
web, rss, github, podcast, public-social
```

## Agentes

O `Knowledge-Collector` atual permanece dono do ledger interno de aprendizados. Não transformá-lo em crawler externo.

Criar apenas um runtime subordinado:

`apps/modulos/HERMES-CORE/agents/Human-Mind-Router/agent.mjs`

Perfis/lentes:

`docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/HUMAN-MIND-ROUTERS/ROUTERS.yml`

## Arquivos existentes a alterar

1. `docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md`
   - adicionar seção curta apontando Human Mind Routers;
   - afirmar que material público é `STUDY_CANDIDATE`, não autoridade.

2. `docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/catalog.json`
   - aplicar `CATALOG-DELTA.yml` por merge;
   - nunca substituir catálogo inteiro.

3. `scripts/memory-linker/library-router.mjs`
   - ampliar formatos permitidos;
   - validar proveniência pública;
   - canonical URL/external ID como locator;
   - dedupe/fingerprint de publicação;
   - preservar toda semântica atual de evidência.

4. `scripts/memory-linker/library-router.test.mjs`
   - adicionar contraprovas do pacote.

5. `apps/modulos/HERMES-CORE/agents/Human-Mind-Router/agent.mjs`
   - runtime genérico read-only.

6. `apps/modulos/HERMES-CORE/agents/agents-contract.test.mjs`
   - provar que lenses não são humanos, não escrevem e não ganham autoridade.

7. `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
   - apenas encaixe curto: Human Mind Router = braço read-only de percepção externa.

8. `LEIA-ME-IA.md`
   - regra condicional: carregar Human Mind Routers somente quando a missão exigir fonte humana pública atual/contraste de escolas.

9. `.github/workflows/porta-de-entrada.yml`
   - reutilizar gate existente e acionar testes novos quando paths relevantes forem tocados.
   - não criar workflow concorrente.

## Scheduler

O repo possui múltiplos cron/schedulers. Não escolher no escuro.

```text
MEASURE_SCHEDULER_OWNER
→ identificar owner canônico vigente
→ reutilizar
→ preparar binding
→ ativação/deploy somente com autorização aplicável
```
