# NÚCLEO — Hermes / Amigo em Casa

Pasta local e pessoal do experimento **Rather Very Intelligent System**: um amigo-assistente em casa, com memória persistente, voz opcional, módulos especializados e evolução controlada pelo Pivete.

> **Não é site. Não é VPS. Não depende de GitHub. Não executa ações destrutivas.**

## Casa prevista

```text
E:\CentralDark\Pivete\NUCLEO\
```

O nome `CentralDark` aqui é apenas a pasta-base local escolhida. Este pacote é independente de monorepo, produção e infraestrutura remota.

## Começo seguro

1. Extraia este ZIP em `E:\CentralDark\Pivete\`.
2. A pasta resultante pode ser renomeada para `NUCLEO`.
3. Abra o PowerShell dentro dela.
4. Execute:

```powershell
python scripts\validar_pacote.py
python -m unittest discover -s tests -v
python -m hermes.main
```

Para falar a resposta usando a voz nativa do Windows:

```powershell
python -m hermes.main --voz
```

Para testar uma frase sem abrir conversa contínua:

```powershell
python -m hermes.main --uma-vez "lembre que meu projeto pessoal se chama Hermes"
python -m hermes.main --uma-vez "o que você lembra de mim?"
```

## O que já funciona neste pacote

- terminal local;
- memória persistente em SQLite;
- lembrança explícita com `lembre que ...`;
- recuperação simples de memórias;
- triagem de intenção;
- seleção limitada de especialistas;
- execução paralela local dos especialistas selecionados;
- síntese de resposta;
- bloqueio de pedidos destrutivos;
- feedback explícito com `/feedback bom` ou `/feedback ruim`;
- ajuste limitado de confiança dos especialistas;
- log de auditoria sanitizado;
- som curto de inicialização;
- voz de saída no Windows, sem biblioteca externa;
- testes automatizados e validação do pacote.

## O que não está fingindo estar pronto

- inteligência geral ou consciência real;
- milhares de agentes em execução;
- aprendizado autônomo de código;
- microfone contínuo;
- controle de luz, portão, câmera ou sistema operacional;
- conexão com Grok, OpenRouter ou qualquer API externa;
- vetorização/RAG semântico;
- Docker, celular ou ponte remota.

Esses itens estão organizados no plano por fases e só devem entrar quando a fase anterior estiver comprovada.

## Arquivos principais

| Arquivo | Função |
|---|---|
| `01-VISAO-AMIGO-CASA-E-ORIGEM.md` | Visão original preservada |
| `SKILL.md` | Técnica da Lupa canônica e obrigatória |
| `docs/00-COMECE-AQUI.md` | Guia leigo e operacional |
| `docs/02-ARQUITETURA-VALIDADA.md` | Arquitetura corrigida pela Lupa |
| `docs/03-PLANO-IDEAL-POR-FASES.md` | Ordem segura de evolução |
| `docs/07-REVISAO-TECNICA-DA-LUPA.md` | Dupla revisão aplicada ao próprio pacote |
| `hermes/main.py` | Entrada do runtime local |
| `scripts/validar_pacote.py` | Verificação de estrutura, JSON, código e manifestos |
| `tests/` | Provas automatizadas do MVP |

## Regra local

Ler antes de alterar. Preservar o que funciona. Corrigir o mínimo. Provar. Registrar somente o aprendizado útil. Nenhuma ação externa ou destrutiva sem autorização explícita.


---

# REFERENCIA - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-realtime-viewer\references\cloud-assets\README.md
**SHA:** 8a579cb05193cc8c
**Timestamp:** 2026-08-26T18:39:41.198175
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Run:

### Ouro Bruto (primeiros 5000 chars)
```
# Cloud Assets

## Triggers

Use this skill for requests mentioning S3 assets, MinIO, cloud assets, buckets,
remote USD files, `ovstorage`, asset caches, object storage, asset catalogs,
thumbnail grids, or S3 browsing.

ovrtx requires local filesystem paths. Cloud stages must be synced to a local cache that preserves relative directory structure for textures, materials, sublayers, and referenced USD files.

## Architecture

```text
Browser -> ov_web_viewer_server
  -> StorageManager
  -> ovstorage S3 client
  -> S3/MinIO bucket samples_data/
  -> local cache /tmp/ov-stage-cache/samples_data/
  -> renderer.open_usd(local_path) or open_usd_from_string(inline root)
```

The manager connects to S3, syncs the full tree on first load, validates cache by size on later loads, and resolves requested filenames to local cached paths.

## MinIO Setup

