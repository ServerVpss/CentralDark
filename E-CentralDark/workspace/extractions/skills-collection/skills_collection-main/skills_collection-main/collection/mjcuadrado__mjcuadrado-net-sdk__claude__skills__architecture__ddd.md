---
name: ddd
description: Domain-Driven Design patterns and tactical patterns for .NET 9
version: 0.1.0
tags: [architecture, ddd, domain-driven-design, tactical-patterns]
---

# Domain-Driven Design (DDD)

Domain-Driven Design es un approach para desarrollar software complejo enfocándose en el **dominio del negocio** y su lógica, usando un **lenguaje ubicuo** (Ubiquitous Language) compartido entre desarrolladores y expertos del dominio.

## 🎯 Overview

**Principios fundamentales:**
- **Ubiquitous Language:** Mismo vocabulario entre developers y domain experts
- **Bounded Contexts:** Límites claros donde aplica un modelo
- **Core Domain:** Foco en lo que da valor al negocio
- **Domain Model:** Código refleja conceptos del negocio
- **Rich Domain Model:** Lógica de negocio en entidades, no en servicios

---

## 🏗️ DDD Building Blocks (Tactical Patterns)

### 1. Entities

**Características:**
- **Identidad única** que persiste en el tiempo
- **Mutable** (pueden cambiar estado)
- **Igualdad por ID** (no por valores)

```csharp
public class Order : Entity
{
    public Guid Id { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    private readonly List<OrderLine> _lines = new();
    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    // Private constructor (solo se crea via factory method)
    private Order() { }

    // Factory method (Named Constructor Pattern)
    public static Result<Order> Create(Guid customerId)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        order.RaiseDomainEvent(new OrderCreatedEvent(order.Id));

        return Result<Order>.Success(order);
    }

    // Business logic methods (Domain behavior)
    public Result AddLine(Product product, int quantity)
    {
        if (Status != OrderStatus.Draft)
            return Result.Failure("Cannot modify completed order");

        if (quantity <= 0)
            return Result.Failure("Quantity must be positive");

        var line = OrderLine.Create(product.Id, product.Price, quantity);
        _lines.Add(line.Value);

        return Result.Success();
    }

    public Result Complete()
    {
        if (Status == OrderStatus.Completed)
            return Result.Failure("Order already completed");

        if (!_lines.Any())
            return Result.Failure("Cannot complete empty order");

        Status = OrderStatus.Completed;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new OrderCompletedEvent(Id));

        return Result.Success();
    }

    // Computed properties
    public decimal Total => _lines.Sum(l => l.Subtotal);
}
```

### 2. Value Objects

**Características:**
- **Sin identidad** (iguales si valores son iguales)
- **Immutable** (no cambian después de creación)
- **Autovalidating** (siempre válidos)

```csharp
public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Result<Money> Create(decimal amount, string currency)
    {
        if (amount < 0)
            return Result<Money>.Failure("Amount cannot be negative");

        if (string.IsNullOrWhiteSpace(currency))
            return Result<Money>.Failure("Currency is required");

        if (currency.Length != 3)
            return Result<Money>.Failure("Currency must be 3 characters (ISO 4217)");

        return Result<Money>.Success(new Money(amount, currency));
    }

    // Value Object operations return NEW instances
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot add different currencies");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Multiply(decimal factor)
    {
        return new Money(Amount * factor, Currency);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString() => $"{Amount:N2} {Currency}";
}

// Example: Address Value Object
public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string PostalCode { get; }
    public string Country { get; }

    private Address(string street, string city, string postalCode, string country)
    {
        Street = street;
        City = city;
        PostalCode = postalCode;
        Country = country;
    }

    public static Result<Address> Create(
        string street,
        string city,
        string postalCode,
        string country)
    {
        if (string.IsNullOrWhiteSpace(street))
            return Result<Address>.Failure("Street is required");

        if (string.IsNullOrWhiteSpace(city))
            return Result<Address>.Failure("City is required");

        // ... más validaciones

        return Result<Address>.Success(new Address(street, city, postalCode, country));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return PostalCode;
        yield return Country;
    }
}
```

### 3. Aggregates & Aggregate Roots

**Aggregate:** Cluster de entidades y value objects tratados como unidad

**Aggregate Root:** Entidad principal que controla acceso al aggregate

