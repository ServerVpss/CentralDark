---
name: TypeScript React Patterns
description: Apply TypeScript best practices in React applications
triggers:
  - file_extension: .tsx
  - task_mentions: "typescript|type|interface"
  - file_contains: "interface.*Props|type.*Props"
---

# TypeScript React Patterns

Use TypeScript effectively in React applications.

## Component Props

```typescript
// Good ✓ - Interface for props
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export function UserCard({
  user,
  onEdit,
  className,
  variant = 'full'
}: UserCardProps) {
  // ...
}

// Good ✓ - Type for props (alternative)
type ButtonProps = {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
```

## Event Handlers

```typescript
// Good ✓ - Proper event types
function LoginForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ...
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Children Props

```typescript
// Explicit ReactNode
interface CardProps {
  children: React.ReactNode;
}

// Render function
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// Component as prop
interface LayoutProps {
  header: React.ComponentType;
  children: React.ReactNode;
}
```

## Generic Components

```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
}

export function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue
}: SelectProps<T>) {
  return (
    <select
      value={getValue(value)}
      onChange={(e) => {
        const selected = options.find(opt => getValue(opt) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

// Usage
<Select<User>
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getLabel={(u) => u.name}
  getValue={(u) => u.id}
/>
```

## Hooks with TypeScript

```typescript
// Custom hook with proper types
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Usage
const [user, setUser] = useLocalStorage<User | null>('user', null);
```

## Type Guards

```typescript
// Type guard function
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// Usage
function UserProfile({ data }: { data: unknown }) {
  if (!isUser(data)) {
    return <div>Invalid user data</div>;
  }

  // data is now typed as User
  return <div>{data.name}</div>;
}
```

## Utility Types

```typescript
// Partial - make all properties optional
function updateUser(id: string, updates: Partial<User>) {
  // ...
}

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;

// Omit - exclude specific properties
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;

// Required - make all properties required
type RequiredUser = Required<Partial<User>>;
```

## Strict Mode

```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Checklist

When writing TypeScript React code:
- [ ] All component props are typed
- [ ] Event handlers have proper event types
- [ ] useState has explicit type when not inferable
- [ ] Custom hooks have return type defined
- [ ] No 'any' types used (use 'unknown' if truly unknown)
- [ ] Utility types used where appropriate
- [ ] Type guards for runtime validation
