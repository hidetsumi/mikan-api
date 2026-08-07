---
name: mkn-use-case
description: Add a new use case to a mikan-api module, or refactor an existing multi-method service into use cases. Use when the user asks for a new operation/action/behaviour in the backend ("agregar un caso de uso", "nueva operación", "que se pueda X"), or asks to split/refactor a service. Covers the use case, its spec, the barrel index, and the controller wiring.
---

# Add or extract a use case

## Before anything: read the conventions

Read the **Code architecture** and **SOLID in practice** sections of `AGENTS.md` (repo root). They define the layer rules, the dependency-inversion binding and the testing rule. Do not restate them from memory.

The reference implementation is `src/modules/todo/application/use-cases/`. Read one file there before writing a new one.

## The central rule

**A use case is one operation, not one entity.**

Do not assume "one repository per use case" or "CRUD per table". A use case injects however many repositories its operation actually needs, from however many modules:

- `RegisterUseCase` → `UsersRepository` only
- `LoginUseCase` → `UsersRepository` + `AuthRepository` + `TokenService`
- a future `JoinRoomUseCase` → `RoomRepository` + `RoomMemberRepository`

It lives in the module that owns the **intent**, not the module that owns the table. `login` lives in `auth` even though it reads a `User`.

**Before writing anything, ask the user which dependencies the operation needs** if it is not obvious from the description. Getting this wrong is the main way a use case ends up carrying dependencies it does not use — the exact problem this pattern exists to prevent.

A module with no operations of its own gets **no** use cases. `users` is the example: it only provides and exports `UsersRepository`, consumed by `auth`. Do not add an application layer to a module just because it has an entity.

---

## Mode A — add a new use case

### 1. Locate the module

`src/modules/<module>/`. If the module does not exist, use `mkn-module` instead.

If the module has no `application/use-cases/` folder yet, this is the first use case: create the folder and the barrel index.

### 2. Write the use case

`src/modules/<module>/application/use-cases/<operation>.use-case.ts`

- One `@Injectable()` class, named `<Operation>UseCase`.
- **Exactly one public method: `execute()`.** If you want a second public method, it is a second use case.
- Constructor injects only the abstract repository contracts it needs — never `PrismaService`, never a concrete `Prisma*Repository`.
- Business validation lives here and throws Nest HTTP exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`, `UnauthorizedException`).
- Input/output types go in `application/types/<operation>.type.ts` when they are more than trivial.

### 3. Write the spec

`<operation>.use-case.spec.ts`, alongside the use case.

- **Mock the repository contract, never `PrismaService`.** Instantiate the class directly with mocks — no `Test.createTestingModule` needed for a plain use case.
- Cover: each validation rule (asserting the repository was *not* called), defaults and edge cases, and the happy path (asserting what gets passed to the repository *and* what is returned).
- `create.use-case.spec.ts` in `todo` is the model to follow.

### 4. Register it

Add to `application/use-cases/index.ts`, both the import and the exported array:

```ts
export const <Module>UseCases = [ ..., <Operation>UseCase ];
```

The module already spreads this array into `providers` (`...TodoUseCases`), so the module file needs no change.

### 5. Wire the HTTP layer, if the operation is reachable over HTTP

- Add the route to `infrastructure/http/<module>.controller.ts`.
- **The controller injects the use case directly and calls `.execute()`.** There is no service facade — do not create one.
- Inject only the use cases the controller's routes actually use.
- Add a DTO in `infrastructure/http/dto/` with class-validator decorators if the route takes a body.
- Add `@UseGuards(JwtAuthGuard)` if the route requires authentication.

### 6. Verify

```bash
pnpm lint && pnpm test
```

---

## Mode B — extract use cases from an existing service

Use when a module has a multi-method service that predates the pattern.

### 1. Map the real dependencies

For **each method**, list the dependencies it actually uses — not what the service constructor declares. This is the whole point of the refactor: a shared constructor hides that each operation needs a different subset.

Present the mapping to the user before writing code.

### 2. Extract one use case per method

Follow Mode A steps 2–4 for each. Move the logic verbatim first; clean up second, so the diff stays reviewable.

### 3. Extract duplication

Logic repeated across the extracted methods goes to a shared helper — `src/shared/utils/` for cross-cutting concerns, or a domain service for business rules. Do not leave the same expression copy-pasted into two use cases.

### 4. Rewire the controller

Replace the injected service with the specific use cases each route needs. Call `.execute()`.

### 5. Delete the old service

Remove the file and its provider entry from the module. Then confirm nothing references it:

```bash
grep -rn "<Old>Service" src/
```

### 6. Redistribute the tests

The old service spec covered these methods. Its coverage must **survive**, split across the new use case specs — do not delete assertions. Delete the old spec only once every case it covered exists somewhere else.

### 7. Verify

```bash
pnpm lint && pnpm test
```

Then run the app and exercise the affected endpoints. A refactor that changes dependency injection compiles fine and fails at runtime — a wrong provider binding is not a type error.
