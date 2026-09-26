---
name: research
description: Use when encountering errors, investigating library APIs, troubleshooting issues, or needing up-to-date documentation. Prioritizes Context7 and WebSearch over outdated training data.
---

# Research Skill

Use this skill when you need to research solutions, understand library APIs, or troubleshoot issues with current, accurate information.

## 🚨 Critical Rule

**NEVER rely solely on training data for:**
- Library-specific APIs or methods
- Recent version changes
- Error troubleshooting
- Package configuration
- Framework-specific patterns

**ALWAYS use research tools first**, then apply findings.

## Research Workflow

### Step 1: Identify What You Need

Determine the type of information needed:

- **Library Documentation**: API references, usage patterns
- **Error Solutions**: Stack traces, error messages
- **Configuration**: Setup, package.json, config files
- **Best Practices**: Current patterns, anti-patterns
- **Version-Specific**: Breaking changes, migration guides

### Step 2: Choose the Right Tool

| Need | Tool | When to Use |
|------|------|-------------|
| Library docs | `mcp__context7__resolve-library-id` + `get-library-docs` | API references, examples, official docs |
| Supabase docs | `mcp__supabase__search_docs` | Database, RLS, auth, storage |
| Error solutions | `WebSearch` | Stack traces, error messages |
| General issues | `WebSearch` | Troubleshooting, "how to" |
| Recent changes | `WebSearch` | Migration guides, changelogs |

## Using Context7 for Library Documentation

### Step 1: Resolve Library ID

Always start by resolving the library name to get the Context7-compatible ID:

```
User asks: "How do I use Zustand persist?"

1. Resolve library:
   mcp__context7__resolve-library-id({ libraryName: "zustand" })

   Result: "/pmndrs/zustand"

2. Get documentation:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/pmndrs/zustand",
     topic: "persist middleware"
   })
```

### Step 2: Get Documentation

```typescript
// General library docs
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  tokens: 5000  // default
})

// Focused topic search
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks useEffect",
  tokens: 3000
})

// Specific version
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js/v15.0.0"
})
```

### Common Libraries for Hounii

| Library | Context7 ID | Usage |
|---------|-------------|-------|
| React | `/facebook/react` | Core React APIs |
| Next.js | `/vercel/next.js` | Web app patterns |
| Expo | `/expo/expo` | Mobile dev |
| Tamagui | `/tamagui/tamagui` | UI components |
| Zustand | `/pmndrs/zustand` | State management |
| React i18next | `/i18next/react-i18next` | Translations |
| Supabase JS | `/supabase/supabase-js` | Database client |

### Context7 Best Practices

1. **Be specific with topics**: Instead of "hooks", use "useState vs useReducer"
2. **Check multiple versions**: Compare current vs latest
3. **Cross-reference**: Verify with WebSearch if uncertain
4. **Token budget**: Start with 5000, reduce to 3000 for focused queries

## Using Supabase Search

### For Database & Backend Questions

```typescript
// Search Supabase docs with GraphQL
mcp__supabase__search_docs({
  graphql_query: `
    {
      searchDocs(query: "row level security policies", limit: 5) {
        nodes {
          title
          href
          content
        }
      }
    }
  `
})

// Get specific error details
mcp__supabase__search_docs({
  graphql_query: `
    {
      error(code: "PGRST116", service: api) {
        code
        message
        httpStatusCode
      }
    }
  `
})
```

### Common Supabase Queries

```typescript
// RLS policies
searchDocs(query: "row level security examples")

// PostGIS / location
searchDocs(query: "postgis distance queries")

// Auth patterns
searchDocs(query: "authentication social providers")

// Edge functions
searchDocs(query: "edge functions deno")

// Storage / files
searchDocs(query: "storage upload presigned urls")
```

## Using WebSearch

### For Troubleshooting Errors

```typescript
// When you encounter an error:
WebSearch({
  query: "React Native Text strings must be rendered within a <Text> component 2025"
})

// For specific error codes:
WebSearch({
  query: "Supabase error PGRST116 solution"
})

// For version-specific issues:
WebSearch({
  query: "Next.js 15 app router middleware breaking changes"
})
```

