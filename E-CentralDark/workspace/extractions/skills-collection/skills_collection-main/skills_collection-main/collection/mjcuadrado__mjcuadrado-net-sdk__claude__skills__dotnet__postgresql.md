---
name: postgresql
description: PostgreSQL 16+ patterns with EF Core 9 and snake_case conventions
version: 0.1.0
tags: [dotnet, postgresql, ef-core, database, npgsql]
---

# PostgreSQL with Entity Framework Core

PostgreSQL 16+ integration patterns for .NET 9 applications using snake_case database conventions.

## 🎯 Overview

PostgreSQL es el RDBMS primary para proyectos mj2. Características clave:
- **Versión:** PostgreSQL 16+
- **Provider:** Npgsql.EntityFrameworkCore.PostgreSQL
- **Convenciones:** snake_case para tablas y columnas
- **Migrations:** EF Core Code-First

---

## 📦 Packages Requeridos

```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.0" />
```

---

## 🔧 Configuración Básica

### Connection String

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=mydb;Username=myuser;Password=mypassword;Include Error Detail=true"
  }
}
```

**appsettings.Development.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=mydb_dev;Username=dev;Password=dev;Include Error Detail=true"
  }
}
```

**Producción (variables de entorno):**
```bash
DATABASE_URL=postgres://user:password@host:5432/database
```

### DbContext Configuration

```csharp
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<InstrumentLocation> InstrumentLocations => Set<InstrumentLocation>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar configuraciones desde assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Extensiones PostgreSQL
        modelBuilder.HasPostgresExtension("uuid-ossp");
        modelBuilder.HasPostgresExtension("pg_trgm"); // Text search
    }
}
```

### Program.cs Registration

```csharp
// PostgreSQL con Npgsql
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        // Migrations assembly
        npgsqlOptions.MigrationsAssembly("Infrastructure");

        // Retry on failure
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);

        // Command timeout
        npgsqlOptions.CommandTimeout(30);
    });

    // Development settings
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }

    // Logging
    options.LogTo(Console.WriteLine, LogLevel.Information);
});
```

---

## 🐍 snake_case Conventions

### Global Configuration (Recomendado)

**NamingConvention.cs:**
```csharp
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

public static class NamingConventions
{
    public static void UseSnakeCaseNamingConvention(this ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // Tabla en snake_case
            entity.SetTableName(ToSnakeCase(entity.GetTableName()));

            // Columnas en snake_case
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.GetColumnName()));
            }

            // Claves en snake_case
            foreach (var key in entity.GetKeys())
            {
                key.SetName(ToSnakeCase(key.GetName()));
            }

            // Foreign keys en snake_case
            foreach (var fk in entity.GetForeignKeys())
            {
                fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()));
            }

            // Indices en snake_case
            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()));
            }
        }
    }

    private static string ToSnakeCase(string? name)
    {
        if (string.IsNullOrEmpty(name))
            return name ?? string.Empty;

        // PascalCase/camelCase → snake_case
        var snakeCase = Regex.Replace(name, @"([a-z0-9])([A-Z])", "$1_$2");
        return snakeCase.ToLowerInvariant();
    }
}
```

**Usage en OnModelCreating:**
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Aplicar snake_case globalmente
    modelBuilder.UseSnakeCaseNamingConvention();

    // Resto de configuración...
}
```

### Manual Configuration (Por Entidad)

```csharp
public class InstrumentLocationConfiguration : IEntityTypeConfiguration<InstrumentLocation>
{
    public void Configure(EntityTypeBuilder<InstrumentLocation> builder)
    {
        // Tabla
        builder.ToTable("instrument_locations");

        // Primary Key
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // Propiedades
        builder.Property(e => e.InstrumentId)
            .HasColumnName("instrument_id")
            .IsRequired();

        builder.Property(e => e.LocationName)
            .HasColumnName("location_name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("NOW()");

        // Indices
        builder.HasIndex(e => e.InstrumentId)
            .HasDatabaseName("idx_instrument_locations_instrument_id");

        builder.HasIndex(e => e.LocationName)
            .HasDatabaseName("idx_instrument_locations_location_name");
    }
}
```

---

## 🔑 Primary Keys & Identity

### UUID Primary Keys (Recomendado)

```csharp
public class User
{
    public Guid Id { get; set; } // UUID en PostgreSQL
    public string Email { get; set; } = string.Empty;
}

// Configuration
builder.Property(e => e.Id)
    .HasColumnName("id")
    .HasColumnType("uuid")
    .HasDefaultValueSql("uuid_generate_v4()"); // Requiere extensión uuid-ossp
```

### Serial Primary Keys

```csharp
public class Product
{
    public int Id { get; set; } // SERIAL en PostgreSQL
    public string Name { get; set; } = string.Empty;
}

// Configuration
builder.Property(e => e.Id)
    .HasColumnName("id")
    .UseIdentityByDefaultColumn(); // IDENTITY GENERATED BY DEFAULT
```

---

## 📅 Timestamps & Audit Fields

### Configuración

```csharp
public abstract class AuditableEntity
{
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

// Configuration base
public abstract class AuditableEntityConfiguration<T> : IEntityTypeConfiguration<T>
    where T : AuditableEntity
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("NOW()")
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("NOW()");

