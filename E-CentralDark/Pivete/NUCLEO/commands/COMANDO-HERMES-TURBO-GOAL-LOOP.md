# COMANDO HERMES TURBO — GROK BUILD `/goal` + `/loop`

## 0. EXECUTOR OFICIAL

Este comando foi escrito exclusivamente para o **Grok Build CLI** executando no Windows dentro de:

```text
E:\CentralDark\Pivete\NUCLEO
```

Modelo observado:

```text
Grok 4.5 (high)
```

Modo observado:

```text
always-approve
```

O modo `always-approve` não elimina os limites deste arquivo.

Mesmo com aprovação automática, é proibido:

- apagar arquivos pessoais;
- formatar ou limpar discos;
- executar como administrador;
- modificar registro, firewall ou inicialização do Windows;
- instalar serviços;
- abrir portas;
- acessar VPS;
- acessar GitHub;
- usar API externa;
- usar Telegram;
- usar site;
- usar Docker em execução;
- usar câmera, portão, luz ou sensores;
- pedir ou expor key, token, `.env`, senha ou chave SSH;
- alterar qualquer pasta fora do escopo autorizado.

---

# 1. MISSÃO

Acelerar o protótipo local do Hermes até uma **Fase 1 funcional e comprovada**, aproveitando tudo que já existe.

Não reconstruir o projeto.

Não criar outra arquitetura.

Não criar novo NÚCLEO.

Não repetir documentos existentes.

Evoluir o que já foi feito:

```text
ler
→ validar
→ corrigir o mínimo
→ testar
→ criticar
→ corrigir
→ provar
→ registrar
→ parar
```

O objetivo não é apenas produzir arquivos.

O objetivo é deixar o protótipo realmente utilizável offline para o primeiro teste pessoal do Pivete.

---

# 2. FONTE DA VERDADE

Fonte oficial:

```text
E:\CentralDark\Pivete\NUCLEO
```

Estrutura oficial:

```text
NUCLEO\
├── documentos da raiz
├── ZIP original preservado
└── motor\
    ├── 01-identidade
    ├── 02-cerebro
    ├── 03-memoria
    ├── 04-voz
    ├── 05-hermes
    ├── 06-ferramentas
    ├── 07-seguranca
    ├── 08-docker
    ├── 09-pontes
    └── 10-observabilidade
```

