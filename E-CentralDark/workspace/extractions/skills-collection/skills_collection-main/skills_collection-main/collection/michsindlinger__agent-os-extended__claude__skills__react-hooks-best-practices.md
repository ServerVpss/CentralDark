---
name: React Hooks Best Practices
description: Apply React hooks patterns and optimization techniques
triggers:
  - file_extension: .tsx
  - file_extension: .jsx
  - task_mentions: "hook|useState|useEffect|useMemo|useCallback"
  - file_contains: "useState|useEffect|useMemo|useCallback|useRef"
---

# React Hooks Best Practices

Optimize React hooks usage for performance and correctness.

## useState

```typescript
// Good ✓ - Initialize with proper type
const [user, setUser] = useState<User | null>(null);
const [count, setCount] = useState(0);

// Functional update for state based on previous state
const increment = () => {
  setCount(prev => prev + 1);  // Good ✓
};

// Avoid ✗ - Direct update with stale state
const increment = () => {
  setCount(count + 1);  // May use stale value
};

// Good ✓ - Lazy initialization for expensive computation
const [data, setData] = useState(() => {
  return computeExpensiveInitialValue();
});

// Avoid ✗ - Expensive computation on every render
const [data, setData] = useState(computeExpensiveInitialValue());
```

## useEffect

```typescript
// Good ✓ - Proper dependency array
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]);  // Re-run when userId changes

// Good ✓ - Cleanup function
useEffect(() => {
  const subscription = dataSource.subscribe(setData);

  return () => {
    subscription.unsubscribe();  // Cleanup on unmount
  };
}, []);

// Avoid ✗ - Missing dependencies (eslint will warn)
useEffect(() => {
  fetchUser(userId).then(setUser);
}, []);  // Should include userId

// Avoid ✗ - No cleanup for subscriptions
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  // Missing return () => clearInterval(interval);
}, []);
```

## useMemo

```typescript
// Good ✓ - Memoize expensive computations
function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => user.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, filter]);

  return (
    <ul>
      {filteredUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Avoid ✗ - Memoizing cheap operations (overhead not worth it)
const doubled = useMemo(() => count * 2, [count]);  // Too simple for memo

// Avoid ✗ - Missing dependencies
const filtered = useMemo(() => {
  return users.filter(u => u.age > minAge);
}, [users]);  // Should include minAge
```

## useCallback

```typescript
// Good ✓ - Memoize callback to prevent child re-renders
interface UserItemProps {
  user: User;
  onDelete: (id: string) => void;
}

const UserItem = memo(({ user, onDelete }: UserItemProps) => {
  return (
    <div>
      {user.name}
      <button onClick={() => onDelete(user.id)}>Delete</button>
    </div>
  );
});

function UserList({ users }: { users: User[] }) {
  const handleDelete = useCallback((id: string) => {
    deleteUser(id).then(() => {
      // Refresh list
    });
  }, []);  // Stable reference

  return (
    <div>
      {users.map(user => (
        <UserItem key={user.id} user={user} onDelete={handleDelete} />
      ))}
    </div>
  );
}

// Avoid ✗ - New function on every render
function UserList({ users }: { users: User[] }) {
  const handleDelete = (id: string) => {  // New function every render
    deleteUser(id);
  };

  return (
    <div>
      {users.map(user => (
        <UserItem key={user.id} user={user} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

## useRef

```typescript
// Good ✓ - Access DOM elements
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// Good ✓ - Store mutable value that doesn't trigger re-render
function Timer() {
  const intervalRef = useRef<number>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return <div>Timer running</div>;
}
```

## Custom Hooks

```typescript
// Good ✓ - Reusable logic extraction
export function useFetchData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
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
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error, refetch: () => setData(null) };
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useFetchData<User>(`/api/users/${userId}`);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
}
```

## useReducer for Complex State

```typescript
// Good ✓ - Use useReducer for complex state logic
interface State {
  users: User[];
  loading: boolean;
  error: Error | null;
  filter: string;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_FILTER'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
}

export function UserManagement() {
  const [state, dispatch] = useReducer(reducer, {
    users: [],
    loading: false,
    error: null,
    filter: '',
  });

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    fetchUsers()
      .then(users => dispatch({ type: 'FETCH_SUCCESS', payload: users }))
      .catch(error => dispatch({ type: 'FETCH_ERROR', payload: error }));
  }, []);

  return (
    <div>
      <input
        value={state.filter}
        onChange={(e) => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
      />
      {/* Render users */}
    </div>
  );
}
```

## Rules of Hooks

1. **Only call hooks at top level** (not in loops, conditions, or nested functions)
2. **Only call hooks from React functions** (components or custom hooks)
3. **Custom hooks must start with 'use'**

```typescript
// Good ✓
function UserProfile() {
  const [user, setUser] = useState(null);
  const data = useFetchData('/api/data');

  return <div>...</div>;
}

// Avoid ✗
function UserProfile() {
  if (condition) {
    const [user, setUser] = useState(null);  // Conditional hook call
  }

  for (let i = 0; i < 10; i++) {
    useEffect(() => {});  // Hook in loop
  }
}
```

## Performance Optimization

```typescript
// Avoid unnecessary re-renders with memo
export const UserCard = memo(({ user }: { user: User }) => {
  return <div>{user.name}</div>;
});

// With custom comparison
export const UserCard = memo(
  ({ user }: { user: User }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

## Checklist

When using hooks, verify:
- [ ] Dependencies array is complete (no ESLint warnings)
- [ ] Effects have cleanup functions where needed
- [ ] Expensive computations are memoized with useMemo
- [ ] Callbacks passed to children are memoized with useCallback
- [ ] Hooks are called at top level (not conditionally)
- [ ] Custom hooks follow naming convention (use prefix)
- [ ] State updates use functional form when based on previous state
