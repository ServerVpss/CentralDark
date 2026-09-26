# COMANDO DE CONTINUIDADE — GATE FINAL HERMES FASE 1 COM REVISÃO EXTERNA

## 0. CONTEXTO REAL

A primeira construção experimental do Hermes já foi executada.

Foi declarado anteriormente:

- runtime local integrado;
- estrutura `motor/01` até `motor/10` preenchida;
- memória SQLite;
- correção e esquecimento;
- bloqueio de ações destrutivas;
- 15 testes aprovados;
- backup criado;
- Técnica da Lupa consolidada;
- funcionamento offline.

Porém, uma revisão externa independente classificou o resultado como:

```text
VEREDITO ATUAL: CONDICIONADO
RISCO CORRETO: R2
```

Motivos principais:

1. a prova apresentada estava resumida demais;
2. os nomes e saídas completas dos testes não foram registrados;
3. a correção por substring pode alterar várias memórias;
4. persistência, esquecimento, portabilidade e bloqueio de rede precisam de provas mais fortes;
5. o relatório de revisão deve ser suficiente para auditoria sem copiar terminal manualmente.

Esta missão NÃO deve reconstruir tudo.

Aplique correção mínima na estrutura existente.

---

# 1. ARQUIVO CANÔNICO ÚNICO DE REVISÃO

Use e atualize SOMENTE este arquivo:

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md
```

Esse arquivo é o documento oficial de comunicação entre:

```text
Grok executor
→ Pivete
→ revisor externo
→ Grok executor
```

## Regras

- Não criar outro relatório.
- Não criar pasta “para revisão”.
- Não criar:
  - `REVISAO-FINAL.md`;
  - `REVISAO-FINAL-2.md`;
  - `RELATORIO-EXTERNO.md`;
  - `RESULTADO-CORRIGIDO.md`;
  - `GATE-FINAL.md`;
  - `APROVACAO-DEFINITIVA.md`.
- Não responder apenas no terminal.
- Toda evidência necessária deve ficar registrada no arquivo canônico.
- A resposta no terminal pode ser curta e apenas informar o caminho do arquivo atualizado.
- O arquivo deve ser atualizado no mesmo lugar a cada rodada.
- Não apagar o histórico resumido das rodadas anteriores.
- Não duplicar o conteúdo inteiro de rodadas antigas.

---

# 2. ESTRUTURA OBRIGATÓRIA DO ARQUIVO CANÔNICO

O arquivo `REVISAO-TECNICA-DA-LUPA.md` deve possuir exatamente estas seções principais:

```markdown
# REVISÃO TÉCNICA DA LUPA — HERMES

## 1. IDENTIFICAÇÃO
## 2. ESTADO ATUAL
## 3. HISTÓRICO RESUMIDO DAS RODADAS
## 4. ESCOPO DESTA RODADA
## 5. ARQUIVOS ALTERADOS
## 6. DIFF FUNCIONAL RESUMIDO
## 7. COMANDOS EXECUTADOS
## 8. SAÍDAS COMPLETAS RELEVANTES
## 9. CENÁRIOS E RESULTADOS
## 10. FALHAS ENCONTRADAS
## 11. CORREÇÕES MÍNIMAS APLICADAS
## 12. REGRESSÃO
## 13. PORTABILIDADE
## 14. SEGURANÇA E VARREDURA SENSÍVEL
## 15. BACKUP E ROLLBACK
## 16. MANIFESTO E INTEGRIDADE
## 17. LIMITAÇÕES
## 18. LUPA: ZOOM OUT
## 19. LUPA: ZOOM IN
## 20. FEYNMAN
## 21. VEREDITO
## 22. PENDÊNCIA REAL
## 23. PRÓXIMO PASSO ÚNICO
## 24. SOLICITAÇÃO AO REVISOR EXTERNO
```

## Histórico resumido

Usar uma tabela curta:

```markdown
| Rodada | Data/hora | Alteração principal | Testes | Veredito |
|---|---|---|---|---|
| 1 | ... | Integração inicial | 15/15 | Condicionado |
| 2 | ... | Correção de seleção exata e provas | ... | ... |
```

Não copiar relatórios anteriores inteiros.

---

# 3. DADOS QUE DEVEM APARECER NO TOPO

Registrar:

```text
FONTE DA VERDADE:
E:\CentralDark\Pivete\NUCLEO

