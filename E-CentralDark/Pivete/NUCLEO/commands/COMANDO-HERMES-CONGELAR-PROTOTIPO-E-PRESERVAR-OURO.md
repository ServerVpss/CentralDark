# COMANDO HERMES — CONGELAR O PROTÓTIPO FASE 1 E PRESERVAR O OURO

## 0. EXECUTOR

Este comando é para o **Grok Build CLI** operando localmente em:

```text
E:\CentralDark\Pivete\NUCLEO
```

Usar `/goal` como motor da execução.

Não usar rede, API, Telegram, site, Docker, VPS ou GitHub.

---

# 1. DECISÃO DO PIVETE

O protótipo Hermes Fase 1 cumpriu sua função experimental.

Ele foi usado para provar:

- inicialização local;
- estrutura das pastas;
- memória persistente;
- correção por chave exata;
- esquecimento;
- bloqueio de ações perigosas;
- funcionamento offline;
- testes;
- portabilidade;
- relatório pela Técnica da Lupa.

Agora o Pivete autoriza:

```text
congelar o protótipo validado
→ preservar provas e aprendizados
→ retirar o código experimental do NÚCLEO ativo
→ deixar a estrutura existente limpa
→ preparar o terreno para o Hermes definitivo
```

Não começar a construir o Hermes definitivo nesta missão.

Esta missão termina com a base limpa, documentada e reversível.

---

# 2. PRINCÍPIO DE SEGURANÇA

“Eliminar o protótipo” significa:

1. inventariar;
2. criar backup completo;
3. calcular hashes;
4. testar a restauração em pasta temporária;
5. extrair aprendizados;
6. retirar do NÚCLEO ativo apenas os artefatos experimentais;
7. validar que os documentos e a estrutura oficial permaneceram;
8. registrar o novo estado.

Não significa:

- apagar sem backup;
- apagar documentos de origem;
- apagar a Técnica da Lupa;
- destruir histórico;
- remover a estrutura `motor/01` até `motor/10`;
- construir uma segunda árvore;
- iniciar a Fase 2 automaticamente.

---

# 3. RISCO

```text
RISCO: R3
```

Motivo:

- haverá retirada de código e dados do NÚCLEO ativo;
- a ação é destrutiva localmente;
- existe rollback por backup;
- exige prova forte antes da remoção.

Se o backup ou a restauração temporária falhar:

```text
BLOQUEAR
→ não remover nada
→ registrar a falha
→ encerrar
```

---

# 4. FONTE DA VERDADE

Trabalhar somente em:

```text
E:\CentralDark\Pivete\NUCLEO
```

Backups somente em:

```text
E:\CentralDark\backups
```

Documento canônico de revisão:

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md
```

Documentos canônicos que devem permanecer:

```text
00-FOCO-CASA-VPS-ULTIMO.md
01-VISAO-AMIGO-CASA-E-ORIGEM.md
02-PESQUISA-LUPA-MOTOR-JARVIS.md
README.md
SKILL.md

