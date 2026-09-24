# Hermes nas três superfícies — estado inicial

- Fonte: `ServerVpss/CentralDark@main`
- Main medida no início: `ec52fad88be4e06421ab5ddb075668d2a7c14064`
- Decisão REUSE_BEFORE_CREATE: `EXTEND_EXISTING`
- Owner visual encontrado: `src/admin/cockpit/HermesMascote.tsx`
- Estado inicial: o owner possui poses e reações do cockpit, mas não possui deslocamento pela tela nem compartilhamento com as superfícies pública e autenticada.
- Consolidação: a implementação material seguirá na branch única `agent/centraldark-cockpit-vivo`; esta branch permanece apenas como receipt de descoberta para evitar dois writers no mesmo escopo.
- Segurança: nenhuma credencial será incorporada ao cliente ou aos assets.