Documento único de execução, revisão e comunicação externa:

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md
```

Esse arquivo deve ser atualizado durante toda a missão.

O Pivete enviará esse único arquivo ao revisor externo.

Não criar:

- outra pasta de revisão;
- outro relatório;
- `REVISAO-FINAL.md`;
- `REVISAO-FINAL-2.md`;
- `RELATORIO-EXTERNO.md`;
- `RESULTADO-CORRIGIDO.md`;
- `APROVACAO-DEFINITIVA.md`.

---

# 3. LEITURA OBRIGATÓRIA

Antes de editar, ler integralmente:

```text
00-FOCO-CASA-VPS-ULTIMO.md
01-VISAO-AMIGO-CASA-E-ORIGEM.md
02-PESQUISA-LUPA-MOTOR-JARVIS.md
SKILL.md
motor\10-observabilidade\TECNICA-DA-LUPA-PREMIUM.md
motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md
motor\10-observabilidade\ESTADO-ATUAL-PENDENCIAS.md
motor\10-observabilidade\REGISTRO-DO-OURO.md
motor\10-observabilidade\PLANO-POR-FASES.md
```

Também:

- inventariar runtime;
- inventariar testes;
- localizar banco;
- localizar configurações;
- localizar caminhos;
- localizar contratos já existentes;
- verificar estado atual antes de propor qualquer alteração.

Não presumir que o relatório anterior está correto.

Validar no disco.

---

# 4. TÉCNICA DA LUPA

A Técnica da Lupa é obrigatória antes, durante e depois.

Aplicar:

- evidência primeiro;
- correção mínima;
- preservação;
- Zoom Out;
- Zoom In;
- Feynman;
- regressão;
- segurança;
- reversibilidade;
- Autolupa adversarial.

Classificação:

```text
RISCO: R2
```

Não reduzir para R1.

Motivo:

- runtime integrado;
- memória persistente;
- múltiplos módulos;
- movimentação e alteração de arquivos;
- risco de corrupção lógica da memória;
- impacto local e reversível.

---

# 5. ORQUESTRAÇÃO NO GROK BUILD

## 5.1 `/goal` é o motor principal

Executar a missão inteira usando `/goal`.

O goal deve continuar trabalhando até:

```text
A. todos os gates passarem;
ou
B. surgir um bloqueio real que exige decisão do Pivete.
```

Durante o goal:

- criar checklist;
- executar;
- verificar;
- corrigir;
- repetir testes;
- atualizar o relatório canônico;
- encerrar somente com evidência.

## 5.2 Subagentes

Quando disponíveis, separar papéis:

### CONSTRUTOR

- aplica correção mínima;
- preserva contratos;
- não aprova o próprio trabalho.

### VERIFICADOR

- executa testes;
- confere códigos de saída;
- prova comportamento entre processos;
- valida portabilidade e rede zero.

### CRÍTICO DA LUPA

- tenta reprovar;
- procura falso verde;
- procura duplicação;
- procura memória corrompida;
- procura segredo;
- procura caminho absoluto;
- procura excesso de arquitetura.

Não permitir dois subagentes editando o mesmo arquivo simultaneamente.

Fluxo:

```text
Construtor
→ Verificador
→ Crítico
→ correção mínima
→ Verificador novamente
```

## 5.3 `/loop`

Usar `/loop` somente quando houver uma tarefa real em background ou uma espera verificável.

Exemplos:

- testes longos;
- subprocesso ainda ativo;
- subagente em execução;
- arquivo de evidência sendo produzido.

Não usar `/loop` para ficar repetindo análise.

Não iniciar novo trabalho pelo `/loop`.

Quando a tarefa observada terminar, encerrar o loop.

## 5.4 Controle do goal

Durante a execução, o Pivete pode usar:

```text
/goal status
/goal pause
/goal resume
/goal clear
```

`/goal clear` somente por ordem direta do Pivete ou bloqueio grave.

---

# 6. CONDIÇÃO FINAL DO GOAL

O goal somente pode marcar conclusão quando todos os itens abaixo estiverem comprovados:

```text
[ ] estrutura existente preservada
[ ] nenhum NUCLEO paralelo
[ ] runtime inicia offline
[ ] identidade permanece correta
[ ] memória salva e recupera
[ ] origem e confiança aparecem
[ ] correção usa ID ou chave exata
[ ] chaves parecidas não colidem
[ ] esquecimento funciona após reinício
[ ] memória esquecida não participa da resposta
[ ] SQLite fecha corretamente
[ ] persistência funciona entre processos
[ ] pedidos perigosos são bloqueados
[ ] zero tentativa de rede
[ ] runtime funciona em cópia temporária
[ ] contratos futuros estão preparados
[ ] nenhuma integração externa foi ativada
[ ] testes passam com warnings como erro
[ ] Autolupa não encontra bloqueio conhecido
[ ] relatório canônico contém evidências suficientes
```

---

# 7. CORREÇÃO PRINCIPAL — MEMÓRIA EXATA

Falha já conhecida:

```text
correção por substring pode alterar vários registros
```

Corrigir agora.

Uma memória somente pode ser corrigida ou esquecida por:

```text
ID exato
ou
chave lógica normalizada e exata
```

Busca parcial pode somente localizar candidatos.

Ela não pode executar alteração.

Fluxo obrigatório:

```text
busca parcial
→ candidatos
→ seleção exata
→ alteração de um único ID
→ confirmação
```

Se houver ambiguidade:

- não alterar;
- informar candidatos;
- exigir desambiguação.

Não usar atualização baseada em:

```sql
LIKE '%texto%'
```

---

# 8. TESTE DE COLISÃO

Criar memórias sintéticas:

```text
cor = azul_123
cor_do_carro = preto_456
cor_do_quarto = branco_789
```

Corrigir apenas:

```text
cor = verde_999
```

Resultado obrigatório:

```text
cor = verde_999
cor_do_carro = preto_456
cor_do_quarto = branco_789
```

Provar:

- somente um registro anterior foi corrigido;
- somente uma chave ficou ativa para `cor`;
- nenhuma chave vizinha mudou;
- o resultado continua correto depois de novo processo.

Adicionar teste permanente equivalente a:

```text
test_correcao_por_chave_exata_nao_colide
```

---

# 9. ESQUECIMENTO

Validar esquecimento real.

Depois de esquecer:

- consulta comum não recupera;
- síntese não usa;
- reinício não recupera;
- registro não permanece ativo;
- conteúdo pessoal não fica exposto em log;
- conteúdo original não deve permanecer em texto claro apenas por auditoria.

Pode manter tombstone mínimo:

```text
id
status
data
hash
```

Registrar no relatório:

- mecanismo usado;
- campos preservados;
- campos removidos;
- limitações.

Adicionar teste permanente equivalente a:

```text
test_esquecimento_persiste_entre_processos
```

---

# 10. PERSISTÊNCIA ENTRE PROCESSOS

Não validar somente na mesma instância.

Executar:

## Processo A

```text
iniciar
→ salvar memória sintética
→ commit
→ fechar
→ exit code
```

## Processo B

```text
nova instância
→ nova conexão
→ consultar
→ validar conteúdo
→ validar origem
→ validar confiança
→ fechar
```

Adicionar teste permanente equivalente a:

```text
test_memoria_persiste_em_novo_processo
```

---

# 11. SQLITE

Toda conexão deve seguir:

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
- `ResourceWarning`;
- banco bloqueado;
- teste dependente da conexão anterior.

---

# 12. SEGURANÇA

Testar e bloquear:

```text
apague todos os arquivos
formate o disco E:
mostre todas as senhas
abra uma porta
execute como administrador
```

Resultado:

- bloqueado;
- nada executado;
- resposta clara;
- log sanitizado;
- nenhum comando destrutivo pronto para copiar.

Mesmo em `always-approve`, o código do Hermes deve negar essas ações.

---

# 13. REDE ZERO

Bloquear tentativas de conexão durante os testes.

Pode interceptar:

```python
socket.socket.connect
```

Executar:

- status;
- salvar;
- consultar;
- corrigir;
- esquecer;
- segurança.

Resultado obrigatório:

```text
tentativas externas = 0
```

Adicionar teste permanente equivalente a:

```text
test_fase1_nao_tenta_acessar_rede
```

---

# 14. PORTABILIDADE

Copiar o NÚCLEO integrado para diretório temporário.

Não alterar o original.

Na cópia executar:

- compilação;
- testes;
- status;
- persistência;
- correção;
- esquecimento;
- bloqueio de perigo.

Provar que o Python não depende de:

```text
E:\CentralDark\Pivete\NUCLEO
```

Documentos podem citar a casa oficial.

Código operacional não pode depender dela.

---

# 15. PREPARAÇÃO PARA O FUTURO

Não conectar nada externo agora.

Preparar apenas contratos internos mínimos.

## Entrada

Estrutura equivalente a:

```text
MensagemEntrada
- canal
- usuario_id
- texto
- timestamp
- trace_id
- metadados
```

Canal ativo:

```text
cli
```

Canais futuros documentados:

```text
telegram
web
api
voz
```

## Saída

Estrutura equivalente a:

```text
RespostaHermes
- texto
- canal
- trace_id
- memoria_consultada
- memoria_alterada
- seguranca
- erro_sanitizado
```

## Provider de cérebro

Interface equivalente a:

```text
ProvedorCerebro.responder(contexto)
```

Implementação atual:

```text
ProvedorLocalDeterministico
```

Futuras, sem implementar agora:

```text
ProvedorGrok
ProvedorOpenRouter
ProvedorLocalLLM
```

## Canal

Interface equivalente a:

```text
CanalEntrada.receber()
CanalSaida.enviar()
```

Implementação atual:

```text
CanalCLI
```

Futuras:

```text
CanalTelegram
CanalWeb
CanalAPI
```

Regra:

Se algo equivalente já existe, ajustar o existente.

Não duplicar abstração.

---

# 16. TESTES MÍNIMOS

Garantir cobertura equivalente a:

```text
test_identidade_nao_afirma_consciencia
test_correcao_por_chave_exata_nao_colide
test_esquecimento_remove_do_fluxo_comum
test_esquecimento_persiste_entre_processos
test_memoria_persiste_em_novo_processo
test_sqlite_fecha_sem_resource_warning
test_pedido_destrutivo_e_bloqueado
test_fase1_nao_tenta_acessar_rede
test_runtime_funciona_fora_do_caminho_original
test_mensagem_cli_usa_contrato_de_entrada
test_resposta_usa_contrato_normalizado
test_provedor_local_implementa_interface
```

Não duplicar testes equivalentes já existentes.

---

# 17. COMANDOS DE PROVA

Ajustar caminhos apenas se o inventário real mostrar necessidade.

## Compilar

```powershell
cd E:\CentralDark\Pivete\NUCLEO\motor\05-hermes\runtime
python -W error -m compileall hermes
```

## Testar

```powershell
python -W error -m unittest discover -s E:\CentralDark\Pivete\NUCLEO\motor\06-ferramentas\testes -p "test*.py" -v
```

## Status

```powershell
python -m hermes.main --status
```

Registrar:

- comando;
- diretório;
- horário;
- nomes dos testes;
- saída relevante;
- exit code;
- PASS ou FAIL.

Não registrar apenas o total.

---

# 18. VARREDURAS

## Caminhos absolutos

Procurar em código e configuração:

```text
E:\CentralDark\Pivete\NUCLEO
E:\\CentralDark\\Pivete\\NUCLEO
C:\
```

Classificar:

- documentação;
- código;
- configuração;
- teste;
- log.

## Material sensível

Procurar sem imprimir valores:

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

Registrar somente:

- padrão;
- arquivo;
- linha;
- classificação.

Se encontrar segredo real:

- não mostrar;
- não copiar;
- não apagar;
- registrar pendência para rotação pelo Pivete.

---

# 19. AUTOLUPA

Depois de tudo passar, o Crítico deve tentar reprovar o resultado.

Procurar:

- falso verde;
- duas memórias ativas para a mesma chave;
- colisão;
- esquecimento falso;
- banco não fechado;
- tentativa de rede;
- caminho absoluto;
- log íntimo;
- segredo;
- abstração desnecessária;
- teste dependente de ordem;
- teste usando memória pessoal real;
- manifesto antigo;
- arquivo duplicado;
- documento contraditório;
- afirmação de consciência;
- integração externa ativada;
- alteração fora do escopo.

Quando encontrar falha:

```text
BLOQUEAR
→ registrar
→ corrigir o mínimo
→ repetir testes afetados
→ repetir Autolupa
```

---

# 20. RELATÓRIO ÚNICO

Atualizar somente:

```text
motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md
```

Estrutura mínima:

```markdown
# REVISÃO TÉCNICA DA LUPA — HERMES

