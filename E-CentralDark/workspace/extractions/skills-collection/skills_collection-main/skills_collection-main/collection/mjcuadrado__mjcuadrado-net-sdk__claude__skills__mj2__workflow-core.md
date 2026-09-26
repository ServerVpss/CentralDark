---
name: workflow-core
description: MJ² core workflow - 4-step development cycle
version: 0.1.0
tags: [mj2, workflow, methodology]
---

# MJ² Workflow Core

El ciclo de desarrollo en 4 pasos de mj2.

## Overview

```
0. PROJECT → 1. PLAN → 2. RUN → 3. SYNC
   ↓            ↓         ↓        ↓
Initialize   SPEC     TDD     Docs
```

**Filosofía:** Cada feature sigue el mismo ciclo disciplinado.

---

## Step 0: PROJECT (Initialize)

### Propósito
Inicializar o optimizar proyecto .NET 9.

### Comando
```bash
/mj2:0-project
```

### Agente
`project-manager.md`

### Lo que hace
1. Detecta si proyecto existe
2. **Nuevo:** Entrevista usuario, crea estructura
3. **Existente:** Analiza, sugiere mejoras
4. Crea `.mjcuadrado-net-sdk/`
5. Recomienda Skills

### Output
```
✅ Proyecto inicializado
📁 .mjcuadrado-net-sdk/
   ├── config.json
   ├── project/
   ├── specs/
   └── memory/

⚙️ Configuración:
   - Framework: .NET 9
   - Mode: personal/team
   - Language: es/en

🎯 Siguiente: /mj2:1-plan "feature"
```

### Skills usados
- foundation/trust.md
- foundation/tags.md
- foundation/specs.md
- dotnet/csharp.md

### Cuándo usar
- Inicio de proyecto nuevo
- Optimización de proyecto existente
- Cambio de configuración

---

## Step 1: PLAN (Specification)

### Propósito
Crear especificación clara y completa.

### Comando
```bash
/mj2:1-plan "feature description"
```

### Agente
`spec-builder.md`

### Lo que hace
1. Analiza descripción
2. Detecta dominio (AUTH, USER, etc.)
3. Hace preguntas clarificadoras
4. Genera SPEC-{DOMAIN}-{NNN}
5. Crea spec.md (EARS format)
6. Crea plan.md (fases)
7. Crea acceptance.md (criterios)
8. Crea rama feature/SPEC-{ID}
9. Commit inicial

### Preguntas típicas

#### AUTH domain
```
- ¿Método de autenticación?
  → Email/password, OAuth, SAML
- ¿Requisitos de contraseña?
  → Min length, complexity
- ¿Token JWT? ¿Expiración?
  → 15min, 1h, 24h
- ¿MFA?
  → SMS, TOTP, email
- ¿Refresh token?
  → Yes/no, duration
```

#### USER domain
```
- ¿Qué campos en perfil?
  → Name, email, photo, bio
- ¿Puede cambiar email?
  → Yes/no, verification
- ¿Upload de foto?
  → Max size, formats
- ¿Privacy settings?
  → Public/private profile
```

#### API domain
```
- ¿Método HTTP?
  → GET, POST, PUT, DELETE
- ¿Request/Response format?
  → JSON, XML
- ¿Autenticación necesaria?
  → JWT, API key, none
- ¿Rate limiting?
  → Requests per minute
- ¿Pagination?
  → Page size, format
```

### Output
```
✅ SPEC creada: SPEC-AUTH-001
📋 Título: User Authentication with JWT
🏷️  Dominio: AUTH
📊 Complejidad: Media
⏱️  Estimación: 8-12 horas

📁 Archivos:
   docs/specs/SPEC-AUTH-001/
   ├── spec.md          (EARS format)
   ├── plan.md          (3 fases)
   └── acceptance.md    (5 escenarios)

🌿 Git:
   Rama: feature/SPEC-AUTH-001
   Commit: "spec(AUTH-001): create specification"

🎯 Siguiente: /mj2:2-run AUTH-001
```

### Skills usados
- foundation/specs.md (formato SPEC)
- foundation/ears.md (sintaxis EARS)
- foundation/tags.md (@SPEC: tags)
- foundation/git.md (branching)

### Cuándo usar
- Nueva feature
- Cambio grande en feature existente
- Clarificar requisitos ambiguos

---

## Step 2: RUN (Implementation)

### Propósito
Implementar con TDD estricto.

### Comando
```bash
/mj2:2-run SPEC-ID
```

### Agente
`tdd-implementer.md`

### Ciclo TDD Completo

