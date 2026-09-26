---
name: vertical-slice
description: Vertical Slice Architecture patterns for feature-driven development
version: 0.1.0
tags: [architecture, vertical-slice, features, minimal-coupling]
---

# Vertical Slice Architecture

Vertical Slice Architecture organiza el código por **features** (rebanadas verticales) en lugar de **capas técnicas** (capas horizontales), minimizando acoplamiento entre features.

## 🎯 Overview

**Filosofía:**
- Cada feature es una "rebanada" vertical completa: UI → Logic → Data
- Features son independientes y autocontenidas
- Minimiza acoplamiento entre features
- Maximiza cohesión dentro de cada feature
- Facilita paralelización de desarrollo

**Comparación:**

```
Clean Architecture (Horizontal Layers):
┌─────────────────────────────────────┐
│         Controllers (API)            │ Todos los controllers juntos
├─────────────────────────────────────┤
│      Application (Use Cases)         │ Todos los handlers juntos
├─────────────────────────────────────┤
│         Domain (Entities)            │ Todas las entidades juntas
└─────────────────────────────────────┘

Vertical Slice (Features):
┌──────────┬──────────┬──────────┬──────────┐
│  Users   │ Products │  Orders  │ Payments │ Cada feature
│    │     │    │     │    │     │    │     │ tiene todo lo
│  API     │  API     │  API     │  API     │ que necesita
│  Logic   │  Logic   │  Logic   │  Logic   │
│  Data    │  Data    │  Data    │  Data    │
└──────────┴──────────┴──────────┴──────────┘
```

---

## 📁 Project Structure

```
src/
├── Api/
│   ├── Program.cs
│   └── appsettings.json
│
├── Features/                        # Cada feature es vertical
│   ├── Users/
│   │   ├── CreateUser/
│   │   │   ├── CreateUserEndpoint.cs      # Minimal API endpoint
│   │   │   ├── CreateUserCommand.cs       # Request
│   │   │   ├── CreateUserHandler.cs       # Logic
│   │   │   ├── CreateUserValidator.cs     # Validation
│   │   │   └── CreateUserTests.cs         # Tests co-located
│   │   ├── GetUserById/
│   │   │   ├── GetUserByIdEndpoint.cs
│   │   │   ├── GetUserByIdQuery.cs
│   │   │   ├── GetUserByIdHandler.cs
│   │   │   └── GetUserByIdTests.cs
│   │   ├── UpdateUser/
│   │   └── DeleteUser/
│   │
│   ├── Products/
│   │   ├── CreateProduct/
│   │   ├── GetProducts/
│   │   └── UpdateProduct/
│   │
│   └── Orders/
│       ├── PlaceOrder/
│       └── GetOrders/
│
├── Shared/                          # Solo código REALMENTE compartido
│   ├── Database/
│   │   ├── ApplicationDbContext.cs
│   │   └── Migrations/
│   ├── Models/
│   │   ├── User.cs                  # Modelo compartido
│   │   └── Product.cs
│   └── Common/
│       ├── Result.cs
│       └── PagedResult.cs
│
└── tests/
    └── IntegrationTests/
```

---

## 🚀 Feature Implementation

### Complete Feature Example

**Features/Users/CreateUser/CreateUserEndpoint.cs:**
```csharp
using Carter;

namespace Features.Users.CreateUser;

public class CreateUserEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/users", async (
            CreateUserCommand command,
            IMediator mediator,
            CancellationToken ct) =>
        {
            var result = await mediator.Send(command, ct);

            return result.IsSuccess
                ? Results.Created($"/api/users/{result.Value}", result.Value)
                : Results.BadRequest(result.Error);
        })
        .WithName("CreateUser")
        .WithTags("Users")
        .Produces<Guid>(StatusCodes.Status201Created)
        .Produces<string>(StatusCodes.Status400BadRequest);
    }
}
```

**Features/Users/CreateUser/CreateUserCommand.cs:**
```csharp
namespace Features.Users.CreateUser;

public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName
) : IRequest<Result<Guid>>;
```

