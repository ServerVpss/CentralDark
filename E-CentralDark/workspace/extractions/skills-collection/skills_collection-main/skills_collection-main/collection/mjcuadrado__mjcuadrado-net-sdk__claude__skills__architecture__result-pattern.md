---
name: result-pattern
description: Result pattern for functional error handling in .NET applications
version: 0.1.0
tags: [architecture, patterns, error-handling, functional]
---

# Result Pattern

El Result Pattern es una alternativa a excepciones para manejo de errores, retornando un objeto `Result<T>` que encapsula éxito o fallo.

## 🎯 Overview

**Problema:**
```csharp
// ❌ Problemas con excepciones:
public User CreateUser(string email)
{
    if (string.IsNullOrEmpty(email))
        throw new ArgumentException("Email required"); // Control flow vía exceptions

    if (!IsValidEmail(email))
        throw new InvalidOperationException("Invalid email"); // No sabemos qué exceptions pueden ocurrir

    return new User { Email = email };
}
```

**Solución con Result Pattern:**
```csharp
// ✅ Explícito y type-safe:
public Result<User> CreateUser(string email)
{
    if (string.IsNullOrEmpty(email))
        return Result<User>.Failure("Email is required");

    if (!IsValidEmail(email))
        return Result<User>.Failure("Invalid email format");

    return Result<User>.Success(new User { Email = email });
}
```

**Beneficios:**
- **Explícito:** Firma del método indica que puede fallar
- **Type-safe:** Compilador fuerza manejo del resultado
- **Performance:** Sin stack unwinding de exceptions
- **Functional:** Railway-oriented programming
- **Testeable:** Fácil testear success y failure paths

---

## 🏗️ Implementation

### Basic Result (Non-Generic)

```csharp
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; private set; } = string.Empty;

    protected Result(bool isSuccess, string error)
    {
        if (isSuccess && !string.IsNullOrWhiteSpace(error))
            throw new InvalidOperationException("Success result cannot have error");

        if (!isSuccess && string.IsNullOrWhiteSpace(error))
            throw new InvalidOperationException("Failure result must have error");

        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, string.Empty);

    public static Result Failure(string error) => new(false, error);

    public static Result<T> Success<T>(T value) => Result<T>.Success(value);

    public static Result<T> Failure<T>(string error) => Result<T>.Failure(error);
}
```

### Generic Result<T>

```csharp
public class Result<T> : Result
{
    public T Value { get; private set; } = default!;

    private Result(bool isSuccess, T value, string error)
        : base(isSuccess, error)
    {
        Value = value;
    }

    public static Result<T> Success(T value)
    {
        if (value == null)
            throw new ArgumentNullException(nameof(value));

        return new Result<T>(true, value, string.Empty);
    }

    public static new Result<T> Failure(string error)
    {
        return new Result<T>(false, default!, error);
    }

    // Convenience methods
    public static implicit operator Result<T>(T value) => Success(value);

    public TResult Match<TResult>(
        Func<T, TResult> onSuccess,
        Func<string, TResult> onFailure)
    {
        return IsSuccess ? onSuccess(Value) : onFailure(Error);
    }
}
```

---

## 🎯 Usage Patterns

### Domain Layer

```csharp
public class User : Entity
{
    public Email Email { get; private set; }
    public string FirstName { get; private set; }

    private User() { }

    // Factory method returns Result
    public static Result<User> Create(string email, string firstName)
    {
        var emailResult = Email.Create(email);
        if (emailResult.IsFailure)
            return Result<User>.Failure(emailResult.Error);

        if (string.IsNullOrWhiteSpace(firstName))
            return Result<User>.Failure("First name is required");

        return Result<User>.Success(new User
        {
            Email = emailResult.Value,
            FirstName = firstName
        });
    }

    // Business method returns Result
    public Result UpdateEmail(string newEmail)
    {
        var emailResult = Email.Create(newEmail);
        if (emailResult.IsFailure)
            return Result.Failure(emailResult.Error);

        Email = emailResult.Value;
        return Result.Success();
    }
}
```

