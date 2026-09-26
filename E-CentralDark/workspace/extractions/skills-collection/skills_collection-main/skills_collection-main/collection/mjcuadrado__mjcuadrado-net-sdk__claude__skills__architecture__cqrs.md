---
name: cqrs
description: Command Query Responsibility Segregation pattern for .NET applications
version: 0.1.0
tags: [architecture, cqrs, patterns, separation-of-concerns]
---

# CQRS - Command Query Responsibility Segregation

CQRS separa las operaciones de **escritura** (Commands) de las operaciones de **lectura** (Queries), permitiendo optimizar cada una independientemente.

## 🎯 Overview

**Principio fundamental:**
> "Las operaciones que modifican datos (Commands) deben estar separadas de las operaciones que leen datos (Queries)"

**Beneficios:**
- **Optimización independiente:** Escribe y lee se optimizan por separado
- **Escalabilidad:** Read y Write pueden escalar de forma diferente
- **Seguridad:** Separación clara de permisos (read vs write)
- **Simplicidad:** Modelos más simples y focalizados
- **Event Sourcing ready:** Natural evolución hacia Event Sourcing

---

## 📊 CQRS Levels

### Level 1: Simple CQRS (Same DB)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
   ┌───┴───┐
   │  API  │
   └───┬───┘
       │
   ┌───┴──────────────────┐
   │                      │
┌──▼────┐           ┌─────▼──┐
│Command│           │ Query  │
│Handler│           │Handler │
└───┬───┘           └────┬───┘
    │                    │
    └────────┬───────────┘
          ┌──▼───┐
          │  DB  │  ← Misma base de datos
          └──────┘
```

### Level 2: Separate Models (Same DB)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
   ┌───┴───┐
   │  API  │
   └───┬───┘
       │
   ┌───┴──────────────────────────┐
   │                              │
┌──▼────────┐             ┌───────▼────┐
│  Command  │             │   Query    │
│  Model    │             │   Model    │
│(Write DB) │             │ (Read DB)  │
└───────────┘             └────────────┘
       │                        │
   ┌───▼────┐              ┌────▼────┐
   │ Write  │   Sync  ────→│  Read   │
   │   DB   │              │   DB    │
   └────────┘              └─────────┘
```

### Level 3: Event Sourcing CQRS

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
   ┌───┴───┐
   │  API  │
   └───┬───┘
       │
   ┌───┴──────────────────────────┐
   │                              │
┌──▼────────┐             ┌───────▼────┐
│  Command  │             │   Query    │
│  Handler  │             │  Handler   │
└───┬───────┘             └────────────┘
    │                            │
┌───▼───────┐    Events      ┌──▼───────┐
│Event Store│  ───────────→  │Read Model│
│ (Append)  │                │(Optimized│
└───────────┘                └──────────┘
```

---

## 🎯 Commands vs Queries

### Commands (Write Operations)

**Características:**
- **Modifican** estado
- **No retornan** datos (solo éxito/fallo)
- Usan **verbos imperativos** (Create, Update, Delete)
- **Transaccionales**
- **Validación estricta**

```csharp
// Command
public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName
) : IRequest<Result>; // Solo Result, no datos

// Handler
public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result>
{
    private readonly ApplicationDbContext _context;

    public async Task<Result> Handle(CreateUserCommand request, CancellationToken ct)
    {
        // Validar
        var exists = await _context.Users.AnyAsync(u => u.Email == request.Email, ct);
        if (exists)
            return Result.Failure("User already exists");

        // Crear
        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);

        // Solo retorna éxito (no el usuario creado)
        return Result.Success();
    }
}
```

### Queries (Read Operations)

**Características:**
- **NO modifican** estado
- **Retornan** datos (DTOs)
- Usan **sustantivos** (GetUser, GetUsersList)
- **Sin transacciones**
- **AsNoTracking()** para performance
- **Proyecciones** optimizadas

```csharp
// Query
public record GetUserByIdQuery(Guid Id) : IRequest<Result<UserDto>>;

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    DateTime CreatedAt
);

