---
name: vitest
description: Framework de testing moderno y rápido powered by Vite con API compatible con Jest
version: 0.1.0
tags: [testing, vitest, unit-test, vite, jest-compatible]
---

# Vitest Skill

## 📚 Resumen

**Vitest** es un framework de testing unitario ultra rápido powered by Vite. Proporciona una API compatible con Jest con soporte nativo para ESM, TypeScript out of the box y modo watch inteligente con HMR.

**Por qué Vitest sobre Jest:**
- ⚡ **Más rápido:** Powered by Vite's instant HMR
- 🎯 **ESM nativo:** Sin configuración necesaria
- 📘 **TypeScript:** Integrado, no necesita ts-jest
- 🔄 **Watch Mode:** Feedback instantáneo con HMR
- 🎨 **UI Mode:** Test runner visual
- ⚙️ **Compatible con Jest:** Migración fácil

---

## 🚀 Instalación y Configuración

### Instalar Vitest

```bash
npm install -D vitest @vitest/ui
# o
pnpm add -D vitest @vitest/ui
```

### Configuración

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Entorno
    environment: 'jsdom',

    // Archivos de setup
    setupFiles: ['./src/test/setup.ts'],

    // Cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },

    // Globales (opcional, para compatibilidad con Jest)
    globals: true,
  },
});
```

**Scripts en package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

## ✅ Escribir Tests

### Estructura Básica de Test

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  afterEach(() => {
    // Limpieza
  });

  it('debería sumar dos números', () => {
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });

  it('debería restar dos números', () => {
    const result = calculator.subtract(5, 3);
    expect(result).toBe(2);
  });
});
```

### Organización de Tests

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx       # Co-located
├── utils/
│   └── math/
│       ├── calculator.ts
│       └── calculator.test.ts
└── test/
    ├── setup.ts                  # Setup global
    └── helpers.ts                # Utilidades de test
```

---

## 🎯 Matchers (Aserciones)

### Matchers Comunes

```typescript
// Igualdad
expect(value).toBe(42);                    // ===
expect(object).toEqual({ a: 1 });          // Igualdad profunda
expect(array).toStrictEqual([1, 2, 3]);    // Igualdad profunda estricta

// Valores de verdad
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Números
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);
expect(value).toBeCloseTo(0.3, 5);         // Punto flotante

// Strings
expect(str).toMatch(/hello/i);
expect(str).toContain('world');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objetos
expect(obj).toHaveProperty('name');
expect(obj).toHaveProperty('name', 'John');
expect(obj).toMatchObject({ a: 1 });

// Funciones
expect(fn).toThrow();
expect(fn).toThrow('Error message');
expect(fn).toThrow(TypeError);

// Promesas
await expect(promise).resolves.toBe(42);
await expect(promise).rejects.toThrow();

// Snapshots
expect(component).toMatchSnapshot();
expect(value).toMatchInlineSnapshot(`"expected"`);
```

### Matchers Personalizados

```typescript
import { expect } from 'vitest';

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `se esperaba ${received} ${pass ? 'no ' : ''}estar dentro del rango ${floor} - ${ceiling}`,
    };
  },
});

// Uso
expect(5).toBeWithinRange(1, 10);
```

---

## 🎭 Mocking

### Funciones Mock

```typescript
import { vi, describe, it, expect } from 'vitest';

describe('Manejador de callback', () => {
  it('debería llamar al callback con el resultado', () => {
    const callback = vi.fn();

    processData(data, callback);

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(expectedResult);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

// Implementación mock
const mockFn = vi.fn((x) => x * 2);
mockFn(5); // Retorna 10

// Valor de retorno mock
const mockFn = vi.fn().mockReturnValue(42);
const mockFn = vi.fn().mockResolvedValue(42);  // Para promesas
```

### Mock de Módulos

```typescript
import { vi } from 'vitest';

// Mock de módulo completo
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1, name: 'John' })),
  createUser: vi.fn(),
}));

// Mock parcial
vi.mock('./utils', async () => {
  const actual = await vi.importActual<typeof import('./utils')>('./utils');
  return {
    ...actual,
    someUtil: vi.fn(() => 'mocked'),
  };
});

// Mock de función específica
import * as api from './api';
vi.spyOn(api, 'fetchUser').mockResolvedValue({ id: 1, name: 'John' });
```

### Implementación Mock

```typescript
// Mock de una sola vez
fetchMock.mockImplementationOnce(() => Promise.resolve(data1));
fetchMock.mockImplementationOnce(() => Promise.resolve(data2));