### Search Query Best Practices

**✅ GOOD Queries:**
```
"Expo SDK 53 camera permissions android"
"Tamagui theme switching not working"
"pnpm workspace dependency resolution error"
"Turborepo cache not working Windows"
"React Native 0.73 hermes crash"
```

**❌ BAD Queries (too vague):**
```
"expo camera"
"tamagui dark mode"
"pnpm error"
"turborepo"
"react native crash"
```

**Query Components:**
1. **Technology name + version**: "Next.js 15", "Expo SDK 53"
2. **Specific issue**: "middleware not running", "build fails"
3. **Platform/context**: "Windows", "iOS", "production"
4. **Year**: "2025" (ensures recent results)

## Research Patterns

### Pattern 1: Library API Research

```
1. User asks: "How do I use Expo Router's tabs?"

2. Research steps:
   a. Resolve library:
      mcp__context7__resolve-library-id({ libraryName: "expo router" })

   b. Get documentation:
      mcp__context7__get-library-docs({
        context7CompatibleLibraryID: "/expo/expo-router",
        topic: "tabs layout navigation"
      })

   c. Verify with web search if needed:
      WebSearch({ query: "Expo Router tabs example 2025" })

3. Synthesize findings and provide answer with code examples
```

### Pattern 2: Error Troubleshooting

```
1. User reports: "Getting 'PGRST116' error from Supabase"

2. Research steps:
   a. Search Supabase docs:
      mcp__supabase__search_docs({
        graphql_query: `{ error(code: "PGRST116", service: api) { message } }`
      })

   b. Search for solutions:
      WebSearch({ query: "Supabase PGRST116 error solution 2025" })

   c. Check project logs:
      mcp__supabase__get_logs({ service: "api" })

3. Diagnose root cause and provide solution
```

### Pattern 3: Version Migration

```
1. User asks: "How to migrate from Next.js 14 to 15?"

2. Research steps:
   a. Get Next.js 15 docs:
      mcp__context7__get-library-docs({
        context7CompatibleLibraryID: "/vercel/next.js/v15.0.0",
        topic: "migration upgrade guide"
      })

   b. Search for breaking changes:
      WebSearch({ query: "Next.js 15 breaking changes migration guide 2025" })

   c. Check Hounii's current version:
      Read package.json in apps/web

3. Provide step-by-step migration plan
```

### Pattern 4: Best Practices Research

```
1. User asks: "What's the best way to handle auth in Expo?"

2. Research steps:
   a. Get Expo auth docs:
      mcp__context7__get-library-docs({
        context7CompatibleLibraryID: "/expo/expo",
        topic: "authentication secure storage"
      })

   b. Get Supabase auth patterns:
      mcp__supabase__search_docs({
        graphql_query: `{ searchDocs(query: "mobile authentication") { nodes { content } } }`
      })

   c. Search community patterns:
      WebSearch({ query: "Expo Supabase auth best practices 2025" })

3. Synthesize findings into recommended approach for Hounii
```

## Research Checklist

Before providing an answer based on memory:

- [ ] **Is this library-specific?**
  - [ ] Yes → Use Context7 for official docs
  - [ ] No → Proceed with general knowledge

- [ ] **Is this an error or issue?**
  - [ ] Yes → Use WebSearch for solutions
  - [ ] Check project logs if relevant

- [ ] **Is this Supabase-related?**
  - [ ] Yes → Use `mcp__supabase__search_docs`
  - [ ] Check advisors for security/performance issues

- [ ] **Is this version-specific?**
  - [ ] Yes → Search for version changelog/migration guide
  - [ ] Check package.json for current version

- [ ] **Have I verified the information?**
  - [ ] Cross-referenced multiple sources
  - [ ] Checked against project configuration
  - [ ] Tested approach if possible

## Common Research Scenarios

### Scenario 1: "How do I use X library?"

**Steps:**
1. Resolve library ID with Context7
2. Get documentation for specific topic
3. Search for recent examples if needed
4. Provide code example adapted to Hounii patterns

### Scenario 2: "I'm getting error Y"

**Steps:**
1. Search error message + technology + year
2. Check Supabase docs if database-related
3. Check project logs with MCP tools
4. Diagnose cause and provide solution

