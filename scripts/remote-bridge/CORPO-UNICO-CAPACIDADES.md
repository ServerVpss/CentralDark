# CENTRALDARK · CORPO ÚNICO · Entrada e capacidades
<!-- OWNER: scripts/remote-bridge · Integração 2026-11-05 · sem segundo executor -->

**Uma entrada humana:** `scripts/remote-bridge/CENTRALDARK-CORPO-UNICO.cmd` abre o **mesmo** HUD WinForms de `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat`. O HUD agora tem **um NotifyIcon** na bandeja do Windows: minimizar/fechar mantém a janela oculta; duplo clique ou menu a reabre; **Sair** encerra a mesma instância. Mutex existente `Local\CentralDark_CorpoUnico_HudLogs` impede duplicação.

| Capacidade | Owner existente, sem copiar implementação | Papel no Corpo Único |
| --- | --- | --- |
| Entrada, janela, Tray, status, logs | `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` | UX local único; probes somente leitura; logs em `%LOCALAPPDATA%\CentralDark\Corpo-Unico-HUD-Logs.txt` |
| Executor Casa e ferramentas | `scripts/remote-bridge/canonical/CentralDark-Casa-Agent.mjs` | Executa via engine stdio local; `127.0.0.1:9101/health` e `POST /tool` autenticado |
| Instalador OneShot existente | `scripts/remote-bridge/canonical/CentralDark-Casa-OneShot.ps1` + `CentralDark-Casa-OneShot.go` | Instala/atualiza a ponte local; **não** é atualmente o processo de Tray |
| Binário preservado | `F:\CentralDark\Remote-Tray\CentralDark-Casa-OneShot.exe` | Compilado histórico do launcher de instalação; não confundir com `CentralDarkBridge.exe` ausente |
| Tailscale privado | `scripts/remote-bridge/canonical/CENTRALDARK-REMOTE-BRIDGE.config.json` | `tailnet:9100 → 127.0.0.1:9101` |
| MCP CentralDark | `apps/modulos/mcp/src/tools/core/mcp-admin.js` | Control plane OAuth/admin, `casa_commander_status` e `casa_commander_read` na `main` |
| Cockpit / Instinto Superior | `apps/instinto-superior/src/lib/cockpit.functions.ts` e `src/components/central/StatusPanel.tsx` | Surface web existente; recebe saúde e recibo, sem segundo executor |
| Hermes | owner Hermes existente no Windows / sistema | Coordenação/executação autorizada, sem outro processo criado pelo launcher |
| Screenpipe, Afterburner e sensores | `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` e `apps/instinto-superior` | Somente leitura e sensores existentes |
| Tray remoto antigo (legado) | `scripts/remote-bridge/canonical/engine/CentralDark-Remote-Tray.ps1` | **Não** ativar: ainda inicia `desktop-commander remote` de fornecedor externo |

### Prova desta integração (05/11/2026)
- Inspeção física de `F:\CentralDark`: launcher e HUD encontrados no mesmo checkout. O arquivo `CENTRALDARK-CORPO-UNICO.cmd` abre o HUD **relativo à pasta**, sem copiar arquivos nem alterar a tarefa Windows existente.
- Parser PowerShell do payload extraído do BAT: **0 erros**; exatamente **1 NotifyIcon** declarado; callback de fechamento e roteamento para `9101/health` presentes no código.
- `127.0.0.1:9101/health` respondeu `ok=true`, `name=CentralDark Casa Commander`, `remote_vendor=false`, **`engine_connected=false`**. Status correto no cartão: **WARN**, não PASS.
- Há tarefa `CentralDark-Casa-Cockpit-Hermes-One` apontando para `K:\scripts\casa`, mas `K:\` está ausente na medição. **Não alterar a tarefa silenciosamente.**
- Não há confirmação de compilação do Tray em EXE, pareamento OAuth/admin ponta a ponta, instalação da versão nova do agente nem reboot/autostart. A bridge instalada permanece em `%LOCALAPPDATA%\CentralDark\Casa-Commander`; token DPAPI não foi lido, copiado ou exportado.

**NEXT_CURSOR:** executar o launcher em sessão Windows interativa para confirmar a mesma janela e Tray; fechar/abrir pelo ícone, mantendo mutex; parear admin MCP com token já protegido; testar `/tool` leitura e recibo; publicar runtime MCP/GUI pelo owner existente; reconciliar autostart somente após confirmar caminhos vivos. Nunca mover pastas `apps`, `docs`, `Casa-Commander` ou `.git` para `remote-bridge`, pois isso quebraria os serviços existentes.