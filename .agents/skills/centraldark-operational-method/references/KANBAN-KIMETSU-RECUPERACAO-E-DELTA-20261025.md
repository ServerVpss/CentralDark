# Kanban Hermes — recuperação Kimetsu, modelo local, duplicatas e delta contínuo

**Owner:** `centraldark-operational-method`. **Missão-mãe:** `t_911e17ff`. **Ambiente desta prova:** Windows Casa `SEGREDO`. **Última medição-base:** 25/10/2026, horário da Bahia. **Estado:** método documental integrado; as execuções futuras exigem prova própria.

## 1. Intenção, proteção e escolha da respiração

- **Intenção:** recuperar as filhas úteis da missão-mãe sem criar cartões repetidos, perder histórico, sobrepor escritores ou saturar modelos locais.
- **Kimetsu existente:** [`kimetsu-brainstorm`](../../kimetsu-brainstorm/SKILL.md). Aplicar `VERSO → DECLARAÇÃO → EXECUÇÃO → EVIDÊNCIA → VEREDITO → TRANSIÇÃO`. Uma técnica declarada não é técnica comprovada.
- **🫁 Concentração:** medir estado, proprietário, modelo, execução e logs. Distinguir `KNOWN`, `UNKNOWN`, `ASSUMED`. Uma missão em `RUNNING` não prova trabalho, um processo vivo não prova produção, e `DONE` sozinho não prova efeito.
- **🌊 Água:** frente a limite de cota, provedor indisponível ou contexto excedido, contornar o obstáculo; nunca insistir em várias execuções idênticas.
- **🦋 Inseto:** corrigir a causa identificada no menor alvo possível. Um escritor por arquivo; as auditorias podem ser paralelas, as mutações concorrentes no mesmo alvo não.
- **⭐⭐⭐ Michelin:** construir, integrar e provar com leitura real de arquivos, testes focados e contraprova. `NOT_PROVEN` permanece visível até prova.
- A missão-mãe é índice `blocked` intencional, **não worker**. Preservar `t_911e17ff`. Filhos existentes mantêm o mesmo ID. **Não ligar a mãe bloqueada como dependência antes de DONE:** isso pode impedir despacho da filha. Vincular filha concluída e comprovada e conferir os dois lados.

## 2. Observação nativa, sem sistema paralelo

Executar no host correto e ler o retorno integral em ambiente autorizado, **sem despejar segredos nos handoffs**:

```powershell
hermes kanban stats
hermes kanban list --status blocked --json
hermes kanban list --status scheduled --json
hermes kanban show <ID_EXISTENTE> --json
hermes kanban runs <ID_EXISTENTE>
hermes kanban log <ID_EXISTENTE>
hermes kanban diagnostics
```

Os marcadores `<ID_EXISTENTE>` são placeholders, nunca executados literalmente. Para cada cartão, extrair `status`, `model_override`, `provider_override`, `runs.status`, `worker_pid`, eventos de `heartbeat`, erro terminal, tamanho/horário do log, artefato editado e recibo. Comparar **duas leituras sucessivas** antes de afirmar avanço; log sem delta e CPU ociosa não provam entrega. `Gateway ativo`, `HTTP 200` ou `health: ok` são sinais parciais.

**Classificação obrigatória:**
- `COTA`: erro HTTP 429, limite do provedor ou `rate-limited` em log; nova tentativa deve respeitar capacidade real.
- `CONECTIVIDADE`: timeout de URL/provedor; não classificar automaticamente como cota.
- `CONTEXTO`: erro `This conversation has grown too long`, compressão insuficiente ou janela excedida. **Trocar provedor sem resolver sessão/contexto não garante correção.**
- `WORKSPACE`: caminho relativo ou inexistente; corrigir o alvo da intenção antes de despachar.
- `SEM_EVIDENCIA`: `RUNNING` com processo presente mas sem saída ou artefato, não declarar PASS.
- `ENTREGA`: `DONE` com teste material, leitura após escrita, integridade e contraprova; guardar recibo.

## 3. Recuperação sem tempestade de workers

1. Mapear o ID existente, a intenção e o arquivo proprietário; verificar se outra tarefa já atende ao mesmo objetivo.
2. Se houver falha recorrente, **estacionar nativamente** o cartão com `hermes kanban schedule ID "motivo"`. Na Casa esse comando mudou cartões `blocked` para `scheduled` sem apagar o histórico. Nunca confundir `scheduled` com uma execução ativa. **O estado de espera não é um bloqueio exclusivo:** outro cliente/agente pode executar `unblock`; consultar eventos e run de novo antes de afirmar que continua pausado, sem disputar a edição do cartão.
3. Investigar o erro **antes** do desbloqueio. Para `CONTEXTO`, dimensionar contexto real da sessão, entrada/histórico, resumo transferível e limites do modelo. Procurar o caminho de **nova sessão ou compactação documentada na versão instalada** sem perder corpo, ID, handoff ou recibos. **Não presumir** que `/new` num terminal reinicia corretamente um worker Kanban nem manipular o banco SQLite à mão.
4. Corrigida e testada a causa, liberar **um ID existente por vez** com `hermes kanban unblock ID --reason "causa corrigida e critério de aceite"`. O gateway pode despachar automaticamente: não prometer que ficará em `READY`. Monitorar `RUNNING`, run novo, PID, logs e efeito real antes de liberar mais.
5. `hermes kanban set-model ID model --provider llamacpp` configura a próxima execução no provedor local, **não repara histórico/contexto e não altera um worker já admitido**. Não ligar MoA ou fallback externo apenas para contornar cota: exigir solicitação e prova do modelo disponível.
6. Se falhar igual, deixar `scheduled` ou `blocked` com motivo e `NEXT_CURSOR`. **Sem loop de desbloqueio, duplicação de cartões, alteração global de perfis ou morte indiscriminada de PIDs.**

