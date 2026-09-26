---
name: clean-architecture
description: Clean Architecture patterns for .NET 9 applications
version: 0.1.0
tags: [architecture, clean-architecture, dependency-inversion, layers]
---

# Clean Architecture for .NET 9

Clean Architecture es un patrón arquitectónico que enfatiza la separación de responsabilidades y la independencia de frameworks, UI, y bases de datos.

## 🎯 Overview

**Principios fundamentales:**
- **Independencia de frameworks:** La lógica de negocio no depende de bibliotecas externas
- **Testeable:** Lógica de negocio se puede testear sin UI, DB, o servicios externos
- **Independencia de UI:** UI puede cambiar sin afectar el core
- **Independencia de DB:** Puedes cambiar PostgreSQL por MongoDB sin afectar reglas de negocio
- **Independencia de agentes externos:** Reglas de negocio no saben nada del mundo exterior

---

## 🏗️ Layer Structure

```
┌──────────────────────────────────────────────┐
│              Presentation Layer               │
│         (API, Controllers, Views)             │
├──────────────────────────────────────────────┤
│           Application Layer                   │
│    (Use Cases, DTOs, Interfaces, CQRS)       │
├──────────────────────────────────────────────┤
│              Domain Layer                     │
│   (Entities, Value Objects, Domain Events)   │
└──────────────────────────────────────────────┘
         Infrastructure Layer
    (EF Core, External Services, Auth)
```

### Dependency Rule

**Flujo de dependencias:**
```
Presentation → Application → Domain
       ↓              ↓
   Infrastructure ────┘
```

**Regla de oro:** Las dependencias solo pueden apuntar hacia adentro. El Domain NO conoce a Application, Infrastructure, o Presentation.

---

## 📁 Project Structure

```
src/
├── Domain/                          # Core business logic
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Product.cs
│   │   └── Order.cs
│   ├── ValueObjects/
│   │   ├── Email.cs
│   │   ├── Money.cs
│   │   └── Address.cs
│   ├── Events/
│   │   ├── UserCreatedEvent.cs
│   │   └── OrderPlacedEvent.cs
│   ├── Exceptions/
│   │   └── DomainException.cs
│   └── Common/
│       ├── Entity.cs                # Base entity
│       ├── ValueObject.cs           # Base value object
│       └── IDomainEvent.cs
│
├── Application/                     # Use cases & orchestration
│   ├── Users/
│   │   ├── Commands/
│   │   │   ├── CreateUser/
│   │   │   │   ├── CreateUserCommand.cs
│   │   │   │   ├── CreateUserHandler.cs
│   │   │   │   └── CreateUserValidator.cs
│   │   │   └── UpdateUser/
│   │   └── Queries/
│   │       ├── GetUserById/
│   │       └── GetUsers/
│   ├── Common/
│   │   ├── Interfaces/
│   │   │   ├── IApplicationDbContext.cs
│   │   │   ├── IEmailService.cs
│   │   │   └── IDateTime.cs
│   │   ├── Behaviors/
│   │   │   ├── ValidationBehavior.cs
│   │   │   ├── LoggingBehavior.cs
│   │   │   └── TransactionBehavior.cs
│   │   ├── DTOs/
│   │   │   └── UserDto.cs
│   │   ├── Mappings/
│   │   │   └── MappingConfig.cs
│   │   └── Models/
│   │       ├── Result.cs
│   │       └── PagedResult.cs
│   └── DependencyInjection.cs
│
├── Infrastructure/                  # External concerns
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs
│   │   ├── Configurations/
│   │   │   ├── UserConfiguration.cs
│   │   │   └── ProductConfiguration.cs
│   │   ├── Migrations/
│   │   └── Repositories/
│   │       └── UserRepository.cs
│   ├── Services/
│   │   ├── DateTimeService.cs
│   │   ├── EmailService.cs
│   │   └── StorageService.cs
│   ├── Identity/
│   │   └── IdentityService.cs
│   └── DependencyInjection.cs
│
└── Api/                             # Entry point
    ├── Controllers/
    │   └── UsersController.cs
    ├── Middleware/
    │   └── ExceptionHandlingMiddleware.cs
    ├── Filters/
    │   └── ValidationFilter.cs
    └── Program.cs
```

