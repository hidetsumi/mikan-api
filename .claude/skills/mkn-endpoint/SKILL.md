---
name: mkn-endpoint
description: Add an HTTP route to an existing mikan-api controller, with its DTO and guard. Use when the user asks to expose an existing operation over HTTP ("agregar un endpoint", "una ruta para X", "exponer esto por API"). If the underlying use case does not exist yet, mkn-use-case covers the whole slice instead.
---

# Add an HTTP endpoint

## Before anything: read the conventions

Read the **Code architecture** section of `AGENTS.md` (repo root) for the layer rules. Read `src/modules/todo/infrastructure/http/todo.controller.ts` for the shape to follow.

## First: does the use case exist?

This skill covers **only the transport layer**. Check `src/modules/<module>/application/use-cases/` for the operation.

- **Use case exists** → continue here.
- **Use case does not exist** → use `mkn-use-case` instead. It covers the use case, its spec *and* the HTTP wiring in one pass. Do not write a controller route that calls business logic directly.

## Procedure

### 1. Add the route

In `src/modules/<module>/infrastructure/http/<module>.controller.ts`:

- Inject the use case in the constructor and call `.execute()`. **No service facade** — the controller talks to use cases directly.
- Keep the method thin: translate HTTP in, call `execute()`, translate out. No business rules, no repository access, no Prisma.
- Let the use case's exceptions propagate. Do not wrap them in a generic `try/catch` that flattens a `NotFoundException` into a 400.

Decorators: `@Get()`, `@Post()`, `@Patch()`, `@Delete()`, with `@Param('id')`, `@Body()`, `@Query()` as appropriate.

Use `@Query()` for GET filters and pagination, not `@Body()`. A GET with a body is not reliably supported by clients or proxies.

### 2. Add the DTO

For routes taking a body or query params: `infrastructure/http/dto/<action>.dto.ts`.

- One class with `class-validator` decorators — `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsEnum()`, `@IsInt()`, `@Min()`.
- Use `@Type(() => Date)` from `class-transformer` for date fields, and `@Type(() => Number)` for numeric query params, which arrive as strings.
- The DTO is a transport contract. It is not the domain input type — map it to the use case's input in the controller. `src/modules/todo/infrastructure/http/dto/create.dto.ts` is the model.

### 3. Auth

- Requires a logged-in user → `@UseGuards(JwtAuthGuard)`, then `@CurrentUser() user: JwtUserPayload` to read the identity.
- Never take the user id from the body or a query param. It comes from the token.
- Refresh endpoints use `JwtRefreshGuard`.

### 4. Never expose a password hash

Shape the response explicitly. Returning a domain `User` straight from a controller leaks `password_hash`.

### 5. Verify

```bash
pnpm lint && pnpm test
```

Then exercise the route against the running app (`pnpm db:up && pnpm start:dev`) — guards and validation pipes only fail at runtime.