RISCO:
R2

VERSÃO:
valor atual de VERSION.txt

DATA/HORA DA RODADA:
data e hora locais

ARQUIVO CANÔNICO:
motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md

MANIFESTO:
caminho + SHA-256 atual

BACKUP BASE:
E:\CentralDark\backups\
NUCLEO-ANTES-HERMES-FASE1-2026-07-17-232543.zip

HASH DO BACKUP:
C0E6AEB0BA5EB5FE6226ECC8D15124C4542F4D4BA80D4BF9FCB248F26CF8E405
```

Confirme os valores no disco antes de registrar.

Não copie valores apenas deste comando se o disco mostrar algo diferente.

---

# 4. REGRA DE EVIDÊNCIA

O arquivo canônico deve separar:

```text
EVIDÊNCIA:
observação direta e reproduzível.

INFERÊNCIA:
conclusão lógica ainda sujeita a confirmação.

SUPOSIÇÃO:
algo ainda não comprovado.

COMO CONFIRMAR:
comando ou cenário necessário.
```

Não apresentar inferência como fato.

Não usar apenas:

- “funcionou”;
- “15 testes OK”;
- screenshot;
- processo aberto;
- ausência de erro;
- resumo sem nome dos testes.

---

# 5. CORREÇÃO OBRIGATÓRIA — SELEÇÃO EXATA DE MEMÓRIA

A falha já identificada é:

```text
Correção por substring pode marcar vários IDs.
```

Isso não pode permanecer na Fase 1.

## Regra correta

Uma memória somente pode ser corrigida ou esquecida por:

1. `id` exato; ou
2. chave lógica normalizada e exata.

Busca parcial pode somente:

```text
encontrar candidatos
→ apresentar candidatos
→ resolver um ID exato
→ alterar um único registro
```

É proibido usar busca parcial para executar atualização diretamente.

Não usar para alteração:

```sql
LIKE '%texto%'
```

Não usar `contains` amplo para decidir qual registro será corrigido.

Se mais de um candidato existir:

- não alterar;
- pedir desambiguação;
- mostrar somente identificadores e descrições seguras;
- aguardar seleção exata.

---

# 6. TESTE DE COLISÃO OBRIGATÓRIO

Criar memórias sintéticas:

```text
chave: cor
valor: azul_123

chave: cor_do_carro
valor: preto_456