```csharp
// Order es el Aggregate Root
public class Order : AggregateRoot
{
    public Guid Id { get; private set; }
    public Guid CustomerId { get; private set; }

    // OrderLines son parte del aggregate (no se accede directamente)
    private readonly List<OrderLine> _lines = new();
    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    // ✅ BIEN: Agregar línea a través del root
    public Result AddLine(Product product, int quantity)
    {
        // Validar invariantes del aggregate
        if (_lines.Count >= 50)
            return Result.Failure("Maximum 50 lines per order");

        var line = OrderLine.Create(product.Id, product.Price, quantity);
        _lines.Add(line.Value);

        return Result.Success();
    }

    // ❌ MAL: NO exponer colección mutable
    // public List<OrderLine> Lines { get; set; }
}

// OrderLine NO es un aggregate root (parte de Order)
public class OrderLine : Entity
{
    public Guid ProductId { get; private set; }
    public Money Price { get; private set; }
    public int Quantity { get; private set; }

    private OrderLine() { }

    internal static Result<OrderLine> Create(Guid productId, decimal price, int quantity)
    {
        if (quantity <= 0)
            return Result<OrderLine>.Failure("Quantity must be positive");

        var moneyResult = Money.Create(price, "USD");
        if (moneyResult.IsFailure)
            return Result<OrderLine>.Failure(moneyResult.Error);

        return Result<OrderLine>.Success(new OrderLine
        {
            ProductId = productId,
            Price = moneyResult.Value,
            Quantity = quantity
        });
    }

    public Money Subtotal => Price.Multiply(Quantity);
}
```

### 4. Domain Services

**Use when:** Operación involucra múltiples aggregates

```csharp
public interface IOrderPricingService
{
    Money CalculateTotal(Order order, Customer customer);
}

public class OrderPricingService : IOrderPricingService
{
    public Money CalculateTotal(Order order, Customer customer)
    {
        var subtotal = order.Total;

        // Aplicar descuento basado en customer tier
        var discount = customer.Tier switch
        {
            CustomerTier.Gold => 0.15m,
            CustomerTier.Silver => 0.10m,
            CustomerTier.Bronze => 0.05m,
            _ => 0m
        };

        var discountAmount = subtotal.Multiply(discount);
        return subtotal.Add(discountAmount.Multiply(-1));
    }
}
```

### 5. Domain Events

**Use when:** Algo importante ocurre en el dominio

```csharp
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}

public record OrderPlacedEvent(
    Guid OrderId,
    Guid CustomerId,
    Money Total
) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

// Entity levanta eventos
public class Order : AggregateRoot
{
    public Result Place()
    {
        if (Status != OrderStatus.Draft)
            return Result.Failure("Order already placed");

        Status = OrderStatus.Placed;
        PlacedAt = DateTime.UtcNow;

        // Levantar domain event
        RaiseDomainEvent(new OrderPlacedEvent(Id, CustomerId, Total));

        return Result.Success();
    }
}

// Event handler (fuera del aggregate)
public class OrderPlacedEventHandler : INotificationHandler<OrderPlacedEvent>
{
    private readonly IEmailService _emailService;

    public async Task Handle(OrderPlacedEvent notification, CancellationToken ct)
    {
        // Side effects (email, notifications, etc.)
        await _emailService.SendOrderConfirmationAsync(notification.CustomerId);
    }
}
```

### 6. Repositories

**Purpose:** Persistencia de aggregates

```csharp
// Repository interface (en Domain layer)
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task UpdateAsync(Order order, CancellationToken ct = default);
    Task DeleteAsync(Order order, CancellationToken ct = default);
}

// Repository implementation (en Infrastructure layer)
public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Orders
            .Include(o => o.Lines) // Cargar aggregate completo
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public async Task AddAsync(Order order, CancellationToken ct = default)
    {
        await _context.Orders.AddAsync(order, ct);
        await _context.SaveChangesAsync(ct);
    }
}
```

### 7. Specifications

**Purpose:** Encapsular lógica de consulta reutilizable

```csharp
public abstract class Specification<T>
{
    public abstract Expression<Func<T, bool>> ToExpression();

    public bool IsSatisfiedBy(T entity)
    {
        var predicate = ToExpression().Compile();
        return predicate(entity);
    }

    // Combinators
    public Specification<T> And(Specification<T> other)
    {
        return new AndSpecification<T>(this, other);
    }

    public Specification<T> Or(Specification<T> other)
    {
        return new OrSpecification<T>(this, other);
    }
}

// Example specification
public class ActiveOrdersSpecification : Specification<Order>
{
    public override Expression<Func<Order, bool>> ToExpression()
    {
        return order => order.Status != OrderStatus.Cancelled
            && order.Status != OrderStatus.Completed;
    }
}

public class OrdersPlacedAfterSpecification : Specification<Order>
{
    private readonly DateTime _date;

    public OrdersPlacedAfterSpecification(DateTime date)
    {
        _date = date;
    }

    public override Expression<Func<Order, bool>> ToExpression()
    {
        return order => order.PlacedAt >= _date;
    }
}

// Usage
var activeOrders = new ActiveOrdersSpecification();
var recentOrders = new OrdersPlacedAfterSpecification(DateTime.UtcNow.AddDays(-7));

var activeAndRecent = activeOrders.And(recentOrders);

var orders = await _context.Orders
    .Where(activeAndRecent.ToExpression())
    .ToListAsync();
```

