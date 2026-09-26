---
name: mediatr
description: MediatR CQRS patterns and pipeline behaviors for .NET 9
version: 0.1.0
tags: [dotnet, mediatr, cqrs, patterns, architecture]
---

# MediatR - CQRS & Mediator Pattern

MediatR es una implementación del patrón Mediator para .NET que facilita CQRS (Command Query Responsibility Segregation) y reduce el acoplamiento en aplicaciones.

## 🎯 Overview

**Por qué MediatR en mj2:**
- **CQRS:** Separación clara entre Commands (write) y Queries (read)
- **Desacoplamiento:** Handlers no conocen a los invocadores
- **Pipeline:** Behaviors transversales (validation, logging, transactions)
- **Testabilidad:** Handlers aislados fáciles de testear
- **Clean Architecture:** Separa Application de Infrastructure

---

## 📦 Packages Requeridos

```xml
<PackageReference Include="MediatR" Version="12.4.0" />
<PackageReference Include="MediatR.Extensions.Microsoft.DependencyInjection" Version="11.1.0" />
```

---

## 🚀 Quick Start

### Setup en Program.cs

```csharp
using MediatR;

var builder = WebApplication.CreateBuilder(args);

// Registrar MediatR y escanear handlers
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    // O desde otro assembly (Application layer)
    cfg.RegisterServicesFromAssemblyContaining<CreateUserCommand>();
});

var app = builder.Build();
```

### Command Básico

```csharp
// Command (write operation)
public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName
) : IRequest<Result<Guid>>; // Retorna Result<Guid>

// Handler
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
        CancellationToken cancellationToken)
    {
        // Validar si usuario existe
        var exists = await _context.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (exists)
            return Result<Guid>.Failure("User with this email already exists");

        // Crear usuario
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User created: {UserId}", user.Id);

        return Result<Guid>.Success(user.Id);
    }
}
```

### Query Básico

```csharp
// Query (read operation)
public record GetUserByIdQuery(Guid Id) : IRequest<Result<UserDto>>;

// Handler
public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
{
    private readonly ApplicationDbContext _context;

    public GetUserByIdHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserDto>> Handle(
        GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == request.Id)
            .ProjectToType<UserDto>() // Mapster
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<UserDto>.Failure($"User {request.Id} not found");

        return Result<UserDto>.Success(user);
    }
}
```

### Uso en Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(
            nameof(GetUser),
            new { id = result.Value },
            result.Value);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var result = await _mediator.Send(new GetUserByIdQuery(id));

        if (result.IsFailure)
            return NotFound(result.Error);

        return Ok(result.Value);
    }
}
```

---

## 🎯 CQRS Patterns

### Commands (Write Operations)

**Características:**
- Modifican estado (Create, Update, Delete)
- Retornan confirmación o ID
- Usan tracking en EF Core
- Requieren validación estricta

```csharp
// Update Command
public record UpdateUserCommand(
    Guid Id,
    string FirstName,
    string LastName
) : IRequest<Result<UserDto>>;

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Result<UserDto>>
{
    private readonly ApplicationDbContext _context;

    public async Task<Result<UserDto>> Handle(
        UpdateUserCommand request,
        CancellationToken ct)
    {
        var user = await _context.Users.FindAsync(new object[] { request.Id }, ct);
        if (user == null)
            return Result<UserDto>.Failure($"User {request.Id} not found");

        // Actualizar
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        var dto = user.Adapt<UserDto>();
        return Result<UserDto>.Success(dto);
    }
}

// Delete Command
public record DeleteUserCommand(Guid Id) : IRequest<Result>;

