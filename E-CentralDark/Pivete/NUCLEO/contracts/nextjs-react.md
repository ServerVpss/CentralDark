# CONTRATO - nextjs-react.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\data\tech-presets\nextjs-react.md
**SHA:** 516501997542635f
**Timestamp:** 2026-08-28T02:02:02.504691
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- 1. **Contract Pattern:** Features ONLY expose via `.contract.ts` files

### Ouro Bruto (primeiros 5000 chars)
```
# Next.js + React Tech Preset

> Preset de arquitetura otimizado para desenvolvimento fullstack com Next.js e React, focado em máxima eficiência com Claude Code.

---

## Metadata

```yaml
preset:
  id: nextjs-react
  name: 'Next.js + React Fullstack Preset'
  version: 1.0.0
  description: 'Arquitetura otimizada para aplicações fullstack com Next.js 16+, React, TypeScript e padrões que maximizam a eficiência do Claude Code'
  technologies:
    - Next.js 16+ (App Router + Proxy)
    - React 18+
    - TypeScript
    - Tailwind CSS
    - Zustand
    - React Query
    - Zod
    - Vitest
    - Playwright
  suitable_for:
    - 'Aplicações web fullstack'
    - 'SaaS products'
    - 'E-commerce'
    - 'Dashboards administrativos'
    - 'Aplicações com SSR/SSG'
  not_suitable_for:
    - 'Aplicações mobile-only (use React Native)'
    - 'Microsserviços backend puros (use Node.js puro ou NestJS)'
    - 'Sites estáticos simples (use Astro)'
```

---

## Design Patterns (The Essential 5)

> **Critical:** Estes 5 patterns eliminam 95% dos bugs e permitem ao Claude Code trabalhar com máxima eficiência. São complementares e devem ser usados TODOS juntos.

### Pattern 1: Contract Pattern

**Purpose:** Definir APIs públicas entre features para prevenir bugs de integração

**Execution Score:** 10/10 | **Anti-Bug Score:** 10/10

````typescript
// src/features/auth/auth.contract.ts

/**
 * Public API for authentication feature
 * Other features depend ONLY on this contract, never on implementation
 *
 * @example
 * ```ts
 * class CheckoutService {
 *   constructor(private auth: AuthContract) {}
 *
 *   async process() {
 *     const user = await this.auth.getCurrentUser()
 *   }
 * }
 * ```
 */
export interface AuthContract {
  /**
   * Authenticate user with credentials
   * @throws {InvalidCredentialsError} When credentials are wrong
   * @throws {UserBlockedError} When user account is blocked
   */
  login(email: string, password: string): Promise<AuthResult>;

  /**
   * Get currently authenticated user
   * @throws {UnauthorizedError} When no user is authenticated
   */
  getCurrentUser(): Promise<User>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Sign out current user
   */
  logout(): Promise<void>;
}

export type AuthResult = {
  user: User;
  token: string;
  expiresAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};
````

**Bugs Eliminated:**

- Feature A expects string, Feature B returns number
- Method renamed breaks all consumers
- Parameters in wrong order
- Unexpected return types
- Circular dependencies between features

**Why Claude Code Excels:**

- TypeScript enforces contracts at compile time
- Claude reads contract (50 lines) instead of implementation (2000 lines)
- Impossible to break contract without TypeScript errors

---

### Pattern 2: Service Pattern

**Purpose:** Encapsular lógica de negócio em serviços testáveis e reutilizáveis

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```typescript
// src/features/auth/services/auth.service.ts

import { AuthContract, AuthResult, User } from '../auth.contract';
import { UserRepository } from '../repositories/user.repository';
import { EventBus } from '@/shared/events/eventBus';

export class AuthService implements AuthContract {
  constructor(
    private userRepo: UserRepository,
    private eventBus: EventBus
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    // 1. Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // 2. Find user
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError('Invalid credentials');
    }

    // 3. Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError('Invalid credentials');
    }

    // 4. Check if blocked
    if (user.isBlocked) {
      throw new UserBlockedError('Account is blocked');
    }

    // 5. Generate token
    const token = this.generateToken(user);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 6. Emit event
    this.eventBus.emit('auth:login', user);

    return {
      user: this.sanitizeUser(user),
      token,
      expiresAt,
    };
  }

  // ... other methods
}

// Export singleton instance
export const authService = new AuthService(userRepository, eventBus);
```

**Bugs Eliminated:**

- Business logic scattered across components
- Code duplication
- Impossible to test without UI
- Inconsistent error handling
- Side effects in unexpected places

---

### Pattern 3: Repository Pattern

**Purpose:** Isolar lógica de acesso a dados da lógica de negócio

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```typescript
// src/features/auth/repositories/user.repository.ts

import { db } from '@/lib/database';

export c
```