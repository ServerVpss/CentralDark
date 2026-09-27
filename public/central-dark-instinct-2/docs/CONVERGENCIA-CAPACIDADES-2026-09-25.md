# Convergência de capacidades — 2026-09-25

## Decisão de owner

`ServerVpss/centraldark-instinto-superior` é o corpo visual final. `ServerVpss/CentralDark` permanece autoridade de contratos, governança e runtime. `ServerVpss/centraldark-emergent-mind` é fonte histórica de deltas, não um novo control plane.

HEADs inventariados antes da escrita:

- CentralDark: `9c4f93888000f203ba5623b6800e98463a2d9399`
- Instinto Superior: `0bba5a97e8bbf0bb375c171b2eb20eac2e23fe70`
- Emergent Mind: `fde999e6c7dcbbe845afa2e9db1985d0f74f3fc7`

## Matriz de equivalência

| Capacidade encontrada        | Fonte                | Owner final no Instinto                                         | Decisão                    |
| ---------------------------- | -------------------- | --------------------------------------------------------------- | -------------------------- |
| Hero, navegação e fechamento | Emergent             | `src/routes/index.tsx` + `src/components/central/Header.tsx`    | REUSE_EXISTING             |
| Evolução/timeline            | Emergent             | `Timeline.tsx`                                                  | REUSE_EXISTING             |
| Loop e orquestração          | Emergent             | `LoopDiagram.tsx` + seções da landing                           | REUSE_EXISTING             |
| Evidence ledger              | Emergent             | `Ledger.tsx`                                                    | REUSE_EXISTING             |
| Modalidades                  | Emergent             | seção multimodal da landing                                     | REUSE_EXISTING             |
| Selo e projeção              | Emergent             | `Projecao.tsx` + seção selo                                     | REUSE_EXISTING             |
| i18n PT/EN/ES                | Emergent             | `src/lib/i18n.tsx` + `SeoI18n.tsx`                              | REUSE_EXISTING             |
| Designer administrativo      | Emergent             | `CockpitShell.tsx` + `DesignCenter.tsx`                         | REUSE_EXISTING             |
| Adapter do estado vivo       | Emergent             | `src/lib/cockpit.functions.ts`                                  | ABSORB_INTO_OWNER          |
| Exportação/pacote            | Emergent             | `ExportPdf.tsx` + Download Center/Hermes                        | REUSE_AND_REFINE           |
| Login e-mail/senha           | Instinto             | `src/routes/auth.tsx`                                           | REUSE_AND_FIX              |
| Google OAuth                 | Instinto             | Supabase OAuth direto em `auth.tsx`                             | REUSE_AND_FIX              |
| Callback PKCE                | delta preparado      | `src/routes/auth.callback.tsx`                                  | ABSORB_MISSING             |
| Recuperação de senha         | Instinto             | `src/routes/reset-password.tsx`                                 | REUSE_AND_FIX              |
| Logout                       | Instinto             | `CockpitShell.tsx`                                              | REUSE_EXISTING             |
| Autorização admin            | Instinto/Supabase    | `_authenticated/sala-controle.tsx` + `admin.functions.ts` + RLS | REUSE_AND_FIX              |
| Cockpit de SHAs/deploy       | Instinto/CentralDark | `cockpit.functions.ts` + `SyncCenter.tsx`                       | REUSE_AND_FIX              |
| Leitura do GitHub            | Instinto             | `github.functions.ts`                                           | REUSE_WITH_DIRECT_FALLBACK |
| Comparação de landing        | Instinto             | `comparar.functions.ts`                                         | REMOVE_CREDIT_DEPENDENCY   |
| Roteador e catálogo          | CentralDark          | `/roteador` + `public/centraldark/router-capabilities.json`     | ABSORB_MISSING_SURFACE     |
| Grafo/Live Fabric            | CentralDark          | probes em `cockpit.functions.ts`                                | REUSE_EXISTING_RUNTIME     |
| Hermes visual                | Instinto             | `HermesPet.tsx`                                                 | REUSE_EXISTING             |
| PDF                          | Instinto             | `ExportPdf.tsx`                                                 | REUSE_EXISTING             |

## Botões e ações expostos

| Superfície       | Ação                                     | Estado/owner                                                        |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Header           | Âncoras da doutrina, idiomas e PDF       | existente                                                           |
| Header           | Cockpit, Roteador e Repositório          | convergido neste delta                                              |
| Auth             | entrar, cadastrar e continuar com Google | Supabase                                                            |
| Recuperação      | enviar link e trocar senha               | Supabase PKCE                                                       |
| Cockpit          | entrar/sair, abas, baixar pacote         | owner existente; integridade física permanece `UNKNOWN` sem medição |
| Sala de controle | validar admin, consumo e sessões         | token Supabase enviado ao servidor                                  |
| Repositório      | listar, visualizar, exportar e comparar  | GitHub; comparação determinística sem crédito Lovable               |
| Roteador         | remedir API e ler 50 capacidades         | manifesto CentralDark + probes vivos                                |

## Dependências e limites

- Não foi criado app, banco, roteador, brain, Judge ou painel paralelo.
- O manifesto do roteador foi absorvido com a proveniência original e mantém `ADAPTATION_REQUIRED`, `OWNER_DISCOVERY_REQUIRED` e `RUNTIME_UNKNOWN` onde a própria fonte não prova implementação.
- Lovable não é dependência de build, comparação ou autenticação. Pode continuar como espelho/editor conectado.
- `MERGED`, `SYNCED` e URL conhecida não equivalem a `DEPLOYED`; publicação exige SHA ou evidência atual do alvo.
- A aposentadoria dos projetos doadores só pode ocorrer quando novo inventário provar delta útil zero. Esta matriz não apaga histórico.