### Application Layer (Handlers)

```csharp
public record CreateUserCommand(string Email, string FirstName)
    : IRequest<Result<Guid>>;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public async Task<Result<Guid>> Handle(
        CreateUserCommand request,
        CancellationToken ct)
    {
        // Check duplicates
        var exists = await _context.Users
            .AnyAsync(u => u.Email.Value == request.Email, ct);

        if (exists)
            return Result<Guid>.Failure("User with this email already exists");

        // Create user (returns Result)
        var userResult = User.Create(request.Email, request.FirstName);

        if (userResult.IsFailure)
            return Result<Guid>.Failure(userResult.Error);

        _context.Users.Add(userResult.Value);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(userResult.Value.Id);
    }
}
```

### API Layer (Controllers)

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

        // Convert Result to IActionResult
        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(
            nameof(GetUser),
            new { id = result.Value },
            result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserCommand command)
    {
        var result = await _mediator.Send(command with { Id = id });

        return result.Match(
            onSuccess: user => Ok(user),
            onFailure: error => NotFound(new { error })
        );
    }
}
```

---

## 🎨 Advanced Patterns

### Result with Multiple Errors

```csharp
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public List<string> Errors { get; private set; } = new();
    public string Error => string.Join(", ", Errors);

    protected Result(bool isSuccess, params string[] errors)
    {
        IsSuccess = isSuccess;
        Errors = errors.ToList();
    }

    public static Result Success() => new(true);

    public static Result Failure(params string[] errors) => new(false, errors);

    // Combine multiple results
    public static Result Combine(params Result[] results)
    {
        var failures = results.Where(r => r.IsFailure).ToArray();

        if (!failures.Any())
            return Success();

        var allErrors = failures.SelectMany(r => r.Errors).ToArray();
        return Failure(allErrors);
    }
}

// Usage
var emailResult = Email.Create(email);
var nameResult = ValidateName(name);
var ageResult = ValidateAge(age);

var combinedResult = Result.Combine(emailResult, nameResult, ageResult);

if (combinedResult.IsFailure)
    return combinedResult; // All errors collected
```

### Railway-Oriented Programming

```csharp
public static class ResultExtensions
{
    // Bind (flatMap)
    public static Result<TOut> Bind<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, Result<TOut>> func)
    {
        return result.IsSuccess
            ? func(result.Value)
            : Result<TOut>.Failure(result.Error);
    }

    // Map (transform success value)
    public static Result<TOut> Map<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, TOut> func)
    {
        return result.IsSuccess
            ? Result<TOut>.Success(func(result.Value))
            : Result<TOut>.Failure(result.Error);
    }

    // Tap (side effect)
    public static Result<T> Tap<T>(
        this Result<T> result,
        Action<T> action)
    {
        if (result.IsSuccess)
            action(result.Value);

        return result;
    }

    // Async variants
    public static async Task<Result<TOut>> BindAsync<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, Task<Result<TOut>>> func)
    {
        return result.IsSuccess
            ? await func(result.Value)
            : Result<TOut>.Failure(result.Error);
    }
}

// Usage (Railway pattern)
var result = Email.Create(emailString)
    .Bind(email => User.Create(email, firstName))
    .Bind(user => ValidateUserRules(user))
    .Tap(user => _logger.LogInformation("User created: {UserId}", user.Id))
    .Map(user => user.Id);

if (result.IsFailure)
    return BadRequest(result.Error);

return Ok(result.Value);
```

### Result with Error Codes

```csharp
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; private set; } = string.Empty;
    public ErrorCode ErrorCode { get; private set; }

    protected Result(bool isSuccess, string error, ErrorCode errorCode)
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorCode = errorCode;
    }

    public static Result Failure(string error, ErrorCode code) =>
        new(false, error, code);

    public bool IsNotFound => ErrorCode == ErrorCode.NotFound;
    public bool IsValidation => ErrorCode == ErrorCode.Validation;
    public bool IsConflict => ErrorCode == ErrorCode.Conflict;
}

