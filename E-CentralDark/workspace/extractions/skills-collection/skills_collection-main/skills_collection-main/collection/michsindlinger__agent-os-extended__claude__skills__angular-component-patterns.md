---
name: Angular Component Patterns
description: Apply Angular component design patterns and lifecycle best practices
triggers:
  - file_extension: .ts
  - file_contains: "@Component|@Input|@Output"
  - task_mentions: "angular|component|@Component"
---

# Angular Component Patterns

Design Angular components following modern best practices.

## Standalone Components (Angular 17+)

```typescript
// Good ✓ - Standalone component
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button (click)="onEdit()">Edit</button>
    </div>
  `,
  styles: [`
    .user-card {
      border: 1px solid #ccc;
      padding: 1rem;
      border-radius: 0.5rem;
    }
  `]
})
export class UserCardComponent {
  @Input({ required: true }) user!: User;
  @Output() edit = new EventEmitter<string>();

  onEdit(): void {
    this.edit.emit(this.user.id);
  }
}
```

## Component Communication

```typescript
// Parent to child - @Input
@Component({
  selector: 'app-user-list',
  template: `
    <app-user-card
      *ngFor="let user of users"
      [user]="user"
      (edit)="handleEdit($event)"
    />
  `
})
export class UserListComponent {
  users: User[] = [];

  handleEdit(userId: string): void {
    this.router.navigate(['/users', userId, 'edit']);
  }
}

// Child to parent - @Output
@Component({
  selector: 'app-search-box',
  template: `
    <input
      [(ngModel)]="searchTerm"
      (ngModelChange)="search.emit($event)"
      placeholder="Search..."
    />
  `
})
export class SearchBoxComponent {
  searchTerm = '';
  @Output() search = new EventEmitter<string>();
}
```

## OnPush Change Detection

```typescript
// Good ✓ - OnPush for performance
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let user of users; trackBy: trackByUserId">
      {{ user.name }}
    </div>
  `
})
export class UserListComponent {
  @Input() users: User[] = [];

  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
```

## Lifecycle Hooks

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  ngOnInit(): void {
    // Initialize component
    this.subscription.add(
      this.userService.getUser().subscribe(user => {
        this.user = user;
      })
    );
  }

  ngOnDestroy(): void {
    // Cleanup
    this.subscription.unsubscribe();
  }
}
```

## Template Syntax

```typescript
// Property binding
<img [src]="user.avatarUrl" [alt]="user.name">

// Event binding
<button (click)="handleClick()">Click</button>

// Two-way binding
<input [(ngModel)]="username">

// Attribute binding
<button [attr.aria-label]="closeLabel">Close</button>

// Class binding
<div [class.active]="isActive" [class.disabled]="isDisabled">

// Style binding
<div [style.color]="textColor" [style.font-size.px]="fontSize">

// Template reference variable
<input #nameInput>
<button (click)="nameInput.focus()">Focus Input</button>
```

## Smart vs Presentational Components

```typescript
// Smart Component (Container)
@Component({
  selector: 'app-user-list-container',
  template: `
    <app-user-list
      [users]="users$ | async"
      [loading]="loading$ | async"
      (editUser)="handleEditUser($event)"
    />
  `
})
export class UserListContainerComponent {
  users$ = this.userService.getUsers();
  loading$ = this.userService.loading$;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  handleEditUser(userId: string): void {
    this.router.navigate(['/users', userId, 'edit']);
  }
}

// Presentational Component (Dumb)
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="loading; else content">
      <app-loading-spinner />
    </div>
    <ng-template #content>
      <div *ngFor="let user of users; trackBy: trackByUserId" class="user-item">
        {{ user.name }}
        <button (click)="editUser.emit(user.id)">Edit</button>
      </div>
    </ng-template>
  `
})
export class UserListComponent {
  @Input() users: User[] | null = null;
  @Input() loading: boolean | null = false;
  @Output() editUser = new EventEmitter<string>();

  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
```

## Content Projection

```typescript
// Single slot projection
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {}

// Multi-slot projection
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <div class="card-header">
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {}

// Usage
<app-card>
  <h2 header>Card Title</h2>
  <p>Card content</p>
  <button footer>Action</button>
</app-card>
```

## Signals (Angular 16+)

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Doubled: {{ doubled() }}</p>
      <button (click)="increment()">+</button>
      <button (click)="decrement()">-</button>
    </div>
  `
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment(): void {
    this.count.update(value => value + 1);
  }

  decrement(): void {
    this.count.update(value => value - 1);
  }
}
```

## ViewChild and ContentChild

```typescript
@Component({
  selector: 'app-parent',
  template: `
    <input #searchInput type="text">
    <app-child />
  `
})
export class ParentComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ChildComponent) child!: ChildComponent;

  ngAfterViewInit(): void {
    this.searchInput.nativeElement.focus();
    this.child.doSomething();
  }
}
```

## Checklist

When creating Angular components:
- [ ] Use standalone components (Angular 17+)
- [ ] Apply OnPush change detection for performance
- [ ] Use trackBy functions with *ngFor
- [ ] Properly type all @Input and @Output decorators
- [ ] Unsubscribe from observables in ngOnDestroy
- [ ] Use async pipe instead of manual subscriptions
- [ ] Separate smart (container) from presentational components
- [ ] Use signals for reactive state (Angular 16+)
