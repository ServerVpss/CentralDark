---
name: Java Core Patterns
description: Apply Java design patterns and core best practices
triggers:
  - file_extension: .java
  - task_mentions: "java|jdk"
---

# Java Core Patterns

Apply these core Java patterns and best practices when writing Java code.

## Naming Conventions

```java
// Classes: PascalCase
public class UserService { }
public class OrderProcessor { }

// Methods: camelCase
public void processOrder() { }
public User findUserById(Long id) { }

// Constants: UPPER_SNAKE_CASE
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_ENCODING = "UTF-8";

// Variables: camelCase
private String userName;
private List<Order> activeOrders;

// Packages: lowercase
package com.company.project.service;
```

## SOLID Principles

### Single Responsibility Principle

```java
// Good ✓ - One responsibility
public class UserValidator {
    public boolean validate(User user) {
        return user.getEmail() != null && user.getName() != null;
    }
}

public class UserRepository {
    public User save(User user) {
        // Database operations
    }
}

// Avoid ✗ - Multiple responsibilities
public class UserManager {
    public boolean validate(User user) { }
    public User save(User user) { }
    public void sendEmail(User user) { }  // Should be separate EmailService
}
```

### Dependency Inversion

```java
// Good ✓ - Depend on abstraction
public interface PaymentProcessor {
    void processPayment(Payment payment);
}

public class StripePaymentProcessor implements PaymentProcessor {
    @Override
    public void processPayment(Payment payment) {
        // Stripe-specific implementation
    }
}

public class OrderService {
    private final PaymentProcessor paymentProcessor;

    public OrderService(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }
}

// Avoid ✗ - Depend on concrete class
public class OrderService {
    private final StripePaymentProcessor stripeProcessor;  // Tightly coupled
}
```

## Design Patterns

### Builder Pattern

```java
public class User {
    private final String name;
    private final String email;
    private final String phone;
    private final String address;

    private User(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.phone = builder.phone;
        this.address = builder.address;
    }

    public static class Builder {
        private String name;
        private String email;
        private String phone;
        private String address;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public User build() {
            return new User(this);
        }
    }
}

// Usage
User user = new User.Builder()
    .name("John Doe")
    .email("john@example.com")
    .build();
```

### Factory Pattern

```java
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    public void send(String message) { /* Email logic */ }
}

public class SmsNotification implements Notification {
    public void send(String message) { /* SMS logic */ }
}

public class NotificationFactory {
    public static Notification create(NotificationType type) {
        return switch (type) {
            case EMAIL -> new EmailNotification();
            case SMS -> new SmsNotification();
            default -> throw new IllegalArgumentException("Unknown type");
        };
    }
}
```

### Strategy Pattern

```java
public interface PricingStrategy {
    BigDecimal calculatePrice(Order order);
}

public class RegularPricing implements PricingStrategy {
    public BigDecimal calculatePrice(Order order) {
        return order.getSubtotal();
    }
}

public class BlackFridayPricing implements PricingStrategy {
    public BigDecimal calculatePrice(Order order) {
        return order.getSubtotal().multiply(BigDecimal.valueOf(0.7)); // 30% off
    }
}

public class OrderService {
    private PricingStrategy pricingStrategy;

    public void setPricingStrategy(PricingStrategy strategy) {
        this.pricingStrategy = strategy;
    }

    public BigDecimal calculateTotal(Order order) {
        return pricingStrategy.calculatePrice(order);
    }
}
```

## Modern Java Features (Java 17+)

### Records

```java
// Good ✓ - Use records for immutable data
public record User(Long id, String name, String email) {
    // Compact constructor for validation
    public User {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }
    }
}

// Avoid ✗ - Verbose POJO for simple data
public class User {
    private final Long id;
    private final String name;
    private final String email;

    // Constructor, getters, equals, hashCode, toString...
}
```

### Sealed Classes

```java
public sealed interface PaymentMethod
    permits CreditCard, DebitCard, PayPal {
}

public final class CreditCard implements PaymentMethod {
    private final String cardNumber;
}

public final class DebitCard implements PaymentMethod {
    private final String cardNumber;
}

public final class PayPal implements PaymentMethod {
    private final String email;
}
```

### Pattern Matching

```java
// Java 17+ pattern matching
public String formatPayment(PaymentMethod payment) {
    return switch (payment) {
        case CreditCard card -> "Credit Card: " + card.lastFourDigits();
        case DebitCard card -> "Debit Card: " + card.lastFourDigits();
        case PayPal paypal -> "PayPal: " + paypal.email();
    };
}
```

### Text Blocks

```java
// Good ✓ - Use text blocks for multiline strings
String json = """
    {
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30
    }
    """;

// Avoid ✗ - Concatenated strings
String json = "{\n" +
    "    \"name\": \"John Doe\",\n" +
    "    \"email\": \"john@example.com\"\n" +
    "}";
```

## Exception Handling

```java
// Good ✓ - Specific exceptions
public User findUser(Long id) throws UserNotFoundException {
    return userRepository.findById(id)
        .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
}

// Avoid ✗ - Generic exceptions
public User findUser(Long id) throws Exception {
    // ...
}

// Avoid ✗ - Swallowing exceptions
try {
    processPayment();
} catch (Exception e) {
    // Silent failure
}
```

## Collections and Streams

```java
// Good ✓ - Use streams for collection operations
List<String> activeUserEmails = users.stream()
    .filter(User::isActive)
    .map(User::getEmail)
    .collect(Collectors.toList());

// Use method references when possible
users.forEach(this::sendEmail);

// Avoid ✗ - Verbose loops for simple operations
List<String> emails = new ArrayList<>();
for (User user : users) {
    if (user.isActive()) {
        emails.add(user.getEmail());
    }
}
```

## Null Safety

```java
// Good ✓ - Use Optional
public Optional<User> findUserByEmail(String email) {
    return userRepository.findByEmail(email);
}

// Usage
Optional<User> user = findUserByEmail("john@example.com");
user.ifPresent(u -> System.out.println(u.getName()));

// Or with orElseThrow
User user = findUserByEmail("john@example.com")
    .orElseThrow(() -> new UserNotFoundException("User not found"));

// Avoid ✗ - Returning null
public User findUserByEmail(String email) {
    return userRepository.findByEmail(email);  // May return null
}
```

## Resource Management

```java
// Good ✓ - Try-with-resources
try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {
    String line = reader.readLine();
    // ...
} // Automatically closed

// Avoid ✗ - Manual resource management
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("file.txt"));
    // ...
} finally {
    if (reader != null) {
        reader.close();
    }
}
```

## Immutability

```java
// Good ✓ - Immutable class
public final class User {
    private final Long id;
    private final String name;

    public User(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public User withName(String newName) {
        return new User(this.id, newName);
    }

    // Only getters, no setters
    public Long getId() { return id; }
    public String getName() { return name; }
}
```

## Testing

```java
// Use descriptive test names
@Test
void shouldThrowExceptionWhenUserNotFound() {
    assertThrows(UserNotFoundException.class, () -> {
        userService.findUser(999L);
    });
}

// Use AssertJ for fluent assertions
assertThat(users)
    .hasSize(3)
    .extracting(User::getName)
    .containsExactly("Alice", "Bob", "Charlie");
```