chave: cor_do_quarto
valor: branco_789
```

Corrigir somente:

```text
chave: cor
novo valor: verde_999
```

Resultado obrigatório:

```text
cor = verde_999
cor_do_carro = preto_456
cor_do_quarto = branco_789
```

Também provar:

- somente um registro anterior foi marcado como corrigido;
- nenhuma atualização múltipla ocorreu;
- nenhuma memória vizinha foi alterada;
- o teste continua válido após reiniciar o processo.

Criar teste automatizado permanente com nome claro, por exemplo:

```text
test_correcao_por_chave_exata_nao_colide
```

Registrar no arquivo canônico:

- nome do teste;
- estado inicial;
- ação;
- resultado;
- consulta final;
- veredito.

---

# 7. ESQUECIMENTO REAL

Validar como o esquecimento funciona no SQLite.

Resultado obrigatório:

- memória esquecida não aparece em consulta comum;
- não participa da síntese;
- não volta após reinício;
- não pode ser corrigida como memória ativa;
- o conteúdo não permanece em texto claro apenas para auditoria.

Para auditoria, manter somente o mínimo necessário:

```text
id
status = esquecida
data
hash ou tombstone, se necessário
```

O conteúdo pessoal original deve ser removido ou tornado irrecuperável
pela consulta comum e pelo runtime.

Adicionar teste automatizado permanente, por exemplo:

```text
test_esquecimento_persiste_entre_processos
```

No arquivo canônico, explicar:

- se ocorre exclusão física;
- se ocorre tombstone;
- quais campos permanecem;
- por que a solução foi escolhida;
- limitação residual.

---

# 8. PERSISTÊNCIA ENTRE PROCESSOS

Não testar apenas dentro da mesma instância Python.

Executar:

## Processo A

- abrir runtime;
- salvar memória sintética;
- fechar completamente;
- confirmar código de saída.

## Processo B

- iniciar nova instância;
- abrir nova conexão;
- consultar a memória;
- validar conteúdo;
- validar origem;
- validar confiança;
- fechar completamente.

Usar `subprocess` ou comandos independentes.

Criar teste automatizado permanente, por exemplo:

```text
test_memoria_persiste_em_novo_processo
```

Registrar os dois comandos e as saídas no arquivo canônico.

---

# 9. SQLITE — TRANSAÇÃO E FECHAMENTO

Toda conexão SQLite deve seguir:

```text
abrir
→ iniciar operação
→ executar
→ commit ou rollback
→ fechar explicitamente no finally
```

Não aceitar:

- commit implícito;
- conexão abandonada;
- banco bloqueado;
- transação perdida;
- `ResourceWarning`;
- teste que funciona apenas porque o processo ainda está aberto.

Executar testes com warnings tratados como erro.

---

# 10. COMANDOS DE PROVA

Executar a partir de:

```text
E:\CentralDark\Pivete\NUCLEO\motor\05-hermes\runtime
```

## Compilação

```powershell
python -W error -m compileall hermes
```

## Testes

```powershell
python -W error -m unittest discover `
  -s E:\CentralDark\Pivete\NUCLEO\motor\06-ferramentas\testes `
  -p "test*.py" `
  -v
```

Se o terminal não aceitar quebra de linha, executar em uma linha:

```powershell
python -W error -m unittest discover -s E:\CentralDark\Pivete\NUCLEO\motor\06-ferramentas\testes -p "test*.py" -v
```

## Status

```powershell
python -m hermes.main --status
```

Registrar no arquivo canônico:

- comando exato;
- diretório atual;
- código de saída;
- saída completa relevante;
- horário;
- PASS ou FAIL.

Não registrar apenas o total.

Registrar os nomes de todos os testes.

---

# 11. PORTABILIDADE REAL

Criar uma cópia temporária da estrutura integrada fora do caminho oficial.

Exemplo:

```text
%TEMP%\hermes-portabilidade-fase1\
```

Não alterar o NÚCLEO oficial durante esse teste.

Na cópia temporária, executar:

- compileall;
- unittest;
- `python -m hermes.main --status`;
- persistência entre processos;
- correção exata;
- esquecimento;
- bloqueio de perigo.

Confirmar que não existe dependência de:

```text
E:\CentralDark\Pivete\NUCLEO
```

Registrar no arquivo canônico:

- caminho temporário usado;
- comandos;
- resultados;
- código de saída;
- arquivos criados;
- limpeza realizada ou pendente.

---

# 12. BUSCA DE CAMINHOS ABSOLUTOS

Executar busca somente leitura por:

```text
E:\CentralDark\Pivete\NUCLEO
E:\\CentralDark\\Pivete\\NUCLEO
C:\
%TEMP%
```

Classificar cada ocorrência:

```text
DOCUMENTAÇÃO:
permitida quando descreve a casa oficial.

CÓDIGO OPERACIONAL:
não pode depender de caminho absoluto.

TESTE:
pode usar diretório temporário calculado dinamicamente.

LOG:
não deve fixar caminho temporário como configuração.
```

No arquivo canônico, registrar somente:

- caminho;
- linha;
- classificação;
- ação tomada.

Não copiar conteúdo sensível.

---

# 13. BLOQUEIO DE REDE

Adicionar teste que impeça conexão externa durante a Fase 1.

