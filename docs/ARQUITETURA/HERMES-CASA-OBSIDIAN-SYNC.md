# Hermes Casa + Obsidian — memória viva sem expor a Casa

## Decisão

A memória visual da Casa usa um cofre separado em:

```text
E:\CentralDark\Pivete\CASA-VAULT
```

O repositório continua sendo a fonte da verdade do projeto. O Obsidian deixa de abrir a raiz inteira do repositório como cofre principal.

## Estrutura do cofre

```text
CASA-VAULT/
├── 00-CANONICO/          ↔ CentralDark/docs/BRAIN
├── 10-MEMORIA-PRIVADA/   somente Casa
├── 20-INBOX-HERMES/      aprendizados candidatos
├── 30-ANEXOS/            somente Casa por padrão
├── 90-CONFLITOS/         cópias preservadas quando os dois lados mudam
├── .hermes-sync/         manifesto local de hashes
└── .obsidian/            configuração local do Obsidian
```

## O que muda a trajetória do Hermes

Editar uma nota no Obsidian não concede permissão nem executa ação imediatamente.

```text
edição em 00-CANONICO
→ sincronização para docs/BRAIN
→ commit/PR/merge
→ Hermes recarrega a fonte da verdade
→ contexto e direção atualizados
```

As regras comportamentais continuam vindo dos arquivos canônicos já existentes:

- `LEIA-ME-IA.md`;
- `AGENTS.md`;
- `docs/CONSCIENCIA/APRENDIZADOS.md`;
- `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`;
- `.agents/skills/`.

`docs/BRAIN` fornece memória, mapa, decisões e contexto. Mudanças críticas de comportamento devem atualizar o artefato canônico existente, e não criar uma segunda regra dentro do BRAIN.

## Aprendizado vivo

O Hermes aprende primeiro na Casa:

```text
20-INBOX-HERMES
→ descoberta candidata
→ remoção de dados privados
→ prova e teste
→ atualização do arquivo canônico já existente
→ PR automático
→ merge após validação
→ pull e recarga na Casa
```

Conteúdo pessoal, conversa, endereço, rotina, token, sessão, credencial e anexos privados permanecem em `10-MEMORIA-PRIVADA` ou `30-ANEXOS` e nunca entram no Git.

## Sincronização

O script `scripts/casa/sync-hermes-obsidian.ps1` usa hashes e um estado local para distinguir:

- alteração somente no GitHub: copia para o Obsidian;
- alteração somente no Obsidian: copia para `docs/BRAIN`;
- alteração igual nos dois lados: registra como sincronizada;
- alteração diferente nos dois lados: preserva ambas em `90-CONFLITOS` e para;
- exclusão: nunca é propagada automaticamente.

Isso permite edição bidirecional sem sobrescrever silenciosamente nenhum lado.

## Obsidian atual

O conteúdo existente em `docs/BRAIN` não é descartado. Na primeira inicialização ele é copiado para `CASA-VAULT/00-CANONICO` e passa a aparecer no mesmo grafo das memórias locais, sem colocar as memórias locais dentro do repositório.


## Cartazes, anexos canônicos e projeções

`docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/` pertence à camada
canônica e, portanto, entra em `CASA-VAULT/00-CANONICO` pelo mesmo contrato de
sync. O manifesto preserva o hash do PNG entregue e o hash da cópia WebP leve
guardada no Git. Grafo, GraphRAG e memória vetorial podem indexar esses itens,
mas são projeções reconstruíveis: não escrevem de volta sobre os owners.

Imagem privada continua em `30-ANEXOS`; só entra no canônico mediante
classificação, proveniência, hash e autorização explícita. Arquivo presente no
Git não prova que site, `.exe` ou VPS foi atualizado.

## Resultado esperado

```text
CHEFE edita ao vivo no Obsidian
→ Hermes percebe a mudança
→ sincroniza o canônico
→ GitHub registra e valida
→ Hermes recarrega
→ o sistema segue a direção nova
```

Sem duplicar cérebro, sem transformar o repositório inteiro em cofre e sem publicar a memória privada da Casa.