#### Fase RED (🔴)
**Objetivo:** Tests que fallan

1. Lee SPEC completa
2. Diseña tests basados en requirements
3. Crea tests que fallan
4. Verifica que fallan
5. Commit: `🔴 test(SPEC-ID): add failing tests`

**Ejemplo:**
```csharp
// @TEST:EX-AUTH-001:FR-1
[Fact]
public void Login_ValidCredentials_ReturnsToken()
{
    // Arrange
    var service = new AuthService(/* mocks */);

    // Act
    var result = service.Login("user@test.com", "password");

    // Assert
    result.Should().NotBeNull();
    result.Token.Should().NotBeNullOrEmpty();
}

// ❌ Test fails: AuthService.Login not implemented
```

#### Fase GREEN (🟢)
**Objetivo:** Hacer pasar los tests (implementación mínima)

1. Implementa código mínimo
2. Hace pasar los tests
3. Verifica que todos pasan
4. Commit: `🟢 feat(SPEC-ID): implement feature`

**Ejemplo:**
```csharp
// @CODE:EX-AUTH-001:FR-1
public LoginResult Login(string email, string password)
{
    // Implementación mínima
    var user = _repository.GetByEmail(email);
    if (user == null || !VerifyPassword(password, user.PasswordHash))
        throw new UnauthorizedException();

    return new LoginResult { Token = GenerateToken(user) };
}

// ✅ All tests pass
```

#### Fase REFACTOR (♻️)
**Objetivo:** Mejorar calidad sin romper tests

1. Aplica TRUST 5 principles
2. Mejora código
3. Mantiene tests verdes
4. Valida coverage ≥85%
5. Commit: `♻️ refactor(SPEC-ID): improve quality`

**Mejoras típicas:**
- Extract methods (métodos ≤50 líneas)
- Dependency injection
- Error handling
- Naming improvements
- Remove duplication

### Output
```
✅ TDD completado: SPEC-AUTH-001

📊 Estadísticas:
   Tests: 4 total, 4 passing (100%)
   Coverage: 87% (≥85% ✅)
   TRUST 5: Validado ✅

📦 Commits:
   🔴 test(AUTH-001): add failing tests
   🟢 feat(AUTH-001): implement auth service
   ♻️ refactor(AUTH-001): improve code quality

🔗 TAG Chain:
   @SPEC:EX-AUTH-001 → @TEST:EX-AUTH-001 → @CODE:EX-AUTH-001

🎯 Siguiente: /mj2:3-sync AUTH-001
```

