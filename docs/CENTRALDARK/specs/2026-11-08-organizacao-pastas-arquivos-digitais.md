# Plano — Organização de pastas e arquivos digitais

**Status:** PROPOSTA PARA REVISÃO DO CHEFE  
**Fonte de boas práticas:** `Boas-praticas-para-pastas-e-arquivos-digitais.pdf`  
**Owner:** `.agents/skills/centraldark-operational-method/`  
**Escopo:** organização documental do repositório, sem reestruturar código por aparência.

## Intenção

Aplicar boas práticas de gestão de pastas e arquivos à CentralDark sem apagar histórico, quebrar owners, mover runtime sem prova ou criar uma biblioteca paralela.

## Critério de sucesso

A organização será considerada concluída somente quando:

- cada área tiver um owner claro;
- nomes operacionais forem legíveis e pesquisáveis;
- arquivos históricos, ativos, fixtures, builds e segredos forem classificados sem mistura;
- caminhos críticos permanecerem válidos;
- referências e imports forem atualizados quando uma movimentação for aprovada;
- testes, lint, links e consumidores passarem;
- a contraprova confirmar que nada fora do escopo mudou;
- a main e o runtime tiverem readback do mesmo SHA, quando aplicável.

`UNKNOWN != PASS`.

## Regras preservadas

- Não apagar arquivos, worktrees, histórico, receipts ou backups.
- Não fazer limpeza destrutiva automática.
- Não mover `docs_historicos`, `_archive`, fixtures, vendor, `node_modules`, lockfiles ou caminhos externos legítimos sem análise própria.
- Não criar V2, V3, segundo HUD, segundo owner ou segunda biblioteca operacional.
- Um escritor por escopo.
- GitHub `main` continua sendo a fonte da verdade.
- Mudança de nome ou caminho exige busca de consumidores e contraprova.
- A pasta `Inativos` será tratada como quarentena reversível, nunca como lixeira.

## Microetapas

### 1. Inventário somente leitura

- Medir `main`, branch, SHA, worktree e submódulos.
- Listar diretórios e arquivos rastreados.
- Classificar cada área como `OPERACIONAL`, `DOCUMENTAÇÃO`, `HISTÓRICO`, `FIXTURE`, `DEPENDÊNCIA`, `BUILD`, `SEGREDO` ou `EXTERNO`.
- Registrar arquivos órfãos, duplicados aparentes e caminhos longos.

**Kimetsu:** Respiração 1 — Concentração Total.  
**Michelin:** ⭐ Construir — preflight.

### 2. Mapa de owners

- Relacionar cada área ao owner existente.
- Identificar o consumidor real de cada pasta.
- Separar fonte, build, runtime e projeção HUD.
- Não tratar catálogo ou documentação como prova de consumo runtime.

**Kimetsu:** Respiração 2 — Sol.  
**Michelin:** ⭐ Construir.

### 3. Taxonomia mínima

Propor uma taxonomia baseada no que já existe:

```text
.agents/       governança, skills e contratos de agente
docs/          documentação, decisões, receipts e specs
apps/          aplicações e superfícies executáveis
scripts/       automações e probes
infra/         infraestrutura e deploy
config/        configurações não secretas
tests/         testes e contraprovas
_archive/      histórico preservado
```

Não criar essas pastas se elas já existirem. A etapa apenas consolida o mapa e aponta desvios.

**Kimetsu:** Respiração 8 — Pedra.  
**Michelin:** ⭐ Construir.

### 4. Padrão de nomes

Aplicar somente a novos nomes ou a renomes autorizados:

- palavras legíveis;
- hífen como separador preferencial;
- sem caracteres especiais desnecessários;
- sem acentos em caminhos operacionais novos;
- sem abreviações ambíguas;
- data no formato `YYYY-MM-DD` quando a data fizer parte da identidade;
- versão no formato `vYYYY-MM-DD` quando a versão fizer parte do conteúdo;
- nomes curtos para evitar caminhos excessivos.

Não renomear em massa. Cada renome exige busca de referências.

**Kimetsu:** Respiração 9 — Flor.  
**Michelin:** ⭐ Construir.

### 5. Duplicatas e arquivos órfãos

- Detectar duplicatas por caminho, tamanho e hash quando seguro.
- Tratar duplicata como candidata, não como autorização de exclusão.
- Identificar pastas com um único arquivo.
- Propor consolidação somente quando o owner e o significado forem iguais.
- Preservar cópias históricas até existir decisão explícita.

**Kimetsu:** Respiração 3 — Lua, para contraprova.  
**Michelin:** ⭐⭐ Integrar.

