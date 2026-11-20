---
title: "Checklist de Validação — Instinto Superior no CentralDark.exe"
date: 2026-10-15
status: "PREPARADO"
---

# ✅ Checklist de Validação — Instinto Superior Integrado

## 📦 Build Status

- [ ] **npm run build** ✅ SUCESSO (Remix compilou)
- [ ] **electron-builder** ⏳ EM PROGRESSO
- [ ] **Novo executável criado** (aguardando)
- [ ] **Assinatura de código** (verificar se necessário)
- [ ] **Cópia para Program Files** (pós-build)

---

## 🎯 Verificações de Inicialização

Quando o novo CentralDark.exe for instalado:

### 1️⃣ Abertura da Aplicação
- [ ] Duplo clique em `CentralDark.exe` abre a janela
- [ ] Nenhum erro de módulo ausente
- [ ] Sem travamento no splash screen

### 2️⃣ Instinto Superior Como Cockpit Principal
- [ ] **Sala de Controle** carrega como página inicial
- [ ] Dashboard mostra status dos 6 fixos:
  - [ ] Greg → Auditor
  - [ ] Geoff → Loop
  - [ ] Ian → Guardrails
  - [ ] Mesa → Growth
  - [ ] Dex → Deploy
  - [ ] Chefe de Gabinete → Operação
- [ ] Indicadores de status ("UNKNOWN" ou "CONNECTED")

### 3️⃣ Builder e Extensões
- [ ] Seção "Builder" está acessível
- [ ] Pode listar skills existentes
- [ ] Pode tentar adicionar uma nova skill (teste)
- [ ] Sem erro ao salvar/compilar

### 4️⃣ Agentes e Especialistas
- [ ] "Agentes" carrega lista
- [ ] Cada agente mostra status
- [ ] Pode invocar um agente (teste simples)

### 5️⃣ HUD / Observabilidade
- [ ] **HUD unificado** renderiza sem erro
- [ ] Mostra logs em tempo real
- [ ] Status do Hermes executor visível

### 6️⃣ Hermes Executor
- [ ] Hermes está respondendo (não travado)
- [ ] Pode executar comando simples (ex: `!TESTE`)
- [ ] Retorna resultado em tempo real

### 7️⃣ Magic Space (Experimentação)
- [ ] Espaço de teste acessível
- [ ] Pode criar experimento de teste
- [ ] Sandbox isolado (não afeta sistemas)

### 8️⃣ Reality Judge + Aprendizado
- [ ] Reality Judge valida resultados
- [ ] Aprendizados são registrados
- [ ] Memória persistente entre sessões

---

## 🔗 Conectividade

### Casa (Local Runtime)
- [ ] Detecta Hermes Desktop instalado
- [ ] Conecta via Tailscale/VPN se necessário
- [ ] Log mostra "Casa conectada"

### VPS (Runtime Central)
- [ ] PM2 está respondendo
- [ ] Serviços esperados rodando
- [ ] Conexão reverificada a cada 30s

### GitHub
- [ ] OAuth2 configurado (se necessário)
- [ ] Pode ler repositórios autorizados
- [ ] Pode criar/atualizar issues/PRs

---

## 🧪 Testes de Funcionalidade

### Teste 1: Execução Simples
```
Input: "!TESTE"
Expected: Resposta com timestamp e status
```

### Teste 2: Consulta com Prova
```
Input: "Qual é o SHA do commit atual de main?"
Expected: Retorna commit hash verificado
```

### Teste 3: Aprendizado
```
Input: "Memorize esta intenção: [texto]"
Expected: Intenção registrada; próxima sessão recupera
```

### Teste 4: Reality Judge
```
Input: "Isso é verdade?" (qualquer claim)
Expected: Retorna PASS/FAIL com evidência
```

---

## 🚨 Sinais de Alerta

Se qualquer um desses ocorrer, há problema:

- [ ] ❌ `createDataStream` não encontrado (deveria estar resolvido)
- [ ] ❌ Cockpit não carrega (UI totalmente branca/em branco)
- [ ] ❌ Hermes não responde (timeout em 5s)
- [ ] ❌ HUD mostra apenas "UNKNOWN" (sem conexão)
- [ ] ❌ Erro de permissão ao salvar skills
- [ ] ❌ VPS inacessível (vermelho em todos os serviços)

---

## 📊 Registros a Coletar

Se algum teste **falhar**, coletar:

1. **Screenshot** da UI mostrando erro
2. **Log completo** do console (F12 → Console)
3. **Status do Hermes** (Hermes Desktop → Logs)
4. **Saída do PM2** na VPS (se acessível)
5. **Timestamp exato** do erro

---

## ✅ Validação Final

Quando todos os testes passarem:

- [ ] Documentar versão do build (hash, data)
- [ ] Criar receita instalável (se apropriado)
- [ ] Comunicar ao CHEFE: "Instinto Superior operacional no CentralDark.exe"
- [ ] Fechar qualquer issue relacionada
- [ ] Registrar aprendizados em SOUL.md

---

## 🎯 Bloqueadores Conhecidos

(Atualizar conforme descobrir)

| Bloqueador | Status | Workaround |
|-----------|--------|-----------|
| HUD com múltiplas implementações | ⚠️ FERIDA | Verificar qual é consumida |
| Dois cockpits potencialmente conflitantes | ⚠️ FERIDA | Testar qual abre quando .exe inicia |
| PR #1804 status desconhecido | ❓ INVESTIGAR | Procurar na main se está mergeada |

---

## 📝 Notas

- Este checklist presume que **PR #1806 foi mergeada** em main ✅
- O novo build deve incluir **Instinto Superior como componente principal**
- Se houver falha, não implica que Instinto Superior está quebrado — pode ser versão anterior que não tinha integração

**Data Criação:** 2026-10-15 03:40 UTC-02  
**Versão:** 1.0  
**Status:** PRONTO PARA TESTAR  
