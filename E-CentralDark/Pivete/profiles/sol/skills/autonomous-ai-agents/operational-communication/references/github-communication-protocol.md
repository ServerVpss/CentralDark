# Protocolo de Comunicação GitHub-First (CentralDark)

Quando o usuário expressa que a comunicação deve ocorrer **via GitHub** (commits, PRs, issues) e não por conversa direta no chat, adotar o seguinte protocolo.

## Gatilho

Use quando:
- O usuário diz "faça o e uso github pra se comunica", "nao conversa comigo conversa pelo git hub", ou variante equivalente.
- O usuário indica que o canal de troca de informação/estado é o repositório, não a janela de chat.
- O usuário quer rastreabilidade pública e auditável no repo em vez de historico de chat.

Sempre que o gatilho bater, **não adicionar conversação extra aqui**. Registre o avanço no GitHub como forma de comunicação.

## O que registrar

### 1. Decisões operacionais
- Abra issue ou adicione ao corpo de um PR a decisão + contexto + evidência.
- Se houver múltiplas decisões, uma issue por decisão ou um PR com resumo de cada uma.
- Evite decisões soltas no chat sem traço no repo.

### 2. Avanços de missão
- Cada avanço material deve ter rastro: commit + PR (se aplicável) + issue de contexto se necessário.
- Se o trabalho é continuação de algo já aberto, atualize o PR/issue existente, não criar um novo "desintegrado".

### 3. Bloqueios e fronteiras
- Se houver uma decisão humana pendente, registrar no GitHub a fronteira exata e o que falta para avançar — não esperar no chat.
- A issue/PULL deve conter o que está decidido, o que está bloqueado e a pergunta mínima necessária.

### 4. Fechamento
- O fechamento da missão pode vir como comentário de PR/issue ou como commit de registro + issue de receipt, dependendo de complexidade.
- Se houver um receipt canônico, ele vai para o repo e a comunicação é derivada dele, não o contrário.

## O que NÃO fazer

- Não continuar a conversar no chat como se fosse o canal principal quando o usuário definiu GitHub como foco.
- Não criar comunicação paralela no chat para algo que deveria ser commit/PR/issue.
- Não responder com texto longa explicando o que foi feito se o próprio commit/PR/issue já serve. Deixar o rastro no repo e, se necessário, apontar o link aqui de forma objetiva.

## Formato mínimo de comunicação via GitHub

### Issue de decisão/contexto
```
Título: <assunto claro, sem vazamento de segredo>
Corpo:
- intenção
- o que foi feito / está sendo feito
- o que ainda depende
- prova / evidência (commit, PR, link)
- próximo item de decisão ou ação
```

### PR
```
Título: <tipo(escopo): o que muda>
Corpo:
- contexto
- mudança
- prova de que resolve / não regressa
- itens dependentes ou a confirmar
- se aplica: rastro de receipt
```

### Comentário de follow-up
- curto, apontando avanço, link ou mudança de estado.
- não repetir a historia toda.

## Regra de ouro

A comunicação "no GitHub" não é só "copiar o que foi falado para o repo". É **fazer o repo carregar o fio da missão** de forma que, no futuro, quem abrir o repo veja o que foi decidido, feito e pendente, sem depender de janela de chat.

Quando o usuário pede comunicação via GitHub, trate como uma ordem de protocolo, não como sugestão de estilo.
