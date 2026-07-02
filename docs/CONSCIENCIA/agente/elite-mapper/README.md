# Elite Mapper — Agente de Mapeamento e Limpeza Cirúrgica

Agente Python que varre `/root/CentralDark`, classifica cada diretório e arquivo em 6 categorias, gera 7 relatórios Markdown profissionais e notifica o Telegram com o que realmente importa.

---

## Estrutura

```
elite-mapper/
├── elite_mapper.py              ← entrypoint CLI
├── config.py                    ← paths, thresholds, leitura de tokens
├── core/
│   ├── scanner.py               ← os.walk() recursivo com metadados
│   ├── classifier.py            ← engine de 6 categorias
│   └── reporter.py              ← gera os 7 relatórios .md
├── integrations/
│   ├── telegram_notifier.py     ← notifica início e fim (anti-spam)
│   └── telegram_menu.py        ← trechos para integrar no bot
├── relatorios/                  ← gerado ao executar
│   ├── 00_RESUMO_EXECUTIVO.md
│   ├── 01_MAPEAMENTO_ESTRUTURA.md
│   ├── 02_LIXO_PARA_DELETAR.md
│   ├── 03_LIXO_PARA_ARQUIVAR.md
│   ├── 04_DUPLICATAS_ENCONTRADAS.md
│   ├── 05_PROPOSTA_ESTRUTURA_NOVA.md
│   └── 06_ESTATISTICAS.md
└── README.md
```

---

## Como Executar

```bash
cd /root/CentralDark/docs/agente/elite-mapper

# Scan completo + relatórios + Telegram
python3 elite_mapper.py

# Só scan e relatórios (sem Telegram)
python3 elite_mapper.py --dry-run

# Silencioso (menos output)
python3 elite_mapper.py --dry-run --quiet

# Ver guia de integração com o bot Telegram
python3 elite_mapper.py --telegram-guide
```

---

## Agendamento via Cron

```bash
# Roda todo domingo às 03:00 e notifica Telegram
0 3 * * 0 cd /root/CentralDark/docs/agente/elite-mapper && python3 elite_mapper.py >> /var/log/centralldark/elite-mapper.log 2>&1
```

---

## Categorias de Classificação

| Categoria | Cor | Significado |
|-----------|-----|-------------|
| `PRODUCAO` | 🟢 | Código ativo, configs essenciais, secrets |
| `UTIL` | 🔵 | Scripts auxiliares, node_modules, runners |
| `LIXO_DELETAR` | 🔴 | Revisões antigas, logs velhos, temporários |
| `LIXO_ARQUIVAR` | 🟡 | Quarentena, builds órfãos — arquivar antes |
| `DUPLICADO` | 🟠 | Mesmo nome + tamanho em paths diferentes |
| `SUSPEITO` | ⚪ | Arquivos muito grandes ou sem extensão |

---

## Integração com o Bot Telegram

```bash
python3 elite_mapper.py --telegram-guide
```

Exibe os trechos exatos para colar em `handlers/commands.js` e `handlers/callbacks.js` do bot. Após isso, o comando `/mapper` estará disponível no Telegram com botões interativos.

---

## Como Estender

### Adicionar nova regra de classificação

Em `core/classifier.py`, método `_classify_dir()` ou `_classify_file()`:

```python
# Exemplo: marcar pasta "rascunhos/" como LIXO_ARQUIVAR
if top == "rascunhos":
    return ClassifiedDir(d, "LIXO_ARQUIVAR", "Rascunhos não publicados")
```

### Adicionar novo relatório

Em `core/reporter.py`:
1. Criar método `_meu_relatorio(self, clf) -> Path`
2. Salvar em `REPORTS_DIR / "07_MEU_RELATORIO.md"`
3. Chamar dentro de `generate_all()`

### Alterar thresholds

Em `config.py`:
```python
REVISAO_MAX_DAYS  = 7    # dias para revisão virar lixo
LOG_MAX_DAYS      = 30   # dias para log virar lixo
LIXO_SIZE_MIN_MB  = 100  # limiar de notificação Telegram
```

---

## Dependências

```bash
pip install requests   # para notificações Telegram
# tudo mais usa stdlib Python 3.8+
```
