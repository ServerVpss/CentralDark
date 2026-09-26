---
name: Security Best Practices
description: Apply security best practices across all code types
triggers:
  - task_mentions: "security|auth|password|token|api key|sensitive"
  - always_active: true
---

# Security Best Practices

Apply these security principles to all code you write.

## Input Validation

**Always validate and sanitize user input:**

```javascript
// Good ✓
function processUserInput(input) {
  const sanitized = input.trim().substring(0, 255);
  if (!isValid(sanitized)) {
    throw new Error('Invalid input');
  }
  return sanitized;
}

// Avoid ✗
function processUserInput(input) {
  return input; // No validation
}
```

## Authentication & Authorization

**Never hardcode credentials:**

```javascript
// Good ✓
const apiKey = process.env.API_KEY;

// Avoid ✗
const apiKey = "sk-1234567890abcdef";
```

**Always check permissions:**

```javascript
// Good ✓
if (!user.hasPermission('delete:resource')) {
  throw new ForbiddenError('Insufficient permissions');
}

// Avoid ✗
// Assuming user always has permission
```

## Data Protection

**Encrypt sensitive data:**
- Use HTTPS for all communications
- Encrypt data at rest (database encryption)
- Use environment variables for secrets
- Never log sensitive information

**Password handling:**
- Use bcrypt, argon2, or similar for hashing
- Never store plain text passwords
- Implement password strength requirements
- Use multi-factor authentication when possible

## SQL Injection Prevention

**Use parameterized queries:**

```javascript
// Good ✓
const users = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

// Avoid ✗
const users = await db.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

## XSS Prevention

**Escape user content:**

```javascript
// Good ✓
const safeHTML = escapeHtml(userContent);

// Avoid ✗
element.innerHTML = userContent; // XSS risk
```

## CSRF Protection

- Use CSRF tokens for state-changing operations
- Validate origin headers
- Use SameSite cookie attribute

## API Security

**Rate limiting:**
```javascript
// Implement rate limiting for API endpoints
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

**Authentication headers:**
```javascript
// Good ✓
Authorization: Bearer <token>

// Avoid ✗
Authorization: <token>  // No scheme
```

## Error Handling

**Don't leak sensitive information in errors:**

```javascript
// Good ✓
catch (error) {
  logger.error('Database error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// Avoid ✗
catch (error) {
  res.status(500).json({ error: error.message }); // May leak DB details
}
```

## Dependency Security

- Keep dependencies up to date
- Use `npm audit` or equivalent
- Review security advisories
- Use lock files (package-lock.json, yarn.lock)

## CORS Configuration

```javascript
// Good ✓ - Specific origins
cors({
  origin: ['https://app.example.com'],
  credentials: true
})

// Avoid ✗ - Wildcard in production
cors({ origin: '*' })
```

## File Upload Security

- Validate file types and sizes
- Scan for malware
- Store in isolated location
- Use content-type validation
- Generate random filenames

## Security Headers

Always set security headers:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `X-XSS-Protection`

## Checklist

When writing code, verify:
- [ ] All user input is validated
- [ ] No hardcoded secrets
- [ ] SQL queries are parameterized
- [ ] User content is escaped
- [ ] Error messages don't leak sensitive info
- [ ] Authentication is required where needed
- [ ] Authorization checks are in place
- [ ] HTTPS is enforced
- [ ] Security headers are set
