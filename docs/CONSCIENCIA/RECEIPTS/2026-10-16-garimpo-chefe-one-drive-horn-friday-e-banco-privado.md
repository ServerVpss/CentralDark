---
title: "Garimpo CHEFE — OneDrive, Horn, FRIDAY e banco privado"
date: 2026-10-16
owner: "docs/CONSCIENCIA/RECEIPTS/"
status: "SOURCE_REVIEWED; NOT_RUNTIME_PROVEN"
source_class: "CHEFE_UPLOADED_REFERENCES"
main_sha_at_review: "d2888eb844d96e8f8e025ea26837e4605c5ea7ae"
privacy: "RAW_SQLITE_AND_LOCAL_ONEDRIVE_NOT_IMPORTED"
---

# Garimpo de fontes CHEFE — delta documental, sem núcleo paralelo

**Intenção vigente:** preservar o valor do que o CHEFE enviou, comparar à `main`, registrar diferenças e dependências, sem substituir owners nem publicar dados privados. Esta é uma PROVA DOCUMENTAL e um índice de proveniência; não é implantação, treinamento de modelo, ingestão de vault nem declaração de autonomia operante.

**Fontes analisadas nesta remessa:** captura da pasta OneDrive, três PDFs de referência de arquitetura, e banco local `db.sqlite`. Os arquivos binários permanecem anexados à conversa/local; o Git recebe apenas dados derivados seguros e fingerprints. Captura é apenas visão de nomes, NÃO conteúdo da pasta nem autorização de varredura da conta.

## 1. Inventário por fonte — conteúdo, hash e limite

| Fonte recebida | Tamanho | SHA-256 | Evidência / classificação |
|---|---:|---|---|
| `1788368677536893.pdf` — Arquitetura_IA_Operante | 17.257 B, 2 páginas | `111c91bef0d83df969083b85b7bc82ceedd8fb054d86ee365813c7c58f027606` | Conceitos de Lógica de Horn: fatos, regras, objetivo, resolução; consistência, recursão, contradições; **REFERÊNCIA**, sem prova de implementação. |
| `1788368282174742.pdf` — Relatório de Evolução de Sistemas JARVIS e FRIDAY | 14.675 B, 2 páginas | `b3e66543c344227bb531acb275403bc4f8095f706e7f4a01214efbc9182a2e5d` | Analogia ficcional da sucessão J.A.R.V.I.S. → F.R.I.D.A.Y., herança de memória e mudança de função. **INSPIRAÇÃO/CONTEXTO**, não arquitetura observada. |
| `1788368374657902.pdf` — Relatorio_Arquitetura_IA_FRIDAY | 17.172 B, 2 páginas | `eae22d8e61742adbfc850d6f39071e7502cceb3a7f6b0c4cc55d7c76bfc17930` | Modularidade, processamento em tempo real, memória, sandboxing, percepção/raciocínio/ação; **CANDIDATO CONCEITUAL**, sem teste de latência ou autonomia. |
| `image(20261017-005105).png` — OneDrive / pasta CHEFE | 166.307 B | `08cc19330715ba0bf2b7ffd1c62776594c209d2e845aa4aca4157fddecd8adf8` | Captura de Explorer com documentos de conhecimento, arte, devtools e pendências; **SOMENTE LISTAGEM VISÍVEL**. |
| `db.sqlite` | 225.349.632 B | `c1e1ef9c518d7d0ad822b4f3fe1cae2c85c7af27c77a3ad0ca6a1c7e7d137c01` | Banco com **histórico de chat**; **PRIVADO / NÃO IMPORTAR NEM ANEXAR AO PR**. |

**Inspeção SQLite read-only e sem consultar mensagens:** SQLite válido com tabelas `history` (2 linhas) e `chat_info` (18 linhas), mais `sqlite_sequence`; esquema inclui `title`, `last_question`, `last_answer`, `question`, `answer`, `more`, `files`. **Nenhum valor de mensagem foi exportado**. A existência de linhas é evidência de armazenamento, NÃO prova do consumidor ou identidade do app que criou o banco. O banco bruto é grande, sensível, possivelmente relevante à memória; preservar local, não sincronizar ao Git. Evitar metadados que exponham usuários e chaves.

**OneDrive:** a captura mostra uma pasta CHEFE nomeada por conhecimentos, artes visuais, melhorias, pendências e garimpos; aparecem itens denominados `devtools_...`, `IDENTIDADE E VOZ`, `METODO META BUSUL MULT BUSSULA` e fragmentos de exportações de conversas. **Não foi possível abrir ou ler esses documentos** a partir da imagem. Seu conteúdo e equivalência com a main continuam **UNKNOWN**, assim como contagens totais da pasta. Não replicar nomes sensíveis ou conteúdos não observados.

## 2. Confronto com owner canônico em main (medição de source, não de runtime)

