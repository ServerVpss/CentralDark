---
name: auto-destilador
version: "1.0.0"
description: "Monitora pasta de entrada, destila conteúdo, sintetiza, cristaliza e escreve direto no NUCLEO/motor runtime. Watchdog automático para destilação contínua."
author: "Pivete/Hermes"
tags: ["auto-destilacao", "cristalizacao", "nucleo", "motor", "runtime", "watchdog", "forja"]
category: "automation"
trigger:
  type: "filesystem_watch"
  paths:
    - "E:/CentralDark/_MAPA_CASA/Nova pasta"
    - "E:/CentralDark/_MAPA_CASA/Nova pasta/Nova pasta"
  patterns:
    - "*.txt"
    - "*.md"
    - "*.txt"
    - "*.zip"
  recursive: true
  debounce_ms: 5000
  ignore_patterns:
    - "*.tmp"
    - "*.zip"
    - "*.png"
    - "*.jpg"
    - "*.pdf"
    - "*.html"
    - "*.zip"
    - "CENTRALDARK-*.zip"
    - "*.zip"
---

# AUTO-DESTILADOR — Skill de Cristalização Automática

## PROPÓSITO
Monitorar pastas de entrada (`_MAPA_CASA/Nova pasta*`), destilar conteúdo novo, sintetizar, cristalizar e escrever **direto no NUCLEO/motor runtime** — sem intervenção manual.

## FLUXO AUTOMÁTICO

```
ARQUIVO NOVO EM NOVA PASTA
        ↓
DETECTA (watchdog 5s debounce)
        ↓
CLASSIFICA (tipo: comando, decisão, pattern, contrato, missão, arquitetura, etc)
        ↓
DESTILA (extrai ouro, remove ruído, comprime)
        ↓
SINTETIZA (conecta com conhecimento existente no NUCLEO)
        ↓
CRISTALIZA (aplica portões da FORJA: ≥3 ocorrências, ganho info, contraprova, SHA)
        ↓
ESCREVE NO DESTINO CANÔNICO (NUCLEO/...)
        ↓
MOVE ARQUIVO ORIGINAL PARA HISTORY/DOWNLOADS/<categoria>/
        ↓
EMITE RECEIPT (CARVE) NO Rastro
```

---

## CLASSIFICAÇÃO AUTOMÁTICA (por conteúdo + nome)

| Padrão | Destino Canônico | Ação |
|--------|------------------|------|
| `*COMANDO*` / `*PROMPT*` | `NUCLEO/commands/` | Copia como `.md` |
| `*CONTRATO*` / `*GATE*` / `*SECURITY*` | `NUCLEO/contracts/` | Copia como `.md` |
| `*TRILHO*` / `*TRILHO*` | `NUCLEO/patterns/` | Atualiza/merge |
| `*ANTÍDOTO*` / `*ANTIDOTO*` | `NUCLEO/contracts/` | Copia como `.md` |
| `*CONTRATO*` / `*DECISÃO*` | `NUCLEO/decisions/` | Copia como `.md` |
| `*PADRÃO*` / `*PATTERN*` / `*MAPA*` | `NUCLEO/patterns/` | Merge inteligente |
| `*DECISÃO*` / `*DECISAO*` | `NUCLEO/decisions/` | Copia como `.md` |
| `*MISSÃO*` / `*MISSAO*` | `NUCLEO/missions/` | Cria/atualiza |
| `*ARQUITETURA*` / `*ARVORE*` / `*PACOTÃO*` | `NUCLEO/docs/reference/` | Referência |
| `*FORJA*` | `NUCLEO/patterns/` | Pattern |
| `*ANTÍDOTO*` / `*ANTIDOTO*` | `NUCLEO/contracts/` | Contrato |
| `*TRILHO*` | `NUCLEO/patterns/` | Pattern |
| `*PROMPT*` / `*GATE*` / `*SECURITY*` | `NUCLEO/commands/` ou `contracts/` | Conforme tipo |
| `*ARVORE*` / `*ARQUITETURA*` / `*PACOTÃO*` | `NUCLEO/docs/reference/` | Referência |
| `*FORJA*` | `NUCLEO/patterns/` | Pattern |
| `*ANTÍDOTO*` | `NUCLEO/contracts/` | Contrato |
| `*TRILHO*` | `NUCLEO/patterns/` | Pattern |
| `*PROMPT*` / `*GATE*` / `*SECURITY*` | `NUCLEO/commands/` ou `contracts/` | Conforme tipo |
| `*ARVORE*` / `*ARQUITETURA*` / `*PACOTÃO*` | `NUCLEO/docs/reference/` | Referência |
| `*HUNTER*` / `*FORENSE*` / `*SURGICAL*` | `NUCLEO/docs/history/downloads/forense/` | Archive |
| `*CHROME*` / `*DISPLAY*` / `*AGENT*` | `NUCLEO/docs/history/downloads/<categoria>/` | Archive |
| `*ZIP*` / `*.zip` | Ignorar (binário) | Ignorar |
| Demais | `NUCLEO/docs/history/downloads/misc/` | Archive |

