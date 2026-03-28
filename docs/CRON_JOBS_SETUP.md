# ⏰ Cron Jobs — Configuração no Supabase

## Pré-requisitos

Execute no **Supabase Dashboard → SQL Editor**:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

## 1. Fake Engagement (Simulação de Assinaturas)

Dispara a cada **1 minuto**. A função internamente verifica os intervalos configurados por bot.

```sql
SELECT cron.schedule(
  'fake-engagement-cron',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://otifzcjioyjmwmgtxbtj.supabase.co/functions/v1/fake-engagement',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ6Y2ppb3lqbXdtZ3R4YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODEyNDAsImV4cCI6MjA5MDI1NzI0MH0.r8EIaGAPxPjpyMaF0C444gXzyj-dRKIZqwaCgRM5s9c"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 2. Scheduled Broadcasts (Broadcasts Agendados)

Dispara a cada **1 minuto** para verificar broadcasts pendentes.

```sql
SELECT cron.schedule(
  'scheduled-broadcasts-cron',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://otifzcjioyjmwmgtxbtj.supabase.co/functions/v1/scheduled-broadcasts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ6Y2ppb3lqbXdtZ3R4YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODEyNDAsImV4cCI6MjA5MDI1NzI0MH0.r8EIaGAPxPjpyMaF0C444gXzyj-dRKIZqwaCgRM5s9c"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 3. Health Check (Monitoramento de Edge Functions)

Dispara a cada **5 minutos**.

```sql
SELECT cron.schedule(
  'health-check-cron',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://otifzcjioyjmwmgtxbtj.supabase.co/functions/v1/health-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ6Y2ppb3lqbXdtZ3R4YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODEyNDAsImV4cCI6MjA5MDI1NzI0MH0.r8EIaGAPxPjpyMaF0C444gXzyj-dRKIZqwaCgRM5s9c"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 4. EFI Poll Pending (Verificação de Pagamentos PIX)

Dispara a cada **2 minutos**.

```sql
SELECT cron.schedule(
  'efi-poll-pending-cron',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://otifzcjioyjmwmgtxbtj.supabase.co/functions/v1/efi-poll-pending',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ6Y2ppb3lqbXdtZ3R4YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODEyNDAsImV4cCI6MjA5MDI1NzI0MH0.r8EIaGAPxPjpyMaF0C444gXzyj-dRKIZqwaCgRM5s9c"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 5. Provider Ping (Verificação de Provedores de API)

Dispara a cada **10 minutos**.

```sql
SELECT cron.schedule(
  'provider-ping-cron',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://otifzcjioyjmwmgtxbtj.supabase.co/functions/v1/provider-ping',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ6Y2ppb3lqbXdtZ3R4YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODEyNDAsImV4cCI6MjA5MDI1NzI0MH0.r8EIaGAPxPjpyMaF0C444gXzyj-dRKIZqwaCgRM5s9c"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## Gerenciamento

### Ver cron jobs ativos
```sql
SELECT * FROM cron.job ORDER BY jobname;
```

### Remover um cron job
```sql
SELECT cron.unschedule('fake-engagement-cron');
```

### Ver histórico de execuções
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### Pausar todos os cron jobs temporariamente
```sql
UPDATE cron.job SET active = false;
```

### Reativar todos
```sql
UPDATE cron.job SET active = true;
```

---

## Resumo

| Cron Job | Intervalo | Edge Function | Descrição |
|----------|-----------|---------------|-----------|
| `fake-engagement-cron` | 1 min | `fake-engagement` | Simula assinaturas no grupo |
| `scheduled-broadcasts-cron` | 1 min | `scheduled-broadcasts` | Envia broadcasts agendados |
| `health-check-cron` | 5 min | `health-check` | Monitora edge functions |
| `efi-poll-pending-cron` | 2 min | `efi-poll-pending` | Verifica pagamentos PIX |
| `provider-ping-cron` | 10 min | `provider-ping` | Ping nos provedores de API |
