# mikan-api

REST API for a collaborative todo application. Built with NestJS, Prisma, and PostgreSQL. Supports JWT authentication, user-owned todo lists, and anonymous shared rooms accessible via a unique slug.

## Features

- **Auth** — register, login, JWT access + refresh token rotation
- **Todos** — full CRUD with pagination, scoped to authenticated user
- **Rooms** — create a shared room (authenticated), join via slug (anonymous), todos within a room
- **Scheduled cleanup** — expired rooms are automatically deleted via a cron job
- **API docs** — auto-generated via Swagger at `/api`

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS (TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| Validation | class-validator |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |
| Deploy | Railway |

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
docker compose up -d

# 5. Run migrations
pnpm prisma migrate dev

# 6. Start the dev server
pnpm start:dev
```

The API will be available at `http://localhost:3000`.  
Swagger docs at `http://localhost:3000/api`.

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
pnpm lint            # eslint
```

## Project structure

```
src/
├── auth/            # register, login, refresh, JWT strategy, guards
├── users/           # User entity and service
├── todos/           # Todo CRUD, pagination, toggle
├── rooms/           # Room creation, slug access, cron cleanup
├── prisma/          # PrismaService
└── main.ts
```

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — protected |
| `develop` | Integration — all PRs target here |
| `feature/xxx` | New features |
| `fix/xxx` | Bug fixes |
| `chore/xxx` | Config, tooling |
| `release/vX.Y.Z` | Release candidates |

## Roadmap

See the [GitHub Project board](https://github.com/users/hidetsumi/projects/6) for current progress.

## License

MIT