---

## 🎯 Strategic Patterns

### Bounded Contexts

```
┌─────────────────────┐    ┌─────────────────────┐
│  Sales Context      │    │  Shipping Context   │
│                     │    │                     │
│  - Customer (buyer) │    │  - Customer (addr)  │
│  - Product (price)  │    │  - Product (weight) │
│  - Order (payment)  │    │  - Order (tracking) │
└─────────────────────┘    └─────────────────────┘
         │                          │
         └──────────┬───────────────┘
                    │
           ┌────────▼────────┐
           │ Shared Kernel   │
           │   (Customer ID) │
           └─────────────────┘
```

### Ubiquitous Language

```csharp
// ✅ BIEN: Usa términos del dominio
public class Order
{
    public Result Place() { } // "Place an order" (business term)
    public Result Cancel() { } // "Cancel an order"
    public Result Ship() { } // "Ship an order"
}

// ❌ MAL: Términos técnicos sin significado de negocio
public class Order
{
    public void SetStatus(int status) { } // ¿Qué significa status=3?
    public void Update() { } // ¿Actualizar qué?
}
```

---

## ✅ Best Practices

### DO ✅

1. **Rich Domain Model** - Lógica en entities, no en services
2. **Ubiquitous Language** - Mismo vocabulario en código y negocio
3. **Value Objects** - Para conceptos sin identidad (Money, Email, etc.)
4. **Aggregates** - Mantener invariantes del dominio
5. **Domain Events** - Para efectos secundarios desacoplados
6. **Factory Methods** - Para creación controlada de entities
7. **Private setters** - Encapsulación estricta

### DON'T ❌

1. ❌ **NO** exponer colecciones mutables
2. ❌ **NO** lógica de negocio en Application/Infrastructure
3. ❌ **NO** setters públicos sin validación
4. ❌ **NO** constructores públicos sin control
5. ❌ **NO** persistir domain events (son transitorios)
6. ❌ **NO** repositories para entities que no son aggregate roots
7. ❌ **NO** anemic domain model (solo getters/setters)

---

## 🧪 Testing DDD

### Entity Tests

```csharp
public class OrderTests
{
    [Fact]
    public void Place_DraftOrder_ChangesStatusToPlaced()
    {
        // Arrange
        var order = Order.Create(Guid.NewGuid()).Value;

        // Act
        var result = order.Place();

        // Assert
        result.IsSuccess.Should().BeTrue();
        order.Status.Should().Be(OrderStatus.Placed);
        order.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<OrderPlacedEvent>();
    }

    [Fact]
    public void AddLine_CompletedOrder_ReturnsFailure()
    {
        // Arrange
        var order = Order.Create(Guid.NewGuid()).Value;
        order.Place();
        order.Complete();

        // Act
        var result = order.AddLine(product, 1);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("completed");
    }
}
```

### Value Object Tests

```csharp
public class MoneyTests
{
    [Fact]
    public void Create_NegativeAmount_ReturnsFailure()
    {
        // Act
        var result = Money.Create(-10, "USD");

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("negative");
    }

    [Fact]
    public void Add_SameCurrency_ReturnsSummed()
    {
        // Arrange
        var money1 = Money.Create(10, "USD").Value;
        var money2 = Money.Create(20, "USD").Value;

        // Act
        var result = money1.Add(money2);

        // Assert
        result.Amount.Should().Be(30);
        result.Currency.Should().Be("USD");
    }

    [Fact]
    public void Equals_SameValues_ReturnsTrue()
    {
        // Arrange
        var money1 = Money.Create(10, "USD").Value;
        var money2 = Money.Create(10, "USD").Value;

        // Act & Assert
        money1.Should().Be(money2); // Value equality
    }
}
```

---

## 📚 Referencias

- **Eric Evans - Domain-Driven Design:** https://www.domainlanguage.com/ddd/
- **Vaughn Vernon - Implementing DDD:** https://vaughnvernon.com/
- **Microsoft DDD eBook:** https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/

---

**Used by:** tdd-implementer, backend-expert, api-designer
**Related skills:** architecture/clean-architecture.md, architecture/cqrs.md, architecture/result-pattern.md
