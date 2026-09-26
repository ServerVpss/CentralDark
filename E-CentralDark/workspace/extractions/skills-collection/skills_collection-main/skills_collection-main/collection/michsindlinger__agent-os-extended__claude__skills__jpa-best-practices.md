---
name: JPA Best Practices
description: Apply JPA/Hibernate optimization and best practices
triggers:
  - file_extension: .java
  - task_mentions: "jpa|hibernate|entity|repository"
  - file_contains: "@Entity|@Repository|JpaRepository"
---

# JPA Best Practices

Optimize JPA/Hibernate usage for performance and correctness.

## Entity Design

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;  // Optimistic locking
}
```

## Avoid N+1 Queries

```java
// Avoid ✗ - N+1 query problem
public List<Order> getOrders() {
    return orderRepository.findAll();  // 1 query
    // Later: order.getItems() executes N queries
}

// Good ✓ - Use JOIN FETCH
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items")
    List<Order> findAllWithItems();
}

// Good ✓ - Use @EntityGraph
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"items", "customer"})
    List<Order> findAll();
}
```

## Lazy vs Eager Loading

```java
// Default to LAZY loading
@Entity
public class Order {
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)  // Default, explicit
    private List<OrderItem> items;

    @ManyToOne(fetch = FetchType.LAZY)  // Explicitly lazy
    @JoinColumn(name = "customer_id")
    private Customer customer;
}

// Use EAGER only when always needed (rare)
@ManyToOne(fetch = FetchType.EAGER)
private Status status;  // Always needed with order
```

## Projections for Performance

```java
// Interface-based projection
public interface UserSummary {
    String getName();
    String getEmail();
}

public interface UserRepository extends JpaRepository<User, Long> {
    List<UserSummary> findAllBy();  // Only fetches name and email
}

// DTO-based projection
@Query("SELECT new com.company.UserDto(u.id, u.name, u.email) FROM User u")
List<UserDto> findAllUserDtos();
```

## Pagination

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public Page<UserDto> getUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return userService.findAll(pageable);
    }
}

@Service
public class UserService {
    public Page<UserDto> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
            .map(UserDto::from);
    }
}
```

## Batch Operations

```java
// Good ✓ - Batch save
@Transactional
public void saveAll(List<User> users) {
    userRepository.saveAll(users);  // Batched
}

// Avoid ✗ - Individual saves in loop
public void saveAll(List<User> users) {
    for (User user : users) {
        userRepository.save(user);  // N queries
    }
}

// Configure batch size in application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50
        order_inserts: true
        order_updates: true
```

## Query Optimization

```java
// Use native queries for complex operations
public interface UserRepository extends JpaRepository<User, Long> {

    @Query(value = """
        SELECT u.* FROM users u
        WHERE u.created_at > :since
        AND u.status = 'ACTIVE'
        ORDER BY u.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<User> findRecentActiveUsers(
        @Param("since") LocalDateTime since,
        @Param("limit") int limit
    );
}

// Use JPQL for portability
@Query("SELECT u FROM User u WHERE u.email LIKE %:domain")
List<User> findByEmailDomain(@Param("domain") String domain);
```

## Caching

```java
@Service
@CacheConfig(cacheNames = "users")
public class UserService {

    @Cacheable(key = "#id")
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @CachePut(key = "#result.id")
    public User update(User user) {
        return userRepository.save(user);
    }

    @CacheEvict(key = "#id")
    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    @CacheEvict(allEntries = true)
    public void clearCache() {
        // Clears all user cache entries
    }
}
```

## Auditing

```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}

@Entity
@EntityListeners(AuditingEntityListener.class)
public class User {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;
}
```

## Relationship Mappings

```java
// One-to-Many with bidirectional mapping
@Entity
public class Order {
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Helper methods for bidirectional relationship
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}

@Entity
public class OrderItem {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}
```

## Checklist

When writing JPA code, verify:
- [ ] Avoid N+1 queries (use JOIN FETCH or @EntityGraph)
- [ ] Use appropriate fetch type (LAZY by default)
- [ ] Add indexes for frequently queried columns
- [ ] Use projections for read-only queries
- [ ] Configure batch operations for bulk updates
- [ ] Enable second-level cache for read-heavy entities
- [ ] Use @Transactional appropriately
- [ ] Implement optimistic locking with @Version