### Skills usados
- dotnet/xunit.md (test patterns)
- dotnet/csharp.md (C# conventions)
- dotnet/ef-core.md (si usa DB)
- dotnet/aspnet-core.md (si usa API)
- foundation/trust.md (TRUST 5 validation)
- foundation/tags.md (@TEST:, @CODE: tags)

### Validación automática
Después de REFACTOR, se ejecuta automáticamente:
```bash
/mj2:quality-check AUTH-001
```

Valida:
- Tests passing: 100%
- Coverage: ≥85%
- TRUST 5: compliant
- TAG chain: @SPEC → @TEST → @CODE

### Cuándo usar
- Después de crear SPEC
- Implementar feature nueva
- Refactorizar con tests

---

## Step 3: SYNC (Documentation)

### Propósito
Sincronizar documentación con código.

### Comando
```bash
/mj2:3-sync SPEC-ID
```

### Agente
`doc-syncer.md`

### Lo que hace
1. Analiza código implementado
2. Actualiza README.md (features list)
3. Actualiza docs/architecture.md
4. Actualiza docs/api.md (si aplica)
5. Actualiza CHANGELOG.md
6. Añade @DOC: tags
7. Completa TAG chain
8. Commit: `📚 docs(SPEC-ID): sync documentation`
9. **Trigger git-manager** (personal: merge, team: PR)

### Archivos actualizados

#### README.md
```markdown
## Features

### Authentication (AUTH)
<!-- @DOC:EX-AUTH-001 -->
- ✅ User authentication with JWT
  - Email/password login
  - Token generation (24h expiration)
  - Token validation
  - Refresh token support
  - See: [SPEC-AUTH-001](docs/specs/SPEC-AUTH-001/spec.md)
```

#### CHANGELOG.md
```markdown
## [0.2.0] - 2024-11-21

### Added
- User authentication with JWT (SPEC-AUTH-001)
  - Login endpoint
  - Token generation and validation
  - Refresh token support
```

### Output
```
✅ Docs sincronizados: SPEC-AUTH-001

📝 Archivos actualizados:
   ✅ README.md
   ✅ docs/architecture.md
   ✅ docs/api.md
   ✅ CHANGELOG.md

🔗 TAG Chain completa:
   @SPEC:EX-AUTH-001 →
   @TEST:EX-AUTH-001 →
   @CODE:EX-AUTH-001 →
   @DOC:EX-AUTH-001 ✅

📦 Commit: "📚 docs(AUTH-001): sync documentation"

🔀 Git (personal mode):
   ✅ Merged to main
   ✅ Branch deleted

📝 Git (team mode):
   📝 Draft PR created
   🔗 URL: github.com/.../pull/42

🎉 Feature AUTH-001 COMPLETAMENTE TERMINADA!
```

### Skills usados
- foundation/tags.md (@DOC: tags)
- foundation/git.md (commits, PRs, merge)

### Cuándo usar
- Después de implementar feature
- Actualizar docs obsoletos
- Completar TAG chain

---

## Flujo Completo - Ejemplo

### Caso: Authentication con JWT

```bash
# 1. Inicializar (si es nuevo proyecto)
/mj2:0-project
# Output: Proyecto listo, config.json creado

# 2. Planificar
/mj2:1-plan "User authentication with JWT"
# Agente pregunta:
#   - Método auth? Email/password
#   - Token expiration? 24h
#   - Refresh token? Yes
# Output: SPEC-AUTH-001 creado

# 3. Implementar
/mj2:2-run AUTH-001
# Ciclo TDD:
#   🔴 Tests failing (2 min)
#   🟢 Code passing (10 min)
#   ♻️ Refactor quality (5 min)
# Output: Feature implementada, coverage 87%

# 4. Sincronizar
/mj2:3-sync AUTH-001
# Docs actualizados, TAG chain completa
# Output (personal): Merged to main
# Output (team): PR created

# ✅ FEATURE COMPLETA EN ~20 MINUTOS
```

---

## Atajos y Variaciones

### Comando combinado (futuro)
```bash
# Planear + Implementar + Sincronizar
/mj2:full "User authentication with JWT"
# Ejecuta steps 1-2-3 automáticamente
```

### Solo calidad
```bash
/mj2:quality-check AUTH-001
# Valida sin implementar
```

### Solo merge
```bash
/mj2:git-merge AUTH-001
# Merge manual
```

---

## Filosofía del Workflow

### Principios

1. **SPEC-First**
   - Nunca código sin SPEC
   - SPEC es el contrato
   - Requisitos claros antes de implementar

2. **TDD Estricto**
   - RED → GREEN → REFACTOR
   - Sin excepciones
   - Tests primero, siempre

3. **Calidad No Negociable**
   - TRUST 5 siempre
   - Coverage ≥85%
   - Code review (team mode)

4. **Trazabilidad Total**
   - TAG chain completa
   - @SPEC → @TEST → @CODE → @DOC
   - Auditable

5. **Documentación Viva**
   - Docs sincronizan con código
   - README siempre actualizado
   - CHANGELOG up-to-date

### Por qué 4 pasos

- **0-PROJECT:** Base sólida, configuración correcta
- **1-PLAN:** Claridad antes de código, evita refactors
- **2-RUN:** Implementación disciplinada, calidad alta
- **3-SYNC:** Documentación coherente, equipo alineado

**No se pueden saltar pasos.**

---

## Métricas de Éxito

### Por feature
- SPEC clarity: 4.5/5
- Test coverage: ≥85%
- TRUST 5 compliance: 100%
- TAG chain complete: 100%
- Docs synced: 100%
- Time to implement: <1 day

### Por proyecto
- Features con SPEC: 100%
- Features con TDD: 100%
- Average coverage: 87%
- Docs up-to-date: 100%
- Failed builds: <5%
- Hotfixes: <10% of features

---

## Troubleshooting

### SPEC rechazada por ambigüedad
**Solución:** Volver a Step 1, hacer más preguntas

### Tests fallan después de GREEN
**Solución:** Revertir último commit, revisar implementación

### Coverage <85%
**Solución:** Agregar tests para paths no cubiertos

### Docs desincronizados
**Solución:** Ejecutar /mj2:3-sync manualmente

### Merge conflicts
**Solución:** git-manager resuelve o solicita ayuda

---

## Referencias

- [SPEC-First Development](https://github.com/mjcuadrado/docs/spec-first.md)
- [TDD by Example (Kent Beck)](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Clean Code (Robert Martin)](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Agile Principles](https://agilemanifesto.org/)
