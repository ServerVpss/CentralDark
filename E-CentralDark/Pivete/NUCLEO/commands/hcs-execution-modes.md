# COMANDO - hcs-execution-modes.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\hcs-execution-modes.md
**SHA:** 07dcf74e1c23ec8b
**Timestamp:** 2026-08-28T02:02:34.400125
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npx aios health-check --mode=full --report
- run: |
- - run: npx aios health-check --mode=quick

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traducción: ES | Original: /docs/en/architecture/hcs-execution-modes.md | Sincronización: 2026-01-26 -->

# Especificación de Modos de Ejecución HCS

> 🌐 [EN](../../architecture/hcs-execution-modes.md) | [PT](../../pt/architecture/hcs-execution-modes.md) | **ES**

---

**Versión:** 1.0
**Estado:** Propuesto
**Creado:** 2025-12-30
**Historia:** Investigación HCS-1
**Autor:** @architect (Aria) vía @dev (Dex)

---

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Hallazgos de Investigación](#hallazgos-de-investigación)
- [Matriz de Comparación de Modos de Ejecución](#matriz-de-comparación-de-modos-de-ejecución)
- [Configuración Recomendada](#configuración-recomendada)
- [Especificaciones de Modos](#especificaciones-de-modos)
- [Directrices de Implementación](#directrices-de-implementación)

---

## Resumen Ejecutivo

Este documento define los modos de ejecución para el Sistema de Verificación de Salud de AIOS (HCS), basado en investigación de mejores prácticas de la industria de Kubernetes, VS Code, Terraform, npm/yarn, y patrones CLI "doctor" (Flutter, Homebrew, WP-CLI).

### Recomendaciones Clave

1. **Modo Principal:** Manual bajo demanda (comando `*health-check`)
2. **Modo Secundario:** Integración CI programada (trigger post-merge)
3. **Modo Opcional:** Verificaciones en segundo plano del IDE (para usuarios avanzados)
4. **NO Recomendado:** Hooks pre-commit (muy lentos, crean fricción)

---

## Hallazgos de Investigación

### Patrones de la Industria Analizados

| Sistema                     | Patrón de Verificación de Salud         | Disparador               | Hallazgo Clave                                              |
| --------------------------- | --------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| **Kubernetes**              | Sondas de Liveness/Readiness/Startup    | Periódico (configurable) | Diferenciar entre "vivo" y "listo para servir"              |
| **VS Code**                 | Bisección de extensiones, integridad    | Bajo demanda + fondo     | Aislamiento previene fallas en cascada                      |
| **Terraform**               | Detección de drift con `terraform plan` | Manual + CI programado   | Detectar vs. remediar son pasos separados                   |
| **npm/yarn**                | Integridad de lockfile, `npm audit`     | Al instalar + manual     | Hashes criptográficos previenen manipulación                |
| **Flutter/Homebrew doctor** | Comando CLI `doctor`                    | Bajo demanda             | Salida categorizada (✅ ⚠️ ❌) con correcciones accionables |

### Lecciones Clave Aprendidas

1. **Patrón de Sondas Kubernetes:**
   - Liveness: "¿Está vivo?" → Reiniciar si está muerto
   - Readiness: "¿Puede servir tráfico?" → Remover del balanceador si no está listo
   - Startup: "¿Ha terminado de iniciar?" → Deshabilitar otras sondas hasta que esté listo
   - **Aplicable a HCS:** Usar diferentes categorías de verificación con niveles de severidad apropiados

2. **Patrón de Extensiones VS Code:**
   - Extensiones corren en proceso aislado → falla no colapsa VS Code
   - Verificaciones de integridad en segundo plano detectan instalaciones corruptas
   - Extensiones maliciosas se auto-remueven vía lista de bloqueo
   - **Aplicable a HCS:** Auto-reparación no debe arriesgar estabilidad del sistema

3. **Patrón de Drift Terraform:**
   - `terraform plan` detecta drift sin modificar
   - Remediación es un paso separado con `terraform apply`
   - Plans programados en CI proporcionan monitoreo continuo
   - **Aplicable a HCS:** Detección y remediación deben ser pasos separados y controlables

4. **Patrón de Integridad npm/yarn:**
   - Hashes criptográficos en lockfile verifican integridad de paquetes
   - `npm audit` corre separadamente de install
   - `--update-checksums` permite recuperación controlada
   - **Aplicable a HCS:** Respaldos antes de cualquier modificación de auto-reparación

5. **Patrón CLI Doctor (Flutter, Homebrew, WP-CLI):**
   - Ejecución bajo demanda, no bloquea flujos de trabajo
   - Salida categorizada: éxito, advertencia, error
   - Sugerencias accionables con comandos para copiar y pegar
   - Extensible vía verificaciones personalizadas (WP-CLI `doctor.yml`)
   - **Aplicable a HCS:** Modelo de ejecución principal

---

## Matriz de Comparación de Modos de Ejecución

| Modo                         | Disparador         | Duración | Impacto UX               | Caso de Uso                 | Recomendación     |
| ---------------------------- | ------------------ | -------- | ------------------------ | --------------------------- | ----------------- |
| **Manual** (`*health-check`) | Comando de usuario | 10-60s   | Ninguno (usuario inicia) | Diagnóstico bajo demanda    | ✅ **Principal**  |
| **Hook pre-commit**          | `git commit`       | 10-30s   | Alta fricción            | Detectar problemas temprano | ❌ No recomendado |
| **Hook post-commit**  
```

---

# COMANDO - hcs-execution-modes.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\hcs-execution-modes.md
**SHA:** 49bbd4306f8b38d3
**Timestamp:** 2026-08-28T02:02:38.741904
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npx aios health-check --mode=full --report
- run: |
- - run: npx aios health-check --mode=quick

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/hcs-execution-modes.md | Sincronização: 2026-01-26 -->

# Especificação de Modos de Execução do HCS

> 🌐 [EN](../../architecture/hcs-execution-modes.md) | **PT** | [ES](../../es/architecture/hcs-execution-modes.md)

---

**Versão:** 1.0
**Status:** Proposto
**Criado:** 2025-12-30
**Story:** Investigação HCS-1
**Autor:** @architect (Aria) via @dev (Dex)

---

## Índice

- [Resumo Executivo](#resumo-executivo)
- [Descobertas da Pesquisa](#descobertas-da-pesquisa)
- [Matriz de Comparação de Modos de Execução](#matriz-de-comparação-de-modos-de-execução)
- [Configuração Recomendada](#configuração-recomendada)
- [Especificações dos Modos](#especificações-dos-modos)
- [Diretrizes de Implementação](#diretrizes-de-implementação)

---

## Resumo Executivo

Este documento define os modos de execução para o Sistema de Verificação de Saúde do AIOS (HCS), baseado em pesquisa de melhores práticas da indústria do Kubernetes, VS Code, Terraform, npm/yarn e padrões CLI "doctor" (Flutter, Homebrew, WP-CLI).

### Principais Recomendações

1. **Modo Primário:** Manual sob demanda (comando `*health-check`)
2. **Modo Secundário:** Integração CI agendada (trigger pós-merge)
3. **Modo Opcional:** Verificações em background na IDE (para usuários avançados)
4. **NÃO Recomendado:** Hooks de pré-commit (muito lento, cria atrito)

---

## Descobertas da Pesquisa

### Padrões da Indústria Analisados

| Sistema                     | Padrão de Health Check                        | Gatilho                  | Insight Principal                                      |
| --------------------------- | --------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| **Kubernetes**              | Probes de Liveness/Readiness/Startup          | Periódico (configurável) | Diferenciar entre "vivo" e "pronto para servir"        |
| **VS Code**                 | Bisect de extensão, integridade de instalação | Sob demanda + background | Isolamento previne falhas em cascata                   |
| **Terraform**               | Detecção de drift com `terraform plan`        | Manual + CI agendado     | Detectar vs. remediar são etapas separadas             |
| **npm/yarn**                | Integridade de lockfile, `npm audit`          | Na instalação + manual   | Hashes criptográficos previnem adulteração             |
| **Flutter/Homebrew doctor** | Comando CLI `doctor`                          | Sob demanda              | Saída categorizada (✅ ⚠️ ❌) com correções acionáveis |

### Lições Principais Aprendidas

1. **Padrão de Probes do Kubernetes:**
   - Liveness: "Está vivo?" → Reiniciar se morto
   - Readiness: "Pode servir tráfego?" → Remover do load balancer se não estiver pronto
   - Startup: "Terminou de iniciar?" → Desabilitar outras probes até estar pronto
   - **Aplicável ao HCS:** Usar diferentes categorias de verificação com níveis de severidade apropriados

2. **Padrão de Extensões do VS Code:**
   - Extensões rodam em processo isolado → falha não trava o VS Code
   - Verificações de integridade em background detectam instalações corrompidas
   - Extensões maliciosas são auto-removidas via lista de bloqueio
   - **Aplicável ao HCS:** Auto-recuperação não deve arriscar estabilidade do sistema

3. **Padrão de Drift do Terraform:**
   - `terraform plan` detecta drift sem modificar
   - Remediação é uma etapa separada com `terraform apply`
   - Plans agendados no CI fornecem monitoramento contínuo
   - **Aplicável ao HCS:** Detecção e remediação devem ser etapas separadas e controláveis

4. **Padrão de Integridade do npm/yarn:**
   - Hashes criptográficos no lockfile verificam integridade de pacotes
   - `npm audit` roda separadamente da instalação
   - `--update-checksums` permite recuperação controlada
   - **Aplicável ao HCS:** Backups antes de qualquer modificação de auto-recuperação

5. **Padrão CLI Doctor (Flutter, Homebrew, WP-CLI):**
   - Execução sob demanda, não bloqueando fluxos de trabalho
   - Saída categorizada: sucesso, aviso, erro
   - Sugestões acionáveis com comandos para copiar e colar
   - Extensível via verificações customizadas (WP-CLI `doctor.yml`)
   - **Aplicável ao HCS:** Modelo de execução primário

---

## Matriz de Comparação de Modos de Execução

| Modo                         | Gatilho            | Duração | Impacto UX                     | Caso de Uso             | Recomendação                 |
| ---------------------------- | ------------------ | ------- | ------------------------------ | ----------------------- | ---------------------------- |
| **Manual** (`*health-check`) | Comando do usuário | 10-60s  | Nenhum (iniciado pelo usuário) | Diagnóstico sob demanda | ✅ **Primário**              |
| **Hook pré-commit**          | `git commit`       | 10-30s  | Alto atrito                    | Capturar problemas cedo | ❌ Não recomendado           |
| **Hook pós-commit**          | Após commit       
```