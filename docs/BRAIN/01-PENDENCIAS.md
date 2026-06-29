# 📋 PENDÊNCIAS — Espelho navegável

**Fonte oficial:** `docs/PENDENCIAS.md`  
**Este arquivo:** resumo para navegação no Obsidian

---

## Pendências vivas principais

| Status | Item | Resumo | Como fechar |
|---|---|---|---|
| 🟡 | #1 Migração `centralldark.com` + `telepainel.centralldark.com` | Código pronto, falta executar na VPS e alinhar DNS/Caddy com autorização | DNS apontado, setup executado, Caddy aprovado, HTTP 200 validado |
| 🟡 | #3 Módulos bot-whatsapp, CRM e financeiro ainda são landing | Existem páginas bonitas, mas sem produto completo por trás | Definir escopo, modelar tabelas e implementar produto real |
| 🟢 | #4 Arquitetura CentralDark 2026 com Cloud/API pública | Expansão futura complexa; por enquanto GitHub + memória atendem | Reabrir só se a complexidade valer |
| 🟡 | #5 Revisão de migração de docs do legado | Há muitos docs do legado ainda em triagem | Revisar, migrar ou arquivar por categoria |

---

## Regras de pendência

```txt
Pendência global → docs/PENDENCIAS.md
Pendência local → PLANO.md da pasta
Problema novo → registrar com prioridade, sintoma e critério de fechamento
Tarefa concluída → marcar com data e evidência
```

---

## Atenções permanentes

| Alerta | Regra |
|---|---|
| 🔴 CRM | Não mexer agora sem confirmação |
| 🔴 Caddy / DNS | Sempre pedir confirmação antes |
| 🔴 Docker / WuzAPI / WhatsApp | Não tocar sem confirmação explícita |
| 🔐 Secrets | Nunca abrir, expor, copiar ou versionar |
| ✅ Logs | Sanitizar antes de mostrar ou salvar |

---

## Próxima consulta obrigatória

Antes de executar tarefa nova, consultar o arquivo oficial:

```txt
docs/PENDENCIAS.md
```
