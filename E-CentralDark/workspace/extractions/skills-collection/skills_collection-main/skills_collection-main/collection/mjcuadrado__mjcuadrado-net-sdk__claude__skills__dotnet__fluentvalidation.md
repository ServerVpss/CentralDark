---
name: fluentvalidation
description: FluentValidation patterns and integration with MediatR for .NET 9
version: 0.1.0
tags: [dotnet, validation, fluentvalidation, mediatr, cqrs]
---

# FluentValidation - Strongly-Typed Validation

FluentValidation es una librería para construir reglas de validación fuertemente tipadas usando una interfaz fluida y expresiones lambda.

## 🎯 Overview

**Por qué FluentValidation en mj2:**
- **Type-Safe:** Validaciones con IntelliSense completo
- **Reutilizable:** Validators como clases independientes
- **Testeable:** Unit tests de validaciones aisladas
- **MediatR Integration:** Pipeline behavior automático
- **Clean:** Separa validación de lógica de negocio

---

## 📦 Packages Requeridos

```xml
<PackageReference Include="FluentValidation" Version="11.9.0" />
<PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.9.0" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
```

---

## 🚀 Quick Start

### Setup en Program.cs

```csharp
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Registrar todos los validators del assembly
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// O desde otro assembly (Application layer)
builder.Services.AddValidatorsFromAssemblyContaining<CreateUserCommandValidator>();

var app = builder.Build();
```

### Validator Básico

```csharp
using FluentValidation;

public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName,
    string Password
) : IRequest<Result<Guid>>;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(254).WithMessage("Email too long");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name too long");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name too long");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain digit");
    }
}
```

---

## 🎯 Common Rules

### String Validation

```csharp
RuleFor(x => x.Name)
    .NotEmpty()                              // No vacío ni null
    .NotNull()                               // No null
    .Length(2, 50)                           // Longitud entre 2 y 50
    .MinimumLength(2)                        // Mínimo 2
    .MaximumLength(50)                       // Máximo 50
    .Matches(@"^[a-zA-Z\s]+$")              // Regex
    .EmailAddress()                          // Email válido
    .Must(BeValidPhoneNumber);               // Custom predicate

private bool BeValidPhoneNumber(string phoneNumber)
{
    return Regex.IsMatch(phoneNumber, @"^\+?[1-9]\d{1,14}$");
}
```

### Numeric Validation

```csharp
RuleFor(x => x.Age)
    .GreaterThan(0)                          // Mayor que 0
    .GreaterThanOrEqualTo(18)                // Mayor o igual a 18
    .LessThan(120)                           // Menor que 120
    .LessThanOrEqualTo(100)                  // Menor o igual a 100
    .InclusiveBetween(18, 65);               // Entre 18 y 65 (inclusivo)

RuleFor(x => x.Price)
    .ScalePrecision(2, 10)                   // 2 decimales, 10 dígitos total
    .PrecisionScale(10, 2, true);            // Ignora trailing zeros
```

### Collection Validation

```csharp
RuleFor(x => x.Tags)
    .NotEmpty()                              // Lista no vacía
    .Must(tags => tags.Count <= 5)           // Máximo 5 items
    .ForEach(tag =>                          // Validar cada item
    {
        tag.NotEmpty();
        tag.MaximumLength(20);
    });

RuleForEach(x => x.Emails)                   // Validar cada email
    .EmailAddress();
```

### Conditional Validation

```csharp
// When (condición simple)
RuleFor(x => x.CompanyName)
    .NotEmpty()
    .When(x => x.IsCompany);

// Unless (inverso de When)
RuleFor(x => x.Age)
    .GreaterThanOrEqualTo(18)
    .Unless(x => x.IsMinorWithPermission);

// Multiple conditions
RuleFor(x => x.VatNumber)
    .NotEmpty()
    .When(x => x.IsCompany && x.Country == "ES");
```

---

## 🔥 Integration con MediatR

### Validation Behavior (Pipeline)

