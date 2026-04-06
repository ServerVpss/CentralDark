
# Reestruturação — Backend Central de Consultas (MODO HARD)

## Diagnóstico da Arquitetura Atual

### ✅ O que já funciona corretamente
- `api-query` é o backend central — Telegram e painel já o utilizam
- Telegram webhook chama `api-query` via HTTP (não duplica lógica de consulta)
- Sem cache local (removido anteriormente)
- Timeout dinâmico por módulo (45s padrão, 120s para módulos pesados)
- Sanitização de metadados do provedor (SALDO, CONTA, etc.)
- Módulos habilitáveis/desabilitáveis via banco de dados
- Busca de foto nacional em paralelo

### ❌ Problemas Críticos Encontrados

1. **Remapeamento de módulos** — `veiculosModuleMap` traduz `cpf`→`cpffull`, `nome`→`nomefull`, `mae`→`maefull`, etc. Viola a regra de execução exata.
2. **`telegram-api-query` duplicada** — Função separada com lógica própria de consulta (segunda cópia do mapeamento). Deve ser eliminada.
3. **Sem whitelist rigorosa** — Módulos não listados passam sem bloqueio.
4. **Resposta não padronizada** — Falta `request_id`, `channel`, `provider_duration_ms`, `internal_duration_ms`.
5. **Sem retry para falhas transitórias** — Timeout ou 5xx não são reprocessados.
6. **Painel com módulos hardcoded** — `Consultas.tsx` tem lista fixa de 14 tipos ao invés de carregar do banco.
7. **Aliases no webhook** — `queryTypeAliases` traduz `spc`→`cpf_spc`, `poder`→`poderaquisitivo`. Pode causar confusão.

---

## Plano de Execução

### Fase 1 — `api-query`: Whitelist Exata + Resposta Padronizada

**Arquivo:** `supabase/functions/api-query/index.ts`

1. **Substituir `veiculosModuleMap` por whitelist direta** — O nome do módulo IS o nome enviado à API. Sem tradução.
   ```
   Whitelist: bnmp-lc, placa-sesp, placa-simples, processos, cnh, siel, cpf-spc, rg-3, pis-3, cep-3, email-3, nome-3, credilink, score-3, parentes-3, telefone-3, tse-3, cpf, emailfull, motor, pis, renavam, telefone, score, cpf-isk, poderaquisitivo, parentes, maefull, email, chassi, cepfull, cpfsus, mae, nomefull, placa, rg, titulo, telefonefull, renda, pix, nome, endereco, cpffull, cep, placa-serpro, fotomg, fotopr, fotoce, fotoma, fotorj, fotosp, fotoms, fotoro, fotopi, fotoes, fototo, fotodf, cnpj-cred
   ```
2. **Bloquear módulos fora da whitelist** — Retornar erro 400 + registrar tentativa.
3. **Adicionar `request_id` (UUID)** a cada requisição.
4. **Medir `provider_duration_ms`** (tempo da API externa) e `internal_duration_ms` separadamente.
5. **Aceitar parâmetro `channel`** (telegram/admin_panel) para rastreio.
6. **Resposta padronizada:**
   ```json
   {
     "success": true,
     "data": {},
     "meta": {
       "request_id": "uuid",
       "modulo": "cpf",
       "channel": "admin_panel",
       "duration_ms": 2140,
       "provider_duration_ms": 2050,
       "internal_duration_ms": 90,
       "status": "success"
     },
     "errors": []
   }
   ```
7. **Retry controlado** — 1 retry para timeout ou 5xx, com 2s de delay. Sem retry para 4xx ou módulo inválido.
8. **Validação de entrada por tipo de módulo** antes de chamar a API.
9. **Log estruturado** — request_id, user_id, channel, módulo, status, durações, erros.

### Fase 2 — Telegram Webhook: Usar Módulos Exatos

**Arquivo:** `supabase/functions/telegram-webhook/index.ts`

1. **Remover aliases que alteram o módulo** — `/cpf` executa `cpf`, não `cpffull`. Se o usuário quer `cpffull`, digita `/cpffull`.
2. **Passar `channel: "telegram"`** na chamada ao `api-query`.
3. **Mostrar tempo de resposta** nas mensagens do bot quando disponível.
4. **Mensagens de erro mais claras** usando os dados do meta.
5. **Preservar todo o restante** (pagamentos, segurança, formatação, etc.).

### Fase 3 — Eliminar `telegram-api-query`

- Remover a Edge Function `telegram-api-query` — toda consulta deve passar pelo `api-query`.
- Verificar se algum código ainda a referencia.

### Fase 4 — Painel Administrativo: Módulos Dinâmicos

**Arquivo:** `src/pages/Consultas.tsx`

1. **Carregar módulos do banco** (`query_modules`) ao invés de lista hardcoded.
2. **Mostrar apenas módulos habilitados**.
3. **Exibir tempo detalhado** (total, provedor, interno) no resultado.
4. **Passar `channel: "admin_panel"`** nas requisições.

### Fase 5 — Documentação

- Atualizar `docs/EDGE_FUNCTIONS.md` com a nova estrutura.
- Atualizar `docs/BOT_COMMANDS.md` com a whitelist exata.

---

## O que NÃO será alterado
- Fluxo de pagamentos (PIX, Efí)
- Segurança do bot (anti-link, anti-spam, anti-flood)
- Formatação de resultados (TXT, PDF, paginação)
- Sistema de assinaturas
- Configurações do bot (reações, engajamento, manutenção)
- Autenticação do painel
- Health checks e monitoramento

## Resultado Esperado
- Backend único e leve
- Módulo executado = exatamente o que o usuário pediu
- Sem tradução automática entre módulos
- Resposta padronizada com métricas
- Logs estruturados
- Consistência total entre Telegram e painel
