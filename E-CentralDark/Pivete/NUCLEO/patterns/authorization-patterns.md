# PADRAO - authorization-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\references\authorization-patterns.md
**SHA:** 8e528ec9710471ec
**Timestamp:** 2026-08-26T18:42:56.821561
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: async (token, previousResults) => {
- execute: async (token, previousResults) => {
- execute: async (token) => getMeetingDetails(meetingId, token)
- execute: async (token, prev) => {

### Ouro Bruto (primeiros 5000 chars)
```
# Authorization Patterns

Permission validation middleware and role-based access control for Zoom API integrations.

> **Note**: These are **implementation patterns for YOUR application** when building Zoom integrations. These are not Zoom's internal authorization mechanisms - they are examples of how to structure authorization logic in your own backend.

## Overview

When chaining multiple Zoom API calls, each step may require different scopes and permissions. This document provides patterns for validating authorization at each step before proceeding.

## Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTHORIZATION VALIDATION FLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Check Token Validity                                                 │
│    └── Is token expired? → Refresh or re-authenticate                  │
│    └── Is token revoked? → Re-authenticate                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Validate Required Scopes                                             │
│    └── Does token have scopes for this operation?                       │
│    └── If missing → Return 403 with required scopes                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Check Resource Permissions                                           │
│    └── Does user have access to this resource?                          │
│    └── Is user admin/owner/member?                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. Execute Operation                                                    │
│    └── Call Zoom API                                                    │
│    └── Handle API-level authorization errors                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Scope Validation Middleware

### Express.js Middleware

```javascript
const axios = require('axios');

/**
 * Middleware to validate OAuth token has required scopes
 * @param {string[]} requiredScopes - Scopes required for this route
 */
function requireScopes(requiredScopes) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'No access token provided'
      });
    }

    try {
      // Get token info to check scopes
      const tokenInfo = await getTokenInfo(token);

      // Check if token has all required scopes
      const tokenScopes = tokenInfo.scope.split(' ');
      const missingScopes = requiredScopes.filter(
        scope => !tokenScopes.includes(scope)
      );

      if (missingScopes.length > 0) {
        return res.status(403).json({
          error: 'insufficient_scope',
          message: 'Token missing required scopes',
          required_scopes: requiredScopes,
          missing_scopes: missingScopes,
          your_scopes: tokenScopes
        });
      }

      // Attach token info to request for downstream use
      req.zoomToken = tokenInfo;
      req.zoomScopes = tokenScopes;
      next();

    } catch (error) {
      if (error.response?.status === 401) {
        return res.status(401).json({
          error: 'invalid_token',
          message: 'Token is invalid or expired'
        });
      }
      next(error);
    }
  };
}

/**
 * Get token information including scopes
 *
 * IMPORTANT: Scopes are returned during OAuth token exchange, not from API calls.
 * You should store the scopes when you receive the access token.
 */
async function getTokenInfo(accessToken) {
  // For Server-to-Server OAuth: Decode JWT to get scopes
  const parts = accessToken.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      scope: payload.scope || '',
      exp: payload.exp,
      aud: payload.aud
    };
  }

  // For User OAuth tokens: Scopes are NOT available from API responses.
  // You must store scopes when you receive them during token exchange.
  //
  // During OAuth token exchange, the response includes:
  // {
  //   "access_token": "...",
  //   "token_type": "bearer",
  //   "scope": "user:read meeting:write ...",  <-- Store this!
  //  
```