# Notepad LocalState — Mineração em Lote (Sessão 2026-08-28)

## O que foi feito nesta sessão

**Fonte:** `%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\`

- `WindowState/`: 2 arquivos `.bin` — WindowState hash SHA256: `4e508426fc02001652dacc23415f394db1a4fb3053e8bae72ed49569e5f80441`, `4e508526ec02001552dacc23415f394db1a4fb3053e8bae72ed49569e5f80441`
- `TabState/`: 30 arquivos `.bin` — estado das abas
- `LocalState.zip`: arquivo contendo `TabState - Copia/` (~50 sessões históricas)

## Decodificação usada (em ordem)

1. UTF-16-LE (comum para Notepad em Windows)
2. UTF-8
3. UTF-16-BE
4. Latin-1 (último fallback, para extrair bytes brutos como string)

Critério: se decoded tem ≥70% de caracteres imprimíveis (`c.isprintable()` ou em `\n\r\t`), adotar. Senão, tentar próxima codificação.

## Conteúdo legível encontrado (sinopse sem segredo)

| Arquivo .bin | Tamanho | Tópico |
|--------------|---------|--------|
| `0f9a4a3a-...` | 3746B | CADEIA DE GATILHOS ESTRUTURADA: !CENTRALDARK, #ACORDAR, !CALIBRAR, !MULTIBUSSOLA, MODE=META |
| `100e5ffd-...` | 17782B | "AGORA FECHOU A FÓRMULA" — alargamento/compressão do organismo, fanout adaptativo (17KB) |
| `1b5f5916-...` | 6142B | Router da Casa CentralDark — roteador que escolhe modelo em tempo real |
| `698587c6-...` | 14214B | "AGORA. Essa é a lógica por baixo dos panos" — MetaLupa não fica só julgando os outros |
| `e8e454e3-...` | 3260B | Script JavaScript para manipular DOM de página markdown |
| `f1caf39a-...` | 218158B | Path de origem: `C:\Users\danda\OneDrive\Área de Trabalho\comando serealizado mutaçao cdedo poribido.txt` + conteúdo de "prova começous de novo" com MERGED != DEPLOYED (109KB decodificado) |
| `c89dfadc-...` | 121288B | Transcript de sessão com metadata (yt/detailpage) — possível conteúdo sensível, quarentena |

## Quarentena (SENSITIVE_QUARANTINE)

4 arquivos classificados como sensível (não reproduzidos):
- `100e5ffd-9238-4ed1-8609-8dd2dc45e5d2.bin`
- `6e864aa6-4e3c-4b6c-b25f-b0bb7570fcb5.bin`
- `c89dfadc-038c-4ee1-b6e1-4ad8ddeff885.bin`
- `f1caf39a-1df4-4586-9ed6-e5dc80c96268.bin`

Critério: detecção de keywords de contexto (`.env`, password, token, auth.json, API key, chave, credencial, refresh_token, access_token, Bearer, PRIVATE KEY, ssh-rsa, -----BEGIN).

## Formatos não decodificados (~24 arquivos)

Arquivos que não produziram texto imprimível ≥70% em nenhuma codificação:
- `0059121c-...` (789B), `0159b17e-...` (220B), `1c81a361-...` (191B), `23ccda52-...` (363B), `2ec51770-...` (7033B), `3171e1dd-...` (1166B), `42937ae7-...` (152B), `4941f3c0-...` (7837B), `6995d42e-...` (1702B), `6ff3b50f-...` (144B), `b619fda2-...` (2279B), `ed471aeb-...` (24903B), `edb241fb-...` (190B), `698587c6-...` parte binária, entre outros.
- Classificação: `FORMAT_UNREADABLE` / `BINARY_UI_STATE` — pode ser estado de UI, hash, ou encoding não coberto. Não adivinhar conteúdo.

## Reconciliação com estado atual do CentralDark (HEAD c4d713fbe, branch fix/git-conflict-padrao-unico)

**Sem contradições encontradas:**
- Gatilhos (!CENTRALDARK, #ACORDAR, !CALIBRAR) — operacionais no repo (commits c4d713fbe, a104fdf01, cfe195c18, f91e6752f)
- Boot declarativo CENTRALDARK_AI_BOOT.yaml — implementado e sendo iterado
- Conflito git unificado — skill + script + boot amarrado (corrigido nesta sessão, PR #1359 merged)
- Conceito de router — implementado via CENTRALDARK_AI_BOOT

**Histórico alinhado com realidade atual.** Nenhuma abra contradictória detectada.

## Gap aberto (UNKNOWN)

- ~24 arquivos binários não decodificados: conteúdo desconhecido (pode ser estado de UI, metadados, ou encoding não coberto)
- LocalState.zip com ~50 sessões no subdiretório `TabState - Copia/`: inteligência histórica não extraída nesta sessão (foi listada apenas)
- Arquivo OneDrive externo (`comando serealizado mutaçao cdedo poribido.txt`): não lido, possivelmente sensível, não reconciliado

## Lição da sessão

**Prova é sempre observacional.** Nenhum claim sobre o Notepad foi promovido sem leitura real dos .bin. O formato do Notepad é proprietário — quando a decodificação falha, registrar `FORMAT_UNREADABLE` em vez de inventar conteúdo. `UNKNOWN ≠ PASS`.

**Nunca persistir LocalState bruto como memória canônica.** É estado de UI temporário. A inteligência extraída (gatilhos, boot, router, MetaLupa) foi reconciliada contra o repo e, quando alinhada, pode ser cristalizada no canônico — mas o ZIP/bin em si não é memória.
