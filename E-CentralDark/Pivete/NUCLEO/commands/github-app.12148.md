# COMANDO - github-app.12148.log
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\logs\github-app.12148.log
**SHA:** 781fccf71b44abee
**Timestamp:** 2026-08-28T02:37:58.719582
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 2026-08-26T04:33:55.052086Z  INFO perf: perf_span name="terminal_latency_backend_write_enqueued" cat="backend" track="Terminal latency" dur_ms=0.0015999999999999999 ts_start=1787718835052.0806 pty_id=
- 2026-08-26T04:33:55.052847Z  INFO perf: perf_span name="terminal_latency_backend_write_dequeued" cat="backend" track="Terminal latency" dur_ms=0.7655 ts_start=1787718835052.0806 pty_id=1 probe_id=1
- 2026-08-26T04:33:55.052915Z  INFO perf: perf_span name="terminal_latency_backend_write_flushed" cat="backend" track="Terminal latency" dur_ms=0.8351 ts_start=1787718835052.0806 pty_id=1 probe_id=1
- 2026-08-26T04:33:55.053585Z  INFO perf: perf_span name="terminal_latency_backend_reader_output" cat="backend" track="Terminal latency" dur_ms=1.5025 ts_start=1787718835052.0806 pty_id=1 probe_id=1
- 2026-08-26T04:33:55.054433Z  INFO perf: perf_span name="terminal_latency_backend_read_returned" cat="backend" track="Terminal latency" dur_ms=2.3516 ts_start=1787718835052.0806 pty_id=1 probe_id=1
- 2026-08-26T04:34:00.012209Z  INFO task_spawn{task="ws_handle_connection"}:task_spawn{task="ws_recv_loop"}:task_spawn{task="ws_handle_client_message" kind="send_frontend_logs"}: perf: perf_span name="t
- 2026-08-26T04:34:00.012277Z  INFO task_spawn{task="ws_handle_connection"}:task_spawn{task="ws_recv_loop"}:task_spawn{task="ws_handle_client_message" kind="send_frontend_logs"}: perf: perf_span name="t
- 2026-08-26T04:34:00.012299Z  INFO task_spawn{task="ws_handle_connection"}:task_spawn{task="ws_recv_loop"}:task_spawn{task="ws_handle_client_message" kind="send_frontend_logs"}: perf: perf_span name="t
- 2026-08-26T04:34:00.012315Z  INFO task_spawn{task="ws_handle_connection"}:task_spawn{task="ws_recv_loop"}:task_spawn{task="ws_handle_client_message" kind="send_frontend_logs"}: perf: perf_span name="t
- 2026-08-26T04:34:00.012329Z  INFO task_spawn{task="ws_handle_connection"}:task_spawn{task="ws_recv_loop"}:task_spawn{task="ws_handle_client_message" kind="send_frontend_logs"}: perf: perf_span name="t