```csharp
using FluentValidation;
using MediatR;

public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
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
        // Si no hay validators, continuar
        if (!_validators.Any())
            return await next();

        // Ejecutar todas las validaciones
        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        // Colectar errores
        var failures = validationResults
            .Where(r => !r.IsValid)
            .SelectMany(r => r.Errors)
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray());

        if (failures.Any())
        {
            // Retornar Result con errores
            return (TResponse)Result.Failure(
                $"Validation failed: {string.Join(", ", failures.SelectMany(f => f.Value))}");
        }

        return await next();
    }
}

// Registro en Program.cs
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});
```

### Controller Integration (Manual)

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IValidator<CreateUserCommand> _validator;

    public UsersController(
        IMediator mediator,
        IValidator<CreateUserCommand> validator)
    {
        _mediator = mediator;
        _validator = validator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserCommand command)
    {
        // Validación manual (alternativa al pipeline)
        var validationResult = await _validator.ValidateAsync(command);

        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(
            nameof(GetUser),
            new { id = result.Value },
            result.Value);
    }
}
```

---

## 🎨 Advanced Patterns

### Async Validation (Database Checks)

```csharp
public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private readonly ApplicationDbContext _context;

    public CreateUserCommandValidator(ApplicationDbContext context)
    {
        _context = context;

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MustAsync(BeUniqueEmail)
            .WithMessage("Email already exists");
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken ct)
    {
        return !await _context.Users.AnyAsync(u => u.Email == email, ct);
    }
}
```

### Nested Object Validation

```csharp
public record CreateOrderCommand(
    Guid CustomerId,
    AddressDto ShippingAddress,
    List<OrderItemDto> Items
) : IRequest<Result<Guid>>;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty();

        // Validar objeto anidado
        RuleFor(x => x.ShippingAddress)
            .NotNull()
            .SetValidator(new AddressDtoValidator());

        // Validar lista de objetos
        RuleForEach(x => x.Items)
            .SetValidator(new OrderItemDtoValidator());
    }
}

public class AddressDtoValidator : AbstractValidator<AddressDto>
{
    public AddressDtoValidator()
    {
        RuleFor(x => x.Street).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.ZipCode).NotEmpty().Matches(@"^\d{5}$");
    }
}
```

### Custom Validators

```csharp
// Validator reutilizable
public class PhoneNumberValidator : AbstractValidator<string>
{
    public PhoneNumberValidator()
    {
        RuleFor(x => x)
            .NotEmpty()
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Invalid phone number format");
    }
}

// Uso
public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .SetValidator(new PhoneNumberValidator());
    }
}
```

### Rule Sets (Escenarios diferentes)

```csharp
public class UserValidator : AbstractValidator<User>
{
    public UserValidator()
    {
        // Reglas siempre aplicadas
        RuleFor(x => x.Email).NotEmpty().EmailAddress();

        // Rule set para creación
        RuleSet("Create", () =>
        {
            RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        });

        // Rule set para actualización
        RuleSet("Update", () =>
        {
            RuleFor(x => x.Id).NotEmpty();
        });
    }
}

