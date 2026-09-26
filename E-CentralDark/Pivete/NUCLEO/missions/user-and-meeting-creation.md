# MISSAO - user-and-meeting-creation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\use-cases\user-and-meeting-creation.md
**SHA:** 2aa7985374f76dfc
**Timestamp:** 2026-08-26T18:42:50.828954
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- A common provisioning pattern: create a new Zoom user via REST API, wait for activation, then create a meeting for that user. This requires understanding user states and proper sequencing.

### Ouro Bruto (primeiros 5000 chars)
```
# User and Meeting Creation Chain

Create a user account and immediately schedule a meeting for that user.

## Overview

A common provisioning pattern: create a new Zoom user via REST API, wait for activation, then create a meeting for that user. This requires understanding user states and proper sequencing.

## Skills Needed

| Order | Skill | Purpose |
|-------|-------|---------|
| 1 | **zoom-rest-api** | Create user account |
| 2 | **zoom-rest-api** | Create meeting for user |
| (Optional) | **webhooks** | Receive user activation event |

## Skill Chaining Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER + MEETING CREATION FLOW                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Create User (zoom-rest-api)                                          │
│    └── POST /users                                                      │
│    └── action: "create" | "autoCreate" | "custCreate" | "ssoCreate"     │
│    └── Returns: user_id, status                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Wait for User Activation                                             │
│    └── Option A: Poll GET /users/{userId} until status = "active"       │
│    └── Option B: Listen for user.activated webhook                      │
│    └── Option C: Use autoCreate (auto-activates)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Create Meeting (zoom-rest-api)                                       │
│    └── POST /users/{userId}/meetings                                    │
│    └── Returns: meeting_id, join_url, start_url                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Zoom app with Server-to-Server OAuth (recommended) or OAuth
- Scopes: `user:write:admin`, `meeting:write:admin`
- Admin privileges on the Zoom account
- **See [Authorization Patterns](../references/authorization-patterns.md)** for RBAC and permission validation middleware

## User Action Types

| Action | Description | Activation | Best For |
|--------|-------------|------------|----------|
| `create` | Sends activation email to user | User clicks email link | Standard provisioning |
| `autoCreate` | Creates pre-activated user | Immediate | Automated systems |
| `custCreate` | Creates user without email | Manual activation | Custom workflows |
| `ssoCreate` | Creates SSO user | SSO login | Enterprise SSO |

## Step 1: Create User

### Option A: Standard Creation (with email activation)

```javascript
const axios = require('axios');

/**
 * Create a new Zoom user
 * @param {Object} userInfo - User information
 * @param {string} accessToken - Valid OAuth access token
 * @returns {Promise<Object>} Created user details
 */
async function createUser(userInfo, accessToken) {
  try {
    const response = await axios.post(
      'https://api.zoom.us/v2/users',
      {
        action: 'create',  // Sends activation email
        user_info: {
          email: userInfo.email,
          type: userInfo.type || 1,  // 1=Basic, 2=Licensed
          first_name: userInfo.firstName,
          last_name: userInfo.lastName,
          password: userInfo.password  // Optional
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      email: response.data.email,
      first_name: response.data.first_name,
      last_name: response.data.last_name,
      type: response.data.type,
      status: 'pending'  // User needs to activate via email
    };
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error(`User ${userInfo.email} already exists`);
    }
    if (error.response?.status === 400) {
      throw new Error(`Invalid user data: ${error.response.data.message}`);
    }
    throw error;
  }
}
```

### Option B: Auto-Create (Immediate activation)

```javascript
/**
 * Create a pre-activated Zoom user (no email required)
 * Recommended for automated provisioning
 */
async function createUserAutoActivate(userInfo, accessToken) {
  try {
    const response = await axios.post(
      'https://api.zoom.us/v2/users',
      {
        action: 'autoCreate',  // User is immediately active
        user_info: {
          email: userInfo.email,
          type: userInfo.type || 2,  // 2=Licensed (required for autoCreate)
          firs
```