---

## 🎨 Domain Layer

### Base Entity

```csharp
public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other)
            return false;

        if (ReferenceEquals(this, other))
            return true;

        if (GetType() != other.GetType())
            return false;

        return Id == other.Id;
    }

    public override int GetHashCode() => Id.GetHashCode();
}
```

### Value Objects

```csharp
public abstract class ValueObject
{
    protected abstract IEnumerable<object?> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType())
            return false;

        var valueObject = (ValueObject)obj;

        return GetEqualityComponents()
            .SequenceEqual(valueObject.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Aggregate(1, (current, obj) =>
            {
                unchecked
                {
                    return current * 23 + (obj?.GetHashCode() ?? 0);
                }
            });
    }
}

// Example: Email Value Object
public sealed class Email : ValueObject
{
    public string Value { get; }

    private Email(string value)
    {
        Value = value;
    }

    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result<Email>.Failure("Email cannot be empty");

        if (!email.Contains("@"))
            return Result<Email>.Failure("Invalid email format");

        return Result<Email>.Success(new Email(email));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
```

### Domain Entities

```csharp
public class User : Entity
{
    public Email Email { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Private constructor para control
    private User() { }

    // Factory method (Named Constructor)
    public static Result<User> Create(Email email, string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result<User>.Failure("First name is required");

        if (string.IsNullOrWhiteSpace(lastName))
            return Result<User>.Failure("Last name is required");

        var user = new User
        {
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            CreatedAt = DateTime.UtcNow
        };

        // Domain event
        user.RaiseDomainEvent(new UserCreatedEvent(user.Id, user.Email.Value));

        return Result<User>.Success(user);
    }

    public void UpdateName(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainException("First name is required");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainException("Last name is required");

        FirstName = firstName;
        LastName = lastName;
        UpdatedAt = DateTime.UtcNow;
    }
}
```

### Domain Events

```csharp
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}

public record UserCreatedEvent(Guid UserId, string Email) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
```

---

## 🎯 Application Layer

### Interfaces (Dependency Inversion)

```csharp
// Application define la interfaz, Infrastructure la implementa
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Product> Products { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

public interface IDateTime
{
    DateTime UtcNow { get; }
}
```

### Commands (Write Operations)

```csharp
public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName
) : IRequest<Result<Guid>>;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public CreateUserHandler(
        IApplicationDbContext context,
        IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Result<Guid>> Handle(
        CreateUserCommand request,
        CancellationToken cancellationToken)
    {
        // Validar duplicados
        var exists = await _context.Users
            .AnyAsync(u => u.Email.Value == request.Email, cancellationToken);

        if (exists)
            return Result<Guid>.Failure("User already exists");

        // Crear Value Object
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result<Guid>.Failure(emailResult.Error);

        // Crear Entity usando Factory Method
        var userResult = User.Create(
            emailResult.Value,
            request.FirstName,
            request.LastName);

        if (userResult.IsFailure)
            return Result<Guid>.Failure(userResult.Error);

        _context.Users.Add(userResult.Value);
        await _context.SaveChangesAsync(cancellationToken);

        // Side effects (after persistence)
        await _emailService.SendEmailAsync(
            request.Email,
            "Welcome",
            "Welcome to our platform!");

        return Result<Guid>.Success(userResult.Value.Id);
    }
}
```

### Queries (Read Operations)