## 4. Duplicatas: provar antes de arquivar

Uma duplicata exige **mesma intenção + mesmo alvo/owner + mesma entrega pretendida** e comparação de histórico, artefatos, recibos e dependências. Dois cartões `blocked` ou com títulos parecidos **não bastam**. Um cartão de auditoria pode alimentar outro de implementação sem ser duplicata.

- **Se duplicata comprovada:** conservar o cartão canônico e aproveitar exclusivamente deltas comprovados do repetido. Registrar no cartão e no handoff o `ID_CANONICO`, `ID_DUPLICADO`, conteúdo reaproveitado, contraprova e motivação.
- **Retirar do Kanban ativo:** usar `hermes kanban archive ID_DUPLICADO` **somente após provar duplicidade**, sem `--rm`, que apaga permanentemente cartão já arquivado. Confirmar com leitura posterior que o canônico está intacto.
- **Se distintos ou incertos:** estacionar (`scheduled`) e classificar `NAO_DUPLICADO` ou `DUPLICIDADE_NAO_COMPROVADA`; jamais excluir por contagem, título ou autoria.
- **Não arquivar a missão-mãe**, não converter seu `blocked` deliberado em execução, não promover `UNKNOWN` a PASS.

## 5. Evidência da Casa observada em 25/10/2026

| Prova observada | Veredito restrito |
|---|---|
| Modelo GGUF servido no Hermes por `llamacpp/model`; endpoint local respondeu `/health`, `/v1/models` e teste de texto `TESTE_LOCAL_OK`. | `PASS` para inferência curta; não prova tarefa longa. |
| `t_42544fe8` passou a `DONE`, `parents` contém `t_911e17ff`; `StatusPanel.tsx` passou a reutilizar `EstadoOperacional`/`etiquetaCanonica`; handoff da filha existe. | `PASS` para delta de fonte e conclusão do cartão; comparação visual com 8081 ainda `NOT_VERIFIED`. |
| `t_4a328069`, `t_b4b70da6`, `t_6056a006`, `t_7cfbaae4`: falhas por `This conversation has grown too long` e `rc=1` ao rodar com modelo local. | `FAIL` para essas execuções; ainda não há correção comprovada do contexto. |
| Cinco Delta-Filhos `t_4a328069`, `t_b4b70da6`, `t_6056a006`, `t_7cfbaae4`, `t_80a4c299` movidos a `scheduled`; `blocked` caiu de 13 para 8. | `PASS` para mudança **do estado Kanban**, não para implementação funcional. |
| `hermes moa list` mostrou preset `default` com agregador externo, porém `Active in config: (off)`. | `NAO_ATIVO`; não confundir Kimetsu com MoA nem ativar sem aceite. |

As contagens são **fotografia datada**, não valores atuais garantidos. Reconsultar sempre. A GPU Windows foi apresentada ao usuário como RX 580; medição de memória por WMI e a declaração de 8 GB divergiram, portanto **capacidade real e offload ficam `NAO_MEDIDOS`** até evidência do Afterburner/driver. FPS de renderização não equivale a tokens por segundo. Não reiniciar o servidor local ou alterar parâmetros de GPU por causa deste documento.

## 6. Abrir Explorer e ferramentas de forma geral, sem novo aplicativo

**Capacidade confirmada na Casa:** abertura visual do Explorador no diretório dos modelos do Jan solicitada pelo usuário. O método se aplica a **qualquer diretório permitido**, não é específico do Jan; **não** afirma disponibilidade em sessões sem desktop interativo.

```powershell
$Destino = $DiretorioDefinidoPelaIntencao
if (!(Test-Path -LiteralPath $Destino -PathType Container)) { throw 'DIRETORIO_AUSENTE' }
Start-Process -FilePath 'explorer.exe' -ArgumentList ('"' + $Destino + '"')
# Readback opcional no mesmo usuário interativo:
$shell = New-Object -ComObject Shell.Application
$shell.Windows() | Select-Object LocationName,LocationURL
```

Para páginas web explicitamente autorizadas, distinguir **abrir navegador** de **autenticar ou provar operação MCP**. Abertura visual/URL não prova conexão nem login; conferir resultado sem expor tokens.

## 7. Registro mínimo no mesmo handoff

Usar o handoff já existente em `K:\scripts\remote-bridge\canonical\`, **sem nova pasta, scheduler, ponte ou arquivo de estado paralelo**. Campos: `ID_MAE`, `ID_FILHA`, `INTENCAO`, `OWNER`, `STATUS_ANTES`, `STATUS_DEPOIS`, `PROVEDOR`, `MODELO`, `RUN_ID`, `ERRO_EXATO`, `PROVA`, `CONTRAPROVA`, `DELTA_UTIL`, `NEXT_CURSOR`. O outro agente lê o mesmo handoff com escrita coordenada; **um escritor por arquivo**.

**Por que fazer:** evitar cota/contexto, falsos verdes e acúmulo de duplicatas. **Por que não criar outra coisa:** Kanban, Kimetsu, Michelin, catálogo e handoffs já existem. **Por que usar:** comandos nativos observados e uma missão-mãe estável. **Por que modificar:** faltava na entrada operacional um roteiro específico para recuperação, deduplicação e prova local. **O que mudou:** somente orientação aditiva; não configura provedor, servidor, porta, cartão ou modelo. **Contraprova:** comparar após a escrita os IDs, tarefas, arquivos e comportamentos antes de declarar regressão zero.