public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, Result>
{
    private readonly ApplicationDbContext _context;

    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken ct)
    {
        var user = await _context.Users.FindAsync(new object[] { request.Id }, ct);
        if (user == null)
            return Result.Failure($"User {request.Id} not found");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
```

### Queries (Read Operations)

**Características:**
- Solo lectura (NO modifican estado)
- Retornan DTOs (nunca entidades)
- Usan AsNoTracking()
- Optimizan con proyecciones (ProjectToType)

```csharp
// List Query
public record GetUsersQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<Result<PagedResult<UserDto>>>;

public class GetUsersHandler
    : IRequestHandler<GetUsersQuery, Result<PagedResult<UserDto>>>
{
    private readonly ApplicationDbContext _context;

    public async Task<Result<PagedResult<UserDto>>> Handle(
        GetUsersQuery request,
        CancellationToken ct)
    {
        var query = _context.Users.AsNoTracking();

        var totalCount = await query.CountAsync(ct);

        var users = await query
            .OrderBy(u => u.Email)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectToType<UserDto>()
            .ToListAsync(ct);

        var result = new PagedResult<UserDto>
        {
            Items = users,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result<PagedResult<UserDto>>.Success(result);
    }
}
```

---

## ⚙️ Pipeline Behaviors

Los behaviors son middleware que se ejecutan antes/después de cada handler.

### 1. Validation Behavior (con FluentValidation)

```csharp
using FluentValidation;

public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .Where(r => !r.IsValid)
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

### 2. Logging Behavior

```csharp
public class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation(
            "Handling {RequestName}: {@Request}",
            requestName,
            request);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            _logger.LogInformation(
                "Handled {RequestName} in {ElapsedMs}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(
                ex,
                "Error handling {RequestName} after {ElapsedMs}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);

            throw;
        }
    }
}
```

### 3. Transaction Behavior

```csharp
public class TransactionBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;

    public TransactionBehavior(
        ApplicationDbContext context,
        ILogger<TransactionBehavior<TRequest, TResponse>> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Solo para Commands (no Queries)
        if (!typeof(TRequest).Name.EndsWith("Command"))
            return await next();

        var strategy = _context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database
                .BeginTransactionAsync(cancellationToken);

            try
            {
                var response = await next();

                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Transaction committed for {RequestName}",
                    typeof(TRequest).Name);

                return response;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);

                _logger.LogError(ex,
                    "Transaction rolled back for {RequestName}",
                    typeof(TRequest).Name);

                throw;
            }
        });
    }
}
```

### Registro de Behaviors

```csharp
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);

    // Orden IMPORTA: se ejecutan en el orden registrado
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
});
```

---

## 🎨 Advanced Patterns

### Notifications (Domain Events)

```csharp
// Event
public record UserCreatedNotification(Guid UserId, string Email) : INotification;

// Handlers (múltiples pueden escuchar el mismo evento)
public class SendWelcomeEmailHandler : INotificationHandler<UserCreatedNotification>
{
    private readonly IEmailService _emailService;

    public async Task Handle(UserCreatedNotification notification, CancellationToken ct)
    {
        await _emailService.SendWelcomeEmailAsync(notification.Email);
    }
}

public class CreateUserProfileHandler : INotificationHandler<UserCreatedNotification>
{
    private readonly ApplicationDbContext _context;

    public async Task Handle(UserCreatedNotification notification, CancellationToken ct)
    {
        var profile = new UserProfile { UserId = notification.UserId };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync(ct);
    }
}

// Publicar evento
await _mediator.Publish(new UserCreatedNotification(user.Id, user.Email));
```

### Stream Requests (IStreamRequest)

```csharp
// Stream Query
public record StreamUsersQuery : IStreamRequest<UserDto>;

public class StreamUsersHandler : IStreamRequestHandler<StreamUsersQuery, UserDto>
{
    private readonly ApplicationDbContext _context;

    public async IAsyncEnumerable<UserDto> Handle(
        StreamUsersQuery request,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (var user in _context.Users.AsAsyncEnumerable())
        {
            yield return user.Adapt<UserDto>();
        }
    }
}

// Uso
await foreach (var user in _mediator.CreateStream(new StreamUsersQuery()))
{
    Console.WriteLine(user.Email);
}
```

---

## 🧪 Testing

### Unit Test de Handler

```csharp
public class CreateUserHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _handler = new CreateUserHandler(_context, Mock.Of<ILogger<CreateUserHandler>>());
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesUser()
    {
        // Arrange
        var command = new CreateUserCommand(
            "test@test.com",
            "John",
            "Doe");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        var user = await _context.Users.FindAsync(result.Value);
        user.Should().NotBeNull();
        user!.Email.Should().Be("test@test.com");
    }

    [Fact]
    public async Task Handle_DuplicateEmail_ReturnsFailure()
    {
        // Arrange
        _context.Users.Add(new User { Id = Guid.NewGuid(), Email = "test@test.com" });
        await _context.SaveChangesAsync();

        var command = new CreateUserCommand("test@test.com", "John", "Doe");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("already exists");
    }
}
```

### Integration Test con Mediator

```csharp
public class UsersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UsersControllerTests(WebApplicationFactory<Program> factory)
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
        var userId = await response.Content.ReadFromJsonAsync<Guid>();
        userId.Should().NotBeEmpty();
    }
}
```

---

## ✅ Best Practices

### DO ✅

1. **Commands retornan Result<T>** para manejo consistente de errores
2. **Queries usan AsNoTracking()** para optimizar performance
3. **DTOs en respuestas** (nunca entidades directamente)
4. **Validación en Behaviors** (no en handlers)
5. **Transacciones en Commands** (no en Queries)
6. **Logging en Behaviors** para observabilidad
7. **Nombres descriptivos:** `CreateUserCommand`, `GetUserByIdQuery`
8. **CancellationToken** en todos los handlers

### DON'T ❌

1. ❌ **NO** retornar entidades EF Core desde handlers
2. ❌ **NO** hacer lógica de negocio en Controllers
3. ❌ **NO** olvidar CancellationToken
4. ❌ **NO** usar tracking en Queries
5. ❌ **NO** mezclar Commands y Queries
6. ❌ **NO** hacer validación en múltiples lugares
7. ❌ **NO** usar transacciones en Queries

---

## 🏗️ Clean Architecture Integration

```
src/
├── Domain/
│   ├── Entities/
│   │   └── User.cs
│   └── Common/
│       └── Result.cs
├── Application/
│   ├── Users/
│   │   ├── Commands/
│   │   │   ├── CreateUser/
│   │   │   │   ├── CreateUserCommand.cs
│   │   │   │   ├── CreateUserHandler.cs
│   │   │   │   └── CreateUserValidator.cs
│   │   │   └── UpdateUser/
│   │   └── Queries/
│   │       ├── GetUserById/
│   │       │   ├── GetUserByIdQuery.cs
│   │       │   └── GetUserByIdHandler.cs
│   │       └── GetUsers/
│   ├── Common/
│   │   ├── Behaviors/
│   │   │   ├── ValidationBehavior.cs
│   │   │   ├── LoggingBehavior.cs
│   │   │   └── TransactionBehavior.cs
│   │   └── DTOs/
│   │       └── UserDto.cs
│   └── DependencyInjection.cs
├── Infrastructure/
│   └── Persistence/
│       └── ApplicationDbContext.cs
└── Api/
    └── Controllers/
        └── UsersController.cs
```

---

## 📚 Referencias

- **MediatR GitHub:** https://github.com/jbogard/MediatR
- **CQRS Pattern:** https://martinfowler.com/bliki/CQRS.html
- **Jimmy Bogard (creator):** https://jimmybogard.com/

---

**Used by:** tdd-implementer, api-designer, backend-expert
**Related skills:** dotnet/fluentvalidation.md, architecture/cqrs.md, dotnet/mapster.md
