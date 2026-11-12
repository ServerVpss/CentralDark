---
title: "22 PADRAO STATUS VISUAL"
date: 2026-07-02
tags: ["consciencia", "padrao", "visual", "status", "ias"]
updated: 2026-07-02
---

# 🎨 PADRÃO STATUS VISUAL — Sincronia 4-Point

> **Complementa** `21-PADRAO-APRESENTACAO.md`. Este é um modelo visual **opcional** para painéis e relatórios explicitamente solicitados. Perguntas como "status", "situação", "como tá" ou "onde estamos" recebem primeiro resposta natural e direta; não obrigam todas as IAs a montar um card.

## 🧱 Template de painel (uso opcional)

```
🟢 **Status Geral — <Contexto>**

┌──────────────────────────────────────────────┐
│  🎯 SINCRONIA 4-POINT ─────────── 🟢/🟡/🔴   │
├──────────────────────────────────────────────┤
│  🖥️  VPS PM2 ............ 🟢 X/Y online      │
│  📦 GitHub ↔ VPS ........ 🟢 main sync       │
│  🧠 Cérebro Vivo ........ 🟢 intacto         │
│  🔐 Secrets/Proxy ....... 🟢 limpos          │
├──────────────────────────────────────────────┤
│  📝 <SEÇÃO CONTEXTUAL>                       │
│  ...                                         │
├──────────────────────────────────────────────┤
│  📋 PENDÊNCIAS ABERTAS (N)                   │
│  #XX Título curto                            │
└──────────────────────────────────────────────┘

**Só falta:** <1 frase clara>
**Próxima ação:** <o mais barato que resolve 100%>
```

## 🚦 Convenção de status
- 🟢 = OK / operando / sincronizado
- 🟡 = atenção / validar / em progresso
- 🔴 = quebrado / bloqueado / crítico
- ⚠️ = precisa autorização humana
- ✅ = concluído nesta sessão

## 📏 Regras
1. **Quando usar o card**, abrir com estado comprovado; sem inventar cor ou status.
2. Card monospace com bordas `┌─├─└`. Nada de tabela markdown pra status.
3. Máximo 4 seções internas. Se passar, virar sub-card.
4. Fechar com "Só falta" + "Próxima ação" — nunca deixar aberto sem próximo passo.
5. Se pergunta é trivial (1 linha), **NÃO** usar card. Card só quando há estado real pra mostrar.

## 🎯 Quando usar
- Quando houver pedido explícito de painel, card visual ou relatório estruturado; "status" e "como tá" sozinhos não obrigam o card.
- Ao concluir tarefa grande (relatório final)
- Ao retomar sessão (reload)

## 🚫 Quando NÃO usar
- Pergunta simples ("qual comando?", "onde fica X?")
- Confirmação de 1 ação ("commitei", "deploy ok")

---

## Conexões Rápidas
- [[21-PADRAO-APRESENTACAO]] — camada visual base
- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[CONSCIENCIA]] — documento mestre
