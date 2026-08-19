# mikan-api

REST API for a collaborative todo application. Built with NestJS, Prisma, and PostgreSQL. Supports JWT authentication, user-owned todo lists, and anonymous shared rooms accessible via a unique slug.

## Features

### Implemented
- **Auth** — register, login, JWT access + refresh token rotation
- **Todos** — full CRUD with pagination, scoped to authenticated user
- **API docs** — Swagger UI at `/docs`, raw document at `/docs-json`

### Planned
- **Rooms** (v0.4.0) — create a shared room (authenticated), join via slug (anonymous, read-only), todos within a room
- **Scheduled cleanup** (v0.4.0) — expired rooms swept by a cron job

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 (TypeScript 5.7) |
| ORM | Prisma 7.8 |
| Database | PostgreSQL |
| Auth | JWT (access 15min + refresh 7d, with rotation) |
| Validation | class-validator + class-transformer |
| API docs | @nestjs/swagger CLI plugin (inferred from types) |
| Lint / format | oxlint + oxfmt |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |
| Deploy | Railway |
| Package manager | pnpm 10 |

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- pnpm

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/hidetsumi/mikan-api.git
cd mikan-api

# 2. Install dependencies
pnpm install

# 3. Copy env file and fill in values
cp .env.example .env

# 4. Start the database
pnpm db:up

# 5. Run migrations
pnpm prisma migrate dev

# 6. Start the dev server
pnpm start:dev
```

The API will be available at `http://localhost:3000`.

## Environment variables

See `.env.example` for all required variables.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mikan
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

## Scripts

```bash
pnpm start:dev       # development with watch
pnpm build           # production build
pnpm start:prod      # run production build
pnpm test            # unit tests
pnpm test:e2e        # end-to-end tests
pnpm test:cov        # test coverage
pnpm lint            # oxlint
pnpm lint:fix        # oxlint --fix
pnpm format          # oxfmt
pnpm db:up           # start local PostgreSQL
pnpm db:down         # stop local PostgreSQL
```

## API documentation

The OpenAPI document is **inferred from the TypeScript**, not written by hand. The
`@nestjs/swagger` CLI plugin derives schemas from DTO field types and their
`class-validator` decorators, response bodies from each controller method's return type, and
status codes from the HTTP verb and `@HttpCode`. There is no `@ApiProperty` in `src/`.

Only what has no source to be inferred from is written by hand: `@ApiTags`, `@ApiCookieAuth`
and the error responses.

Two consequences worth knowing before you touch a route, because neither fails at compile
time and nothing checks them for you:

- **A controller method without a return type is documented with no response schema.**
- **A DTO field with a default but no `?` is documented as required.**

After changing a controller or a DTO, read the result at `/docs`. The unit tests do not cover
it: the swagger plugin does not fully run under ts-jest, so the document they see is not the
one the app serves.

## Project structure

```
prisma/
├── models/          # Multi-file schema: base, user, todo, refresh-token
└── migrations/      # Database migration history

src/
├── config/          # Environment loading and validation
├── modules/
│   ├── auth/
│   │   ├── application/     # Use cases and orchestration
│   │   ├── domain/          # Domain rules and repository contracts
│   │   ├── infrastructure/  # Controllers, persistence adapters, guards, strategies
│   │   └── auth.module.ts
│   ├── todo/                # Same three-layer split, use cases in application/use-cases
│   └── users/               # Domain + persistence only, no use cases yet
├── shared/
│   ├── domain/              # Cross-module contracts (pagination)
│   ├── utils/               # Hashing helpers
│   └── infrastructure/
│       ├── http/            # Shared DTOs
│       └── prisma/          # PrismaModule and PrismaService
├── app.module.ts
└── main.ts
```

Prisma schema and migrations stay outside `src/` because they define the database, not the Nest application runtime. The schema is split across multiple files under `prisma/models/` rather than a single `schema.prisma`.

### Layering rules

Each feature module splits into three layers, and the dependency direction is the point:

- **`domain/`** — entities and repository contracts. Pure business concepts, with **no `@nestjs/*` and no `@prisma/client` imports**.
- **`application/`** — one use case per file, each exposing a single `execute()`. A use case is *one operation*, not one entity: it injects however many repositories that operation needs, from however many modules.
- **`infrastructure/`** — controllers, DTOs, guards, strategies and the Prisma repository implementations. The framework lives here.

Repository contracts are declared as **abstract classes**, which serve as both the TypeScript contract and the Nest injection token:

```ts
// domain/repository/todo.repository.ts
export abstract class TodoRepository { /* ... */ }

// todo.module.ts
providers: [{ provide: TodoRepository, useClass: PrismaTodoRepository }]
```

Use cases inject `TodoRepository` and have no idea Prisma exists, and specs mock the contract rather than the ORM. Controllers inject use cases directly — there is no service facade.

Modules grow into this shape rather than starting in it: `users` has only `domain/` and `infrastructure/` because it has no operations of its own, and adding an empty application layer would be ceremony.

## Branch strategy

Format: `type/MKN-{issue-number}-short-description`

| Branch | Purpose |
|--------|---------|
| `main` | Production — protected, merge only from release branches |
| `develop` | Integration — all PRs target here |
| `feature/MKN-{n}-description` | New features |
| `fix/MKN-{n}-description` | Bug fixes |
| `chore/MKN-{n}-description` | Config, deps, tooling |
| `release/vX.Y.Z` | Release candidates |

## Roadmap

See the [GitHub Project board](https://github.com/users/hidetsumi/projects/6) for current progress.

## License

MIT
