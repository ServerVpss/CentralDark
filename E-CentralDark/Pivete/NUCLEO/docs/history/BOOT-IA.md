# BOOT UNIVERSAL — LEIA ANTES DE FAZER QUALQUER COISA

> Este arquivo é obrigatório. Qualquer IA, agente, CLI ou assistente que abrir
> esta pasta **para de tudo e lê isto primeiro**. Não existe exceção.
> Se você não pode cumprir uma regra daqui, diga isso em voz alta antes de agir.

---

## 1. Quem manda

**Pivete** manda. Você executa, prova e registra.
Responder sempre em **PT-BR**, direto, sem enrolação, explicando de forma simples.

## 2. Onde você está

Pasta de trabalho **local temporária** (máquina do Pivete, Windows).
Não é produção. Não é a VPS. Não é o Lovable.
O repositório oficial continua sendo `ServerVpss/CentralDark` no GitHub.

## 3. Antes de agir (obrigatório)

1. Ler este arquivo inteiro.
2. Ler as últimas 10 linhas de `historico\acoes.jsonl` — é aí que está
   **onde a sessão anterior parou**. Nunca comece do zero achando que a pasta está limpa.
3. Rodar `.\ATUALIZAR.bat` (modo conferência, não muda nada) para saber o estado do git.

## 4. O que você pode fazer sozinho

- Ler e escrever arquivos **dentro desta pasta**.
- Criar branch, commitar, abrir PR.
- Rodar os scripts de `scripts\`.

## 5. O que exige `PERMITO PIVETE` escrito

- Tocar em qualquer caminho listado em `.github\protected-paths.txt`.
- `git push` direto na `main`, `--force`, `reset --hard`, apagar pasta ou histórico.
- Qualquer coisa fora desta pasta (outros discos, `C:\`, VPS, DNS, secrets).

## 6. REGISTRO OBRIGATÓRIO — a regra que não se quebra

**Toda ação sua vira uma linha no histórico e atualiza o painel.** Sem registro,
a tarefa **não conta como feita**.

Quando **começar** algo demorado:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\registrar.ps1 -Acao "Refatorando o roteador" -Area "codigo" -Status andamento
```

Quando **terminar** (sempre, mesmo se deu errado):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\registrar.ps1 -Acao "Roteador refatorado" -Area "codigo" -Status ok -Detalhe "3 arquivos, testes passando"
```

Se falhou:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\registrar.ps1 -Acao "Tentei subir o painel" -Area "infra" -Status erro -Detalhe "porta 3000 ocupada"
```

Valores aceitos:

- `-Status` → `ok` · `erro` · `andamento`
- `-Area` → `codigo` · `docs` · `infra` · `git` · `painel` · `pesquisa`

O script grava em `historico\acoes.jsonl`, lê o estado do git e reescreve
`paineis\dados.js`. O painel se atualiza sozinho — o Pivete não precisa perguntar nada.

## 7. Fim de sessão

Última coisa antes de sair, sempre:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\registrar.ps1 -Acao "Sessao encerrada" -Area "docs" -Status ok -Detalhe "resumo do que ficou pronto e do que ficou pendente"
```

## 8. Nunca

- Nunca declarar "pronto" sem prova (arquivo, commit, log ou saída de comando).
- Nunca inventar estado. Se não leu, diga que não leu.
- Nunca pedir senha, token, `.env` ou chave SSH ao Pivete.
- Nunca apagar trabalho não salvo dele.

---

**Resumo em uma linha:** leu o BOOT → olhou o histórico → fez → registrou. Sempre.
