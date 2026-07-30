# F1 — Contrato do coletor local read-only

> **Programa:** `HERMES-CASA-MENTE-ESTENDIDA-01`  
> **Autoridade:** Pivete  
> **Coordenadora:** SOL  
> **Estado:** contrato definido; execução ainda não autorizada  
> **Mutação local:** proibida

## 1. Objetivo

Produzir um manifesto estrutural e sanitizado da Casa antes de mover, instalar, remover, vincular ou compartilhar qualquer arquivo.

O coletor responde somente:

```text
O QUE EXISTE
ONDE EXISTE
QUAL É O TIPO
QUAL É O TAMANHO
QUANDO FOI MODIFICADO
SE É LINK, DIRETÓRIO, ARQUIVO OU REPOSITÓRIO
SE HÁ CONSUMIDOR/PROCESSO OBSERVÁVEL
```

Ele não lê nem exporta conteúdo pessoal.

## 2. Raízes permitidas

Somente as raízes explicitamente fornecidas pelo Pivete:

```text
E:\CentralDark
C:\Users\danda\AppData\Local\hermes
```

Qualquer raiz adicional exige novo delta no PR-mãe. Expansão automática para `C:\Users`, outros discos, rede, OneDrive ou perfil inteiro é proibida.

## 3. Metadados permitidos

Por entrada:

```yaml
path_relative: ""
type: file|directory|symlink|junction|git_repo|unknown
size_bytes: 0
modified_at: ""
attributes: []
extension: ""
depth: 0
is_hidden: false
is_reparse_point: false
git:
  present: false
  branch: null
  head: null
  dirty: null
consumer_hint:
  kind: process|config_reference|shortcut|unknown|none
  evidence: "somente referência sanitizada"
```

O caminho publicado deve ser relativo à raiz registrada. O nome do usuário Windows não deve ser repetido no artefato quando puder ser substituído por `%LOCALAPPDATA%`.

## 4. Conteúdo proibido

O coletor deve falhar fechado antes de abrir ou copiar:

- `.env`, `.env.*`, `auth.json`, `auth.lock`, cookies e sessões;
- tokens, senhas, chaves, certificados, arquivos `.pem`, `.key`, `.pfx`;
- bancos vivos ou dumps: `.db`, `.sqlite`, `.sqlite3`, `-wal`, `-shm`, `.sql`;
- conteúdo de `memories`, `memory`, `sessions`, `pastes`, `logs`, `audio_cache` e conversas;
- mensagens Telegram, arquivos do Obsidian, notas pessoais e lembranças;
- conteúdo de arquivos compactados;
- conteúdo de arquivos de configuração que possa conter credencial;
- qualquer arquivo apontado como sensível pela governança do CentralDark.

A regra é por nome, extensão, atributo e caminho. Um arquivo proibido renomeado para outra extensão continua proibido quando o caminho ou a entropia indicar risco.

## 5. Operações proibidas

Durante F1 o coletor não pode:

```text
criar, editar, renomear, mover ou apagar arquivo
alterar ACL, atributo, timestamp ou proprietário
seguir junction/symlink para fora da raiz
executar instalador ou script encontrado
parar ou reiniciar processo
alterar HERMES_HOME
ler Registro do Windows fora das chaves explicitamente aprovadas
abrir porta, rede, browser, Telegram ou VPS
compactar a Casa
fazer upload
fazer commit de inventário bruto
```

## 6. Limites de varredura

- profundidade máxima inicial: `6`;
- no máximo `100000` entradas;
- timeout por raiz: `120 segundos`;
- não seguir reparse points;
- não calcular hash de conteúdo na primeira rodada;
- não executar `git status` em repositório não listado no manifesto de raízes;
- abortar ao exceder limite, sem produzir manifesto parcial como se fosse completo.

## 7. Saídas

### Saída local transitória

```text
E:\CentralDark\Pivete\TEMP\inventario-f1\
```

O diretório é temporário e não canônico. A execução futura deve criar uma pasta por `run_id`, com permissões locais restritas.

### Saída para GitHub

Somente um resumo sanitizado, após revisão:

```text
contagem por raiz e tipo
árvores até profundidade segura
candidatos a duplicata por nome/tamanho, sem conteúdo
repositórios Git e estado estrutural
links/junctions encontrados
riscos e bloqueios
SHA-256 do manifesto local sanitizado
```

O manifesto bruto nunca entra no repositório.

## 8. Provas obrigatórias antes da primeira execução real

O PR-filho do coletor deve conter testes que provem:

1. `.env` e `auth.json` nunca são abertos;
2. SQLite, WAL e SHM nunca são copiados ou lidos;
3. symlink/junction para fora da raiz é registrado, não seguido;
4. caminho fora da allowlist encerra com erro;
5. limite de profundidade e quantidade encerra com erro explícito;
6. nenhuma operação de escrita é chamada;
7. nomes sensíveis são redigidos no resumo;
8. erro ou timeout não produz `status=SUCCESS`;
9. execução repetida sobre fixture produz o mesmo manifesto;
10. o coletor roda primeiro sobre fixtures artificiais, nunca diretamente na Casa.

## 9. Sequência autorizável

```text
CONTRATO
→ implementação em PR-filho
→ testes com fixtures
→ revisão adversarial
→ dry-run em árvore artificial
→ dry-run em uma raiz pequena aprovada
→ revisão do resumo
→ somente então inventário completo
```

Nenhuma etapa concede automaticamente autorização para a seguinte.

## 10. Gate de conclusão F1

F1 só pode ser marcada como concluída quando existir:

```yaml
F1_RECEIPT:
  collector_commit: "SHA completo"
  tested_head: "SHA completo"
  roots: []
  entries_count: 0
  denied_entries_count: 0
  escaped_root_attempts: 0
  writes_detected: 0
  secrets_exposed: 0
  raw_manifest_local_sha256: ""
  sanitized_summary_path: ""
  reviewer: "independente do executor"
  verdict: PASS|FAIL
```

`writes_detected`, `secrets_exposed` ou `escaped_root_attempts` acima de zero mantêm F1 em `FAIL`.
