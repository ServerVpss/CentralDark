## Objetivo
Isolar o frontend do Lovable Cloud e apontar 100% pro seu Supabase (`lyoigsqluyktoclwdaft`), sem tocar em `.env` nem `client.ts` auto-gerados.

## Passo 1 — Tipagem independente
Criar `src/integrations/supabase/hub-types.ts` copiando **na íntegra** o conteúdo atual de `src/integrations/supabase/types.ts`. Assim, quando o Lovable regenerar o `types.ts`, o meu fica intocado.

## Passo 2 — Client intocável
Criar `src/integrations/supabase/hub-client.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './hub-types';

const supabaseUrl = 'https://lyoigsqluyktoclwdaft.supabase.co';
const supabaseKey = '<HUB_ANON_KEY>';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, storage: localStorage },
});
```

A anon key vai direto no código (é pública — segurança vem do RLS). Vou puxar do secret `HUB_SUPABASE_ANON_KEY` que você já salvou.

## Passo 3 — Sequestro de imports em massa
Varrer todo `src/` e trocar:

```
- from "@/integrations/supabase/client"
- from '@/integrations/supabase/client'
+ from "@/integrations/supabase/hub-client"
```

Faço via `sed` recursivo. Estimo 80-150 arquivos afetados.

## Passo 4 — Validação
- Rodar `tsgo` (typecheck) pra garantir que nada quebrou.
- Se aparecer algum import de `types.ts` direto (não pelo client), aponto pro `hub-types.ts` também.
- `supabase.functions.invoke(...)` herda a URL nova automaticamente — sem alteração adicional.

## Paralelo (enxame na VPS enquanto rodo o refactor)
Como você pediu, disparo em paralelo na VPS:

- **Deploy das 39 edge functions no HUB** via Supabase CLI apontando pro `lyoig` com `HUB_SUPABASE_SERVICE_ROLE_KEY`.
- **Injeção dos ~30 secrets** (`EFI_CLIENT_ID`, `CONSULTAS_API_KEY`, `TELEGRAM_API_KEY`, etc) no HUB via Management API.

Isso roda como script único na VPS (`vps_run_once_script`), sem bloquear o refactor do frontend.

## Depois (não nesta rodada)
Vira dos webhooks (Telegram `setWebhook`, EFI `efi-register-webhook`, MistcPay) apontando pro domínio `lyoigsqluyktoclwdaft.supabase.co`. Faço quando confirmar que os passos 1-4 + deploy + secrets no HUB estão OK.

## O que fica pra trás
Projeto Lovable Cloud (`kagejpg`) vira inerte — nada aponta mais pra ele. Mantenho 7 dias como backup.

## Minha opinião
Plano tá certo e é o caminho mais limpo. Único ponto de atenção: se algum componente hoje importa `Database` diretamente de `./types` (não via client), o typecheck vai gritar — corrijo na hora. Manda executar.
