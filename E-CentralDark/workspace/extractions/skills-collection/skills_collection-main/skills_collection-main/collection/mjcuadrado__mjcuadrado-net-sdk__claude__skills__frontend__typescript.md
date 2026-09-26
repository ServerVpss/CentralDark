---
name: typescript
description: TypeScript 5 patterns and React integration for type-safe development
version: 0.1.0
tags: [frontend, typescript, ts5, types, type-safety, react]
---

# TypeScript 5 for React

TypeScript es un superset de JavaScript que añade tipado estático, mejorando la detección de errores y la experiencia de desarrollo.

## 🎯 Overview

**Por qué TypeScript en mj2:**
- **Type Safety:** Errores en tiempo de compilación, no runtime
- **IntelliSense:** Autocompletado y documentación inline
- **Refactoring:** Cambios seguros en toda la codebase
- **Self-documenting:** Tipos como documentación viva
- **React Integration:** Excelente soporte para componentes React

---

## 📦 Setup

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 🎯 Basic Types

```typescript
// Primitives
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Arrays
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Objects
let user: { name: string; age: number } = {
  name: "John",
  age: 30
};

// Functions
function add(a: number, b: number): number {
  return a + b;
}

const multiply = (a: number, b: number): number => a * b;

// Union types
let id: string | number = "123";
id = 123; // OK

// Literal types
let status: "pending" | "approved" | "rejected" = "pending";

// Any (avoid!)
let anything: any = "hello";
anything = 123; // No error (bad!)

// Unknown (prefer over any)
let something: unknown = "hello";
if (typeof something === "string") {
  console.log(something.toUpperCase()); // Type guard
}
```

---

## 📋 Interfaces vs Types

### Interfaces

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional
  readonly createdAt: Date; // Read-only
}

// Extending interfaces
interface Admin extends User {
  role: "admin";
  permissions: string[];
}

// Declaration merging (unique to interfaces)
interface User {
  lastLogin?: Date;
}
```

### Types

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

// Union types
type Status = "pending" | "approved" | "rejected";

// Intersection types
type Admin = User & {
  role: "admin";
  permissions: string[];
};

// Type aliases
type ID = string | number;
type Callback = (data: string) => void;
```

**When to use:**
- **Interface:** For object shapes, especially when extending
- **Type:** For unions, intersections, primitives, tuples

---

## 🎨 Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello");
identity<number>(123);
identity("hello"); // Type inference

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "John", email: "john@test.com" },
  status: 200,
  message: "Success"
};

// Generic constraints
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(item: T): void {
  console.log(item.length);
}

logLength("hello"); // OK
logLength([1, 2, 3]); // OK
logLength(123); // Error: number doesn't have length
```

---

## ⚛️ React + TypeScript

### Props Typing

```typescript
// Basic props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({ label, onClick, variant = "primary", disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {label}
    </button>
  );
}

// With children
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Component as prop
interface LayoutProps {
  header: React.ComponentType;
  children: React.ReactNode;
}

export function Layout({ header: Header, children }: LayoutProps) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
```

### Hooks Typing

```typescript
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);
const timerRef = useRef<number | null>(null);

// useReducer
interface State {
  count: number;
}

type Action = { type: "increment" } | { type: "decrement" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });

// useContext
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be within AuthProvider");
  return context;
}
```

### Event Handlers

```typescript
// Mouse events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};

// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

// Keyboard events
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    console.log("Enter pressed");
  }
};
```

---

## 🛠️ Utility Types

```typescript
// Partial - All properties optional
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

// Required - All properties required
type RequiredUser = Required<PartialUser>;

// Pick - Select specific properties
type UserNameAndEmail = Pick<User, "name" | "email">;
// { name: string; email: string; }

// Omit - Exclude specific properties
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string; }

// Record - Object type with specific keys
type UserRoles = Record<string, User>;
// { [key: string]: User; }

// Readonly - Make all properties readonly
type ReadonlyUser = Readonly<User>;

// ReturnType - Extract return type
function getUser() {
  return { id: 1, name: "John" };
}

type UserType = ReturnType<typeof getUser>;
// { id: number; name: string; }
```

---

## 🎯 Advanced Patterns

### Discriminated Unions

```typescript
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: User[];
}

interface ErrorState {
  status: "error";
  error: string;
}

type State = LoadingState | SuccessState | ErrorState;

function render(state: State) {
  switch (state.status) {
    case "loading":
      return <div>Loading...</div>;
    case "success":
      return <div>{state.data.length} users</div>;
    case "error":
      return <div>Error: {state.error}</div>;
  }
}
```

### Type Guards

```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// instanceof guard
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    console.log(error.statusCode);
  }
}

// Custom type guard
interface Dog {
  bark: () => void;
}

interface Cat {
  meow: () => void;
}

function isDog(animal: Dog | Cat): animal is Dog {
  return (animal as Dog).bark !== undefined;
}

function makeSound(animal: Dog | Cat) {
  if (isDog(animal)) {
    animal.bark();
  } else {
    animal.meow();
  }
}
```

---

## ✅ Best Practices

### DO ✅

1. **Enable strict mode** - "strict": true en tsconfig.json
2. **Avoid any** - Usar unknown si necesitas flexibilidad
3. **Type props** - Siempre tipar props de componentes
4. **Use generics** - Para funciones/componentes reutilizables
5. **Type guards** - Para narrowing seguro
6. **Utility types** - Usar Partial, Pick, Omit, etc.
7. **Interfaces for objects** - Types para uniones/intersecciones

### DON'T ❌

1. ❌ **NO** usar `any` (pierdes type safety)
2. ❌ **NO** usar `@ts-ignore` (soluciona el problema real)
3. ❌ **NO** tipar obviedades: `const x: number = 5` ❌
4. ❌ **NO** definir tipos inline repetidamente
5. ❌ **NO** ignorar errores de TypeScript
6. ❌ **NO** usar `as` sin necesidad (type assertions)
7. ❌ **NO** tipos excesivamente complejos (keep it simple)

---

## 📚 Referencias

- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **TypeScript 5.0:** https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
- **React TypeScript Cheatsheet:** https://react-typescript-cheatsheet.netlify.app/

---

**Used by:** frontend-builder, component-designer
**Related skills:** frontend/react.md, frontend/vite.md