// Handler
public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
{
    private readonly ApplicationDbContext _context;

    public async Task<Result<UserDto>> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await _context.Users
            .AsNoTracking() // ✅ Sin tracking
            .Where(u => u.Id == request.Id)
            .Select(u => new UserDto( // ✅ Projection
                u.Id,
                u.Email,
                $"{u.FirstName} {u.LastName}",
                u.CreatedAt
            ))
            .FirstOrDefaultAsync(ct);

        if (user == null)
            return Result<UserDto>.Failure($"User {request.Id} not found");

        return Result<UserDto>.Success(user);
    }
}
```

---

## 🏗️ Implementation Patterns

### Pattern 1: Simple CQRS (Single DB)

**Use when:** Starting with CQRS, moderate complexity

```csharp
// Shared DbContext
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Single model para Commands y Queries
        modelBuilder.Entity<User>(builder =>
        {
            builder.ToTable("users");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Email).IsRequired();
        });
    }
}

// Command usa mismo DbContext
public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result>
{
    private readonly ApplicationDbContext _context; // Write

    // ...
}

// Query usa mismo DbContext (con AsNoTracking)
public class GetUserHandler : IRequestHandler<GetUserQuery, Result<UserDto>>
{
    private readonly ApplicationDbContext _context; // Read

    public async Task<Result<UserDto>> Handle(GetUserQuery request, CancellationToken ct)
    {
        return await _context.Users
            .AsNoTracking() // Optimización para lectura
            .ProjectToType<UserDto>()
            .FirstOrDefaultAsync(ct);
    }
}
```

### Pattern 2: Separate Read/Write Models

**Use when:** High read load, complex queries

```csharp
// Write Model (normalized)
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

// Read Model (denormalized for queries)
public class UserReadModel
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; } // Pre-computed
    public int OrdersCount { get; set; } // Pre-computed
    public decimal TotalSpent { get; set; } // Pre-computed
}

// Write DbContext
public class WriteDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
}

// Read DbContext
public class ReadDbContext : DbContext
{
    public DbSet<UserReadModel> Users => Set<UserReadModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserReadModel>()
            .ToTable("users_read_model") // Tabla separada
            .HasNoKey(); // Read-only
    }
}

// Command Handler usa WriteDbContext
public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result>
{
    private readonly WriteDbContext _writeContext;
    private readonly IMediator _mediator;

    public async Task<Result> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var user = new User { /* ... */ };

        _writeContext.Users.Add(user);
        await _writeContext.SaveChangesAsync(ct);

        // Publicar evento para actualizar Read Model
        await _mediator.Publish(new UserCreatedEvent(user.Id, user.Email), ct);

        return Result.Success();
    }
}

// Event Handler actualiza Read Model
public class UserCreatedEventHandler : INotificationHandler<UserCreatedEvent>
{
    private readonly ReadDbContext _readContext;

    public async Task Handle(UserCreatedEvent notification, CancellationToken ct)
    {
        // Sync Read Model
        var readModel = new UserReadModel
        {
            Id = notification.UserId,
            Email = notification.Email,
            FullName = $"{notification.FirstName} {notification.LastName}",
            OrdersCount = 0,
            TotalSpent = 0
        };

        _readContext.Users.Add(readModel);
        await _readContext.SaveChangesAsync(ct);
    }
}

// Query Handler usa ReadDbContext
public class GetUserHandler : IRequestHandler<GetUserQuery, Result<UserDto>>
{
    private readonly ReadDbContext _readContext;

    public async Task<Result<UserDto>> Handle(GetUserQuery request, CancellationToken ct)
    {
        var user = await _readContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.Id, ct);

        // Read model ya tiene datos pre-computados!
        return Result<UserDto>.Success(user.Adapt<UserDto>());
    }
}
```

---

## 🎨 Advanced Patterns

### Eventual Consistency

```csharp
// Command retorna inmediatamente
public async Task<Result> Handle(CreateUserCommand request, CancellationToken ct)
{
    var user = new User { /* ... */ };

    _writeContext.Users.Add(user);
    await _writeContext.SaveChangesAsync(ct);

    // Background job para actualizar Read Model
    await _backgroundJobs.Enqueue(new SyncUserReadModelJob(user.Id));

    return Result.Success(); // ✅ Retorna antes de sync
}

