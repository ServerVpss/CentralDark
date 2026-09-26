---
name: react
description: React 18 patterns and best practices for modern web applications
version: 0.1.0
tags: [frontend, react, react18, hooks, components, jsx]
---

# React 18 Patterns

React 18 es una biblioteca JavaScript para construir interfaces de usuario usando componentes funcionales y hooks.

## 🎯 Overview

**Por qué React en mj2:**
- **Component-based:** UI compuesta por componentes reutilizables
- **Declarative:** Describes cómo debe verse la UI, React maneja el DOM
- **Hooks:** Lógica reutilizable sin clases
- **Virtual DOM:** Performance optimizado
- **Concurrent Features:** Rendering no bloqueante (React 18+)
- **Ecosystem:** Amplio ecosistema de librerías

---

## 📦 Setup Básico

```bash
# Crear proyecto con Vite
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

**package.json:**
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

---

## 🎨 Functional Components

### Basic Component

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}

// Usage
<Button label="Click me" onClick={() => console.log('Clicked')} />
```

### Children Prop

```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

// Usage
<Card title="My Card">
  <p>This is the content</p>
  <Button label="Action" onClick={() => {}} />
</Card>
```

---

## 🪝 React Hooks

### useState - State Management

```typescript
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(c => c + 1)}>Increment (functional)</button>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
    </div>
  );
}

// Complex state
interface User {
  id: number;
  name: string;
  email: string;
}

export function UserProfile() {
  const [user, setUser] = useState<User>({
    id: 1,
    name: 'John',
    email: 'john@test.com'
  });

  const updateEmail = (newEmail: string) => {
    setUser(prev => ({
      ...prev,
      email: newEmail
    }));
  };

  return (
    <div>
      <p>{user.name} - {user.email}</p>
      <button onClick={() => updateEmail('new@test.com')}>
        Update Email
      </button>
    </div>
  );
}
```

### useEffect - Side Effects

```typescript
import { useState, useEffect } from 'react';

// Fetch data on mount
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []); // Empty array = run once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Effect with dependencies
export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      setResults(data);
    };

    // Debounce
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer); // Cleanup
  }, [query]); // Re-run when query changes

  return (
    <ul>
      {results.map((result, i) => (
        <li key={i}>{result}</li>
      ))}
    </ul>
  );
}
```

### useContext - Context API

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// Create context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in component
export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Usage in App
function App() {
  return (
    <AuthProvider>
      <UserProfile />
    </AuthProvider>
  );
}
```

### useReducer - Complex State

```typescript
import { useReducer } from 'react';

interface State {
  count: number;
  step: number;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; step: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.step };
    case 'reset':
      return { count: 0, step: 1 };
    default:
      return state;
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({ type: 'setStep', step: Number(e.target.value) })}
      />
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

### useMemo - Memoization

```typescript
import { useMemo, useState } from 'react';

export function ExpensiveList({ items }: { items: number[] }) {
  const [filter, setFilter] = useState('');

  // Expensive calculation - only re-runs when items or filter change
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item =>
      item.toString().includes(filter)
    );
  }, [items, filter]);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter"
      />
      <ul>
        {filteredItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useCallback - Function Memoization

```typescript
import { useCallback, memo } from 'react';

// Child component (memoized)
const ChildButton = memo(({ onClick, label }: { onClick: () => void; label: string }) => {
  console.log('ChildButton rendered');
  return <button onClick={onClick}>{label}</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Without useCallback, this creates a new function on every render
  // causing ChildButton to re-render
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // Empty array = never recreate

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>

      <input value={name} onChange={(e) => setName(e.target.value)} />

      {/* ChildButton won't re-render when name changes */}
      <ChildButton onClick={handleClick} label="Click me" />
    </div>
  );
}
```

### useRef - DOM References & Mutable Values

```typescript
import { useRef, useEffect } from 'react';

export function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return (
    <input ref={inputRef} placeholder="Auto-focused" />
  );
}

// Mutable value that doesn't cause re-renders
export function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (intervalRef.current !== null) return;

    intervalRef.current = window.setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stop(); // Cleanup on unmount
  }, []);

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

---

## 🎯 Custom Hooks

### useLocalStorage

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
export function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### useFetch

```typescript
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, refetchIndex]);

  const refetch = () => setRefetchIndex(i => i + 1);

  return { data, loading, error, refetch };
}

// Usage
export function UserList() {
  const { data: users, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📋 Forms & Controlled Components

### Controlled Input

```typescript
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## ✅ Best Practices

### DO ✅

1. **Functional components** - Siempre usar funciones, no clases
2. **TypeScript** - Tipar props, state, y retornos
3. **Key prop** - Siempre en listas: `<li key={item.id}>`
4. **Cleanup effects** - Return cleanup function en useEffect
5. **Memoization** - useMemo/useCallback para optimizar
6. **Custom hooks** - Extraer lógica reutilizable
7. **Component composition** - Pequeños, focalizados, reutilizables

### DON'T ❌

1. ❌ **NO** mutar state directamente: `state.value = x` ❌
2. ❌ **NO** olvidar dependencies en useEffect
3. ❌ **NO** usar index como key: `key={i}` ❌
4. ❌ **NO** hacer fetch en render (usar useEffect)
5. ❌ **NO** componentes gigantes (split en pequeños)
6. ❌ **NO** prop drilling excesivo (usar Context)
7. ❌ **NO** olvidar event.preventDefault() en forms

---

## 📚 Referencias

- **React Docs:** https://react.dev/
- **React 18 Features:** https://react.dev/blog/2022/03/29/react-v18
- **Hooks API:** https://react.dev/reference/react

---

**Used by:** frontend-builder, component-designer
**Related skills:** frontend/typescript.md, frontend/vite.md, frontend/mui.md