**Features/Users/CreateUser/CreateUserValidator.cs:**
```csharp
using FluentValidation;

namespace Features.Users.CreateUser;

public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    private readonly ApplicationDbContext _context;

    public CreateUserValidator(ApplicationDbContext context)
    {
        _context = context;

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MustAsync(BeUniqueEmail)
            .WithMessage("Email already exists");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(100);
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken ct)
    {
        return !await _context.Users.AnyAsync(u => u.Email == email, ct);
    }
}
```

**Features/Users/CreateUser/CreateUserHandler.cs:**
```csharp
namespace Features.Users.CreateUser;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CreateUserHandler> _logger;

    public CreateUserHandler(
        ApplicationDbContext context,
        ILogger<CreateUserHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(
        CreateUserCommand request,
        CancellationToken ct)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("User created: {UserId}", user.Id);

        return Result<Guid>.Success(user.Id);
    }
}
```

**Features/Users/CreateUser/CreateUserTests.cs:**
```csharp
namespace Features.Users.CreateUser;

public class CreateUserTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CreateUserTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateUser_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var client = _factory.CreateClient();
        var command = new CreateUserCommand("test@test.com", "John", "Doe");

        // Act
        var response = await client.PostAsJsonAsync("/api/users", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

---

## 🎨 Advanced Patterns

### Feature with DTOs

**Features/Products/GetProducts/GetProductsQuery.cs:**
```csharp
namespace Features.Products.GetProducts;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 10
) : IRequest<Result<PagedResult<ProductDto>>>;

public record ProductDto(
    Guid Id,
    string Name,
    decimal Price,
    string CategoryName
);
```

**Features/Products/GetProducts/GetProductsHandler.cs:**
```csharp
namespace Features.Products.GetProducts;

public class GetProductsHandler
    : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductDto>>>
{
    private readonly ApplicationDbContext _context;

    public GetProductsHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<ProductDto>>> Handle(
        GetProductsQuery request,
        CancellationToken ct)
    {
        var totalCount = await _context.Products.CountAsync(ct);

        var products = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .OrderBy(p => p.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Price,
                p.Category.Name
            ))
            .ToListAsync(ct);

        var result = new PagedResult<ProductDto>
        {
            Items = products,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };

        return Result<PagedResult<ProductDto>>.Success(result);
    }
}
```

---

## 🔧 Setup & Configuration

### Program.cs (Minimal API)

```csharp
using Carter;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// MediatR (scan all features)
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});

// FluentValidation (scan all validators)
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// Carter (auto-discover endpoints)
builder.Services.AddCarter();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Map all Carter endpoints
app.MapCarter();

app.Run();
```

### Carter Module (Alternative to Manual Endpoints)

**Features/Users/UsersModule.cs:**
```csharp
using Carter;

namespace Features.Users;

public class UsersModule : CarterModule
{
    public UsersModule() : base("/api/users")
    {
    }

    public override void AddRoutes(IEndpointRouteBuilder app)
    {
        // POST /api/users
        app.MapPost("/", async (
            CreateUserCommand command,
            IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.IsSuccess
                ? Results.Created($"/api/users/{result.Value}", result.Value)
                : Results.BadRequest(result.Error);
        });

        // GET /api/users/{id}
        app.MapGet("/{id:guid}", async (
            Guid id,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUserByIdQuery(id));
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(result.Error);
        });

        // PUT /api/users/{id}
        app.MapPut("/{id:guid}", async (
            Guid id,
            UpdateUserRequest request,
            IMediator mediator) =>
        {
            var command = new UpdateUserCommand(id, request.FirstName, request.LastName);
            var result = await mediator.Send(command);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(result.Error);
        });

        // DELETE /api/users/{id}
        app.MapDelete("/{id:guid}", async (
            Guid id,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteUserCommand(id));
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(result.Error);
        });
    }
}
```

---

## 📊 Shared Code Strategy

### What to Share ✅

```csharp
// Shared/Common/Result.cs - Usado por TODAS las features
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; }

    // Implementation...
}

