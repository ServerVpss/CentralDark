# 🗺️ Mapa da Situação — Onde a gente tá e o que falta

## ✅ O que já tá pronto e travado

**1. Conexão GitHub 🟢**
- Repo: `ServerVpss/CentralDark`
- Branch: `pivete/dev` (correto conforme a Constituição)
- Sync automático: toda edição aqui vai pro GitHub sozinha

**2. Faxina Visual — Fase 1 e 2 🟢**
- `src/shared` → `src/compartilhado`
- `src/preview/cockpit-hero` → `src/admin/cockpit`
- `src/apps/modulos/` → `src/funcionalidades/`
- `src/apps/web/` → `src/paginas/portal-publico/`
- Aliases configurados (nada quebrou)
- Build passando 🟢

**3. Cockpit Hermes 🟢**
- Rota `/admin/cockpit` funcionando
- 6 terminais coloridos (Hermes, Arsenal, Gateway, HUB, TelePainel, Enxame)
- Mascote Hermes animado na sidebar (11 poses)
- Motor de vida reagindo aos logs

**4. Backend/Infra 🟢**
- HUB Bot online (VPS PM2)
- Gateway `api.centralldark.com` com 140 modelos
- 29 aliases de modelos

---

## 🟡 O que falta (por prioridade)

### 🔥 Prioridade ALTA — Coisas que ainda incomodam

**A. Faxina Visual — Fase 3**
- Reescrever os imports antigos gradualmente (ainda usam `@/shared`, `@/apps`)
- Split real do `App.tsx` (hoje tá gigante)
- Popular `sistema-visual/` com tokens de design de verdade

**B. Separação TelePainel × CentralDark**
- A sidebar do TelePainel ainda mistura itens de infra CentralDark
- Precisa limpar pra cada um ter sua identidade

**C. Aliases duplicados no Gateway**
- Alguns modelos aparecem 2x com nomes diferentes
- Falta consolidar o `regras.json`

### 🟢 Prioridade MÉDIA — Melhorias

**D. Login/Autenticação do HUB**
- `LoginPage.tsx` criada mas falta polir fluxo bootstrap admin
- Trigger de auto-admin pra primeira conta

**E. Documentação visual do TelePainel**
- Manual bonito no tema Esmeralda dentro do painel

### 🔵 Prioridade BAIXA — Pode esperar

**F. Renomear `docs/` → `.consciencia`** (aguardando ordem)
**G. Reconstrução do MCP + hub** (plano futuro)

---

## 🎯 Minha recomendação: por onde começar

Como você tá meio perdido, sugiro atacar **UM problema por vez**, na ordem:

1. **PRIMEIRO** → Fase 3 da Faxina (reescrever imports + split do App.tsx)
   - Motivo: deixa o código organizado antes de qualquer feature nova
   - Risco: baixo (só reorganização)
   - Tempo: 1 sessão

2. **DEPOIS** → Separação TelePainel × CentralDark
   - Motivo: resolve a confusão visual que você reclamou
   - Risco: baixo (só sidebar/rotas)

3. **DEPOIS** → Aliases duplicados no Gateway
   - Motivo: melhora a experiência de quem usa a API
   - Atenção: mexe em código da VPS, precisa de commit + deploy

---

## 🤔 O que eu preciso de você

Só me responde **uma coisa**:

> "Vai na Fase 3 da Faxina" — OU — "Prefiro atacar outra prioridade primeiro" — OU — "Me explica melhor o item X"

E aí eu monto o plano **detalhado só daquela frente**, sem misturar tudo. Beleza, Pivete? 🟢