motor\10-observabilidade\TECNICA-DA-LUPA-PREMIUM.md
motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md
motor\10-observabilidade\REGISTRO-DO-OURO.md
motor\10-observabilidade\ESTADO-ATUAL-PENDENCIAS.md
motor\10-observabilidade\PLANO-POR-FASES.md
motor\10-observabilidade\VERSION.txt
motor\10-observabilidade\MANIFESTO-SHA256.txt
```

Não criar novo documento canônico.

---

# 5. TÉCNICA DA LUPA

Antes de agir, ler integralmente:

```text
motor\10-observabilidade\TECNICA-DA-LUPA-PREMIUM.md
```

Aplicar:

- evidência primeiro;
- correção mínima;
- preservação;
- Zoom Out;
- Zoom In;
- Feynman;
- rollback;
- segurança;
- Autolupa.

A remoção somente pode ocorrer depois do Gate de Backup.

---

# 6. GATE 1 — INVENTÁRIO DO PROTÓTIPO

Inventariar tudo que foi criado ou alterado pelo protótipo.

Classificar cada item como:

```text
PRESERVAR — visão, regra, aprendizado ou fonte canônica
ARQUIVAR — prova, código ou artefato útil apenas para histórico
REMOVER DO ATIVO — runtime, teste, banco, log ou UI experimental
REVISAR — origem incerta
```

Registrar no arquivo canônico:

- caminho;
- tamanho;
- SHA-256;
- classificação;
- motivo.

Não remover nada nesta etapa.

---

# 7. GATE 2 — BACKUP CONGELADO

Criar um único pacote:

```text
E:\CentralDark\backups\
HERMES-PROTOTIPO-FASE1-CONGELADO-AAAA-MM-DD-HHMMSS.zip
```

O ZIP deve conter o NÚCLEO completo antes da limpeza.

Também gerar, ao lado:

```text
HERMES-PROTOTIPO-FASE1-CONGELADO-AAAA-MM-DD-HHMMSS.sha256.txt
```

O arquivo de hash deve conter:

- nome do ZIP;
- SHA-256;
- tamanho;
- data/hora;
- quantidade de entradas.

Não incluir secrets no relatório.

---

# 8. GATE 3 — PROVA DE RESTAURAÇÃO

Extrair o backup em pasta temporária, por exemplo:

```text
%TEMP%\hermes-prototipo-fase1-restauracao\
```

Na cópia restaurada:

1. conferir quantidade de entradas;
2. conferir hashes de arquivos relevantes;
3. localizar o runtime;
4. executar o status;
5. executar os testes existentes;
6. confirmar que o protótipo restaurado ainda inicia;
7. confirmar que a restauração não depende da pasta original.

Registrar:

- caminho temporário;
- comandos;
- códigos de saída;
- total de testes;
- veredito.

Somente seguir se:

```text
BACKUP: VÁLIDO
RESTAURAÇÃO: VÁLIDA
PROTÓTIPO RESTAURADO: EXECUTÁVEL
```

Se qualquer item falhar:

```text
BLOQUEADO
```

Não remover nada do NÚCLEO ativo.

---

# 9. GATE 4 — EXTRAIR O OURO

Atualizar somente:

```text
motor\10-observabilidade\REGISTRO-DO-OURO.md
```

Registrar aprendizados comprovados da Fase 1.

No mínimo:

## Arquitetura

- manter uma única estrutura;
- runtime precisa permanecer coeso;
- caminhos devem ser portáteis;
- canais e providers devem entrar por adapters;
- Telegram e site não devem reescrever memória ou segurança.

## Memória

- correção deve usar ID ou chave exata;
- busca parcial não pode alterar registros;
- memória precisa de origem e confiança;
- correção não pode manter duas verdades ativas;
- esquecimento precisa sobreviver ao reinício;
- SQLite exige commit, rollback e fechamento explícito.

## Segurança

- offline por padrão;
- ações perigosas negadas;
- `always-approve` do CLI não substitui políticas internas;
- sem secrets em logs;
- casa primeiro e VPS por último.

## Engenharia

- teste com warnings como erro;
- persistência deve ser provada entre processos;
- portabilidade deve ser testada fora do caminho original;
- Autolupa deve tentar reprovar;
- status verde não substitui comportamento real.

## Relação Pivete ↔ Hermes

- vínculo depende de continuidade e memória, não de resposta bonita;
- Hermes não deve afirmar consciência;
- Pivete mantém autoridade;
- evolução deve ser lenta, auditável e reversível.

Não copiar o chat inteiro.

Não registrar hipótese como aprendizado.

---

# 10. GATE 5 — PRESERVAR O QUE NÃO É PROTÓTIPO

Preservar:

```text
documentos da raiz
estrutura motor/01 até motor/10
Técnica da Lupa
Registro do Ouro
Plano por Fases
Estado Atual
Revisão canônica
manifesto
versão
```

Preservar também documentos de identidade, arquitetura, memória,
voz, segurança e pontes quando forem conceitos válidos para o futuro.

Se um documento misturar:

- aprendizado válido;
- instrução específica do protótipo;
- estado antigo;

aplicar correção mínima:

```text
preservar o princípio
→ retirar afirmação operacional antiga
→ marcar como histórico quando necessário
```

Não criar uma nova versão do documento.

Atualizar o existente.

---

# 11. GATE 6 — RETIRAR O PROTÓTIPO DO NÚCLEO ATIVO

Somente depois dos Gates 1–5 aprovados.

Itens experimentais normalmente removíveis do ativo:

```text
motor\05-hermes\runtime\hermes\
motor\05-hermes\runtime\__pycache__\
motor\05-hermes\configuracao\agentes.json experimental
motor\06-ferramentas\testes\
motor\06-ferramentas\iniciar-local.bat
motor\06-ferramentas\iniciar-com-voz.bat
motor\06-ferramentas\validadores específicos do protótipo
motor\03-memoria\dados\hermes.db
motor\04-voz\audio\inicializacao.wav experimental
motor\10-observabilidade\logs\ arquivos gerados pelo protótipo
arquivos temporários
caches
.pyc
__pycache__
UI ou launcher experimental do “Hermes is Ready”
```

Esta lista é orientativa.

Não remover automaticamente um item sem confirmar:

- origem;
- uso;
- existência no backup;
- classificação do inventário.

## Regra de limpeza

As pastas oficiais devem continuar existindo.

Quando uma pasta ficar vazia:

- manter a pasta;
- manter ou ajustar seu `README.md`;
- indicar estado:
  `aguardando implementação do Hermes definitivo`.

Não criar placeholders inúteis.

---

# 12. ESTADO FINAL ESPERADO

Depois da limpeza:

```text
E:\CentralDark\Pivete\NUCLEO\
├── documentos canônicos da visão
├── SKILL.md
├── README.md
└── motor\
    ├── 01-identidade\
    ├── 02-cerebro\
    ├── 03-memoria\
    ├── 04-voz\
    ├── 05-hermes\
    ├── 06-ferramentas\
    ├── 07-seguranca\
    ├── 08-docker\
    ├── 09-pontes\
    └── 10-observabilidade\
