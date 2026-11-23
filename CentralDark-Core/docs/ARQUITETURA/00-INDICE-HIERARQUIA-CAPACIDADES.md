# ÍNDICE — Nova Hierarquia + Capacidades + API

**Status:** [ATUALIZADO 2026-10-14]  
**Referência Completa:** Documentação técnica refatorada para Instinto Superior como corpo primário

---

## 🗂️ Estrutura Documentacional

### Nível 1: Fundações

1. **HIERARQUIA.md** — Três camadas semânticas
   - Instinto Superior = Corpo (primário)
   - SOL = Inteligência Raciocadora (secundária)
   - HERMES = Executor Mecânico (terciária)
   - REALIDADE = Juiz (final)

2. **ARQUITETURA-CAPACIDADES.md** — Como apps/ se organiza
   - Vertical Slice Architecture
   - Domain-Oriented API Design
   - Modular Monolith como disciplina
   - Inventário de capacidades por módulo

3. **API-ROTAS-PUBLICAS.md** — Catálogo de endpoints + proteção
   - Camadas de proteção (auth, rate-limit, assinatura)
   - Catálogo de rotas WhatsApp
   - Futuras capacidades (observação, memória, grafo)
   - Governança de rota

### Nível 2: Referências Existentes (a reconciliar)

| Documento | Atualizações Necessárias | Situação |
|-----------|-------------------------|----------|
| CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md | Adicionar referência a HIERARQUIA.md | 🟡 CANDIDATO |
| CENTRALDARK-OMNI-ROUTER.md | Descrever como SOL coordena via CAPABILITY_CONTRACT | 🟡 CANDIDATO |
| CENTRALDARK-LIVE-EXECUTION-FABRIC.md | Integrar com One Heart + Instinto Superior | 🟡 CANDIDATO |
| BOT-SERVER-CENTRAL.md | Mapear rotas para API-ROTAS-PUBLICAS.md | 🟡 CANDIDATO |
| CENTRALDARK-DETERMINISTIC-FAST-PATH.md | Reconciliar com HIERARQUIA + fixed-point | 🟡 CANDIDATO |

### Nível 3: Relacionados (não alterar por enquanto)

- **CENTRALDARK-INSTINTO-SUPERIOR-OS/CENTRALDARK-MATRIZ-BIDIRECIONAL-GOLDEN-CAPSULE.md** — Blueprint original
- **CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md** — Lógica de roteamento
- **docs/DOMINIOS/API-CENTRALDARK.md** — Política de domínio público

---

## 🎯 Leitura Recomendada por Persona

### Sou SOL (Raciocínio / Diagnóstico)

**Leia nesta ordem:**

1. HIERARQUIA.md → entender que você não é corpo
2. ARQUITETURA-CAPACIDADES.md → mapear owners semânticos
3. API-ROTAS-PUBLICAS.md → validar contratos

**Foco:** Reconciliação, arquitetura, contraprova

---

### Sou HERMES (Execução / Terminal)

**Leia nesta ordem:**

1. HIERARQUIA.md → entender cadeia de comando
2. ARQUITETURA-CAPACIDADES.md → onde fazer mudanças
3. API-ROTAS-PUBLICAS.md → como testar

**Foco:** Implementação, validação, receipts

---

### Sou Instinto Superior (Observador Local)

**Leia nesta ordem:**

1. HIERARQUIA.md → suas responsabilidades
2. ARQUITETURA-CAPACIDADES.md → capacidades que você publica
3. API-ROTAS-PUBLICAS.md → como consumidores acessam você

**Foco:** Estado vivo, One Heart, observação, publicação

---

### Sou consumidor externo (cliente da API)

**Leia nesta ordem:**

1. API-ROTAS-PUBLICAS.md → catálogo de rotas
2. (Se precisar entender internals) ARQUITETURA-CAPACIDADES.md
3. (Se precisar reconciliar com cliente interno) HIERARQUIA.md

**Foco:** Rotas, autenticação, rate-limit, contratos

---

## 🔄 Sincronismo 4-Point Atualizado

