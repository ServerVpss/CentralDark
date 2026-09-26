---
name: refactor-extract-function
description: >
  Extracts code blocks from long methods into well-named functions for improved readability and maintainability.
  Use when:
  - Method exceeds 30 lines
  - Repeated code blocks appear
  - Complex nested logic obscures intent
  - Method does multiple things (violates single responsibility)
examples:
  - "Extract this data validation logic into a separate function"
  - "This loop body is complex, extract it"
  - "Pull this error handling code into a helper function"
domain: software-engineering
allowed-tools: Read
when_mandatory: true
---

# Refactor: Extract Function

## What This Skill Does
Identifies code blocks that should be extracted into separate functions, performs the extraction, and replaces original code with function calls.

## When to Use This Skill
- Method > 30 lines (readability suffers)
- Repeated code blocks (DRY violation)
- Complex nested logic (hard to understand)
- Method violates single responsibility principle
- Difficult to unit test due to complexity

## When NOT to Use This Skill
- Method < 15 lines and is already clear
- Code block is only used once and extraction adds no clarity
- Extraction would require excessive parameters (> 4)
- The code is a simple linear sequence with no logical groupings

## Prerequisites
- Code has tests (to validate extraction doesn't break functionality)
- Clear understanding of code block's purpose
- Ability to identify appropriate function name

## Step-by-Step Process

### Step 1: Identify Code Block to Extract
**Input**: Long method or complex code
**Output**: Candidate code block(s) for extraction
**Validation**:
- Block has clear, single purpose
- Block is 3+ lines (not trivial)
- Block can be meaningfully named

### Step 2: Determine Function Signature
**Input**: Code block to extract
**Output**: Function name, parameters, return value
**Validation**:
- Name describes what, not how (e.g., `validateUserInput` not `checkIfValid`)
- Parameters < 4 (otherwise, refactor further or use object)
- Return value is clear (single value or structured object)

### Step 3: Create New Function
**Input**: Function signature
**Output**: New function with extracted code
**Validation**:
- Function has single responsibility
- Function is pure when possible (no side effects)
- Function includes JSDoc/docstring

### Step 4: Replace Original Code with Function Call
**Input**: Original method, new function
**Output**: Refactored method
**Validation**:
- All usages of the code block replaced
- Function is placed appropriately (class method, module function, utility)

### Step 5: Verify Tests Pass
**Input**: Refactored code
**Output**: Test results
**Validation**:
- All existing tests pass
- Consider adding tests for new function

## Quality Checks
- ✅ Function name is descriptive and verb-based
- ✅ Function has < 4 parameters
- ✅ Function has single responsibility
- ✅ Function is documented (JSDoc/docstring)
- ✅ Tests pass after extraction

## Common Pitfalls
- ❌ Extracting trivial code (< 3 lines) that adds no clarity
- ❌ Creating functions with too many parameters (> 4)
- ❌ Vague function names like `doStuff` or `handle`
- ❌ Extracting without running tests to validate behavior preserved

## Examples

### Example 1: Extract Validation Logic (JavaScript)
**Before**:
```javascript
function processUserRegistration(data) {
  // Validation
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (!data.password || data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (data.age && (data.age < 13 || data.age > 120)) {
    throw new Error('Invalid age');
  }

  // Registration logic
  const user = createUser(data);
  sendWelcomeEmail(user);
  return user;
}
```

**After**:
```javascript
/**
 * Validates user registration data
 * @param {Object} data - User registration data
 * @throws {Error} If validation fails
 */
function validateRegistrationData(data) {
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (!data.password || data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (data.age && (data.age < 13 || data.age > 120)) {
    throw new Error('Invalid age');
  }
}

function processUserRegistration(data) {
  validateRegistrationData(data);

  const user = createUser(data);
  sendWelcomeEmail(user);
  return user;
}
```

**Explanation**: Validation logic extracted into focused function, improving readability and reusability

---

### Example 2: Extract Complex Loop Body (Python)
**Before**:
```python
def process_orders(orders):
    results = []
    for order in orders:
        if order.status == 'pending' and order.total > 100:
            discount = 0.1 if order.customer.is_vip else 0.05
            discounted_total = order.total * (1 - discount)
            tax = discounted_total * 0.08
            final_total = discounted_total + tax
            results.append({
                'order_id': order.id,
                'final_total': final_total,
                'discount_applied': discount * 100
            })
    return results
```

**After**:
```python
def calculate_order_total(order):
    """Calculate final order total with discount and tax"""
    discount = 0.1 if order.customer.is_vip else 0.05
    discounted_total = order.total * (1 - discount)
    tax = discounted_total * 0.08
    return discounted_total + tax, discount

def should_process_order(order):
    """Check if order should be processed"""
    return order.status == 'pending' and order.total > 100

def process_orders(orders):
    results = []
    for order in orders:
        if should_process_order(order):
            final_total, discount = calculate_order_total(order)
            results.append({
                'order_id': order.id,
                'final_total': final_total,
                'discount_applied': discount * 100
            })
    return results
```

**Explanation**: Extracted calculation and condition logic, making the main function read like high-level pseudocode

---

### Example 3: Extract Error Handling (TypeScript)
**Before**:
```typescript
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.error(`User ${userId} not found`);
        throw new Error('User not found');
      } else if (response.status >= 500) {
        console.error(`Server error: ${response.status}`);
        throw new Error('Server error');
      } else {
        console.error(`Unexpected error: ${response.status}`);
        throw new Error('Unexpected error');
      }
    }
    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}
```

**After**:
```typescript
function handleApiError(response: Response, userId: string): never {
  if (response.status === 404) {
    console.error(`User ${userId} not found`);
    throw new Error('User not found');
  } else if (response.status >= 500) {
    console.error(`Server error: ${response.status}`);
    throw new Error('Server error');
  } else {
    console.error(`Unexpected error: ${response.status}`);
    throw new Error('Unexpected error');
  }
}

async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      handleApiError(response, userId);
    }
    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}
```

**Explanation**: Error handling extracted, main function focuses on happy path

## Success Criteria
- Original method is shorter and more readable
- Extracted function has clear, descriptive name
- Function has < 4 parameters
- Tests pass after extraction
- Code follows DRY principle

## Related Skills
- refactor-inline-variable - Opposite operation (inline unnecessary abstraction)
- test-generator-jest - Generate tests for new functions

## Related Agents
- refactoring-guide - Strategic refactoring advice
- code-reviewer - Reviews refactored code for quality

---

**Version**: 1.0
**Last Updated**: 2025-11-15
**Complexity**: MEDIUM
**Estimated Time**: 5-15 minutes
