---
name: react-query
description: Powerful server state management with TanStack Query for data fetching and caching
version: 0.1.0
tags: [frontend, react, state-management, tanstack-query, data-fetching]
---

# React Query (TanStack Query)

TanStack Query (anteriormente React Query) es una biblioteca para gestión de estado del servidor con caching automático, sincronización y optimizaciones.

## 🎯 Overview

**Por qué React Query en mj2:**
- **Server state management:** Gestiona datos del servidor separado del estado local
- **Automatic caching:** Cache inteligente con invalidación automática
- **Background refetching:** Actualización automática en background
- **Optimistic updates:** UI instantánea antes de confirmación del servidor
- **Request deduplication:** Evita requests duplicados
- **Pagination & infinite scroll:** Soporte nativo
- **TypeScript:** Soporte completo de tipos

---

## 📦 Setup Básico

```bash
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools  # DevTools (opcional)
```

**package.json:**
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "@tanstack/react-query": "^5.50.0",
    "@tanstack/react-query-devtools": "^5.50.0"
  }
}
```

### QueryClient Setup

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 🔍 Queries (GET)

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

export function UsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json() as Promise<User[]>;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Query with Parameters

```typescript
export function UserDetail({ userId }: { userId: number }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId], // Key incluye parámetros
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json() as Promise<User>;
    },
    enabled: !!userId, // Solo ejecuta si userId existe
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{user?.name}</div>;
}
```

### Query States

```typescript
export function UsersWithStates() {
  const {
    data,
    error,
    isLoading,        // Initial loading
    isFetching,       // Background refetching
    isError,          // Has error
    isSuccess,        // Has data
    isPending,        // No data yet (loading or error)
    isRefetching,     // Refetching with existing data
    refetch,          // Manual refetch function
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {isFetching && !isLoading && <div>Updating...</div>}
      {isError && <div>Error: {error.message}</div>}
      {isSuccess && (
        <div>
          <button onClick={() => refetch()}>Refresh</button>
          <ul>
            {data.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## ✏️ Mutations (POST, PUT, DELETE)

### Basic Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateUserRequest {
  name: string;
  email: string;
}

export function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newUser: CreateUserRequest) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch users query
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>User created!</div>}
    </form>
  );
}
```

### Mutation with Optimistic Updates

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedUser: User) => {
      const response = await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      return response.json();
    },

    // Optimistic update
    onMutate: async (updatedUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData<User[]>(['users']);

      // Optimistically update cache
      queryClient.setQueryData<User[]>(['users'], (old) =>
        old?.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );

      // Return context with snapshot
      return { previousUsers };
    },

    // Rollback on error
    onError: (_err, _updatedUser, context) => {
      queryClient.setQueryData(['users'], context?.previousUsers);
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Delete Mutation

```typescript
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Usage
export function UserItem({ user }: { user: User }) {
  const deleteUser = useDeleteUser();

  return (
    <div>
      <span>{user.name}</span>
      <button
        onClick={() => deleteUser.mutate(user.id)}
        disabled={deleteUser.isPending}
      >
        {deleteUser.isPending ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
```

---

## 🔄 Cache Management

### Invalidate Queries

```typescript
const queryClient = useQueryClient();

// Invalidate all queries
queryClient.invalidateQueries();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['users'] });

// Invalidate queries that start with 'users'
queryClient.invalidateQueries({ queryKey: ['users'], exact: false });

// Invalidate user detail
queryClient.invalidateQueries({ queryKey: ['users', userId] });
```

### Set Query Data Manually

```typescript
// Set data for a query
queryClient.setQueryData(['users'], newUsers);

// Update existing data
queryClient.setQueryData<User[]>(['users'], (oldData) => {
  return oldData ? [...oldData, newUser] : [newUser];
});
```

### Prefetch Data

```typescript
export function UsersList() {
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const prefetchUser = (userId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['users', userId],
      queryFn: () => fetchUser(userId),
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

  return (
    <ul>
      {users?.map((user) => (
        <li
          key={user.id}
          onMouseEnter={() => prefetchUser(user.id)}
        >
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

---

## 📄 Pagination

### Basic Pagination

```typescript
interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
}

export function UsersPaginated() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPreviousData } = useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page),
    keepPreviousData: true, // Keep previous data while fetching
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul>
            {data?.users.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>

          <div>
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>Page {page} of {data?.totalPages}</span>

            <button
              onClick={() => setPage((old) => old + 1)}
              disabled={isPreviousData || page >= (data?.totalPages ?? 0)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Infinite Scroll

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function UsersInfinite() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchUsers(pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.users.map((user) => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>
    </div>
  );
}
```

---

## 🎨 Integration with openapi-typescript

```typescript
import createClient from 'openapi-fetch';
import type { paths, components } from './types/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type User = components["schemas"]["User"];
type CreateUserRequest = components["schemas"]["CreateUserRequest"];

const client = createClient<paths>({
  baseUrl: 'https://api.example.com',
});

// GET users query
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await client.GET("/users");
      if (error) throw error;
      return data;
    },
  });
}

// GET user by ID
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data, error } = await client.GET("/users/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// POST create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: CreateUserRequest) => {
      const { data, error } = await client.POST("/users", {
        body: newUser,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// PUT update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...user }: User) => {
      const { data, error } = await client.PUT("/users/{id}", {
        params: { path: { id } },
        body: user,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}

// DELETE user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await client.DELETE("/users/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

## 🔧 Query Configuration

### Global Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      gcTime: 1000 * 60 * 60,      // 1 hour (formerly cacheTime)
      retry: 1,                     // Retry once on failure
      refetchOnWindowFocus: false,  // Don't refetch on window focus
      refetchOnMount: true,         // Refetch on component mount
      refetchOnReconnect: true,     // Refetch on network reconnect
    },
    mutations: {
      retry: 0,                     // Don't retry mutations
    },
  },
});
```

### Per-Query Configuration

```typescript
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 10,      // 10 minutes
  gcTime: 1000 * 60 * 30,         // 30 minutes
  retry: 3,                        // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchInterval: 1000 * 60,     // Refetch every minute
  enabled: true,                   // Enable/disable query
});
```

---

## ✅ Best Practices

### DO ✅

1. **Use query keys strategically** - Include all dependencies
   ```typescript
   useQuery({
     queryKey: ['users', filters, page],
     queryFn: () => fetchUsers(filters, page),
   });
   ```

2. **Invalidate queries after mutations**
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['users'] });
   }
   ```

3. **Use optimistic updates for instant UI**
   ```typescript
   onMutate: async (newData) => {
     await queryClient.cancelQueries({ queryKey: ['users'] });
     queryClient.setQueryData(['users'], (old) => [...old, newData]);
   }
   ```

4. **Prefetch data on hover** - Better UX
   ```typescript
   onMouseEnter={() => queryClient.prefetchQuery(...)}
   ```

5. **Use keepPreviousData for pagination** - Smooth transitions

6. **Handle loading and error states** - Better UX

7. **Use TypeScript** - Type-safe queries and mutations

### DON'T ❌

1. ❌ **NO** fetch in useEffect - Use React Query
2. ❌ **NO** store server state in useState - Use queries
3. ❌ **NO** forget to invalidate after mutations
4. ❌ **NO** use the same query key for different data
5. ❌ **NO** ignore staleTime - Configure appropriately
6. ❌ **NO** make queries dependent on other queries without `enabled`
7. ❌ **NO** use mutations for GET requests - Use queries

---

## 📚 Referencias

- **TanStack Query Docs:** https://tanstack.com/query/latest
- **React Query v5:** https://tanstack.com/query/v5/docs/react/overview
- **TypeScript:** https://tanstack.com/query/latest/docs/react/typescript
- **DevTools:** https://tanstack.com/query/latest/docs/react/devtools

---

**Used by:** frontend-builder, component-designer
**Related skills:** frontend/react.md, frontend/openapi-typescript.md, frontend/typescript.md