        builder.Property(e => e.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(100);

        builder.Property(e => e.UpdatedBy)
            .HasColumnName("updated_by")
            .HasMaxLength(100);
    }
}
```

### Triggers para UpdatedAt (Recomendado)

**Migration:**
```csharp
public partial class AddUpdatedAtTrigger : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Crear función trigger
        migrationBuilder.Sql(@"
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        ");

        // Aplicar trigger a tablas
        migrationBuilder.Sql(@"
            CREATE TRIGGER update_instrument_locations_updated_at
            BEFORE UPDATE ON instrument_locations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP TRIGGER IF EXISTS update_instrument_locations_updated_at ON instrument_locations;");
        migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_updated_at_column();");
    }
}
```

---

## 🔍 Indices y Performance

### Tipos de Indices

```csharp
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // B-Tree index (default) - Búsquedas exactas
        builder.HasIndex(e => e.Email)
            .HasDatabaseName("idx_users_email")
            .IsUnique();

        // GIN index - Full-text search
        builder.HasIndex(e => e.Bio)
            .HasDatabaseName("idx_users_bio_gin")
            .HasMethod("gin")
            .IsTsVectorExpressionIndex("english"); // Requiere pg_trgm

        // Partial index - Solo registros activos
        builder.HasIndex(e => e.Email)
            .HasDatabaseName("idx_users_active_email")
            .HasFilter("is_active = true");

        // Composite index - Múltiples columnas
        builder.HasIndex(e => new { e.LastName, e.FirstName })
            .HasDatabaseName("idx_users_last_first_name");
    }
}
```

---

## 🗄️ Migrations

### Crear Migration

```bash
# Desde directorio del proyecto
dotnet ef migrations add InitialCreate --project Infrastructure --startup-project Api

# Con nombre descriptivo
dotnet ef migrations add AddUserAuthentication --project Infrastructure --startup-project Api
```

### Aplicar Migration

```bash
# Development
dotnet ef database update --project Infrastructure --startup-project Api

# Producción (desde código)
public static async Task Main(string[] args)
{
    var host = CreateHostBuilder(args).Build();

    // Auto-migrate en startup (solo desarrollo)
    if (host.Environment.IsDevelopment())
    {
        using var scope = host.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    await host.RunAsync();
}
```

### Migration SQL Script (Producción)

```bash
# Generar SQL script para revisión manual
dotnet ef migrations script --project Infrastructure --startup-project Api --output migration.sql

# Desde migration específica
dotnet ef migrations script AddUsers AddProducts --project Infrastructure --output incremental.sql
```

---

## 🚀 Performance Patterns

### 1. Compiled Queries

```csharp
private static readonly Func<ApplicationDbContext, string, Task<User?>> GetUserByEmailCompiled =
    EF.CompileAsyncQuery((ApplicationDbContext context, string email) =>
        context.Users.FirstOrDefault(u => u.Email == email));

public async Task<User?> GetUserByEmailAsync(string email)
{
    return await GetUserByEmailCompiled(_context, email);
}
```

### 2. AsNoTracking para Queries Read-Only

```csharp
// ✅ BIEN - Read-only queries
public async Task<List<User>> GetAllUsersAsync()
{
    return await _context.Users
        .AsNoTracking()
        .ToListAsync();
}

// ❌ MAL - Tracking innecesario
public async Task<List<User>> GetAllUsersAsync()
{
    return await _context.Users.ToListAsync(); // Tracking by default
}
```

### 3. Proyecciones (Select) en lugar de Entidades Completas

```csharp
// ✅ BIEN - Solo las columnas necesarias
public async Task<List<UserDto>> GetUserNamesAsync()
{
    return await _context.Users
        .AsNoTracking()
        .Select(u => new UserDto
        {
            Id = u.Id,
            FullName = u.FirstName + " " + u.LastName
        })
        .ToListAsync();
}

// ❌ MAL - Carga entidad completa
public async Task<List<User>> GetUsersAsync()
{
    return await _context.Users.ToListAsync(); // Todas las columnas
}
```

### 4. Batch Updates (EF Core 7+)

```csharp
// ✅ BIEN - Bulk update en database
await _context.Users
    .Where(u => u.IsActive == false)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(u => u.IsDeleted, true)
        .SetProperty(u => u.DeletedAt, DateTime.UtcNow));