### Ouro Bruto (primeiros 5000 chars)
```
2026-08-26T02:09:58.845932Z  INFO github_app: GitHub Copilot app started pid=12148 version=1.1.14 commit=0d498e8 platform=windows arch=x86_64 build_debug=false log_file=C:\Users\danda\.copilot\logs\github-app.12148.log
2026-08-26T02:09:58.851807Z  INFO github_app::database: opening database db_path="C:\\Users\\danda\\.copilot\\data.db"
2026-08-26T02:09:58.870323Z  INFO github_app::database::recovery: Created pre-migration backup from_version=98 to_version=100 backup_path=C:\Users\danda\.copilot\data.db.pre-migration-backup
2026-08-26T02:09:58.873998Z  INFO github_app::database: Applied migrations from_version=98 to_version=100
2026-08-26T02:09:58.874500Z  INFO github_app::database::recovery: Removed pre-migration backup after successful migration backup_path=C:\Users\danda\.copilot\data.db.pre-migration-backup
2026-08-26T02:09:58.879967Z  INFO github_app::git::trampoline: trampoline broker listening port=64464 sidecar_dir=C:\Users\danda\AppData\Local\Programs\GitHub Copilot
2026-08-26T02:09:59.604658Z  INFO github_app: Resolved app skills directory path=C:\Users\danda\AppData\Roaming\com.github.githubapp\app-skills
2026-08-26T02:09:59.619357Z  INFO github_app::platform::impeccable: Finalized bundled impeccable skill node_available=true skill_dir=C:\Users\danda\AppData\Roaming\com.github.githubapp\app-skills\impeccable
2026-08-26T02:09:59.619540Z  INFO github_app: Resolved terminal integration directory path=\\?\C:\Users\danda\AppData\Local\Programs\GitHub Copilot\terminal-integration
2026-08-26T02:09:59.619892Z  INFO github_app: Resolved Foundry native library directory path=\\?\C:\Users\danda\AppData\Local\Programs\GitHub Copilot
2026-08-26T02:09:59.620158Z  INFO github_app: Discovered bundled Copilot SDK directory (will be passed to the CLI as extensionSdkPath once the SDK exposes that option; until then the CLI uses its built-in SDK) path=\\?\C:\Users\danda\AppData\Local\Programs\GitHub Copilot\copilot-sdk
2026-08-26T02:09:59.620327Z  INFO github_app: Restoring provider-owned local runtimes from the previous run
2026-08-26T02:09:59.620505Z  INFO github_app: Provider-owned local runtime restore complete
2026-08-26T02:09:59.621155Z  INFO github_app::platform::system_resume::platform: System resume observer: registered for suspend/resume notifications
2026-08-26T02:09:59.621501Z  INFO github_app::embedded_git: embedded git installed path=C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4 version="2.53.0-4"
2026-08-26T02:09:59.621591Z  INFO task_spawn{task="warm_canvas_catalog_user"}: github_app::session::manager::canvas_catalog: probing canvas catalog cwd="C:\\Users\\danda\\AppData\\Local\\Programs\\GitHub Copilot"
2026-08-26T02:09:59.622992Z  INFO task_spawn{task="warm_canvas_catalog_project"}: github_app::session::manager::canvas_catalog: probing canvas catalog cwd="E:\\CentralDark"
2026-08-26T02:09:59.623309Z  INFO task_spawn{task="warm_canvas_catalog_user"}: github_app::session::cli: using bundled git path=C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe
2026-08-26T02:09:59.624266Z  INFO task_spawn{task="warm_canvas_catalog_project"}: github_app::session::manager::canvas_catalog: probing canvas catalog cwd="C:\\Users\\danda\\CentralDark"
2026-08-26T02:09:59.624288Z  INFO task_spawn{task="warm_canvas_catalog_project"}: github_app::session::cli: using bundled git path=C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe
2026-08-26T02:09:59.625353Z  INFO task_spawn{task="warm_canvas_catalog_project"}: github_app::session::cli: using bundled git path=C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe
2026-08-26T02:09:59.630995Z  INFO github_app::git: resolved git env binary=C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe embedded_git_in_use=true embedded_skipped_reason=None path=C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\cmd;C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\mingw64\bin;C:\Users\danda\AppData\Local\github-copilot-git-2.53.0-4\mingw64\usr\bin;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;C:\Program Files\Git\mingw64\bin;C:\Users\danda\AppData\Local\Programs\Python\Python313;C:\Users\danda\AppData\Local\Programs\Python\Python313\Scripts;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\WINDOWS\System32\OpenSSH\;C:\Program Files\dotnet\;C:\Users\danda\AppData\Local\Microsoft\WindowsApps;C:\adb;C:\Program Files\WireGuard\;C:\xampp\php;C:\ProgramData\ComposerSetup\bin;C:\Program Files\Microsoft SQL Server\170\Tools\Binn\;C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\;C:\Program Files (x86)\Windows Kits\10\Windows Performance Toolkit\;C:\Program Files\nodejs\;C:\Program Files\GitHub CLI\;C:\Users\danda\.cargo\bin;C:\Users\danda\AppData\Local\Programs\OpenAI\Codex\bin;C:\Users\danda\AppData\Local\agy\bin;C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts;C:\Users\danda\AppData\Local\hermes\bin;C:\Users\danda\
```