// Uso
var result = await validator.ValidateAsync(user, options =>
{
    options.IncludeRuleSets("Create");
});
```

---

## 🧪 Testing Validators

### Unit Tests

```csharp
public class CreateUserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _validator;

    public CreateUserCommandValidatorTests()
    {
        _validator = new CreateUserCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Empty()
    {
        // Arrange
        var command = new CreateUserCommand("", "John", "Doe", "Password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage("Email is required");
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Invalid()
    {
        // Arrange
        var command = new CreateUserCommand("invalid-email", "John", "Doe", "Password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage("Invalid email format");
    }

    [Fact]
    public void Should_Not_Have_Error_When_Command_Is_Valid()
    {
        // Arrange
        var command = new CreateUserCommand(
            "john@test.com",
            "John",
            "Doe",
            "Password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("short")]
    [InlineData("nouppercas3")]
    [InlineData("NOLOWERCASE3")]
    [InlineData("NoDigitsHere")]
    public void Should_Have_Error_When_Password_Is_Weak(string password)
    {
        // Arrange
        var command = new CreateUserCommand("john@test.com", "John", "Doe", password);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
```

---

## ✅ Best Practices

### DO ✅

1. **Validator por Command/Query** - Una clase validator por cada request
2. **Dependency Injection** - Inyectar servicios en validators cuando sea necesario
3. **Mensajes descriptivos** - `.WithMessage()` claros para el usuario
4. **Async para DB checks** - `MustAsync()` para validaciones que requieren I/O
5. **TestValidate()** - Usar helpers de FluentValidation en tests
6. **Rule Sets** - Para diferentes escenarios (Create/Update)
7. **Custom validators** - Reutilizar validaciones comunes
8. **Pipeline Behavior** - Integrar con MediatR para validación automática

### DON'T ❌

1. ❌ **NO** hacer lógica de negocio en validators (solo validación)
2. ❌ **NO** validar en múltiples lugares (controller + handler)
3. ❌ **NO** usar validaciones síncronas para DB checks
4. ❌ **NO** olvidar `.WithMessage()` (usa mensajes default)
5. ❌ **NO** hacer N+1 queries en `MustAsync()`
6. ❌ **NO** validar entidades (validar DTOs/Commands)
7. ❌ **NO** hardcodear strings (usar constants/resources)

---

## 🔐 Common Validation Patterns

### Email Validation

```csharp
RuleFor(x => x.Email)
    .NotEmpty()
    .EmailAddress()
    .MaximumLength(254) // RFC 5321
    .MustAsync(BeUniqueEmail)
    .WithMessage("Email already in use");
```

### Password Validation

```csharp
RuleFor(x => x.Password)
    .NotEmpty()
    .MinimumLength(8)
    .MaximumLength(100)
    .Matches(@"[A-Z]").WithMessage("Must contain uppercase")
    .Matches(@"[a-z]").WithMessage("Must contain lowercase")
    .Matches(@"[0-9]").WithMessage("Must contain digit")
    .Matches(@"[@$!%*?&#]").WithMessage("Must contain special character");
```

### URL Validation

```csharp
RuleFor(x => x.Website)
    .Must(BeValidUrl)
    .WithMessage("Invalid URL format");

private bool BeValidUrl(string url)
{
    return Uri.TryCreate(url, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
}
```

### Date Validation

```csharp
RuleFor(x => x.BirthDate)
    .NotEmpty()
    .LessThan(DateTime.Today)
    .WithMessage("Birth date must be in the past")
    .Must(BeAtLeast18YearsOld)
    .WithMessage("Must be at least 18 years old");

private bool BeAtLeast18YearsOld(DateTime birthDate)
{
    return birthDate <= DateTime.Today.AddYears(-18);
}
```

---

## 📚 Error Response Format

### Standard Error Response

```csharp
public class ValidationErrorResponse
{
    public string Message { get; set; } = "Validation failed";
    public Dictionary<string, string[]> Errors { get; set; } = new();
}

// En ValidationBehavior
var failures = validationResults
    .Where(r => !r.IsValid)
    .SelectMany(r => r.Errors)
    .GroupBy(e => e.PropertyName)
    .ToDictionary(
        g => g.Key,
        g => g.Select(e => e.ErrorMessage).ToArray());

var errorResponse = new ValidationErrorResponse { Errors = failures };
```

### Example Response

```json
{
  "message": "Validation failed",
  "errors": {
    "Email": [
      "Email is required",
      "Invalid email format"
    ],
    "Password": [
      "Password must be at least 8 characters",
      "Password must contain uppercase letter"
    ]
  }
}
```

---

## 📋 Referencias

- **FluentValidation Docs:** https://docs.fluentvalidation.net/
- **GitHub:** https://github.com/FluentValidation/FluentValidation
- **MediatR Integration:** https://docs.fluentvalidation.net/en/latest/aspnet.html

---

**Used by:** tdd-implementer, api-designer, backend-expert
**Related skills:** dotnet/mediatr.md, architecture/cqrs.md, dotnet/aspnet-core.md
