# 🧿 CentralDark Installer Deterministic Beta 1

**Versão:** `0.1.0-beta.1`  
**Data:** `2026-09-09`  
**Owner canônico da instalação:** `install.sh`  
**Princípio:** `REUSE_BEFORE_CREATE=true` / `ONE_SYSTEM_ONLY=true`

## Intenção
O instalador deve funcionar mesmo numa máquina recém-chegada, sem provider de IA, sem API token e sem Cloudflare configurado. Ausência de recurso opcional não pode matar o menu nem produzir falso erro.

## Lei de estado
- 🟢 `PROVED`: ação executada e pós-condição medida com sucesso.
- 🔵 `READY`: capacidade disponível para execução, ainda não provada no alvo.
- 🟡 `SETUP`: configuração humana/credencial ainda precisa ser fornecida.
- 🟠 `BLOCKED`: pré-requisito obrigatório impediu a ação.
- ⚪ `OPTIONAL`: ausência aceitável; o restante do instalador continua funcionando.
- 🟣 `UNKNOWN`: evidência insuficiente ou pós-condição não fechou.

`ACTION != PROOF` e `UNKNOWN != PASS`.

## Camadas
```text
CENTRALDARK PRODUCT
        │
        ▼
DETERMINISTIC INSTALLER CORE
        │
        ├─ probes puros
        ├─ state machine
        ├─ menu/wizard
        ├─ variações textuais determinísticas
        └─ proof-after-action
        │
        ▼
install.sh CANÔNICO
        │
        ├─ VPS/base
        ├─ pastas
        ├─ MCP
        ├─ Cloudflare/DNS
        ├─ dependências
        └─ serviços existentes
```

O Beta 1 não duplica as rotinas de instalação. Ele orquestra o `install.sh` existente e mede o resultado.

## Providerless-first
O provider de IA é uma capacidade adicional, não boot dependency do instalador.

```text
nenhum provider
→ OPTIONAL
→ menu continua vivo
→ configuração continua disponível
→ instalação determinística continua
```

Se um provider/router aparecer e responder, o estado pode subir para `READY/PROVED` conforme a medição. Nunca se pinta verde apenas porque uma variável ou arquivo existe.

## Tokenless-first
Cloudflare sem token é `SETUP`, não falha global.

```text
sem token
→ mostrar assistente
→ permitir voltar ao menu
→ impedir DNS APPLY
→ nenhuma exceção sem nexo
```

A opção DNS só pode executar mutação quando a pré-condição do Cloudflare estiver satisfeita.

## Conversa sem LLM
O instalador pode parecer vivo sem depender de IA. As mensagens são escolhidas por código puro a partir de `session_id + chave`, produzindo pequenas variações reproduzíveis.

Isso separa:
- `CONVERSATIONAL_UI`: apresentação e orientação.
- `DETERMINISTIC_ENGINE`: decisão e execução.
- `AI_PROVIDER`: enriquecimento opcional futuro.

## CentralDark Full Package
Um produto não precisa virar um binário monolítico. O pacote completo é uma matriz versionada de componentes.

```text
CentralDark Full Bundle
├─ VPS/Base
├─ CentralDark CLI
├─ Site/Apps
├─ MCP / Router
├─ Hermes / HERMES-CORE
├─ Obsidian Grafo Vivo
├─ Remote Bridge / Tray
├─ Observatory / Harness
└─ manifest + checksums + receipts
```

Cada componente pode atualizar separadamente. O pacote FULL só ganha nova versão quando a combinação pinada é testada em conjunto.

`COMPONENT_UPDATED != FULL_PACKAGE_PROVED`

## Ciclo de release
```text
component update
→ manifest candidate
→ staged install
→ self-tests
→ integration probes
→ counterproof
→ package receipt
→ FULL release
```

A release completa deve carregar versão + data, checksums, manifesto, changelog, third-party notices quando aplicável e rollback para o pacote anterior.

## Owners já reconhecidos
- VPS/infra: `install.sh`.
- Hermes: `apps/modulos/HERMES-CORE`.
- Obsidian: `apps/modulos/obsidian-plugin-grafo-vivo`; release pública existente `obsidian-plugin-v0.5.0`.
- Remote: reutilizar lineage do Remote Bridge/Tray; `PROCESSO_ATIVO != DEVICE_ONLINE`.

## OWNER_GAP atual
A embalagem final de `CentralDark CLI + site/apps + desktop distribution` ainda precisa ter seus owners canônicos medidos antes de entrar no instalador FULL. `OWNER_GAP` não autoriza criar arquitetura paralela.

## Beta 1 implementado nesta branch
- `scripts/installer/centraldark-installer-deterministic-beta1.sh`
- `scripts/installer/centraldark-installer-deterministic-beta1.test.sh`
- `scripts/installer/full-package.manifest.json`

## Gate para virar entrada oficial
1. `bash -n` passa.
2. teste providerless passa.
3. teste tokenless passa.
4. nenhuma opção opcional quebra o menu.
5. pós-probes não produzem falso-verde.
6. compatibilidade com o `install.sh` canônico é provada em sandbox/VPS de teste.
7. só depois integrar o wrapper ao comando `menu`/entrada oficial.

Até o gate 6/7: **Beta 1 candidato, não instalador oficial promovido**.
