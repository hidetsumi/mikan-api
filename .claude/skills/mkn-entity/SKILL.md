---
name: mkn-entity
description: Add a new persisted entity to mikan-api — Prisma model, migration, domain class, repository contract and Prisma implementation. Use when the user asks for a new table/model/entity ("nueva entidad", "agregar la tabla X", "modelo de Room"), or needs to persist something new. For a whole feature module, mkn-module wraps this.
---

# Add a persisted entity

## Before anything: read the conventions

Read the **Schema conventions** and **Implemented schema** sections of `AGENTS.md` (repo root). They define naming, the multi-file layout and the indexing strategy. Do not restate them from memory — and do not copy the field style from an older doc, only from `AGENTS.md` or from `prisma/models/`.

Reference implementation: `prisma/models/todo.prisma` plus the `todo` module's `domain/entities/`, `domain/repository/` and `infrastructure/persistence/`.

## Procedure — in this order

The order matters: the Prisma client must be generated before the repository implementation can type-check against it.

### 1. Prisma model

Create `prisma/models/<entity>.prisma`. **One file per entity** — there is no `schema.prisma`.

Follow the conventions in `AGENTS.md`. The essentials, verifiable against `prisma/models/todo.prisma`:

- snake_case field names, matching the column names, so no per-field `@map`
- `@@map("<singular_name>")` on the model
- enums also `@@map`ped to snake_case
- `id String @id @default(uuid())` — no `@db.Uuid`
- `created_at DateTime @default(now())` and `updated_at DateTime @updatedAt`

Add indexes deliberately. `AGENTS.md` documents the strategy; the rule of thumb is: every foreign key, every field filtered on, and a composite for each list query the API will actually run.

### 2. Migration

```bash
pnpm db:up            # if the database is not already running
pnpm prisma migrate dev --name <descriptive_snake_case_name>
```

Read the generated SQL before moving on. Confirm it does what you expect — especially that it is **additive**. If it drops or renames a column, stop and tell the user: the project's stated principle is additive evolution over destructive refactors.

### 3. Domain entity

`src/modules/<module>/domain/entities/<entity>.entity.ts`

- A plain class with `public readonly` fields and a constructor taking a props object.
- Props type in `<entity>.entity.types.ts` alongside it, together with any business enums.
- **No `@nestjs/*` imports. No `@prisma/client` imports.** This is the hard rule of the domain layer.

### 4. Repository contract

`src/modules/<module>/domain/repository/<entity>.repository.ts`

- An **abstract class**, not a TypeScript `interface`. It serves as both the contract and the Nest injection token — an interface cannot, because it does not exist at runtime.
- Methods named by intent, narrow: `findAllByOwnerUserId`, not a generic `find(filter)`.
- Input types in `<entity>.repository.type.ts`.
- Return domain entities, never Prisma types.

### 5. Prisma implementation

`src/modules/<module>/infrastructure/persistence/prisma-<entity>.repository.ts`

- `@Injectable()`, `implements <Entity>Repository`, injects `PrismaService`.
- Maps Prisma rows to domain entities: `return new <Entity>(row)`.
- Returns `null` for a missing row — throwing `NotFoundException` is the use case's job, not the repository's.
- Paginated reads use `this.prismaService.$transaction([...findMany, ...count])` so the total is consistent with the page.

### 6. Bind it in the module

In `src/modules/<module>/<module>.module.ts`:

```ts
providers: [{ provide: <Entity>Repository, useClass: Prisma<Entity>Repository }],
imports: [PrismaModule],
```

Add `exports: [<Entity>Repository]` only if another module needs it — `users` does this for `auth`.

### 7. Verify

```bash
pnpm lint && pnpm test
```

Then confirm the schema matches what you documented:

```bash
cat prisma/models/<entity>.prisma
```

If this entity changes the shape described in `AGENTS.md`, update that file. It claims to describe the implemented schema, and a stale claim there is worse than no claim.
