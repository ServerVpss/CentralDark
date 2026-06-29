# 🧠 BRAIN — CentralDark

**Versão:** 1.0  
**Data:** 2026-06-28  
**Status:** base navegável do segundo cérebro

---

## Identidade

O **CENTRAL DARK** é o projeto principal. O repo oficial é:

```txt
ServerVpss/CentralDark
```

Quando uma IA receber termos como `projeto`, `repo`, `VPS`, `MCP`, `workflow`, `webhook`, `bot`, `produção`, `site` ou `CentralDark`, deve assumir este projeto como alvo, salvo se outro nome for citado explicitamente.

---

## Fonte da verdade

| Ordem | Fonte | Papel |
|---|---|---|
| 1 | GitHub `ServerVpss/CentralDark` | Código, docs, commits, workflows |
| 2 | Mega Painel `status.centralldark.com` | Estado vivo operacional |
| 3 | `docs/CONSCIENCIA/` | Regras, memória e decisões |
| 4 | `docs/PENDENCIAS.md` | Pendências oficiais |
| 5 | `docs/BRAIN/` | Camada navegável para Obsidian |

---

## Modo de trabalho do Pivete

| Regra | Como aplicar |
|---|---|
| PT-BR sempre | Respostas, relatórios, reviews e comentários em português |
| Direto e organizado | Veredito primeiro, sem parede de texto |
| Visual Vibe | emojis de status, tabelas e blocos copiáveis |
| Não inventar sucesso | Validar com commit, PR, status, workflow, logs sanitizados ou HTTP |
| Conteúdo copiável | Comandos, prompts e diagnósticos em bloco de código |
| Segurança | Nunca expor token, secret, `.env`, sessão, cookie ou connection string |

---

## Proibições sem confirmação

```txt
Docker
WuzAPI
WhatsApp reset/logout/sessão/QR real
Caddy
Banco real destrutivo
CRM
Domínio público / DNS
Secrets / credenciais / tokens
rm -rf / remoção definitiva
Gateway de produção
```

---

## Fluxo preferido

```txt
GitHub
  → workflow / webhook / run-once
  → VPS valida
  → logs sanitizados
  → relatório
  → Mega Painel
  → memória atualizada
```

Evitar comando manual direto na VPS quando houver caminho por GitHub + workflow.

---

## Prioridade atual

```txt
Organizar a VPS sem quebrar produção.
Não mexer no CRM agora.
Priorizar apps/bot e módulos vivos.
Consolidar QR temporário em /root/Multizap/api/whatsapp/qrcode/ quando essa fase voltar.
Depois validar chat ao vivo, contatos, fotos e grupos.
```

---

## Obsidian

O Obsidian roda no PC local do Pivete. A IA não acessa diretamente a pasta `E:\`. O caminho correto é a IA escrever no GitHub e o Obsidian Git puxar.

Configuração local recomendada:

```txt
Vault: E:\CentralDark\Obsidian\Brain
Repo: https://github.com/ServerVpss/CentralDark.git
Auto pull: 10 min
Auto push: desligado
Author name: SegredoiDev
Author email: segredounlock@users.noreply.github.com
```
