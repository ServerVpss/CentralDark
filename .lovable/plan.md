## O que vou fazer (modo pragmático, sem publicar)

Tudo fica pronto pra você testar o botão antes de qualquer publish.

### 1. Plugin "Deploy VPS" (componente plugável)
Novo: `src/components/devops/VpsDeployPlugin.tsx`
- Card autocontido — pode ser dropado em qualquer página (Settings, Dashboard, Status…).
- Botão **"Rodar sync agora"** → chama edge `vps-exec` com o comando do script `sync-para-centraldark-monorepo.sh`.
- Mostra: último commit sincronizado, horário, status (✅/❌), log resumido.
- Segurança:
  - Só renderiza se `has_role(uid, 'admin')` (RPC já existe).
  - Edge `vps-exec` já valida `GITHUB_TOKEN`. Vou adicionar checagem extra de JWT + role admin no início da função.
  - Rate limit simples: 1 execução por minuto (estado local + timestamp em `system_settings`).

### 2. Tabela de histórico de deploys
Migration nova: `vps_deploy_history`
```
id, commit_hash, started_at, finished_at, status (running|success|error),
triggered_by (uid), workflow_run_id, log_summary, environment (web|portal)
```
- RLS: SELECT pra `authenticated` (admins veem tudo via has_role), INSERT/UPDATE só `service_role`.
- GRANTs corretos.
- Edge `vps-exec` insere `running` no início; um novo edge `vps-deploy-status` (chamado pelo workflow no fim via curl) atualiza pra `success/error`.

### 3. Página Status refinada (`/status` → mapeada pra `status.centralldark.com`)
- Verifico se existe rota. Se sim, refino layout (Esmeralda + 3D tátil). Se não, crio `src/pages/Status.tsx` + rota em `App.tsx`.
- Seções:
  - **Saúde geral** (reaproveita `useApiStatus` / `useModuleHealth`)
  - **Últimos deploys** (lista de `vps_deploy_history`, 10 últimos, com commit/horário/status)
  - **Plugin VpsDeployPlugin** (mesmo componente — prova que é plugável)
  - **Roadmap auto-construído** (próximo item)

### 4. Roadmap auto-construído
Nova tabela `project_roadmap`:
```
id, title, description, status (pendente|em_andamento|concluido),
priority, created_at, completed_at, auto_generated (bool)
```
- Lista visível na `/status`.
- Admin pode adicionar/marcar via UI simples (input + lista).
- Por enquanto, geração automática = manual via botão "+". Hook pra geração automática fica como TO-DO no código.

### 5. Preview iPhone Modal
Novo: `src/components/devops/IPhonePreviewModal.tsx`
- Botão "Preview VPS" na página Status.
- Abre modal estilizado como iPhone (notch, bordas arredondadas, status bar).
- Iframe apontando pra URL temporária da VPS (ex: `https://preview.centralldark.com` ou subdomínio configurável em `system_settings`).
- Refresh manual + auto-refresh opcional (5s).

### 6. Verificação do sync automático
- Adiciono na `vps-exec` um modo `?check=true` que só lê o log: `tail -50 /var/log/centraldark-sync.log` e retorna o conteúdo.
- Botão "Verificar cron" no plugin mostra isso num drawer.
- TO-DO no código: integrar com endpoint do MCP CentralDark se ele já expõe.

### 7. Memória
Salvo:
- `mem://features/devops/status-page-auto-roadmap` — explicando que `/status` é auto-construída com roadmap dinâmico, plugin de deploy e preview iPhone.
- Atualizo index.

### Arquivos novos
```
src/components/devops/VpsDeployPlugin.tsx
src/components/devops/IPhonePreviewModal.tsx
src/components/devops/DeployHistoryList.tsx
src/components/devops/RoadmapList.tsx
src/pages/Status.tsx                    (se não existir)
src/hooks/useVpsDeploy.ts
src/hooks/useRoadmap.ts
supabase/migrations/<timestamp>_vps_deploy_history_and_roadmap.sql
supabase/functions/vps-deploy-status/index.ts
```

### Arquivos editados
```
src/App.tsx                              (rota /status se faltar)
supabase/functions/vps-exec/index.ts     (auth + insert deploy_history + modo check)
.lovable/memory/index.md
```

### NÃO vou
- Publicar nada (espero seu OK depois de testar).
- Mexer no Caddyfile da VPS (regra: só com seu OK).
- Tocar em business logic não-relacionada.

### Onde fica o botão pra você testar
Depois de pronto: vai aparecer em **`/status`** (link no menu lateral) e também posso dropar o `<VpsDeployPlugin />` no Dashboard se você quiser ver lá também — me fala depois.

Posso seguir?