# CONTRATO - security.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\security.yaml
**SHA:** 54a4387acaa56c7a
**Timestamp:** 2026-08-28T02:56:10.365744
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: pnpm install --frozen-lockfile
- run: pnpm audit --audit-level moderate

### Ouro Bruto (primeiros 5000 chars)
```
name: Security Analysis

on:
  push:
    branches: [main, stable]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly security scan on Sundays at 2 AM
    - cron: '0 2 * * 0'

permissions:
  actions: read
  contents: read
  security-events: read

jobs:
  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 45

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'typescript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v4
        with:
          languages: ${{ matrix.language }}
          queries: security-extended,security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v4

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v4
        with:
          category: "/language:${{matrix.language}}"
          upload: false
          output: "codeql-results"

      - name: Upload CodeQL results as artifact
        uses: actions/upload-artifact@v7
        if: always()
        with:
          name: codeql-results-${{ matrix.language }}
          path: codeql-results

  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: '24'

      - name: Install pnpm
        uses: pnpm/action-setup@v6
        with:
          version: '9.14.4'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run npm audit
        run: pnpm audit --audit-level moderate
        continue-on-error: true

      - name: Generate SBOM
        uses: anchore/sbom-action@v0.24.0
        with:
          path: ./
          format: spdx-json
          artifact-name: sbom.spdx.json

      - name: Upload SBOM as artifact
        uses: actions/upload-artifact@v7
        if: always()
        with:
          name: sbom-results
          path: |
            sbom.spdx.json
            **/sbom.spdx.json

  secrets-scan:
    name: Secrets Detection
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - name: Run Trivy secrets scan
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-secrets-results.sarif'
          scanners: 'secret'

      - name: Upload Trivy secrets results as artifact
        uses: actions/upload-artifact@v7
        if: always()
        with:
          name: trivy-secrets-results
          path: trivy-secrets-results.sarif

```

---

# CONTRATO - security.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\app\lib\security.ts
**SHA:** e0b3548776b3d7f5
**Timestamp:** 2026-08-28T02:56:16.596176
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const windowStart = now - config.windowMs;

### Padroes
- const basePattern = pattern.slice(0, -2);

### Ouro Bruto (primeiros 5000 chars)
```
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';

// Rate limiting store (in-memory for serverless environments)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  // General API endpoints
  '/api/*': { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes

  // LLM API (more restrictive)
  '/api/llmcall': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute

  // GitHub API endpoints
  '/api/github-*': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute

  // Netlify API endpoints
  '/api/netlify-*': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
};

/**
 * Rate limiting middleware
 */
export function checkRateLimit(request: Request, endpoint: string): { allowed: boolean; resetTime?: number } {
  const clientIP = getClientIP(request);
  const key = `${clientIP}:${endpoint}`;

  // Find matching rate limit rule
  const rule = Object.entries(RATE_LIMITS).find(([pattern]) => {
    if (pattern.endsWith('/*')) {
      const basePattern = pattern.slice(0, -2);
      return endpoint.startsWith(basePattern);
    }

    return endpoint === pattern;
  });

  if (!rule) {
    return { allowed: true }; // No rate limit for this endpoint
  }

  const [, config] = rule;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean up old entries
  for (const [storedKey, data] of rateLimitStore.entries()) {
    if (data.resetTime < windowStart) {
      rateLimitStore.delete(storedKey);
    }
  }

  // Get or create rate limit data
  const rateLimitData = rateLimitStore.get(key) || { count: 0, resetTime: now + config.windowMs };

  if (rateLimitData.count >= config.maxRequests) {
    return { allowed: false, resetTime: rateLimitData.resetTime };
  }

  // Update rate limit data
  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);

  return { allowed: true };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  // Return the first available IP or a fallback
  return cfConnectingIP || realIP || forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

/**
 * Security headers middleware
 */
export function createSecurityHeaders() {
  return {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Content Security Policy - restrict to same origin and trusted sources
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for React
      "style-src 'self' 'unsafe-inline'", // Allow inline styles
      "img-src 'self' data: https: blob:", // Allow images from same origin, data URLs, and HTTPS
      "font-src 'self' data:", // Allow fonts from same origin and data URLs
      "connect-src 'self' https://api.github.com https://api.netlify.com", // Allow connections to GitHub and Netlify APIs
      "frame-src 'none'", // Prevent iframe embedding
      "object-src 'none'", // Prevent object embedding
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': ['camera=()', 'microphone=()', 'geolocation=()', 'payment=()'].join(', '),

    // HSTS (HTTP Strict Transport Security) - only in production
    ...(process.env.NODE_ENV === 'production'
      ? {
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        }
      : {}),
  };
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKeyFormat(apiKey: string, provider: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Basic length checks for different providers
  const minLengths: Record<string, number> = {
    anthropic: 50,
    openai: 50,
    groq: 50,
    google: 30,
    github: 30,
    netlify: 30,
  };

  const minLength = minLengths[provider.toLowerCase()] || 20;

  return apiKey.length >= minLength && !apiKey.includes('your_') && !apiKey.includes('here');
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown, isDevelopment = false): string {
  if (isDevelopment) {
    // In development, show full error details
    return error instanceof Error ? error.message : String(error);
  }

  // In production, show generic messages to prevent information leakage
  if (error instanceof Error) {
    // Chec
```