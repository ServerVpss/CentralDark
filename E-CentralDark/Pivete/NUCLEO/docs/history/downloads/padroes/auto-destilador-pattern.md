# Auto-Destilador Pattern — Watchdog + Cristalização Automática

## Descoberta (2026-08-23)

Sistema autônomo que monitora pastas de entrada (`E:\CentralDark\_MAPA_CASA\Nova pasta*`), destila conteúdo, sintetiza, cristaliza e escreve **direto no NUCLEO/motor runtime** sem intervenção manual.

**Hook Kanban Ativo (2026-08-23):** Cada cristal gerado cria card automático no Kanban via BFF API (`POST /api/kanban/tasks`).

## Fluxo Completo Validado (3/3 testes PASS + Hook Kanban)

```
ARQUIVO NOVO EM PASTA MONITORADA
       ↓ (≤5s debounce)
DETECTA (watchdog filesystem)
       ↓
CLASSIFICA (conteúdo semântico, não só nome)
       ↓
DESTILA (extrai ouro: comandos, decisões, padrões, contratos, princípios, riscos, gaps)
       ↓
CRISTALIZA (4 portões FORJA: ≥3 ocorrências, ganho info > 0, contraprova sobrevivida, SHA datado)
       ↓
ESCREVE (destino canônico correto: commands/, contracts/, decisions/, patterns/, missions/, docs/reference/)
       ↓
ARQUIVA (history/downloads/<categoria>/)
       ↓
EMITE CARVE (rastro.jsonl — veredito CRISTAL)
       ↓
🎯 CRIA CARD KANBAN AUTOMÁTICO (hook ativo)
```

## Classificação Automática (por conteúdo + nome)

| Padrão | Destino Canônico |
|--------|------------------|
| `*COMANDO*`, `*PROMPT*` | `NUCLEO/commands/` |
| `*CONTRATO*`, `*GATE*`, `*SECURITY*` | `NUCLEO/contracts/` |
| `*TRILHO*` | `NUCLEO/patterns/` |
| `*ANTÍDOTO*`, `*ANTIDOTO*` | `NUCLEO/contracts/` |
| `*DECISÃO*`, `*DECISAO*` | `NUCLEO/decisions/` |
| `*PADRÃO*`, `*PATTERN*`, `*MAPA*` | `NUCLEO/patterns/` |
| `*MISSÃO*`, `*MISSAO*` | `NUCLEO/missions/` |
| `*ARQUITETURA*`, `*ARVORE*`, `*PACOTÃO*` | `NUCLEO/docs/reference/` |
| `*FORJA*` | `NUCLEO/patterns/` |
| `*FORENSE*`, `*CHROME*`, `*AGENTE*` | `NUCLEO/docs/history/downloads/<categoria>/` |

## Tipos de Arquivo Suportados

| Extensão | Handler |
|----------|---------|
| `.txt`, `.md` | Texto direto |
| `.zip` | Extrai e processa cada arquivo interno (sync) |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` | Metadados EXIF + classificação |
| `.pdf` | Extração de texto (pymupdf/pdfplumber/PyPDF2) |

## Watchdog Ativo (2026-08-23)

| Item | Valor |
|--------|-------|
| Processo | `proc_12f7635e18e7` (PID 7948) |
| Debounce | 5s |
| Pastas | `E:\CentralDark\_MAPA_CASA\Nova pasta*` |
| Hook Kanban | ✅ ATIVO |
| Tipos suportados | TXT, MD, ZIP, PNG, JPG, JPEG, PDF, WEBP, GIF |

## ZIP Handler Fix (2026-08-23)

**Problema:** Arquivos extraídos de ZIP eram processados com debounce, causando race condition (pasta de extração removida antes do processamento).

**Fix:** `handle_zip` agora:
1. Extrai arquivos para diretório temporário
2. Arquiva o ZIP original (libera handle)
3. Processa cada arquivo extraído **sincronamente** via `process_file_sync` (bypass debounce)
4. Limpa diretório temporário

## Bug Corrigido (Path de Escrita)

```python
# ANTES (errado) - escrevia na raiz do NUCLEO
os.makedirs(os.path.dirname(destino_abs), exist_ok=True)
filepath = os.path.join(os.path.dirname(destino_abs), base_name)

# DEPOIS (correto) - escreve na subpasta canônica
os.makedirs(destino_abs, exist_ok=True)
filepath = os.path.join(destino_abs, base_name)
```

## CARVE Emitido Automaticamente no `rastro.jsonl`

```json
{
  "carve": {
    "ancora": "AUTO_DESTILADOR",
    "missao": "AUTO_CRISTALIZACAO",
    "passo": "AUTO",
    "writer": "AUTO_DESTILADOR",
    "sha": "<sha_do_arquivo>"
  },
  "curva": "Arquivo X -> Destilado -> Cristalizado (TIPO) -> destino",
  "gume": "Arquivo processado, ouro extraido, cristalizado, escrito no destino canonico, original arquivado",
  "veredito": "CRISTAL",
  "carry": "Cristal TIPO adicionado ao NUCLEO; arquivo original arquivado em history/downloads/ + Card Kanban",
  "timestamp": "2026-08-23T..."
}
```

## Hook Kanban Ativo (2026-08-23)

Cada cristal gerado cria card automático no Kanban via BFF API (`POST /api/kanban/tasks`).

```python
def criar_card_kanban(self, cristal, destino):
    """Cria card no Kanban via BFF API"""
    import urllib.request
    import json as json_lib
    # ... implementação completa no auto_destilador.py
```

**Teste confirmado:** Arquivo `TESTE_HOOK_KANBAN.txt` → Card `t_93972522` criado automaticamente no board `default` com status `todo`.

## Integração com TRILHO

O Auto-Destilador **é uma lâmina do TRILHO**:
- Emite **CARVES** a cada cristalização
- Respeita **CHASSI** (T1-T7): Âncora viva, hierarquia verdade, writer único, lâmina cega, prova no blob, portão forja, freio
- Emite **CARVES** no rastro (`rastro.jsonl`)
- Respeita **FREIO** (T7): se 3 passadas sem ganho → FIXED_POINT

## Watchdog Status (2026-08-23)

| Item | Valor |
|------|-------|
| Processo | `proc_12f7635e18e7` (PID 7948) |
| Debounce | 5s |
| Pastas | `E:\CentralDark\_MAPA_CASA\Nova pasta*` |
| Hook Kanban | ✅ ATIVO |
| Tipos suportados | TXT, MD, ZIP, PNG, JPG, JPEG, PDF, WEBP, GIF |

## Arquivos do Sistema

- Skill: `NUCLEO/skills/auto-destilador/SKILL.md`
- Código: `NUCLEO/skills/auto-destilador/auto_destilador.py`
- Watchdog ativo: `proc_12f7635e18e7` (PID 7948)
- Rastro: `NUCLEO/rastro/rastro.jsonl`
- Kanban: `http://127.0.0.1:8787` (aba Kanban)