---
name: Angular Services Patterns
description: Apply Angular service design and dependency injection patterns
triggers:
  - file_extension: .ts
  - file_contains: "@Injectable|@Service"
  - task_mentions: "angular service|dependency injection|@Injectable"
---

# Angular Services Patterns

Design Angular services with proper dependency injection and patterns.

## Service Definition

```typescript
// Good ✓ - Injectable service with providedIn
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'  // Singleton, tree-shakable
})
export class UserService {
  private readonly apiUrl = '/api/users';
  private loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    this.loadingSubject.next(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## State Management in Services

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private selectedUserSubject = new BehaviorSubject<User | null>(null);

  readonly users$ = this.usersSubject.asObservable();
  readonly selectedUser$ = this.selectedUserSubject.asObservable();

  constructor(private userService: UserService) {}

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.usersSubject.next(users);
    });
  }

  selectUser(user: User): void {
    this.selectedUserSubject.next(user);
  }

  addUser(user: User): void {
    const current = this.usersSubject.value;
    this.usersSubject.next([...current, user]);
  }

  updateUser(updatedUser: User): void {
    const current = this.usersSubject.value;
    const updated = current.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    this.usersSubject.next(updated);
  }

  removeUser(userId: string): void {
    const current = this.usersSubject.value;
    this.usersSubject.next(current.filter(user => user.id !== userId));
  }
}
```

## HTTP Interceptors

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}

// Register in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

## Error Handling

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      catchError(error => {
        this.errorHandler.handleError(error);
        return throwError(() => error);
      })
    );
  }
}

// Error handler service
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: HttpErrorResponse): void {
    let message = 'An error occurred';

    if (error.status === 404) {
      message = 'Resource not found';
    } else if (error.status === 401) {
      message = 'Unauthorized';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.snackBar.open(message, 'Close', { duration: 5000 });
    console.error('HTTP Error:', error);
  }
}
```

## Dependency Injection Scopes

```typescript
// Singleton (root level)
@Injectable({
  providedIn: 'root'
})
export class GlobalService {}

// Component level (new instance per component)
@Component({
  providers: [LocalService]  // New instance for this component
})
export class MyComponent {
  constructor(private localService: LocalService) {}
}

// Module level (Angular <17)
@Injectable({
  providedIn: 'any'  // One instance per lazy-loaded module
})
export class ModuleScopedService {}
```

## Caching Pattern

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserCacheService {
  private cache = new Map<string, Observable<User>>();

  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    if (!this.cache.has(id)) {
      const request$ = this.http.get<User>(`/api/users/${id}`).pipe(
        shareReplay(1)  // Cache the result
      );
      this.cache.set(id, request$);
    }

    return this.cache.get(id)!;
  }

  clearCache(id?: string): void {
    if (id) {
      this.cache.delete(id);
    } else {
      this.cache.clear();
    }
  }
}
```

## Testing Services

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();  // Ensure no outstanding requests
  });

  it('should fetch user by id', (done) => {
    const mockUser = { id: '1', name: 'John', email: 'john@test.com' };

    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should handle error when user not found', (done) => {
    service.getUser('999').subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
        done();
      }
    });

    const req = httpMock.expectOne('/api/users/999');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
```

## Checklist

When creating Angular services:
- [ ] Use @Injectable with providedIn: 'root'
- [ ] Return Observables (not Promises) for async operations
- [ ] Implement proper error handling
- [ ] Use BehaviorSubject for state management
- [ ] Implement caching where appropriate
- [ ] Write unit tests with HttpClientTestingModule
- [ ] Document public API methods
- [ ] Use dependency injection (constructor)
