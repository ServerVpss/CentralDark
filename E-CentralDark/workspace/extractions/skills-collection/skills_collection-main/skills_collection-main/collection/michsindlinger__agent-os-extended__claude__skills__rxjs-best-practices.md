---
name: RxJS Best Practices
description: Apply RxJS reactive programming patterns and operators effectively
triggers:
  - file_extension: .ts
  - task_mentions: "rxjs|observable|subscribe|pipe"
  - file_contains: "Observable|Subject|BehaviorSubject|pipe"
---

# RxJS Best Practices

Use RxJS effectively for reactive programming in Angular.

## Observable Subscriptions

```typescript
// Good ✓ - Use async pipe (auto-unsubscribe)
@Component({
  template: `
    <div *ngIf="user$ | async as user">
      {{ user.name }}
    </div>
  `
})
export class UserComponent {
  user$ = this.userService.getUser('123');

  constructor(private userService: UserService) {}
}

// Good ✓ - Manual subscription with cleanup
export class UserComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUser('123').subscribe(user => {
        this.user = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

// Avoid ✗ - No cleanup
ngOnInit(): void {
  this.userService.getUser('123').subscribe(user => {
    this.user = user;
  });  // Memory leak!
}
```

## Common Operators

### map - Transform values

```typescript
this.userService.getUser('123').pipe(
  map(user => user.name.toUpperCase())
).subscribe(name => console.log(name));
```

### filter - Filter values

```typescript
this.userService.getUsers().pipe(
  map(users => users.filter(u => u.isActive))
).subscribe(activeUsers => console.log(activeUsers));
```

### switchMap - Cancel previous, switch to new

```typescript
// Good ✓ - For search/autocomplete
searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.searchService.search(term))
).subscribe(results => this.results = results);
```

### mergeMap - Run concurrently

```typescript
// Fetch details for multiple users concurrently
userIds$.pipe(
  mergeMap(id => this.userService.getUser(id), 5)  // Max 5 concurrent
).subscribe(user => console.log(user));
```

### concatMap - Sequential, preserve order

```typescript
// Execute operations sequentially
actions$.pipe(
  concatMap(action => this.apiService.execute(action))
).subscribe(result => console.log(result));
```

### catchError - Error handling

```typescript
this.userService.getUser('123').pipe(
  catchError(error => {
    console.error('Error:', error);
    return of(null);  // Return fallback value
  })
).subscribe(user => console.log(user));
```

### debounceTime - Debounce events

```typescript
searchInput.valueChanges.pipe(
  debounceTime(300),  // Wait 300ms after user stops typing
  distinctUntilChanged()
).subscribe(term => this.search(term));
```

### combineLatest - Combine multiple observables

```typescript
combineLatest([
  this.userService.getUser('123'),
  this.settingsService.getSettings()
]).pipe(
  map(([user, settings]) => ({ user, settings }))
).subscribe(({ user, settings }) => {
  console.log(user, settings);
});
```

## Subject Types

```typescript
// Subject - No initial value, no replay
const subject = new Subject<string>();
subject.next('value');  // Only new subscribers get this

// BehaviorSubject - Has current value
const behavior = new BehaviorSubject<string>('initial');
behavior.next('new value');
console.log(behavior.value);  // 'new value'

// ReplaySubject - Replays N previous values
const replay = new ReplaySubject<string>(2);  // Remember last 2
replay.next('value1');
replay.next('value2');
replay.next('value3');
// New subscriber gets 'value2' and 'value3'

// AsyncSubject - Emits only last value on complete
const async = new AsyncSubject<string>();
async.next('value1');
async.next('value2');
async.complete();  // Now emits 'value2'
```

## Error Handling Patterns

```typescript
// Good ✓ - Catch and continue stream
this.http.get('/api/users').pipe(
  catchError(error => {
    console.error('Error:', error);
    return of([]);  // Return empty array, stream continues
  })
).subscribe(users => console.log(users));

// Good ✓ - Retry on error
this.http.get('/api/users').pipe(
  retry(3),  // Retry up to 3 times
  catchError(error => {
    console.error('Failed after retries:', error);
    return throwError(() => error);
  })
).subscribe(users => console.log(users));

// Advanced retry with backoff
this.http.get('/api/users').pipe(
  retryWhen(errors =>
    errors.pipe(
      delayWhen((error, index) => timer(index * 1000))  // Exponential backoff
    )
  )
).subscribe();
```

## Unsubscribe Patterns

```typescript
// Pattern 1: Subscription object
export class MyComponent implements OnDestroy {
  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.service.getData().subscribe(data => {})
    );
    this.subscription.add(
      this.service.getMore().subscribe(more => {})
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

// Pattern 2: takeUntil with destroy subject
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.getData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {});

    this.service.getMore().pipe(
      takeUntil(this.destroy$)
    ).subscribe(more => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Pattern 3: Async pipe (recommended)
@Component({
  template: `
    <div *ngIf="data$ | async as data">
      {{ data.value }}
    </div>
  `
})
export class MyComponent {
  data$ = this.service.getData();  // No manual unsubscribe needed
}
```

## Avoid Common Pitfalls

```typescript
// Avoid ✗ - Nested subscriptions
this.service.getUser().subscribe(user => {
  this.service.getOrders(user.id).subscribe(orders => {
    // Nested - hard to manage
  });
});

// Good ✓ - Use switchMap
this.service.getUser().pipe(
  switchMap(user => this.service.getOrders(user.id))
).subscribe(orders => {
  // Flat, easy to manage
});

// Avoid ✗ - Multiple subscribes to same observable
const obs$ = this.http.get('/api/data');
obs$.subscribe(data => console.log(data));
obs$.subscribe(data => console.log(data));  // Two HTTP requests!

// Good ✓ - Share one subscription
const obs$ = this.http.get('/api/data').pipe(shareReplay(1));
obs$.subscribe(data => console.log(data));
obs$.subscribe(data => console.log(data));  // Same data, one request
```

## Checklist

When working with RxJS:
- [ ] Always unsubscribe or use async pipe
- [ ] Use appropriate operator (switchMap vs mergeMap vs concatMap)
- [ ] Implement error handling with catchError
- [ ] Use shareReplay for expensive operations
- [ ] Avoid nested subscriptions (use switchMap instead)
- [ ] Use debounceTime for user input
- [ ] Use BehaviorSubject for state that has current value
- [ ] Complete subjects in ngOnDestroy
