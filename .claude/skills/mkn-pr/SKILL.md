---
name: mkn-pr
description: Open a pull request for mikan-api following the project convention. Use when the user asks to open/create a PR, "abrir un PR", "subir esto", "mandar a review", or when work on a branch is finished and ready for review. Handles branch-name validation, pre-flight lint/test, base branch, and the auto-title workflow.
---

# Open a PR for mikan-api

## Before anything: read the conventions

Read the **PR conventions** section of `AGENTS.md` (repo root). It is the source of truth and includes a hash check that tells you whether the workflow files changed since the section was written. Do not restate its rules from memory — they may have changed.

## Procedure

### 1. Verify the branch

```bash
git branch --show-current
```

Must match `type/MKN-{issue-number}-short-description`, where `type` is one of `feature`, `fix`, `chore`, `refactor`, `test`, `docs`.

- On `develop` or `main` → **stop**. Ask the user for the issue number and a short description, then create the branch and move the work onto it.
- Branch does not match the pattern → **stop and tell the user**. The `link-issue` workflow parses the branch name; a malformed name means no auto-title and no `Closes #N`. Offer to rename with `git branch -m`.

### 2. Confirm the base branch state

PRs target `develop`, never `main`. Check the branch is current:

```bash
git fetch origin && git log --oneline origin/develop..HEAD
```

If `develop` has moved ahead, tell the user and ask whether to rebase before opening.

### 3. Pre-flight checks

Run both and require both to pass:

```bash
pnpm lint
pnpm test
```

CI (`validations.yml`) runs the same on every PR to `develop`. Failing here means failing there — fix before opening, do not open a PR you know is red. If the user explicitly wants a draft PR with failing checks, use `--draft` and say so in the body.

### 4. Push

```bash
git push -u origin $(git branch --show-current)
```

### 5. Create the PR

```bash
gh pr create --base develop --title "placeholder" --body $'## Description\n\n<real summary here>'
```

**The title does not matter.** The `link-issue` workflow fires on `pull_request: [opened]` and overwrites it with `type(MKN-{n}): description` derived from the branch name, then appends `Closes #{n}` to the body if missing. Writing a careful title by hand is wasted work — it gets replaced.

Write a real **body**: what changed and why, in a few sentences. That is the part a human reads and the workflow does not touch.

### 6. Report back

Give the user the PR URL. Then verify the workflow did its job:

```bash
sleep 5 && gh pr view --json title,body
```

If the title is still `placeholder`, the workflow did not fire or the branch name did not parse — tell the user rather than silently fixing the title by hand, because the same failure will affect every future PR.

## Notes

- CodeRabbit auto-reviews PRs to `develop`. Expect comments; they are not a failure.
- Never push directly to `develop` or `main`.
- Commit messages are a separate convention from PR titles: commits use **domain** scopes (`feat(auth): ...`), PR titles use **issue keys** (`feat(MKN-14): ...`). See `AGENTS.md`.
