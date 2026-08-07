# mikan-api — Agent Context

This file mirrors the local `.claude` guidance for coding agents such as Codex.

## Project identifier
`MKN`

Use the issue key in branch names:
- `feature/MKN-{issue-number}-description`
- `fix/MKN-{issue-number}-description`
- `chore/MKN-{issue-number}-description`

Examples:
- `chore/MKN-1-init-nestjs`
- `chore/MKN-2-eslint-prettier-husky`
- `feature/MKN-7-user-entity`
- `feature/MKN-8-auth-register`

## Stack

### Installed
| Concern | Choice |
|---|---|
| Framework | NestJS 11 + TypeScript 5.7 |
| ORM | Prisma 7.8 (`@prisma/client` + `@prisma/adapter-pg`) |
| Database | PostgreSQL (local via `docker compose`, prod via Railway) |
| Auth | JWT — access token 15min, refresh token 7d (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`) |
| Hashing | `bcryptjs` |
| Validation | `class-validator` + `class-transformer` on DTOs |
| Lint / format | **oxlint + oxfmt** (not eslint/prettier) |
| Testing | Jest 30 + Supertest |
| Git hooks | husky + lint-staged |
| Package manager | pnpm 10 · Node.js 20+ |

### Not installed yet — roadmap, do not assume these exist
- `@nestjs/config` + Joi env validation → today config is a hand-rolled `src/config/env.ts`
- `@nestjs/swagger` → the README and portfolio notes mention Swagger at `/api`; it is not wired up
- `@nestjs/schedule` → required for the room expiration cron (v0.4.0)

## Conventions
- Each feature lives in its own NestJS module under `src/modules/`
- DTOs go in `infrastructure/http/dto/` inside each module
- Never expose password hashes in a response
- Use `JwtAuthGuard` for required auth and `JwtRefreshGuard` on the refresh endpoint
- Run Prisma migrations with `prisma migrate dev` in development
- Keep PR titles in the form `type(MKN-###): description`
- Always add or update `Closes #N` in the PR body for the related GitHub issue

## Commits
Use Conventional Commits: `type(scope): description`

- Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- **Scope is domain-based**: `auth`, `todos`, `rooms`, `ui`
- Example: `feat(auth): add refresh token endpoint`

> Commit scopes are domain names. **PR title scopes are issue keys** (`type(MKN-14): todo crud`), set automatically by the `link-issue` workflow. Do not conflate the two.

## Linting and formatting
This repo uses **oxlint + oxfmt**, not eslint/prettier. Do not add eslint config files.

- **Lint:** `pnpm lint` → `oxlint src test --max-warnings=0`
- **Lint fix:** `pnpm lint:fix` → `oxlint src test --fix`
- **Format:** `pnpm format` → `oxfmt src test`

`lint-staged` runs `oxlint --fix --max-warnings=0` + `oxfmt` on staged `*.{ts,js}` via a husky pre-commit hook.

## Testing
- Unit tests: `*.spec.ts` **alongside the unit under test** — e.g. `create.use-case.spec.ts` next to `create.use-case.ts`
- Jest `rootDir` is `src`, so only specs under `src/` run with `pnpm test`
- Path alias: `src/*` resolves via `moduleNameMapper`
- E2E tests: `test/` folder using supertest, separate config (`test/jest-e2e.json`)
- Run with `pnpm test` and `pnpm test:e2e`
- **Mock at the layer boundary**: stub the `*Repository` abstract class, never `PrismaService`

## Local database
- `pnpm db:up` / `pnpm db:down` → `docker compose -f docker-compose.dev.yml`
- Migrations: `pnpm prisma migrate dev`

## Deploy
- Railway
- Auto-deploy from `main`
- Never commit `.env`

## Skills

`.claude/skills/` holds the project's procedures as invocable skills. They encode the *how*; this file stays the source of truth for the *what*, and each skill reads it rather than restating rules.

| Skill | Use for |
|---|---|
| `mkn-pr` | Opening a PR — branch validation, pre-flight lint/test, the auto-title workflow |
| `mkn-use-case` | A new operation, or extracting use cases from an existing service |
| `mkn-endpoint` | An HTTP route + DTO for an operation that already exists |
| `mkn-entity` | A new persisted entity — model, migration, domain class, repository, Prisma impl |
| `mkn-module` | A whole feature module; composes the two above |

When a convention here changes, the skills do not need editing — they point back to this file. Only edit a skill when the *procedure* changes.

## Documentation policy

This file is the **operational source of truth** for the backend: conventions, architecture, schema, CI, testing.

- Keep repo-specific documentation here, not under `docs/`.
- `docs/` is reserved for **external reference material only** (e.g. `docs/agent-teams-reference.md`, a mirror of the Claude Code docs). No architecture or schema documentation belongs there.
- If architecture or schema decisions change, update this file instead of creating separate docs.

### Companion layer — Obsidian vault
The **rationale** layer lives in `~/Documents/Obsidian Vault/Projects/Mikan/`: goals, ADRs (`Decisions.md`), roadmap, portfolio framing and learnings. That layer answers *why*; this file answers *how*. Neither should duplicate the other — when they overlap, link instead of copying, and this file wins on anything operational.

## Code architecture

### Decision
- Use a pragmatic layered structure.
- Organize the Nest application by feature modules first.
- Allow `application`, `domain`, and `infrastructure` folders inside each module when complexity justifies it.
- Keep shared technical concerns in `src/shared`.
- Keep Prisma schema and migrations in `prisma/`.

This project intentionally stays lighter than full Clean Architecture. The goal is to preserve boundaries without adding ceremony too early.

### Actual folder layout
```text
prisma/
├── models/                    ← multi-file schema (no single schema.prisma)
│   ├── base.prisma            ← generator + datasource
│   ├── user.prisma
│   ├── todo.prisma
│   └── refresh-token.prisma
└── migrations/

src/
├── config/
│   └── env.ts
├── modules/
│   ├── auth/
│   │   ├── application/        ← use-cases/ (one file per use case) + types/
│   │   ├── domain/             ← entities/, repository/, services/
│   │   ├── infrastructure/     ← http/{controller,dto,guards,decorator}, jwt/, persistence/, strategies/
│   │   └── auth.module.ts
│   ├── todo/                   ← singular, not `todos`
│   │   ├── application/        ← use-cases/ (one file per use case) + types/
│   │   ├── domain/             ← entities/, repository/
│   │   ├── infrastructure/     ← http/{controller,dto}, persistence/
│   │   └── todo.module.ts
│   └── users/                  ← no application/ layer yet: persistence only
│       ├── domain/
│       ├── infrastructure/persistence/
│       └── users.module.ts
├── shared/
│   ├── domain/                 ← pagination.ts
│   ├── utils/                  ← hash.ts
│   └── infrastructure/
│       ├── http/               ← pagination.dto.ts
│       └── prisma/             ← PrismaModule, PrismaService
├── app.module.ts
└── main.ts
```

Notes on the current state:
- The module is `todo` (singular). Keep it that way rather than renaming mid-flight.
- `users` has no `application/` layer because it has no use cases of its own yet — it is consumed by `auth`. This is the "start flat" rule working as intended, not an omission.
- `rooms` does not exist yet. It arrives in v0.4.0.

### Layer responsibilities

#### `domain/`
- Pure business concepts and rules.
- Typical contents: entities, value objects, business enums, repository contracts, domain services without Nest or Prisma dependencies.
- Do not place HTTP or database logic here.

#### `application/`
- Use cases and orchestration for one module.
- Typical contents: services coordinating repositories, command/query handlers, use-case-specific mapping, transaction boundaries when needed.
- May depend on `domain/` and abstractions implemented in `infrastructure/`.
- Should not contain controller decorators or inline Prisma queries.

#### `infrastructure/`
- Framework and persistence details.
- Typical contents: controllers, Nest providers, Prisma repository implementations, guards, strategies, interceptors, transport adapters, persistence mappings.
- Nest and Prisma belong here.

### Prisma placement
- `prisma/` contains `models/*.prisma`, `migrations/`, and optional seed files. It is the database source of truth. There is no single `schema.prisma` — each entity gets its own file, with `base.prisma` holding the generator and datasource.
- `src/shared/infrastructure/prisma/` contains the Nest integration such as `PrismaModule` and `PrismaService`.

### Growth rules
- Start flat for trivial modules.
- Split into `application/domain/infrastructure` only when a module begins to grow.
- Feature boundaries come first: `auth`, `users`, `todos`, `rooms`.
- Shared infrastructure belongs in `src/shared/infrastructure`.
- Controllers stay in infrastructure because they are transport concerns.
- Repository interfaces belong in domain or application; Prisma implementations belong in infrastructure.
- DTOs can stay in a local `dto/` folder or move under infrastructure when the module becomes more complex.

## SOLID in practice

These are not abstract principles here — each one maps to a concrete rule already visible in the codebase. The `todo` module is the reference implementation; replicate its shape when building `rooms`.

### S — Single Responsibility
One reason to change per unit.
- One Nest module per feature (`auth`, `todo`, `users`).
- **One use case per file**: `todo/application/use-cases/create.use-case.ts` exposes exactly one public method, `execute()`. New behaviour means a new file, not a new method on a growing service.
- Controllers only translate HTTP ↔ use case. No business rules in `infrastructure/http/`.

> **No service facades.** Controllers inject the use cases they need and call `.execute()` directly. Do not add a `<Module>Service` that only delegates — it forces every route to depend on every operation in the module, which is the coupling the use-case split exists to remove.
>
> Both modules were migrated to this shape; there is no multi-method service left in the codebase.

### O — Open/Closed
Extend without editing what already works.
- Adding a use case means adding a file and one entry in `application/use-cases/index.ts`. No existing use case is touched.
- `TodoUseCases` is spread into the module providers (`...TodoUseCases`), so the module never needs editing either.

### L — Liskov Substitution
Any implementation of a contract must be a drop-in replacement.
- `PrismaTodoRepository` is substitutable for `TodoRepository` everywhere, including in tests.
- **Specs mock against the domain contract, never against Prisma.** A test that stubs `PrismaService` instead of `TodoRepository` has crossed a layer and should be rewritten.

### I — Interface Segregation
Small contracts, shaped by consumers.
- Repository methods stay intent-revealing and narrow (`findAllByOwnerUserId`, `findAllByAssignedUserId`) rather than one generic `find(filter)` that every caller has to over-specify.
- Input shapes live in dedicated `*.repository.type.ts` / `application/types/` files so a use case imports only what it consumes.
- Do not add a generic `BaseRepository<T>`. It is explicitly listed under "avoid over-engineering".

### D — Dependency Inversion
High-level policy must not depend on low-level detail.
- `domain/repository/todo.repository.ts` declares an **abstract class**, used simultaneously as the contract and as the Nest injection token.
- The module binds it to the implementation: `{ provide: TodoRepository, useClass: PrismaTodoRepository }`.
- Use cases inject `TodoRepository` and have no idea Prisma exists.
- **Hard rule:** nothing in `domain/` may import from `@nestjs/*` or `@prisma/client`. If it needs to, the code belongs in `application/` or `infrastructure/`.

### The pragmatic guardrail
SOLID here is a set of boundaries, not a licence to over-architect. The escalation ladder:

| Module complexity | Structure |
|---|---|
| Trivial | Plain Nest conventions — controller + service (`users` today) |
| Growing | Feature module + repository contract + shared infrastructure |
| Complex | Full `domain` / `application` / `infrastructure` split with use cases (`todo` today) |

Do not introduce CQRS, event sourcing, hexagonal ceremony or generic base services. Split a layer only when a real change makes the current shape hurt.

## Database architecture

### Product goals
- JWT auth with refresh token rotation.
- User-owned todos.
- Shared rooms with public slug access.
- Anonymous participation in rooms.
- Room expiration and scheduled cleanup.
- Growth without destructive rewrites.

### Design principles
1. Keep the first version small.
2. Separate identity, authorization, and collaboration concerns.
3. Prefer additive evolution over destructive refactors.
4. Model room collaboration explicitly instead of hiding it inside `Todo`.
5. Include operational fields from day one: `id`, `createdAt`, `updatedAt`, and archival or soft-delete fields when useful.

### Domain split
- Identity: `user`, `refresh_token` — **implemented**
- Work items: `todo` — **implemented**
- Collaboration: `room`, `room_member` — **planned, v0.4.0**
- Optional future: `labels`, `todo_labels`, `activity_logs`, `room_invites`, `attachments`

### Core modeling decision
- Use one `todo` table for both personal and room todos.
- A todo belongs either to a personal owner user or to a shared room.
- Enforce `owner_user_id` xor `room_id` at application level first, and later with a DB check constraint if needed.

### Schema conventions
These are derived from the schema as actually implemented. Follow them for every new model.

- **Multi-file schema.** There is no `schema.prisma`. The schema is split across `prisma/models/*.prisma`, with `base.prisma` holding the `generator` and `datasource`. A new entity means a new file in that folder.
- **snake_case field names** (`owner_user_id`, `created_at`) — Prisma field names match the column names directly, so no `@map` per field is needed.
- **Singular table names** via `@@map("user")`, `@@map("todo")`, `@@map("refresh_token")`.
- **Enums are `@@map`ped to snake_case** too: `@@map("user_status")`, `@@map("todo_status")`.
- **IDs are `String @id @default(uuid())`** without `@db.Uuid` — stored as text, not the Postgres `uuid` type.
- Timestamps: `created_at DateTime @default(now())` and `updated_at DateTime @updatedAt`.

---

## Implemented schema

The source of truth is `prisma/models/`. This section describes it; if they disagree, the `.prisma` files win and this section is stale.

### `user` — `prisma/models/user.prisma`
- Purpose: application identity.
- Fields: `id`, `email` (unique), `password_hash`, `name`, `last_name`, `status`, `last_login_at`, `created_at`, `updated_at`.
- Relations: `refresh_token[]`, `owned_todos` (`TodoOwner`), `assigned_todos` (`TodoAssignedTo`).
- Never store raw passwords. Hashing lives in `src/shared/utils/hash.ts` (bcryptjs).
- **Note:** there is no `username` and no `displayName`. Identity is `email` for login plus `name` + `last_name` for display.

### `refresh_token` — `prisma/models/refresh-token.prisma`
- Purpose: refresh token rotation, revocation and auditability.
- Fields: `id`, `user_id`, `token_hash`, `family`, `issued_at`, `expires_at`, `revoked_at?`, `replaced_by_token_id?`, `ip_address`, `user_agent`, `created_at`.
- Index: `user_id`.
- Supports logout by device, rotation via `family`, and an audit trail via `ip_address`/`user_agent`.
- **Gap vs. design:** `replaced_by_token_id` is a plain `String?` with no FK relation, and there are no indexes on `family` or `expires_at`. Add both when refresh-token queries start mattering.

### `todo` — `prisma/models/todo.prisma`
- Purpose: task storage for both personal and room contexts.
- Fields: `id`, `title`, `description?`, `status`, `priority`, `owner_user_id?`, `room_id?`, `owner_guest_id?`, `assigned_user_id?`, `due_at?`, `completed_at?`, `created_at`, `updated_at`.
- Relations: `owner_user` (`TodoOwner`), `assigned_user` (`TodoAssignedTo`).
- `room_id` and `owner_guest_id` are **already present as nullable columns with no FK** — deliberate groundwork so v0.4.0 adds relations without a destructive migration.
- Personal todo rule: `owner_user_id != null` and `room_id == null`.
- Room todo rule: `room_id != null` and `owner_user_id == null`.
- Enforced today in `todo/application/use-cases/create.use-case.ts`.

### Implemented enums
```prisma
enum UserStatus { ACTIVE  DISABLED }                                    // @@map("user_status")
enum TodoStatus { PENDING  COMPLETED  IN_PROGRESS  ON_HOLD  CANCELLED } // @@map("todo_status")
```

`priority` is an **`Int @default(0)`**, not an enum. Higher number = higher priority. This was chosen over `TodoPriority{LOW,MEDIUM,HIGH}` because it allows arbitrary ordering and reordering without a migration.

### Implemented indexes
- Unique: `user.email`
- `refresh_token`: `user_id`
- `todo`: `owner_user_id`, `room_id`, `status`, `created_at`, `due_at`
- `todo` composite: `(room_id, status, created_at)`, `(owner_user_id, status, created_at)`

The composite indexes are already in place ahead of the rooms feature — they are the ones that make the room and personal list queries cheap.

### Fields deliberately not implemented
`sort_order` and `deleted_at` appear in the original design but are not in the schema. Add them only when drag-and-drop ordering or soft delete becomes a real requirement.

---

## Planned schema — v0.4.0 (rooms)

Not implemented. This is the target shape, superseding the older `docs/room-entity.md` (now removed), which used a different and now-discarded set of enums (`view_only|comment_only|edit`, `open|closed`, `expiry_date`).

**`room_guests` is out of the MVP.** Decision: anonymous participants in v0.4.0 are read-only and stateless, so there is nothing to persist about them. `todo.owner_guest_id` already exists as a nullable column if anonymous attribution is added in phase 2.

Implementation order: `Room` → `RoomMember` → wire `Todo.room_id` to a real FK.

The block below is already written in the repo's conventions and can go straight into `prisma/models/room.prisma`.

`slug` is unique, indexed, URL-safe and **server-generated** — never accepted from the client.

```prisma
model Room {
  id              String         @id @default(uuid())
  owner_user_id   String
  slug            String         @unique
  name            String
  description     String?
  visibility      RoomVisibility @default(PUBLIC)
  access_mode     RoomAccessMode @default(ANONYMOUS)
  status          RoomStatus     @default(ACTIVE)
  expires_at      DateTime?
  last_activity_at DateTime?
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  owner           User           @relation(fields: [owner_user_id], references: [id], onDelete: Cascade)
  members         RoomMember[]
  todos           Todo[]

  @@index([owner_user_id])
  @@index([status])
  @@index([expires_at])
  @@map("room")
}

model RoomMember {
  id              String      @id @default(uuid())
  room_id         String
  user_id         String
  role            RoomRole    @default(EDITOR)
  joined_at       DateTime    @default(now())
  left_at         DateTime?

  room            Room        @relation(fields: [room_id], references: [id], onDelete: Cascade)
  user            User        @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([room_id, user_id])
  @@index([room_id])
  @@index([user_id])
  @@map("room_member")
}

enum RoomVisibility {
  PUBLIC
  PRIVATE

  @@map("room_visibility")
}

enum RoomAccessMode {
  ANONYMOUS
  AUTHENTICATED_ONLY

  @@map("room_access_mode")
}

enum RoomStatus {
  ACTIVE
  ARCHIVED
  EXPIRED

  @@map("room_status")
}

enum RoomRole {
  OWNER
  EDITOR
  VIEWER

  @@map("room_role")
}
```

Plus a migration on the existing `todo` table turning `room_id` into a real FK to `room.id`.

### Room expiration cleanup
`expires_at` + `status` make scheduled cleanup predictable: a cron sweeps rooms where `expires_at < now()` and `status = ACTIVE`, flipping them to `EXPIRED`. This requires installing `@nestjs/schedule`, which is not yet a dependency.

### Avoid over-engineering
Do not add, in v1: a separate `personal_lists` table, a generic ACL or policies engine, event sourcing, polymorphic owner abstractions, or tags / comments / attachments / notifications.

### Resolved product decisions
- **Can anonymous guests create or modify room todos?** No, not in the MVP. Anonymous access is read-only, which keeps `room_guests` out of the first migration.
- **Frontend deploy target?** Railway, same as the API. Earlier notes mentioning Vercel are obsolete.

---

## PR conventions

<!-- 
  VALIDATION INSTRUCTIONS FOR AGENTS
  Before creating a PR, verify whether the workflow files changed since this was last generated:

    git log --format="%H" -1 -- .github/workflows/link-issue.yml
    git log --format="%H" -1 -- .github/workflows/validations.yml
    git log --format="%H" -1 -- .github/pull_request_template.md

  If all three hashes match the ones below → this section is valid, skip re-reading the files.
  If any hash differs → re-read the changed file and update this section + the hashes + the date.
-->

**Last checked:** 2026-06-14

| File | Last commit hash |
|------|-----------------|
| `.github/workflows/link-issue.yml` | `f8ee22c961bb26f6a74e327106f7109972c18c9c` |
| `.github/workflows/validations.yml` | `e97598938c9849cb8e245dce397ea45f84a9f6f8` |
| `.github/pull_request_template.md` | `5d0e9732cf3bf85a268b4c04c7869edc215052e5` |

### `link-issue.yml` — auto-title and auto-close

Triggers on `pull_request: [opened]`. Parses the branch name with the pattern `type/MKN-{number}-short-description`:

- **Title set to:** `type(MKN-{number}): short description` (hyphens replaced by spaces)
- **Body:** appends `Closes #{number}` if not already present

Example: branch `feat/MKN-14-todo-crud` → title `feat(MKN-14): todo crud`.

> Do not set the title manually — the workflow overwrites it on open.

### `validations.yml` — CI on PRs to `develop`

Runs: pnpm install → prisma generate → lint → jest (all unit tests, `--runInBand`).  
PR must pass all checks before merge.

### PR template

```
## Description

## Closes #
```

`Closes #N` is appended automatically by the workflow.

### `gh` CLI command to open a PR

```bash
gh pr create \
  --base develop \
  --title "type(MKN-N): short description" \
  --body $'## Description\n\nBrief summary of changes.'
```

### CodeRabbit

Auto-review enabled for PRs targeting `develop` and `main`. Excludes `workflows/`, `node_modules/`, `dist/`. Reviews TypeScript for NestJS patterns, spec files for test coverage, and Dockerfiles for best practices.