// ❌ MAL - Carga todas las entidades primero
var inactiveUsers = await _context.Users.Where(u => u.IsActive == false).ToListAsync();
foreach (var user in inactiveUsers)
{
    user.IsDeleted = true;
    user.DeletedAt = DateTime.UtcNow;
}
await _context.SaveChangesAsync();
```

---

## 🔐 Extensiones PostgreSQL Útiles

### uuid-ossp (UUIDs)

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasPostgresExtension("uuid-ossp");
}

// Usage
builder.Property(e => e.Id)
    .HasDefaultValueSql("uuid_generate_v4()");
```

### pg_trgm (Text Search)

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasPostgresExtension("pg_trgm");
}

// GIN index para búsquedas LIKE
builder.HasIndex(e => e.Description)
    .HasMethod("gin")
    .HasOperators("gin_trgm_ops");
```

### citext (Case-Insensitive Text)

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasPostgresExtension("citext");
}

// Email case-insensitive
builder.Property(e => e.Email)
    .HasColumnType("citext")
    .HasMaxLength(254);
```

---

## 🧪 Testing con Testcontainers

```csharp
using Testcontainers.PostgreSql;

public class DatabaseFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _container;
    public ApplicationDbContext? DbContext { get; private set; }

    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("testdb")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        await _container.StartAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .Options;

        DbContext = new ApplicationDbContext(options);
        await DbContext.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (DbContext != null)
            await DbContext.DisposeAsync();

        if (_container != null)
            await _container.DisposeAsync();
    }
}
```

---

## ✅ Best Practices

### DO ✅

1. **Usar snake_case globalmente** para consistencia
2. **UUID para PKs** en tablas distribuidas
3. **Indices estratégicos** en columnas de búsqueda frecuente
4. **AsNoTracking()** para queries read-only
5. **Compiled queries** para queries repetitivas
6. **Proyecciones** en lugar de entidades completas
7. **Batch operations** (ExecuteUpdate/Delete)
8. **Connection pooling** (default en Npgsql)
9. **Timestamps con triggers** para audit
10. **Testcontainers** para integration tests

### DON'T ❌

1. ❌ **NO** usar camelCase o PascalCase en database
2. ❌ **NO** hacer `ToList()` antes de filtrar
3. ❌ **NO** cargar entidades relacionadas sin necesidad
4. ❌ **NO** olvidar indices en foreign keys
5. ❌ **NO** hacer migrations directamente en producción sin revisar
6. ❌ **NO** usar `.Result` o `.Wait()` (deadlock risk)
7. ❌ **NO** deshabilitar tracking globalmente
8. ❌ **NO** hardcodear connection strings
9. ❌ **NO** olvidar `Include Error Detail=true` en development
10. ❌ **NO** ignorar warnings de migrations

---

## 📚 Referencias

- **PostgreSQL 16:** https://www.postgresql.org/docs/16/
- **Npgsql EF Core:** https://www.npgsql.org/efcore/
- **EF Core 9:** https://learn.microsoft.com/en-us/ef/core/
- **Testcontainers:** https://dotnet.testcontainers.org/

---

**Used by:** tdd-implementer, database-expert, migration-expert
**Related skills:** dotnet/ef-core.md, testing/testcontainers.md