### Scenario 3: "What's the best way to do Z?"

**Steps:**
1. Get official docs via Context7
2. Search community best practices
3. Cross-reference with Hounii patterns (CLAUDE.md)
4. Recommend approach with rationale

### Scenario 4: "Is there a newer way to do this?"

**Steps:**
1. Check current version in package.json
2. Get latest docs from Context7
3. Search for deprecation notices
4. Compare old vs new approach

## Anti-Patterns

### ❌ Don't Guess Library APIs

```
User: "How do I use Zustand's persist?"

❌ WRONG Response:
"Based on my knowledge, you use persist like this..."
(May be outdated or incorrect)

✅ CORRECT Response:
[First use Context7 to get current Zustand docs]
"According to the official Zustand documentation, here's the current pattern..."
```

### ❌ Don't Skip Research for Errors

```
User: "Getting error: Cannot read property 'map' of undefined"

❌ WRONG Response:
"This usually means the array is undefined. Add a check..."
(Generic answer without context)

✅ CORRECT Response:
[Ask for full stack trace, search for specific error context]
"Let me search for this specific error in your stack...
Based on the error occurring in [file:line], the issue is..."
```

### ❌ Don't Trust Outdated Memory

```
User: "How do I configure Expo Router?"

❌ WRONG Response:
"In my training data from 2023, you configure it like..."
(Likely outdated for Expo SDK 53)

✅ CORRECT Response:
[Use Context7 for Expo Router current docs]
"According to Expo Router's current documentation for SDK 53..."
```

## Integration with Other Skills

### With `mobile-feature` Skill

```
User: "Add camera feature to mobile app"

1. Load mobile-feature skill (patterns, i18n, etc.)
2. Use research skill:
   - Get Expo camera docs via Context7
   - Search for permission handling patterns
3. Combine: Apply Expo camera API + mobile patterns
```

### With `database-migration` Skill

```
User: "Add PostGIS location search"

1. Load database-migration skill (RLS, table structure)
2. Use research skill:
   - Search Supabase PostGIS docs
   - Get location query examples
3. Combine: Apply PostGIS + Supabase patterns
```

### With `commit-protocol` Skill

```
User: "Commit fails with lint error"

1. Use research skill:
   - Search specific lint error
   - Get ESLint rule documentation
2. Fix the error
3. Load commit-protocol skill (quality gates, approval)
```

## Token Budget Management

Context7 queries consume tokens. Be strategic:

**High-value queries (5000+ tokens):**
- Migration guides
- Comprehensive API references
- Architecture patterns

**Medium queries (3000 tokens):**
- Specific feature docs
- Focused troubleshooting
- Component examples

**Low queries (1000 tokens):**
- Quick API lookups
- Single function references
- Error code definitions

**Optimize:**
```typescript
// ❌ Too broad (wastes tokens)
get-library-docs({ id: "/vercel/next.js" })

// ✅ Focused (efficient)
get-library-docs({
  id: "/vercel/next.js",
  topic: "app router middleware",
  tokens: 3000
})
```

## When NOT to Research

Skip research for:
- **Basic JavaScript/TypeScript syntax** (use existing knowledge)
- **Core React concepts** (unless version-specific changes)
- **General programming patterns** (DRY, SOLID, etc.)
- **Already confirmed in project docs** (CLAUDE.md, package.json)

## Research Documentation

When providing answers after research:

1. **Cite sources**: "According to Next.js 15 docs..."
2. **Show recency**: Include year/version when relevant
3. **Link references**: Provide documentation URLs
4. **Acknowledge uncertainty**: If sources conflict, say so

**Example Response:**
```
According to the official Expo documentation for SDK 53 (2025),
camera permissions are handled with:

[code example]

Source: https://docs.expo.dev/versions/latest/sdk/camera/

Note: This differs from SDK 51 where [old pattern] was used.
```

## References

- Main config: [CLAUDE.md](../../../CLAUDE.md)
- Context7 MCP: `mcp__context7__*` tools
- Supabase MCP: `mcp__supabase__search_docs`
- Web Search: `WebSearch` tool