```csharp
public record GetUserByIdQuery(Guid Id) : IRequest<Result<UserDto>>;

public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserByIdHandler(IApplicationDbContext context)
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

---

## 🔧 Infrastructure Layer

### DbContext Implementation

```csharp
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly IDateTime _dateTime;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IDateTime dateTime)
        : base(options)
    {
        _dateTime = dateTime;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Dispatch domain events
        var domainEvents = ChangeTracker.Entries<Entity>()
            .SelectMany(e => e.Entity.DomainEvents)
            .ToList();

        var result = await base.SaveChangesAsync(cancellationToken);

        // Process events after save (to avoid side effects in transaction)
        foreach (var domainEvent in domainEvents)
        {
            await _mediator.Publish(domainEvent, cancellationToken);
        }

        return result;
    }
}
```

### Entity Configuration

```csharp
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        // Value Object mapping
        builder.OwnsOne(u => u.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("email")
                .HasMaxLength(254)
                .IsRequired();
        });

        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();

        // Ignore domain events (not persisted)
        builder.Ignore(u => u.DomainEvents);
    }
}
```

### Service Implementation

```csharp
public class DateTimeService : IDateTime
{
    public DateTime UtcNow => DateTime.UtcNow;
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Implementation using SendGrid, AWS SES, etc.
        _logger.LogInformation("Sending email to {Email}", to);
        await Task.CompletedTask;
    }
}
```

---

## 🎨 Dependency Injection

### Application Layer

```csharp
// Application/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // MediatR
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        });

        // FluentValidation
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Mapster
        services.AddMapster();

        return services;
    }
}
```

### Infrastructure Layer

```csharp
// Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        // Services
        services.AddSingleton<IDateTime, DateTimeService>();
        services.AddTransient<IEmailService, EmailService>();

        return services;
    }
}
```

### API Layer (Program.cs)

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();
app.Run();
```

---

## 🧪 Testing Strategy

### Domain Tests (Unit)

```csharp
public class UserTests
{
    [Fact]
    public void Create_ValidData_ReturnsSuccess()
    {
        // Arrange
        var emailResult = Email.Create("test@test.com");

        // Act
        var result = User.Create(emailResult.Value, "John", "Doe");

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.FirstName.Should().Be("John");
        result.Value.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserCreatedEvent>();
    }

    [Fact]
    public void Create_EmptyFirstName_ReturnsFailure()
    {
        // Arrange
        var emailResult = Email.Create("test@test.com");

        // Act
        var result = User.Create(emailResult.Value, "", "Doe");

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("First name");
    }
}
```

### Application Tests (Unit with Mocks)

```csharp
public class CreateUserHandlerTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _emailServiceMock = new Mock<IEmailService>();
        _handler = new CreateUserHandler(_contextMock.Object, _emailServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesUser()
    {
        // Arrange
        var command = new CreateUserCommand("test@test.com", "John", "Doe");

        _contextMock.Setup(x => x.Users.AnyAsync(It.IsAny<Expression<Func<User, bool>>>(), default))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _contextMock.Verify(x => x.SaveChangesAsync(default), Times.Once);
        _emailServiceMock.Verify(x => x.SendEmailAsync(
            command.Email,
            "Welcome",
            It.IsAny<string>()), Times.Once);
    }
}
```

### Integration Tests

```csharp
public class UsersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateUser_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var command = new CreateUserCommand("test@test.com", "John", "Doe");

        // Act
        var response = await _client.PostAsJsonAsync("/api/users", command);

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

1. **Dependency flow hacia adentro** - Domain nunca depende de Application/Infrastructure
2. **Factory methods** en entidades para control de creación
3. **Value Objects** para conceptos del dominio (Email, Money, etc.)
4. **Domain events** para efectos secundarios desacoplados
5. **Interfaces en Application** implementadas en Infrastructure
6. **Result pattern** para manejo de errores funcional
7. **Tests por capa** - Unit (Domain), Integration (Application+Infrastructure)

### DON'T ❌

1. ❌ **NO** referenciar Infrastructure desde Domain
2. ❌ **NO** exponer entidades en APIs (usar DTOs)
3. ❌ **NO** constructores públicos sin validación en entities
4. ❌ **NO** setters públicos en entities (encapsulación)
5. ❌ **NO** lógica de negocio en Controllers
6. ❌ **NO** dependencias concretas en Application (usar interfaces)
7. ❌ **NO** hacer queries complejas en Domain

---

## 📚 Referencias

- **Clean Architecture (Robert C. Martin):** https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **.NET Clean Architecture Template:** https://github.com/jasontaylordev/CleanArchitecture
- **Domain-Driven Design:** Eric Evans book

---

**Used by:** tdd-implementer, backend-expert, api-designer
**Related skills:** architecture/ddd.md, architecture/cqrs.md, dotnet/mediatr.md
