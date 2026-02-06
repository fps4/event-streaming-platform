# Authorizer Service

Supports UI and Control API auth flows described in [ui.md](./ui.md) and [control-api.md](./control-api.md); issues tokens for `/ingest/*` and `/api/*` to enable end-user access/auth goals (sign in, register, manage access) and backend enforcement.

Issues short-lived JWTs for the platform: machine **clients** calling `/ingest/*`, control API callers hitting `/api/*`, and browser/UI sessions. Stores minimal session metadata for audit/troubleshooting. Single MongoDB database holds workspaces, clients, users, and sessions (no multi-tenant DB split).

## Responsibilities
- Manage **clients** (global machine identities); clients carry topic-bound scopes (e.g., `ingest:topic:orders.created`, `api:read`).
- Validate client status and secrets before issuing tokens; workspace context is established through session metadata (derived from pipeline registration).
- Register and authenticate users (operators) and issue UI/control tokens (workspace-agnostic).
- Manage workspace lifecycle and membership **after login**: users create workspaces in the UI, add pipelines and clients, and invite other users. Workspace creator becomes **owner** and can assign other users as **admins** (and members).
- Do **not** auto-create a workspace during registration; users can belong to zero or many workspaces.
- Sessions can be user-only until a workspace is selected in the UI; once selected, tokens carry that workspace for authorization checks. For client sessions, workspace context comes from pipeline registration.
- Create and persist sessions with TTL for both clients and human users.
- Issue HS256 JWTs with principal claims (client or user), workspace claim, and scope/topic restrictions.
- Refresh session TTL and re-issue JWTs.
- Enforce CORS via configured allowlist (no tenant-derived origins).

## Runtime
- Language: Node.js + TypeScript (ESM)
- Framework: Express
- Database: MongoDB (single database for workspaces + clients + users + sessions)

## HTTP API

See authentication touchpoints in [ui.md](./ui.md) and [control-api.md](./control-api.md).
Base path: `/auth`

### Client token (machine-to-machine)
`POST /auth/token`

Issues a token for clients that call `/ingest/*` or `/api/*`. Clients are global entities.

**Request body**
```json
{
  "client_id": "client id",
  "client_secret": "client secret",
  "scopes": ["ingest:topic:orders.created", "api:read"]
}
```

**Response (201)**
```json
{
  "sessionId": "...",
  "token": "...",
  "expiresIn": 3600,
  "client_id": "...",
  "scopes": ["ingest:topic:orders.created", "api:read"]
}
```

**Errors**
- 400: invalid input or scopes not allowed for the client.
- 404: client not found/inactive.
- 401: secret mismatch.
- 500: missing `AUTH_JWT_SECRET` or internal error.

### UI / user session (authenticate user)
`POST /auth/session`

Issues a session for operators using the UI/control API (authn mechanism pluggable: password, SSO token, etc.).

**Request body (example)**
```json
{
  "username": "operator@example.com",
  "password": "...",
  "workspace_id": "..." // required only when AUTH_REQUIRE_USER_WORKSPACE=true
}
```

**Response (201)**
```json
{
  "sessionId": "...",
  "token": "...",
  "expiresIn": 3600,
  "user": {
    "id": "...",
    "active_workspace_id": "workspace used for this session (null until selected)",
    "memberships": [
      {"workspace_id": "...", "role": "owner|admin|member"}
    ]
  }
}
```

### Refresh token
`POST /auth/refresh`

Refreshes the session TTL and issues a new JWT. Accepts a bearer token or `x-session-token` header.

**Headers**
- `Authorization: Bearer <token>` or `X-Session-Token: <token>`

**Response (200)**
```json
{
  "sessionId": "...",
  "token": "...",
  "expiresIn": 3600,
  "expiresAt": "2026-01-21T10:00:00.000Z",
  "principal": {
    "id": "...",
    "type": "client|user",
    "active_workspace_id": "...",
    "memberships": [
      {"workspace_id": "...", "role": "owner|admin|member"}
    ],
    "scopes": ["..."]
  }
}
```

**Errors**
- 401: missing/invalid/expired token, client/user/workspace mismatch.
- 404: session not found or inactive.
- 500: missing `AUTH_JWT_SECRET` or internal error.

## JWT Claims
HS256-signed; includes:
- `sid`: session ID
- `pid`: principal ID (client or user)
- `ptyp`: principal type (`client` or `user`)
- `wid` (optional): active workspace ID for this session when the user has selected a workspace (omitted when login is workspace-agnostic and none is selected)
- `scopes`: allowed scopes (e.g., `ingest:topic:<name>`, `api:*`, `ui:session`)
- `iss`, `aud`, `exp`, `iat`, `jti`

Optional claims for clients:
- `topics`: allowlist of topic names usable on `/ingest/:topic`

## Client Metadata Capture
On token issuance the service captures:
- User agent and Client Hints (`sec-ch-ua`, `sec-ch-ua-platform`, `sec-ch-ua-mobile`)
- IP address (from `x-forwarded-for` or `req.ip`)

Stored with normalized keys (e.g., `user_agent`, `ch_ua`, `ip_address`) on the session context.

## Configuration

### Required
- `AUTH_JWT_SECRET`: JWT signing secret.
- `MONGO_URI`: connection URI for MongoDB.
- `AUTH_DB_NAME`: database name (single DB for all records: workspaces, clients, users, sessions).

### Optional
- `AUTHORIZER_PORT` (default: `7305`)
- `AUTH_JWT_ISSUER` (default: `authorizer-service`)
- `AUTH_JWT_AUDIENCE` (default: `api`)
- `SESSION_TTL_MINUTES` (default: `60`)
- `CORS_ORIGINS` (comma-separated static allowlist)
- `AUTH_REQUIRE_USER_WORKSPACE` (default: `false`): when `true`, `/auth/session` requires `workspace_id` and validates the workspace; when `false`, login can proceed without a workspace and tokens omit `wid` until a workspace is selected.
- `LOG_PRETTY` (set to `false`/`0` for JSON logs)

## CORS Behavior
- If `CORS_ORIGINS` is set, those origins are allowed.
- In non-production environments, common localhost origins are allowed.
- If no origins exist, all origins are allowed.

## Logging
- Structured logging with contextual fields such as `principalId`, `principalType`, `workspaceId`, and `sessionId`.
- Token issuance and refresh are logged with minimal identifiers only.

## Local Development
From the service folder:
- Install dependencies: `npm install`
- Build and run: `npm run build && node dist/server.js`

## Related Components
- Data models: `@event-streaming-platform/data-models`
- Logging utilities: `@event-streaming-platform/logging-utils`
- Control API: consumes Authorizer-issued JWTs for `/api/*` and relies on user/client registration from this service.
- Workspace membership model: users can belong to multiple workspaces; first registrant is owner, can promote/demote other users to admin/member; sessions pick an active workspace for authorization.