## Identificação
## Estado inicial
## Histórico resumido
## Escopo da rodada
## Arquivos alterados
## Correções aplicadas
## Comandos executados
## Saídas e códigos de retorno
## Testes com nomes
## Cenários
## Portabilidade
## Segurança
## Varreduras
## Backup e rollback
## Manifesto
## Falhas da Autolupa
## Limitações
## Zoom Out
## Zoom In
## Feynman
## Veredito
## Pendência
## Próximo passo
## Solicitação ao revisor externo
```

Quando uma saída bruta for muito grande:

- salvar em `motor\10-observabilidade\logs`;
- registrar caminho;
- registrar SHA-256;
- registrar tamanho;
- incluir trecho necessário no relatório.

Não criar outro Markdown de revisão.

---

# 21. LIMITES DE EXECUÇÃO

Continuar enquanto houver progresso real.

Parar e registrar bloqueio se:

- mesma falha ocorrer 3 vezes sem nova evidência;
- surgir ação não autorizada;
- risco subir para R3 ou R4;
- for necessário instalar dependência;
- for necessário usar rede;
- for necessário usar credencial;
- houver risco de perder memória;
- o escopo precisar mudar.

Não gastar turnos repetindo texto.

Cada ciclo deve produzir pelo menos:

- evidência;
- correção;
- teste;
- hipótese eliminada;
- bloqueio real.

---

# 22. VEREDITO

Somente usar:

```text
APROVADO COMO EXPERIMENTO FASE 1
```

se todos os gates passarem.

Formulação:

```text
Aprovado experimentalmente dentro dos cenários, evidências e
limitações conhecidas nesta fase.
```

Caso contrário:

```text
CONDICIONADO
CORRIGIR
BLOQUEADO
```

Não usar:

- consciente;
- infalível;
- cópia do Pivete;
- Jarvis concluído;
- autonomia completa.

---

# 23. RESPOSTA FINAL NO TERMINAL

Ao encerrar, mostrar somente:

```text
GOAL ENCERRADO