Uma estratégia válida:

- substituir temporariamente `socket.socket.connect`;
- lançar erro se qualquer conexão for tentada;
- executar os fluxos essenciais;
- confirmar zero tentativas.

Testar:

- status;
- salvar;
- consultar;
- corrigir;
- esquecer;
- bloquear pedido destrutivo.

Criar teste permanente, por exemplo:

```text
test_fase1_nao_tenta_acessar_rede
```

Registrar no arquivo canônico:

- mecanismo do bloqueio;
- quantidade de tentativas observadas;
- resultado;
- limitações.

---

# 14. VARREDURA DE MATERIAL SENSÍVEL

Fazer varredura local sem imprimir valores.

Procurar padrões:

```text
api_key
apikey
authorization
bearer
token
secret
password
passwd
xai-
sk-
BEGIN PRIVATE KEY
PRIVATE KEY
```

A saída registrada deve mostrar somente:

```text
tipo do padrão
caminho
número da linha
classificação
```

Nunca registrar o valor encontrado.

Ambiente de teste não elimina a necessidade de proteger credenciais.

Se encontrar segredo real:

- não apagar automaticamente;
- não copiar;
- não mover;
- não mostrar;
- registrar somente a existência;
- marcar pendência para rotação pelo Pivete.

---

# 15. BACKUP E ROLLBACK

Validar o backup existente sem restaurar sobre o NÚCLEO atual.

Backup declarado:

```text
E:\CentralDark\backups\
NUCLEO-ANTES-HERMES-FASE1-2026-07-17-232543.zip
```

Hash declarado:

```text
C0E6AEB0BA5EB5FE6226ECC8D15124C4542F4D4BA80D4BF9FCB248F26CF8E405
```

Em diretório temporário:

1. verificar o hash;
2. extrair;
3. listar entradas;
4. confirmar legibilidade;
5. confirmar os 15 itens declarados ou registrar a contagem real;
6. comparar hashes de arquivos relevantes;
7. não sobrescrever a estrutura atual;
8. remover somente a extração temporária após a prova, se seguro.

Registrar no arquivo canônico:

- caminho;
- hash calculado;
- quantidade de entradas;
- resultado da extração;
- procedimento exato de reversão;
- limitações.

---

# 16. MANIFESTO E INTEGRIDADE

Atualizar no mesmo local:

```text
motor\10-observabilidade\MANIFESTO-SHA256.txt
```

O manifesto deve representar a estrutura atual integrada.

Não incluir como base imutável:

- logs mutáveis;
- `hermes.db`;
- `__pycache__`;
- `.pyc`;
- temporários;
- arquivos de portabilidade;
- extrações de backup;
- caches.

No arquivo canônico, registrar:

```text
caminho do manifesto
SHA-256 do manifesto
quantidade de arquivos listados
exclusões aplicadas
data/hora
```

---

# 17. AUTOLUPA ADVERSARIAL

Depois que os testes passarem, atuar como crítico.

Tentar reprovar o próprio trabalho.

Procurar:

- falso verde;
- atualização múltipla de memória;
- duas memórias ativas para a mesma chave;
- esquecimento que apenas esconde sem tratar conteúdo;
- memória esquecida voltando após reinício;
- conexão SQLite não fechada;
- caminho absoluto;
- tentativa de rede;
- segredo;
- log com conteúdo íntimo;
- documento contraditório;
- teste dependente de ordem;
- teste usando banco real;
- teste que altera memória pessoal;
- arquivo duplicado;
- manifesto antigo;
- cache incluído;
- relatório paralelo;
- afirmação de consciência;
- ação fora do escopo.

Se encontrar falha:

```text
BLOQUEAR
→ registrar evidência
→ aplicar correção mínima
→ repetir testes afetados
→ repetir Autolupa
→ atualizar o mesmo arquivo canônico
```

Não criar nova arquitetura.

---

# 18. SAÍDAS COMPLETAS NO ARQUIVO