// Resetear mocks
vi.clearAllMocks();    // Limpiar historial de llamadas
vi.resetAllMocks();    // Limpiar historial + implementación
vi.restoreAllMocks();  // Restaurar implementación original
```

---

## ⏱️ Setup y Teardown

### Hooks de Ciclo de Vida

```typescript
import { describe, it, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

describe('Tests de base de datos', () => {
  // Se ejecuta una vez antes de todos los tests
  beforeAll(async () => {
    await database.connect();
  });

  // Se ejecuta antes de cada test
  beforeEach(() => {
    database.clear();
  });

  // Se ejecuta después de cada test
  afterEach(() => {
    // Limpieza
  });

  // Se ejecuta una vez después de todos los tests
  afterAll(async () => {
    await database.disconnect();
  });

  it('test 1', () => {
    // Implementación del test
  });
});
```

### Setup Global

**src/test/setup.ts:**
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extender matchers
expect.extend(matchers);

// Limpieza después de cada test
afterEach(() => {
  cleanup();
});
```

---

## 📊 Cobertura

### Configuración

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',              // o 'istanbul'
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Ejecutar Cobertura

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte HTML
open coverage/index.html
```

---

## 👀 Watch Mode

### Ejecutar Watch Mode

```bash
# Watch mode (por defecto)
npm test

# Ejecutar una vez (CI)
npm run test:run
```

### Comandos de Watch Mode

```
› Presiona a para ejecutar todos los tests
› Presiona f para ejecutar solo tests fallidos
› Presiona u para actualizar snapshots
› Presiona p para filtrar por nombre de archivo
› Presiona t para filtrar por nombre de test
› Presiona q para salir
```

---

## 🎨 UI Mode

### Ejecutar UI Mode

```bash
npm run test:ui
```

**Características:**
- Test runner visual
- Ver jerarquía de tests
- Filtrar y buscar tests
- Ver cobertura
- Debuggear tests interactivamente

---

## 🔄 Testing Asíncrono

### Promesas

```typescript
it('debería obtener datos de usuario', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});

it('debería manejar errores', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('Usuario no encontrado');
});
```

### Callbacks

```typescript
it('debería llamar al callback', (done) => {
  fetchData((data) => {
    expect(data).toBeDefined();
    done();
  });
});
```

---

## 📸 Snapshot Testing

### Snapshots Básicos

```typescript
import { describe, it, expect } from 'vitest';

it('debería coincidir con el snapshot', () => {
  const data = { id: 1, name: 'John', timestamp: Date.now() };
  expect(data).toMatchSnapshot({
    timestamp: expect.any(Number),  // Ignorar valores dinámicos
  });
});
```

### Inline Snapshots

```typescript
it('debería coincidir con inline snapshot', () => {
  expect({ name: 'John', age: 30 }).toMatchInlineSnapshot(`
    {
      "age": 30,
      "name": "John",
    }
  `);
});
```

### Actualizar Snapshots

```bash
# Actualizar todos los snapshots
npm test -- -u

# Actualizar test específico
npm test Button.test.ts -- -u
```

---

## 🎯 Mejores Prácticas

### 1. Nombrado de Tests

```typescript
// ✅ Bueno - Descriptivo, sigue patrón
describe('Calculator', () => {
  it('debería sumar dos números positivos', () => {});
  it('debería retornar 0 al sumar números negativos', () => {});
});

// ❌ Malo - Vago
describe('Math', () => {
  it('funciona', () => {});
  it('test1', () => {});
});
```

### 2. Patrón Arrange-Act-Assert

```typescript
it('debería calcular precio total con descuento', () => {
  // Arrange (Preparar)
  const items = [{ price: 100 }, { price: 200 }];
  const discount = 0.1;

  // Act (Actuar)
  const total = calculateTotal(items, discount);

  // Assert (Afirmar)
  expect(total).toBe(270);
});
```

### 3. Evitar Lógica en Tests

```typescript
// ✅ Bueno - Simple, explícito
it('debería manejar múltiples escenarios', () => {
  expect(fn(1)).toBe(2);
  expect(fn(2)).toBe(4);
  expect(fn(3)).toBe(6);
});

// ❌ Malo - Lógica en tests
it('debería duplicar entrada', () => {
  for (let i = 1; i <= 3; i++) {
    expect(fn(i)).toBe(i * 2);
  }
});
```

### 4. Testear Una Cosa

```typescript
// ✅ Bueno - Una aserción por test
it('debería sumar números', () => {
  expect(add(2, 3)).toBe(5);
});

it('debería manejar números negativos', () => {
  expect(add(-2, 3)).toBe(1);
});

// ❌ Malo - Múltiples preocupaciones
it('debería hacer matemáticas', () => {
  expect(add(2, 3)).toBe(5);
  expect(subtract(5, 3)).toBe(2);
  expect(multiply(2, 3)).toBe(6);
});
```

### 5. Evitar Interdependencia de Tests

```typescript
// ✅ Bueno - Tests independientes
describe('Counter', () => {
  it('debería empezar en 0', () => {
    const counter = new Counter();
    expect(counter.value).toBe(0);
  });

  it('debería incrementar', () => {
    const counter = new Counter();
    counter.increment();
    expect(counter.value).toBe(1);
  });
});

// ❌ Malo - Tests dependen del orden
let counter: Counter;

it('debería empezar en 0', () => {
  counter = new Counter();
  expect(counter.value).toBe(0);
});

it('debería incrementar', () => {
  counter.increment();  // Depende del test anterior
  expect(counter.value).toBe(1);
});
```

---

## 🔗 Integración con mjcuadrado-net-sdk

### Con el Agente frontend-builder

El agente frontend-builder usa Vitest para testing de componentes:

```typescript
// Generado por frontend-builder
// tests/components/LoginForm/LoginForm.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('debería renderizar campos de email y contraseña', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });
});
```

---

## 📚 Recursos

**Documentación Oficial:**
- Vitest: https://vitest.dev/
- API Reference: https://vitest.dev/api/
- Config: https://vitest.dev/config/

**Migración:**
- Jest to Vitest: https://vitest.dev/guide/migration.html

**Skills Relacionadas:**
- testing/react-testing-library.md - Testing de componentes
- testing/playwright.md - Testing E2E

---

**Versión:** 0.1.0
**Última Actualización:** 2025-11-22
**Mantenido por:** mjcuadrado-net-sdk
