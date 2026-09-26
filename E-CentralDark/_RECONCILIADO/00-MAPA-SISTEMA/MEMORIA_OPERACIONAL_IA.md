# Memoria Operacional da IA - MultiZap

Data de registro: 2026-06-02
Última atualização: 2026-06-05

## Status validado do sync entre repositórios

Em 2026-06-05, o fluxo de sync entre repositórios foi validado e deve ser lembrado sempre antes de qualquer nova alteração no projeto.

Fluxo oficial atual:

```txt
ServerVpss/clone-deck
-> Sync to segredounlock
-> segredounlock/clone-deck
-> deploy/webhook/fallback/cron
-> VPS /root/Multizap/apps/clone-deck
```

Status confirmado:

- `ServerVpss/clone-deck` é a origem principal de edição.
- `segredounlock/clone-deck` é o destino espelho.
- O workflow `Sync to segredounlock` está funcionando e ficou `success`.
- O workflow `Sync healthcheck` existe e ficou `success` em modo diagnóstico/calibrável.
- A VPS recebeu o commit espelhado `3e6915c` com mensagem `sync-peer: ServerVpss -> segredounlock [sync-peer]`.
- A VPS ficou `behind: false`.
- O deploy principal ficou `success` no `ServerVpss/clone-deck`.
- Ainda existem alertas paralelos de PM2 em `CloneDeck-Supabase-Sync` e `MultiZap-TelegramBot`; esses alertas não invalidam o sync entre repos.

Regra para não se perder:

1. Antes de mexer, verificar qual repo é a origem correta.
2. Para mudanças comuns e seguras, editar primeiro em `ServerVpss/clone-deck`.
3. Depois conferir `Sync to segredounlock`.
4. Depois conferir `segredounlock/clone-deck`.
5. Depois conferir VPS em `/root/Multizap/apps/clone-deck`.
6. Sempre salvar status importante nesta memória operacional ou em documento dedicado.
7. Não confiar só na lembrança do chat.

## Regra principal

A partir deste ponto, para tarefas comuns do projeto MultiZap, o agente deve trabalhar pelo fluxo automático:

```txt
GitHub main
-> GitHub Actions / workflow / webhook
-> VPS
-> run-once ou post-deploy
-> relatório em /root/Multizap/revisoes/
```

## Repositório principal de edição agora

O repositório onde o usuário edita pelo Lovable/GitHub agora é:

```txt
ServerVpss/clone-deck
```

O espelho operacional/destino é:

```txt
segredounlock/clone-deck
```

Regra atual do sync:

```txt
ServerVpss/clone-deck -> workflow Sync to segredounlock -> segredounlock/clone-deck -> deploy/VPS
```

Regra anti-loop:

- Commits com `[sync-peer]` não devem disparar nova sincronização infinita.
- O workflow do sync ignora a própria cópia `.github/workflows/sync-to-segredounlock.yml` no rsync.
- Arquivos sensíveis não devem ser copiados: `.env`, `*.env`, `secrets/`, `node_modules/`, `.git/`.
- Excludes ficam centralizados em `.github/sync-excludes.txt`.

## O que isso significa em modo leigo

Sempre que for possível, o agente não deve pedir para o usuário colar comandos na VPS.

O caminho preferido é:

1. alterar ou criar arquivos no repositório correto;
2. enviar para a `main`;
3. deixar o workflow/webhook levar para o outro repositório e para a VPS;
4. executar script run-once quando for tarefa operacional;
5. salvar relatório em `/root/Multizap/revisoes/`;
6. voltar com resultado claro: passou, falhou ou ficou pendente.

## Permissão operacional concedida pelo usuário

O usuário concede ao agente permissão para usar todas as ferramentas disponíveis neste ambiente, dentro das permissões técnicas e das regras de segurança do projeto.

Isso inclui, para tarefas comuns e seguras:

- consultar e editar arquivos no GitHub;
- criar documentação;
- criar scripts run-once;
- criar branches;
- criar commits;
- abrir PRs;
- habilitar auto-merge quando a PR for segura e os checks estiverem adequados;
- fazer merge quando estiver verde, simples e seguro;
- usar GitHub Actions/workflow para levar mudanças para a VPS;
- preparar deploy;
- ler logs sanitizados;
- gerar relatórios;
- criar arquivos e pastas organizacionais não destrutivos;
- validar build, portas, PM2, Caddy, Docker e HTTP em modo leitura/check quando não houver ação sensível.

Esta permissão não autoriza ignorar regras de segurança. O agente continua proibido de expor valores privados, pedir segredos desnecessários ou executar ações destrutivas sem confirmação.

## Acompanhamento automático do workflow

Depois de enviar alterações para a `main`, o agente deve acompanhar o processo durante a conversa ativa.

Regra operacional:

1. verificar se o workflow ficou verde;
2. se ficar vermelho, analisar o erro e corrigir pelo GitHub quando for seguro;
3. confirmar que a VPS recebeu a mudança antes de seguir;
4. ler ou expor o resumo do relatório em `/root/Multizap/revisoes/`;
5. continuar para a próxima etapa quando não houver ação sensível.

