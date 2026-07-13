
# Ligar os pontos: Painel Administrativo da CentralDark

## 🧠 Debate em 3 rodadas (Conselho interno)

### Rodada 1 — Crítica
**Voz A (a favor do Pivete):** Sem painel admin, cada nova funcionalidade (módulos, textos, botões, status "em processo") vira alteração manual no código. Isso quebra a promessa do Fluxo de Ouro: você comanda, a IA organiza. Hoje pra mudar "em processo" pra "disponível" precisa me chamar. Errado.

**Voz B (contra pressa):** Construir admin cedo demais, sem saber quais dados existem, gera tela bonita ligada em nada. Vira "cockpit decorativo" — o erro que já cometemos.

### Rodada 2 — Refinamento
As duas vozes convergem: **o problema não é "construir admin agora ou depois"**, é **construir admin acoplado aos dados reais que já existem**. Hoje já temos: módulos do Portal (WhatsApp/CRM/TelePainel/Financeiro), status de cada um, textos das landings, usuários (`user_roles`), logs. Isso já dá pra virar painel de verdade — sem inventar dado.

### Rodada 3 — Síntese (veredicto)
✅ **Você está certo, Pivete.** Sem área admin, cada peça nova aumenta a bagunça. **Mas** o admin precisa nascer pequeno e ligado no que já existe, não como cockpit gigante. Começa administrando **o Portal público** (o que o visitante vê) — porque é o ponto de entrada e o que você mais mexe hoje. Depois expande.

---

## 👶 Cockpit vs Área Administrativa — explicação leiga

Imagina um restaurante:

| | **Cockpit** | **Área Administrativa** |
|---|---|---|
| Analogia | Painel de vidro na cozinha mostrando os pedidos entrando em tempo real | Escritório do dono onde ele muda cardápio, preço, contrata garçom |
| Pra quem serve | Ver o que tá acontecendo AGORA | Configurar o que o cliente VÊ e como o sistema FUNCIONA |
| Você clica pra… | …olhar, acompanhar, monitorar | …alterar, criar, apagar, publicar |
| Exemplo CentralDark | Animações Matrix, terminais neon, Hermes mascote reagindo a logs | Trocar texto do card WhatsApp, mudar status pra "disponível", adicionar módulo novo, ver usuários |
| Se sumir amanhã | Você perde só a vitrine bonita | Você fica preso no código — precisa me chamar pra qualquer texto |

**Conclusão:** cockpit é **vitrine viva**, admin é **cofre de controle**. Um NÃO substitui o outro. O que você chamou de "landing" e testou no cockpit é justamente isso — uma vitrine. Não é essencial agora. O **admin sim é essencial**.

**Recomendação:** deixar o cockpit onde está (em `/admin/cockpit`, escondido, sem prioridade) e focar no admin de verdade.

---

## 🎯 Plano — Painel Administrativo CentralDark (Fase inicial)

### Escopo desta fase
Criar a **base do admin** — só o esqueleto + a primeira função útil (gerenciar módulos do Portal). Nada de tela decorativa.

### Estrutura de rotas

```text
/centraldark/admin              → dashboard (visão geral, contagem simples)
/centraldark/admin/modulos      → lista/edita módulos do Portal (nome, status, link)
/centraldark/admin/usuarios     → lista usuários + papéis (só leitura nesta fase)
```

Protegidas por `AdminRoute` (já existe). Layout esmeralda 3D-tátil (Sistema Oficial).

### O que você vai conseguir fazer no dia 1
1. Ver todos os módulos do Portal numa tabela.
2. Editar nome, ícone, status (`ativo` / `em processo`), link de cada módulo.
3. Salvar no banco (Lovable Cloud) — o Portal público lê de lá em vez de constante hardcoded.
4. Ver quem tem acesso admin.

### Arquivos que serão criados

```text
src/paginas/centraldark-admin/
├─ LayoutAdmin.tsx           (sidebar esmeralda + header)
├─ pages/
│   ├─ DashboardAdmin.tsx    (cards: nº módulos ativos, nº usuários)
│   ├─ ModulosAdmin.tsx      (CRUD dos módulos do Portal)
│   └─ UsuariosAdmin.tsx     (lista read-only)
└─ componentes/
    └─ SidebarAdmin.tsx

src/app/rotas/rotas-centraldark-admin.tsx    (registra as rotas acima)
```

### Backend (Lovable Cloud)
Uma tabela nova: `modulos_portal` (id, slug, nome, icone, href, status, ordem). Migration + RLS + GRANT + policies (admin lê/escreve, público só lê).

Portal público (`Portal.tsx`) passa a ler dessa tabela em vez de array hardcoded. **Fallback:** se a tabela estiver vazia, usa o array atual — zero risco de quebrar a home.

### O que NÃO entra nesta fase (fica pra depois)
- Editor de textos das landings individuais (WhatsApp/CRM/Financeiro).
- Gestão de cores/tema.
- Migração das seções do menu "Sistema" do TelePainel pra cá (TelePainel continua administrando o produto TelePainel; o admin CentralDark administra só o ecossistema).
- Mexer no cockpit — fica quieto onde tá.

### Ordem de execução
1. Migration + RLS da tabela `modulos_portal` (com seed dos módulos atuais).
2. Layout admin + sidebar esmeralda.
3. Página de módulos (CRUD).
4. Página de usuários (leitura).
5. Dashboard simples.
6. Portal público lendo do banco (com fallback).

### Como fica o mapa depois

```text
Portal público (/)              → o que o visitante vê
TelePainel (/telepainel/*)      → administra o PRODUTO TelePainel
CentralDark Admin (/centraldark/admin/*)  ← NOVO — administra o ECOSSISTEMA
Cockpit (/admin/cockpit)        → vitrine, sem prioridade
```

Cada um no seu lugar. Sem mistura.

---

**Agora:** plano na mesa, esperando seu OK → **Próximo:** se aprovar, executo em ordem, começando pela migration da tabela `modulos_portal`.
