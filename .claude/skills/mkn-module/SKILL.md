---
name: mkn-module
description: Scaffold a complete feature module in mikan-api — entity, repository, module wiring, controller and use cases. Use when the user asks for a new feature area or domain ("nuevo módulo", "armar rooms", "el módulo de notificaciones"), i.e. something bigger than a single endpoint or entity.
---

# Scaffold a feature module

## Before anything: read the conventions

Read the **Code architecture**, **SOLID in practice** and **Growth rules** sections of `AGENTS.md` (repo root). Reference implementation: `src/modules/todo/`.

This skill **composes** the others. It does not restate their steps — follow `mkn-entity` and `mkn-use-case` where indicated, so there is one description of each procedure.

## First: decide how much structure this module needs

`AGENTS.md` defines the escalation ladder. Apply it honestly rather than defaulting to the full split:

| The module… | Structure |
|---|---|
| only persists data for another module to use | `domain/` + `infrastructure/persistence/` + module file. **No application layer, no controller.** This is `users`. |
| has its own operations | full `domain` / `application` / `infrastructure` split. This is `todo`. |

**Ask the user which one applies** before scaffolding, framed as: *does this module have operations of its own, or does another module drive it?* Creating an empty `application/` folder "for later" is the ceremony the architecture explicitly avoids.

## Procedure

### 1. Persistence

Follow **`mkn-entity`** for the module's entity or entities: Prisma model → migration → domain entity → repository contract → Prisma implementation.

### 2. Module file

`src/modules/<module>/<module>.module.ts`

```ts
@Module({
  controllers: [<Module>Controller],           // omit if no operations of its own
  providers: [
    ...<Module>UseCases,                       // omit if no operations of its own
    { provide: <Entity>Repository, useClass: Prisma<Entity>Repository },
  ],
  imports: [PrismaModule],
  exports: [<Entity>Repository],               // only if another module needs it
})
```

Spread the use-case array rather than listing classes individually — that is what keeps adding a use case from touching this file.

### 3. Register in the app

Add the module to `imports` in `src/app.module.ts`. Easy to forget; the app then compiles and 404s at runtime.

### 4. Controller

`src/modules/<module>/infrastructure/http/<module>.controller.ts`

`@Controller('<route>')` with a constructor injecting **use cases directly**. There is no service facade in this codebase — do not create one.

### 5. Use cases

Follow **`mkn-use-case`** for each operation. Remember its central rule: a use case is one operation, and it injects whatever repositories that operation needs — possibly from other modules. Do not generate a reflexive CRUD set; write the operations the feature actually has.

Create `application/use-cases/index.ts` exporting `<Module>UseCases`.

### 6. Cross-module dependencies

If this module needs another module's repository, import that module and rely on its `exports` — as `auth` does with `UsersModule`. Never import a `Prisma*Repository` from another module directly; depend on the exported abstract contract.

Watch for circular imports. They almost always mean the operation belongs in one module rather than being split across two.

### 7. Verify

```bash
pnpm lint && pnpm test
```

Then start the app and hit a route:

```bash
pnpm db:up && pnpm start:dev
```

A missing provider binding or an unregistered module compiles cleanly and fails only at runtime — this step is not optional.

### 8. Update the docs

A new module changes the structure documented in `AGENTS.md` and `README.md`, and likely moves something from *Planned* to *Implemented*. Update both. The vault note `Projects/Mikan/Architecture.md` mirrors the module list — update it too if the change is architectural.