```bash
curl -sSL https://dl.min.io/server/minio/release/linux-amd64/minio -o /tmp/minio && chmod +x /tmp/minio
curl -sSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /tmp/mc && chmod +x /tmp/mc
mkdir -p /tmp/minio-data
MINIO_ROOT_USER=minioadmin MINIO_ROOT_PASSWORD=minioadmin /tmp/minio server /tmp/minio-data --address :9000 --console-address :9001 &
/tmp/mc alias set local http://localhost:9000 minioadmin minioadmin
/tmp/mc mb local/ov-viewer-samples
/tmp/mc cp --recursive samples/samples_data/ local/ov-viewer-samples/samples_data/
```

## Dependencies

```bash
pip install ovstorage
pip install "boto3>=1.34"  # optional for generated direct-S3 helpers
```

Use `ovstorage` for the primary authenticated object-storage path. Generate the
viewer-local `StorageManager` wrapper in the app server.

## Config

```python
@dataclass(frozen=True)
class StorageConfig:
    enabled: bool = False
    bucket_url: str = "s3://ov-viewer-samples"
    endpoint_url: str = "http://localhost:9000"
    region: str = "us-east-1"
    addressing_style: str = "path"  # MinIO uses path; AWS often uses virtual
    cache_dir: str = "/tmp/ov-stage-cache"
    prefix: str = "samples_data"

    @classmethod
    def from_env(cls):
        return cls(
            enabled=os.environ.get("OVSTORAGE_ENABLED", "0") == "1",
            bucket_url=os.environ.get("OVSTORAGE_BUCKET_URL", "s3://ov-viewer-samples"),
            endpoint_url=os.environ.get("OVSTORAGE_ENDPOINT_URL", "http://localhost:9000"),
            region=os.environ.get("OVSTORAGE_REGION", "us-east-1"),
            addressing_style=os.environ.get("OVSTORAGE_ADDRESSING", "path"),
            cache_dir=os.environ.get("OVSTORAGE_CACHE_DIR", "/tmp/ov-stage-cache"),
            prefix=os.environ.get("OVSTORAGE_PREFIX", "samples_data"),
        )
```

## Manager Behaviors

```python
class StorageManager:
    def __init__(self, config):
        self.config = config
        self.enabled = config.enabled
        if self.enabled:
            import ovstorage
            self._client = ovstorage.open(config.bucket_url, config=ovstorage.Config(
                s3_endpoint_url=config.endpoint_url,
                s3_region=config.region,
                s3_addressing_style=config.addressing_style,
            ))

    def sync_all(self) -> bool:
        entries = self._client.walk(f"{self.config.prefix}/", max_depth=10)
        files = [e for e in entries if e.kind.value == "file"]
        for entry in files:
            data = self._client.read(entry.relative_path)
            dest = Path(self.config.cache_dir) / entry.relative_path
            if dest.exists() and dest.stat().st_size == len(data):
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
        return True

    def resolve_or_passthrough(self, path: str) -> str:
        if not self.enabled:
            return path
        self.sync_all()
        return self.resolve_stage(os.path.basename(path))
```

## Server Integration

- Add sibling imports for `storage_config` and `storage_manager`.
- If using dynamic `_import_sibling`, register `sys.modules[name] = mod` before `exec_module`; Python dataclasses need `__module__` resolvable.
- Initialize `StorageManager(StorageConfig.from_env())` in the server.
- In `_load_stage()`, first line should resolve: `url = self._storage.resolve_or_passthrough(url)`.
- Add `--storage` CLI flag and set `OVSTORAGE_ENABLED=1` when present.

## Environment

| Variable | Default |
|---|---|
| `OVSTORAGE_ENABLED` | `0` |
| `OVSTORAGE_BUCKET_URL` | `s3://ov-viewer-samples` |
| `OVSTORAGE_ENDPOINT_URL` | `http://localhost:9000` |
| `OVSTORAGE_REGION` | `us-east-1` |
| `OVSTORAGE_ADDRESSING` | `path` |
| `OVSTORAGE_CACHE_DIR` | `/tmp/ov-stage-cache` |
| `OVSTORAGE_PREFIX` | `samples_data` |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | credentials |

Run:

```bash
AWS_ACCESS_KEY_ID=minioadmin AWS_SECRET_ACCESS_KEY=minioadmin python3 server/ov_web_viewer_server.py --storage --port 49100
```

Expected logs include enabled bucket, sync start, sync counts, and loading from `/tmp/ov-stage-cache/...`.

##
```

---

# REFERENCIA - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-realtime-viewer\references\headless-shm-cli\README.md
**SHA:** ea8ea19d11bc7b3e
**Timestamp:** 2026-08-26T18:39:44.038426
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = promisify(execFile);

### Ouro Bruto (primeiros 5000 chars)
```
# Headless SHM CLI

## Triggers

