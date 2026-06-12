---
name: Status Page Auto-Construída
description: /status é hub auto-construído com VpsDeployPlugin plugável, histórico de deploys, roadmap dinâmico e Preview iPhone da VPS
type: feature
---
A rota `/status` (acessível em `status.centralldark.com` no host routing) concentra:

- **`<VpsDeployPlugin />`** (`src/components/devops/VpsDeployPlugin.tsx`): componente autocontido, plugável em qualquer tela. Checa role `admin` via `useIsAdmin` antes de renderizar. Dispara o sync chamando a edge `vps-exec` com o script `sync-para-centraldark-monorepo.sh`. Registra cada execução em `vps_deploy_history`.
- **Histórico**: tabela `vps_deploy_history` (RLS: só admin). Hook `useVpsDeploy` faz realtime via Supabase channel.
- **Roadmap auto-construído**: tabela `project_roadmap` (status pendente|em_andamento|concluido, priority 1-3). Admin adiciona/marca via `RoadmapList`. Tarefas pendentes do projeto vivem aqui — quando ficam 100%, marcar como concluído mantém o histórico.
- **Preview iPhone**: `IPhonePreviewModal` abre modal estilo iPhone com iframe da URL pública (default `https://centralldark.com`), com auto-refresh opcional 5s. Usado pra ver versão pública antes de publicar de vez.

Regras:
- Tudo restrito a admin (RLS + checagem client-side via `has_role`).
- O plugin pode ser dropado em qualquer outra tela: `<VpsDeployPlugin />`.
- Sync de fato roda via GitHub Actions workflow `vps-ssh-exec.yml` disparado pela edge `vps-exec`.
- TO-DO futuro: integrar geração automática de roadmap a partir de features pendentes detectadas no código.