```

A estrutura deve conter:

- visão;
- regras;
- aprendizados;
- plano;
- limites;
- contratos conceituais úteis;
- estado atual.

A estrutura não deve conter:

- runtime experimental ativo;
- banco experimental;
- testes do protótipo;
- launcher experimental;
- UI experimental;
- logs experimentais;
- caches;
- executáveis temporários.

---

# 13. ATUALIZAR ESTADO ATUAL

Atualizar somente:

```text
motor\10-observabilidade\ESTADO-ATUAL-PENDENCIAS.md
```

Registrar:

```text
ESTADO:
Protótipo Fase 1 congelado e retirado do NÚCLEO ativo.

BACKUP:
[caminho]

HASH:
[SHA-256]

PROVA DE RESTAURAÇÃO:
PASS | FAIL

PRESERVADO:
visão, estrutura, Lupa, ouro, plano e limites.

REMOVIDO DO ATIVO:
lista objetiva.

PENDÊNCIA:
definir a especificação do Hermes definitivo antes de implementar.

PRÓXIMA AÇÃO:
desenhar o contrato da Fase 2 com o Pivete.
```

---

# 14. ATUALIZAR PLANO

Atualizar somente:

```text
motor\10-observabilidade\PLANO-POR-FASES.md
```

Marcar:

```text
FASE 1 — PROTÓTIPO DE PROVA
CONCLUÍDA E CONGELADA
```

Próxima fase:

```text
FASE 2 — HERMES DEFINITIVO: ESPECIFICAÇÃO
```

A Fase 2 deve começar por definição, não por código.

Itens futuros:

- identidade real;
- memória pessoal real;
- consentimento;
- privacidade;
- contrato de cérebro;
- adapter Grok;
- voz;
- Telegram;
- site próprio;
- API local;
- ferramentas;
- casa física;
- VPS por último.

Não implementar nenhum desses itens nesta missão.

---

# 15. REVISÃO CANÔNICA

Atualizar somente:

```text
motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md
```

Registrar a nova rodada:

```text
VEREDITO:
PROTÓTIPO FASE 1 CONGELADO E RETIRADO DO ATIVO
ou
BLOQUEADO

