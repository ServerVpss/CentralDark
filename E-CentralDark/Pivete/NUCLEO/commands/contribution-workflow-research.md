# COMANDO - contribution-workflow-research.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\contribution-workflow-research.md
**SHA:** 6139a13bdb7a1913
**Timestamp:** 2026-08-28T02:02:34.339251
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traducción: ES | Original: /docs/en/architecture/contribution-workflow-research.md | Sincronización: 2026-01-26 -->

# Investigación de Flujo de Trabajo de Contribución Externa

> 🌐 [EN](../../architecture/contribution-workflow-research.md) | [PT](../../pt/architecture/contribution-workflow-research.md) | **ES**

---

**Historia:** COLLAB-1
**Fecha:** 2025-12-30
**Autor:** @dev (Dex) + @devops (Gage)
**Estado:** Completo

---

## Resumen Ejecutivo

Este documento consolida los hallazgos de investigación sobre mejores prácticas para flujos de trabajo de contribuidores externos en proyectos de código abierto, específicamente para habilitar contribuciones seguras de la comunidad a agentes y tareas de AIOS.

---

## 1. Mejores Prácticas de Protección de Ramas en GitHub

### 1.1 Recomendaciones de la Industria

Basado en investigación de [GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [DEV Community](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3), y [Legit Security](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following):

| Regla de Protección                   | Recomendación            | Justificación                                    |
| ------------------------------------- | ------------------------ | ------------------------------------------------ |
| **Revisiones de PR requeridas**       | Habilitar con 1-2 revisores | Previene código sin revisar de hacer merge     |
| **Requerir revisiones de code owner** | Habilitar                | Asegura que expertos del dominio revisen cambios |
| **Descartar revisiones obsoletas**    | Habilitar                | Fuerza re-revisión después de nuevos cambios     |
| **Status checks requeridos**          | CI debe pasar            | Detecta fallos de build/test antes del merge     |
| **Requerir resolución de conversación**| Habilitar               | Asegura que todo feedback sea atendido           |
| **Restringir force pushes**           | Deshabilitar force push  | Previene reescritura del historial               |
| **Requerir historial lineal**         | Opcional                 | Historial git más limpio (considerar para monorepos)|

### 1.2 Hallazgos Clave

> "Los colaboradores con acceso de escritura a un repositorio tienen permisos completos de escritura en todos sus archivos e historial. Aunque esto es bueno para la colaboración, no siempre es deseable."

**Punto Crítico:** La protección de ramas es una de las consideraciones de seguridad más importantes. Puede prevenir que código no deseado sea pusheado a producción.

### 1.3 Configuración Recomendada para Open Source

```yaml
branch_protection:
  require_pull_request_reviews:
    required_approving_review_count: 1 # Al menos 1 aprobación
    dismiss_stale_reviews: true # Re-revisar después de cambios
    require_code_owner_reviews: true # Aprobación de experto del dominio
    require_last_push_approval: false # Opcional para OSS

  required_status_checks:
    strict: true # Rama debe estar actualizada
    contexts:
      - lint
      - typecheck
      - build
      - test # Crítico para calidad

  restrictions:
    users: []
    teams: ['maintainers']

  allow_force_pushes: false
  allow_deletions: false
  required_conversation_resolution: true # Atender todo feedback
```

---

## 2. Mejores Prácticas de Configuración CodeRabbit

### 2.1 Documentación Oficial

De [CodeRabbit Docs](https://docs.coderabbit.ai/getting-started/yaml-configuration) y [awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit):

**Elementos Clave de Configuración:**

| Elemento                    | Propósito                      | Recomendación                             |
| --------------------------- | ------------------------------ | ----------------------------------------- |
| `language`                  | Idioma de respuesta            | Coincidir con idioma del proyecto (pt-BR o en-US) |
| `reviews.auto_review`       | Revisiones automáticas de PR   | Habilitar para OSS                        |
| `reviews.path_instructions` | Reglas de revisión por ruta    | Esencial para validación de agentes/tareas|
| `chat.auto_reply`           | Responder a comentarios        | Habilitar para mejor experiencia del contribuidor|

### 2.2 Ejemplos del Mundo Real

**TEN Framework (.coderabbit.yaml):**

```yaml
language: 'en-US'
reviews:
  profile: 'chill'
  high_level_summary: true
  auto_review:
    enabled: true
tools:
  ruff:
    enabled: true
  gitleaks:
    enabled: true
```

**Proyecto PHARE:**

```yaml
path_instructions:
  '**/*.cpp':
    - 'Verificar fugas de memoria'
    - 'Verificar seguridad de hilos'
tools:
  shellcheck:
    enabled: true
  markdownlint:
    enabled: true
```

**NVIDIA NeMo RL:**

```yaml
auto_title_instructions: |
  Formato: "<categoría>: <título>"
  Categorías: feat, fix, docs, style, refactor, perf, test, bui
```

---

# COMANDO - contribution-workflow-research.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\contribution-workflow-research.md
**SHA:** b991ebc9d5f54522
**Timestamp:** 2026-08-28T02:02:38.654093
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/contribution-workflow-research.md | Sincronização: 2026-01-26 -->

# Pesquisa de Workflow de Contribuição Externa

> 🌐 [EN](../../architecture/contribution-workflow-research.md) | **PT** | [ES](../../es/architecture/contribution-workflow-research.md)

---

**Story:** COLLAB-1
**Data:** 2025-12-30
**Autor:** @dev (Dex) + @devops (Gage)
**Status:** Completo

---

## Resumo Executivo

Este documento consolida as descobertas de pesquisa sobre melhores práticas para workflows de contribuidores externos em projetos open source, especificamente para habilitar contribuições seguras da comunidade para agentes e tarefas do AIOS.

---

## 1. Melhores Práticas de Proteção de Branch no GitHub

### 1.1 Recomendações da Indústria

Baseado em pesquisa da [GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [DEV Community](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3), e [Legit Security](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following):

| Regra de Proteção                   | Recomendação              | Justificativa                                  |
| ----------------------------------- | ------------------------- | ---------------------------------------------- |
| **Reviews de pull request obrigatórios** | Habilitar com 1-2 revisores | Previne código não revisado de ser mergeado   |
| **Exigir reviews de code owner**    | Habilitar                 | Garante que especialistas de domínio revisem mudanças relevantes |
| **Descartar reviews obsoletas**     | Habilitar                 | Força re-review após novas mudanças            |
| **Status checks obrigatórios**      | CI deve passar            | Captura falhas de build/teste antes do merge   |
| **Exigir resolução de conversas**   | Habilitar                 | Garante que todo feedback seja endereçado      |
| **Restringir force pushes**         | Desabilitar force push    | Previne reescrita de histórico                 |
| **Exigir histórico linear**         | Opcional                  | Histórico git mais limpo (considerar para monorepos) |

### 1.2 Insights Principais

> "Colaboradores com acesso de escrita a um repositório têm permissões completas de escrita em todos os seus arquivos e histórico. Embora isso seja bom para colaboração, nem sempre é desejável."

**Ponto Crítico:** Proteção de branch é uma das considerações de segurança mais importantes. Pode prevenir que código indesejado seja enviado para produção.

### 1.3 Configurações Recomendadas para Open Source

```yaml
branch_protection:
  require_pull_request_reviews:
    required_approving_review_count: 1 # Pelo menos 1 aprovação
    dismiss_stale_reviews: true # Re-review após mudanças
    require_code_owner_reviews: true # Aprovação de especialista de domínio
    require_last_push_approval: false # Opcional para OSS

  required_status_checks:
    strict: true # Branch deve estar atualizado
    contexts:
      - lint
      - typecheck
      - build
      - test # Crítico para qualidade

  restrictions:
    users: []
    teams: ['maintainers']

  allow_force_pushes: false
  allow_deletions: false
  required_conversation_resolution: true # Endereçar todo feedback
```

---

## 2. Melhores Práticas de Configuração do CodeRabbit

### 2.1 Documentação Oficial

Da [CodeRabbit Docs](https://docs.coderabbit.ai/getting-started/yaml-configuration) e [awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit):

**Elementos Principais de Configuração:**

| Elemento                    | Propósito                      | Recomendação                           |
| --------------------------- | ------------------------------ | -------------------------------------- |
| `language`                  | Idioma de resposta             | Corresponder ao idioma do projeto (pt-BR ou en-US) |
| `reviews.auto_review`       | Reviews automáticos de PR      | Habilitar para OSS                     |
| `reviews.path_instructions` | Regras de review customizadas por caminho | Essencial para validação de agent/task |
| `chat.auto_reply`           | Responder a comentários        | Habilitar para melhor experiência do contribuidor |

### 2.2 Exemplos do Mundo Real

**TEN Framework (.coderabbit.yaml):**

```yaml
language: 'en-US'
reviews:
  profile: 'chill'
  high_level_summary: true
  auto_review:
    enabled: true
tools:
  ruff:
    enabled: true
  gitleaks:
    enabled: true
```

**Projeto PHARE:**

```yaml
path_instructions:
  '**/*.cpp':
    - 'Verificar memory leaks'
    - 'Verificar thread safety'
tools:
  shellcheck:
    enabled: true
  markdownlint:
    enabled: true
```

**NVIDIA NeMo RL:**

```yaml
auto_title_instructions: |
  Formato: "<categoria>: <título>"
  Categorias: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  Título deve ter <= 80 caracteres
```


```