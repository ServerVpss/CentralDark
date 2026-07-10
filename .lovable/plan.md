## 🟢 Modo Leitura Confirmado

Autorização recebida: **somente leitura**. Nenhuma escrita, deploy, migration, edit ou comando destrutivo até nova ordem.

### O que eu vou fazer quando você pedir algo:
- 👁️ **Ler** arquivos do repo, secrets já mapeados, VPS via tools safe (`vps_read_file_safe`, `vps_list_dir_safe`, `vps_tree_safe`, `vps_git_status`).
- 🔍 **Consultar** Supabase (SELECT), GitHub (read), logs, status de edges/PM2.
- 📊 **Analisar e relatar** — diagnóstico, dossiê, mapa, veredito.
- 💬 **Responder** dúvida, explicar, sugerir plano.

### O que eu NÃO vou fazer sem "PERMITO PIVETE":
- ❌ Editar/criar/deletar arquivo (local, repo ou VPS).
- ❌ Migration, deploy edge, restart PM2, push, merge.
- ❌ Rodar script que muda estado.
- ❌ Rotacionar/adicionar/apagar secret.
- ❌ Mandar mensagem no Telegram (nem card).

Manda a próxima missão de leitura que eu executo. 🟢
