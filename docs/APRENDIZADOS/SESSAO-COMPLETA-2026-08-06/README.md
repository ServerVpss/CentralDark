# Aprendizado completo — recuperação de artefato interrompido e prova aplicável

**Data:** 2026-08-06  
**Autor da intenção:** SEGREDO/CHEFE  
**Repositório:** `ServerVpss/CentralDark`  
**Base examinada:** `main@f692e3118304724c0c860b56bb00a33e18edeac5`  
**Estado deste conteúdo:** candidato em PR; somente vira canônico após merge humano autorizado.

## 1. O acontecimento

Uma execução produziu um artefato técnico completo, mas a resposta visível da interface foi interrompida/ocultada. Em seguida, uma entrega posterior apresentou outro pacote e gerou ambiguidade sobre qual arquivo correspondia ao trabalho interrompido.

A correção não foi narrativa. O artefato exato foi localizado pela superfície persistente, materializado, comparado pelo SHA-256 e revalidado em extração limpa.

### Artefato interrompido recuperado

```text
ARTEFATO=GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.zip
SHA256=877057300af4369e01e9636809ee6b632ccac9f94db2894acd5f1a6b887588fd
SIZE_BYTES=46740
ZIP_ENTRIES=54
DANGEROUS_PATHS=0
SYMLINKS=0
ZIP_CRC=PASS
STATUS=PASS_LOCAL_DETERMINISTIC
```

### Pacote da sessão acessível

```text
PACOTE_ORIGINAL=PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806.zip
SHA256_ORIGINAL=c00aa54b2ef2cb613067b50da58ef53b55e73b8074d078c5814d9558da07daf6
SIZE_BYTES_ORIGINAL=32203566
ZIP_ENTRIES_ORIGINAL=742
PACOTE_ORIGINAL_EMBUTIDO_NO_PR=NAO
MOTIVO=limite de transporte binário do conector GitHub atual
REGISTRO_NO_PR=nome + tamanho + SHA256 + receipt + escopo + limites
ZIP_EXATO_INTERROMPIDO_NO_PR=SIM
ZIP_APRENDIZADO_COMPLETO_NO_PR=SIM
BYTE_IDENTICAL_AO_PACOTE_ORIGINAL=NAO_DECLARADO
```

## 2. Provas executáveis

```text
NODE_CHECK=24/24
TESTS_TOTAL=31
PASS=31
FAIL=0
SKIPPED=0
CANCELLED=0
TODO=0
CONTRAPROVAS=5/5
CODE_SEAL=PASS
TRACKED_FILES=37
SECRET_FILE_READ_SCAN=PASS
FUNCTIONS_DOCUMENTED=48/48
DESCRICAO_LEIGA_E_PROFISSIONAL=PASS
LIVE_API_CALLED=FALSE
PRODUCTION_READY_CLAIMED=FALSE
```

A revalidação atual confirmou `24/24` arquivos Node válidos, `31/31` testes aprovados, zero falhas e code seal íntegro.

### Limite de transporte do registro

O ZIP original de 32.203.566 bytes permanece identificado pelo SHA-256 `c00aa54...daf6` e disponível na entrega da conversa. O conector usado para gravar este PR não aceita referência direta a arquivo local de 32 MB. Para não mentir dizendo que o original foi embutido, o PR registra seu nome, tamanho, SHA-256, total de entradas e receipt, mas não declara o blob de 32 MB como presente. O ZIP exato do artefato interrompido de 46.740 bytes será materializado fisicamente no PR. O workflow temporário também gera `ARTEFATO-APRENDIZADO-COMPLETO-CENTRALDARK-20260806.zip` com Markdown, Mermaid, Canvas, YAML, JSON, validações, contraprovas, receipts e o GATILHO exato.

## 3. Contraprovas fechadas

| ID | Falha simulada | Resultado seguro esperado |
|---|---|---|
| CP-001 | suíte com zero testes | falha explícita, nunca verde |
| CP-002 | arquivo Node inválido aninhado | syntax gate encontra e bloqueia |
| CP-003 | TAP com teste pulado/falsificado | skipped impede aprovação |
| CP-004 | código tentando ler `.env` | secret-file gate bloqueia |
| CP-005 | código executável não rastreado | code seal bloqueia |

Essas contraprovas demonstram que ausência de erro superficial não basta. O verificador precisa provar cobertura, integridade e semântica mínima.

## 4. Aprendizado central

### Regra A — interface não é cadeia de custódia

Uma resposta ocultada, bloqueada ou interrompida não prova que o artefato deixou de existir. O sistema deve procurar nas superfícies persistentes antes de declarar perda.

### Regra B — pacote parecido não substitui pacote exato

Nome semelhante, narrativa compatível ou resultado posterior não demonstram identidade. A identidade exige, no mínimo:

```text
NOME_ESPERADO + SIZE_BYTES + SHA256 + CONTEUDO_REVALIDADO
```

### Regra C — “tudo” precisa de escopo declarado

“Pacote da sessão inteira” significa todos os arquivos acessíveis e preservados na conversa, Library e workspace considerados. Não inclui raciocínio interno oculto, mensagens privadas de sistema ou dados que nunca foram materializados como arquivo.

### Regra D — nenhum mini artefato como fechamento

Para missões de evidência completa, a entrega mínima é composta por:

- ZIP exato do artefato principal;
- registro verificável do pacote original da sessão acessível;
- ZIP completo de aprendizado contendo documentos, receipts e o artefato interrompido exato;
- SHA-256 e tamanho de cada pacote;
- manifesto legível por máquina;
- validação reproduzível;
- contraprovas;
- Markdown completo;
- Mermaid;
- YAML;
- JSON;
- Canvas HTML autônomo;
- instruções de aplicação e rollback;
- estado explícito: candidato, canônico ou bloqueado.

### Regra E — PR não é permanência

Um PR aberto registra um candidato auditável. O aprendizado somente passa a integrar a fonte canônica depois de revisão e merge autorizado.

## 5. Aplicação prática na segurança da CentralDark

1. **Artifact Recovery Index:** toda missão longa deve publicar nome, hash, tamanho e local persistente do artefato assim que ele for criado.
2. **Checkpoint antes da resposta:** arquivos finais são persistidos antes da mensagem de fechamento.
3. **Typed State:** usar `UNKNOWN`, `LOCATED`, `HASHED`, `REVALIDATED`, `PACKAGED`, `PR_CANDIDATE`, `CANONICAL` e `BLOCKED`.
4. **Fail-closed:** zero testes, skipped, arquivo novo, hash divergente, leitura sensível ou path perigoso bloqueiam promoção.
5. **Evidence bundle completo:** não substituir ZIP por resumo textual nem Canvas por descrição.
6. **Single Writer:** suporte de outra IA não transfere autoria ou controle do código.
7. **No production side effects:** registrar evidência não autoriza merge, deploy, restart, banco, DNS ou alteração da VPS.
8. **Receipts determinísticos:** cada pacote precisa de SHA-256, CRC, quantidade de entradas e verificação de paths/symlinks.
9. **Synthetic fixture classification:** padrões parecidos com tokens usados em contraprovas devem ser classificados como fixtures, sem publicar valores completos.
10. **Human gate:** promoção canônica continua sendo decisão humana.

## 6. Limites honestos

- A validação foi local e determinística; nenhuma API live foi chamada.
- O pacote agregado contém fixtures adversariais que simulam tokens e leitura de `.env`; elas são parte dos testes, não credenciais reais identificadas.
- A varredura de padrões reduz risco, mas não equivale a prova matemática de ausência de todo segredo possível.
- O repositório é privado, porém isso não elimina a obrigação de revisão antes do merge.
- Este PR não executa deploy, restart, produção, banco ou mudança de infraestrutura.

## 7. Estrutura registrada

```text
docs/APRENDIZADOS/SESSAO-COMPLETA-2026-08-06/
├── README.md
├── MERMAID-COMPLETO.md
├── CONTRATO-OPERACIONAL.yaml
├── RECEIPT-EVIDENCIAS.json
├── SECURITY-APPLICABILITY.md
├── CANVAS-APRENDIZADO.html
└── SHA256SUMS.txt

evidence/session-completa-20260806/
├── GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.zip
├── GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.sha256
├── GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO-validation.json
├── GATILHO-UNIVERSAL-IA-contraprovas.json
├── REVALIDACAO-LOCAL-ATUAL.json
├── ARTEFATO-APRENDIZADO-COMPLETO-CENTRALDARK-20260806.zip
├── PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806.sha256.txt
├── SECURITY-SCAN.json
└── README.md

scripts/evidence/
└── verify-session-20260806.mjs
```

## 8. Resultado

```text
ARTEFATO_INTERROMPIDO_RECUPERADO=SIM
IDENTIDADE_SHA256=PASS
REVALIDACAO_LOCAL=PASS
PACOTE_SESSAO_ORIGINAL=REGISTRADO_POR_HASH_NAO_EMBUTIDO
ZIP_NO_PR=SIM
MERMAID=INCLUIDO
CANVAS_HTML=INCLUIDO
YAML=INCLUIDO
JSON=INCLUIDO
APRENDIZADO_APLICAVEL=DOCUMENTADO
MERGE=NAO
DEPLOY=NAO
RESTART=NAO
PRODUCAO_ALTERADA=NAO
CANONICO=NAO_ATE_MERGE
```
