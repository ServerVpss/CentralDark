# 24 — Rebuild determinístico da VPS

Status: fundação executável, sem reset/deploy automático.

## Objetivo

A VPS é runtime descartável. A CentralDark precisa conseguir renascer a partir de fonte versionada, configuração privada e dados persistentes validados, sem copiar o estado executável de uma máquina possivelmente comprometida.

```text
REPO + LOCKS + CONFIG PRIVADA + DADOS VALIDADOS
                    ↓
             VPS LIMPA
                    ↓
          BOOTSTRAP REPRODUZÍVEL
                    ↓
              SECURITY GATES
                    ↓
                  E2E
```

## Regra de confiança

Se existe suspeita de comprometimento:

- a VPS antiga é `UNTRUSTED_SOURCE_OF_EVIDENCE`;
- antivírus/EDR/scanners são detectores e contraprovas, não restauram confiança no host;
- não copiar binários, ambientes virtuais, `node_modules`, imagens Docker locais, executáveis, unidades systemd ou scripts gerados da VPS antiga para a nova;
- restaurar somente dados presentes em allowlist explícita e depois de validação;
- credenciais existentes devem ser tratadas como potencialmente expostas e rotacionadas antes do cutover;
- um scanner verde isolado nunca autoriza `TRUST_HOST=true`.

## Fases

### 0. Inventário read-only da VPS antiga

```bash
bash scripts/vps-organizacao/003-inventario-rebuild-readonly.sh
bash scripts/vps-organizacao/003-inventario-rebuild-readonly.test.sh
```

Contrato:

- zero instalação;
- zero remoção;
- zero restart/reload;
- zero alteração de firewall, DNS, Caddy, PM2 ou Docker;
- valores de `.env` não são coletados; apenas nomes de chaves e metadados;
- fingerprints de chaves SSH, HEADs Git, portas, serviços, volumes e hashes são registrados;
- saída recebe `SHA256SUMS`.

O próprio relatório deve continuar declarando:

```text
TRUST_CURRENT_HOST=NO
MALWARE_VERDICT=NOT_PROVEN
```

### 1. Preservar evidência fora da VPS

Copiar os relatórios e backups de dados para destino externo confiável. A cópia deve manter hash antes/depois. Não usar a própria VPS antiga como única cópia de segurança.

### 2. Classificar persistência

Cada item deve cair exatamente em uma classe:

| Classe | Exemplo | Destino |
|---|---|---|
| Fonte | código Git | reconstruir do commit/branch aprovado |
| Configuração privada | tokens, senhas, chaves, URLs privadas | reinserir pelo sistema de configuração; nunca copiar do Git |
| Dados | banco, uploads, sessões explicitamente preserváveis | backup + validação + restore |
| Runtime descartável | `node_modules`, venv, cache, binários, containers | NÃO restaurar; reconstruir |
| Evidência suspeita | executável desconhecido, cron inesperado, persistência estranha | quarentena/análise; NÃO restaurar |

### 3. Rotação de credenciais

Antes do cutover, rotacionar credenciais que estiveram presentes no host antigo ou em histórico inseguro. O repositório guarda somente contrato de configuração: nomes, tipos, obrigatoriedade e origem lógica. Valores privados entram manualmente pelo configurador autorizado.

```text
BOOTSTRAP != SECRET STORE
CONFIGURADOR HUMANO → SECRET STORE/RUNTIME
REPO → SCHEMA, NUNCA VALOR
```

### 4. Baseline de VPS limpa

A nova máquina deve nascer de imagem conhecida do provedor e receber somente dependências declaradas. Nada é copiado de `/usr/local/bin`, `/etc/systemd`, `/root`, venv, PM2 home ou Docker storage da máquina antiga.

Antes do bootstrap:

```bash
bash scripts/vps-organizacao/004-preflight-vps-limpa.sh
bash scripts/vps-organizacao/004-preflight-vps-limpa.test.sh
```