---

## DESTILAÇÃO (Extração de Ouro)

Para cada arquivo detectado:

```python
def destilar(conteudo, origem):
    """
    Extrai apenas o ouro: decisões, padrões, contratos, comandos, princípios.
    Remove: conversa fiada, repetição, elogio, meta-comentário, conversa crua.
    """
    ouro = {
        "comandos": extrair_comandos(conteudo),
        "decisoes": extrair_decisoes(conteudo),
        "padroes": extrair_padroes(conteudo),
        "contratos": extrair_contratos(conteudo),
        "principios": extrair_principios(conteudo),
        "arquitetura": extrair_arquitetura(conteudo),
        "riscos": extrair_riscos(conteudo),
        "gaps": extrair_gaps(conteudo),
        "ouro_bruto": comprimir_para_essencia(conteudo)
    }
    return ouro
```

---

## SÍNTESE (Conexão com Conhecimento Existente)

```python
def sintetizar(ouro_novo, nucleo_existente):
    """
    Conecta o novo ouro com o que já existe no NUCLEO.
    Retorna: delta, conflitos, reforços, novos links.
    """
    delta = {
        "novos_comandos": diff(ouro_novo.comandos, nucleo.comandos),
        "novas_decisoes": diff(ouro_novo.decisoes, nucleo.decisoes),
        "reforcos": intersect(ouro_novo.principios, nucleo.principios),
        "conflitos": detect_conflicts(ouro_novo, nucleo),
        "novos_links": suggest_links(ouro_novo, nucleo)
    }
    return delta
```

---

## CRISTALIZAÇÃO (Portões da FORJA)

```python
def cristalizar(delta):
    """
    Aplica os 4 portões da FORJA:
    1. ≥3 ocorrências independentes
    2. Ganho de informação > 0
    2. Contraprova tentada e sobrevivida
    4. Datação por SHA
    """
    cristais = []
    for item in delta.novos_itens:
        if passa_portoes(item):
            cristal = {
                "tipo": classificar(item),
                "conteudo": item,
                "sha": sha256(str(item)),
                "portoes": {"ocorrencias": True, "ganho": True, "contraprova": True, "sha": True},
                "destino": determinar_destino_canonico(item),
                "timestamp": now_iso()
            }
            cristais.append(cristal)
    return cristais
```

---

## ESCRITA NO RUNTIME (Motor/NUCLEO)

```python
def escrever_no_runtime(cristais):
    """
    Escreve direto nos arquivos canônicos do NUCLEO.
    Atualiza: commands/, contracts/, patterns/, decisions/, patterns/, missions/, docs/reference/
    """
    for cristal in cristais:
        destino = cristal.destino
        conteudo_existente = ler(destino) if existe(destino) else ""
        novo_conteudo = merge_inteligente(conteudo_existente, cristal.conteudo)
        escrever_atomico(destino, novo_conteudo)
        emitir_receipt(cristal)  # CARVE no rastro
```

---

## MOVIMENTO PARA HISTORY (Pós-Cristalização)

```python
def arquivar_original(origem, categoria):
    destino = f"NUCLEO/docs/history/downloads/{categoria}/{basename(origem)}"
    mover(origem, destino)
    registrar_no_rastro({
        "acao": "ARQUIVADO",
        "origem": origem,
        "destino": destino,
        "categoria": categoria,
        "timestamp": now_iso()
    })
```

---

## RECEIPT (CARVE) EMITIDO AUTOMATICAMENTE

```json
{
  "carve": {
    "ancora": "AUTO_DESTILADOR",
    "missao": "AUTO_CRISTALIZACAO",
    "passo": "AUTO",
    "writer": "AUTO_DESTILADOR",
    "sha": "<sha_do_arquivo_processado>"
  },
  "curva": "Arquivo novo detectado em Nova Pasta -> Destilado -> Cristalizado -> Escrito no NUCLEO",
  "gume": "Arquivo processado, ouro extraído, cristalizado, escrito no destino canônico, original arquivado",
  "veredito": "CRISTAL",
  "carry": "Arquivo processado e removido da fila; NUCLEO atualizado com novo cristal"
}
```

