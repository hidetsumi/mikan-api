# mikan-api

REST API for a collaborative todo application. Built with NestJS, Prisma, and PostgreSQL. Supports JWT authentication, user-owned todo lists, and anonymous shared rooms accessible via a unique slug.

## Features

### Implemented
- **Auth** — register, login, JWT access + refresh token rotation
- **Todos** — full CRUD with pagination, scoped to authenticated user

### Planned
- **Rooms** (v0.4.0) — create a shared room (authenticated), join via slug (anonymous, read-only), todos within a room
- **Scheduled cleanup** (v0.4.0) — expired rooms swept by a cron job
- **API docs** — Swagger at `/api`

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 (TypeScript 5.7) |
| ORM | Prisma 7.8 |
| Database | PostgreSQL |
| Auth | JWT (access 15min + refresh 7d, with rotation) |
| Validation | class-validator + class-transformer |
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

See [AGENTS.md](./AGENTS.md) for the full layering rules, SOLID conventions and database design.

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