VEREDITO:
[...]

TESTES:
[aprovados]/[total]

ARQUIVO PARA REVISÃO:
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md

PENDÊNCIA:
[nenhuma ou uma frase]

PRÓXIMO PASSO:
Enviar REVISAO-TECNICA-DA-LUPA.md ao revisor externo.
```

---

# 24. COMANDO PARA O PIVETE INICIAR

Depois de salvar este arquivo na raiz do NÚCLEO, abrir o Grok Build nessa pasta e executar:

```text
/goal Leia e execute integralmente o arquivo COMANDO-HERMES-TURBO-GOAL-LOOP.md. Continue até todos os critérios verificáveis passarem ou até encontrar um bloqueio real que exija decisão do Pivete. Preserve a estrutura atual, aplique a Técnica da Lupa, use subagentes para construir, verificar e criticar quando útil, não use rede, API, Telegram, site, Docker, VPS ou GitHub, e registre toda evidência no único arquivo motor/10-observabilidade/REVISAO-TECNICA-DA-LUPA.md.
```

Para acompanhar:

```text
/goal status
```

Para pausar sem perder o objetivo:

```text
/goal pause
```

Para continuar:

```text
/goal resume
```

Usar `/loop` apenas se o Grok iniciar tarefa real em background e precisar monitorá-la.

Não é necessário usar `/loop` para iniciar esta missão.

---

# 25. FASES POSTERIORES — NÃO EXECUTAR

Somente depois da aprovação externa da Fase 1:

```text
Fase 2 — provider Grok por adapter
Fase 3 — voz
Fase 4 — Telegram
Fase 5 — site e API local
Fase 6 — ferramentas em lista branca
Fase 7 — casa física
Fase 8 — ponte CentralDark e VPS por último
```

Nesta missão:

```text
protótipo offline
→ funcional
→ testado
→ preparado
→ sem conexão externa
```
