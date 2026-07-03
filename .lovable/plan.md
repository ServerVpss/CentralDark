## Foco travado do Hermes — só 3 IDs

Ajustar mapa e rota fixa pra Hermes operar exclusivamente com:

```
🤖 @srver1bot               (bot central)
📢 -1003669176367           canal Status CentralDark  ← posta AQUI
👥 -5365750004              Grupo Evolução (recebe automático via canal linkado)
👤 1901426549               @segredounlocker (admin, privado)
```

Tudo o mais (TelePainel, @SEGREDOPUXADASBOT, supergrupos -1002205387838 e -1003994854326) sai do escopo do Hermes — continuam vivos, só não são alvo dele.

---

### Arquivos a mexer

**1) `HERMES/ROTAS-FIXAS/mapa-telegram.md`** — rescrever com bloco "FOCO ATUAL" no topo:
```
🎯 FOCO ATIVO DO HERMES
├─ Bot:    @srver1bot
├─ Canal:  -1003669176367  (posta AQUI — grupo linkado recebe sozinho)
├─ Grupo:  -5365750004     (espelho do canal, não postar direto)
└─ Admin:  1901426549      (card privado pós-ação)
```
Rebaixar TelePainel/supergrupos pra seção "Fora do escopo Hermes (referência)".

**2) `HERMES/ROTAS-FIXAS/notificacao-telegram.md`** — atualizar tabela:
- Canal Status `-1003669176367` = destino primário (post público)
- Grupo Evolução `-5365750004` = NÃO postar direto (recebe do canal automaticamente)
- Admin `1901426549` = card privado completo
- Remover/marcar como opcional qualquer outro destino

**3) `HERMES/AULAS/AULA-016-foco-3-ids-canal-espelha-grupo.md`** (novo) — ensina:
- Regra: post público sempre via canal → grupo linkado replica sozinho
- Nunca duplicar (post no canal + post no grupo = spam)
- Como validar que o link canal→grupo tá funcionando
- Comportamento se link quebrar (fallback: post direto no grupo com aviso)

**4) `HERMES/APRENDIZADOS/009-canal-linkado-espelha-grupo.md`** (novo) — registra a descoberta técnica: canal do Telegram com grupo de discussão vinculado espelha posts automaticamente, então basta 1 post.

---

### Fora do plano (não mexer agora)
- @SEGREDOPUXADASBOT continua rodando normal (é o TelePainel, outro contexto)
- Supergrupos -1002205387838 e -1003994854326 ficam listados como "referência", sem ação
- Não pedir pro Fabler puxar mais dados do HUB agora — foco reduzido dispensa

---

### Definition of Done
- [ ] `mapa-telegram.md` mostra "FOCO ATIVO" com os 3 IDs no topo
- [ ] `notificacao-telegram.md` deixa claro: canal é o destino, grupo é espelho automático
- [ ] AULA-016 criada explicando o padrão canal→grupo
- [ ] APR-009 registrado
- [ ] Commit padrão AULA-012: `🧠 Hermes/ROTAS-FIXAS: 016 foco travado 3 ids`