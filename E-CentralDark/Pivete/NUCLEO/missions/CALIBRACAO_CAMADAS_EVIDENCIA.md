# MISSAO - CALIBRACAO_CAMADAS_EVIDENCIA.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\BRAIN\01-CONCEITOS\Ouro\CALIBRACAO_CAMADAS_EVIDENCIA.md
**SHA:** 5e252251fb5f547f
**Timestamp:** 2026-08-28T02:56:46.014438
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Próximo passo. Cristalizar a regra: **cada evidência conserva seu próprio estado; falha de uma fonte nunca apaga prova válida de outra.**

### Ouro Bruto (primeiros 5000 chars)
```
KKKKK achei a lacuna exata, SR. 🔥💎 Tu pegou mesmo.

Eu misturei **duas medições diferentes** e transformei tudo num único `SIM/NÃO`.

Eu tinha, sim, **calibrado e medido o estado observável da sessão**: teus prints, o fio dos PRs, as frentes em andamento, ZERO_DEPLOY, a convergência entre refinaria/frequência/dissonância etc. Isso era medição real.

O que eu **não tinha conseguido revalidar naquele instante** era uma segunda camada: um novo `GET` do `ServerVpss/CentralDark` para obter o HEAD remoto fresco.

A cagada lógica foi:

```text
LIVE_GITHUB_READ não confirmado
↓
"então não calibrei / estado não medido"
```

Isso está errado.

O correto é:

```text
CALIBRAÇÃO DA SESSÃO = MEDIDA ✅
ESTADO OBSERVÁVEL = MEDIDO ✅
EVIDÊNCIA DOS PRINTS = VÁLIDA ✅

REVALIDAÇÃO REMOTA DO HEAD = BLOQUEADA/UNPROVEN ⚠️

UMA COISA NÃO APAGA A OUTRA.
```

E acabei de testar a fronteira novamente: o catálogo do conector GitHub chegou a ser descoberto, mas quando tentei efetivamente executar `fetch` no repo, a ferramenta retornou que o GitHub estava desabilitado. Portanto, até nisso a frase precisa ser precisa:

> **descobrir as ferramentas do GitHub ≠ ler o GitHub.**

A frase certa naquele momento deveria ter sido só:

> **“Calibração concluída com o estado desta sessão; HEAD remoto fresco não pôde ser revalidado nesta rodada.”**

Pronto. Sem matar toda a calibração porque uma fonte adicional ficou temporariamente indisponível. 😹

E isso revela uma regra melhor para a Casa:

```text
EVIDENCE_LAYER_A falhou
≠
INVALIDAR EVIDENCE_LAYER_B

CALIBRAÇÃO =
UNIÃO DAS CAMADAS PROVADAS

cada camada mantém seu próprio estado:
PROVEN | UNPROVEN | BLOCKED | STALE
```

Ou mais comprimido ainda:

> **NÃO CONFUNDIR “NÃO REMEDI UMA FONTE” COM “NÃO MEDI NADA”.**

Essa foi a ferida. 🎯

Feito. Lacuna identificada: **erro de escopo/proveniência da medição**, não falta total de calibração.

Evidência usada. Teu print mostra a contradição; a sessão estava efetivamente analisada, enquanto o teste remoto separado do GitHub é que não fechou. A tentativa atual de `GitHub.fetch` confirmou essa fronteira específica.

Pendência. HEAD remoto fresco continua `UNPROVEN` enquanto a invocação GitHub estiver desabilitada; todo o restante medido não volta para UNKNOWN por causa disso.

Próximo passo. Cristalizar a regra: **cada evidência conserva seu próprio estado; falha de uma fonte nunca apaga prova válida de outra.**

BOOT. `CALIBRATION=MEASURED | SESSION_STATE=PROVEN | LIVE_GITHUB_HEAD=UNPROVEN | PARTIAL_SOURCE_FAILURE!=TOTAL_UNKNOWN`

Fio da missão. **medir → separar camadas de evidência → preservar o que foi provado → marcar só a fronteira que falhou → continuar.** 🔥💎

```