// Shared/Common/PagedResult.cs - Pattern común
public class PagedResult<T>
{
    public List<T> Items { get; init; } = new();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
}

// Shared/Database/ApplicationDbContext.cs - DbContext compartido
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
}
```

### What NOT to Share ❌

```csharp
// ❌ MAL - NO crear "Services" genéricos compartidos
// Shared/Services/UserService.cs
public class UserService
{
    public async Task<User> CreateUser(...) { }
    public async Task<User> GetUser(...) { }
    // Esto crea acoplamiento entre features!
}

// ✅ BIEN - Cada feature tiene su propia lógica
// Features/Users/CreateUser/CreateUserHandler.cs
// Features/Users/GetUser/GetUserHandler.cs
```

---

## 🧪 Testing Strategy

### Feature Tests (Integration)

```csharp
namespace Features.Users.CreateUser;

public class CreateUserFeatureTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly ApplicationDbContext _context;

    public CreateUserFeatureTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();

        var scope = factory.Services.CreateScope();
        _context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }

    [Fact]
    public async Task CreateUser_EndToEnd_Success()
    {
        // Arrange
        var command = new CreateUserCommand("test@test.com", "John", "Doe");

        // Act
        var response = await _client.PostAsJsonAsync("/api/users", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var userId = await response.Content.ReadFromJsonAsync<Guid>();
        var user = await _context.Users.FindAsync(userId);

        user.Should().NotBeNull();
        user!.Email.Should().Be("test@test.com");
    }
}
```

---

## ✅ Best Practices

### DO ✅

1. **Features autocontenidas** - Cada feature tiene TODO lo que necesita
2. **Minimal shared code** - Solo compartir lo realmente necesario
3. **Co-located tests** - Tests junto a la feature
4. **Minimal API** - Endpoints simples y directos
5. **Carter for organization** - Módulos para agrupar endpoints relacionados
6. **MediatR for logic** - Handlers desacoplados de endpoints
7. **Feature folders** - Organización por funcionalidad, no por capa técnica

### DON'T ❌

1. ❌ **NO** crear "Services" compartidos entre features
2. ❌ **NO** hacer que features dependan unas de otras
3. ❌ **NO** sobre-abstraer código común
4. ❌ **NO** usar capas técnicas (Controllers/, Services/, Repositories/)
5. ❌ **NO** compartir DTOs entre features
6. ❌ **NO** crear dependencies circulares entre features

---

## 🎯 When to Use

### Use Vertical Slice When:

✅ **Team is feature-focused** - Equipos trabajan en features independientes
✅ **Fast iteration needed** - Cambios rápidos sin afectar otras features
✅ **Minimal coupling priority** - Menos dependencias entre componentes
✅ **Microservices future** - Fácil extraer features a servicios separados
✅ **Junior-friendly** - Más fácil de entender (todo en un lugar)

### Use Clean Architecture When:

✅ **Complex domain logic** - Reglas de negocio complejas y compartidas
✅ **Strict layer separation** - Necesitas separación estricta UI/Logic/Data
✅ **Reusable domain** - Mismo dominio usado en múltiples aplicaciones
✅ **Enterprise patterns** - Organización requiere estructura formal

---

## 🔄 Hybrid Approach

Puedes combinar ambos:

```
src/
├── Features/                  # Vertical slices
│   ├── Users/
│   └── Products/
├── Domain/                    # Shared domain (Clean Architecture)
│   ├── Entities/
│   └── ValueObjects/
└── Infrastructure/            # Shared infrastructure
    └── Persistence/
```

---

## 📚 Referencias

- **Jimmy Bogard (creator):** https://jimmybogard.com/vertical-slice-architecture/
- **Carter (Minimal APIs):** https://github.com/CarterCommunity/Carter
- **Comparison with Clean Arch:** https://www.youtube.com/watch?v=SUiWfhAhgQw

---

**Used by:** tdd-implementer, api-designer
**Related skills:** architecture/clean-architecture.md, dotnet/mediatr.md