// Read Model puede estar desactualizado por unos segundos
```

### CQRS con Cache

```csharp
public class GetUserHandler : IRequestHandler<GetUserQuery, Result<UserDto>>
{
    private readonly IDistributedCache _cache;
    private readonly ReadDbContext _context;

    public async Task<Result<UserDto>> Handle(GetUserQuery request, CancellationToken ct)
    {
        // Try cache first
        var cacheKey = $"user:{request.Id}";
        var cached = await _cache.GetStringAsync(cacheKey, ct);

        if (cached != null)
            return Result<UserDto>.Success(JsonSerializer.Deserialize<UserDto>(cached));

        // Query database
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.Id, ct);

        if (user == null)
            return Result<UserDto>.Failure("User not found");

        var dto = user.Adapt<UserDto>();

        // Cache for 5 minutes
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(dto),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            },
            ct);

        return Result<UserDto>.Success(dto);
    }
}

// Invalidar cache en Commands
public async Task<Result> Handle(UpdateUserCommand request, CancellationToken ct)
{
    // Update user...
    await _writeContext.SaveChangesAsync(ct);

    // Invalidate cache
    await _cache.RemoveAsync($"user:{request.Id}", ct);

    return Result.Success();
}
```

---

## ✅ Best Practices

### DO ✅

1. **Commands NO retornan datos** - Solo éxito/fallo
2. **Queries NO modifican estado** - Idempotentes
3. **AsNoTracking() en Queries** - Performance
4. **Projections en Queries** - Solo columnas necesarias
5. **Validation en Commands** - Estricta
6. **DTOs en Queries** - Nunca entidades
7. **Separate models cuando necesario** - Read vs Write optimization

### DON'T ❌

1. ❌ **NO** retornar entidades desde Commands
2. ❌ **NO** modificar estado en Queries
3. ❌ **NO** usar tracking en Queries
4. ❌ **NO** mezclar Commands y Queries
5. ❌ **NO** hacer validación en Queries
6. ❌ **NO** usar transacciones en Queries
7. ❌ **NO** sobre-complicar (start simple)

---

## 📊 When to Use CQRS

### Use CQRS When:

✅ **Different read/write loads** - Muchas lecturas, pocas escrituras
✅ **Complex business logic** - Validaciones complejas en writes
✅ **Performance critical** - Optimización independiente necesaria
✅ **Scalability needed** - Read y Write escalan diferente
✅ **Event-driven architecture** - Natural fit con Event Sourcing

### DON'T Use CQRS When:

❌ **Simple CRUD** - Overhead innecesario
❌ **Small applications** - Over-engineering
❌ **Immediate consistency required** - CQRS favorece eventual consistency
❌ **Team unfamiliar** - Learning curve

---

## 🧪 Testing CQRS

### Command Tests

```csharp
public class CreateUserCommandTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesUser()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var handler = new CreateUserHandler(context);
        var command = new CreateUserCommand("test@test.com", "John", "Doe");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        context.Users.Should().ContainSingle();
    }
}
```

### Query Tests

```csharp
public class GetUserQueryTests
{
    [Fact]
    public async Task Handle_ExistingUser_ReturnsUserDto()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var user = new User { Id = Guid.NewGuid(), Email = "test@test.com" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var handler = new GetUserHandler(context);
        var query = new GetUserByIdQuery(user.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Email.Should().Be("test@test.com");
    }
}
```

---

## 📚 Referencias

- **Martin Fowler:** https://martinfowler.com/bliki/CQRS.html
- **Greg Young (creator):** https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf
- **Microsoft Docs:** https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs

---

**Used by:** tdd-implementer, backend-expert, api-designer
**Related skills:** architecture/clean-architecture.md, dotnet/mediatr.md, architecture/ddd.md
