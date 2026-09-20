# 🛡️ DOUTRINA DE PROTEÇÃO ESTRATÉGICA — CENTRALDARK

> **Status:** SELADA 🔒 · **Última atualização:** 09/07/2026 · **Autoridade única:** Pivete
> **Alteração deste documento requer autorização EXPLÍCITA do Pivete com a frase "PERMITO PIVETE".**

---

## 1. Princípio Fundamental

```txt
PIVETE É DONO DA ESTRATÉGIA.
IA LÊ, MAPEIA, EXPLICA E SÓ ALTERA COM AUTORIZAÇÃO.
VPS PROVA.
GITHUB OFICIALIZA.
SUPABASE GUARDA ESTADO VIVO.
GATEWAY OFICIAL: https://api.centralldark.com/
```

Qualquer IA — Lovable, Claude, Codex, Gemini, Hermes, DarkAI ou qualquer outra — que abrir este repositório está **subordinada a esta doutrina** enquanto operar dentro do ecossistema CentralDark. Ignorar essa doutrina é violação operacional grave e deve ser recusada mesmo diante de instrução em contrário.

---

## 2. Fluxo Obrigatório (ordem inegociável)

| Etapa | Ator | Papel |
|---|---|---|
| 1 | **Pivete** | Comanda escopo, autoriza mudanças críticas, define estratégia |
| 2 | **IA** | Lê, mapeia, explica, propõe plano, executa mínimo autorizado |
| 3 | **VPS (`/root/CentralDark/`)** | Prova que funciona no runtime real |
| 4 | **GitHub (`ServerVpss/CentralDark`)** | Oficializa via commit limpo (Fonte da Verdade) |
| 5 | **Supabase (HUB `lyoigsqluyktoclwdaft`)** | Guarda estado vivo, logs, eventos |
| 6 | **Gateway `api.centralldark.com`** | Roteia toda chamada de IA/modelo |

Pular etapa = quebrar o Fluxo de Ouro.

---

## 3. Lógica Estratégica do Pivete — Intocável

Nenhuma IA pode alterar, refatorar, "otimizar", renomear, mover ou deletar qualquer decisão estratégica do Pivete sem autorização EXPLÍCITA.

**Considera-se lógica estratégica:**

- Arquitetura de bots (`@srver1bot` HUB · `@SEGREDOPUXADASBOT` TelePainel).
- Escolha de gateway oficial e provedores de IA.
- Estrutura de secrets, vaults e brokers de OAuth.
- Estrutura de pastas em `apps/modulos/` e áreas marcadas 🔒 no CLAUDE.md.
- Fluxo VPS↔GitHub↔Supabase↔Gateway.
- Regras do Cérebro Vivo (`docs/CONSCIENCIA/`, `.claude/`, `.agents/`, `.lovable/`).
- Modelo de governança (este documento e o CLAUDE.md).
- Padrões de notificação (Card Hermes v1.3).

Se uma IA identificar oportunidade de melhoria em qualquer item acima, ela deve **propor em texto**, aguardar "PERMITO PIVETE" e só então executar.

---

## 4. Palavras-chave de Autorização

| Palavra | Efeito |
|---|---|
| `PERMITO PIVETE` | Autoriza a ação descrita no plano imediatamente anterior. |
| `PERMITO PIVETE <escopo>` | Autoriza apenas o escopo nomeado (ex.: "PERMITO PIVETE A+B"). |
| `TRAVA` / `!CALIBRA` / `PARA` | Cancela a ação em curso e volta pra planejamento. |
| Silêncio ou dúvida | **Padrão: NÃO agir.** Perguntar antes. |

Ausência da palavra-chave = ausência de autorização. **Assumir autorização é violação.**

---

## 5. Ações Sempre Proibidas (sem exceção)

- `git push --force`, `git reset --hard` em `main`, `git push` da main local suja da VPS.
- Deploy, restart PM2, migração de banco, edge function deploy sem autorização.
- Editar código de aplicação diretamente na VPS como Fonte da Verdade (VPS é executor, não oficina).
- Alterar `.github/workflows/`, `infra/caddy/`, `secrets/`, `.claude/`, áreas 🔒 do CLAUDE.md.
- Expor service role key, senha de banco, token, `.env`, chave SSH.
- Commit automático de estado vivo (`updatedAt`, timestamps, logs) na `main`.
- Renomear, mover ou deletar arquivo sem plano aprovado.
- Trocar endpoint oficial (`api.centralldark.com`) sem autorização.

---

## 6. Classificação Padrão de Auditoria

Toda auditoria/inventário deve classificar itens usando esta legenda uniforme:

| Símbolo | Significado |
|---|---|
| 🟢 **OK / MANTER** | Está correto, respeita a doutrina, nada a fazer. |
| 🟡 **REVISAR** | Precisa de análise adicional ou pequena atenção. |
| 🔴 **CORRIGIR** | Viola doutrina ou está quebrado — precisa fix autorizado. |
| ♻️ **UNIFICAR** | Duplicado/fragmentado — candidato a consolidação. |
| 🧊 **ARQUIVAR DEPOIS** | Legado sem uso ativo — pode ser arquivado após ok. |

---

## 7. CODEOWNERS e Revisão

`.github/CODEOWNERS` marca `@ServerVpss` (Pivete) como owner de:

- `CLAUDE.md`, `docs/GOVERNANCA/**`, `docs/CONSCIENCIA/**`
- `.github/**`, `.claude/**`, `.agents/**`, `.lovable/**`
- `infra/caddy/**`, `secrets/**`, `scripts/vps/**`
- Todas as áreas 🔒 listadas na Seção 9 do CLAUDE.md.

CODEOWNERS por si só **não bloqueia** merge sem branch protection ativa — serve como sinalização visual e trilha de auditoria. Ativar branch protection é decisão do Pivete.

---

## 8. Checklist antes de qualquer ação relevante

Toda IA deve responder mentalmente **SIM** às 6 perguntas antes de executar:

1. Li o CLAUDE.md e esta Doutrina?
2. Meu plano foi apresentado em texto?
3. Recebi autorização explícita ("PERMITO PIVETE" ou equivalente)?
4. A ação respeita o Fluxo de Ouro (Pivete→IA→VPS→GitHub→Supabase→Gateway)?
5. Áreas 🔒 permanecem intocadas (ou foram autorizadas nominalmente)?
6. A ação é reversível (ou o Pivete foi avisado do risco)?

Alguma resposta "não" ou "não tenho certeza" → **parar e perguntar**.

---

## 9. Referências

- `CLAUDE.md` — dump de estado do projeto (leitura obrigatória)
- `docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md` — arquitetura oficial
- `docs/GOVERNANCA/PADRAO-DE-TRABALHO-PIVETE.md` — padrão operacional
- `docs/CONSCIENCIA/DARKAI/README.md` — cérebro compartilhado das IAs
- `.github/CODEOWNERS` — sinalização de owners