A seção `SAÍDAS COMPLETAS RELEVANTES` deve incluir blocos como:

```markdown
### Comando: compileall

Diretório:
`...`

Código de saída:
`0`

Saída:

```text
[saída completa]
```
```

Fazer o mesmo para:

- unittest;
- status;
- teste de colisão;
- teste entre processos;
- teste de esquecimento;
- portabilidade;
- bloqueio de rede;
- busca de caminhos;
- varredura sensível sanitizada;
- backup;
- manifesto.

Pode remover ruído repetitivo, mas não remover:

- nome de teste;
- erro;
- warning;
- traceback;
- código de saída;
- resultado relevante.

Se uma saída for grande demais:

1. salvar o bruto em `motor\10-observabilidade\logs`;
2. calcular SHA-256;
3. registrar no arquivo canônico:
   - caminho;
   - hash;
   - tamanho;
   - trecho relevante;
4. não criar outro relatório Markdown.

---

# 19. PEDIDO AO REVISOR EXTERNO

Ao final, preencher a seção:

```markdown
## 24. SOLICITAÇÃO AO REVISOR EXTERNO

Arquivo para revisão:
`motor/10-observabilidade/REVISAO-TECNICA-DA-LUPA.md`

Rodada:
[número]

Veredito do executor:
[veredito]

Pontos que exigem revisão:
1. ...
2. ...
3. ...

Arquivos que podem ser solicitados pelo revisor:
- [somente os estritamente necessários]

Pergunta objetiva:
“A evidência registrada é suficiente para aprovar a Fase 1?”
```

O Pivete enviará esse único `.md` ao revisor externo.

Se o revisor precisar de código ou log adicional, ele pedirá arquivos
específicos na rodada seguinte.

---

# 20. VEREDITO PERMITIDO

Somente usar:

```text
APROVADO COMO EXPERIMENTO FASE 1
```

se todos os gates passarem.

Caso contrário:

```text
CONDICIONADO
CORRIGIR
BLOQUEADO
```

Risco:

```text
R2
```

Não reduzir para R1.

Não usar:

- consciente;
- infalível;
- Jarvis concluído;
- cópia do Pivete;
- aprendizado autônomo completo.

Formulação correta:

```text
Aprovado experimentalmente dentro dos cenários, evidências e
limitações conhecidas nesta fase.
```

---

# 21. RESPOSTA CURTA NO TERMINAL

Depois de atualizar o arquivo canônico, responder no terminal somente:

```text
RODADA CONCLUÍDA

Arquivo canônico atualizado:
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md

Veredito:
[APROVADO COMO EXPERIMENTO FASE 1 | CONDICIONADO | CORRIGIR | BLOQUEADO]

Testes:
[quantidade aprovada]/[total]

Pendência:
[uma frase]

Envie o arquivo REVISAO-TECNICA-DA-LUPA.md ao revisor externo.
```

Não despejar o relatório inteiro no terminal.

---

# 22. ORDEM DE EXECUÇÃO

Executar agora:

1. ler o arquivo canônico atual;
2. preservar o histórico resumido;
3. classificar risco como R2;
4. corrigir seleção exata de memória;
5. adicionar testes permanentes;
6. executar compileall;
7. executar unittest com nomes;
8. provar persistência entre processos;
9. provar correção sem colisão;
10. provar esquecimento;
11. provar bloqueio de rede;
12. provar portabilidade;
13. buscar caminhos absolutos;
14. varrer material sensível sem mostrar valores;
15. validar backup em diretório temporário;
16. atualizar manifesto;
17. executar Autolupa;
18. corrigir falhas mínimas;
19. repetir testes afetados;
20. atualizar o mesmo `REVISAO-TECNICA-DA-LUPA.md`;
21. responder apenas com o caminho e o veredito.

Não pedir keys.
Não acessar VPS.
Não acessar GitHub.
Não executar Docker.
Não criar relatório paralelo.
Não criar nova estrutura.
Não apagar arquivos pessoais.
Não ocultar teste falho.