`READY_FOR_BOOTSTRAP=YES` não significa “sem malware”; significa apenas que o baseline material da VPS nova está compatível e sem roots/runtimes conhecidos da instalação anterior. O script mantém `MALWARE_VERDICT=NOT_PROVEN`.

### 5. Estratégia determinística por ecossistema

Não existe linguagem vencedora global. A escolha é por componente e evidência.

- **Python API existente:** FastAPI + Pydantic v2; projeto com `pyproject.toml`; resolução travada em `uv.lock`; instalação com `uv sync --locked`.
- **Node/TypeScript existente:** versão de Node declarada; package manager declarado; lockfile obrigatório; instalação limpa com `npm ci` ou equivalente estrito do owner existente.
- **Frontend React/Vite existente:** preservar TypeScript/React quando saudável; build deve nascer somente de fonte + lockfile.
- **Rust:** usar quando daemon/CLI/caminho crítico demonstrar vantagem material de segurança, previsibilidade ou desempenho. Não migrar serviço saudável só por preferência tecnológica.
- **Docker:** imagem por digest ou versão imutável; proibir `latest` em runtime crítico quando o owner permitir pinagem.
- **Banco/Supabase:** schema/migrações versionados; dados entram por restore validado, nunca por cópia de diretório interno de banco em execução.

### 6. Configuração manual pelo sistema do CHEFE

```text
VPS LIMPA
  ↓
BOOTSTRAP
  ↓
SISTEMA DE CONFIGURAÇÃO
  ├─ solicita somente campos necessários
  ├─ nunca imprime segredo
  ├─ valida formato
  ├─ grava com permissão mínima
  └─ gera recibo apenas com nomes/status, nunca valores
  ↓
SERVIÇOS
```

Uma variável ausente deve falhar fechado com o nome da chave faltante. Fallback secreto hardcoded é proibido.

### 7. Restore allowlisted

O restore começa vazio. Cada conjunto de dados precisa de dono, formato, hash/contagem e teste pós-restore. Executável encontrado dentro de backup de dados não é executado automaticamente.

### 8. Segurança pós-build

Executar:

```bash
bash scripts/vps-organizacao/005-security-gate-pos-build.sh /root/CentralDark /root/Multizap/restore-staging
bash scripts/vps-organizacao/005-security-gate-pos-build.test.sh
```

O gate é detect/block-only:

- Trivy verifica vulnerabilidades, misconfigurações e secrets de severidade HIGH/CRITICAL no repo/runtime fonte;
- ClamAV varre recursivamente o staging de dados quando restore é aplicável;
- nenhuma detecção é removida automaticamente;
- ferramenta obrigatória ausente vira `BLOCKED`, não PASS;
- relatório bruto fica local com permissão restrita e recebe hash;
- nenhum resultado `UNKNOWN`, `SKIPPED` ou scanner ausente vira PASS.

### 9. E2E e cutover

Só existe `READY_FOR_CUTOVER=true` quando o denominador aplicável estiver declarado e fechado: serviços esperados, healthchecks, rotas, banco, integrações, persistência e segurança.

Reset/reinstalação da VPS antiga é etapa destrutiva separada. Ela só acontece após autorização humana aplicável ao ciclo e depois de backup/restore comprovados.

## Critério de conclusão desta fundação

```text
INVENTORY_SCRIPT=PASS
INVENTORY_READ_ONLY_GUARD=PASS
CLEAN_VPS_PREFLIGHT=PASS
CLEAN_VPS_READ_ONLY_GUARD=PASS
POST_BUILD_SECURITY_GATE=IMPLEMENTED
POST_BUILD_SECURITY_GUARD=PASS
CONFIG_BOUNDARY=DEFINED
RESTORE_ALLOWLIST_POLICY=DEFINED
MALWARE_TRUST_MODEL=DEFINED
RESET_EXECUTED=NO
DEPLOY_EXECUTED=NO
```

O próximo delta é transformar o inventário real em manifesto de componentes e, com esse denominador, fechar bootstrap/config/restore por owner existente em vez de criar uma arquitetura paralela.
