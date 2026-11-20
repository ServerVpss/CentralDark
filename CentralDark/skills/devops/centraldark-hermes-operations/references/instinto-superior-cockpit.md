# Instinto Superior Cockpit — architectural patterns

## TanStack Start server functions (critical)

The app uses TanStack Start with `createServerFn` for all server-side logic.
`routes/api/*.ts` files with bare `GET`/`POST` exports are DEAD ROUTES — TanStack Start
ignores them silently (no 404, just never registers the handler). Any new server
endpoint must use `createServerFn` in a `*.functions.ts` file under `src/lib/` or
alongside its consumer component.

Pattern:
```ts
// src/lib/foo.functions.ts
import { createServerFn } from '@tanstack/react-start';

export const myServerFn = createServerFn({ method: 'GET' }).handler(async () => {
  return { data: 'result' };
});
```

Consumer:
```ts
import { useServerFn } from '@tanstack/react-start';
import { myServerFn } from '~/lib/foo.functions';
const fn = useServerFn(myServerFn);
```

## Adding a cockpit feature (tabs/panels)

1. Create server functions in `src/lib/<feature>.functions.ts` using `createServerFn`.
2. Create or update the component in `src/components/central/<Feature>.tsx`.
3. Import + add `TabsTrigger` + `TabsContent` in `CockpitShell.tsx`.
4. Verify with `npx tsc --noEmit` — zero errors before commit.

## Key paths

- Cockpit shell: `apps/instinto-superior/src/components/central/CockpitShell.tsx`
- Server functions: `apps/instinto-superior/src/lib/*.functions.ts`
- Sync functions: `apps/instinto-superior/src/lib/sync.functions.ts`
- Env secrets: `.env.local` (gitignored via `*.local`), `.env.production.local`
- Supabase vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — must be in `.env.local` for dev (Vite only reads `.env.production.local` in production builds).
