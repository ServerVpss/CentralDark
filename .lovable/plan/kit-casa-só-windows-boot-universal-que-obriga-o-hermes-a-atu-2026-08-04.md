# Kit Casa (só Windows) + BOOT universal que obriga o Hermes a atualizar o painel

Objetivo: a pasta em `E:\CentralDark` vira um "posto de trabalho" temporário. Qualquer IA que abrir aquela pasta é obrigada a ler as regras e, ao terminar qualquer coisa, gravar o que fez e atualizar o painel — sem você precisar pedir.

## O que muda no kit

1. Tirar tudo de Linux (`atualizar.sh` e afins). Fica só Windows: `.ps1` + `.bat` de dois cliques.
2. Adicionar o BOOT universal — um arquivo de entrada que qualquer IA lê primeiro.
3. Adicionar o "registrador": toda ação do Hermes vira uma linha no histórico e re-gera o painel.

## Arquivos do kit final

```text
E:\CentralDark\
├─ LEIA-PRIMEIRO.md            → humano (você)
├─ BOOT-IA.md                  → BOOT universal: regras + obrigações da IA
├─ AGENTS.md / CLAUDE.md       → ponteiros curtos apontando pro BOOT-IA.md
├─ ATUALIZAR.bat               → dois cliques: atualiza repo + painel
├─ PAINEL.bat                  → dois cliques: abre o painel no navegador
├─ scripts\
│   ├─ atualizar.ps1           → git seguro (backup .bundle, ff-only, nunca reset)
│   ├─ registrar.ps1           → grava 1 ação no histórico e regenera o painel
│   └─ vigia.ps1               → modo watch opcional (re-gera a cada 30s)
├─ paineis\
│   ├─ PAINEL-ATUALIZACAO.html → UI Esmeralda (já feita)
│   ├─ painel.css
│   └─ dados.js                → gerado pelos scripts
└─ historico\
    └─ acoes.jsonl             → 1 linha por ação do Hermes (fonte da verdade local)
```

## O BOOT universal (o coração do pedido)

`BOOT-IA.md` é curto e imperativo. Conteúdo:

- Quem manda: Pivete. Onde está: pasta local temporária, não é produção.
- Antes de agir: ler este arquivo inteiro e olhar `historico\acoes.jsonl` (últimas 10 linhas) pra saber onde parou.
- Durante: pode ler/escrever dentro desta pasta; nada destrutivo, nada de force-push, nada fora dela.
- **Depois de QUALQUER ação (obrigatório):** rodar
  `powershell -File scripts\registrar.ps1 -Acao "..." -Area "..." -Status ok|erro|andamento -Detalhe "..."`
- Também registrar quando **começar** algo demorado (`-Status andamento`) para o painel mostrar "fazendo agora".
- Fim de sessão: uma linha de resumo. Sem registro = tarefa não concluída.

Para pegar automaticamente: `AGENTS.md`, `CLAUDE.md` e `.cursorrules` ficam na raiz com 3 linhas cada, só dizendo "leia `BOOT-IA.md` e obedeça". Assim Claude Code, Codex, Cursor e o Hermes carregam sozinhos ao abrir a pasta.

## Como o painel fica sempre atualizado

- `registrar.ps1` faz três coisas: acrescenta a linha em `acoes.jsonl`, lê o estado do git (branch, último commit, se tem coisa não salva) e reescreve `dados.js`.
- O painel lê `dados.js` — abre offline, sem servidor.
- `vigia.ps1` (opcional) fica rodando e re-gera a cada 30s, então se o painel estiver aberto você vê o Hermes trabalhando quase ao vivo.

## Painel — o que aparece

- Veredito grande no topo: "Atualizado" / "Tem coisa nova pra puxar" / "Hermes trabalhando agora".
- Linha do tempo das ações (mais recente em cima), com área, status e horário.
- Bloco git: branch, último commit, arquivos mexidos e não salvos.
- Aviso vermelho se tiver trabalho não salvo.

## Detalhes técnicos

- PowerShell 5.1 (o que já vem no Windows), sem dependência externa; Git opcional — se não tiver, o painel mostra só o histórico.
- `dados.js` é `window.DADOS = {...}` para funcionar em `file://` sem CORS.
- `atualizar.ps1` mantém o comportamento seguro já definido: backup `.bundle`, `merge --ff-only`, nunca `reset --hard`, para sozinho se houver trabalho não salvo; se a pasta for cópia de ZIP, clona ao lado em vez de mexer.
- Entrega: ZIP novo, só Windows.
