## Build, test, lint
- Repo uses per-service npm scripts and a root `Makefile`.
- Install everything: `make install` (installs packages for connectors, data-models, logging-utils, authorizer, control-api).
- Build everything: `make build`.
- Test everything: `make test` (runs authorizer, connector-http-source, connector-http-sink, control-api, worker-jsonata).
- Per-service:
  - `cd services/authorizer && npm test` (node --test with ts-node loader)
  - `cd services/control-api && npm test`
  - `cd services/connector-http-source && npm test`
  - `cd services/connector-http-sink && npm test`
  - `cd services/worker-jsonata && npm test`
- Run a single test: use node’s test runner flags, e.g. `npm test -- --test-name-pattern "<regex>"` or `node --test path/to/file.test.ts` (apply appropriate loader used in the script).
- Dev servers: `npm run dev` in each service (ts-node/esm with nodemon where defined).
- Build/start prod: `npm run build && npm start` per service.
- Docker Compose: `docker compose up` (see `compose.yaml` for service envs and ports).
- No lint commands are defined in package scripts.

## High-level architecture
- Kafka-native event streaming platform deployed via `compose.yaml`: core services are broker, schema-registry, control-api (control plane + Mongo), authorizer (JWT issuance + Mongo), worker-jsonata (Kafka→Kafka transforms), connector-http-source (REST ingest → Kafka), connector-http-sink (Kafka consumer skeleton), optional ClickHouse/ksqlDB/Kafka Connect commented scaffolding.
- Control API provides topic admin/metrics and resource CRUD (workspaces, clients, users, connectors, pipelines) backed by Mongo; enforces platform topic/ACL conventions via KafkaJS.
- Authorizer issues/refreshes HS256 JWTs for clients/users with workspace-scoped claims; all API/ingest calls expect these tokens.
- Data plane flow: HTTP Source accepts JSON payloads, validates topic naming, forwards to Kafka; worker-jsonata subscribes to configured source topics, fetches Jsonata transforms from Mongo, emits enriched or DLQ records; sink consumes configured topics for downstream delivery (currently logging skeleton).
- Shared packages: `packages/data-models` (Mongoose schemas/models), `packages/logging-utils` (Pino utilities), `packages/connector-core` (connector helpers, topic validation, retry policy), `packages/openapi-components` (shared OpenAPI pieces).
- UI/control surface is described in docs (not present as code here); start docs at `docs/README.md` → `solution-design.md` for diagrams/flows.

## Key conventions
- Topic naming: `<env>.<workspace>.<stream>.<variant>` (`raw|enriched|dlq|retry`), max 249 chars, chars `a-zA-Z0-9._-`; DLQ/retry topics are first-class and should always be provisioned.
- Auth: All `/api/*` (control-api) and `/ingest/*` (http-source) expect Authorizer-issued JWTs; claims include session/principal/workspace/scopes/topics.
- Node.js 20+, TypeScript across services; services run with `type: "module"` except packages/api (CommonJS).
- Logging: Pino with optional pretty mode; correlation via `x-request-id` propagated from HTTP ingress through services.
- Environment: Mongo URIs and Kafka brokers are required for most services; defaults are provided in `compose.yaml` but secrets (e.g., `AUTH_JWT_SECRET`) must be supplied.
- Tests use the Node test runner (`node --test`); worker-jsonata builds first then tests against compiled output.
- Shared OpenAPI components live in `packages/openapi-components`; http-source openapi at `services/connector-http-source/openapi.yaml`.
- Use Makefile targets for multi-package ops; clean removes `dist` and `node_modules` across packages/services.
