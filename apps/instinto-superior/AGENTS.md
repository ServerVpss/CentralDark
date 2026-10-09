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
