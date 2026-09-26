# Session 2026-08-23 — Mapeamento e Cristalização da Pasta do Chefe

## Contexto
O usuário exigiu que o auto-destilador minerasse **TUDO** da pasta `PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE`, cristalizando o útil, descartando lixo, zero regressão, até fixed point.

## Mapeamento da Pasta do Chefe

### Estrutura Encontrada
```
E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\
├── .extracted_BENCHLAB-main.zip/          (extraído - React/TypeScript project)
├── .extracted_screenpipe-main.zip/        (extraído - Screenpipe project completo)
├── .extracted_TESTE_ZIP_*.zip/            (múltiplos zips de teste extraídos)
├── ATENDIMENTO/AUDIOS/                    (vazio)
├── Arquivos soltos:
│   ├── 55fd9c8f-*.png, 5bc8217d-*.png     (screenshots)
│   ├── APRENDA.pdf                        (documento)
│   ├── ATUALIZAÇAO DE PASTA GARIMPO.html  + _files/
│   ├── Cristalização oficial...jpg        (imagem)
│   ├── forja-de-cartas.html
│   ├── Gemini Chrome __ Comparativo...pdf
│   ├── MELHORIA GRANDE AVANÇO.html + _files/
│   ├── Navigational-Tracking Mitigations.html + _files/
│   ├── Screenpipe Activity reshapes CentralDark*.html + _files/ (4 versões)
│   ├── Screenshot_1.png
│   ├── SEGREDO.html
│   ├── CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823.zip
│   ├── TESTE_CHEFE.txt (criado para teste)
│   └── *.css, *.png de pastas extraídas
```

### Zips Identificados para Processamento
1. `screenpipe-main.zip` (41.7 MB) - Projeto Screenpipe completo (Tauri + Rust + TypeScript)
2. `BENCHLAB-main.zip` - Projeto Benchlab
3. Múltiplos zips de teste (`TESTE_ZIP_*.zip`)

### HTMLs de Análise Screenpipe (4 versões evolutivas)
- `Screenpipe Activity reshapes CentralDark integratio1n.html`
- `Screenpipe Activity reshapes CentralDark integration.html`
- `Screenpipe1 Activity reshapes CentralDark integration.html`
- `Screenpipe Activity reshapes CentralDark integratio1n.html` (v1)
- `MELHORIA GRANDE AVANÇO.html`
- `ATUALIZAÇAO DE PASTA GARIMPO.html`
- `Navigational-Tracking Mitigations.html`
- `forja-de-cartas.html`

## Fixes Implementados nesta Sessão

### 1. FileNotFoundError ao mover arquivos extraídos
**Problema**: `shutil.move()` falhava porque arquivo já foi movido/deletado por outro processo ou thread.
**Fix**: Verificar `os.path.exists()` antes de mover; usar `shutil.copy2()` + `os.remove()` como fallback; tratar erro graciosamente sem quebrar pipeline.

### 2. Race Condition em Múltiplas Threads
**Problema**: Múltiplas threads processando mesmo arquivo (on_created + on_modified).
**Fix**: `pending_files` com timestamp como chave única; early return se já processando.

### 3. Watch Path Expansion Dinâmico
**Problema**: Novas pastas do Chefe não monitoradas automaticamente.
**Fix**: Patch dinâmico em `WATCH_PATHS` + restart observer.

### 4. Watch Path Adicionado
Adicionado à `WATCH_PATHS`:
```python
WATCH_PATHS = [
    r"E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE",
    r"E:\CentralDark\_MAPA_CASA\Nova pasta",
    r"E:\CentralDark\_MAPA_CASA\Nova pasta\Nova pasta"
]
```

## Cristalização Realizada

### Arquivos Processados com Sucesso
- `TESTE_CHEFE.txt` → Card Kanban `t_58c52078` (running) + Cristal COMANDO
- Múltiplos arquivos `.css` de pastas extraídas → Cristal OUTRO + Cards Kanban

### Erros Tratados
- Arquivos `.png` já processados anteriormente → erro de lock tratado graciosamente
- Arquivos `.css` de pastas extraídas → cristalizados como OUTRO

## Próximos Passos para Cristalização Total

### Prioridade Alta
1. **Processar `screenpipe-main.zip` (41.7 MB)** - Projeto completo Screenpipe (Tauri + Rust + TypeScript) - contém arquitetura, componentes, e2e tests, docs
2. **Processar `BENCHLAB-main.zip`** - Projeto Benchlab
3. **Processar 4 HTMLs de análise Screenpipe** - Evolução da arquitetura CentralDark vs Screenpipe
4. **Processar `MELHORIA GRANDE AVANÇO.html`** - Documentação de avanços
5. **Processar `ATUALIZAÇAO DE PASTA GARIMPO.html`** - Metodologia de garimpo

### Prioridade Média
6. Processar PDFs: `APRENDA.pdf`, `Gemini Chrome __ Comparativo...pdf`
5. Processar `forja-de-cartas.html` - Metodologia de cristalização
6. Processar `Navigational-Tracking Mitigations.html` - Segurança

## Fixed Point Criteria
- [ ] Todos zips processados e arquivados
- [ ] Todos HTMLs de análise processados e cristalizados
- [ ] Todos PDFs processados
- [ ] Arquivos de lixo (screenshots soltos, duplicatas) movidos para `misc/`
- [ ] Auto-destilador rodando sem erros por 24h
- [ ] Zero CARVEs pendentes
- [ ] Kanban board limpo (apenas cards açãoveis)

## Comando para Verificar Progresso
```bash
# Verificar CARVEs recentes
tail -10 /e/CentralDark/Pivete/NUCLEO/rastro/rastro.jsonl

# Verificar cards Kanban da pasta do Chefe
curl -s "http://127.0.0.1:8787/api/kanban/board?board=default" | jq '.columns[].tasks[] | select(.title|contains("CHEFE") or contains("screenpipe") or contains("BENCHLAB"))'

# Verificar runtime state
cat /e/CentralDark/Pivete/NUCLEO/auto-destilador-state.json | jq '.processed_files | length'

# Verificar health
curl -s http://localhost:8788/health | jq '.proved'
```