# Receipt — organização física E: / Casa
Data: 2026-09-13
Escopo: mapear e preparar convergência sem apagar trabalho.

## Owner físico canônico
- E:\CentralDark\CentralDark
- Git: https://github.com/ServerVpss/CentralDark.git
- branch: main
- HEAD local: 5ea592457f156e4ea0fafedac10a41bee22714b5
- estado: dirty; behind origin/main por 239 commits
- regra: não resetar, não sobrescrever, não puxar cegamente.

## Árvores Git encontradas
- E:\CentralDark\workspace
  - branch: pr-1444
  - HEAD: a3e2afbdae88e8af2732e7fb28a45aaaf9f07bb3
  - contém arquivos não rastreados; preservar.
- E:\CentralDark\full
  - branch: main
  - HEAD: daa8ef9257f824d0a59425c48a59707f85a836a0
  - behind origin/main por 194; preservar até comparação.

## Alias confirmado
- E:\CentralDark\Pivete\CentralDark
- tipo: junction
- alvo: E:\CentralDark\CentralDark
- não é cópia física.
- referências ativas exatas não foram encontradas na busca de configurações.

## Caminhos fora do Git
- C:\centraldark-repo existe, mas não é Git.
- C:\Users\danda\CentralDark existe, mas não é Git.
- C:\Users\danda\CentralDarkRepo existe, mas não é Git.
- não misturar esses diretórios no repositório sem classificação de conteúdo.

## Regra de convergência
Comparar por caminho relativo, hash e proveniência:
Casa -> workspace/worktree -> GitHub main -> VPS.
Preservar qualquer delta único antes de promover.
Excluir somente duplicata provada ou alias sem conteúdo próprio.

## Fontes não-Git também entram no garimpo
- C:\Users\danda\CentralDark\ contém .github\github-app.yml; é delta potencial, não repo.
- C:\Users\danda\Desktop\centraldark-secret-map\ contém somente mapas redigidos; não copiar segredos.
- C:\centraldark-repo e C:\Users\danda\CentralDarkRepo estão vazios ou sem .git; manter como candidatos, não como fonte oficial.
- Regra: conteúdo único pode ser promovido para o owner; conteúdo idêntico pode ser deduplicado; conteúdo ambíguo permanece preservado.

## Mutação segura realizada
- Removida somente a junction E:\CentralDark\Pivete\CentralDark.
- Alvo físico E:\CentralDark\CentralDark preservado.
- Nenhum arquivo físico foi apagado.
- Nenhum processo ativo usava o caminho da junction no momento da remoção.

## Base oficial leve criada
- C:\centraldark-repo agora é clone físico da main oficial.
- remoto: https://github.com/ServerVpss/CentralDark.git
- modo: clone com filtro de blobs para build leve, sem alterar a Casa.
- HEAD: 7d4fdaf54f8e0b45da10e20fb852d6eb4b7213a1
- estado: main limpa e alinhada ao origin/main no momento da clonagem.

## Comparação estrutural inicial
- E:\CentralDark\CentralDark: 5247 rastreados, 121 linhas de status, árvore dc1db8...
- E:\CentralDark\workspace: 5129 rastreados, 127 linhas de status, árvore 88357d...
- E:\CentralDark\full: 5061 rastreados, limpo, árvore dff26c...
- conclusão: são fontes diferentes; nenhuma pode ser apagada ou substituída por tamanho.

## Delta não-Git identificado
Fonte: C:\Users\danda\CentralDark\.github\github-app.yml
- contém pacote SOUL/SOL de 659 linhas.
- SHA-256 fonte: 5AB5889EA280827D11ACA243AE297217FBB1041329FAAD991D5163DD0F1BE1E5
- fonte: 23.235 bytes.
- owner candidato no cânone: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
- SHA-256 cânone atual: C948F1995D6866EE92AF4C8977B0537EF260AFBE4A8E1CAB2620C25D33966AC7
- cânone: 35.335 bytes.
- veredito: DELTA ÚTIL CANDIDATO; não é duplicata byte a byte.
- ação: preservar fonte e reconciliar semanticamente antes de integrar; nenhum overwrite feito.

## AppData observado
- C:\Users\danda\AppData\Local\CentralDark contém Bridge, OneShot, Remote-Tray, SOL, Tools e UnifiedRuntime.
- esses diretórios são runtime/configuração ativa; não mover para o repositório.
- C:\Users\danda\AppData\Local\ai.bridgemind.one contém SQLite, credenciais DPAPI e WebView; não copiar nem expor.
- C:\Users\danda\AppData\Roaming\Desktop Commander contém estado e tokens; não copiar nem expor.