| Ideia recebida | Owner já presente em main | Delta real | Situação |
|---|---|---|---|
| Horn: fatos → regras → derivação / modelo mínimo Herbrand / fecho | `docs/CONSCIENCIA/REFERENCIA-LOGICA-HORN-REUSE-FIXED-POINT.md`; `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/HORN-COGNITIVE-LOCK.md`; `docs/CONSCIENCIA/04-GATES/PDF-GATE-GLOBAL-TLC23.md` | **NÃO CRIAR OUTRO MOTOR:** já existe contrato e teste de subset proposicional. PDFs são explicações adicionais, não contraprova nova. | ALREADY_OWNED |
| Percepção → raciocínio → ação, fontes e contraprova | `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md`; `AGENTS.md`; `apps/modulos/HERMES-CORE/` | Reforço didático e metáfora de FRIDAY; nenhuma nova ligação de runtime demonstrada. | REFERENCE |
| Memória/continuidade não depende do nome do modelo | `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`, `SECOND-BRAIN.yml`, `scripts/memory-linker/` | Analogia JARVIS/FRIDAY compatível como inspiração; **não** implica que IA seja autônoma, consciente ou operante. | REFERENCE |
| Bancos de conversas e ideias para Dream Reviewer | `docs/CONSCIENCIA/`, `scripts/memory-linker/`, owners de observabilidade existentes | Possível corpus pessoal. Antes de qualquer ingestão: identificar aplicativo proprietário, direitos/acesso, classificação privada, deduplicação, opt-in, exclusão de chaves e prova da origem. | BLOCKED_PRIVACY |
| Captura OneDrive / devtools / artes | Owners de biblioteca/DesignCenter e garimpo existentes | Só títulos de arquivos à vista. Não inferir que capacidades foram portadas ou estão obsoletas. | CONTENT_UNKNOWN |

## 3. Regras de interpretação da fonte, preservadas com precisão

- O PDF **Arquitetura_IA_Operante** relaciona fatos, regras, objetivo e resolução e propõe três âncoras de consistência, recursão e gestão de contradições. Isso é argumento do documento, **não benchmark nem teorema de segurança do produto**.
- O PDF **Evolução JARVIS/FRIDAY** trata personagens ficcionais e herança operacional como analogia de design. O conteúdo sobre filmes/voz não é evidência de arquitetura da CentralDark.
- O PDF **Arquitetura FRIDAY** enfatiza modularidade, memória, sandboxing e checagem de metas. Alegações de "latência quase zero", redes neurais, aprendizado por reforço ou superioridade em tempo real **não têm medição na remessa**. Não gerar métricas artificiais.
- Para qualquer fonte futura: `SOURCE_PRESENT != CAPABILITY_WIRED != RUNTIME_PROVEN`; `MODEL_SWITCH != IDENTITY_MIGRATION`; `MEMORY != REALITY`; `UNKNOWN != PASS`.
- Aplicar `REUSE_BEFORE_CREATE`: nenhuma segunda SOUL, banco de memória, CLI, parser Horn, HUD, app ou serviço.

## 4. Continuidade da remessa

```text
SOURCE_INVENTORY=5_REFERENCES
SOURCE_BINARY_IMPORTED_TO_GIT=0
SAFE_DOCUMENTARY_RECEIPT=THIS_FILE
ONE_DRIVE_FOLDER_READ=NO (PRINT_ONLY)
SQLITE_MESSAGE_VALUES_READ=NO
SQLITE_RAW_COMMITTED=NO
PDF_RUNTIME_CAPABILITIES_PROVEN=NO
EXISTING_OWNER_HORN=FOUND
EXISTING_OWNER_MEMORY=FOUND
REQUIRED_NEW_DEPENDENCY=NOT_IDENTIFIED_IN_REVIEW
GLOBAL_FIXED_POINT=NOT_CLAIMED
```

**NEXT_CURSOR:** próximas fontes do CHEFE devem ser comparadas por hash/owner/source/consumer; quando trouxerem informação nova, anotar o menor delta no mesmo contrato, sem copiar dados privados nem converter argumento teórico em PASS de runtime. Se o CHEFE pedir ingestão privada de chats/vault, exigir primeiro rota autorizada e contrato de privacidade, sem colocar o SQLite no GitHub.

**Relações:** PR #1838 = owner do HUD (somente projeção); PR #1837 = workshop/catálogo de skills (não owner deste corpus); nenhum PR existente aberto foi encontrado para esse garimpo documental, por isso registro neste escopo separado apenas para revisão, sem merge/deploy.


## 5. Continuidade — materiais anteriores recebidos nesta mesma investigação

Este recibo dá continuidade ao garimpo já feito na conversa. As fontes abaixo NÃO foram anexadas ao commit e NÃO foram reabertas byte a byte nesta operação. São vínculos de inventário anteriores, sujeitos a reconciliação quando os arquivos retornarem como fonte montada:

| Material anterior | Relação com a main já levantada | Próximo tratamento |
|---|---|---|
| `github-app(1).yml` / `github-app.yml` antigo | Declarações de SOUL/memória/orquestração; `SOUL-SOL.md`, `RULES.md`, `AGENTS.md` permanecem owners. Não tratar YAML antigo como app GitHub instalado. | Comparar apenas cláusulas que mudam efeito; sem nova SOUL. |
| `secret-map-redacted.json` e `.txt` | Inventário de nomes de variáveis e origens; não prova autorização/validade de provedores. Os dois formatos foram apontados como representação de levantamento anterior. | **PRIVATE_METADATA**: nunca publicar valores, tokens, caminhos completos de segredos nem copiá-los ao Cockpit. |
| `Desktop(1).zip` | Garimpo prévio apontou artefatos repetidos, snapshots de interface/VS Code e relatórios históricos de túnel MCP; são candidatos a teste no `computer-use`/bridge existentes, não novos runtimes. | Revisar somente deltas e fingerprints necessários, sem importar arquivos `.claude.json`, sessões ou tokens. |
| Capturas de Screenpipe/Casa/Sync Center | Histórico de HTTP 200 na porta local 3030 e gaps de identidade de health, autorização, DUAL CONTA e UI; owners de sensor/HUD já existem. | Fonte nova de console pode provar escopo específico; nunca extrapolar para deploy global. |

**Separação:** histórico do chat e relatórios anteriores != releitura presente do binário. Os cinco hashes da seção 1 foram medidos dos arquivos desta remessa. O resultado desta PR continua limitado a documentação sanitizada.