### 6. Arquivos ativos, inativos e históricos

- Separar estado atual de histórico sem apagar o histórico.
- Propor `Inativos/` apenas para itens realmente fora de uso e reversíveis.
- Registrar origem, destino, motivo e possibilidade de retorno.
- Nunca mover secrets, credenciais ou dados de produção por esta rotina.

**Kimetsu:** Respiração 10 — Inseto, para mudança mínima.  
**Michelin:** ⭐⭐ Integrar.

### 7. Referências e consumidores

Para cada mudança aprovada:

- buscar imports, links, scripts, workflows, manifests e documentação;
- atualizar somente consumidores afetados;
- verificar caminhos relativos e absolutos;
- testar a partir de diretórios diferentes;
- confirmar que a raiz do repositório continua dinâmica quando aplicável.

**Kimetsu:** Respiração 4 — Água, para adaptação.  
**Michelin:** ⭐⭐ Integrar.

### 8. Compatibilidade de formatos

- Catalogar formatos antigos e atuais.
- Não converter automaticamente arquivos binários ou históricos.
- Converter somente cópias ou arquivos autorizados.
- Reabrir e validar o resultado quando houver conversão.
- Registrar formatos que exigem ferramenta externa.

**Kimetsu:** Respiração 14 — Névoa, para ambiguidades.  
**Michelin:** ⭐⭐ Integrar.

### 9. Limpeza periódica não destrutiva

Criar uma rotina de diagnóstico que informe:

- arquivos antigos;
- caminhos longos;
- nomes fora do padrão;
- possíveis duplicatas;
- formatos obsoletos;
- referências quebradas;
- pastas órfãs.

A rotina deve reportar candidatos. Ela não deve apagar nem mover automaticamente.

**Kimetsu:** Respiração 13 — Som, para sinais e telemetria.  
**Michelin:** ⭐⭐ Integrar.

### 10. Testes e contraprovas

Executar, conforme o escopo:

- verificação Git;
- links e referências;
- sintaxe;
- testes existentes;
- build proporcional;
- probe de caminhos a partir de CWD diferente;
- leitura do arquivo movido ou renomeado;
- comparação de hash dos arquivos fora do escopo.

**Kimetsu:** Respiração 16 — Regeneração Monotônica.  
**Michelin:** ⭐⭐⭐ Provar.

### 11. Receipt e HUD

Registrar no owner existente:

```text
INTENCAO=
OWNER=
SHA=
ARQUIVOS_MEDIDOS=
ARQUIVOS_ALTERADOS=
NAO_TOCADO=
TESTES=
CONTRAPROVA=
RESULTADO=PASS|PARTIAL|FAIL|BLOCKED|UNKNOWN
PENDENCIA=
NEXT_CURSOR=
```

O HUD deve projetar o resultado. O HUD não é a autoridade da prova.

**Kimetsu:** Respiração 12 — Amor, para integração.  
**Michelin:** ⭐⭐⭐ Provar.

### 12. Fixed Point do escopo

Concluir somente quando:

- o mapa foi medido;
- os renomes ou movimentos aprovados foram aplicados;
- consumidores foram atualizados;
- testes passaram;
- contraprova passou;
- o estado foi lido novamente;
- nenhuma pendência material permanece no escopo.

Se houver bloqueio, registrar `BLOCKED` com causa e `NEXT_CURSOR`.

**Kimetsu:** Respiração 17 — Continuar até Fixed Point.  
**Michelin:** ⭐⭐⭐ Provar.

## Melhorias esperadas

- recuperação mais rápida de arquivos;
- menor ambiguidade de nomes;
- menos duplicação aparente;
- menor risco de quebrar imports por renome;
- separação clara entre fonte, histórico, build e runtime;
- limpeza reversível;
- receipts mais fáceis de auditar;
- HUD mais fiel ao estado atual;
- organização resistente a troca de máquina, usuário ou diretório.

## Limites

Este plano não autoriza, por si só:

- exclusão;
- force push;
- alteração de secrets;
- migração de produção;
- mudança de owner;
- troca de portas;
- reestruturação ampla do código;
- conversão em massa de documentos.

## Próximo cursor

```text
PROPOSTA → REVISÃO DO CHEFE → INVENTÁRIO READ-ONLY → MAPA DE OWNERS →
TAXONOMIA → PADRÃO DE NOMES → CANDIDATOS REVERSÍVEIS → TESTES →
CONTRAPROVA → RECEIPT → HUD → FIXED_POINT
```