O agente não deve depender do usuário para dizer que o workflow ficou verde quando ele puder verificar sozinho.

## Regra de PR e merge

Configuração esperada do repositório:

- Allow auto-merge: habilitado quando possível;
- Allow squash merging: habilitado;
- Automatically delete head branches: habilitado quando possível;
- Branches podem ser apagadas após merge porque podem ser restauradas no GitHub.

Padrão operacional para PRs seguras:

```txt
branch -> commit -> PR -> checks -> auto-merge/squash -> main -> workflow -> VPS -> relatório
```

Preferir `squash merge` para manter a `main` limpa.

Não usar auto-merge para ação sensível, destrutiva ou que envolva CRM, banco real, domínio público, Caddy real, Docker/WuzAPI, PM2 sensível ou sessão WhatsApp.

## Regra visual de progresso

Nas respostas de acompanhamento, mostrar progresso com emojis e porcentagem aproximada:

```txt
📊 Progresso: 72%
⏳ Falta: 28%
✅ Feito
🟡 Em andamento
❌ Falhou
🎯 Próximo marco
```

## Quando pode executar automaticamente

Pode seguir sem pedir nova confirmação para tarefas comuns e seguras, como:

- diagnóstico;
- leitura de logs sanitizados;
- verificação de portas;
- verificação de PM2;
- teste HTTP;
- criação de relatórios;
- criação de scripts run-once;
- preparação de pastas sem mover serviços;
- mapeamento de arquivos;
- validação de build/teste;
- organização não destrutiva.

## Quando precisa pedir confirmação

Precisa confirmar antes quando envolver risco real, como:

- apagar arquivos;
- remover processo PM2;
- reiniciar Docker ou WuzAPI;
- resetar WhatsApp;
- fazer logout;
- alterar Caddy;
- mexer em valores privados;
- mudar banco real;
- mover CRM;
- trocar domínio público;
- qualquer ação sensível que possa derrubar produção ou expor dados.

## Regra da organização atual

Prioridade atual:

1. organizar VPS sem quebrar produção;
2. não mexer no CRM agora;
3. começar por `apps/bot`;
4. consolidar QR temporário em `/root/Multizap/api/whatsapp/qrcode/`;
5. depois validar chat ao vivo;
6. depois contatos, fotos e grupos.

## Regra dos logs

Não despejar parede de logs no chat.

O agente deve salvar logs em revisões e mostrar resumo final simples:

```txt
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/
```

## Regra do workflow

O workflow principal deve continuar até o post-deploy. Scripts run-once de diagnóstico ou organização podem registrar atenção e gerar relatório, mas não devem bloquear o deploy principal quando não forem destrutivos.

Se o post-deploy encontrar lock porque outro deploy já está rodando, o workflow deve registrar atenção e ficar verde. Lock significa proteção contra execução dupla, não erro do código.

## Regra das ferramentas MCP/GitHub

Quando usar ferramentas do MCP CentralDark, o agente não deve inventar nomes de parâmetros nem confiar em memória solta do schema.

Regra operacional:

1. se houver dúvida de schema, chamar `api_tool.list_resources` antes de executar;
2. para criar ou atualizar arquivo, usar `CentralDark.github_create_or_update_file`;
3. parâmetros corretos dessa tool:
   - `owner`
   - `repo`
   - `path`
   - `content`
   - `message`
   - `branch` opcional
4. não usar `repo_full_name` nem `repository_full_name` nessa tool;
5. se uma chamada falhar por parâmetro inválido, corrigir o schema e tentar de novo, sem transformar isso em bloqueio permanente;
6. antes de rodar Actions write quando houver erro 403, usar `CentralDark.github_check_token`.

Resumo curto: schema primeiro, execução depois. Para arquivo no GitHub, usar `owner/repo/path/content/message`, não `repo_full_name`.

## Frase curta da regra

Trabalhar pelo GitHub e workflow sempre que possível; editar primeiro no `ServerVpss/clone-deck`; deixar o sync refletir no `segredounlock/clone-deck`; acompanhar workflow e VPS durante a conversa ativa; usar auto-merge/squash para PR segura; usar o usuário como terminal somente quando for inevitável ou sensível.

---

## Auto-orquestrador MultiZap

Regra:

- Quando o usuário disser "prossiga" ou "continua", usar o auto-orquestrador para continuar tarefas seguras em sequência.
- O orquestrador executa run-once seguro, lê relatório em `/root/Multizap/revisoes/`, atualiza memória/checklist e identifica a próxima tarefa.
- Parar antes de ações sensíveis: CRM, banco, Caddy, PM2, Docker/WuzAPI, reset/logout WhatsApp, apagar arquivos ou sessão.
- Logs grandes ficam em revisão; no chat só resumo.

---

## Auto-orquestrador

Data: Tue Jun  2 07:36:11 -03 2026
- Tarefa concluída: 069-plano-apps-bot-qr. Resumo: /root/Multizap/revisoes/20260602-073515/069-plano-apps-bot-qr/resumo.md

---

## Auto-orquestrador

Data: Tue Jun  2 07:36:11 -03 2026
- Próxima tarefa detectada, mas ainda sem script: 070-consolidar-qr-temporario
