# MISSAO: Finalizar o upgrade HUB v2 ate o fim

Alvo: /root/CentralDark/apps/modulos/hub/
Contexto: a missao upgrade-hub-v2 criou todos os componentes (54 etapas OK) mas pausou antes de validar. Correcoes de coerencia ja foram adiantadas no working tree (tabs/input/label/textarea criados em src/shared/ui/, hooks useAudit/usePolicies alinhados, props de varios componentes corrigidas). VOCE termina o resto.

## Criterio de sucesso (nessa ordem)
1. `cd /root/CentralDark/apps/modulos/hub && npx tsc --noEmit -p tsconfig.app.json` retorna ZERO erros.
2. Commit + push das mudancas do hub.
3. Relatorio final no Telegram com terminou: true.

## Passo a passo
1. Rode o typecheck acima (via shell) e liste os erros restantes.
2. Para cada erro: leia o arquivo (ler_arquivo), corrija o MINIMO necessario (escrever_arquivo). NAO reescreva arquivos inteiros que ja funcionam.
3. Atencao especial ao PolicyEditor.tsx — ele precisa:
   - Aceitar props `{ policy: Policy | null; onClose: () => void }` (o PoliciesTab passa isso).
   - Usar `addPolicy`/`updatePolicy` do usePolicies (ja existem no hook).
   - Trocar `Select/SelectContent/SelectItem/SelectTrigger/SelectValue` por `<select>` nativo (esse componente NAO existe no kit; Label e Textarea JA existem em @/shared/ui/).
   - Sem lista interna de policies (o PoliciesTab ja lista) — so o formulario.
4. Repita o typecheck ate zerar.
5. Migrations HUB (policies, audit_logs, access_logs): SO se a variavel $HUB_SUPABASE_DB_URL existir no ambiente. Se nao existir, PULE e anote "migrations puladas - sem credencial" no relatorio.

## Regras de git (IMPORTANTE — foi aqui que voce travou da ultima vez)
- NUNCA use `git add -A`. Use shell com paths especificos: `git add apps/modulos/hub`
- NUNCA adicione: apps/modulos/status/painel-data.json, .env, backups/
- Commit: `git commit -m "feat(hub): hub v2 typecheck limpo + PolicyEditor funcional"`
- Push: `git push origin main`. Se falhar por non-fast-forward: `git pull --rebase --autostash origin main`; se o rebase conflitar, rode `git rebase --abort` e apenas RELATE no final que o push ficou pendente — nao insista.

## Regras gerais
- Maximo 30 etapas.
- Nao tocar em areas protegidas (apps/bot-telegram/, apps/modulos/status/, Bolt/, WebUI/, infra/caddy/, secrets/).
- Se uma correcao nao zerar o erro em 2 tentativas no mesmo arquivo, anote e siga pro proximo — relate no final.
