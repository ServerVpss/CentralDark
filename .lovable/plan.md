## Objetivo

Quando a Edge `api-status` devolver 503 por chave inválida/expirada (upstream 401/403), a UI deve mostrar uma mensagem clara em vez do genérico "API Offline", com um caminho para falar com o admin.

## Mudanças (só frontend, sem tocar em business logic)

### 1. `src/compartilhado/comportamentos/useApiStatus.ts`
- Detectar o payload de erro do 503 vindo da edge (`upstream_status === 401 || 403`) e expor um novo campo no retorno: `errorKind: "expired_key" | "network" | "unknown" | null`.
- Manter `error` como está para não quebrar outros consumidores.

### 2. `src/funcionalidades/telepainel/components/dashboard/ApiStatusCard.tsx`
- No bloco de erro (linhas 33–52), quando `errorKind === "expired_key"`:
  - Título: "Chave da API expirada"
  - Descrição curta: "A chave da VeiculosAPI foi rejeitada (não autorizada). Renove a chave para voltar a operar."
  - Botão primário: **"Falar com admin"** → abre `mailto:contacobra3467@gmail.com?subject=CentralDark%20-%20Chave%20VeiculosAPI%20expirada` (admin oficial já registrado nas memórias).
  - Botão secundário: "Tentar de novo" (mantém o `refresh` atual).
- Demais casos de erro continuam mostrando "API Offline" como hoje.

### Fora de escopo
- Não mexer na edge `api-status` (código já trata corretamente e retorna 503 amigável).
- Não trocar o secret `ISEEK_API_KEY` (depende do Pivete fornecer a chave nova).
- Sem mudanças em rotas, RLS, tabelas ou backend.

## Prova
- Enquanto o secret continuar inválido, o card passa a exibir a mensagem específica e o botão de contato com admin.
- Quando a chave for renovada, o card volta ao estado normal automaticamente (o hook já faz retry a cada 5 min).