Use this skill for headless CLI, SHM automation, `ovusd-shm`, viewer
automation, scripted interaction, CLI testing, non-interactive viewer,
screenshot capture, automated scene validation, scripted pick/select sequences,
or programmatic stage tree inspection.

Use this with an existing OVRTX server that exposes the ovstream shared-memory
transport. The CLI is a local automation client: it does not render USD, host a
UI, or replace the viewer server. It attaches to the named SHM stream, reads
frames, sends input and JSON viewer messages, and exits with deterministic
stdout/stderr behavior suitable for scripts and CI jobs.

## Purpose

Build a command-line client for automation, testing, CI pipelines, and scripted
interactions with a running OVRTX viewer server through ovstream SHM. Typical
uses include:

- capture a rendered frame as PNG, JPEG, or raw BGRA/RGBA bytes
- verify stream health and frame dimensions
- inspect the USD stage hierarchy and selected prim properties
- run scripted camera drags and pick/select workflows
- switch AOVs for validation frames
- pipe raw frames into video encoders or image-diff tools

## When To Use This

Choose the headless SHM CLI when:

- an automated test needs to drive a local viewer without opening Electron,
  Tauri, ovui, or a browser
- CI needs smoke tests against an OVRTX server with `--shm` enabled
- screenshots or raw frames must be captured from the same renderer path as the
  desktop viewer
- scene validation needs hierarchy, property, AOV, selection, or pick checks
- scripted interactions should reproduce user workflows such as click, drag,
  select, inspect, and capture
- Playwright or another e2e harness needs a stable backend for renderer state

Do not use this as a remote browser streaming client. For WebRTC browser
delivery, use `streaming-server`, `streaming-client`, `streaming-messages`, and
`streaming-lifecycle`. For an interactive local desktop UI, use
`electron-shm-viewer`, `tauri-local-viewer`, or `local-viewer`.

## Architecture

```text
Node.js CLI
  -> generated local SHM client module
  -> native Node addon built with node-gyp
  -> libovstream_shm_client.so
  -> libovstream.so
  -> POSIX shared memory frames and control messages
  -> Python OVRTX server started with --shm
```

The Python server remains the source of truth for USD, `ovrtx.Renderer`, stage
queries, camera state, picking, selection outlines, render settings, and AOVs.
The CLI is only a client:

- **Frames:** wait for the newest SHM frame and write PNG/JPEG/raw output.
- **Input:** send mouse move/button/wheel events to the server.
- **Viewer state:** send JSON `event_type`/`payload` requests over the SHM
  control channel and wait for matching responses.

Reference `electron-shm-viewer` for the server-side SHM lifecycle and
`streaming-messages` for message envelope names. Reference `object-selection`,
`stage-hierarchy`, `stage-attribute-reads`, and `aov-switching` when adding server
handlers that the CLI calls.

For ovstream SHM acquisition and runtime setup beyond this CLI pattern, read
`references/dependencies`. Keep the CLI client code local to the generated app.

## Prerequisites

- A Python OVRTX server is already running with SHM enabled, for example
  `--shm`.
- The CLI `--stream-name` matches the server `--shm-stream-name`.
- Node.js 18 or newer is available.
- `LD_LIBRARY_PATH` includes the directory containing `libovstream.so` and any
  dependent ovstream native libraries.
- A generated local SHM client module exists in the app workspace, for example
  `clients/shm-client/`.
- The native addon has been rebuilt for the active Node/Electron ABI with
  `node-gyp`.

Example environment:

```bash
export LD_LIBRARY_PATH=/path/to/.venv/lib/python3.10/site-packages/ovstream/lib:$LD_LIBRARY_PATH
export OV_SHM_STREAM_NAME=ovrtx-viewer
```

## Command Reference

Commands should be named after actions and produce script-friendly output.
Successful commands write the primary result to stdout unless `--output` is
provided. Diagnostics and errors go to stderr. Non-zero exit codes indicate
failure.

### `frame`

Capture one frame from SHM.

```bash
ovusd-shm frame --output frame.png
ovusd-shm frame --output frame.jpg --format jpeg
ovusd-shm frame --format raw > frame.bgra
```

Options:

- `--output <path>` writes to a file instead of stdout.
- `--format png|jpeg|raw` controls encoding. Infer `png` or `jpeg` from
  `--output` extension when possible.

Raw output is tightly packed frame data in the native SHM format unless the
package explicitly converts it. Include width, height, format, and pitch in
`info` output so raw consumers can decode it correctly.

### `info`

Print stream and latest-frame metadata as JSON.

```bash
ovusd-shm info
```

Include at least stream name, producer liveness, width, height, pixel format,
pitch bytes, and sequence number.

### `tree`

Query stage hierarchy rows from the server.

```bash
ovusd-shm tree --root /World
ovusd-shm t
```