```text
LOVABLE (editor + preview)
   ↓ sync bidirecional
GITHUB (repositório, fonte da verdade)
   ↓ deploy
VPS (runtime, PM2, microsserviços)
   ↓ observação
CÉREBRO VIVO (docs/CONSCIENCIA/ + Obsidian + Grafo)
   ↓ raciocínio + memória
INSTINTO_SUPERIOR (estado observável local)
   ↓ publicação
API_ROTAS_PUBLICAS (capacidades medidas)
   ↓ contrato
CONSUMIDOR_AUTORIZADO (cliente)
   ↓ efeito
REALIDADE (juiz)
```

---

## 📊 Mapa de Propriedade

### Instinto Superior (apps/instinto-superior/)

| Arquivo | Responsabilidade |
|---------|------------------|
| src/services/one-heart-manager.ts | Estado único |
| src/services/capability-contract-router.ts | Roteamento de capacidades |
| src/mcp/capability-publisher.ts | Publicação de capacidades |
| src/memory/memory-vault.ts | Acúmulo de memória |
| src/components/central/ObservabilidadeCentralDark.tsx | Observador UI |

### bot-server (apps/bot-server/)

| Arquivo | Responsabilidade |
|---------|------------------|
| src/api/health.ts | GET /health |
| src/gateways/whatsapp/webhook.ts | POST /v1/whatsapp/webhooks/wuzapi |
| src/api/sessions.ts | GET /v1/whatsapp/sessions/status |
| src/api/contacts.ts | GET /v1/whatsapp/contacts/* |

### elite-gateway (apps/modulos/elite-gateway/)

| Arquivo | Responsabilidade |
|---------|------------------|
| scripts/centraldark_omni_router.py | Roteador de capacidades |
| src/gateway/mcp-loader.ts | Carregador de MCP externo |

---

## 🛡️ Invariantes Invioláveis

```
ONE_SYSTEM_ONLY=true
INSTINTO_SUPERIOR_IS_CORPO=true
SOL_IS_NOT_CORPO=true
HERMES_IS_NOT_CORPO=true
ONE_HEART_ONLY=true
ONE_OWNER_PER_CAPABILITY=true
CAPABILITY_BEFORE_MODEL=true
REALIDADE_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
WEBHOOK_RECEIVED != AUTOMATIC_ACTION=true
AUTHENTICATION_REQUIRED=true
RATE_LIMIT_ENFORCED=true
```

---

## ✅ Checklist de Reconciliação Pré-PR

- [ ] HIERARQUIA.md lido por SOL, HERMES, Instinto Superior?
- [ ] ARQUITETURA-CAPACIDADES.md cobre todos os apps/ principais?
- [ ] API-ROTAS-PUBLICAS.md lista todas as rotas WhatsApp?
- [ ] Documentos antigos linkam para novos?
- [ ] Nenhum invariante foi violado?
- [ ] One Heart está documentado?
- [ ] Contratos de MCP estão explícitos?
- [ ] Consumidores foram mapeados?
- [ ] Testes (positivo + negativo) passam?

---

## 📚 Próximas Atualizações Previstas

1. **Autenticação.md** — Políticas de auth, OAuth2, mTLS
2. **Rate-Limit-Politica.md** — Configurações por cliente/rota
3. **Observacao-e-Sinais.md** — SSE, WebSocket, telemetria
4. **Reconciliacao-Modulos.md** — Checklist de estado vivo por módulo

---

## 🔗 Links Internos

- [HIERARQUIA.md](./HIERARQUIA.md) — Três camadas
- [ARQUITETURA-CAPACIDADES.md](./ARQUITETURA-CAPACIDADES.md) — Organização de apps/
- [API-ROTAS-PUBLICAS.md](./API-ROTAS-PUBLICAS.md) — Catálogo de endpoints

---

## 📝 Changelog

**2026-10-14**

- ✅ Criado HIERARQUIA.md — Instinto Superior como corpo primário
- ✅ Criado ARQUITETURA-CAPACIDADES.md — Vertical Slice + Domain-Oriented
- ✅ Criado API-ROTAS-PUBLICAS.md — Catálogo + proteção
- ✅ Criado 00-INDICE-HIERARQUIA-CAPACIDADES.md — Este arquivo

**Próximo:** Reconciliar documentos antigos com novos arquivos

---

**[ATUALIZADO 2026-10-14]**

**Responsável:** Agente CentralDark — Missão: Atualizar documentação técnica refletindo nova hierarquia

**Pronto para:** PR + merge em main
