<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Decisões estruturais

- O bloco Sistema (Mega Painel, Hub Segurança, Cofre e Status) pertence ao Cockpit CentralDark administrativo; o TelePainel mantém apenas funções próprias, evitando dois centros de comando.
- Cockpit appearance variants are scoped to CockpitShell semantic tokens and persisted locally through its DesignCenter control; keep default tokens and the shared Hermes engine unchanged to prevent visual regressions.
- HUD capabilities are projections of the existing cockpit.functions, SyncCenter, SistemaCentralDark and Ledger owners; never create a parallel HUD or infer runtime health from historical proofs.


## Contrato UI-First do Cockpit — intenção exata

- **Visual primeiro:** pedidos de botão, aba, card ou menu significam materializar **somente esses elementos** no Cockpit/Builder existentes, visíveis e selecionáveis, sem antecipar integração técnica ou abrir outro painel.
- **Integração pendente é estado permitido:** usar rótulo honesto `INTEGRAÇÃO PENDENTE` quando não existe ligação comprovada; `BOTÃO VISÍVEL != FUNCIONALIDADE CONECTADA`.
- **Sugestão em momento posterior:** quando houver owner/rota existente comprovados, notificar a possibilidade com evidência e esperar nova ordem. `NOTIFICAÇÃO != AUTORIZAÇÃO`.
- **Segurança sem escopo inventado:** não fazer auditoria ampliada, refatoração de autenticação ou projeto de segurança por conta própria em pedidos só visuais. Continuar obedecendo aos controles essenciais existentes de autenticação, autorização, confidencialidade, credenciais e proteção de dados.
- **Um delta por pedido:** limitar o diff ao mínimo que torna o elemento solicitado visível, sem migração, auto-dispatch, deploy, alteração de portas/infra ou criação de novos owners sem pedido.
- **Provas separadas:** testar apresentação/seleção do menu para `UI_PRESENT`; conexão e efeito só recebem PASS com teste próprio após autorização. `UNKNOWN != PASS`.
