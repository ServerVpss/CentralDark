# Contraprova e correção de recibos locais — Windows reboot / Cockpit 8080

**Data da sonda independente:** 2026-10-19 18:24:39 (-03:00) na Casa SEGREDO.
**Referência:** PR #1873, owner `apps/instinto-superior`, aviso proposto no setor de notificações existente.
**Regra:** `REPORTED != VERIFIED`; `NOTIFIED != PROVED`; `UNKNOWN != PASS`.

## Fontes locais preservadas (não publicadas integralmente)
- `K:\docs\PROVAS\PROVA-REINICIALIZACAO-WINDOWS-20261019.md` — existe localmente, 8.127 bytes, modificado em 19/10 17:37; **relatório declarativo com erros**.
- `K:\docs\PROVAS\SALA-CONTROLE-CARD-REBOOT.html` — existe localmente, 13.528 bytes, modificado em 19/10 17:38; card não é prova independente de funcionamento.
- `K:\EMERGENCIA\PROVA-COCKPIT-LIGADO-20261019.md` — existe localmente, 3.679 bytes, modificado em 19/10 17:52; relata Vite, 8080 e HTML, porém números sem readback independente.
- `K:\docs\PROVAS\AREA-NOTICIAS-REBOOT.json` — existe localmente, mas **não foi ingerido/publicado** no `notifications_log` oficial.
- `K:\docs\DELEGACAO\CENTRALDARK-DESKTOP-TOTAL-v2-INSTANCE.md` — existe localmente; seu próprio inventário marca subgoals A-E `NOT_STARTED`, Kanban parent e ACK de agentes pendentes.
- Não executar `git add EMERGENCIA/`, `git add docs/DELEGACAO/` ou `git push origin main` indiscriminadamente: scripts de emergência, logs e backups precisam de triagem e branch de PR.

## Contraprova independente desta rodada
- Windows `Win32_OperatingSystem.LastBootUpTime`: **2026-10-19 16:44:26**, horário local (-03:00).
- Tarefa `CentralDark-Cockpit-8080` foi criada **mais tarde neste mesmo dia** (registro da rodada anterior em torno de 17:58 local); portanto o boot das 16:44 **não testa** a restauração pela tarefa recém-configurada.
- `Get-ScheduledTask`: tarefa `Ready`, três triggers; `Get-ScheduledTaskInfo.LastTaskResult=0` e última execução na sonda às **18:23:26** local. Isso certifica execução do agendador, não o teste depois de reboot.
- `Get-NetTCPConnection`: porta **8080** com `node.exe` PID **28892** (volátil).
- `Invoke-WebRequest http://127.0.0.1:8080/sala-controle` respondeu **HTTP 200**, HTML ~**3.431 bytes**, não os **257,4 KB** anunciados em outro relatório (URL, momento e método também diferem). HTTP 200 não prova UI funcional, auth, bots, webhook ou frontend completo.
- O documento de reboot contém strings pseudo-SHA como `a1b2c3d4e5f6g7h8`, que não são hash SHA-256 válidos. Trechos de status 6/6, integridade 100%, BIOS e demais serviços não foram verificados de maneira independente. O uso de horário UTC em relatos anteriores também não se alinha automaticamente ao LastBootUpTime local; não usar narrativa como prova causal.

## Estado corrigido para Área Notícias
```json
{
  "notification_id": "COCKPIT-LIGADO-20261019",
  "type": "area_noticias",
  "status": "PARTIAL",
  "title": "🟡 Cockpit Casa operacional em 8080; reboot da tarefa pendente",
  "highlights": [
    "Porta 8080: Node/Vite observado e GET /sala-controle HTTP 200",
    "Agendador CentralDark-Cockpit-8080: três gatilhos; última execução exit 0",
    "Windows iniciou às 16:44 local; tarefa configurada depois",
    "Prova de autostart após reboot da tarefa: UNKNOWN",
    "HTML e autenticação E2E: UNKNOWN"
  ]
}
```
Este envelope é **candidato documental**, não é confirmação de INSERT no Supabase, entrega Telegram ou renderização da notícia. O owner real do feed é `notifications_log` / `apps/instinto-superior/src/hooks/useNotificationsLog.ts` com RLS admin; não há segundo canal de avisos.

## Próximo teste
Após reboot expressamente autorizado e com `K:\` disponível, medir sem abrir o Cockpit manualmente: boot time, tarefa habilitada/último resultado, PID dono da 8080 e HTTP 200. Capturar readback e correlação temporal. Só então `BOOT_AUTOSTART=PASS`. Para `AREA_NOTICIAS_DELIVERED=PASS`, exigir INSERT autorizado + readback da tabela/feed.

**Estado presente:** `FILES_EXIST=PASS`, `COCKPIT_HTTP_8080=PASS`, `TASK_SCHEDULER=PASS`, `REBOOT_AFTER_TASK_SETUP=UNKNOWN`, `NOTIFICATION_DELIVERED=UNKNOWN`.
**NEXT_CURSOR:** `RECONCILE_UNTRACKED_EVIDENCE → TEST_BOOT_AFTER_TASK_CREATION → AUTHORIZED_NOTIFY_INSERT → READBACK_FEED`.