public enum ErrorCode
{
    None = 0,
    Validation = 400,
    NotFound = 404,
    Conflict = 409,
    InternalError = 500
}

// Usage
var result = await _mediator.Send(new GetUserByIdQuery(id));

if (result.IsFailure)
{
    return result.ErrorCode switch
    {
        ErrorCode.NotFound => NotFound(new { error = result.Error }),
        ErrorCode.Validation => BadRequest(new { error = result.Error }),
        _ => StatusCode(500, new { error = result.Error })
    };
}

return Ok(result.Value);
```

---

## 🧪 Testing with Result

### Domain Tests

```csharp
public class UserTests
{
    [Fact]
    public void Create_ValidData_ReturnsSuccess()
    {
        // Act
        var result = User.Create("test@test.com", "John");

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Email.Value.Should().Be("test@test.com");
    }

    [Theory]
    [InlineData("", "John")]
    [InlineData("invalid-email", "John")]
    [InlineData("test@test.com", "")]
    public void Create_InvalidData_ReturnsFailure(string email, string firstName)
    {
        // Act
        var result = User.Create(email, firstName);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().NotBeNullOrWhiteSpace();
    }
}
```

### Handler Tests

```csharp
public class CreateUserHandlerTests
{
    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithUserId()
    {
        // Arrange
        var handler = CreateHandler();
        var command = new CreateUserCommand("test@test.com", "John");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Handle_DuplicateEmail_ReturnsFailure()
    {
        // Arrange
        var handler = CreateHandler();
        await handler.Handle(new CreateUserCommand("test@test.com", "John"), default);

        // Act - duplicate
        var result = await handler.Handle(
            new CreateUserCommand("test@test.com", "Jane"),
            CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("already exists");
    }
}
```

---

## ✅ Best Practices

### DO ✅

1. **Use Result for expected failures** - Validación, not found, business rules
2. **Use exceptions for unexpected failures** - Infrastructure errors, bugs
3. **Explicit error messages** - Descriptivos y accionables
4. **Railway-oriented programming** - Chain operations con Bind/Map
5. **Match pattern** - Para convertir Result a diferentes tipos
6. **Test both paths** - Success y failure scenarios

### DON'T ❌

1. ❌ **NO** acceder `result.Value` sin verificar `IsSuccess`
2. ❌ **NO** usar Result para control flow normal
3. ❌ **NO** retornar null en Success
4. ❌ **NO** olvidar manejar failures en controllers
5. ❌ **NO** mezclar exceptions y Result para mismos casos
6. ❌ **NO** crear Result.Success() con valor null

---

## 🔄 Result vs Exceptions

### When to use Result ✅

- **Validación de input**
- **Business rule violations**
- **Not found scenarios**
- **Expected failures** (duplicates, conflicts)
- **Domain operations** que pueden fallar

### When to use Exceptions ❌

- **Infrastructure failures** (DB connection lost)
- **Programming errors** (null reference, index out of range)
- **Unexpected errors** (out of memory)
- **Third-party exceptions** que no puedes controlar

---

## 📚 Libraries

### Popular Result Libraries

**FluentResults:**
```bash
dotnet add package FluentResults
```

**CSharpFunctionalExtensions:**
```bash
dotnet add package CSharpFunctionalExtensions
```

**OneOf (Discriminated Unions):**
```bash
dotnet add package OneOf
```

---

## 📖 Referencias

- **Railway Oriented Programming:** https://fsharpforfunandprofit.com/rop/
- **CSharpFunctionalExtensions:** https://github.com/vkhorikov/CSharpFunctionalExtensions
- **FluentResults:** https://github.com/altmann/FluentResults

---

**Used by:** tdd-implementer, backend-expert, api-designer
**Related skills:** architecture/ddd.md, architecture/clean-architecture.md, dotnet/mediatr.md