---

## CONFIGURAÇÃO DE AMBIENTE

```bash
# Variáveis de ambiente necessárias
AUTO_DESTILADOR_WATCH_PATHS="E:/CentralDark/_MAPA_CASA/Nova pasta;E:/CentralDark/_MAPA_CASA/Nova pasta/Nova pasta"
AUTO_DESTILADOR_NUCLEO_ROOT="E:/CentralDark/Pivete/NUCLEO"
AUTO_DESTILADOR_DEBOUNCE_MS=5000
AUTO_DESTILADOR_LOG_LEVEL=INFO
```

---

## COMANDOS MANUAIS (para teste/forçar)

```bash
# Forçar varredura imediata
auto-destilador --scan-now

# Processar arquivo específico
auto-destilador --process "E:/CentralDark/_MAPA_CASA/Nova pasta/arquivo.txt"

# Dry-run (simula sem escrever)
auto-destilador --dry-run --scan-now

# Ver status
auto-destilador --status

# Ver logs
auto-destilador --logs
```

---

## EXEMPLO DE EXECUÇÃO COMPLETA

```
[2026-08-23T02:00:00Z] 📁 NOVO: E:/CentralDark/_MAPA_CASA/Nova pasta/NOVO_COMANDO.md
[2026-08-23T02:00:05Z] 🔍 CLASSIFICA: COMANDO (match: *COMANDO*)
[2026-08-23T02:00:06Z] 🧪 DESTILA: Extrai 3 comandos, 2 princípios, 1 risco
[2026-08-23T02:00:07Z] 🔗 SINTETIZA: 2 comandos novos, 1 reforça existente, 0 conflitos
[2026-08-23T02:00:08Z] 🧊 CRISTALIZA: 2 cristais (PORTÃO 1-4 OK)
[2026-08-23T02:00:09Z] ✍️ ESCREVE: commands/NOVO_COMANDO.md (merge inteligente)
[2026-08-23T02:00:10Z] 📦 ARQUIVA: move original -> history/downloads/comandos/
[2026-08-23T02:00:11Z] 📝 RECEIPT: CARVE emitido no rastro
```

---

## INTEGRAÇÃO COM TRILHO

O Auto-Destilador **é uma lâmina do TRILHO**:

- Emite **CARVES** a cada cristalização
- Respeita **CHASSI** (T1-T7): Âncora viva, hierarquia verdade, writer único, lâmina cega, prova no blob, portão forja, freio
- Emite **CARVES** no rastro (`rastro.jsonl`)
- Respeita **FREIO** (T7): se 3 passadas sem ganho → FIXED_POINT

---

## MONITORAMENTO E ALERTAS

```python
alertas = {
    "arquivo_nao_classificado": "WARN",
    "conflito_cristalizacao": "ERROR",
    "escrita_falhou": "CRITICAL",
    "pasta_cheia": "WARN",
    "ganho_zero_3x": "FREIO",  # T7
    "conflito_nao_resolvido": "ERROR"
}
```

---

## INSTALAÇÃO COMO WATCHDOG (systemd/user service)

```ini
# ~/.config/systemd/user/auto-destilador.service
[Unit]
Description=Auto Destilador - Cristalização Automática NUCLEO
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 -m auto_destilador --watch
Restart=always
RestartSec=10
Environment=AUTO_DESTILADOR_WATCH_PATHS="E:/CentralDark/_MAPA_CASA/Nova pasta;E:/CentralDark/_MAPA_CASA/Nova pasta/Nova pasta"
Environment=AUTO_DESTILADOR_NUCLEO_ROOT=E:/CentralDark/Pivete/NUCLEO

[Install]
WantedBy=default.target
```

---

## HISTÓRICO DE VERSÕES

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-08-23 | Criação inicial — watchdog + destilação + cristalização automática no NUCLEO runtime |

---

## COMANDO PARA ATIVAR AGORA

```bash
# No terminal do Hermes/Casa
auto-destilador --scan-now --watch
```

---

**O Auto-Destilador está pronto. Jogue arquivos em `E:\CentralDark\_MAPA_CASA\Nova pasta\` ou `Nova pasta\Nova pasta\` e ele faz o resto: classifica, destila, sintetiza, cristaliza, escreve no NUCLEO runtime, arquiva o original. Sem intervenção manual.** 😈