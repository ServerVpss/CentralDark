# 🏗️ ARQUITETURA — CentralDark

## Visão geral

```txt
Pivete
  ↓
IA conectada / MCP
  ↓
GitHub ServerVpss/CentralDark
  ↓
GitHub Actions / Webhook / run-once seguro
  ↓
VPS CentralDark
  ↓
PM2 / apps / módulos / logs
  ↓
Mega Painel + Obsidian Git + relatórios
```

---

## Camadas

| Camada | Papel | Observação |
|---|---|---|
| GitHub | Fonte da verdade | Código, docs, workflows, commits |
| MCP CentralDark | Ponte operacional | IA externa lê/escreve com regras e bloqueios |
| VPS | Execução e validação | Não é fonte permanente de código |
| Mega Painel | Estado vivo | Deve refletir andamento real |
| Obsidian | Consulta local | Puxa do GitHub via Obsidian Git |
| `docs/CONSCIENCIA/` | Memória oficial | Regras, aprendizados e decisões |

---

## Design system

O visual oficial é o sistema **Esmeralda**:

| Item | Padrão |
|---|---|
| Cor | Emerald elegante |
| Fontes | Geist + Geist Mono |
| UI | 3D tátil, cards arredondados, sombras controladas |
| Modo | Light como padrão, dark polido |
| Proibição | Não criar paleta, fonte ou sombra nova sem combinar |

---

## Fluxo de deploy seguro

```txt
Alteração no repo oficial
      ↓
commit na main ou PR se crítico
      ↓
VPS puxa por webhook/cron/pull controlado
      ↓
build/test/validação
      ↓
restart apenas do serviço afetado, se autorizado
      ↓
logs sanitizados
      ↓
relatório + painel
```

---

## Áreas sensíveis

```txt
apps/crm
Docker
WuzAPI
WhatsApp real
Caddy
Banco real
Domínio público / DNS
Gateway
Secrets / .env / sessões
```

Essas áreas exigem confirmação explícita antes de qualquer mudança operacional.

---

## Obsidian no desenho

O Obsidian não é destino direto da IA. Ele funciona como espelho local do repo:

```txt
IA commita Markdown no GitHub
      ↓
Obsidian Git puxa
      ↓
Pivete consulta localmente
```

Configuração segura:

```txt
Auto pull: 10 min
Auto push: 0 / desligado
Author name: SegredoiDev
Author email: segredounlock@users.noreply.github.com
```
