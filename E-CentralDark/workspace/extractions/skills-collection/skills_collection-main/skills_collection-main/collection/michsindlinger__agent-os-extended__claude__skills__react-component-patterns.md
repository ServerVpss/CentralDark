---
name: React Component Patterns
description: Apply React component design patterns and best practices
triggers:
  - file_extension: .tsx
  - file_extension: .jsx
  - task_mentions: "react|component|jsx"
  - file_contains: "import.*from 'react'|import.*from \"react\""
---

# React Component Patterns

Design React components following modern best practices.

## Component Structure

```typescript
// 1. Imports (external first, then internal)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { fetchUser } from '@/services/userService';
import type { User } from '@/types/user';

// 2. Type definitions
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// 3. Component function
export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 3.1. State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 3.2. Hooks
  const navigate = useNavigate();

  // 3.3. Effects
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  // 3.4. Event handlers
  const handleEdit = () => {
    navigate(`/users/${userId}/edit`);
  };

  // 3.5. Render conditions
  if (loading) return <LoadingSpinner />;
  if (!user) return <NotFound />;

  // 3.6. JSX
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  );
}
```

## Props Pattern

```typescript
// Good ✓ - Explicit prop types with interface
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>;
}

// Avoid ✗ - Implicit any types
export function Button({ variant, size, children }) {
  // No type safety
}
```

## Composition Pattern

```typescript
// Good ✓ - Composable components
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>
```

## Conditional Rendering

```typescript
// Good ✓ - Clear conditional rendering
export function UserStatus({ user }: { user: User }) {
  if (!user) return null;

  if (user.isActive) {
    return <ActiveBadge />;
  }

  return <InactiveBadge />;
}

// Good ✓ - Inline for simple conditions
export function UserEmail({ user }: { user: User }) {
  return (
    <div>
      {user.isVerified && <VerifiedIcon />}
      {user.email}
    </div>
  );
}

// Avoid ✗ - Nested ternaries
return user ? user.isActive ? <Active /> : user.isPending ? <Pending /> : <Inactive /> : null;
```

## List Rendering

```typescript
// Good ✓ - Use key prop with stable identifier
export function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// Avoid ✗ - Using index as key (when list can reorder)
users.map((user, index) => <li key={index}>{user.name}</li>)
```

## Event Handlers

```typescript
// Good ✓ - Inline arrow function for simple cases
<button onClick={() => handleClick(user.id)}>Click</button>

// Good ✓ - Named function for complex logic
const handleUserClick = (userId: string) => {
  analytics.track('user_clicked', { userId });
  navigate(`/users/${userId}`);
};

<button onClick={() => handleUserClick(user.id)}>View</button>

// Avoid ✗ - Function call in JSX (executes immediately)
<button onClick={handleClick(user.id)}>Click</button>  // Wrong!
```

## Controlled Components

```typescript
// Good ✓ - Controlled input
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Error Boundaries

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorMessage />}>
  <App />
</ErrorBoundary>
```

## Component Patterns

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error } = useFetchData<T>(url);
  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {(users, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error error={error} />;
    return <UserList users={users} />;
  }}
</DataFetcher>
```

### Compound Components

```typescript
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export function Tabs({ children, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

export function Tab({ id, children }: TabProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

export function TabPanel({ id, children }: TabPanelProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  if (context.activeTab !== id) return null;

  return <div className="tab-panel">{children}</div>;
}

// Usage
<Tabs defaultTab="profile">
  <TabList>
    <Tab id="profile">Profile</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanel id="profile">Profile content</TabPanel>
  <TabPanel id="settings">Settings content</TabPanel>
</Tabs>
```