RISCO:
R3

BACKUP:
caminho + hash

RESTAURAÇÃO:
comandos + resultados

OURO:
aprendizados preservados

ARQUIVOS PRESERVADOS:
lista

ARQUIVOS RETIRADOS DO ATIVO:
lista

REGRESSÃO:
documentos e estrutura preservados

ROLLBACK:
procedimento exato

SEGURANÇA:
resultado

LIMITAÇÕES:
o que não foi validado

PRÓXIMO PASSO:
especificação do Hermes definitivo
```

Não criar outro relatório.

---

# 16. MANIFESTO

Regenerar:

```text
motor\10-observabilidade\MANIFESTO-SHA256.txt
```

O manifesto deve representar o NÚCLEO limpo.

Excluir:

- logs mutáveis;
- temporários;
- caches;
- bancos;
- ZIPs de backup externos.

Registrar no relatório:

- SHA-256 do manifesto;
- quantidade de arquivos;
- exclusões aplicadas.

---

# 17. AUTOLUPA FINAL

Tentar reprovar a transição.

Procurar:

- arquivo experimental esquecido;
- runtime ainda executável;
- banco experimental ainda ativo;
- teste ou launcher restante;
- documento canônico apagado;
- aprendizado perdido;
- backup inválido;
- rollback impossível;
- cópia paralela dentro do NÚCLEO;
- manifesto antigo;
- log com conteúdo pessoal;
- segredo;
- pasta oficial removida;
- plano iniciando código sem especificação.

Se encontrar falha:

```text
BLOQUEAR
→ corrigir o mínimo
→ repetir os testes afetados
→ atualizar o mesmo relatório
```

---

# 18. CONDIÇÃO DE PARADA

A missão termina quando:

```text
[ ] backup completo criado
[ ] hash registrado
[ ] restauração temporária aprovada
[ ] protótipo restaurado testado
[ ] ouro registrado
[ ] documentos preservados
[ ] runtime experimental retirado do ativo
[ ] banco experimental retirado
[ ] testes e launcher experimentais retirados
[ ] estrutura motor/01–10 preservada
[ ] estado atual atualizado
[ ] plano atualizado
[ ] manifesto regenerado
[ ] Autolupa aprovada
[ ] rollback documentado
```

Se qualquer item anterior ao backup/restauração falhar:

```text
não remover nada
```

---

# 19. RESPOSTA FINAL NO TERMINAL

Mostrar somente:

```text
TRANSIÇÃO ENCERRADA

VEREDITO:
[PROTÓTIPO FASE 1 CONGELADO E RETIRADO DO ATIVO | BLOQUEADO]

BACKUP:
[caminho]

SHA-256:
[hash]

RESTAURAÇÃO:
[PASS | FAIL]

ARQUIVO PARA REVISÃO:
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md

PRÓXIMO PASSO:
Especificar o Hermes definitivo com o Pivete.
```

---

# 20. COMANDO PARA INICIAR NO GROK BUILD

Salvar este arquivo na raiz do NÚCLEO e executar:

```text
/goal Leia e execute integralmente COMANDO-HERMES-CONGELAR-PROTOTIPO-E-PRESERVAR-OURO.md. Primeiro inventarie, crie e valide um backup restaurável do NÚCLEO completo. Somente depois extraia os aprendizados comprovados para os documentos canônicos e retire do NÚCLEO ativo o runtime, banco, testes, launcher, UI, logs e caches experimentais da Fase 1. Preserve a estrutura motor/01–10, a visão, a Técnica da Lupa, o Registro do Ouro, o Plano, o Estado Atual e a Revisão canônica. Não construa a Fase 2, não use rede, API, Telegram, site, Docker, VPS ou GitHub. Se backup ou restauração falharem, não remova nada e encerre como BLOQUEADO.
```

Para acompanhar:

```text
/goal status
```

Não usar `/loop` nesta missão, salvo se houver uma tarefa real de backup
ou teste executando em background.
